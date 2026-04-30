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
