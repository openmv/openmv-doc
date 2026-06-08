Operators
=========

The first kind of math :mod:`numpy` runs on an
:class:`~numpy.ndarray` is the standard Python
operators. Arithmetic, comparison, and bit-wise
operators all work *element-wise* -- each operator walks
the array (or both arrays) once from start to finish
inside a single library call, much faster than the
equivalent Python ``for`` loop.

Arithmetic
----------

``+``, ``-``, ``*``, ``/``, ``//``, ``%``, ``**`` all
work between two arrays of compatible shape, or between
an array and a scalar::

    a = np.array([1, 2, 3, 4], dtype=np.float)
    b = np.array([10, 20, 30, 40], dtype=np.float)

    print(a + b)        # array([11.0, 22.0, 33.0, 44.0])
    print(a * 2)        # array([2.0, 4.0, 6.0, 8.0])
    print(b - a)        # array([9.0, 18.0, 27.0, 36.0])
    print(b / a)        # array([10.0, 10.0, 10.0, 10.0])

The result dtype follows the upcasting rules described
on :doc:`../basics/dtypes`. Integer arrays wrap on
overflow; cast to a wider dtype before the operation when
that matters.

The matrix-multiplication operator ``@`` is **not**
implemented. Use :func:`~numpy.dot` for matrix /
vector products.

In-place forms
~~~~~~~~~~~~~~

Every arithmetic operator has an in-place form -- ``+=``,
``-=``, ``*=``, ``/=``, ``%=``, ``**=``. The in-place
form writes through the existing buffer instead of
allocating a temporary::

    b = b + 1            # allocates a temporary the size of b
    b += 1               # no temporary

On a microcontroller the second form is essentially
mandatory for any hot loop.

Bitwise
-------

The bit-wise operators ``&``, ``|``, ``^`` work
element-wise on integer arrays. Applied to a ``float``
or ``complex`` array they raise :exc:`TypeError`::

    a = np.array([0b1100, 0b1010], dtype=np.uint8)
    b = np.array([0b1010, 0b1100], dtype=np.uint8)
    print(a & b)        # array([8, 8], dtype=uint8)
    print(a | b)        # array([14, 14], dtype=uint8)
    print(a ^ b)        # array([6, 6], dtype=uint8)

The unary ``~`` performs bit-wise NOT on an integer
array.

The shift operators ``<<`` and ``>>`` are **not** wired
up at the Python operator level. The function forms
:func:`~numpy.left_shift` and
:func:`~numpy.right_shift` work::

    np.left_shift(a, 2)
    np.right_shift(b, 1)

Comparison
----------

``==``, ``!=``, ``<``, ``<=``, ``>``, ``>=`` all return a
``bool`` :class:`~numpy.ndarray` of the broadcast
shape::

    a = np.array([1, 2, 3, 4, 5], dtype=np.uint8)
    print(a < 3)
    # array([True, True, False, False, False], dtype=bool)

The boolean result is exactly what
:doc:`indexing <../shape/indexing-and-slicing>` and
:doc:`selection` consume.

The side rule
~~~~~~~~~~~~~

The :class:`~numpy.ndarray` **must** be on the
*left* of a relational operator when comparing to a
scalar. ``a > 2`` works; ``2 < a`` raises :exc:`TypeError`.
For the symmetric form, use the function names::

    np.greater(5, a)        # 5 > a, element-wise
    np.less(5, a)           # 5 < a, element-wise
    np.equal(5, a)          # 5 == a, element-wise
    np.not_equal(5, a)      # 5 != a, element-wise

Unary operators
---------------

* ``+a`` -- returns a copy of the array.
* ``-a`` -- negation. On unsigned dtypes the values wrap
  modulo :math:`2^N`, the same way the binary operators
  do.
* ``abs(a)`` -- element-wise absolute value. On unsigned
  dtypes returns a copy without computation.
* ``~a`` -- bit-wise inversion (integer arrays only).
* ``len(a)`` -- returns the length of the **first** axis,
  matching the Python sequence convention.

What is missing
---------------

The right-hand-side operators for the comparison and
some of the bit-wise operations are not implemented in
the same way the arithmetic operators are. Use the
function forms (above) when an ``ndarray`` would land on
the right.

For the complete list of supported operators and the
upcasting they follow, see
:doc:`/library/omv.ulab.numpy`.
