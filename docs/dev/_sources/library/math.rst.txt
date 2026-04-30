:mod:`math` -- mathematical functions
=====================================

.. module:: math
   :synopsis: mathematical functions

The ``math`` module provides some basic mathematical functions for
working with floating-point numbers.

*Note:* On the pyboard, floating-point numbers have 32-bit precision.

Functions
---------

.. function:: acos(x: float) -> float

   Return the inverse cosine of ``x``.

.. function:: acosh(x: float) -> float

   Return the inverse hyperbolic cosine of ``x``.

.. function:: asin(x: float) -> float

   Return the inverse sine of ``x``.

.. function:: asinh(x: float) -> float

   Return the inverse hyperbolic sine of ``x``.

.. function:: atan(x: float) -> float

   Return the inverse tangent of ``x``.

.. function:: atan2(y: float, x: float) -> float

   Return the principal value of the inverse tangent of ``y/x``.

.. function:: atanh(x: float) -> float

   Return the inverse hyperbolic tangent of ``x``.

.. function:: ceil(x: float) -> int

   Return an integer, being ``x`` rounded towards positive infinity.

.. function:: copysign(x: float, y: float) -> float

   Return ``x`` with the sign of ``y``.

.. function:: cos(x: float) -> float

   Return the cosine of ``x``.

.. function:: cosh(x: float) -> float

   Return the hyperbolic cosine of ``x``.

.. function:: degrees(x: float) -> float

   Return radians ``x`` converted to degrees.

.. function:: erf(x: float) -> float

   Return the error function of ``x``.

.. function:: erfc(x: float) -> float

   Return the complementary error function of ``x``.

.. function:: exp(x: float) -> float

   Return the exponential of ``x``.

.. function:: expm1(x: float) -> float

   Return ``exp(x) - 1``.

.. function:: fabs(x: float) -> float

   Return the absolute value of ``x``.

.. function:: floor(x: float) -> int

   Return an integer, being ``x`` rounded towards negative infinity.

.. function:: fmod(x: float, y: float) -> float

   Return the remainder of ``x/y``.

.. function:: frexp(x: float) -> Tuple[float, int]

   Decomposes a floating-point number into its mantissa and exponent.
   The returned value is the tuple ``(m, e)`` such that ``x == m * 2**e``
   exactly.  If ``x == 0`` then the function returns ``(0.0, 0)``, otherwise
   the relation ``0.5 <= abs(m) < 1`` holds.

.. function:: gamma(x: float) -> float

   Return the gamma function of ``x``.

.. function:: isfinite(x: float) -> bool

   Return ``True`` if ``x`` is finite.

.. function:: isinf(x: float) -> bool

   Return ``True`` if ``x`` is infinite.

.. function:: isnan(x: float) -> bool

   Return ``True`` if ``x`` is not-a-number

.. function:: ldexp(x: float, exp: int) -> float

   Return ``x * (2**exp)``.

.. function:: lgamma(x: float) -> float

   Return the natural logarithm of the gamma function of ``x``.

.. function:: log(x: float) -> float
              log(x: float, base: float) -> float

   With one argument, return the natural logarithm of *x*.

   With two arguments, return the logarithm of *x* to the given *base*.

.. function:: log10(x: float) -> float

   Return the base-10 logarithm of ``x``.

.. function:: log2(x: float) -> float

   Return the base-2 logarithm of ``x``.

.. function:: modf(x: float) -> Tuple[float, float]

   Return a tuple of two floats, being the fractional and integral parts of
   ``x``.  Both return values have the same sign as ``x``.

.. function:: pow(x: float, y: float) -> float

   Returns ``x`` to the power of ``y``.

.. function:: radians(x: float) -> float

   Return degrees ``x`` converted to radians.

.. function:: sin(x: float) -> float

   Return the sine of ``x``.

.. function:: sinh(x: float) -> float

   Return the hyperbolic sine of ``x``.

.. function:: sqrt(x: float) -> float

   Return the square root of ``x``.

.. function:: tan(x: float) -> float

   Return the tangent of ``x``.

.. function:: tanh(x: float) -> float

   Return the hyperbolic tangent of ``x``.

.. function:: trunc(x: float) -> int

   Return an integer, being ``x`` rounded towards 0.

Constants
---------

.. data:: e
   :type: float

   base of the natural logarithm

.. data:: pi
   :type: float

   the ratio of a circle's circumference to its diameter
