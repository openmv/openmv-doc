:mod:`scipy.special` --- Special functions
===============================================

.. module:: scipy.special
   :synopsis: Special mathematical functions

The :mod:`scipy.special` submodule provides element-wise special
mathematical functions. Like the universal functions in
:mod:`numpy`, every routine accepts a scalar, a scalar-valued iterable
(``range``, ``list``, ``tuple``), or an :class:`numpy.ndarray`, and
returns a new :class:`numpy.ndarray` of dtype ``float``.

Functions
---------

.. function:: erf(x: ndarray | Iterable[float] | float) -> ndarray

   Element-wise Gauss error function,
   ``erf(x) = (2 / sqrt(pi)) * integral(exp(-t**2), 0, x)``.

   :param x: a scalar, scalar-valued iterable, or
             :class:`numpy.ndarray`.
   :return: a float :class:`numpy.ndarray` with the same shape as the
            input.

.. function:: erfc(x: ndarray | Iterable[float] | float) -> ndarray

   Element-wise complementary error function, ``erfc(x) = 1 - erf(x)``,
   computed in a way that retains accuracy for large *x*.

   :param x: a scalar, scalar-valued iterable, or
             :class:`numpy.ndarray`.
   :return: a float :class:`numpy.ndarray` with the same shape as the
            input.

.. function:: gamma(x: ndarray | Iterable[float] | float) -> ndarray

   Element-wise Gamma function.

   :param x: a scalar, scalar-valued iterable, or
             :class:`numpy.ndarray`.
   :return: a float :class:`numpy.ndarray` with the same shape as the
            input.

.. function:: gammaln(x: ndarray | Iterable[float] | float) -> ndarray

   Element-wise natural logarithm of the absolute value of the Gamma
   function.

   :param x: a scalar, scalar-valued iterable, or
             :class:`numpy.ndarray`.
   :return: a float :class:`numpy.ndarray` with the same shape as the
            input.
