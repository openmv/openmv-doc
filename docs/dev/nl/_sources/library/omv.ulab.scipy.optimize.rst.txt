:mod:`scipy.optimize` --- Root finding and minimization
============================================================

.. module:: scipy.optimize
   :synopsis: Root-finding and minimization routines

The :mod:`scipy.optimize` submodule provides simple routines for finding
roots and minima of user-defined scalar functions. Because each
iteration must call back into the user-supplied Python callable, the
speed gain over a pure-Python implementation is modest (typically about
2x).

Functions
---------

.. function:: bisect(f: Callable[[float], float], a: float, b: float, *, xtol: float = xtolerance, maxiter: int = 100) -> float

   Find a root of *f* in the bracket ``[a, b]`` using the bisection
   method. *f* must change sign on the interval.

   :param f: callable taking a single ``float`` and returning a ``float``.
   :param a: left endpoint of the bracket.
   :param b: right endpoint of the bracket.
   :param xtol: absolute tolerance on the root location (default
                ``xtolerance``).
   :param maxiter: maximum number of bisections (default ``100``).
   :return: the location of the root as a ``float``.
   :raises ValueError: if ``f(a) * f(b) > 0``.

.. function:: curve_fit(f: Callable[..., float], xdata: ndarray | list | tuple, ydata: ndarray | list | tuple, p0: ndarray | list | tuple, *, xatol: float = xtolerance, fatol: float = xtolerance, maxiter: int | None = None) -> None

   Stub for non-linear least-squares curve fitting (Levenberg-Marquardt).
   Present in the module table for API compatibility but currently a
   placeholder: it accepts and validates its arguments but always returns
   ``None``. Prefer :func:`fmin` or external libraries until this routine
   is implemented.

   :param f: model callable ``f(x, *params) -> float``.
   :param xdata: 1-D array-like of independent values.
   :param ydata: 1-D array-like of dependent values, same length as *xdata*.
   :param p0: 1-D array-like of initial parameter estimates.

.. function:: fmin(f: Callable[[float], float], x0: float, *, xatol: float = xtolerance, fatol: float = xtolerance, maxiter: int = 200) -> float

   Find the position of a local minimum of the scalar function *f*
   using the downhill simplex (Nelder-Mead) method.

   :param f: callable taking a single ``float`` and returning a ``float``.
   :param x0: initial guess.
   :param xatol: absolute tolerance on the position (default
                 ``xtolerance``).
   :param fatol: absolute tolerance on the function value (default
                 ``xtolerance``).
   :param maxiter: maximum number of iterations (default ``200``).
   :return: the location of the minimum as a ``float``.

.. function:: newton(f: Callable[[float], float], x0: float, *, tol: float = xtolerance, rtol: float = rtolerance, maxiter: int = 50) -> float

   Find a zero of the real-valued, scalar function *f* by the
   Newton-Raphson (secant) method.

   :param f: callable taking a single ``float`` and returning a ``float``.
   :param x0: initial guess.
   :param tol: absolute tolerance on the root (default ``xtolerance``).
   :param rtol: relative tolerance on the root (default ``rtolerance``).
   :param maxiter: maximum number of iterations (default ``50``).
   :return: the location of the root as a ``float``.
