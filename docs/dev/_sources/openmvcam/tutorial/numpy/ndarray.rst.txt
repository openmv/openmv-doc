Working with ndarrays
=====================

The ``ndarray`` is the type that holds numerical data in ``ulab``.
Think of it as a typed, contiguous, n-dimensional buffer with a small
header that describes its shape, strides and element type. This page
walks through the most important things you can do with one.

Anatomy of an ndarray
---------------------

Internally, an ``ndarray`` is a small header followed by a pointer to
a contiguous block of data. The header records:

* ``dtype`` -- the element type;
* ``itemsize`` -- the number of bytes each element occupies;
* ``ndim`` -- the number of dimensions (rank);
* ``shape`` -- a tuple, the length along each axis;
* ``strides`` -- bytes to move along each axis;
* a ``len`` and a pointer to the data buffer.

This is the same memory layout as CPython ``numpy``. Two important
practical consequences:

* Operations like ``reshape``, ``transpose`` and slicing only
  manipulate the header (a handful of bytes), not the data buffer.
  They are essentially free.
* The data is binary and packed, so an ``ndarray`` of ``uint8`` is 8
  times smaller than the equivalent list of Python ``int``.

For a quick textual dump including the data pointer, call
``np.ndinfo(a)``::

   from ulab import numpy as np

   a = np.array(range(5), dtype=np.float)
   np.ndinfo(a)
   # class: ndarray
   # shape: (5,)
   # strides: (8,)
   # itemsize: 8
   # data pointer: 0x...
   # type: float

The data-pointer line is especially useful when you want to confirm
that two arrays share data (a *view*, see below).

Creating arrays
---------------

From iterables
~~~~~~~~~~~~~~

Pass a list (or any iterable) to ``np.array``::

   from ulab import numpy as np

   a = np.array([1, 2, 3, 4, 5, 6])             # 1-D, dtype=float
   b = np.array([1, 2, 3, 4], dtype=np.uint8)   # 1-D, dtype=uint8

   m = np.array([[1, 2, 3],
                 [4, 5, 6]], dtype=np.int16)    # 2-D, shape (2, 3)

If the inner iterables have different lengths, ``ValueError`` is
raised. Mixed iterable types (``range`` + ``list``, etc.) are fine.

From other arrays
~~~~~~~~~~~~~~~~~

Passing one ``ndarray`` to ``np.array`` makes a copy. If the source
and destination dtypes match, the copy is fast (a straight
``memcpy``). If they differ, the elements are converted::

   a = np.array(range(5), dtype=np.uint8)
   b = np.array(a)                     # converted to float (default)
   c = np.array(a, dtype=np.uint8)     # raw copy, stays uint8

Note that the default ``dtype`` of ``np.array`` is always ``float``,
so re-wrapping an integer array without specifying ``dtype=`` always
incurs an iteration and conversion. When performance matters, pass
``dtype=`` explicitly.

Helper constructors
~~~~~~~~~~~~~~~~~~~

These mirror their CPython ``numpy`` equivalents::

   np.zeros((4, 4))
   np.ones(8, dtype=np.uint8)
   np.full((2, 3), 7, dtype=np.int16)
   np.eye(4)
   np.eye(4, M=6, k=-1, dtype=np.int16)
   np.arange(0, 10, 0.5)
   np.linspace(0, 1, num=11)
   np.logspace(0, 3, num=4)            # 1, 10, 100, 1000
   np.diag([1, 2, 3])
   np.empty((3, 3))                    # uninitialised (alias for zeros)

``np.frombuffer`` is especially useful on the camera. It wraps an
existing ``bytes``-like buffer as a typed array *without copying*,
and accepts ``offset=`` and ``count=``::

   buf = b'\x01\x02\x03\x04\x05\x06\x07\x08'
   v = np.frombuffer(buf, dtype=np.uint16)
   # array([513, 1027, 1541, 2055], dtype=uint16) on a little-endian MCU

   v2 = np.frombuffer(buf, dtype=np.uint8, offset=2, count=3)
   # array([3, 4, 5], dtype=uint8)

If the peripheral that produced the buffer uses a different
endianness from the microcontroller, use ``a.byteswap()`` to flip
each multi-byte element. ``a.byteswap()`` returns a new array;
``a.byteswap(inplace=True)`` modifies in place::

   a = np.frombuffer(buf, dtype=np.uint16)
   b = a.byteswap()

Inspecting arrays
-----------------

Each array has the usual ``numpy``-style properties::

   a = np.array([[1, 2, 3], [4, 5, 6]], dtype=np.uint8)

   a.shape       # (2, 3)
   a.size        # 6  -- number of elements
   a.itemsize    # 1  -- bytes per element
   a.dtype       # dtype('uint8')
   a.strides     # (3, 1) -- bytes to step along each axis
   len(a)        # 2 -- always the length of the FIRST axis

You can reshape an array by assigning a new shape tuple to ``.shape``,
which is a shorthand for ``a.reshape((...))``::

   a = np.array(range(9))
   a.shape = (3, 3)

Reshaping
---------

``reshape`` returns a new array (a *view*, when possible) with the
requested shape. The total number of elements must be unchanged::

   a = np.arange(12, dtype=np.uint8)
   m = a.reshape((3, 4))
   print(m)
   # array([[0, 1, 2, 3],
   #        [4, 5, 6, 7],
   #        [8, 9, 10, 11]], dtype=uint8)

Other shape-related methods:

* ``a.flatten()`` -- return a 1-D *copy* of the array. With
  ``order='C'`` (the default) the array is walked along the last axis
  first; with ``order='F'`` the first axis is walked first.
* ``a.flat`` -- iterator that walks every element regardless of rank,
  without allocating a flat copy. Useful for memory-tight loops.
* ``a.transpose()`` (or ``a.T``) -- swap axes. Implemented by flipping
  strides; no data is copied.
* ``a.copy()`` -- explicit deep copy of the data.
* ``a.tolist()`` -- convert to nested Python lists.
* ``a.tobytes()`` -- get the raw underlying bytes (raises
  ``ValueError`` on non-dense, i.e. sliced, arrays).

Example -- ``flatten`` versus ``flat``::

   m = np.array([[1, 2, 3], [4, 5, 6]], dtype=np.int8)

   for x in m.flat:                # walks 1, 2, 3, 4, 5, 6 (no copy)
       print(x)

   flat = m.flatten()              # 1-D copy, dtype preserved
   flat_f = m.flatten(order='F')   # 1, 4, 2, 5, 3, 6

Example -- transpose::

   a = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]], dtype=np.uint8)
   print(a.T)
   # array([[1, 4, 7],
   #        [2, 5, 8],
   #        [3, 6, 9]], dtype=uint8)

Slicing and indexing
--------------------

Single elements
~~~~~~~~~~~~~~~

Square-bracket indexing works like in standard Python and ``numpy``::

   a = np.arange(10, dtype=np.uint8)
   print(a[0], a[-1])      # 0 9
   print(a[1], a[-2])      # 1 8

   m = np.arange(9, dtype=np.uint8).reshape((3, 3))
   print(m[1, 1])          # 4 (single number, fully indexed)
   print(m[0])             # array([[0, 1, 2]], dtype=uint8) (a row)

When the number of indices is smaller than the rank, the result is a
*view* of reduced rank, not a scalar.

Slices (and views)
~~~~~~~~~~~~~~~~~~

A slice ``start:stop:step`` returns a *view* of the original array,
not a copy. The view shares the underlying data buffer -- modifying
the view modifies the source::

   a = np.arange(10, dtype=np.uint8)
   v = a[::2]              # array([0, 2, 4, 6, 8], dtype=uint8)
   v[0] = 99
   print(a)                # array([99, 1, 2, 3, 4, 5, 6, 7, 8, 9])

You can confirm a view shares data with the original by comparing the
``data pointer`` line in ``np.ndinfo``::

   np.ndinfo(a)            # data pointer: 0x...
   np.ndinfo(a[::2])       # SAME data pointer

If you want an independent buffer, call ``.copy()``::

   v = a[::2].copy()

Slicing extends naturally to higher dimensions::

   m = np.array([[1, 2, 3],
                 [4, 5, 6],
                 [7, 8, 9]], dtype=np.uint8)

   m[0]            # first row
   m[0, :2]        # first two elements of row 0
   m[:, 0]         # column 0 (still 2-D in ulab)
   m[-1]           # last row
   m[-1:-3:-1]     # rows in reverse, last two

Boolean indexing
~~~~~~~~~~~~~~~~

A boolean array of the same shape can be used to select elements
(currently only on 1-D arrays; higher-rank inputs raise
``NotImplementedError``)::

   a = np.arange(9, dtype=np.float)
   mask = a < 5
   print(a[mask])          # array([0.0, 1.0, 2.0, 3.0, 4.0])

The mask itself is just a normal ``ndarray`` of dtype ``bool``, so
you can build it with arbitrary expressions, even involving universal
functions::

   b = np.array([4, 4, 4, 3, 3, 3, 13, 13, 13], dtype=np.uint8)
   a = np.arange(9, dtype=np.uint8)
   print(a[a * a > np.sin(b) * 100.0])

Boolean masks also work on the *left* of an assignment, replacing
elements that satisfy the condition::

   a = np.arange(9, dtype=np.uint8)
   a[a < 3] = 99
   # array([99, 99, 99, 3, 4, 5, 6, 7, 8], dtype=uint8)

The right hand side may be a scalar, or another array of matching
size::

   a = np.arange(9, dtype=np.uint8)
   b = np.array(range(9)) + 12
   a[b < 15] = b[b < 15]
   # array([12, 13, 14, 3, 4, 5, 6, 7, 8], dtype=uint8)

Slice assignment
~~~~~~~~~~~~~~~~

You can also assign *into* a slice. The right-hand side may be a
scalar, another array, or a view::

   m = np.zeros((3, 3), dtype=np.uint8)
   m[0]      = 1            # assign to whole row
   m[:, 2]   = 3            # assign to whole column
   m[1, 1:3] = [7, 8]       # assign to a partial row

Slice assignment is one of the most powerful tools for writing
allocation-free numerical code -- see :doc:`tricks` for examples.

dtypes and upcasting
--------------------

``ulab`` supports a smaller set of dtypes than CPython ``numpy``:
``uint8``, ``int8``, ``uint16``, ``int16``, ``float``, ``bool`` and
optionally ``complex``. The default is ``float``.

Two arrays with different dtypes can be operands of the same
operator. The result type follows ``ulab``'s upcasting rules:

==============  ==============  ===============
left            right           result
==============  ==============  ===============
``uint8``       ``int8``        ``int16``
``uint8``       ``int16``       ``int16``
``uint8``       ``uint16``      ``uint16``
``int8``        ``int16``       ``int16``
``int8``        ``uint16``      ``uint16``
``uint16``      ``int16``       ``float``
any             ``float``       ``float``
any             ``complex``     ``complex``
==============  ==============  ===============

The last two rules differ slightly from CPython ``numpy``, where they
would produce ``int32``. ``ulab`` does not have ``int32``, so it
either picks the widest available integer or upcasts to ``float``.

When the operands of an integer-only operator overflow, the result
*wraps* (``ulab`` does not promote to a wider integer)::

   a = np.array([200, 200], dtype=np.uint8)
   b = np.array([100, 100], dtype=np.uint8)
   print(a + b)             # array([44, 44], dtype=uint8) -- wraps!

If you need a wider intermediate, cast first::

   c = np.array(a, dtype=np.uint16) + b

When a binary operator has a Python scalar on the other side, the
scalar is converted to a single-element array of the *smallest*
suitable dtype. ``123`` becomes a ``uint8`` array; ``-1000`` becomes
``int16``; a Python ``float`` becomes a ``float`` array.

Choose the dtype that matches the hardware that produced the data.
For an 8-bit sensor, ``np.uint8`` saves 4-8x RAM compared to the
``float`` default.

Iterating
---------

``ndarray`` instances are iterable. Iterating a 1-D array yields
scalars; iterating an n-D array yields ``(n-1)``-D *views*::

   a = np.array([1, 2, 3, 4, 5], dtype=np.uint8)
   for x in a:
       print(x)        # 1, 2, 3, 4, 5

   m = np.array([[0, 1, 2], [3, 4, 5]], dtype=np.uint8)
   for row in m:
       print(row)      # array([0, 1, 2]) then array([3, 4, 5])

Because the rows yielded by iterating a matrix are *views*, modifying
them modifies the source matrix.

To walk every element of an n-D array as scalars without flattening
it, use ``a.flat``.

Comparison operators
--------------------

The relational operators (``<``, ``>``, ``<=``, ``>=``, ``==``,
``!=``) are vectorised and return a ``bool`` array::

   a = np.array([1, 2, 3, 4, 5, 6, 7, 8], dtype=np.uint8)
   print(a < 5)
   # array([True, True, True, True, False, False, False, False], dtype=bool)

For the symmetric form, use the function names::

   np.greater(5, a)        # 5 > a, element-wise

.. warning::

   The ``ndarray`` *must* be on the left of a relational operator
   when comparing to a scalar. ``a > 2`` works; ``2 < a`` raises
   ``TypeError``. Use ``np.greater``/``np.less``/``np.equal`` if you
   need the symmetric form (also recommended for CircuitPython, where
   the ``==``/``!=`` operators are not overloaded).

Pretty-printing
---------------

By default, arrays longer than 10 elements along the last axis are
abbreviated with ``...``. You can change this globally::

   np.set_printoptions(threshold=200)             # print up to 200 elements in full
   np.set_printoptions(threshold=10, edgeitems=2) # 2 items each side of the ellipsis
   np.get_printoptions()                          # {'threshold': 10, 'edgeitems': 2}

Views vs. copies, in summary
----------------------------

Views are *cheap*: a view is just a new header that points to the
same data buffer as the source. Copies are *expensive*: they
allocate a new buffer and walk through the source.

The following operations return *views*:

* slicing (``a[1:5]``, ``a[::2]``, ``m[:, 0]``);
* single-axis indexing of a higher-dimensional array (``m[0]``);
* iterating an n-D array;
* ``a.reshape(...)`` (when possible);
* ``a.transpose()`` / ``a.T``;
* ``np.frombuffer(buf, ...)``.

The following operations return *copies*:

* ``a.copy()``;
* ``a.flatten()``;
* boolean indexing (``a[mask]``);
* arithmetic (``a + b``, ``a * 2``, ``np.sin(a)``);
* ``np.array(a)`` (always copies).

Reach for ``.copy()`` only when you genuinely need an independent
buffer -- the camera has limited RAM and avoiding a copy is often
the difference between fitting and not fitting.

Where to go next
----------------

* :doc:`universal` -- element-wise math and ``np.vectorize``.
* :doc:`images` -- bridge between ``image.Image`` and ``ndarray``.
* :doc:`tricks` -- broadcasting, performance tips, advanced
  indexing.
* :doc:`programming` -- broadcasting internals and memory-efficient
  patterns.
* :doc:`/library/omv.ulab.numpy` -- the complete reference for the
  ``ndarray`` class (methods, properties, operators) and all numpy
  module-level functions.
