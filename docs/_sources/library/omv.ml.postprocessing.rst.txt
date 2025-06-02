.. currentmodule:: ml.postprocessing

:mod:`ml.postprocessing` --- ML Postprocessing
==============================================

.. module:: ml.postprocessing
    :synopsis: ML Postprocessing

The `ml.postprocessing` module contains classes for postprocessing model output.

.. _postprocessing.fomo_postprocess:

class fomo_postprocess -- FOMO
------------------------------

Used to post-process FOMO model output.

Constructors
~~~~~~~~~~~~

.. class:: fomo_postprocess(threshold:float=0.4) -> fomo_postprocess

    Create a FOMO postprocessor.

    ``threshold`` The threshold to use for postprocessing.

    This post-processor returns a list of rect ``[x, y, w, h]`` and score tuples for each class in the model output.
    E.g. ``[[((x, y, w, h), score)]]``. Note that empty class list are included in the output to ensure the position
    of each class list in the output matches the position of the class index in the model output.

class yolo_lc_postprocess -- YOLO LC
------------------------------------

Used to post-process YOLO LC model output.

Constructors
~~~~~~~~~~~~

.. class:: yolo_lc_postprocess(threshold:float=0.6, anchors:List[Tuple[float, float]]=None, nms_threshold:float=0.1, nms_sigma:float=0.1) -> yolo_lc_postprocess

    Create a YOLO LC postprocessor.

    ``threshold`` The threshold to use for postprocessing.

    ``anchors`` A list of anchor points ``(x, y)`` the model was trained on  to use for postprocessing.

    This post-processor returns a list of rect ``[x, y, w, h]`` and score tuples for each class in the model output.
    E.g. ``[[((x, y, w, h), score)]]``. Note that empty class list are included in the output to ensure the position
    of each class list in the output matches the position of the class index in the model output.

class yolo_v2_postprocess -- YOLO V2
------------------------------------

Used to post-process YOLO V2 model output.

Constructors
~~~~~~~~~~~~

.. class:: yolo_v2_postprocess(threshold:float=0.6, anchors:List[Tuple[float, float]]=None, nms_threshold:float=0.1, nms_sigma:float=0.1) -> yolo_v2_postprocess

    Create a YOLO V2 postprocessor.

    ``threshold`` The threshold to use for postprocessing.

    ``anchors`` A list of anchor points ``(x, y)`` the model was trained on  to use for postprocessing.

    This post-processor returns a list of rect ``[x, y, w, h]`` and score tuples for each class in the model output.
    E.g. ``[[((x, y, w, h), score)]]``. Note that empty class list are included in the output to ensure the position
    of each class list in the output matches the position of the class index in the model output.

class yolo_v5_postprocess -- YOLO V5
------------------------------------

Used to post-process YOLO V5 model output.

Constructors
~~~~~~~~~~~~

.. class:: yolo_v5_postprocess(threshold:float=0.6, nms_threshold:float=0.1, nms_sigma:float=0.1) -> yolo_v5_postprocess

    Create a YOLO V5 postprocessor.

    ``threshold`` The threshold to use for postprocessing.

    This post-processor returns a list of rect ``[x, y, w, h]`` and score tuples for each class in the model output.
    E.g. ``[[((x, y, w, h), score)]]``. Note that empty class list are included in the output to ensure the position
    of each class list in the output matches the position of the class index in the model output.

class yolo_v8_postprocess -- YOLO V8
------------------------------------

Used to post-process YOLO V8 model output.

Constructors
~~~~~~~~~~~~

.. class:: yolo_v8_postprocess(threshold:float=0.6, nms_threshold:float=0.1, nms_sigma:float=0.1) -> yolo_v8_postprocess

    Create a YOLO V8 postprocessor.

    ``threshold`` The threshold to use for postprocessing.

    This post-processor returns a list of rect ``[x, y, w, h]`` and score tuples for each class in the model output.
    E.g. ``[[((x, y, w, h), score)]]``. Note that empty class list are included in the output to ensure the position
    of each class list in the output matches the position of the class index in the model output.
