Non-max suppression
===================

A detection network typically produces several overlapping
candidate boxes around the same real-world object: each anchor
near the object fires with a similar score, and the post-processor
sees them all. *Non-max suppression* (*NMS*) is the step that
turns that cluster into one box.

The algorithm is short: sort the candidate boxes by score, take
the highest-scoring one, suppress every other box that overlaps
with it past a chosen threshold, then take the next highest from
what remains, and repeat. The overlap metric is
*intersection-over-union* (*IoU*) -- the shared area of two boxes
divided by their combined area, a value between ``0`` (no overlap)
and ``1`` (identical boxes). The ``nms_threshold`` constructor
argument on every shipped post-processor is the cutoff above which
boxes are treated as duplicates of an already-kept box.

.. figure:: ../figures/nms-overlap.svg
   :alt: Left, three overlapping bounding boxes around a single
         subject, labelled with scores 0.92, 0.83, and 0.71. An
         arrow points to the right, where one surviving box
         remains with the score 0.92. The two lower-scoring
         boxes are suppressed by the higher-scoring one because
         their intersection-over-union with it exceeds the
         threshold.

   NMS collapses a cluster of overlapping detections to the
   highest-scoring one.

Soft-NMS
--------

The shipped :class:`ml.utils.NMS` class implements *Soft-NMS*, a
refinement that decays an overlapping box's score by an amount
that depends on how much it overlaps, rather than dropping the
box outright. If the lowered score falls below the threshold the
box is dropped; otherwise it survives at the reduced score and
competes in the next round.

The ``nms_sigma`` parameter controls how aggressive the decay is.
With a small ``nms_sigma`` (the shipped default of ``0.1``) the
decay is steep: a heavily-overlapping box gets its score driven
to nearly zero and Soft-NMS reduces to classic NMS. With a larger
``nms_sigma`` the decay is gentle and overlapping boxes of
different objects survive more often, which matters when
real-world objects of the same class genuinely overlap (a crowd
of faces, a cluster of palms).

Setting ``nms_sigma`` to ``<= 0`` disables the decay entirely:
overlapping boxes pass through with their original scores, and
only the score threshold filters them.

Building one directly
---------------------

Every shipped post-processor builds a fresh
:class:`~ml.utils.NMS` per inference, adds each candidate to it,
and calls :meth:`~ml.utils.NMS.get_bounding_boxes` at the end. A
custom post-processor follows the same pattern::

    from ml.utils import NMS

    iw = model.input_shape[0][2]
    ih = model.input_shape[0][1]

    nms = NMS(iw, ih, inputs[0].roi)
    for box, score, class_idx in candidates:
        nms.add_bounding_box(box.xmin, box.ymin,
                             box.xmax, box.ymax,
                             score, class_idx)
    result = nms.get_bounding_boxes(threshold=nms_threshold,
                                    sigma=nms_sigma)

The constructor takes the network's input width and height in
pixels and the ROI of the original image the model ran against;
:meth:`~ml.utils.NMS.add_bounding_box` takes box coordinates in
that network-input pixel space, and
:meth:`~ml.utils.NMS.get_bounding_boxes` remaps the survivors back
into image coordinates using the ROI. The remap accounts for the
:doc:`Normalization stretch <../pipeline/normalization>`
automatically -- the same ROI the predictor saw is used to project
boxes back -- so the returned boxes are ready to draw onto the
captured frame.

The return shape is a list of per-class lists, indexed by the
``label_index`` passed to ``add_bounding_box``. Empty class lists
are preserved so the index matches the model's class index;
``enumerate(result)`` walks the classes alongside their detections.
