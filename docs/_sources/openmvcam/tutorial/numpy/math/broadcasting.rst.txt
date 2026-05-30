Broadcasting
============

When a binary operator gets two arrays whose shapes do
not match exactly, :mod:`numpy` does not raise -- it
*broadcasts*. Broadcasting is a small set of rules that
decide whether two shapes are compatible and, if they
are, how the smaller one is virtually stretched to match
the larger.

The rules
---------

There are two:

1. If the two operands have different rank, virtually
   prepend size-1 axes to the lower-rank operand until
   both ranks match.
2. Along each axis, the two sizes must be equal *or*
   one of them must be 1. A size-1 axis is virtually
   stretched to match the other side.

If neither rule applies, :mod:`numpy` raises
:exc:`ValueError`::

   ValueError: operands could not be broadcast together

Worked shapes
-------------

**Scalar against any array.** The scalar's shape is
effectively ``(1,)``, which trivially broadcasts::

    a = np.array([[1, 2, 3], [4, 5, 6]], dtype=np.float)
    a + 10                 # (2, 3) + scalar -> (2, 3)

**1-D vector against a 2-D matrix.** After rule 1 the
vector is treated as a 1-row matrix, then rule 2
stretches that row down each column::

    row = np.array([100, 200, 300], dtype=np.float)
    a + row                # (2, 3) + (3,) -> (2, 3)

**Two 1-D arrays of equal length** broadcast
element-wise::

    np.arange(4) + np.arange(4)

**Column vector against a row vector** produces an outer
result -- rule 2 stretches both inputs to a 2-D shape::

    x = np.array([1, 2, 3, 4]).reshape((4, 1))     # column
    y = np.array([10, 20, 30])                      # row
    x + y                                           # (4, 3) matrix

These also work through two-argument ufuncs like
:func:`~ulab.numpy.arctan2`::

    np.arctan2(y, 1.0)
    np.arctan2(y, x)

What broadcasting does *not* allocate
-------------------------------------

The stretch is virtual. :mod:`numpy` walks both
operands together, re-reading the smaller one along
its broadcast axis instead of copying it. The shorter
array's data is never replicated in memory.

The size of the *output* array is what matters for
memory. ``a + row`` allocates an output the shape of
``a``, not the shape of ``a`` plus the shape of
``row``. Long broadcasting chains can still produce
large intermediates -- the :doc:`../performance` page
covers how to keep those allocations down.

When two shapes cannot broadcast
--------------------------------

Mismatches that the rules cannot resolve raise
:exc:`ValueError` at the call site. Two common shapes
that fail:

* ``(3, 4)`` against ``(4, 3)`` -- neither axis is size
  1, and the corresponding sizes disagree.
* ``(5,)`` against ``(5, 1)`` after the rank prepend
  gives ``(1, 5)`` against ``(5, 1)``, which broadcasts
  to ``(5, 5)``. If that is what the application meant,
  fine; if the intent was element-wise on length 5, one
  of the arrays needs reshaping first.

When in doubt, print
:attr:`~ulab.numpy.ndarray.shape` on both sides and step
through the rules above before reaching for
:meth:`~ulab.numpy.ndarray.reshape` or
:meth:`~ulab.numpy.ndarray.transpose`.
