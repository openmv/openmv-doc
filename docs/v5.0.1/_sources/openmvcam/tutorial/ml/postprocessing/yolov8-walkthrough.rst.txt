YOLOv8 walkthrough
==================

The YOLOv8 post-processor is small enough to step through from
input tensor to returned list. Reading it once shows what every
other post-processor in the catalogue is doing: threshold
quantized scores cheaply, take what survives, dequantize, decode
geometry, push to NMS, return per-class lists.

The starting tensor
-------------------

A YOLOv8 model emits a single output tensor whose shape is
``(1, C, A)`` -- one frame, ``C`` channels, ``A`` anchor
predictions. The first four channels are box geometry --
``cx``, ``cy``, ``w``, ``h`` -- normalized to ``[0, 1]`` of the
network's input dimensions. The remaining ``C - 4`` channels are
per-class scores, already in ``[0, 1]`` for a trained model. Each
anchor is a column down the channels.

.. figure:: ../figures/yolov8-tensor.svg
   :alt: A grid laid on its side: rows labelled cx, cy, w, h,
         score_0, score_1, ..., score_(N-1); columns labelled
         anchor 0 through anchor A-1. One column is outlined to
         show that a single anchor's prediction is one column
         down the channels.

   One YOLOv8 anchor is one column down the channels: four box
   numbers and ``N`` class scores.

The shipped ``yolov8n_192.tflite`` is a single-class person
detector, so ``C = 5`` and ``A`` is in the thousands; a custom
model trained on the full 80-class COCO set has ``C = 84`` against
the same ``A``. The decode below holds for any class count.

Thresholding before dequantizing
--------------------------------

The cheap step first. The output tensor is in the model's
quantized integer dtype, and dequantizing every value would touch
every element of a tensor with thousands of entries -- most of
which are below the score threshold and end up discarded. The
post-processor instead quantizes the threshold once and compares
in raw quantized space::

    from ml.utils import quantize, threshold, dequantize, NMS
    from ulab import numpy as np

    oh, ow, oc = model.output_shape[0]
    scale = model.output_scale[0]
    t = quantize(model, self.threshold)

    column_outputs = outputs[0].reshape((oh * ow, oc))

    score_block = column_outputs[4:, :]
    score_indices = threshold(score_block, t, scale,
                              find_max=True,
                              find_max_axis=0)
    if not len(score_indices):
        return ()

``column_outputs`` is the tensor reshaped to ``(C, A)`` so the
channels are rows and the anchors are columns. ``score_block`` is
the class-score sub-tensor -- everything from row ``4`` down.
:func:`ml.utils.threshold` reduces that block along axis ``0``
(``find_max=True``, ``find_max_axis=0``) to the per-anchor maximum
score, then returns the indices of anchors whose maximum passes
the quantized threshold. The whole tensor was never dequantized;
only a per-column max-reduction in quantized integer space.

If no anchor passes, the post-processor returns the empty tuple
:meth:`~ml.Model.predict` interprets as no detection.

Two decisions in this code make the difference between a runnable
post-processor and an unusably slow one. The first is driving the
arithmetic through :mod:`numpy`: the output tensor has thousands
of elements, and iterating it in raw Python takes whole seconds
per inference, where the same arithmetic vectorised through
:mod:`numpy` runs in milliseconds. The second is dequantizing
*after* the threshold filter rather than before. Dequantizing
first would allocate a float tensor four times the size of the
quantized one and walk every element before discarding nearly
all of them; dequantizing only the surviving columns touches a
handful of values at most and saves both the time and the RAM
the full conversion would have consumed.

Dequantizing the survivors
--------------------------

Only the surviving anchors need their geometry decoded.
:func:`numpy.take` pulls those columns out and a single
:func:`ml.utils.dequantize` call converts them to floats::

    bb = dequantize(model,
                    np.take(column_outputs, score_indices, axis=1))

``bb`` is now ``(C, K)`` where ``K`` is the number of surviving
anchors -- typically a handful even when ``A`` was in the
thousands.

Reading the geometry
--------------------

The four box channels and the per-class scores are pulled out
directly::

    bb_scores  = np.max(bb[4:, :],    axis=0)
    bb_classes = np.argmax(bb[4:, :], axis=0)

    x_center = bb[0, :]
    y_center = bb[1, :]
    w_half   = bb[2, :] * 0.5
    h_half   = bb[3, :] * 0.5

``bb_scores`` is the best class score per surviving anchor;
``bb_classes`` is the class index that delivered that score. The
box geometry is still in normalized ``[0, 1]`` of network input
dimensions, so the next step scales it to pixels::

    ib, ih, iw, ic = model.input_shape[0]
    xmin = (x_center - w_half) * iw
    ymin = (y_center - h_half) * ih
    xmax = (x_center + w_half) * iw
    ymax = (y_center + h_half) * ih

After this the boxes are in network input pixel space -- the
coordinate space :class:`~ml.utils.NMS` expects on input.

Non-max suppression
-------------------

The survivors go through NMS and are returned as per-class lists::

    nms = NMS(iw, ih, inputs[0].roi)
    for i in range(bb.shape[1]):
        nms.add_bounding_box(xmin[i], ymin[i],
                             xmax[i], ymax[i],
                             bb_scores[i], bb_classes[i])
    return nms.get_bounding_boxes(threshold=self.nms_threshold,
                                  sigma=self.nms_sigma)

:class:`~ml.utils.NMS` reads ``inputs[0].roi`` so the returned
boxes are in the original image's coordinate space, not the
network's -- the application draws them onto the captured frame
directly without further remapping.

What the script gets back
-------------------------

The return value is a list of per-class lists indexed by class.
A three-class example might look like::

    [
        [((23, 41, 95, 142), 0.92), ((180, 60, 88, 130), 0.71)],
        [],
        [((310, 95, 55, 70), 0.85)],
    ]

Each entry is a ``((x, y, w, h), score)`` tuple: ``(x, y)`` is
the top-left corner of the bounding box in the original image's
pixel coordinates, ``w`` and ``h`` are its width and height in
pixels, and ``score`` is the confidence the network assigned to
the detection. So ``((180, 60, 88, 130), 0.71)`` reads as a
box whose top-left corner sits at pixel ``(180, 60)``, extends
88 pixels right and 130 pixels down, and was reported with
confidence ``0.71``.

The outer list shows two surviving boxes for class ``0``, nothing
for class ``1``, one for class ``2``. The empty list for class
``1`` is kept in place so that the outer index always matches
the class index.
For the shipped person detector the outer list has a single
element whose inner list contains the surviving person boxes.
For an 80-class model it has 80 inner lists, most empty on any
given frame, with the non-empty entries holding the boxes for
the classes that fired. The application reads the result with
``enumerate(boxes)`` to walk the class indices alongside the box
lists -- the same shape detection post-processors target across
the catalogue.
