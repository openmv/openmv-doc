:mod:`numpy.fft` --- Fast Fourier Transform routines
=========================================================

.. module:: numpy.fft
   :synopsis: Fast Fourier Transform routines

The :mod:`numpy.fft` submodule provides one-dimensional Fast Fourier Transform
routines. The length of the input array must be a power of 2; otherwise a
``ValueError`` is raised.

The real and imaginary parts of the transform are kept in separate
:class:`numpy.ndarray` objects, and the functions return a 2-tuple
``(real, imag)``.

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
