.. currentmodule:: image

class Rect -- Rectangle Object
==============================

The rect object is an attrtuple returned by `Image.find_rects()`. It has
6 fields accessible as attributes or by index ``[0..5]``.

.. class:: rect

   Please call `Image.find_rects()` to create this object.

   .. method:: x() -> int

      Returns the rectangle's top left corner's x position. Index ``[0]``.

   .. method:: y() -> int

      Returns the rectangle's top left corner's y position. Index ``[1]``.

   .. method:: w() -> int

      Returns the rectangle's width. Index ``[2]``.

   .. method:: h() -> int

      Returns the rectangle's height. Index ``[3]``.

   .. method:: magnitude() -> int

      Returns the rectangle's magnitude from the Hough transform. Index ``[4]``.

   .. method:: corners() -> Tuple[Tuple[int, int], Tuple[int, int], Tuple[int, int], Tuple[int, int]]

      Returns a 4-tuple of (x, y) tuples for the 4 corners of the rectangle
      in sorted clock-wise order starting from the top left. Index ``[5]``.
