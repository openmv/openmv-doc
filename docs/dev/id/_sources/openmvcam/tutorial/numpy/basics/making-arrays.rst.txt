Making arrays
=============

Every example on the rest of these pages starts with an
:class:`~numpy.ndarray` already in hand. This page
is the catalogue of how that array comes to be. There
are four families of constructor:

* **From a Python iterable** -- the usual literal /
  list / tuple form.
* **Pre-filled at a given shape** -- zeros, ones, a
  constant value, an identity matrix.
* **Generated as a sequence** -- ranged or evenly spaced
  values.
* **Wrapping a buffer already in RAM** -- the peripheral
  case.

Every constructor takes a ``dtype=`` keyword and defaults
to :class:`~numpy.float`. Sensor data almost always
wants a smaller dtype than the default.

Every example below starts with::

    from ulab import numpy as np

From a Python iterable
----------------------

:func:`~numpy.array` builds an ``ndarray`` from any
iterable of numbers::

    a = np.array([1, 2, 3, 4])
    print(a)

Output::

    array([1.0, 2.0, 3.0, 4.0], dtype=float)

Nested iterables produce multi-dimensional arrays. The
inner iterables must all have the same length, or
:exc:`ValueError` is raised::

    m = np.array([[1, 2, 3],
                  [4, 5, 6]], dtype=np.uint8)

A pre-existing ``ndarray`` is also a valid input;
:func:`~numpy.array` always copies. To avoid the copy
when one is not needed, use :func:`~numpy.asarray`::

    b = np.asarray(a, dtype=np.float)   # same dtype -> no copy

Pre-filled at a given shape
---------------------------

When the target shape is known but the contents are not
yet, allocate the buffer up front and write into it later:

* :func:`~numpy.zeros` -- filled with zeros.
* :func:`~numpy.ones` -- filled with ones.
* :func:`~numpy.full` -- filled with a given value.
* :func:`~numpy.empty` -- alias for
  :func:`~numpy.zeros` (:mod:`ulab` does not leave
  the buffer uninitialised).
* :func:`~numpy.eye` -- identity-like ``N``-by-``M``
  matrix with ones on the ``k``-th diagonal.
* :func:`~numpy.diag` -- a diagonal matrix from a
  vector, or the diagonal of a matrix.

::

    np.zeros((3, 3))                   # 3x3 of zeros
    np.ones(5, dtype=np.uint8)         # length-5 vector of ones
    np.full((2, 3), 7, dtype=np.int8)  # 2x3, all 7
    np.eye(4)                          # 4x4 identity
    np.diag([1, 2, 3])                 # 3x3, [1, 2, 3] on the diagonal

The ``shape`` argument is either a single integer (for a
1-D array) or a tuple.

Generated as a sequence
-----------------------

* :func:`~numpy.arange` -- evenly spaced values like
  the built-in :func:`range`, but always returning an
  ``ndarray``::

      np.arange(0, 10, 2)            # array([0, 2, 4, 6, 8])

* :func:`~numpy.linspace` -- ``num`` evenly spaced
  points between two limits, with the upper bound
  included when ``endpoint=True``::

      np.linspace(0, 1, num=11)      # 0.0, 0.1, ..., 1.0

* :func:`~numpy.logspace` -- geometrically spaced
  points. ``start`` and ``stop`` are *exponents*, not
  endpoints; the result runs from ``base ** start`` to
  ``base ** stop``::

      np.logspace(0, 3, num=4)       # 1.0, 10.0, 100.0, 1000.0

* :func:`~numpy.meshgrid` -- builds two coordinate
  matrices from two 1-D arrays so a per-pixel function
  ``f(x, y)`` can be evaluated over a whole grid in one
  vectorised call. Given an x-vector of length ``W`` and
  a y-vector of length ``H``, ``meshgrid`` returns two
  ``H``-by-``W`` matrices: ``X`` is the x-vector
  repeated down every row, ``Y`` is the y-vector
  repeated across every column, so ``X[i, j]`` is the
  x-coordinate and ``Y[i, j]`` is the y-coordinate of
  the cell at row ``i`` and column ``j``::

      x = np.arange(4)            # [0, 1, 2, 3]
      y = np.arange(3)            # [0, 1, 2]
      X, Y = np.meshgrid(x, y)
      # X = [[0, 1, 2, 3],
      #      [0, 1, 2, 3],
      #      [0, 1, 2, 3]]
      # Y = [[0, 0, 0, 0],
      #      [1, 1, 1, 1],
      #      [2, 2, 2, 2]]

  ``f(X, Y)`` then evaluates the function at every cell
  of the grid in one expression. A distance-from-centre
  map over a ``(H, W)`` frame, for example, is
  ``np.sqrt((X - cx)**2 + (Y - cy)**2)`` against the
  matrices :func:`~numpy.meshgrid` returned.

Joining
-------

:func:`~numpy.concatenate` joins a tuple of arrays
along an existing axis::

    a = np.array([[1, 2], [3, 4]], dtype=np.uint8)
    b = np.array([[5, 6]],         dtype=np.uint8)
    np.concatenate((a, b), axis=0)
    # array([[1, 2], [3, 4], [5, 6]], dtype=uint8)

All inputs must share the same dtype and ``ndim``, and
match on every axis other than the joining one.
:func:`~numpy.concatenate` allocates a fresh array
big enough to hold every input and copies the data in,
so it is the right tool for one-shot joining of arrays
that already exist; it is the wrong tool inside a
streaming loop, where pre-allocating the destination
once and writing into it through slice assignment is
the pattern.

Wrapping an existing buffer
---------------------------

The most useful constructor on a camera is
:func:`~numpy.frombuffer`. It re-interprets an existing
bytes-like buffer as a 1-D :class:`~numpy.ndarray`
*without copying* a single byte::

    buf = bytearray(8)
    audio = np.frombuffer(buf, dtype=np.int16)
    # 4 int16 samples, sharing memory with buf

Writes through ``audio`` are visible in ``buf`` and vice
versa. The chosen ``dtype`` must evenly divide the
buffer length.

``offset=`` skips a header at the start of the buffer;
``count=`` limits how many elements are read::

    np.frombuffer(buf, dtype=np.uint8, offset=2, count=4)

This is the right constructor whenever a peripheral hands
the application a raw buffer -- ADC samples in a
:class:`bytearray`, a payload pulled from
:class:`~machine.SPI`. The bytes the peripheral wrote
are the array.

When a peripheral writes multi-byte values in a byte
order the camera's CPU does not natively read,
:meth:`~numpy.ndarray.byteswap` reverses the byte order
of each element so the values read correctly. It
returns a new array by default; passing ``inplace=True``
modifies the source in place.

:func:`~numpy.frombuffer` only handles the dtypes
:mod:`numpy` itself defines. For peripherals that
produce 32-bit integer samples,
:func:`~ulab.utils.from_int32_buffer` and friends convert to
``float`` in one pass.

Print truncation
----------------

Printing a large array shows only its first and last
few elements, with ``...`` in the middle, so the IDE
terminal does not fill with thousands of values::

    >>> print(np.arange(1000, dtype=np.uint16))
    array([0, 1, 2, ..., 997, 998, 999], dtype=uint16)

:func:`~numpy.set_printoptions` overrides the
thresholds when debugging needs the whole buffer::

    np.set_printoptions(threshold=2000)  # print up to 2000 elements in full
    np.set_printoptions(edgeitems=10)    # 10 items at each end, not 3

:func:`~numpy.get_printoptions` reads the current
settings back as a dict.
