.. currentmodule:: image

class Circle -- Circle object
=============================

The circle object is an attrtuple returned by `Image.find_circles()`. It
has 4 fields accessible as attributes or by index ``[0..3]``.

.. class:: circle

   Please call `Image.find_circles()` to create this object.

   .. method:: x() -> int

      Returns the circle's x position. Index ``[0]``.

   .. method:: y() -> int

      Returns the circle's y position. Index ``[1]``.

   .. method:: r() -> int

      Returns the circle's radius. Index ``[2]``.

   .. method:: magnitude() -> int

      Returns the circle's magnitude from the Hough transform. Index ``[3]``.
