.. currentmodule:: ml.utils

:mod:`ml.utils` --- ML Utils
============================

.. module:: ml.utils
    :synopsis: ML Utils

The `ml.utils` module contains utility classes and functions for machine learning.

Functions
---------

.. function:: logit(x: ndarray) -> ndarray

    Returns the logit of all values in the passed ``ndarray``.

.. function:: sigmoid(x: ndarray) -> ndarray

    Returns the sigmoid of all values in the passed ``ndarray``.

.. function:: mod(a: ndarray, b: ndarray) -> ndarray

    Returns the element-wise modulo ``a - (b * (a // b))``.

.. function:: threshold(scores: ndarray, threshold: float, scale: float, find_max: bool = False, find_max_axis: int = 1) -> ndarray

    Thresholds ``scores`` (a quantized ``ndarray`` of int8, uint8, int16, or uint16) by a quantized
    ``threshold`` and returns an ``ndarray`` of all indices passing the threshold.

    ``scale`` is tested to determine if the dequantized values are positive or negative. When
    ``scale > 0`` indices where ``scores > threshold`` are returned; otherwise indices where
    ``scores < threshold`` are returned.

    ``find_max`` if True, replaces ``scores`` internally with an ``ndarray`` of the max
    (or min, depending on ``scale``) along ``find_max_axis``.

    ``find_max_axis`` is the axis along which the max/min reduction is computed when
    ``find_max`` is True.

.. function:: quantize(model: ml.Model, value: ndarray, index: int = 0) -> ndarray

    Converts the passed ``ndarray`` by dividing by the scale and adding the zero point of the model.
    Returns ``value`` unchanged when the model output dtype at ``index`` is float.

    ``model`` is the model whose output quantization parameters are used.

    ``value`` is the ``ndarray`` to quantize.

    ``index`` selects which tensor output of the ``model`` to quantize against.

.. function:: dequantize(model: ml.Model, value: ndarray, index: int = 0) -> ndarray

    Converts the passed ``ndarray`` by subtracting the zero point and then multiplying by the scale of the model.
    Returns ``value`` unchanged when the model output dtype at ``index`` is float.

    ``model`` is the model whose output quantization parameters are used.

    ``value`` is the ``ndarray`` to dequantize.

    ``index`` selects which tensor output of the ``model`` to dequantize against.

.. function:: draw_predictions(image: image.Image, boxes: list[tuple[float, float, float, float]], labels: list[str], colors: list[tuple[int, int, int]], format: str = "pascal_voc", font_width: int = 8, font_height: int = 10, text_color: tuple[int, int, int] = (255, 255, 255)) -> None

    Draws bounding boxes with text labels onto ``image``.

    ``boxes`` is a list of ``(x, y, w, h)`` tuples.

    ``labels`` is a list of label strings, one per box.

    ``colors`` is a list of ``(r, g, b)`` tuples, one per box.

    ``format`` is ``"pascal_voc"`` to interpret box values as normalized
    ``(xmin, ymin, xmax, ymax)`` in the range 0.0 to 1.0; any other value treats the
    box values as absolute pixel ``(x, y, w, h)``.

    ``font_width`` is the width in pixels of each character in the label.

    ``font_height`` is the height in pixels of the label background.

    ``text_color`` is the ``(r, g, b)`` color used for the label text.

.. function:: draw_keypoints(image: image.Image, keypoints: ndarray, radius: int = 4, color: tuple[int, int, int] = (255, 0, 0), thickness: int = 1, fill: bool = False) -> None

    Draws an ``ndarray`` of keypoint ``(x, y, ...)`` values on ``image``.

    ``radius`` is the keypoint circle radius. When ``radius == 0`` the keypoints are drawn
    as single pixels.

    ``color`` is the ``(r, g, b)`` keypoint color.

    ``thickness`` is the circle outline thickness.

    ``fill`` if True fills the keypoint circles.

.. function:: draw_skeleton(image: image.Image, keypoints: ndarray, lines: list[tuple[int, int]], kp_radius: int = 4, kp_color: tuple[int, int, int] = (255, 0, 0), kp_thickness: int = 1, kp_fill: bool = False, line_color: tuple[int, int, int] = (0, 255, 0), line_thickness: int = 1) -> None

    Draws an ``ndarray`` of keypoint ``(x, y, ...)`` values on ``image`` and then connects
    them with line segments.

    ``lines`` is a list of ``(kp0_idx, kp1_idx)`` tuples specifying which keypoint pairs to connect.

    ``kp_radius`` is the keypoint circle radius (passed through to `draw_keypoints`).

    ``kp_color`` is the ``(r, g, b)`` keypoint color.

    ``kp_thickness`` is the keypoint circle outline thickness.

    ``kp_fill`` if True fills the keypoint circles.

    ``line_color`` is the ``(r, g, b)`` line color.

    ``line_thickness`` is the line thickness.

.. _utils.NMS:

class NMS -- Soft-Non-Maximum Suppression
-----------------------------------------

The `NMS` object collects a list of bounding boxes with associated scores, filters
overlapping boxes with lower scores via Soft-NMS, and remaps boxes detected in a
sub-window back to the original image coordinates.

.. class:: NMS(window_w: int, window_h: int, roi: tuple[int, int, int, int])

    Creates a `NMS` object.

    ``window_w`` and ``window_h`` are the width and height of the model input tensor / window.

    ``roi`` is the ``(x, y, w, h)`` region of interest of the original image that the
    model was run on (typically returned by the `Normalization()` object). Used to remap
    detected boxes back into the original image coordinate space. ``roi[2]`` and ``roi[3]``
    must be >= 1.

    .. method:: add_bounding_box(xmin: float, ymin: float, xmax: float, ymax: float, score: float, label_index: int, keypoints: ndarray | None = None) -> None

        Adds a bounding box to the `NMS` object. Boxes with ``score`` outside ``[0.0, 1.0]``
        or with zero/negative width or height after clipping are discarded.

        ``xmin``, ``ymin``, ``xmax``, ``ymax`` are the bounding box coordinates in window
        pixel space, clipped to ``[0, window_w]`` / ``[0, window_h]``.

        ``score`` is the confidence score of the bounding box (0.0-1.0).

        ``label_index`` is the index of the class label associated with the bounding box.

        ``keypoints`` is an optional ``ndarray`` of keypoint ``(x, y, ...)`` values associated
        with this bounding box.

    .. method:: get_bounding_boxes(threshold: float = 0.1, sigma: float = 0.1) -> list[list[tuple]]

        Performs Soft-NMS over all added boxes and returns a list of per-class lists, indexed
        by ``label_index``. Each inner list contains tuples of ``((x, y, w, h), score)`` mapped
        back into the original image coordinates. If ``keypoints`` was provided when adding,
        the tuple is extended with the remapped ``keypoints`` ``ndarray``.

        After calling this method create a new `NMS` object to process a new set of bounding
        boxes.

        ``threshold`` is the minimum score a box must retain after Soft-NMS suppression to be
        kept.

        ``sigma`` controls the Gaussian used to penalize the scores of overlapping bounding
        boxes. A smaller ``sigma`` results in more aggressive suppression. ``sigma <= 0.0``
        disables the Gaussian penalty (scores of overlapping boxes are not decayed).
