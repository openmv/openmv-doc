:mod:`scipy.linalg` --- Linear algebra routines
====================================================

.. module:: scipy.linalg
   :synopsis: Linear algebra routines

The :mod:`scipy.linalg` submodule provides a small selection of linear
solvers that operate on :class:`numpy.ndarray` objects.

Functions
---------

.. function:: cho_solve(c: ndarray, b: ndarray) -> ndarray

   Solve the linear system ``A @ x = b`` given the Cholesky
   factorization of ``A``. Unlike CPython's ``scipy.linalg.cho_solve``
   the function takes the Cholesky-factorised matrix directly rather
   than a ``(c, lower)`` tuple.

   :param c: the Cholesky factor of ``A`` as a square two-dimensional
             :class:`numpy.ndarray`.
   :param b: a one-dimensional :class:`numpy.ndarray` giving the
             right-hand side.
   :return: the solution vector ``x`` as a float :class:`numpy.ndarray`.

.. function:: solve_triangular(a: ndarray, b: ndarray, lower: bool = False) -> ndarray

   Solve the linear system ``a @ x = b`` for ``x`` assuming that ``a``
   is a triangular matrix.

   :param a: a square two-dimensional :class:`numpy.ndarray`. Only the
             upper or lower triangle is read, depending on *lower*.
   :param b: a one-dimensional :class:`numpy.ndarray` giving the
             right-hand side.
   :param lower: if ``True``, take the data from the lower triangle of
                 *a*; otherwise from the upper triangle. Default
                 ``False``.
   :return: the solution vector ``x`` as a float :class:`numpy.ndarray`.

   *a* itself need not be triangular: values outside the selected
   triangle are simply treated as zero. In that case ``a @ x`` will not
   reproduce *b*.
