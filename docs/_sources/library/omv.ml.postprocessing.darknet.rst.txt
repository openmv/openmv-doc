.. currentmodule:: ml.postprocessing.darknet

:mod:`ml.postprocessing.darknet` --- Darknet
============================================

.. module:: ml.postprocessing.darknet
    :synopsis: Darknet

The `ml.postprocessing.darknet` module contains classes for Darknet.

class YoloLC -- YOLO LC
-----------------------

Used to post-process YOLO LC model output.

Constructors
~~~~~~~~~~~~

.. class:: YoloLC(threshold:float=0.6, anchors:List[Tuple[float, float]]=None, nms_threshold:float=0.1, nms_sigma:float=0.1) -> YoloLC

    Create a YOLO LC postprocessor.

    ``threshold`` The threshold to use for postprocessing.

    ``anchors`` A list of anchor points ``(x, y)`` the model was trained on  to use for postprocessing.

    This post-processor returns a list of rect ``[x, y, w, h]`` and score tuples for each class in the model output.
    E.g. ``[[((x, y, w, h), score)]]``. Note that empty class list are included in the output to ensure the position
    of each class list in the output matches the position of the class index in the model output.

class YoloV2 -- YOLO V2
-----------------------

Used to post-process YOLO V2 model output.

Constructors
~~~~~~~~~~~~

.. class:: YoloV2(threshold:float=0.6, anchors:List[Tuple[float, float]]=None, nms_threshold:float=0.1, nms_sigma:float=0.1) -> YoloV2

    Create a YOLO V2 postprocessor.

    ``threshold`` The threshold to use for postprocessing.

    ``anchors`` A list of anchor points ``(x, y)`` the model was trained on to use for postprocessing.

    This post-processor returns a list of rect ``[x, y, w, h]`` and score tuples for each class in the model output.
    E.g. ``[[((x, y, w, h), score)]]``. Note that empty class list are included in the output to ensure the position
    of each class list in the output matches the position of the class index in the model output.