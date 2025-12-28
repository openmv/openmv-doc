.. currentmodule:: ml.postprocessing.ultralytics

:mod:`ml.postprocessing.ultralytics` --- Ultralytics
====================================================

.. module:: ml.postprocessing.ultralytics
    :synopsis: Ultralytics

The `ml.postprocessing.ultralytics` module contains classes for Ultralytics.

class YoloV5 -- YOLO V5
-----------------------

Used to post-process YOLO V5 model output.

Constructors
~~~~~~~~~~~~

.. class:: YoloV5(threshold:float=0.6, nms_threshold:float=0.1, nms_sigma:float=0.1) -> YoloV5

    Create a YOLO V5 postprocessor.

    ``threshold`` The threshold to use for postprocessing.

    This post-processor returns a list of rect ``[x, y, w, h]`` and score tuples for each class in the model output.
    E.g. ``[[((x, y, w, h), score)]]``. Note that empty class list are included in the output to ensure the position
    of each class list in the output matches the position of the class index in the model output.

class YoloV8 -- YOLO V8
-----------------------

Used to post-process YOLO V8 model output.

Constructors
~~~~~~~~~~~~

.. class:: YoloV8(threshold:float=0.6, nms_threshold:float=0.1, nms_sigma:float=0.1) -> YoloV8

    Create a YOLO V8 postprocessor.

    ``threshold`` The threshold to use for postprocessing.

    This post-processor returns a list of rect ``[x, y, w, h]`` and score tuples for each class in the model output.
    E.g. ``[[((x, y, w, h), score)]]``. Note that empty class list are included in the output to ensure the position
    of each class list in the output matches the position of the class index in the model output.
