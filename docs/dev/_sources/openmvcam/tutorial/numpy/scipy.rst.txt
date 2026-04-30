scipy on the OpenMV Cam
=======================

The ``scipy`` submodule of ``ulab`` is a small subset of CPython's
``scipy``, picked for usefulness on a microcontroller. It is
imported as::

   from ulab import scipy as sp

The submodules are:

* ``sp.signal`` -- signal processing (one function: ``sosfilt``).
* ``sp.linalg`` -- triangular solvers and Cholesky-factorised
  solver.
* ``sp.optimize`` -- 1-D root finding and minimisation.
* ``sp.integrate`` -- numerical integration (quadrature).
* ``sp.special`` -- a handful of special functions (``erf``,
  ``gamma``, ...).

If you call into a function that is not compiled into your firmware,
you will get an ``AttributeError``. ``dir(sp)`` and
``dir(sp.signal)`` etc. tell you what is actually present.

scipy.signal
------------

``sp.signal.sosfilt(sos, x)`` filters a 1-D signal using cascaded
second-order sections (a numerically robust way to apply IIR
filters). ``sos`` is a sequence of length-6 sections::

   from ulab import numpy as np
   from ulab import scipy as sp

   x = np.array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
   sos = [[1, 2, 3, 1, 5, 6],
          [1, 2, 3, 1, 5, 6]]
   y = sp.signal.sosfilt(sos, x)

You can pass an initial state ``zi=`` (shape ``(n_sections, 2)``) to
continue filtering across separate buffers. When ``zi`` is given, the
function returns ``(y, zf)`` -- the filtered output and the final
state -- so you can pipe ``zf`` into the next call's ``zi``::

   y0, zf0 = sp.signal.sosfilt(sos, buffer0, zi=zi)
   y1, zf1 = sp.signal.sosfilt(sos, buffer1, zi=zf0)
   # ...

This is the standard way to implement a streaming filter on
buffered data.

scipy.linalg
------------

Two solver functions:

* ``sp.linalg.solve_triangular(a, b, lower=False)`` -- solve
  ``a @ x = b`` with the assumption that ``a`` is triangular. The
  ``lower`` keyword picks which triangle to use. Cheap and
  numerically well-behaved when ``a`` is genuinely triangular::

     A = np.array([[3, 0, 0, 0],
                   [2, 1, 0, 0],
                   [1, 0, 1, 0],
                   [1, 2, 1, 8]])
     b = np.array([4, 2, 4, 2])
     x = sp.linalg.solve_triangular(A, b, lower=True)

* ``sp.linalg.cho_solve(L, b)`` -- given a Cholesky factor ``L``
  (the kind returned by ``np.linalg.cholesky``), solve ``A @ x = b``
  where ``A = L @ L.T``. Faster and more accurate than
  ``np.linalg.inv`` when you only want ``x``::

     L = np.linalg.cholesky(A)
     x = sp.linalg.cho_solve(L, b)

scipy.optimize
--------------

``ulab`` exposes three classic 1-D solvers. Because they have to
call back into your Python function on every iteration, the speedup
over a pure-Python implementation is modest -- around 2x in
practice.

bisect
~~~~~~

``sp.optimize.bisect(f, a, b, xtol=2.4e-7, maxiter=100)`` finds a
root of a 1-D function by repeatedly halving an interval where the
function changes sign::

   def f(x):
       return x*x - 1

   sp.optimize.bisect(f, 0, 4)
   # ~1.0
   sp.optimize.bisect(f, 0, 4, maxiter=8)
   sp.optimize.bisect(f, 0, 4, xtol=0.1)

newton
~~~~~~

``sp.optimize.newton(f, x0, tol=..., rtol=..., maxiter=...)`` finds
a root using a secant / Newton-Raphson iteration starting from
``x0``::

   def f(x):
       return x*x*x - 2.0

   sp.optimize.newton(f, 3., tol=0.001, rtol=0.01)
   # ~1.260...

fmin
~~~~

``sp.optimize.fmin(f, x0, xatol=..., fatol=..., maxiter=...)`` finds
a local minimum using the downhill-simplex method::

   def f(x):
       return (x-1)**2 - 1

   sp.optimize.fmin(f, 3.0)
   # ~1.0

scipy.integrate
---------------

Numerical integration, also called quadrature. Four algorithms are
available:

* ``sp.integrate.quad(f, a, b, order=5, eps=...)`` -- Adaptive
  Gauss-Kronrod (G10, K21). General-purpose; this is the right
  default for smooth, well-behaved integrands. Returns a tuple of
  ``(value, error_estimate)``.

* ``sp.integrate.romberg(f, a, b, steps=100, eps=...)`` -- classical
  Romberg / Newton-Cotes method. Returns a single float. Deprecated
  upstream in favour of ``quad``; included for compatibility.

* ``sp.integrate.simpson(f, a, b, steps=100, eps=...)`` -- adaptive
  Simpson's rule. Returns a single float.

* ``sp.integrate.tanhsinh(f, a, b, levels=6, eps=...)`` -- tanh-sinh
  (double-exponential) quadrature. The right tool when the integrand
  has endpoint singularities or one of the limits is infinite.
  Returns a tuple of ``(value, error_estimate)``.

Example -- the Gaussian integral::

   from math import exp, pi, sqrt
   from ulab import numpy as np
   from ulab import scipy as sp

   f = lambda x: exp(-x*x)
   value, err = sp.integrate.tanhsinh(f, -np.inf, np.inf)
   print('approx:', value, '   exact:', sqrt(pi))

Note: numerical integration is most accurate when MicroPython is
built with double-precision floats (``float64``). With ``float32``
the routines still work but the achievable tolerance is lower.

scipy.special
-------------

The ``special`` module provides a few statistical / probability
functions that work like universal functions: they accept a scalar,
an iterable, or an ``ndarray`` and return a float ``ndarray``::

   from ulab import numpy as np
   from ulab import scipy as sp

   x = np.linspace(0, 4, num=8)

   sp.special.erf(x)         # error function
   sp.special.erfc(x)        # complementary error function
   sp.special.gamma(x + 1)   # gamma function
   sp.special.gammaln(x + 1) # log-gamma function

API reference
-------------

* :doc:`/library/omv.ulab.scipy` -- top-level ``scipy`` module.
* :doc:`/library/omv.ulab.scipy.signal` -- ``sosfilt``.
* :doc:`/library/omv.ulab.scipy.linalg` -- triangular solvers and
  ``cho_solve``.
* :doc:`/library/omv.ulab.scipy.optimize` -- root finding and
  minimisation.
* :doc:`/library/omv.ulab.scipy.integrate` -- numerical integration.
* :doc:`/library/omv.ulab.scipy.special` -- special functions.
