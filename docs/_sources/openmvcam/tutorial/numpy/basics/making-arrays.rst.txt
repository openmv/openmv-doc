Making arrays
=============

Every example on the rest of these pages starts with an
:class:`~ulab.numpy.ndarray` already in hand. This page
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
to :class:`~ulab.numpy.float`. The :doc:`dtypes` page
covers why almost every call to one of these on sensor
data should override that default.

Every example below starts with::

    from ulab import numpy as np

From a Python iterable
----------------------

:func:`~ulab.numpy.array` builds an ``ndarray`` from any
iterable of numbers::

    a = np.array([1, 2, 3, 4])
    print(a)

Output::

    array([1.0, 2.0, 3.0, 4.0], dtype=float64)

Nested iterables produce multi-dimensional arrays. The
inner iterables must all have the same length, or
:exc:`ValueError` is raised::

    m = np.array([[1, 2, 3],
                  [4, 5, 6]], dtype=np.uint8)

A pre-existing ``ndarray`` is also a valid input;
:func:`~ulab.numpy.array` always copies. To avoid the copy
when one is not needed, use :func:`~ulab.numpy.asarray`::

    b = np.asarray(a, dtype=np.float)   # same dtype -> no copy

Pre-filled at a given shape
---------------------------

When the target shape is known but the contents are not
yet, allocate the buffer up front and write into it later:

* :func:`~ulab.numpy.zeros(shape, dtype=float)` -- filled
  with zeros.
* :func:`~ulab.numpy.ones(shape, dtype=float)` -- filled
  with ones.
* :func:`~ulab.numpy.full(shape, value, dtype=...)` --
  filled with ``value``.
* :func:`~ulab.numpy.empty(shape, dtype=...)` -- alias for
  :func:`~ulab.numpy.zeros` (:mod:`ulab` does not leave the
  buffer uninitialised).
* :func:`~ulab.numpy.eye(N, M=None, k=0)` -- identity-like
  ``N`` by ``M`` matrix with ones on the ``k``-th diagonal.
* :func:`~ulab.numpy.diag(v, k=0)` -- a diagonal matrix
  from a vector, or the diagonal of a matrix.

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

* :func:`~ulab.numpy.arange(start, stop, step, dtype=...)`
  -- evenly spaced values like the built-in
  :func:`range`, but always returning an ``ndarray``::

      np.arange(0, 10, 2)            # array([0, 2, 4, 6, 8])

* :func:`~ulab.numpy.linspace(start, stop, num=50,
  endpoint=True)` -- ``num`` evenly spaced points between
  two limits, with ``endpoint=True`` including the upper
  bound::

      np.linspace(0, 1, num=11)      # 0.0, 0.1, ..., 1.0

* :func:`~ulab.numpy.logspace(start, stop, num=50, base=10)`
  -- geometrically spaced points. ``start`` and ``stop`` are
  *exponents*, not endpoints; the result runs from
  ``base ** start`` to ``base ** stop``::

      np.logspace(0, 3, num=4)       # 1.0, 10.0, 100.0, 1000.0

* :func:`~ulab.numpy.meshgrid(x, y, indexing='xy')` --
  two coordinate matrices from two 1-D inputs. Useful for
  per-pixel transforms expressed as ``f(x, y)`` over the
  pixel grid::

      x = np.arange(4)
      y = np.arange(3)
      X, Y = np.meshgrid(x, y)
      # X is the column index repeated; Y is the row index repeated.

Joining
-------

:func:`~ulab.numpy.concatenate` joins a tuple of arrays
along an existing axis::

    a = np.array([[1, 2], [3, 4]], dtype=np.uint8)
    b = np.array([[5, 6]],         dtype=np.uint8)
    np.concatenate((a, b), axis=0)
    # array([[1, 2], [3, 4], [5, 6]], dtype=uint8)

All inputs must share the same dtype and ``ndim``, and
match on every axis other than the joining one. This is
the right shape for accumulating short buffers into a
longer one when the final length is known up front; for
the streaming-append pattern see :doc:`../performance`.

Wrapping an existing buffer
---------------------------

The most useful constructor on a camera is
:func:`~ulab.numpy.frombuffer`. It re-interprets an
existing ``bytes``-like buffer as a 1-D
:class:`~ulab.numpy.ndarray` *without copying* a single
byte::

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
:class:`bytearray`, an audio frame from
:class:`~machine.I2S`, a payload pulled from
:class:`~machine.SPI`. The bytes the peripheral wrote
are the array.

When the peripheral's byte order disagrees with the
camera's, the :meth:`~ulab.numpy.ndarray.byteswap`
method flips each multi-byte element.
``a.byteswap()`` returns a new array;
``a.byteswap(inplace=True)`` modifies the source in
place.

:func:`~ulab.numpy.frombuffer` only handles the dtypes
:mod:`numpy` itself defines. For peripherals that
produce 32-bit integer samples,
:func:`~ulab.utils.from_int32_buffer` and friends
convert to ``float`` in one pass; see
:doc:`../signals/filtering`.

For the complete argument-level reference of every
constructor on this page, see
:doc:`/library/omv.ulab.numpy`.
