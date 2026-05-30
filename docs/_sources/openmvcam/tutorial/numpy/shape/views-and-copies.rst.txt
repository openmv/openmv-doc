Views and copies
================

A *view* is a second window onto the same data block as
the source. No data is copied; the view holds a fresh
descriptor (its own shape, strides, and dtype) but
shares the buffer. Views are essentially free.

A *copy* asks the cam for a new buffer and walks the
source filling it in. Copies cost both time and RAM.

Most of the shape-shifting methods produce views. Most
of the data-transforming ones produce copies. Knowing
which is which decides whether a hot loop runs the cam
out of RAM.

Reshape
-------

:meth:`~ulab.numpy.ndarray.reshape` returns an array of
the requested shape. The total number of elements must
be unchanged or :exc:`ValueError` is raised::

    a = np.arange(12, dtype=np.uint8)
    m = a.reshape((3, 4))

The result is a view -- ``m`` and ``a`` share data.
Writing through ``m[0, 0] = 99`` changes ``a[0]`` too.

Assigning a new tuple to :attr:`~ulab.numpy.ndarray.shape`
is shorthand for the same operation::

    a = np.arange(9)
    a.shape = (3, 3)

Transpose
---------

:meth:`~ulab.numpy.ndarray.transpose` (or the ``.T``
shortcut) reverses the axes. Implemented by reversing
the strides -- no data is moved::

    m = np.arange(6, dtype=np.uint8).reshape((2, 3))
    t = m.T                  # shape (3, 2), shares m's buffer

A transposed view does not walk the data block
contiguously; that is fine for the arithmetic and
reductions that come later, but it means
:meth:`~ulab.numpy.ndarray.tobytes` raises on a
transposed view -- the bytes are not in the order the
view's shape suggests.

Flatten and flat
----------------

:meth:`~ulab.numpy.ndarray.flatten` returns a 1-D *copy*
of the array::

    f = m.flatten()          # new dense 1-D ndarray

Pass ``order='C'`` (default) to walk the last axis first
or ``order='F'`` for the first axis first.

:attr:`~ulab.numpy.ndarray.flat` is the *iterator* form.
It yields every element of any-rank ``ndarray`` as
scalars, without allocating a flat copy::

    for x in m.flat:
        print(x)

When the application needs to *walk* every element,
prefer :attr:`flat`; when it needs a dense 1-D buffer
to hand to another function, use :meth:`flatten`.

Iteration
---------

Iterating a 1-D array yields scalars; iterating a
higher-rank array yields ``(n-1)``-D *views*::

    m = np.array([[0, 1, 2], [3, 4, 5]], dtype=np.uint8)
    for row in m:
        print(row)               # array([0, 1, 2]), array([3, 4, 5])

The rows yielded by iterating a matrix are views, so
modifying them modifies the source.

Copies
------

:meth:`~ulab.numpy.ndarray.copy` is the explicit way
to get an independent :class:`~ulab.numpy.ndarray`
whose modifications do not affect the original. A new
buffer is allocated and the source is walked into it::

    c = a.copy()

:meth:`~ulab.numpy.ndarray.tobytes` returns a
:class:`bytearray` that shares memory with the array's
data block. Writes through the bytearray modify the
array in place. Raises :exc:`ValueError` if the array
is not dense (a sliced view, a transpose, ...).

:meth:`~ulab.numpy.ndarray.tolist` returns the contents
as a possibly nested Python :class:`list`. Useful for
serialising small results; expensive for large ones,
because every element becomes a separate Python
object.

Which operations return which
-----------------------------

The full rule:

The following operations return **views**:

* slicing -- ``a[1:5]``, ``a[::2]``, ``m[:, 0]``;
* single-axis indexing of a higher-rank array --
  ``m[0]``;
* iterating an n-D array;
* :meth:`~ulab.numpy.ndarray.reshape`, when the
  requested layout is compatible;
* :meth:`~ulab.numpy.ndarray.transpose` / ``.T``;
* :func:`~ulab.numpy.frombuffer`;
* :func:`~ulab.numpy.asarray`, when the dtype matches.

The following operations return **copies**:

* :meth:`~ulab.numpy.ndarray.copy`;
* :meth:`~ulab.numpy.ndarray.flatten`;
* boolean indexing -- ``a[mask]``;
* arithmetic -- ``a + b``, ``a * 2``, ``np.sin(a)``;
* :func:`~ulab.numpy.array` -- always copies, even from
  another array;
* :func:`~ulab.numpy.concatenate`.

Reach for an explicit copy only when an independent
buffer is genuinely needed. On a camera with limited RAM,
the difference between a view and a copy is often the
difference between code that fits and code that does
not.
