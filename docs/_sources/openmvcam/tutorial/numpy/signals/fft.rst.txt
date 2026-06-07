FFT
===

A Fourier transform decomposes a time-domain signal
into its constituent frequencies. On a camera, the
input is typically a buffer of equally spaced samples
from a microphone, an accelerometer axis, a current
sensor, or a vibration probe; the output is a spectrum
the application then inspects for peaks, energy, or
classifier features.

:mod:`numpy.fft` provides the one-dimensional discrete
Fourier transform. The two functions are
:func:`~ulab.numpy.fft.fft` (forward) and
:func:`~ulab.numpy.fft.ifft` (inverse, normalised by
``N``).

The transform length must be a power of two. Other
lengths raise :exc:`ValueError`. ``N = 256`` and
``N = 1024`` are common picks: long enough for usable
frequency resolution at most embedded sample rates, short
enough to fit in RAM and finish well inside one frame
period.

Two flavours
------------

Whether the FFT call is exactly the desktop ``numpy``
form depends on how the cam was built:

* **On a cam with complex-number support** (``-c`` in
  :data:`ulab.__version__`), the FFT is the standard
  form. One 1-D real or complex array goes in; one 1-D
  *complex* array comes out.
* **On a cam without complex-number support**, the
  real and imaginary parts come back separately.
  :func:`~ulab.numpy.fft.fft` takes the real part as
  the first positional argument and an optional
  imaginary part as the second, and returns a 2-tuple
  ``(real, imag)``.

The cleanest probe at runtime is the return value of
:func:`~ulab.numpy.fft.fft` itself::

    from ulab import numpy as np

    if len(np.fft.fft(np.zeros(4))) == 2:
        # split real/imag mode
        ...
    else:
        # numpy-compatible (complex output) mode
        ...

Real input, magnitude output
----------------------------

When the application only feeds real input and only
needs magnitude, the two flavours converge. On a
complex-output build::

    spectrum = np.fft.fft(x)
    magnitude = np.abs(spectrum)

On a split-output build::

    real, imag = np.fft.fft(x)
    magnitude = np.sqrt(real * real + imag * imag)

In both cases the result is a real
:class:`~ulab.numpy.ndarray` of the same length as the
input. The :doc:`filtering` page covers
:func:`ulab.utils.spectrogram`, a helper that does
exactly this without the intermediate allocations --
the right call inside a streaming loop.

Inverse transform
-----------------

:func:`~ulab.numpy.fft.ifft` is normalised so
``ifft(fft(x)) == x`` within floating-point error::

    y       = np.sin(t)
    spectrum = np.fft.fft(y)
    y_back  = np.fft.ifft(spectrum)

On a split-output build, both calls take and return a
pair of real arrays::

    real, imag       = np.fft.fft(y)
    re_back, im_back = np.fft.ifft(real, imag)

Finding the dominant frequency
------------------------------

A common pattern is locating the largest peak in a
buffer of samples -- audio, vibration, modulated IR.
The recipe:

#. Capture ``N`` samples, with ``N`` a power of two.
#. Take the FFT.
#. Find the bin with the largest magnitude.
#. Convert the bin index to Hz using the sample rate.

::

    from ulab import numpy as np

    N  = 1024
    fs = 8000.0                       # sample rate, Hz

    # ... fill ``samples`` with N data points ...

    # split-output build:
    real, imag = np.fft.fft(samples)
    spectrum   = np.sqrt(real * real + imag * imag)

    half      = spectrum[:N // 2]     # only first half is meaningful
    peak_bin  = np.argmax(half)
    peak_hz   = peak_bin * fs / N

    print("peak at", peak_hz, "Hz")

For complete argument detail, see
:doc:`/library/omv.ulab.numpy.fft`.
