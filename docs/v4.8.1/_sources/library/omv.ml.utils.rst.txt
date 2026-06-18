.. currentmodule:: ml.utils

:mod:`ml.utils` --- ML Utils
============================

.. module:: ml.utils
    :synopsis: ML Utils

The `ml.utils` module contains utility classes and functions for machine learning.

.. function:: logit(array)

    Returns the logit of all values in the passed ``ndarray`` array.

.. function:: sigmod(array)

    Returns the sigmod of all values in the passed ``ndarray`` array.

.. function:: threshold(scores, threshold, scale, find_max=False, find_max_axis=1)

    Thresholds ``scores``, a quantized ``ndarray`` (int8, uint8, int16, uint16) by a quantized ``threshold`` and then
    returns an ``ndarray`` of all indices passing the threshold. ``scale`` is tested to determine if the
    dequantized values are positive or negative.

    ``find_max`` if True, replaces ``scores`` internally with an ``ndarray`` of the max of the ``find_max_axis``.
    This is useful, for example, when you need to find the max class value per row in an array of bounding box
    candidate outputs and then threshold the max value per row and return the list of passing indices.

.. function:: quantize(model, array, index=0)

    Converts the passed ``ndarray`` by dividing by the scale and adding the zero point of the model.
    Returns a floating point ``ndarray``.

    ``index`` selects which tensor output of the ``model`` to quantize against.
   
.. function:: dequantize(model, array, index=0)

    Converts the passed ``ndarray`` by subtracting the zero point and then multiplying by the scale of the model.
    Returns a floating point ``ndarray``.

    ``index`` selects which tensor output of the ``model`` to dequantize against.

.. function:: draw_predictions(images, boxes, labels, colors, format="pascal_voc", font_width=8, font_height=10, text_colo=(255, 255, 255)) -> None

   Draws bounding boxes with text labels from the list of ``boxes`` (x, y, w, h) using the list of ``labels`` strings and ``colors`` (r, g, b) tuples.

.. function:: draw_keypoints(img, keypoints, radius:int=4, color=(255, 0, 0), thickness:int=1, fill:bool=False) -> None

   Draws an ``ndarray`` of keypoint (x, y, ...) values on the image.

.. function:: draw_skeleton(img, keypoints, lines, kp_radius:int=4, kp_color=(255, 0, 0), kp_thickness:int=1, kp_fill:bool=False, line_color=(0, 255, 0), line_thickness:int=1) -> None

   Draws an ``ndarray`` of keypoint (x, y, ...) values on the image and then lines between the keypoints from a list of ``lines`` (kp0_idx,  kp1_idx) tuples.

.. _utils.NMS:

class NMS - Soft-Non-Maximum Suppression
----------------------------------------

The `NMS` object is used to collect a list of bounding boxes and their associated scores and then filter
out overlapping bounding boxes with lower scores. Additionally, it remaps bounding boxes detected
in a sub-window back to the original image coordinates.

Constructors
~~~~~~~~~~~~

.. class:: NMS(window_w:int, window_h:int, roi:tuple[int,int,int,int]) -> NMS

   Creates a `NMS` object with the given window size and region of interest (ROI). The window is
   width/height of the input tensor of image model. The ROI is the region of interest that returned by the
   `Normalization()` object which corresponds to the region of the image that the model was run on.
   This allows the `NMS` object to remap bounding boxes detected in a sub-window back to the original
   image coordinates.

   Methods
   ~~~~~~~

   .. method:: add_bounding_boxes(xmin:float, ymin:float, xmax:float, ymax:float, score:float, label_index:int, keypoints=None) -> None

      Adds a bounding box to the `NMS` object with the given coordinates, score, and label index.

      ``xmin``, ``ymin``, ``xmax``, and ``ymax`` are the bounding box coordinates in the range of 0.0 to 1.0
      where (0.0, 0.0) is the top-left corner of the image and (1.0, 1.0) is the bottom-right corner of the image.

      ``score`` is the confidence score of the bounding box (0.0-1.0).

      ``label_index`` is the index of the label associated with the bounding box.

      ``keypoints`` is an ``ndarray`` of keypoint (x, y, ...) values.

   .. method:: get_bounding_boxes(threshold:float=0.1, sigma:float=0.1) -> list[tuple[int,int,int,int,float,int]]
         
      Returns a list of bounding boxes that have been filtered by the `NMS` object and remapped
      to the original image coordinates. Bounding box tuples are
      ``(x, y, w, h, score, label_index)``. After calling this method you should create a new
      `NMS` object if you want to process a new set of bounding boxes. If ``keypoints`` was
      not None when adding then the tuple will be extended with a list of ``keypoints``. The keypoints
      are mapped to the correct coordinates like the bounding boxes.

      Bounding boxes must have a higher score then ``threshold`` to be kept.

      ``sigma`` controls the gaussian used to apply a score penalty to overlapping bounding boxes
      using the Soft-Non-Maximum-Suppression algorithm. A higher ``sigma`` will result in a more
      aggressive suppression of overlapping bounding boxes.
