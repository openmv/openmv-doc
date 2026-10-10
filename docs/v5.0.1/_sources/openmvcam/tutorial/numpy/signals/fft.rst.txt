FFT
===

A *Fourier transform* decomposes a time-domain signal
into its constituent frequencies. The *fast Fourier
transform* (*FFT*) is the standard algorithm for
computing one efficiently -- the reason this module
exists, and the reason transforms long enough to be
useful (1024 points, 4096 points) are tractable on a
microcontroller in the first place.

On a camera, the input is typically a buffer of
equally spaced samples from a microphone, an
accelerometer axis, a current sensor, or a vibration
probe; the output is a spectrum the application then
inspects for peaks, energy, or classifier features.

:mod:`numpy.fft` provides the one-dimensional discrete
Fourier transform. The two functions are
:func:`~numpy.fft.fft` (forward) and
:func:`~numpy.fft.ifft` (inverse, normalised by
``N``).

The transform length must be a power of two. Other
lengths raise :exc:`ValueError`. ``N = 256`` and
``N = 1024`` are common picks: long enough for usable
frequency resolution at most embedded sample rates, short
enough to fit in RAM and finish well inside one frame
period.

:func:`~numpy.fft.fft` takes the real part of the input
as its first positional argument and an optional
imaginary part as its second, and returns a 2-tuple
``(real, imag)`` of real arrays.

Real input, magnitude output
----------------------------

When the application only feeds real input and only
needs the magnitude spectrum::

    real, imag = np.fft.fft(x)
    magnitude  = np.sqrt(real * real + imag * imag)

The result is a real :class:`~numpy.ndarray` of the
same length as the input. The
:func:`~ulab.utils.spectrogram` helper does exactly this
without the intermediate allocations -- the right call
inside a streaming loop.

Inverse transform
-----------------

:func:`~numpy.fft.ifft` is normalised so the round trip
returns the original input within floating-point
error. Both calls take and return a pair of real
arrays::

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

    real, imag = np.fft.fft(samples)
    spectrum   = np.sqrt(real * real + imag * imag)

    half      = spectrum[:N // 2]     # only first half is meaningful
    peak_bin  = np.argmax(half)
    peak_hz   = peak_bin * fs / N

    print("peak at", peak_hz, "Hz")
