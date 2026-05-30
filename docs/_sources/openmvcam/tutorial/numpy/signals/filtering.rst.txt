Filtering and spectrograms
==========================

The FFT page gave the application a way to inspect a
buffer's frequency content. The rest of the
signal-processing surface covers the adjacent jobs:
smoothing or band-pass-filtering a stream of samples,
computing magnitude spectra in a streaming loop
without allocating, and re-interpreting raw peripheral
buffers as float arrays:

* :func:`ulab.scipy.signal.sosfilt` -- IIR filter via
  cascaded second-order sections.
* :func:`ulab.utils.spectrogram` -- magnitude
  ``abs(fft(...))`` with no intermediate allocations.
* :func:`ulab.utils.from_int16_buffer` and the other
  :mod:`ulab.utils` ``from_*_buffer`` helpers -- pull a
  float array out of a buffer whose dtype the
  built-in :func:`~ulab.numpy.frombuffer` does not
  cover.

IIR filtering with sosfilt
--------------------------

:func:`~ulab.scipy.signal.sosfilt` applies cascaded
*second-order sections* (SOS) -- the numerically robust
way to apply an IIR filter. ``sos`` is a sequence of
length-6 sections; ``x`` is the 1-D input::

    from ulab import numpy as np
    from ulab import scipy as sp

    x   = np.array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    sos = [[1, 2, 3, 1, 5, 6],
           [1, 2, 3, 1, 5, 6]]
    y   = sp.signal.sosfilt(sos, x)

Each row of ``sos`` holds six coefficients
``[b0, b1, b2, a0, a1, a2]`` for one biquad section.
The ``sos`` array is usually pre-computed on a PC with
``scipy.signal.iirfilter(..., output='sos')`` and copied
into the camera script as a Python literal.

The optional ``zi=`` keyword carries filter state across
buffers. Pass an initial state of shape
``(n_sections, 2)`` and the function returns
``(y, zf)`` -- the filtered output and the final state
-- so the final state of one buffer feeds the initial
state of the next::

    y0, zf0 = sp.signal.sosfilt(sos, buffer0, zi=zi)
    y1, zf1 = sp.signal.sosfilt(sos, buffer1, zi=zf0)
    # ...

This is the standard shape for a streaming filter on
buffered data -- microphone input read 1024 samples at a
time, ADC samples accumulated in DMA-driven chunks, IMU
readings collected over a window.

Spectrograms
------------

:func:`ulab.utils.spectrogram` computes the magnitude
of the Fourier transform. It is conceptually equivalent
to

* ``np.abs(np.fft.fft(signal))`` on a complex-output FFT
  build, or
* ``np.sqrt(real * real + imag * imag)`` on a
  split-output build,

but does it in one call -- without holding the
intermediate ``real * real``, ``imag * imag``, the sum,
or the output of :func:`~ulab.numpy.abs` in RAM at any
point. That makes it the right tool in any loop where
spectra are computed repeatedly::

    from ulab import numpy as np
    from ulab import utils

    x        = np.linspace(0, 10, num=1024)
    spectrum = utils.spectrogram(x)

The argument shape mirrors :func:`~ulab.numpy.fft.fft`:
one 1-D real-or-complex array on complex-output builds,
one or two real arrays (``real``, ``imag``) on split
builds.

Three keyword arguments help with allocation:

* ``scratchpad=None`` -- a 1-D dense float array of
  length ``2 * len(signal)`` :func:`spectrogram` uses
  for working space.
* ``out=None`` -- a 1-D float array to write the result
  into.
* ``log=False`` -- when ``True``, take
  :func:`~ulab.numpy.log` of the magnitude before
  returning, folded into the same call.

The streaming pattern is to allocate everything once
and never allocate again::

    from ulab import numpy as np
    from ulab import utils

    N = 1024
    scratch = np.zeros(2 * N)
    out     = np.zeros(N)

    while True:
        signal = read_samples(N)
        utils.spectrogram(signal, out=out, scratchpad=scratch,
                          log=True)
        # ``out`` now holds log-magnitudes; feed forward ...

Compare to the obvious-but-wasteful version::

    while True:
        signal   = read_samples(N)
        spectrum = np.log(utils.spectrogram(signal))   # two allocations

Both produce the same numbers, but the first version
allocates nothing inside the loop -- the cam keeps the
same memory in use every iteration, and the loop runs
faster.

Wider-than-16-bit peripheral buffers
------------------------------------

:func:`~ulab.numpy.frombuffer` only handles the dtypes
:mod:`numpy` itself defines
(``uint8`` / ``int8``, ``uint16`` / ``int16``,
``float``). When a peripheral produces 32-bit integer
samples -- a 24- or 32-bit ADC, a high-resolution
microphone -- :mod:`ulab.utils` exposes explicit
conversion helpers:

* :func:`~ulab.utils.from_int16_buffer`,
  :func:`~ulab.utils.from_uint16_buffer`
* :func:`~ulab.utils.from_int32_buffer`,
  :func:`~ulab.utils.from_uint32_buffer`

Each takes a ``bytes``-like buffer and returns a float
:class:`~ulab.numpy.ndarray`::

    from ulab import utils

    buf = bytearray([1, 1, 0, 0, 0, 0, 0, 255])
    utils.from_uint32_buffer(buf)
    # array([257.0, 4278190080.0])

The functions accept the same allocation-saving knobs as
:func:`~ulab.utils.spectrogram`:

* ``count=`` and ``offset=`` to skip a header or limit
  the read.
* ``out=`` to write into a pre-allocated float array.
* ``byteswap=True`` when the peripheral disagrees with
  the MCU on byte order.

The combined shape -- one ``from_int32_buffer`` call
straight into one ``spectrogram`` call, both with
``out=`` buffers from outside the loop -- is the right
template for a streaming spectrum analyser running on a
high-resolution microphone.

For the complete reference, see
:doc:`/library/omv.ulab.scipy.signal` and the
:mod:`ulab.utils` documentation.
