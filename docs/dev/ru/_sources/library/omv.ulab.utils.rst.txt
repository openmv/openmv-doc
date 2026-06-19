:mod:`ulab.utils` --- ulab utility helpers
==========================================

.. module:: ulab.utils
   :synopsis: ulab utility helpers

The :mod:`ulab.utils` submodule provides a small set of helpers that
operate on :class:`numpy.ndarray` objects but live outside the
standard NumPy / SciPy surface. The helpers are tuned for the
streaming patterns common on embedded targets -- wider-than-16-bit
peripheral buffers, allocation-free magnitude spectra.

Buffer converters
-----------------

The standard :func:`numpy.frombuffer` only handles dtypes that
:mod:`numpy` itself defines (``uint8``, ``int8``, ``uint16``,
``int16``, ``float``). The helpers below extend that coverage to
``int16`` / ``uint16`` / ``int32`` / ``uint32`` byte buffers and
return a float :class:`numpy.ndarray` in one pass.

.. function:: from_int16_buffer(buffer: bytes, *, count: int = -1, offset: int = 0, out: numpy.ndarray | None = None, byteswap: bool = False) -> numpy.ndarray

   Convert a buffer of ``int16`` samples into a float
   :class:`numpy.ndarray` in one pass.

   :param buffer: a ``bytes``-like buffer holding the samples.
   :param count: number of elements to read. ``-1`` reads the whole
                 buffer from ``offset`` to the end.
   :param offset: number of bytes to skip at the start of the
                  buffer.
   :param out: optional pre-allocated float
               :class:`numpy.ndarray` to write the result into.
               When supplied, no new array is allocated.
   :param byteswap: reverse the byte order of each element before
                    converting -- the right setting when the buffer
                    came from a peripheral that wrote in the
                    opposite byte order from the camera's CPU.
   :return: a float :class:`numpy.ndarray` of length ``count`` (or
            the available number of samples when ``count`` is
            ``-1``).

.. function:: from_uint16_buffer(buffer: bytes, *, count: int = -1, offset: int = 0, out: numpy.ndarray | None = None, byteswap: bool = False) -> numpy.ndarray

   Convert a buffer of ``uint16`` samples into a float
   :class:`numpy.ndarray` in one pass.

   :param buffer: a bytes-like buffer holding the samples.
   :param count: number of elements to read. ``-1`` reads the whole
                 buffer from ``offset`` to the end.
   :param offset: number of bytes to skip at the start of the
                  buffer.
   :param out: optional pre-allocated float
               :class:`numpy.ndarray` to write the result into.
               When supplied, no new array is allocated.
   :param byteswap: reverse the byte order of each element before
                    converting -- the right setting when the buffer
                    came from a peripheral that wrote in the
                    opposite byte order from the camera's CPU.
   :return: a float :class:`numpy.ndarray` of length ``count`` (or
            the available number of samples when ``count`` is
            ``-1``).

.. function:: from_int32_buffer(buffer: bytes, *, count: int = -1, offset: int = 0, out: numpy.ndarray | None = None, byteswap: bool = False) -> numpy.ndarray

   Convert a buffer of ``int32`` samples into a float
   :class:`numpy.ndarray` in one pass.

   :param buffer: a bytes-like buffer holding the samples.
   :param count: number of elements to read. ``-1`` reads the whole
                 buffer from ``offset`` to the end.
   :param offset: number of bytes to skip at the start of the
                  buffer.
   :param out: optional pre-allocated float
               :class:`numpy.ndarray` to write the result into.
               When supplied, no new array is allocated.
   :param byteswap: reverse the byte order of each element before
                    converting -- the right setting when the buffer
                    came from a peripheral that wrote in the
                    opposite byte order from the camera's CPU.
   :return: a float :class:`numpy.ndarray` of length ``count`` (or
            the available number of samples when ``count`` is
            ``-1``).

.. function:: from_uint32_buffer(buffer: bytes, *, count: int = -1, offset: int = 0, out: numpy.ndarray | None = None, byteswap: bool = False) -> numpy.ndarray

   Convert a buffer of ``uint32`` samples into a float
   :class:`numpy.ndarray` in one pass.

   :param buffer: a bytes-like buffer holding the samples.
   :param count: number of elements to read. ``-1`` reads the whole
                 buffer from ``offset`` to the end.
   :param offset: number of bytes to skip at the start of the
                  buffer.
   :param out: optional pre-allocated float
               :class:`numpy.ndarray` to write the result into.
               When supplied, no new array is allocated.
   :param byteswap: reverse the byte order of each element before
                    converting -- the right setting when the buffer
                    came from a peripheral that wrote in the
                    opposite byte order from the camera's CPU.
   :return: a float :class:`numpy.ndarray` of length ``count`` (or
            the available number of samples when ``count`` is
            ``-1``).

Spectrogram
-----------

.. function:: spectrogram(r: numpy.ndarray, imag: numpy.ndarray | None = None, *, scratchpad: numpy.ndarray | None = None, out: numpy.ndarray | None = None, log: bool = False) -> numpy.ndarray

   Return the magnitude of the discrete Fourier transform of the
   input, conceptually equivalent to
   ``np.sqrt(real * real + imag * imag)`` after a call to
   :func:`numpy.fft.fft` -- without allocating the intermediate
   buffers the explicit form would.

   :param r: the real part of the input as a 1-D float
             :class:`numpy.ndarray`. Its length must be a power of
             two.
   :param imag: optional imaginary part of the input, same shape
                as *r*. When omitted, the input is treated as
                purely real.
   :param scratchpad: optional working buffer for the FFT. When
                      supplied, no temporary working array is
                      allocated.
   :param out: optional pre-allocated destination buffer for the
               magnitude spectrum. When supplied, the result is
               written into it directly.
   :param log: when ``True``, return the natural logarithm of the
               magnitude instead of the magnitude itself.
   :return: a float :class:`numpy.ndarray` of the same length as
            *r* holding the magnitude (or its logarithm) at each
            frequency bin.
