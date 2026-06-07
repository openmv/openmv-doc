Universal functions
===================

A *universal function* (ufunc) is a math function that
applies to every element of an array in one call. The
arithmetic operators on the previous page are universal
functions wearing operator syntax; this page is the
catalogue of the named ones that cover trig, exp / log,
rounding, and a few others.

Each ufunc accepts a scalar, a Python iterable, or an
:class:`~ulab.numpy.ndarray`, and returns either a
single float (when the input was scalar) or a float
:class:`~ulab.numpy.ndarray`::

    from ulab import numpy as np

    np.exp(2.0)                    # 7.389...
    np.sin(range(4))               # 1-D float ndarray
    np.sqrt([1, 4, 9, 16])         # array([1.0, 2.0, 3.0, 4.0])

    a = np.arange(9).reshape((3, 3))
    np.exp(a)                      # 3x3 float ndarray

The catalogue
-------------

:mod:`numpy` exposes the math functions an embedded
application reaches for most often:

* **Trig** -- :func:`~ulab.numpy.sin`, :func:`~ulab.numpy.cos`,
  :func:`~ulab.numpy.tan`, :func:`~ulab.numpy.asin`,
  :func:`~ulab.numpy.acos`, :func:`~ulab.numpy.atan`,
  :func:`~ulab.numpy.arctan2`,
  :func:`~ulab.numpy.sinh`, :func:`~ulab.numpy.cosh`,
  :func:`~ulab.numpy.tanh`, :func:`~ulab.numpy.asinh`,
  :func:`~ulab.numpy.acosh`, :func:`~ulab.numpy.atanh`,
  :func:`~ulab.numpy.sinc`.
* **Angle conversion** --
  :func:`~ulab.numpy.degrees`,
  :func:`~ulab.numpy.radians`.
* **Exponentials and logs** --
  :func:`~ulab.numpy.exp`, :func:`~ulab.numpy.expm1`,
  :func:`~ulab.numpy.log`, :func:`~ulab.numpy.log10`,
  :func:`~ulab.numpy.log2`, :func:`~ulab.numpy.sqrt`.
* **Rounding** --
  :func:`~ulab.numpy.ceil`, :func:`~ulab.numpy.floor`,
  :func:`~ulab.numpy.around`.

Each function processes the whole array in one library
call. The speedup over a Python list comprehension that
calls :func:`math.sin` element by element is 10-30x on
a typical buffer.

The ``out=`` keyword
--------------------

Each ufunc call normally allocates a fresh result array
to hold its output. In a loop that runs many times a
second, those allocations add up and waste RAM.
Passing ``out=`` -- a float array that already exists,
of the same shape as the input -- writes the result
into that array instead of allocating a new one::

    x = np.linspace(0, 2 * np.pi, num=256)
    y = np.zeros(256)

    while True:
        np.sin(x, out=y)
        # use y ...

If ``out`` has the wrong dtype or shape, the function
raises an exception. The keyword is supported on every
ufunc on this page; it is the cleanest way to keep a
streaming signal-processing loop allocation-free.

Two-argument ufuncs
-------------------

:func:`~ulab.numpy.arctan2` is the only true
two-argument ufunc in the list above -- it returns the
quadrant-aware arctangent of ``y / x`` and broadcasts the
two operands::

    y = np.array([1, 2.2, 33.33, 444.444])
    np.arctan2(y, 1.0)             # against a scalar
    np.arctan2(1.0, y)             # the other way
    np.arctan2(y, y)               # against another array

Composing universal functions
-----------------------------

Universal functions compose like any other array
expression. A few patterns that come up on the camera:

**Gamma correction (in float space)**::

    gamma = 0.5
    out = 255.0 * (frame / 255.0) ** gamma

**A simple low-pass IIR** (``alpha`` close to ``1.0``
means slow update)::

    alpha = 0.95
    filtered = alpha * filtered + (1.0 - alpha) * sample

**Sigmoid**::

    sigmoid = 1.0 / (1.0 + np.exp(-x))

**Power spectrum in dB**::

    spectrum = 20.0 * np.log10(np.abs(real) + 1e-12)

In a loop, rewrite each expression to use ``out=`` and
in-place operators so no temporary is allocated per
iteration. :doc:`../performance` covers the rewrite.

np.vectorize
------------

A regular Python function can be promoted to a
ufunc-shaped one by :func:`~ulab.numpy.vectorize`. The
resulting callable accepts scalars, iterables, or
:class:`~ulab.numpy.ndarray`\ s::

    def f(x):
        return x * x

    vf = np.vectorize(f)

    vf(44.0)                          # array([1936.0])
    vf(np.array([1, 2, 3, 4]))        # array([1.0, 4.0, 9.0, 16.0])
    vf([2, 3, 4])                     # array([4.0, 9.0, 16.0])

By default the result dtype is ``float``. ``otypes=``
overrides it::

    vf_u8 = np.vectorize(f, otypes=np.uint8)
    vf_u8([1, 2, 3, 4])
    # array([1, 4, 9, 16], dtype=uint8)

The Python function must take a single argument and
return a single number.

:func:`~ulab.numpy.vectorize` is mostly *syntactic* --
the wrapped Python function still has to run once per
element, so most of the per-element interpreter cost
that a true ufunc avoids is back. Expect a modest
30%-50% speedup over a list comprehension, not the 30x
of a true universal function. The right tool when one
function has to work on scalars, lists, *and* arrays
under the same name -- not when raw speed is the goal.

For the full call signatures of every universal function
listed above, see :doc:`/library/omv.ulab.numpy`.
