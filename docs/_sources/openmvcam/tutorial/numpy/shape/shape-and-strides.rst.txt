Shape and strides
=================

The data inside an :class:`~ulab.numpy.ndarray` is one
packed block of numbers. The descriptor in front of that
block decides how that flat block is read out as a
tensor. Understanding what the descriptor records is
what makes the indexing, slicing, and view machinery on
the following pages feel inevitable rather than
arbitrary.

What the descriptor records
---------------------------

Five values describe how to read the data block as a
tensor::

    a = np.array([[1, 2, 3], [4, 5, 6]], dtype=np.uint8)

    a.ndim       # 2     - number of dimensions
    a.shape      # (2, 3)- length along each dimension
    a.itemsize   # 1     - bytes per element (from dtype)
    a.size       # 6     - total number of elements
    a.strides    # (3, 1)- step pattern through the buffer

The :func:`~ulab.numpy.ndinfo` helper prints all of them
plus the location of the underlying buffer in one call.
Two arrays whose buffer locations match are sharing
memory::

    np.ndinfo(a)
    # class: ndarray
    # shape: (2, 3)
    # strides: (3, 1)
    # itemsize: 1
    # data pointer: 0x...
    # type: uint8

Print truncation
----------------

Printing a large array shows only its first and last
few elements, with ``...`` in the middle, so the IDE
terminal does not fill with thousands of values::

    >>> print(np.arange(1000, dtype=np.uint16))
    array([0, 1, 2, ..., 997, 998, 999], dtype=uint16)

:func:`~ulab.numpy.set_printoptions` overrides the
thresholds when debugging needs the whole buffer::

    np.set_printoptions(threshold=2000)  # print up to 2000 elements in full
    np.set_printoptions(edgeitems=10)    # 10 items at each end, not 3

:func:`~ulab.numpy.get_printoptions` reads the current
settings back as a dict.

Strides explained
-----------------

A *stride* is how many bytes to step in the data block
to move one element along a given axis. For the 2x3
``uint8`` array above, the strides are ``(3, 1)``:
moving down by one row jumps 3 bytes, moving right by
one column jumps 1 byte. That is the same as saying the
rows are stored back to back, left to right::

    memory: [ 1 ][ 2 ][ 3 ][ 4 ][ 5 ][ 6 ]
              ^ row 0          ^ row 1
              <------- 3 bytes ---->

To read ``a[i, j]``, :mod:`numpy` computes
``i * strides[0] + j * strides[1]`` from the start of
the data block and reads ``itemsize`` bytes from there.
The same formula extends to any number of dimensions.

This layout -- rows stored end to end, with the last
axis varying fastest along memory -- is
called *row-major* or *C order*. Every array
:mod:`numpy` allocates on the camera uses this layout;
the Fortran-order option that desktop ``numpy`` offers
appears only as the ``order='F'`` keyword on
:meth:`~ulab.numpy.ndarray.flatten`.

Row-major has consequences
--------------------------

Two things fall out of "rows stored back to back" that
matter when shaping a buffer on the camera.

**The last axis is contiguous.** Walking ``a[0, 0]`` to
``a[0, 1]`` touches the next byte over. Walking
``a[0, 0]`` to ``a[1, 0]`` jumps across a whole row.

**The last axis is the fast axis for whole-array math.**
:mod:`numpy` on the camera always walks the last axis
innermost, regardless of which axis happens to be
longer. The desktop ``numpy`` library silently reorders
its loops to put the longest axis innermost; the camera
does not, so a layout choice that desktop ``numpy``
would have papered over still costs time here.
``np.sum(m, axis=1)`` collapses the last axis and runs
in the contiguous direction; ``np.sum(m, axis=0)`` does
not. When the application has a choice about how to
lay out a buffer, put the long axis last so operations
along it stay in the inner loop.

If the layout starts out wrong,
:meth:`~ulab.numpy.ndarray.transpose` (or the ``.T``
shortcut) fixes it without copying the data -- it just
swaps the strides::

    a = b.T            # now iterates fast

:doc:`../performance` has the full performance
discussion.

Reshape, transpose, slicing -- descriptor edits
-----------------------------------------------

Any operation that only rewrites the descriptor is free.
``reshape`` swaps a new ``shape`` and ``strides``
across the same data block. ``transpose`` reverses the
strides. ``a[::2]`` doubles a stride. Each returns a
*view* of the same underlying buffer.

Anything that has to walk the data and write a new
buffer is a copy. The detail of which is which is on
:doc:`views-and-copies`; the rule for now is that
descriptor edits are free and data walks are not.

A note about ndim
-----------------

:mod:`numpy` on the camera is built with a maximum
supported ``ndim`` of either 2 or 4, fixed when the cam
was built. The suffix on :data:`ulab.__version__`
(``-2D``, ``-4D``) reports which. Operations that
would produce a higher-rank array raise
:exc:`ValueError`. The vast majority of camera-side
work is 1-D or 2-D, so the limit is rarely an issue.
