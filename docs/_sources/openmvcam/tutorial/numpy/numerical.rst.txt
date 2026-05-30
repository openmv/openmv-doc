Numerical extras
================

The pages so far covered the everyday surface --
construction, indexing, math, broadcasting, reductions,
linear algebra, FFT, filtering. This page catalogues
the remaining numerical tools that did not fit one of
those headings: interpolation, polynomial fitting,
integration, convolution, root finding, optimisation,
special functions, random numbers.

Almost every function on this page accepts -- and most
require -- :class:`~ulab.numpy.ndarray` inputs and
returns either a float scalar or a float
:class:`~ulab.numpy.ndarray`. The imports::

    from ulab import numpy as np
    from ulab import scipy as sp

Interpolation
-------------

:func:`~ulab.numpy.interp(x, xp, fp)` does
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

:func:`~ulab.numpy.polyfit(x, y, deg)` fits a polynomial
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

:func:`~ulab.numpy.polyval(p, x)` evaluates the
polynomial whose coefficients are ``p`` at ``x``. The
input ``x`` can be a scalar (returns a float) or an
``ndarray`` (returns an ``ndarray``)::

    p = np.polyfit(x, y, 2)
    fitted = np.polyval(p, x)

Convolution
-----------

:func:`~ulab.numpy.convolve(a, v)` returns the
full-length discrete linear convolution of two 1-D
arrays. Only ``'full'`` mode is implemented; the output
length is ``len(a) + len(v) - 1``. Slice the result for
the same effect as the ``'same'`` and ``'valid'`` modes
that the desktop ``numpy`` offers::

    a = np.array([1.0, 2.0, 3.0])
    v = np.array([0.5, 0.5])

    np.convolve(a, v)
    # array([0.5, 1.5, 2.5, 1.5])

Useful for short FIR filters and smoothing kernels
(box, triangle, gaussian) where setting up an SOS chain
is overkill.

Trapezoidal integration
-----------------------

:func:`~ulab.numpy.trapz(y, x=None, dx=1.0)` integrates a
sampled function by the composite trapezoidal rule::

    x = np.linspace(0, np.pi, num=128)
    y = np.sin(x)
    np.trapz(y, x)             # ~ 2.0

Pass ``dx=`` when the sample spacing is uniform and only
the step matters; pass ``x=`` when the samples are not
evenly spaced. The right call for integrating already-
captured sensor data, where the analytic form is not
available.

Numerical integration of a callable
-----------------------------------

When the integrand is a Python function rather than a
buffer of samples, :mod:`scipy.integrate` exposes four
quadrature algorithms:

* :func:`~ulab.scipy.integrate.quad(f, a, b, order=5, eps=...)`
  -- adaptive Gauss-Kronrod. The right default for
  smooth integrands. Returns ``(value, error)``.
* :func:`~ulab.scipy.integrate.romberg(f, a, b, steps=100, eps=...)`
  -- classical Romberg / Newton-Cotes. Returns a single
  float. Deprecated upstream; included for compatibility.
* :func:`~ulab.scipy.integrate.simpson(f, a, b, steps=100, eps=...)`
  -- adaptive Simpson's rule. Returns a single float.
* :func:`~ulab.scipy.integrate.tanhsinh(f, a, b, levels=6, eps=...)`
  -- double-exponential quadrature. Use when the
  integrand has endpoint singularities or an infinite
  limit. Returns ``(value, error)``.

The Gaussian integral as a worked example::

    from math import exp, pi, sqrt
    from ulab import numpy as np
    from ulab import scipy as sp

    f = lambda x: exp(-x * x)
    value, err = sp.integrate.tanhsinh(f, -np.inf, np.inf)
    print("approx:", value, "   exact:", sqrt(pi))

Output::

    approx: 1.7724538...   exact: 1.7724538...

Numerical integration is most accurate on cams whose
firmware uses double-precision floats. With single
precision the routines still work, but the achievable
tolerance is lower.

Root finding and minimisation
-----------------------------

:mod:`scipy.optimize` covers three classic
single-variable solvers. Each iteration calls back into
the user-supplied Python function, so the speedup over a
pure-Python solver is modest (roughly 2x); the
convenience is in not having to write the solver.

* :func:`~ulab.scipy.optimize.bisect(f, a, b, xtol=..., maxiter=...)`
  -- find a root of ``f`` on ``[a, b]`` by halving the
  interval. ``f(a)`` and ``f(b)`` must have opposite
  signs::

      def f(x):
          return x * x - 1

      sp.optimize.bisect(f, 0, 4)        # ~1.0

* :func:`~ulab.scipy.optimize.newton(f, x0, tol=..., rtol=..., maxiter=...)`
  -- find a root using secant / Newton-Raphson
  iteration::

      def f(x):
          return x * x * x - 2.0

      sp.optimize.newton(f, 3., tol=0.001, rtol=0.01)
      # ~1.260

* :func:`~ulab.scipy.optimize.fmin(f, x0, xatol=..., fatol=..., maxiter=...)`
  -- find a local minimum using the downhill-simplex
  (Nelder-Mead) method::

      def f(x):
          return (x - 1) ** 2 - 1

      sp.optimize.fmin(f, 3.0)           # ~1.0

Special functions
-----------------

:mod:`scipy.special` exposes a handful of statistical
and probability functions that behave like universal
functions -- they accept a scalar, an iterable, or an
:class:`~ulab.numpy.ndarray` and return a float
:class:`~ulab.numpy.ndarray`::

    x = np.linspace(0, 4, num=8)

    sp.special.erf(x)         # error function
    sp.special.erfc(x)        # complementary error function
    sp.special.gamma(x + 1)   # gamma function
    sp.special.gammaln(x + 1) # log-gamma function

The error function and its complement appear in the CDF
of a Gaussian; the gamma functions show up in beta /
chi-squared / student-t calculations.

Random numbers
--------------

:mod:`numpy.random` provides a
:class:`~ulab.numpy.random.Generator` class that draws
samples from common distributions. The generator is
stateful: each call advances its internal state, so
consecutive calls return independent samples::

    from ulab import numpy as np

    rng = np.random.Generator(seed=42)

    rng.random(size=5)             # 5 uniform [0.0, 1.0) samples
    rng.uniform(low=-1.0, high=1.0, size=10)
    rng.normal(loc=0.0, scale=1.0, size=(2, 4))

The output dtype is always ``float``. ``size=`` accepts
an integer (1-D output) or a tuple (n-D output); when
omitted, a single Python float is returned.

The generator is suitable for simulation, dithering,
synthetic test data, and any other application where
cryptographic strength is not required. It is **not**
suitable for keys or tokens.

What is *not* covered here
--------------------------

A handful of routines exposed by the reference -- the
``.npy`` I/O helpers (:func:`~ulab.numpy.load`,
:func:`~ulab.numpy.save`,
:func:`~ulab.numpy.loadtxt`,
:func:`~ulab.numpy.savetxt`),
:func:`~ulab.numpy.set_printoptions`, the experimental
:func:`~ulab.scipy.optimize.curve_fit` stub -- are
straightforward extensions of patterns already shown on
this page. See :doc:`/library/omv.ulab.numpy` and
:doc:`/library/omv.ulab.scipy` for the complete
argument-level reference.

Firmware availability
---------------------

Whether each submodule is actually present depends on
how the firmware on the cam was built. Calling a
function the firmware does not include raises
:exc:`AttributeError`. ``dir(sp)``,
``dir(sp.optimize)``, ``dir(np.random)`` and friends
report what is available on the cam being targeted.
