Universal functions
===================

A *universal function* (ufunc) is a vectorised mathematical function
that applies element-wise to an array. ``ulab`` ships with most of
the common ones, and the ones you'd reach for first all live in the
``numpy`` namespace.

The full list of universal functions in ``ulab`` is:

   ``acos``, ``acosh``, ``arctan2``, ``around``, ``asin``, ``asinh``,
   ``atan``, ``atanh``, ``ceil``, ``cos``, ``cosh``, ``degrees``,
   ``exp``, ``expm1``, ``floor``, ``log``, ``log10``, ``log2``,
   ``radians``, ``sin``, ``sinc``, ``sinh``, ``sqrt``, ``tan``,
   ``tanh``.

If your firmware was built with complex support, ``exp`` and
``sqrt`` can also operate on complex arrays.

These functions accept a scalar, any scalar-valued iterable (list,
tuple, ``range``), or an ``ndarray``. They always return an
``ndarray`` of dtype ``float``::

   from ulab import numpy as np

   print(np.exp(2.0))                    # array([7.389...], dtype=float64)
   print(np.sin(range(4)))               # 1-D float ndarray
   print(np.sqrt([1, 4, 9, 16]))         # 1-D float ndarray
   a = np.arange(9).reshape((3, 3))
   print(np.exp(a))                      # 3x3 float ndarray

Universal functions in 1-line examples::

   x = np.linspace(-1, 1, num=10)
   np.sin(x)
   np.cos(x)
   np.exp(x)
   np.log(np.abs(x) + 1e-9)
   np.sqrt(np.abs(x))
   np.tanh(x)
   np.degrees(x)            # radians -> degrees
   np.radians(x * 180.0)    # degrees -> radians

The ``out=`` keyword: avoiding allocation
-----------------------------------------

Each call to a universal function allocates a fresh result array. In
a hot loop on a microcontroller, those allocations add up and
fragment the heap. To avoid this, pass ``out=``: a pre-allocated
float ``ndarray`` of the same size as the input. The result is
written into that buffer instead of a fresh one::

   x = np.linspace(0, 2 * np.pi, num=256)
   y = np.zeros(256)        # allocate ONCE

   for _ in range(many_iterations):
       np.sin(x, out=y)
       # ... use y ...

If ``out`` is the wrong dtype or the wrong size, the function raises
an exception.

Two-argument functions: ``arctan2``
-----------------------------------

``arctan2`` takes two arrays (or scalars) and returns the
quadrant-aware arctangent. It supports broadcasting::

   y = np.array([1, 2.2, 33.33, 444.444])
   np.arctan2(y, 1.0)           # array of arctangents, shape (4,)
   np.arctan2(1.0, y)           # symmetric form
   np.arctan2(y, y)             # element-wise arctan2

Rounding: ``around``
--------------------

``np.around(a, decimals=0)`` rounds an ``ndarray`` to the given
number of decimal places. The first argument *must* be an
``ndarray``::

   a = np.array([1.0, 2.2, 33.33, 444.444])
   np.around(a)                 # array([1.0, 2.0, 33.0, 444.0])
   np.around(a, decimals=1)     # array([1.0, 2.2, 33.3, 444.4])
   np.around(a, decimals=-1)    # array([0.0, 0.0, 30.0, 440.0])

The result is always a float array.

Performance: prefer ndarray inputs
----------------------------------

Universal functions accept generic iterables, but the conversion to
``ndarray`` happens internally and costs time on every call. As a
rule of thumb:

* Calling a universal function on an ``ndarray`` is roughly 3x faster
  than calling it on the equivalent ``list``.
* Calling it on an ``ndarray`` is roughly 30x faster than the
  equivalent ``[math.exp(i) for i in iterable]`` Python expression.

Vectorising your own Python functions
-------------------------------------

You can promote a regular Python function to a "vectorised" function
that accepts scalars, iterables and ``ndarray``\ s by passing it to
``np.vectorize``::

   from ulab import numpy as np

   def f(x):
       return x * x

   vf = np.vectorize(f)

   vf(44.0)                         # array([1936.0])
   vf(np.array([1, 2, 3, 4]))       # array([1.0, 4.0, 9.0, 16.0])
   vf([2, 3, 4])                    # array([4.0, 9.0, 16.0])

By default, ``vectorize`` returns a float array. You can override
that with ``otypes=``::

   vf_u8 = np.vectorize(f, otypes=np.uint8)
   vf_u8([1, 2, 3, 4])              # array([1, 4, 9, 16], dtype=uint8)

The Python function must take a single argument and return a single
number. ``otypes`` cannot be used to coerce float results to ints --
if the function returns a float and you ask for an integer dtype, a
``TypeError`` is raised at call time.

Note that "vectorise" here is mostly *syntactic*: each element still
makes a Python-level call back into your function, so the C inner
loop has to evaluate Python bytecode for every element. Expect a
modest 30%-50% speedup over a list comprehension, not the 30x of a
true universal function. ``vectorize`` is most useful when you want
the *uniform call signature* (so your function works on scalars,
lists and arrays), and when there is no equivalent expression in
``ulab`` itself.

When in doubt, prefer expressing your math in terms of existing
universal functions and operators -- those run entirely in C and are
much faster than ``vectorize``.

Combining universal functions
-----------------------------

Universal functions compose like any other ``ndarray`` expression,
which makes a lot of formulas one-liners. Some recipes that come up
often on the camera:

Gamma correction (in float space)::

   gamma = 0.5
   out = 255.0 * (frame / 255.0) ** gamma

Magnitude of a complex spectrum (real / imag stored separately when
the firmware does not have complex support)::

   real, imag = np.fft.fft(signal)
   magnitude = np.sqrt(real * real + imag * imag)

A simple low-pass IIR (``alpha`` close to 1.0 means slow update)::

   alpha = 0.95
   filtered = alpha * filtered + (1.0 - alpha) * sample

Sigmoid (handy for very small ML stuff)::

   sigmoid = 1.0 / (1.0 + np.exp(-x))

Power spectrum in dB::

   spectrum = np.log(np.abs(real) + 1e-12) * 20.0 / np.log(10)
   # or just: spectrum = np.log10(np.abs(real) + 1e-12) * 20.0

API reference
-------------

For the full call signatures of every universal function, see
:doc:`/library/omv.ulab.numpy`.
