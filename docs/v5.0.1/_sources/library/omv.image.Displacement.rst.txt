.. currentmodule:: image

class Displacement -- Displacement object
=========================================

The displacement object is an `attrtuple <https://docs.micropython.org/en/latest/library/collections.html#collections.namedtuple>`_
returned by `Image.find_displacement()`. It encodes the rigid alignment
estimated by phase correlation between two images: a translation in
pixels, and -- when ``find_displacement(..., logpolar=True)`` is used --
a rotation in radians plus a scale factor.

Fields are accessible by attribute name (``displacement.x_translation``)
or by index (``displacement[0]``). The object has no public constructor.

.. class:: displacement

   Please call `Image.find_displacement()` to create this object.

   .. attribute:: x_translation

      X-axis translation in pixels between the two images. Float.
      Index ``[0]``.

   .. attribute:: y_translation

      Y-axis translation in pixels between the two images. Float.
      Index ``[1]``.

   .. attribute:: rotation

      Rotation in radians between the two images. Only meaningful when
      ``find_displacement(..., logpolar=True)`` is used; otherwise 0.0.
      Float. Index ``[2]``.

   .. attribute:: scale

      Scale change between the two images. Only meaningful when
      ``find_displacement(..., logpolar=True)`` is used; otherwise 1.0.
      Float. Index ``[3]``.

   .. attribute:: response

      Quality of the phase-correlation match in the range 0.0 -- 1.0,
      where 1.0 is a perfect match. Use this to reject low-confidence
      results. Float. Index ``[4]``.
