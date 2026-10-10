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

When the two operands have shapes ``A`` and ``B``,
:mod:`numpy` works through them in two steps.

1. **Match the ranks.** If one operand has fewer axes
   than the other, :mod:`numpy` virtually pads the front
   of its shape with size-1 axes until both shapes have
   the same number of axes. A 1-D operand of shape
   ``(3,)`` paired with a 2-D operand of shape
   ``(2, 3)`` becomes ``(1, 3)`` against ``(2, 3)``.

2. **Check each axis.** Walking the now equal-length
   shapes axis by axis, each pair of sizes must satisfy
   one of two conditions: the sizes are equal, or one
   of them is 1. A size-1 axis is virtually stretched
   to the other side's size for the operation. The pair
   ``(1, 3)`` against ``(2, 3)`` is compatible because
   the first axis has a 1 (stretches to 2) and the
   second axis matches (3 == 3); the result has shape
   ``(2, 3)``.

If any axis pair satisfies neither condition, the
shapes are incompatible and the operator raises
:exc:`ValueError`.

Examples
--------

**Scalar against any array.** The scalar acts like shape
``(1,)`` and stretches to anything::

    a = np.array([[1, 2, 3], [4, 5, 6]], dtype=np.float)
    a + 10                 # (2, 3) + scalar -> (2, 3)

**1-D vector across a 2-D matrix.** Rule 1 prepends a
size-1 axis to make ``(3,)`` into ``(1, 3)``; rule 2
then stretches that row down each column of ``a``::

    row = np.array([100, 200, 300], dtype=np.float)
    a + row                # (2, 3) + (3,) -> (2, 3)

**Two 1-D arrays of equal length** add element-wise --
no broadcasting needed::

    np.arange(4) + np.arange(4)

**Column vector against a row vector** produces a 2-D
"outer" shape: ``(4, 1)`` paired with ``(3,)`` becomes
``(4, 1)`` against ``(1, 3)`` after the rank prepend,
and rule 2 stretches each operand along its size-1
axis::

    x = np.array([1, 2, 3, 4]).reshape((4, 1))     # column
    y = np.array([10, 20, 30])                      # row
    x + y                                           # (4, 3) matrix

The same shape rules apply to any two-argument ufunc,
:func:`~numpy.arctan2` included::

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
large intermediates.

When broadcasting goes wrong
----------------------------

The classic failure is two shapes where neither has a
size-1 axis to stretch and the sizes disagree --
``(3, 4)`` against ``(4, 3)``, for example. Rule 2
cannot match a 3 against a 4, so :mod:`numpy` raises
:exc:`ValueError`.

A subtler problem is a broadcast that succeeds, but
not the way the application meant. ``(5,)`` against
``(5, 1)`` is the canonical case: the rank prepend
turns the ``(5,)`` into ``(1, 5)``, which broadcasts
against ``(5, 1)`` to produce a ``(5, 5)`` matrix --
the outer combination of the two vectors, not the
length-5 element-wise result the application probably
wanted. When in doubt, print
:attr:`~numpy.ndarray.shape` on both sides and step
through the rules before reaching for
:meth:`~numpy.ndarray.reshape` or
:meth:`~numpy.ndarray.transpose`.
