Curves and integration
======================

The math pages covered operations that take an array in
and produce an array (or scalar) out -- arithmetic,
reductions, broadcasting. This page covers a different
class of operations: ones that treat the array as a
*sampled function* and ask questions about the function
itself. Interpolating between samples, fitting a curve to
them, integrating under them, convolving them with another
buffer.

All of these accept :class:`~numpy.ndarray` inputs
and return either a float scalar or a float
:class:`~numpy.ndarray`.

Interpolation
-------------

:func:`~numpy.interp` does
one-dimensional linear interpolation. ``xp`` is a
monotonically increasing 1-D array of independent
values; ``fp`` is the matching dependent values; ``x``
is where the interpolant should be evaluated::

    xp = np.array([0.0, 1.0, 2.0, 3.0])
    fp = np.array([10.0, 20.0, 25.0, 30.0])
    x  = np.array([0.5, 1.5, 2.5])

    np.interp(x, xp, fp)
    # array([15.0, 22.5, 27.5])

Outside the ``[xp[0], xp[-1]]`` range the result is
clipped to ``fp[0]`` and ``fp[-1]`` respectively; the
``left=`` and ``right=`` keywords override those
endpoints.

Used on the camera to remap a calibration table to
arbitrary sample positions -- a temperature-to-voltage
table from a thermistor, a non-linear pixel response
curve, a per-channel gamma lookup. One library call,
one pass over the inputs, no Python loop.

Polynomial fitting and evaluation
---------------------------------

:func:`~numpy.polyfit` fits a polynomial
of degree ``deg`` to the data points ``(x, y)`` by least
squares and returns the coefficients (highest degree
first)::

    x = np.array([0.0, 1.0, 2.0, 3.0, 4.0])
    y = np.array([0.0, 1.1, 3.9, 9.1, 15.8])

    coeffs = np.polyfit(x, y, 2)
    # array([1.0, 0.0, 0.0])  (approximately)

When ``x`` is omitted, ``range(len(y))`` is used --
useful for fitting a quick polynomial to a regularly
sampled buffer with no associated x-axis::

    np.polyfit(y, 2)

:func:`~numpy.polyval` evaluates the
polynomial whose coefficients are ``p`` at ``x``. The
input ``x`` can be a scalar (returns a float) or an
``ndarray`` (returns an ``ndarray``)::

    p = np.polyfit(x, y, 2)
    fitted = np.polyval(p, x)

The natural pairing is to call ``polyfit`` once at
calibration time, store the coefficients, and call
``polyval`` to evaluate the resulting curve every
frame. The polynomial-evaluation step is a handful of
float operations per sample, which is cheap even on the
smallest cams.

Convolution
-----------

:func:`~numpy.convolve` returns the
full-length discrete linear convolution of two 1-D
arrays. Only ``full`` mode is implemented; the output
length is ``len(a) + len(v) - 1``. Slice the result for
the same effect as the ``same`` and ``valid`` modes
that the desktop ``numpy`` offers::

    a = np.array([1.0, 2.0, 3.0])
    v = np.array([0.5, 0.5])

    np.convolve(a, v)
    # array([0.5, 1.5, 2.5, 1.5])

Useful for short FIR filters and smoothing kernels (box,
triangle, gaussian) where setting up an SOS chain is
overkill. The runtime is proportional to the product of
the two array lengths -- fine for short kernels but
quickly becomes more expensive than an FFT convolution
for long ones.

Trapezoidal integration
-----------------------

:func:`~numpy.trapz` integrates a
sampled function by the composite trapezoidal rule::

    x = np.linspace(0, np.pi, num=128)
    y = np.sin(x)
    np.trapz(y, x)             # ~ 2.0

Pass ``dx=`` when the sample spacing is uniform and only
the step matters; pass ``x=`` when the samples are not
evenly spaced. The right call for integrating
already-captured sensor data, where the analytic form is
not available.

For sample data that has been *band-limited* (an audio
buffer after an anti-aliasing filter, for instance), the
trapezoidal rule converges as the square of the sample
count, which means doubling the buffer length cuts the
error by a factor of four.

When the integrand is not a buffer of samples but a
Python function the application can evaluate at arbitrary
points, a different family of solvers is the right call.
