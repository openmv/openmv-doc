.. currentmodule:: ml.postprocessing.ultralytics

:mod:`ml.postprocessing.ultralytics` --- Ultralytics
====================================================

.. module:: ml.postprocessing.ultralytics
    :synopsis: Ultralytics

The `ml.postprocessing.ultralytics` module contains classes for Ultralytics.


class YoloV5 -- YOLO V5
-----------------------

Used to post-process YOLO V5 model output.

.. class:: YoloV5(threshold: float = 0.6, nms_threshold: float = 0.1, nms_sigma: float = 0.1)

    Create a YOLO V5 postprocessor.

    ``threshold`` Score threshold for filtering detections before NMS.

    ``nms_threshold`` IoU threshold used by NMS to suppress overlapping bounding boxes.

    ``nms_sigma`` Sigma value used by Soft-NMS for score decay.

    .. method:: __call__(model: ml.Model, inputs: list, outputs: list) -> list

        Post-process the ``outputs`` list of arrays produced by ``model`` for the given
        ``inputs`` list. Returns a list of per-class lists; each inner list contains
        ``((x, y, w, h), score)`` tuples in ROI coordinates. Empty class lists are
        preserved so each list index matches the corresponding class index in the
        model output.


class YoloV8 -- YOLO V8
-----------------------

Used to post-process YOLO V8 model output.

.. class:: YoloV8(threshold: float = 0.6, nms_threshold: float = 0.1, nms_sigma: float = 0.1)

    Create a YOLO V8 postprocessor.

    ``threshold`` Score threshold for filtering detections before NMS.

    ``nms_threshold`` IoU threshold used by NMS to suppress overlapping bounding boxes.

    ``nms_sigma`` Sigma value used by Soft-NMS for score decay.

    .. method:: __call__(model: ml.Model, inputs: list, outputs: list) -> list

        Post-process the ``outputs`` list of arrays produced by ``model`` for the given
        ``inputs`` list. Returns a list of per-class lists; each inner list contains
        ``((x, y, w, h), score)`` tuples in ROI coordinates. Empty class lists are
        preserved so each list index matches the corresponding class index in the
        model output.
