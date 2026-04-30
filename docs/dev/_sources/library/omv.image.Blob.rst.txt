.. currentmodule:: image

class Blob -- Blob object
=========================

The blob object is an attrtuple returned by `Image.find_blobs()`. It has 23
fields accessible as attributes or by index ``[0..22]``.

.. class:: blob

   Please call `Image.find_blobs()` to create this object.

   .. method:: x() -> int

      Returns the blob's bounding box x coordinate. Index ``[0]``.

   .. method:: y() -> int

      Returns the blob's bounding box y coordinate. Index ``[1]``.

   .. method:: w() -> int

      Returns the blob's bounding box width. Index ``[2]``.

   .. method:: h() -> int

      Returns the blob's bounding box height. Index ``[3]``.

   .. method:: cx() -> int

      Returns the centroid x position of the blob (rounded to int). Index ``[4]``.

   .. method:: cy() -> int

      Returns the centroid y position of the blob (rounded to int). Index ``[5]``.

   .. method:: pixels() -> int

      Returns the number of pixels that are part of this blob. Index ``[6]``.

   .. method:: rotation() -> float

      Returns the rotation of the blob in radians. Index ``[7]``.

   .. method:: code() -> int

      Returns a 32-bit binary number with a bit set for each color threshold
      that's part of this blob. Index ``[8]``.

   .. method:: count() -> int

      Returns the number of blobs merged into this blob. Index ``[9]``.

   .. method:: perimeter() -> int

      Returns the number of pixels on this blob's perimeter. Index ``[10]``.

   .. method:: roundness() -> float

      Returns a value between 0 and 1 representing how round the blob is.
      Index ``[11]``.

   .. method:: x_hist_bins() -> List[int]

      Returns a list of histogram bin values for the x axis of the blob.
      Index ``[12]``.

   .. method:: y_hist_bins() -> List[int]

      Returns a list of histogram bin values for the y axis of the blob.
      Index ``[13]``.

   .. method:: corners() -> Tuple[Tuple[int, int], Tuple[int, int], Tuple[int, int], Tuple[int, int]]

      Returns a 4-tuple of (x, y) tuples for the 4 corners of the blob in
      sorted clock-wise order starting from the top left. Index ``[14]``.

   .. method:: min_corners() -> Tuple[Tuple[int, int], Tuple[int, int], Tuple[int, int], Tuple[int, int]]

      Returns a 4-tuple of (x, y) tuples for the 4 corners of the minimum
      area rectangle of the blob. Index ``[15]``.

   .. method:: cxf() -> float

      Returns the centroid x position of the blob as a float. Index ``[16]``.

   .. method:: cyf() -> float

      Returns the centroid y position of the blob as a float. Index ``[17]``.

   .. method:: elongation() -> float

      Returns ``1.0 - roundness()``; a value between 0 and 1 representing
      how elongated the blob is. Index ``[18]``.

   .. method:: area() -> int

      Returns the area of the bounding box around the blob (``w * h``).
      Index ``[19]``.

   .. method:: density() -> float

      Returns ``pixels / area``, the ratio of blob pixels to bounding box
      area. Index ``[20]``.

   .. method:: compactness() -> float

      Returns ``(pixels * 4 * pi) / (perimeter * perimeter)``. Index ``[21]``.

   .. method:: rect() -> Tuple[int, int, int, int]

      Returns a rectangle tuple ``(x, y, w, h)`` of the blob's bounding box
      for use with other `image` methods like `Image.draw_rectangle()`.
      Index ``[22]``.
