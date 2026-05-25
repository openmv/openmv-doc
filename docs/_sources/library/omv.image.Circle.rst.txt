.. currentmodule:: image

class Circle -- Circle object
=============================

The circle object is an `attrtuple <https://docs.micropython.org/en/latest/library/collections.html#collections.namedtuple>`_
returned by `Image.find_circles()`. Each circle is described by its
centre, its radius, and a Hough-space magnitude that captures how strongly
the edge pixels in the image voted for it.

Fields are accessible by attribute name (``circle.x``) or by index
(``circle[0]``). The object has no public constructor.

.. class:: circle

   Please call `Image.find_circles()` to create this object.

   .. attribute:: x

      Centre x coordinate, in pixels. Integer. Index ``[0]``.

   .. attribute:: y

      Centre y coordinate, in pixels. Integer. Index ``[1]``.

   .. attribute:: r

      Radius, in pixels. Integer. Index ``[2]``.

   .. attribute:: magnitude

      Magnitude of the circle in Hough-space. Higher values mean more
      edge pixels voted for this circle -- treat this as a confidence
      score. Integer. Index ``[3]``.
