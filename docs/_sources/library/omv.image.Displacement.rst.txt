.. currentmodule:: image

class Displacement -- Displacement object
=========================================

The displacement object is an `attrtuple <https://docs.micropython.org/en/latest/library/collections.html#collections.namedtuple>`_
returned by `Image.find_displacement()` with the fields:

.. class:: displacement

   Please call `Image.find_displacement()` to create this object. It has no
   public constructor.

   .. method:: x_translation() -> float

      X translation in pixels between the two images. Index ``[0]``.

   .. method:: y_translation() -> float

      Y translation in pixels between the two images. Index ``[1]``.

   .. method:: rotation() -> float

      Rotation in radians between the two images. Index ``[2]``.

   .. method:: scale() -> float

      Scale change between the two images. Index ``[3]``.

   .. method:: response() -> float

      Quality of the displacement match between the two images, in the range 0-1.
      Index ``[4]``.
