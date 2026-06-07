The ndarray
===========

The :class:`~ulab.numpy.ndarray` is the type that holds
numerical data in :mod:`numpy`. It is two things in one:
a single packed block of data and a small descriptor in
front of that block that says how to read it.

Inside the box
--------------

The data block holds every element of the array end to
end, with nothing extra between them. Each element
occupies the same number of bytes -- one for an array of
``uint8`` values, two for ``uint16``, four (or eight) for
``float``. A 256-element ``uint8`` array is exactly
256 bytes of data; the same 256 numbers held in a Python
:class:`list` would be over two kilobytes of separate
integer objects with pointers between them.

The descriptor records what the block *means*. Five
values are enough to describe any rectangular array, no
matter how many dimensions:

* :attr:`~ulab.numpy.ndarray.dtype` -- the element type.
  Decides how many bytes each element takes and what
  range of values it can hold (covered on
  :doc:`dtypes`).
* :attr:`~ulab.numpy.ndarray.itemsize` -- the byte width
  of one element, derived from the dtype.
* :attr:`~ulab.numpy.ndarray.ndim` -- the number of
  dimensions (1 for a vector, 2 for a matrix, 3 for a
  volume).
* :attr:`~ulab.numpy.ndarray.shape` -- the size along
  each dimension as a tuple.
* :attr:`~ulab.numpy.ndarray.strides` -- how to step
  through the data block to walk each axis. Covered on
  :doc:`../shape/shape-and-strides`.

That is it. Every fast path in :mod:`numpy` -- arithmetic,
reductions, broadcasting, slicing -- works directly from
those five values plus the data pointer, with no
per-element Python overhead.

What the design buys
--------------------

Three properties fall out of "packed block + small
descriptor" and define how the rest of the section
behaves.

**Element-wise math runs as a single call.** ``a + b``
between two arrays of matching shape adds the two
buffers and writes a third, all inside one library
call. ``np.sin(a)`` does the same for the sine of every
element. The arithmetic, comparison, and bit-wise
operators all work this way; the universal functions
(``sin``, ``exp``, ``log``, ...) do too. See
:doc:`../math/operators` and
:doc:`../math/universal-functions`.

**Reshape, transpose, and slicing are free.** None of
the three actually moves the data. Each one returns a
new descriptor pointing at the *same* data block. The
result is called a *view* -- a second window onto the same
underlying buffer. Writing through a view writes to the
source. See :doc:`../shape/views-and-copies`.

**Mixed shapes still work.** A shorter array against a
longer one, a row against a matrix, a column against a
row -- :mod:`numpy` lines them up by *broadcasting*, a
small set of rules that decide which short axis stretches
to match the long one. The stretch is virtual; no data
is duplicated. See :doc:`../math/broadcasting`.

What the design costs
---------------------

Two restrictions follow from the same design.

**Every element has the same type.** A list can hold an
``int`` next to a ``str`` next to a list of three more
``int``\ s; an :class:`~ulab.numpy.ndarray` cannot. The
dtype is fixed at construction time. The :doc:`dtypes`
page covers the small set of types :mod:`numpy` supports
and the rules that come out of fixing one.

**Growing an array is not free.** A list keeps spare
slots at the end and supports ``.append`` cheaply. An
:class:`~ulab.numpy.ndarray` is exactly the size it
needs to be; appending would mean allocating a new,
larger buffer and copying the old contents into it.
There is no :meth:`append` method, on purpose. The right
pattern on the camera is to pre-allocate the destination
at its final size and *fill* it; :doc:`../performance`
covers the technique.

With a packed typed buffer for the data, a small
descriptor for the metadata, and three behavioural
guarantees (fast element-wise math, free reshape /
transpose / slicing, and shapes that broadcast), the
:class:`~ulab.numpy.ndarray` is the foundation the rest
of the chapter rests on. How an array actually comes
into existence -- from a literal, from a pre-filled
allocation, from a peripheral buffer -- is the next
practical question.
