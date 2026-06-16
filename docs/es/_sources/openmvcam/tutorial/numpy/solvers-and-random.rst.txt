Solvers and random numbers
==========================

When the function under study is defined by Python code
rather than a buffer of samples, a different family of
tools is the right call: where is the function's root,
its minimum, its integral over a given interval? The
:mod:`scipy.integrate` and :mod:`scipy.optimize`
submodules cover that work. Each algorithm calls back
into the user-supplied Python function, so the
per-iteration cost is higher than a buffer reduction;
the convenience is in not having to write the solver.

The :mod:`scipy.special` submodule covers the
statistical special functions (error function, gamma)
that come up when computing a probability distribution's
*cumulative distribution function* (CDF, the probability
that a sample is at most a given value) or *probability
density function* (PDF, the relative likelihood at a
given value). :mod:`numpy.random` covers the
pseudo-random generator for dithering, simulation, and
synthetic test data.

Numerical integration of a callable
-----------------------------------

When the integrand is a Python function rather than a
buffer of samples, :mod:`scipy.integrate` exposes four
quadrature algorithms:

* :func:`~scipy.integrate.quad`
  -- adaptive Gauss-Kronrod. The right default for smooth
  integrands. Returns ``(value, error)``.
* :func:`~scipy.integrate.romberg`
  -- classical Romberg / Newton-Cotes. Returns a single
  float. Deprecated upstream; included for compatibility.
* :func:`~scipy.integrate.simpson`
  -- adaptive Simpson's rule. Returns a single float.
* :func:`~scipy.integrate.tanhsinh`
  -- double-exponential quadrature. Use when the
  integrand has endpoint singularities or an infinite
  limit. Returns ``(value, error)``.

The Gaussian integral evaluated with the
double-exponential rule (``tanhsinh``)::

    from math import exp
    from math import pi
    from math import sqrt
    from ulab import numpy as np
    from ulab import scipy as sp

    f = lambda x: exp(-x * x)
    value, err = sp.integrate.tanhsinh(f, -np.inf, np.inf)
    print("approx:", value, "   exact:", sqrt(pi))

Output::

    approx: 1.7724538...   exact: 1.7724538...

Root finding and minimisation
-----------------------------

:mod:`scipy.optimize` covers three classic single-variable
solvers. Each iteration calls back into the user-supplied
Python function, so the speedup over a pure-Python solver
is modest (roughly 2x); the convenience is in not having
to write the solver.

* :func:`~scipy.optimize.bisect`
  -- find a root of ``f`` on ``[a, b]`` by halving the
  interval. ``f(a)`` and ``f(b)`` must have opposite
  signs::

      def f(x):
          return x * x - 1

      sp.optimize.bisect(f, 0, 4)        # ~1.0

* :func:`~scipy.optimize.newton`
  -- find a root using secant / Newton-Raphson iteration::

      def f(x):
          return x * x * x - 2.0

      sp.optimize.newton(f, 3., tol=0.001, rtol=0.01)
      # ~1.260

* :func:`~scipy.optimize.fmin`
  -- find a local minimum using the downhill-simplex
  (Nelder-Mead) method::

      def f(x):
          return (x - 1) ** 2 - 1

      sp.optimize.fmin(f, 3.0)           # ~1.0

The single-variable scope is enough for most camera-side
optimisations -- a sensor's calibration constant, the
gain that maximises a contrast measurement, the threshold
where a histogram bimodality is sharpest. For
multi-variable problems, the right answer is usually to
re-formulate the problem as a small linear-algebra solve
rather than reach for a general nonlinear optimiser.

Special functions
-----------------

:mod:`scipy.special` exposes a handful of statistical and
probability functions that behave like universal
functions -- they accept a scalar, an iterable, or an
:class:`~numpy.ndarray` and return a float
:class:`~numpy.ndarray`::

    x = np.linspace(0, 4, num=8)

    sp.special.erf(x)         # error function
    sp.special.erfc(x)        # complementary error function
    sp.special.gamma(x + 1)   # gamma function
    sp.special.gammaln(x + 1) # log-gamma function

The error function and its complement appear in the CDF
of a Gaussian -- the application of choice for converting
between a measured z-score and a probability or for
computing the tail integral of a normal distribution. The
gamma and log-gamma functions show up in beta /
chi-squared / student-t calculations; ``gammaln`` is the
numerically stable form for large arguments where
``gamma`` itself would overflow.

Random numbers
--------------

:mod:`numpy.random` provides a
:class:`~numpy.random.Generator` class that draws
samples from common distributions. The generator is
stateful: each call advances its internal state, so
consecutive calls return independent samples::

    from ulab import numpy as np

    rng = np.random.Generator(seed=42)

    rng.random(size=5)             # 5 uniform [0.0, 1.0) samples
    rng.uniform(low=-1.0, high=1.0, size=10)
    rng.normal(loc=0.0, scale=1.0, size=(2, 4))

The output dtype is always ``float``. ``size=`` accepts an
integer (1-D output) or a tuple (n-D output); when
omitted, a single Python float is returned.

The generator is suitable for simulation, dithering,
synthetic test data, and any other application where
cryptographic strength is not required. It is **not**
suitable for keys or tokens; use the system random source
through :mod:`os` for those.

Build-time availability
-----------------------

Whether each submodule is actually present depends on
how the cam was built. :mod:`scipy.optimize` and
:mod:`scipy.special` are not enabled on every cam;
calling a function the cam does not include raises
:exc:`AttributeError`. ``dir(sp)``, ``dir(sp.optimize)``,
``dir(np.random)`` and friends report what is available
on the cam being targeted.
