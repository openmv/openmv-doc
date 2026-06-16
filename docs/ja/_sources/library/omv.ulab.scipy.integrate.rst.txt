:mod:`scipy.integrate` --- Numerical integration
=====================================================

.. module:: scipy.integrate
   :synopsis: Numerical integration routines

The :mod:`scipy.integrate` submodule provides numerical integration
routines for real-valued, single-variable functions. The algorithms are
not ported from CPython's ``scipy.integrate`` but derived from the
reference implementation at https://www.genivia.com/qthsh.html.

Numerical integration works best with float64 math enabled. With float32
math the routines still work, with reduced precision. The required error
tolerance can be specified via the ``eps`` keyword argument; the
default is the compile-time ``etolerance`` value (``1e-14`` for fp64,
``1e-8`` for fp32). Complex numbers are not supported.

Functions
---------

.. function:: quad(f: Callable[[float], float], a: float, b: float, *, order: int = 5, eps: float = etolerance) -> tuple[float, float]

   Integrate *f* from *a* to *b* using an Adaptive Gauss-Kronrod
   (G10, K21) quadrature. This is the recommended general-purpose
   integrator.

   :param f: callable taking a single ``float`` and returning a ``float``.
   :param a: lower integration limit.
   :param b: upper integration limit.
   :param order: order of integration (default ``5``).
   :param eps: error tolerance (default ``etolerance``).
   :return: a 2-tuple ``(result, error)`` of floats giving the value of
            the integral and an error estimate.

.. function:: romberg(f: Callable[[float], float], a: float, b: float, *, steps: int = 100, eps: float = etolerance) -> float

   Integrate *f* from *a* to *b* using Romberg's method, a Newton-Cotes
   formula that evaluates the integrand at equally spaced points. Best
   suited to integrands with continuous derivatives. Note that
   ``scipy.integrate.romberg`` is deprecated in CPython since SciPy
   1.12.0; prefer :func:`quad` for new code.

   :param f: callable taking a single ``float`` and returning a ``float``.
   :param a: lower integration limit.
   :param b: upper integration limit.
   :param steps: number of steps (default ``100``).
   :param eps: error tolerance (default ``etolerance``).
   :return: the value of the integral as a ``float``.

.. function:: simpson(f: Callable[[float], float], a: float, b: float, *, steps: int = 100, eps: float = etolerance) -> float

   Integrate *f* from *a* to *b* using adaptive Simpson's rule. Unlike
   CPython's ``scipy.integrate.simpson`` this function takes a callable
   and chooses the sample spacing internally rather than taking an array
   of pre-computed function values.

   :param f: callable taking a single ``float`` and returning a ``float``.
   :param a: lower integration limit.
   :param b: upper integration limit.
   :param steps: number of steps (default ``100``).
   :param eps: error tolerance (default ``etolerance``).
   :return: the value of the integral as a ``float``.

.. function:: tanhsinh(f: Callable[[float], float], a: float, b: float, *, levels: int = 6, eps: float = etolerance) -> tuple[float, float]

   Integrate *f* from *a* to *b* using the Tanh-Sinh, Sinh-Sinh, and
   Exp-Sinh (double-exponential) quadrature family. This is the routine
   to use when the integrand has singularities or infinite derivatives
   at the endpoints, and it is the only routine in this submodule that
   accepts infinite integration limits (e.g. ``-np.inf``, ``np.inf``).

   :param f: callable taking a single ``float`` and returning a ``float``.
   :param a: lower integration limit; may be ``-np.inf``.
   :param b: upper integration limit; may be ``np.inf``.
   :param levels: number of refinement levels (default ``6``).
   :param eps: error tolerance (default ``etolerance``).
   :return: a 2-tuple ``(result, error)`` of floats giving the value of
            the integral and an error estimate.
