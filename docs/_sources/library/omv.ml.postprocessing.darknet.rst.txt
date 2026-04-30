.. currentmodule:: ml.postprocessing.darknet

:mod:`ml.postprocessing.darknet` --- Darknet
============================================

.. module:: ml.postprocessing.darknet
    :synopsis: Darknet

The ``ml.postprocessing.darknet`` module contains post-processors for Darknet
based object detection models.


class YoloV2 -- YOLO V2
-----------------------

Post-processor for YOLO V2 model outputs.

.. class:: YoloV2(threshold: float = 0.6, anchors: numpy.ndarray = None, nms_threshold: float = 0.1, nms_sigma: float = 0.1)

    Create a YOLO V2 postprocessor.

    ``threshold`` Score threshold applied before non-maximum suppression.

    ``anchors`` 2D ``numpy.ndarray`` of shape ``(N, 2)`` holding ``(w, h)``
    anchor box dimensions the model was trained on. If ``None``, a built-in
    default set of 5 anchors is used.

    ``nms_threshold`` Threshold passed to non-maximum suppression.

    ``nms_sigma`` Sigma value passed to non-maximum suppression.

    .. method:: __call__(model: ml.Model, inputs: list, outputs: list) -> list

        Invoked by ``ml.Model.predict()`` to post-process model outputs.

        ``model`` The ``ml.Model`` instance the post-processor is attached to.

        ``inputs`` List of model input objects (used to obtain the input ROI).

        ``outputs`` List of raw model output tensors.

        Returns a list of per-class lists of ``((x, y, w, h), score)`` tuples.
        E.g. ``[[((x, y, w, h), score), ...], ...]``. Empty class lists are kept
        so each list index matches the model's class index.


class YoloLC -- YOLO LC
-----------------------

Post-processor for YOLO LC model outputs. Subclass of :class:`YoloV2` that
provides a different default anchor set tuned for the YOLO LC model.

.. class:: YoloLC(threshold: float = 0.6, anchors: numpy.ndarray = None, nms_threshold: float = 0.1, nms_sigma: float = 0.1)

    Create a YOLO LC postprocessor.

    ``threshold`` Score threshold applied before non-maximum suppression.

    ``anchors`` 2D ``numpy.ndarray`` of shape ``(N, 2)`` holding ``(w, h)``
    anchor box dimensions the model was trained on. If ``None``, a built-in
    default set of 5 YOLO LC anchors is used.

    ``nms_threshold`` Threshold passed to non-maximum suppression.

    ``nms_sigma`` Sigma value passed to non-maximum suppression.

    .. method:: __call__(model: ml.Model, inputs: list, outputs: list) -> list

        Inherited from :class:`YoloV2`. See :meth:`YoloV2.__call__`.
