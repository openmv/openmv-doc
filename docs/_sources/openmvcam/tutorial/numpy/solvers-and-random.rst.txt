Solvers and random numbers
==========================

The previous page treated the array as a *sampled
function* -- interpolating, fitting, integrating data the
application already has in a buffer. A different class of
problem starts from the other end: the function is defined
by Python code and the goal is to find some property of
it. Where is its root? Its minimum? Its integral over a
given interval?

The :mod:`scipy.integrate` and :mod:`scipy.optimize`
submodules cover that work. Each algorithm calls back into
the user-supplied Python function, so the per-iteration
cost is higher than a buffer reduction -- the convenience
is in not having to write the solver.

This page is also the natural home for the rest of the
:mod:`scipy` surface that comes up in everyday camera
work: the statistical special functions (error function,
gamma) and the pseudo-random number generator from
:mod:`numpy.random`.

The standard imports::

    from ulab import numpy as np
    from ulab import scipy as sp

Numerical integration of a callable
-----------------------------------

When the integrand is a Python function rather than a
buffer of samples, :mod:`scipy.integrate` exposes four
quadrature algorithms:

* :func:`~ulab.scipy.integrate.quad(f, a, b, order=5, eps=...)`
  -- adaptive Gauss-Kronrod. The right default for smooth
  integrands. Returns ``(value, error)``.
* :func:`~ulab.scipy.integrate.romberg(f, a, b, steps=100, eps=...)`
  -- classical Romberg / Newton-Cotes. Returns a single
  float. Deprecated upstream; included for compatibility.
* :func:`~ulab.scipy.integrate.simpson(f, a, b, steps=100, eps=...)`
  -- adaptive Simpson's rule. Returns a single float.
* :func:`~ulab.scipy.integrate.tanhsinh(f, a, b, levels=6, eps=...)`
  -- double-exponential quadrature. Use when the
  integrand has endpoint singularities or an infinite
  limit. Returns ``(value, error)``.

The Gaussian integral evaluated with the double-
exponential rule::

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

Numerical integration is most accurate on cams whose
``float`` width is 64 bits. With single precision the
routines still work, but the achievable tolerance is
lower.

Root finding and minimisation
-----------------------------

:mod:`scipy.optimize` covers three classic single-variable
solvers. Each iteration calls back into the user-supplied
Python function, so the speedup over a pure-Python solver
is modest (roughly 2x); the convenience is in not having
to write the solver.

* :func:`~ulab.scipy.optimize.bisect(f, a, b, xtol=..., maxiter=...)`
  -- find a root of ``f`` on ``[a, b]`` by halving the
  interval. ``f(a)`` and ``f(b)`` must have opposite
  signs::

      def f(x):
          return x * x - 1

      sp.optimize.bisect(f, 0, 4)        # ~1.0

* :func:`~ulab.scipy.optimize.newton(f, x0, tol=..., rtol=..., maxiter=...)`
  -- find a root using secant / Newton-Raphson iteration::

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

The single-variable scope is enough for most camera-side
optimisations -- a sensor's calibration constant, the
gain that maximises a contrast measurement, the threshold
where a histogram bimodality is sharpest. For
multi-variable problems, the right answer is usually to
re-formulate the problem as a small linear-algebra solve
(see :doc:`linalg`) rather than reach for a general
nonlinear optimiser.

Special functions
-----------------

:mod:`scipy.special` exposes a handful of statistical and
probability functions that behave like universal
functions -- they accept a scalar, an iterable, or an
:class:`~ulab.numpy.ndarray` and return a float
:class:`~ulab.numpy.ndarray`::

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
:class:`~ulab.numpy.random.Generator` class that draws
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

A typical camera use is *dithering* a quantised value
before display or before quantising to a small dtype.
Adding ``rng.uniform(-0.5, 0.5, size=img.shape)`` to a
float-valued image before rounding to ``uint8`` breaks
the banding that would otherwise appear in smooth
gradients.

Build-time availability
-----------------------

Whether each submodule is actually present depends on how
the cam was built. Calling a function the cam does not
include raises :exc:`AttributeError`. ``dir(sp)``,
``dir(sp.optimize)``, ``dir(np.random)`` and friends
report what is available on the cam being targeted.
:data:`ulab.__version__` carries the build's dimensional
limit (``-2D`` or ``-4D``) and a ``-c`` suffix when
complex-number support is included.

For the complete argument-level reference of every
function on this page and the previous one, see
:doc:`/library/omv.ulab.numpy`,
:doc:`/library/omv.ulab.scipy`, and the per-submodule
references they link to.
