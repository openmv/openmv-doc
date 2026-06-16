.. currentmodule:: image

class Line -- Line object
=========================

The line object is an `attrtuple <https://docs.micropython.org/en/latest/library/collections.html#collections.namedtuple>`_
returned by `Image.find_lines()`, `Image.find_line_segments()`, and
`Image.get_regression()`. It represents a single oriented line segment with
both its endpoint form ``(x1, y1) -- (x2, y2)`` and its Hough-space form
``(rho, theta)``.

Fields are accessible by attribute name (``line.x1``) or by index
(``line[0]``). The object has no public constructor.

.. class:: line

   Please call `Image.find_lines()`, `Image.find_line_segments()`, or
   `Image.get_regression()` to create this object.

   .. attribute:: x1

      X coordinate of the first endpoint. Integer. Index ``[0]``.

   .. attribute:: y1

      Y coordinate of the first endpoint. Integer. Index ``[1]``.

   .. attribute:: x2

      X coordinate of the second endpoint. Integer. Index ``[2]``.

   .. attribute:: y2

      Y coordinate of the second endpoint. Integer. Index ``[3]``.

   .. attribute:: length

      Pixel length of the segment: ``round(sqrt((x2-x1)**2 + (y2-y1)**2))``.
      Integer. Index ``[4]``.

   .. attribute:: magnitude

      Magnitude of the line in Hough-space. Higher values indicate that
      more edge pixels voted for this line. Integer. Index ``[5]``.

   .. attribute:: theta

      Angle of the line in Hough-space, in degrees, 0 -- 179. Integer.
      Index ``[6]``.

   .. attribute:: rho

      Distance of the line from the image origin in Hough-space, in
      pixels. Signed integer (can be negative). Index ``[7]``.
