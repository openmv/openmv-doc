Utilities
=========

The ``ulab.utils`` module sits outside ``numpy`` proper. It provides
small helpers that bridge ``ndarray`` and the kinds of raw buffers
you typically get from peripherals on a microcontroller. Two
families of functions are available:

* **Buffer converters** -- ``from_int16_buffer``,
  ``from_uint16_buffer``, ``from_int32_buffer``,
  ``from_uint32_buffer``. These read 16- or 32-bit integer samples
  out of a ``bytes``-like buffer and return them as a float
  ``ndarray``.

* **spectrogram** -- a memory-efficient
  ``np.abs(np.fft.fft(signal))``.

Importing
---------

::

   from ulab import numpy as np
   from ulab import utils

Buffer converters
-----------------

``np.frombuffer`` only handles dtypes that ``ulab`` natively
supports: ``uint8``, ``int8``, ``uint16``, ``int16``, ``float``. If
your peripheral produces 32-bit integers (a 24- or 32-bit ADC, a
high-resolution microphone, ...) you need ``utils.from_int32_buffer``
or ``utils.from_uint32_buffer``.

The functions take a buffer and return a float ``ndarray``::

   from ulab import numpy as np
   from ulab import utils

   buf = bytearray([1, 1, 0, 0, 0, 0, 0, 255])
   print(utils.from_uint32_buffer(buf))
   # array([257.0, 4278190080.0], dtype=float64)
   print(utils.from_int32_buffer(buf))
   # array([257.0, -16777216.0], dtype=float64)

Like ``np.frombuffer``, they accept ``count=-1`` and ``offset=0``::

   utils.from_uint32_buffer(buf, count=1, offset=4)

To avoid an allocation per call, pre-allocate a destination float
``ndarray`` and pass it as ``out=``::

   out = np.zeros(2, dtype=np.float)
   utils.from_uint32_buffer(buf, out=out)

If the peripheral byte order differs from the MCU, use
``byteswap=True``::

   utils.from_uint32_buffer(buf, byteswap=True)

The 16-bit variants ``from_int16_buffer`` and ``from_uint16_buffer``
work the same way, but read 16-bit samples.

spectrogram: abs(fft(...)) without intermediate arrays
------------------------------------------------------

``utils.spectrogram(signal)`` computes the magnitude of the Fourier
transform. It is conceptually equivalent to:

* ``np.abs(np.fft.fft(signal))`` on a numpy-compatible build, or
* ``np.sqrt(real * real + imag * imag)`` on a split build,

but does it without allocating ``a*a``, ``b*b``, the sum, or the
output of ``np.abs``. That makes it a good choice in any loop where
you compute spectra repeatedly::

   from ulab import numpy as np
   from ulab import utils

   x = np.linspace(0, 10, num=1024)
   y = np.sin(x)

   spectrum = utils.spectrogram(y)

The function takes one or two positional arguments depending on the
firmware: a single 1-D real-or-complex array on numpy-compatible
builds, or one or two real arrays (real, imag) on split builds.

Three keyword arguments help with allocation:

* ``scratchpad=None`` -- a 1-D dense float ``ndarray`` of length
  ``2 * len(signal)`` used as internal scratch space. If you supply
  one, the function does not have to allocate it.
* ``out=None`` -- a 1-D float ``ndarray`` to write the result into.
  If you supply ``out``, no result array is allocated.
* ``log=False`` -- if ``True``, take ``np.log`` of the magnitude
  before returning. Cheaper than calling ``np.log`` separately
  because the work is folded into the same loops.

Pattern -- pre-allocate everything, never allocate again::

   from ulab import numpy as np
   from ulab import utils

   N = 1024
   t = np.linspace(0, 2 * np.pi, num=N)
   scratch = np.zeros(2 * N)
   out     = np.zeros(N)

   while True:
       signal = np.sin(t)              # this still allocates each iter
       utils.spectrogram(signal, out=out, scratchpad=scratch, log=True)
       # out now holds log magnitudes
       # ... feed `out` into the next stage ...

Compare this to the obvious-but-wasteful version::

   while True:
       signal = np.sin(t)
       spectrum = np.log(utils.spectrogram(signal))   # 2 allocations / iter

Both produce the same numbers, but the first version generates no
garbage in the hot loop -- the heap stays clean and the loop is
faster.

Probing for numpy-compatible FFT
--------------------------------

If you ship code that needs to run on both flavours of ``ulab``
firmware, you can detect the FFT mode at runtime by checking what
``np.fft.fft`` returns::

   from ulab import numpy as np

   if len(np.fft.fft(np.zeros(4))) == 2:
       fft_is_numpy_compat = False    # split real/imag
   else:
       fft_is_numpy_compat = True     # complex output

This is the same check ``utils.spectrogram`` uses internally, and
it's the cleanest way to keep one code base for both build flavours.

Where to go next
----------------

* :doc:`fft` -- the FFT itself, including a worked dominant-frequency
  example.
* :doc:`programming` -- general patterns for keeping the heap clean.
