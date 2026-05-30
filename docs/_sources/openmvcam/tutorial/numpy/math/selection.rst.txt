Selection and rearrangement
===========================

Reductions collapsed an array down to a scalar or a
lower-rank result. Selection covers the operations that
pick *which* elements survive and *where* they end up:
conditional choice, clipping, sorting, looking up
indices, reordering along an axis.

Conditional choice
------------------

:func:`~ulab.numpy.where(cond, x, y)` returns an array
that takes elements from ``x`` where ``cond`` is truthy
and from ``y`` otherwise. All three operands broadcast
together::

    a = np.array([1, 2, 3, 4, 5], dtype=np.float)
    np.where(a < 3, a, 0.0)
    # array([1.0, 2.0, 0.0, 0.0, 0.0])

This is the right shape for an "if/else per element"
without writing a Python loop.

:func:`~ulab.numpy.clip(a, lo, hi)` is shorthand for
``maximum(lo, minimum(a, hi))`` -- saturate the values to
a range::

    np.clip(a, 2.0, 4.0)
    # array([2.0, 2.0, 3.0, 4.0, 4.0])

:func:`~ulab.numpy.maximum` and
:func:`~ulab.numpy.minimum` take two operands and return
the element-wise larger / smaller::

    np.maximum(a, 3.0)
    np.minimum(a, np.array([5, 4, 3, 2, 1]))

Finding indices
---------------

:func:`~ulab.numpy.nonzero` returns a tuple of arrays,
one per dimension, holding the indices where the input
is non-zero::

    m = np.array([[0, 2, 0],
                  [3, 0, 0]], dtype=np.float)
    np.nonzero(m)
    # (array([0, 1], dtype=uint16), array([1, 0], dtype=uint16))

Two reductions also produce indices:

* :func:`~ulab.numpy.argmin` /
  :func:`~ulab.numpy.argmax` -- index of the smallest /
  largest element (covered on :doc:`reductions`).
* :func:`~ulab.numpy.argsort(a, axis=-1)` -- an integer
  array that would sort the input along the given axis::

      a = np.array([40, 10, 30, 20], dtype=np.uint8)
      idx = np.argsort(a)             # array([1, 3, 2, 0], dtype=uint16)
      a[idx]                          # array([10, 20, 30, 40])

  ``argsort`` always returns ``uint16``; the array
  being sorted must therefore have no more than 65 535
  elements on the sorted axis.

:func:`~ulab.numpy.bincount(x)` counts occurrences of each
non-negative integer in a 1-D ``uint8`` / ``uint16``
input::

    histogram = np.bincount(np.array([0, 1, 1, 2, 2, 2], dtype=np.uint8))
    # array([1, 2, 3], dtype=uint16)

Useful for building histograms of small-integer pixel
values without writing a Python loop.

Sorting and reordering
----------------------

:func:`~ulab.numpy.sort(a, axis=-1)` returns a sorted
copy of the array along the given axis. Use
:meth:`~ulab.numpy.ndarray.sort` on the array directly
for an in-place version::

    np.sort(np.array([3, 1, 2], dtype=np.float))
    # array([1.0, 2.0, 3.0])

:func:`~ulab.numpy.flip(a, axis=None)` reverses the
order along ``axis`` (every axis when ``axis`` is
``None``)::

    np.flip(np.array([1, 2, 3, 4]))
    # array([4, 3, 2, 1])

:func:`~ulab.numpy.roll(a, shift, axis=None)` cyclically
shifts elements by ``shift`` positions. Useful for
implementing a ring-buffer-style shift register::

    np.roll(np.array([1, 2, 3, 4]), 1)
    # array([4, 1, 2, 3])

:func:`~ulab.numpy.take(a, indices, axis=None)` is the
explicit form of fancy indexing -- pick elements at
arbitrary indices::

    a = np.array([10, 20, 30, 40, 50], dtype=np.uint8)
    np.take(a, [0, 2, 4])
    # array([10, 30, 50], dtype=uint8)

Filtering and structural edits
------------------------------

:func:`~ulab.numpy.compress(cond, a, axis=None)` is the
explicit form of boolean indexing -- return the slices
of ``a`` selected by the boolean ``cond``::

    a = np.array([10, 20, 30, 40], dtype=np.uint8)
    np.compress(a > 15, a)
    # array([20, 30, 40], dtype=uint8)

:func:`~ulab.numpy.delete(a, indices, axis=None)` returns
a copy with the entries at ``indices`` removed.

:func:`~ulab.numpy.diff(a, n=1, axis=-1)` returns the
n-th discrete forward difference of the array along an
axis. Used to compute first-order changes between
adjacent samples::

    samples = np.array([1, 3, 6, 10, 15], dtype=np.float)
    np.diff(samples)
    # array([2.0, 3.0, 4.0, 5.0])

What each operation costs
-------------------------

Almost every function on this page returns a freshly
allocated array. Two exceptions:

* :meth:`~ulab.numpy.ndarray.sort` sorts in place; the
  free function :func:`~ulab.numpy.sort` returns a
  sorted copy.
* :func:`~ulab.numpy.take` accepts an ``out=`` keyword
  to write into a buffer that already exists.

In a loop that runs many times a second, prefer the
in-place :meth:`sort` and reuse pre-allocated buffers
everywhere else. Boolean masks themselves are allocated
every time the comparison runs -- build a mask once and
reuse it across operations rather than rebuilding it
inside every iteration. :doc:`../performance` covers the
broader allocation rules.
