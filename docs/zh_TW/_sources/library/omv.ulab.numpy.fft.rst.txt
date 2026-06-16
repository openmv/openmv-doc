:mod:`numpy.fft` --- Fast Fourier Transform routines
=========================================================

.. module:: numpy.fft
   :synopsis: Fast Fourier Transform routines

The :mod:`numpy.fft` submodule provides one-dimensional Fast Fourier Transform
routines. The length of the input array must be a power of 2; otherwise a
``ValueError`` is raised.

When ``ulab`` is built without complex support, the real and imaginary parts of
the transform are kept in separate :class:`numpy.ndarray` objects, and the
functions return a 2-tuple ``(real, imag)``. When ``ulab`` is built with the
``ULAB_SUPPORTS_COMPLEX`` and ``ULAB_FFT_IS_NUMPY_COMPATIBLE`` options enabled,
the routines accept and return complex arrays in a ``numpy``-compatible manner.

Functions
---------

.. function:: fft(r: ndarray, c: ndarray | None = None) -> tuple[ndarray, ndarray]

   Compute the one-dimensional discrete Fourier Transform of *r*.

   :param r: a one-dimensional array whose length is a power of two. Holds the
             real part of the input signal.
   :param c: an optional one-dimensional array of the same length as *r*,
             containing the imaginary part of the input. If omitted, the
             imaginary part is assumed to be zero.
   :return: a 2-tuple ``(real, imag)`` of :class:`numpy.ndarray` objects holding
            the real and imaginary parts of the transform.
   :raises ValueError: if the length of the input is not a power of two.

   When ``ulab`` is compiled with ``ULAB_SUPPORTS_COMPLEX`` and
   ``ULAB_FFT_IS_NUMPY_COMPATIBLE`` set to 1, the function instead takes a
   single (possibly complex) array and returns a complex array, in the same
   manner as ``numpy.fft.fft``.

.. function:: ifft(r: ndarray, c: ndarray | None = None) -> tuple[ndarray, ndarray]

   Compute the one-dimensional inverse discrete Fourier Transform.

   :param r: a one-dimensional array whose length is a power of two. Holds the
             real part of the spectrum.
   :param c: an optional one-dimensional array of the same length as *r*,
             containing the imaginary part of the spectrum. If omitted, the
             imaginary part is assumed to be zero.
   :return: a 2-tuple ``(real, imag)`` of :class:`numpy.ndarray` objects
            holding the real and imaginary parts of the inverse transform.
            The result is normalised by ``N`` (the number of samples), so that
            ``ifft(fft(x))`` reproduces the original input.
   :raises ValueError: if the length of the input is not a power of two.

   When ``ulab`` is compiled with ``ULAB_SUPPORTS_COMPLEX`` and
   ``ULAB_FFT_IS_NUMPY_COMPATIBLE`` set to 1, the function takes a single
   (possibly complex) array and returns a complex array.
