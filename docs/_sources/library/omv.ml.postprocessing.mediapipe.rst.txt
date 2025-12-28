.. currentmodule:: ml.postprocessing.mediapipe

:mod:`ml.postprocessing.mediapipe` --- Google Mediapipe
=======================================================

.. module:: ml.postprocessing.mediapipe
    :synopsis: Google Mediapipe

The `ml.postprocessing.mediapipe` module contains classes for Google Mediapipe.

class BlazeFace -- Face Detection
---------------------------------

Used to post-process BlazeFace model output.

Constructors
~~~~~~~~~~~~

.. class:: BlazeFace(threshold:float=0.6, anchors=None, nms_threshold:float=0.1, nms_sigma:float=0.1) -> BlazeFace

    Create a BlazeFace postprocessor.

    ``threshold`` The threshold to use for postprocessing.

    ``anchors`` A list of anchor points ``(x, y)`` the model was trained on to use for postprocessing.

    This post-processor returns a list of rect ``[x, y, w, h]``, score, and (x, y) keypoint list tuples.
    E.g. ``[((x, y, w, h), score, keypoints)]``. Note that empty class list are included in the
    output to ensure the position of each class list in the output matches the position of the class index in the model output.

class BlazePalm -- Palm Detection
---------------------------------

Used to post-process BlazePalm model output.

Constructors
~~~~~~~~~~~~

.. class:: BlazePalm(threshold:float=0.6, anchors=None, nms_threshold:float=0.1, nms_sigma:float=0.1) -> BlazePalm

    Create a BlazePalm postprocessor.

    ``threshold`` The threshold to use for postprocessing.

    ``anchors`` A list of anchor points ``(x, y)`` the model was trained on to use for postprocessing.

    This post-processor returns a list of rect ``[x, y, w, h]``, score, and (x, y) keypoint list tuples.
    E.g. ``[((x, y, w, h), score, keypoints)]``. Note that empty class list are included in the
    output to ensure the position of each class list in the output matches the position of the class index in the model output.

class FaceLandmarks -- Face Landmarks
-------------------------------------

Used to post-process FaceLandmarks model output.

Constructors
~~~~~~~~~~~~

.. class:: FaceLandmarks(threshold:float=0.6, nms_threshold:float=0.1, nms_sigma:float=0.1) -> FaceLandmarks

    Create a FaceLandmarks postprocessor.

    ``threshold`` The threshold to use for postprocessing.

    This post-processor returns a list of rect ``[x, y, w, h]``, score, and (x, y, z) keypoint list tuples.
    E.g. ``[((x, y, w, h), score, keypoints)]``. Note that empty class list are included in the
    output to ensure the position of each class list in the output matches the position of the class index in the model output.

class HandLandmarks -- Hand Landmarks
-------------------------------------

Used to post-process HandLandmarks model output.

Constructors
~~~~~~~~~~~~

.. class:: HandLandmarks(threshold:float=0.6, nms_threshold:float=0.1, nms_sigma:float=0.1) -> HandLandmarks

    Create a HandLandmarks postprocessor.

    ``threshold`` The threshold to use for postprocessing.

    This post-processor returns a list of rect ``[x, y, w, h]``, score, and (x, y, z) keypoint list tuples for each class
    in the model output (left=0, or right=1) E.g. ``[[((x, y, w, h), score, keypoints)]]``. Note that empty class list are included in the
    output to ensure the position of each class list in the output matches the position of the class index in the model output.
