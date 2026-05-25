.. currentmodule:: image

class Rect -- Rectangle Object
==============================

The rect object is an `attrtuple <https://docs.micropython.org/en/latest/library/collections.html#collections.namedtuple>`_
returned by `Image.find_rects()`. Each rect describes a four-sided
quadrilateral located by the rectangle detector, together with its
axis-aligned bounding box, the four detected corners, and an edge-strength
magnitude summed along the rectangle's perimeter.

Fields are accessible by attribute name (``rect.x``) or by index
(``rect[0]``). The object has no public constructor.

.. class:: rect

   Please call `Image.find_rects()` to create this object.

   .. attribute:: x

      Bounding box top-left x coordinate, in pixels. Integer. Index ``[0]``.

   .. attribute:: y

      Bounding box top-left y coordinate, in pixels. Integer. Index ``[1]``.

   .. attribute:: w

      Bounding box width, in pixels. Integer. Index ``[2]``.

   .. attribute:: h

      Bounding box height, in pixels. Integer. Index ``[3]``.

   .. attribute:: magnitude

      Sum of the edge-gradient strength traced along the rectangle's
      perimeter. Higher values mean stronger edges around the rectangle --
      treat this as a confidence score. Integer. Index ``[4]``.

   .. attribute:: corners

      4-tuple of ``(x, y)`` integer tuples for the four corners of the
      detected quadrilateral, sorted clockwise starting from the top-left
      corner. May not be axis-aligned -- use these corners to draw the
      true outline of the detection. Index ``[5]``.
