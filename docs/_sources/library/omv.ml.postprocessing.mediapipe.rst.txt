.. currentmodule:: ml.postprocessing.mediapipe

:mod:`ml.postprocessing.mediapipe` --- Google Mediapipe
=======================================================

.. module:: ml.postprocessing.mediapipe
    :synopsis: Google Mediapipe

The ``ml.postprocessing.mediapipe`` module contains post-processors for Google
Mediapipe models.


class mediapipe_detection_postprocess -- Generic Mediapipe Detector
-------------------------------------------------------------------

Base class shared by :class:`BlazeFace` and :class:`BlazePalm`. Decodes
anchor-based bounding boxes and keypoints, then performs NMS.

.. class:: mediapipe_detection_postprocess(threshold: float = 0.6, anchors: ndarray | None = None, anchor_grid: list[tuple[int, int]] | None = None, scores: list[int] = [], cords: list[int] = [], nms_threshold: float = 0.1, nms_sigma: float = 0.1)

    Create a generic Mediapipe detection post-processor.

    ``threshold`` Score threshold applied to raw logits before sigmoid.

    ``anchors`` Optional pre-built anchor array of shape ``(N, 2)`` containing
    ``(cx, cy)`` centers normalized to ``[0, 1]``. If ``None``, anchors are
    generated from ``anchor_grid``.

    ``anchor_grid`` List of ``(grid_size, scales)`` tuples used to generate
    anchors when ``anchors`` is ``None``.

    ``scores`` List of model output indices that contain score tensors.

    ``cords`` List of model output indices that contain box/keypoint tensors.

    ``nms_threshold`` IoU threshold for non-maximum suppression.

    ``nms_sigma`` Sigma for soft-NMS score decay.

    .. method:: mediapipe_detection_postprocess.__call__(model: ml.Model, inputs: list, outputs: list) -> list

        Run post-processing on model outputs and return a list of
        ``((x, y, w, h), score, keypoints)`` tuples.

    .. method:: mediapipe_detection_postprocess.detection_post_process(ih: int, iw: int, nms: ml.utils.NMS, model: ml.Model, inputs: list, outputs: list, score_idx: int, cords_idx: int, t: float, anchors: ndarray) -> None

        Decode and add bounding boxes from a single ``(score, cords)`` output
        pair into the supplied ``NMS`` accumulator.


class BlazeFace -- Face Detection
---------------------------------

Post-processes BlazeFace model output.

.. class:: BlazeFace(threshold: float = 0.6, anchors: ndarray | None = None, nms_threshold: float = 0.1, nms_sigma: float = 0.1)

    Create a BlazeFace post-processor. Uses an anchor grid of
    ``[(16, 2), (8, 6)]`` with score outputs ``[1, 2]`` and box outputs
    ``[0, 3]``.

    ``threshold`` Score threshold for detections.

    ``anchors`` Optional pre-built anchor array; generated automatically if
    ``None``.

    ``nms_threshold`` IoU threshold for non-maximum suppression.

    ``nms_sigma`` Sigma for soft-NMS score decay.

    Returns ``[((x, y, w, h), score, keypoints)]`` from ``__call__``, where
    ``keypoints`` is a list of ``(x, y)`` points.


class BlazePalm -- Palm Detection
---------------------------------

Post-processes BlazePalm model output.

.. class:: BlazePalm(threshold: float = 0.6, anchors: ndarray | None = None, nms_threshold: float = 0.1, nms_sigma: float = 0.1)

    Create a BlazePalm post-processor. Uses an anchor grid of
    ``[(24, 2), (12, 6)]`` with score outputs ``[0]`` and box outputs ``[1]``.

    ``threshold`` Score threshold for detections.

    ``anchors`` Optional pre-built anchor array; generated automatically if
    ``None``.

    ``nms_threshold`` IoU threshold for non-maximum suppression.

    ``nms_sigma`` Sigma for soft-NMS score decay.

    Returns ``[((x, y, w, h), score, keypoints)]`` from ``__call__``, where
    ``keypoints`` is a list of ``(x, y)`` points.


class FaceLandmarks -- Face Landmarks
-------------------------------------

Post-processes FaceLandmarks model output.

.. class:: FaceLandmarks(threshold: float = 0.6, nms_threshold: float = 0.1, nms_sigma: float = 0.1)

    Create a FaceLandmarks post-processor.

    ``threshold`` Score threshold (after sigmoid) for accepting a detection.

    ``nms_threshold`` IoU threshold for non-maximum suppression.

    ``nms_sigma`` Sigma for soft-NMS score decay.

    Returns ``((x, y, w, h), score, keypoints)`` from ``__call__``, where
    ``keypoints`` is a list of ``(x, y, z)`` points.


class HandLandmarks -- Hand Landmarks
-------------------------------------

Post-processes HandLandmarks model output.

.. class:: HandLandmarks(threshold: float = 0.6, nms_threshold: float = 0.1, nms_sigma: float = 0.1)

    Create a HandLandmarks post-processor.

    ``threshold`` Score threshold for accepting a detection.

    ``nms_threshold`` IoU threshold for non-maximum suppression.

    ``nms_sigma`` Sigma for soft-NMS score decay.

    Returns ``[[((x, y, w, h), score, keypoints)]]`` from ``__call__``, with
    one inner list per handedness class (left=0, right=1). ``keypoints`` is a
    list of ``(x, y, z)`` points. Empty class lists are preserved so each
    list's index matches the class index.


class MoveNet -- Pose Estimation
--------------------------------

Post-processes MoveNet single-pose model output.

.. class:: MoveNet(threshold: float = 0.6, nms_threshold: float = 0.1, nms_sigma: float = 0.1)

    Create a MoveNet post-processor.

    ``threshold`` Per-keypoint confidence threshold; keypoints below this
    value are excluded from the bounding box and mean score.

    ``nms_threshold`` IoU threshold for non-maximum suppression.

    ``nms_sigma`` Sigma for soft-NMS score decay.

    Returns ``((x, y, w, h), score, keypoints)`` from ``__call__``, where
    ``keypoints`` is a list of ``(x, y, score)`` points in input pixel
    coordinates.
