.. currentmodule:: image

class Line -- Line object
=========================

The line object is an attrtuple returned by `Image.find_lines()`,
`Image.find_line_segments()`, or `Image.get_regression()`. It has 8 fields
accessible as attributes or by index ``[0..7]``.

.. class:: line

   Please call `Image.find_lines()`, `Image.find_line_segments()`, or
   `Image.get_regression()` to create this object.

   .. method:: x1() -> int

      Returns the line's p1 x component. Index ``[0]``.

   .. method:: y1() -> int

      Returns the line's p1 y component. Index ``[1]``.

   .. method:: x2() -> int

      Returns the line's p2 x component. Index ``[2]``.

   .. method:: y2() -> int

      Returns the line's p2 y component. Index ``[3]``.

   .. method:: length() -> int

      Returns the line's length: ``round(sqrt((x2-x1)^2 + (y2-y1)^2))``.
      Index ``[4]``.

   .. method:: magnitude() -> int

      Returns the magnitude of the line from the Hough transform. Index ``[5]``.

   .. method:: theta() -> int

      Returns the angle of the line from the Hough transform (0-179 degrees).
      Index ``[6]``.

   .. method:: rho() -> int

      Returns the rho value for the line from the Hough transform. Index ``[7]``.
