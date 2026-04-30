:mod:`cmath` -- mathematical functions for complex numbers
==========================================================

.. module:: cmath
   :synopsis: mathematical functions for complex numbers

The ``cmath`` module provides basic mathematical functions for working
with complex numbers, including trigonometric, exponential, logarithmic,
and conversions between rectangular ``(real, imag)`` and polar
``(r, phi)`` representations.

Functions
---------

.. function:: cos(z: complex) -> complex

   Return the cosine of ``z``.

.. function:: exp(z: complex) -> complex

   Return the exponential of ``z``.

.. function:: log(z: complex) -> complex

   Return the natural logarithm of ``z``.  The branch cut is along the negative real axis.

.. function:: log10(z: complex) -> complex

   Return the base-10 logarithm of ``z``.  The branch cut is along the negative real axis.

.. function:: phase(z: complex) -> float

   Returns the phase of the number ``z``, in the range (-pi, +pi].

.. function:: polar(z: complex) -> Tuple[float, float]

   Returns, as a tuple, the polar form of ``z``.

.. function:: rect(r: float, phi: float) -> complex

   Returns the complex number with modulus ``r`` and phase ``phi``.

.. function:: sin(z: complex) -> complex

   Return the sine of ``z``.

.. function:: sqrt(z: complex) -> complex

   Return the square-root of ``z``.

Constants
---------

.. data:: e
   :type: float

   base of the natural logarithm

.. data:: pi
   :type: float

   the ratio of a circle's circumference to its diameter
