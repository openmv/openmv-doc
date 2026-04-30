Tips, tricks and broadcasting
=============================

This page collects techniques that help you get the most out of
``ulab`` on a memory-constrained, modestly-clocked microcontroller.
Hardware varies a lot, so always measure on the device you actually
target. The general rules outlined here are useful starting points,
but a particular code snippet that is fast on one MCU may not gain
the same factor on another -- some MCUs have no FPU, others have very
fast caches, and so on.

Use an ndarray when you can
---------------------------

Many ``ulab`` reductions accept either an iterable or an
``ndarray``::

   from ulab import numpy as np

   np.sum([1, 2, 3, 4, 5])               # works, but slow
   np.sum(np.array([1, 2, 3, 4, 5]))     # ~3x faster

Iterables force the interpreter to fetch each Python object, convert
it to a C numeric type, and accumulate it. With an ``ndarray``, the C
type is already known and the inner loop is a tight, type-specialised
``for``. Compared to a *pure-Python* implementation of the same
reduction, the speedup is typically 30-50x.

Counter-tip: if the data only exists as a Python list and you call
the reduction once, do *not* convert to ``ndarray`` first -- the
constructor itself has to walk the list and allocate. The conversion
only pays off when you use the array more than once.

Pick a reasonable dtype
-----------------------

The default ``dtype`` is ``float`` (4 or 8 bytes per element). For
data that is naturally 8-bit or 16-bit (ADC samples, image pixels,
sensor readings) use ``np.uint8``, ``np.int8``, ``np.uint16`` or
``np.int16`` instead. You save 4-8x RAM and the inner loops are
faster.

::

   adc = np.array(adc_samples, dtype=np.uint16)   # not float!

Be aware of upcasting and overflow rules. Operations on two arrays of
the same integer dtype keep that dtype, even when results overflow::

   a = np.array([200, 200], dtype=np.uint8)
   b = np.array([100, 100], dtype=np.uint8)
   print(a + b)             # array([44, 44], dtype=uint8) -- wraps!

If you need a wider intermediate, cast first::

   c = np.array(a, dtype=np.uint16) + b

Broadcasting
------------

Binary operators do not require shape equality -- they *broadcast*.
The rules (which match ``numpy``) are:

1. If the two operands have different rank, virtually prepend axes of
   size 1 to the smaller one until the ranks match.
2. Along each axis, the two sizes must be equal, or one of them must
   be 1. A size-1 axis is virtually stretched to match the other
   side.

If those two rules cannot be satisfied, you get a
``ValueError("operands could not be broadcast together")``.

Add a scalar to every element::

   a = np.array([[1, 2, 3], [4, 5, 6]], dtype=np.float)
   a + 10                 # adds 10 everywhere

Add a row vector to every row of a matrix::

   row = np.array([100, 200, 300], dtype=np.float)
   a + row                # (2, 3) + (3,) -> (2, 3)

Subtract a column mean from each column::

   means = np.array([np.mean(a[:, i]) for i in range(3)])
   a - means

Broadcasting also works through universal functions that accept two
arrays, e.g. ``np.arctan2``::

   y = np.array([1, 2, 3, 4])
   np.arctan2(y, 1.0)
   np.arctan2(1.0, y)
   np.arctan2(y, y)

For more on the internals (how ``ulab`` rewrites strides to make
broadcasting work) see :doc:`programming`.

Comparison-operator side rule
-----------------------------

In ``ulab``, the ``ndarray`` *must* be on the **left** of a relational
operator with a scalar. ``a > 2`` works; ``2 < a`` raises
``TypeError``. If you need the symmetric form, use
``np.less(2, a)`` / ``np.greater(2, a)`` etc.

Beware the axis (memory layout matters)
---------------------------------------

``ulab`` always loops innermost over the *last* axis of an array.
That means an array shaped ``(2, 1000)`` is much faster to iterate
than an array shaped ``(1000, 2)`` holding the same data, because
the long axis lines up with the inner loop. When you have control
over how data is laid out, put the long axis last::

   a = np.array(range(2000)).reshape((2, 1000))    # fast
   b = np.array(range(2000)).reshape((1000, 2))    # slower

In ``numpy`` the longest axis is sometimes called the "fast axis",
and ``numpy`` is allowed to permute its loops to make the longest
axis innermost. ``ulab`` does *not* do this -- the order is fixed by
the strides.

If you find yourself with the wrong layout, ``a.transpose()`` /
``a.T`` is cheap (it only flips strides; no data is copied).

Reduce intermediate arrays
--------------------------

Compound expressions like ``a + b * c`` allocate a *temporary* array
for ``b * c``. On a microcontroller these temporaries cost both
allocation time and memory fragmentation. When a calculation
appears in a hot loop, prefer in-place operators::

   # makes 1 temporary
   b = (a + 1) * 2

   # no temporary
   b = np.array(a)
   b += 1
   b *= 2

The same idea applies to slice assignment. Instead of one big
expression, write out simple sub-assignments that target slices of a
pre-allocated output. The classic example is interpolation by 2 over
a small array::

   # Linear interpolation: place originals at even indices, mid-points
   # at odd indices, with no temporary arrays.
   a = np.array([0, 10, 2, 20, 4], dtype=np.uint8)
   b = np.zeros(2 * len(a) - 1, dtype=np.uint8)

   b[::2]   = a
   b[1::2]  = a[:-1]
   b[1::2] += a[1:]
   # divide by 2 if you want the actual average

The compound version, ``b[1::2] = (a[:-1] + a[1:]) // 2``, would
allocate a temporary the size of ``a[:-1] + a[1:]`` plus another for
the division. The four-instruction version above touches only the
two views ``a[:-1]`` and ``a[1:]``, which exist anyway.

Up-scaling images with slice assignment
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The same idea generalises to two dimensions, which makes it useful
for upscaling small images (think 8x8 thermal cameras for a
human-friendly preview). To double the resolution, place originals
on even (row, column) cells and fill in averages on odd cells::

   # a is, say, 8x8; b is 15x15
   b = np.zeros((15, 15), dtype=np.uint8)

   # rows: even-row destinations get the originals
   b[::2, ::2] = a
   # rows: odd-row destinations get vertical averages
   b[1::2, ::2]  = a[:-1, :]
   b[1::2, ::2] += a[1:, :]
   b[1::2, ::2] //= 2
   # columns: odd-column destinations get horizontal averages
   b[:, 1::2]  = b[:, :-1:2]
   b[:, 1::2] += b[:, 2::2]
   b[:, 1::2] //= 2

Going larger than 2x is the same pattern with more assignments.

Note that this technique stays inside a small dtype (``uint8``).
Doing the same with floats would burn 8x more RAM for no benefit if
all you want is a smoothed preview.

Reuse buffers across iterations
-------------------------------

Several APIs accept a pre-allocated buffer:

* :py:meth:`image.Image.to_ndarray` accepts ``buffer=`` so the
  conversion does not allocate every frame.
* The :py:class:`image.Image` constructor accepts ``buffer=`` for
  the same reason.
* ``np.frombuffer`` *aliases* an existing buffer, never copying.
* Universal functions (``np.exp``, ``np.sin``, ``np.sqrt``, ...)
  accept ``out=`` -- write into a pre-allocated float array.
* ``utils.spectrogram`` accepts ``out=`` and ``scratchpad=``.

In a hot loop, allocate once and reuse::

   import csi
   from ulab import numpy as np

   csi0 = csi.CSI()
   csi0.reset()
   csi0.pixformat(csi.GRAYSCALE)
   csi0.framesize(csi.QVGA)
   csi0.snapshot(time=2000)

   buf = bytearray(320 * 240)
   while True:
       img = csi0.snapshot()
       a   = img.to_ndarray('B', buffer=buf)   # no per-frame alloc
       # ... process a ...

Watch out for boolean masks in tight loops
------------------------------------------

Boolean indexing and ``np.where`` necessarily produce a new array on
each call (the size of the result depends on the data, so they
cannot reuse a pre-allocated buffer). If you do this many times in a
row, the heap fills up with throwaway boolean arrays. Periodically
calling ``gc.collect()`` keeps fragmentation under control::

   import gc
   for _ in range(1000):
       mask = a < threshold
       _ = a[mask]
       if _ % 100 == 0:
           gc.collect()

The same caveat applies to compound boolean expressions like
``(a > lo) & (a < hi)`` -- each operator allocates a new bool array.

Use views, not copies, where you can
------------------------------------

Slicing produces a view that shares data with the source -- no
allocation, no copy. ``np.frombuffer``, ``a.reshape((...))``,
``a[::2]``, and column / row indexing all return views when
possible. Reach for ``.copy()`` only when you genuinely need an
independent buffer.

You can confirm two arrays share data by comparing the *data
pointer* line printed by ``np.ndinfo``::

   a = np.arange(10, dtype=np.uint8)
   np.ndinfo(a)                  # data pointer: 0x...
   np.ndinfo(a[::2])             # same data pointer

Build the result, do not append to it
-------------------------------------

``ndarray`` has no ``append`` -- and that is on purpose. Growing an
array is implemented (in CPython ``numpy``) by allocating a new,
larger buffer and copying. On a microcontroller you can almost
always pre-allocate the final size and *fill* it::

   out = np.zeros(N, dtype=np.float)
   for i in range(N):
       out[i] = some_calculation(i)

If you genuinely don't know ``N`` in advance, write to a Python
``list`` and convert once at the end with ``np.array(list)``.

Where to go next
----------------

* :doc:`programming` -- broadcasting internals and more advanced
  patterns.
* :doc:`utils` -- buffer conversions and ``spectrogram``.
* :doc:`/library/omv.ulab.numpy` -- ``numpy`` API reference.
* :doc:`/library/omv.ulab.scipy` -- ``scipy`` API reference for
  filters, optimisation, integration and special functions.
* `numpy broadcasting basics
  <https://numpy.org/doc/stable/user/basics.broadcasting.html>`_ --
  formal description of the broadcasting rules ``ulab`` follows.
