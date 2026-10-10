.. currentmodule:: ml.postprocessing.edgeimpulse

:mod:`ml.postprocessing.edgeimpulse` --- Edge Impulse
=====================================================

.. module:: ml.postprocessing.edgeimpulse
    :synopsis: Edge Impulse

The ``ml.postprocessing.edgeimpulse`` module contains post-processing classes
for Edge Impulse models.


class Fomo -- Fast Objects More Objects
---------------------------------------

Post-processor for FOMO (Fast Objects More Objects) model output.

.. class:: Fomo(threshold: float = 0.4, w_scale: float = 1.414214, h_scale: float = 1.414214, nms_threshold: float = 0.1, nms_sigma: float = 0.001)

    Creates a FOMO post-processor.

    ``threshold`` minimum score required for a detection to be kept.

    ``w_scale`` horizontal scale factor applied to the grid cell width before
    non-max-suppression. Larger values cause neighboring cells to be merged
    into a single detection.

    ``h_scale`` vertical scale factor applied to the grid cell height before
    non-max-suppression. Larger values cause neighboring cells to be merged
    into a single detection.

    ``nms_threshold`` IoU threshold passed to non-max-suppression.

    ``nms_sigma`` sigma value passed to non-max-suppression (soft-NMS).

    .. method:: __call__(model: ml.Model, inputs: list, outputs: list) -> list

        Invoked by ``ml.Model.predict()`` with the model, its inputs, and its raw
        outputs. Returns a list of per-class detection lists. Each detection is a
        ``((x, y, w, h), score)`` tuple. Empty class lists are included so that
        the position of each list in the output matches the class index in the
        model output. Returns an empty tuple when nothing is detected.


class YoloPro -- YOLO Pro
-------------------------

Post-processor for Edge Impulse YOLO Pro object-detection model output. YOLO
Pro models emit one row per candidate box holding ``xmin, ymin, xmax, ymax``
(normalized to the input) followed by a per-class score vector. See the
`YOLO Pro documentation <https://docs.edgeimpulse.com/studio/projects/learning-blocks/blocks/object-detection/yolo-pro>`__
for training such a model.

.. class:: YoloPro(threshold: float = 0.6, nms_threshold: float = 0.1, nms_sigma: float = 0.1)

    Creates a YOLO Pro post-processor.

    ``threshold`` minimum class score required for a box to be kept before
    non-max-suppression.

    ``nms_threshold`` IoU threshold passed to non-max-suppression.

    ``nms_sigma`` sigma value passed to non-max-suppression (soft-NMS).

    .. method:: __call__(model: ml.Model, inputs: list, outputs: list) -> list

        Invoked by ``ml.Model.predict()`` with the model, its inputs, and its raw
        outputs. Returns a list of per-class detection lists. Each detection is a
        ``((x, y, w, h), score)`` tuple in ROI coordinates. Empty class lists are
        included so that the position of each list in the output matches the
        class index in the model output. Returns an empty tuple when nothing is
        detected.

Example::

    import csi
    import ml
    from ml.postprocessing.edgeimpulse import YoloPro

    csi0 = csi.CSI()
    csi0.reset()
    csi0.pixformat(csi.RGB565)
    csi0.framesize(csi.VGA)

    model = ml.Model("/rom/<model_file_name>", postprocess=YoloPro(threshold=0.4))

    while True:
        img = csi0.snapshot()
        for i, detections in enumerate(model.predict([img])):
            for (x, y, w, h), score in detections:
                img.draw_rectangle(x, y, w, h)
                print(model.labels[i], score)
