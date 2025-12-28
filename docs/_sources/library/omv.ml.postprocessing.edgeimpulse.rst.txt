.. currentmodule:: ml.postprocessing.edgeimpulse

:mod:`ml.postprocessing.edgeimpulse` --- Edge Impulse
=====================================================

.. module:: ml.postprocessing.edgeimpulse
    :synopsis: Edge Impulse

The `ml.postprocessing.edgeimpulse` module contains classes for Edge Impulse.

class Fomo -- Fast Objects More Objects
---------------------------------------

Used to post-process FOMO model output.

Constructors
~~~~~~~~~~~~

.. class:: Fomo(threshold:float=0.4, w_scale:float=1.414214, h_scale:float=1.414214, nms_threshold:float=0.1, nms_sigma:float=0.1) -> Fomo

    Create a FOMO postprocessor.

    ``threshold`` The threshold to use for postprocessing.

    ``w/h_scale`` Are used to control how much grid cell sizes are scaled by on return. Making this larger helps join
    cells close by each other into one cell during non-max-suppression. 

    This post-processor returns a list of rect ``[x, y, w, h]`` and score tuples for each class in the model output.
    E.g. ``[[((x, y, w, h), score)]]``. Note that empty class list are included in the output to ensure the position
    of each class list in the output matches the position of the class index in the model output.
