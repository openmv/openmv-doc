Indexing and slicing
====================

An :class:`~numpy.ndarray` is addressed four ways:
single indices, slices, boolean masks, and the
assignment forms of each.

Single elements
---------------

Square-bracket indexing returns the value at the given
position::

    a = np.arange(10, dtype=np.uint8)
    print(a[0], a[-1])      # 0 9
    print(a[1], a[-2])      # 1 8

Negative indices count from the end, the same as for a
Python :class:`list`. An out-of-range index raises
:exc:`IndexError`.

For higher-rank arrays, every axis takes an index. The
indices go inside one set of brackets, separated by
commas::

    m = np.arange(9, dtype=np.uint8).reshape((3, 3))
    print(m[1, 1])          # 4
    print(m[2, 0])          # 6

When fewer indices than axes are supplied, the unindexed
axes are left intact. The result is a *reduced-rank view*
of the source::

    print(m[0])             # the first row, as a 1-D view of m

Slices
------

A slice ``start:stop:step`` returns a *view* of the
array. The view shares the underlying data buffer with
the source; writing through the view writes to the
source::

    a = np.arange(10, dtype=np.uint8)
    v = a[::2]              # array([0, 2, 4, 6, 8], dtype=uint8)
    v[0] = 99
    print(a)
    # array([99, 1, 2, 3, 4, 5, 6, 7, 8, 9], dtype=uint8)

When an independent buffer is needed,
:meth:`~numpy.ndarray.copy` produces one explicitly.

Slicing extends naturally to higher dimensions. Each
axis takes its own slice::

    m = np.array([[1, 2, 3],
                  [4, 5, 6],
                  [7, 8, 9]], dtype=np.uint8)

    m[0]            # first row
    m[0, :2]        # first two elements of row 0
    m[:, 0]         # column 0 (still 2-D in ulab)
    m[-1]           # last row
    m[::2, ::2]     # every other row, every other column

Mixing an integer (single index, drops the axis) and a
slice (keeps the axis) is allowed and is how
single-row / single-column access is normally written.

Boolean masks
-------------

A boolean array of the same shape as the source selects
elements where the mask is :data:`True`. Boolean indexing
currently works on 1-D arrays; higher-rank inputs raise
:exc:`NotImplementedError`::

    a = np.arange(9, dtype=np.float)
    mask = a < 5
    print(a[mask])

Output::

    array([0.0, 1.0, 2.0, 3.0, 4.0], dtype=float)

The mask is an ordinary ``bool``
:class:`~numpy.ndarray`, so any expression that
yields one works::

    b = np.array([4, 4, 4, 3, 3, 3, 13, 13, 13], dtype=np.uint8)
    a = np.arange(9, dtype=np.uint8)
    print(a[a * a > np.sin(b) * 100.0])

Boolean indexing returns a *copy*. The selected
elements lie at whatever positions the mask is
``True`` -- not at a regular stride through the source
-- so there is no descriptor a view could use to address
them, and the result is materialised into its own
buffer.

Integer-array indexing
----------------------

Passing a list or array of indices in brackets picks
those elements out in one step::

    a = np.array([10, 20, 30, 40, 50], dtype=np.uint8)
    a[[0, 2, 4]]
    # array([10, 30, 50], dtype=uint8)

The result is a *copy*; the picked elements no longer
share storage with the source. The same form works on
the left of an assignment::

    a[[0, 2, 4]] = 0
    # array([0, 20, 0, 40, 0], dtype=uint8)

:func:`~numpy.take` (covered on
:doc:`../math/selection`) is the function form of the
same operation and accepts an ``out=`` keyword for
allocation-free use in a streaming loop.

Slice assignment
----------------

Slices and masks appear on the *left* of an assignment as
well as the right. The right-hand side may be a scalar,
another array, or a view::

    m = np.zeros((3, 3), dtype=np.uint8)
    m[0]      = 1            # whole row 0 set to 1
    m[:, 2]   = 3            # whole column 2 set to 3
    m[1, 1:3] = [7, 8]       # row 1, columns 1 and 2

Boolean masks on the left replace the elements that
satisfy the condition::

    a = np.arange(9, dtype=np.uint8)
    a[a < 3] = 99
    # array([99, 99, 99, 3, 4, 5, 6, 7, 8], dtype=uint8)

    a = np.arange(9, dtype=np.uint8)
    b = np.array(range(9)) + 12
    a[b < 15] = b[b < 15]
    # array([12, 13, 14, 3, 4, 5, 6, 7, 8], dtype=uint8)

Why slice assignment matters on a camera
----------------------------------------

Slice assignment writes through an array that already
exists. No new array is allocated. That is the
difference between::

    out = a + b              # makes a new array the size of a
    out = out * 2            # makes another new array

and::

    out[:] = a               # writes into the existing out
    out   += b               # in place
    out   *= 2               # in place

The first version asks the cam for two fresh arrays
worth of RAM; the second version asks for nothing. On a
microcontroller with limited RAM that difference is
often the difference between a script that runs
comfortably and one that runs out of memory.

:doc:`../performance` covers the pattern in detail. The
important rule for now is that slice assignment, the
in-place arithmetic operators (``+=``, ``*=``, ...), and
the ``out=`` keyword on universal functions are the
three tools that make allocation-free updates possible.
