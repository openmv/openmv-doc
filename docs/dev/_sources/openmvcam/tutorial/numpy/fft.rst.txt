Fast Fourier transforms
=======================

``ulab`` exposes a small but complete FFT module under
``numpy.fft``. There are two functions:

* ``np.fft.fft(x[, imag])`` -- forward FFT;
* ``np.fft.ifft(x[, imag])`` -- inverse FFT, normalised by ``N``.

The transform length must be a power of 2. Calling with a length
other than a power of 2 raises ``ValueError``.

Two flavours of FFT
-------------------

Whether the FFT is exactly ``numpy``-compatible depends on how the
firmware was built. On builds with complex support (``-c`` in
``ulab.__version__``), the FFT is ``numpy``-compatible:

* a single 1-D real or complex array goes in;
* a single 1-D complex array comes out.

On builds *without* complex support, complex numbers are split: the
function takes the real part as a positional argument and (optionally)
the imaginary part as a second positional argument; it returns a
2-tuple ``(real, imag)``.

The simplest way to find out which one your firmware does is to call
``fft`` and inspect the return value::

   from ulab import numpy as np

   if len(np.fft.fft(np.zeros(4))) == 2:
       print('split-real/imag mode')
   else:
       print('numpy-compatible (complex) mode')

Real-input example (works on both flavours)
-------------------------------------------

If you only ever feed real input and only need the magnitude, the
two flavours behave equivalently::

   from ulab import numpy as np

   N = 1024
   t = np.linspace(0, 2 * np.pi, num=N, endpoint=False)
   x = np.sin(50 * t) + 0.5 * np.sin(120 * t)

   # numpy-compatible mode:
   #     spectrum = np.fft.fft(x)         # complex array
   #     magnitude = np.abs(spectrum)
   #
   # split-real/imag mode:
   #     real, imag = np.fft.fft(x)
   #     magnitude = np.sqrt(real*real + imag*imag)

If you find yourself doing the second pattern a lot, see
:doc:`utils` for ``utils.spectrogram`` -- it is equivalent to the
above but does not allocate intermediate arrays for ``real*real``,
``imag*imag`` and the sum.

Inverse FFT
-----------

The inverse transform is normalised by ``N``, so
``ifft(fft(x)) == x`` (within floating-point error)::

   y = np.sin(t)
   spectrum = np.fft.fft(y)         # numpy-compat: complex array

   y_back = np.fft.ifft(spectrum)
   # y_back is the original signal (with negligible imaginary part)

In split-real/imag mode the calls are::

   real, imag = np.fft.fft(y)
   re_back, im_back = np.fft.ifft(real, imag)

Speed
-----

Speed of FFTs has been the original motivation for ``ulab``. As a
rough yardstick, on STM32 hardware:

* a pure-Python 1024-point FFT takes around 90 ms;
* a hand-rolled assembly 1024-point FFT takes around 13 ms;
* the ``ulab`` C implementation takes around 2 ms.

A simple benchmark::

   import time
   from ulab import numpy as np

   x = np.linspace(0, 10, num=1024)
   y = np.sin(x)

   t0 = time.ticks_us()
   spectrum = np.fft.fft(y)
   print('fft:', time.ticks_diff(time.ticks_us(), t0), 'us')

A worked example: dominant frequency
------------------------------------

A common use case is finding the dominant frequency in a buffer of
samples (audio, vibration, IR LED demodulation). The recipe is:

1. Sample N points (N a power of 2).
2. Take the FFT.
3. Find the bin with the largest magnitude.
4. Convert the bin index to Hz using your sample rate.

::

   from ulab import numpy as np

   N  = 1024
   fs = 8000.0                      # sample rate, Hz

   # ... fill `samples` with N data points ...

   # numpy-compatible build:
   #     spectrum = np.abs(np.fft.fft(samples))
   #
   # split build:
   real, imag = np.fft.fft(samples)
   spectrum = np.sqrt(real * real + imag * imag)

   # Only the first half is meaningful (Nyquist).
   half = spectrum[:N // 2]
   peak_bin = np.argmax(half)
   peak_hz  = peak_bin * fs / N

   print('peak at', peak_hz, 'Hz')

For a still tighter inner loop, replace the magnitude expression
with ``utils.spectrogram(samples, scratchpad=scratch, out=out)`` --
see :doc:`utils`.

API reference
-------------

* :doc:`/library/omv.ulab.numpy.fft` -- ``fft`` and ``ifft`` API
  reference.
* :doc:`utils` -- ``spectrogram``: ``abs(fft(...))`` without the
  intermediate allocations.
