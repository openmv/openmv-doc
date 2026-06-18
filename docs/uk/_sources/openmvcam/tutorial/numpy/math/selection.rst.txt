Selection and rearrangement
===========================

Reductions collapsed an array down to a scalar or a
lower-rank result. Selection covers the operations that
pick *which* elements survive and *where* they end up:
conditional choice, clipping, sorting, looking up
indices, reordering along an axis.

Conditional choice
------------------

:func:`~numpy.where` returns an array that takes
elements from ``x`` where the condition is truthy and
from ``y`` otherwise. The three operands broadcast
together::

    a = np.array([1, 2, 3, 4, 5], dtype=np.float)
    np.where(a < 3, a, 0.0)
    # array([1.0, 2.0, 0.0, 0.0, 0.0])

This is the right tool for an "if/else per element"
without writing a Python loop.

:func:`~numpy.clip` is shorthand for
``maximum(lo, minimum(a, hi))`` -- saturate the values to
a range::

    np.clip(a, 2.0, 4.0)
    # array([2.0, 2.0, 3.0, 4.0, 4.0])

:func:`~numpy.maximum` and
:func:`~numpy.minimum` take two operands and return
the element-wise larger / smaller::

    np.maximum(a, 3.0)
    np.minimum(a, np.array([5, 4, 3, 2, 1]))

Finding indices
---------------

:func:`~numpy.nonzero` returns the coordinates of every
non-zero element, split into one index array per
dimension. For a 2-D input the result is a tuple of two
arrays: the first holds the row indices, the second
holds the column indices. Pairing them column-wise
gives the ``(row, col)`` of each non-zero position::

    m = np.array([[0, 2, 0],
                  [3, 0, 0]], dtype=np.float)
    np.nonzero(m)
    # (array([0, 1], dtype=uint16), array([1, 0], dtype=uint16))

The non-zero entries in ``m`` are ``m[0, 1] = 2`` and
``m[1, 0] = 3``. The first returned array ``[0, 1]``
gives their row indices; the second ``[1, 0]`` gives
their column indices. Reading the two arrays side by
side recovers the positions ``(0, 1)`` and ``(1, 0)``.

Two reductions also produce indices:

* :func:`~numpy.argmin` /
  :func:`~numpy.argmax` -- index of the smallest /
  largest element.
* :func:`~numpy.argsort` -- an integer array that
  would sort the input along the given axis (defaults
  to the last)::

      a = np.array([40, 10, 30, 20], dtype=np.uint8)
      idx = np.argsort(a)             # array([1, 3, 2, 0], dtype=uint16)
      a[idx]                          # array([10, 20, 30, 40])

  ``argsort`` always returns ``uint16``; the array
  being sorted must therefore have no more than 65,535
  elements on the sorted axis.

:func:`~numpy.bincount` counts occurrences of each
non-negative integer in a 1-D ``uint8`` / ``uint16``
input::

    histogram = np.bincount(np.array([0, 1, 1, 2, 2, 2], dtype=np.uint8))
    # array([1, 2, 3], dtype=uint16)

Useful for building histograms of small-integer pixel
values without writing a Python loop.

Sorting and reordering
----------------------

:func:`~numpy.sort` returns a sorted copy of the array
along the given axis (the last by default). Use
:meth:`~numpy.ndarray.sort` on the array directly
for an in-place version::

    np.sort(np.array([3, 1, 2], dtype=np.float))
    # array([1.0, 2.0, 3.0])

:func:`~numpy.flip` reverses the order along the given
axis (every axis when no ``axis`` is passed)::

    np.flip(np.array([1, 2, 3, 4]))
    # array([4, 3, 2, 1])

:func:`~numpy.roll` cyclically shifts elements by the
given count. Useful for implementing a ring-buffer-style
shift register::

    np.roll(np.array([1, 2, 3, 4]), 1)
    # array([4, 1, 2, 3])

:func:`~numpy.take` is the explicit form of fancy
indexing -- pick elements at arbitrary indices::

    a = np.array([10, 20, 30, 40, 50], dtype=np.uint8)
    np.take(a, [0, 2, 4])
    # array([10, 30, 50], dtype=uint8)

Filtering and structural edits
------------------------------

:func:`~numpy.compress` is the explicit form of boolean
indexing -- return the slices of ``a`` selected by the
boolean condition::

    a = np.array([10, 20, 30, 40], dtype=np.uint8)
    np.compress(a > 15, a)
    # array([20, 30, 40], dtype=uint8)

:func:`~numpy.delete` returns a copy with the entries
at the given indices removed::

    a = np.array([10, 20, 30, 40, 50], dtype=np.uint8)
    np.delete(a, [1, 3])
    # array([10, 30, 50], dtype=uint8)

:func:`~numpy.diff` returns the n-th discrete forward
difference of the array along an axis. Used to compute
first-order changes between adjacent samples::

    samples = np.array([1, 3, 6, 10, 15], dtype=np.float)
    np.diff(samples)
    # array([2.0, 3.0, 4.0, 5.0])

What each operation costs
-------------------------

Almost every function on this page returns a freshly
allocated array. Two exceptions:

* :meth:`~numpy.ndarray.sort` sorts in place; the
  free function :func:`~numpy.sort` returns a
  sorted copy.
* :func:`~numpy.take` accepts an ``out=`` keyword
  to write into a buffer that already exists.

In a loop that runs many times a second, prefer the
in-place :meth:`~numpy.ndarray.sort` and reuse
pre-allocated buffers everywhere else. Boolean masks
themselves are allocated every time the comparison
runs -- build a mask once and reuse it across operations
rather than rebuilding it inside every iteration.
