Linear algebra
==============

Linear algebra on a camera is small-matrix work: a 3x3
rotation that fuses an IMU sample into the world frame,
a calibration matrix that rectifies a lens, a Kalman
filter's state-covariance update, a polynomial fit
whose normal equations come out as a tiny linear solve.
The :mod:`numpy.linalg` and :mod:`scipy.linalg`
submodules cover exactly that scale.

The functions live in two modules. Matrix-product
operations are at the :mod:`numpy` top level;
decompositions and the matrix inverse are under
:mod:`numpy.linalg`; the dedicated linear-system
solvers are under :mod:`scipy.linalg`::

    from ulab import numpy as np
    from ulab import scipy as sp

    np.dot(a, b)
    np.linalg.inv(m)
    sp.linalg.solve_triangular(L, b, lower=True)

What is available
-----------------

* :func:`~ulab.numpy.dot` -- matrix or vector product.
* :func:`~ulab.numpy.cross` -- 3-D vector cross product.
* :func:`~ulab.numpy.trace` -- sum of the diagonal.
* :func:`~ulab.numpy.linalg.inv` -- matrix inverse.
* :func:`~ulab.numpy.linalg.det` -- determinant.
* :func:`~ulab.numpy.linalg.cholesky` -- Cholesky
  decomposition (symmetric positive-definite input).
* :func:`~ulab.numpy.linalg.eig` -- eigenvalues and
  eigenvectors of a real symmetric matrix.
* :func:`~ulab.numpy.linalg.norm` -- 2-norm of a vector
  or matrix.
* :func:`~ulab.numpy.linalg.qr` -- QR decomposition with
  ``mode='reduced'`` (default) or ``mode='complete'``.
* :func:`~ulab.scipy.linalg.solve_triangular` -- solve
  ``A @ x = b`` when ``A`` is triangular.
* :func:`~ulab.scipy.linalg.cho_solve` -- solve
  ``A @ x = b`` given a Cholesky factor of ``A``.

dot, cross, trace
-----------------

The matrix-product functions cover the work that ``@``
would do on the desktop (``@`` is not implemented on
``ndarray``)::

    a = np.array([1, 2, 3])
    b = np.array([4, 5, 6])

    np.dot(a, b)             # 32.0 (scalar product)
    np.cross(a, b)           # array([-3.0, 6.0, -3.0])

    m = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
    np.dot(m, a)             # matrix-vector product
    np.dot(m, m)             # matrix-matrix product
    np.trace(m)              # 1 + 5 + 9 = 15.0

The result of :func:`~ulab.numpy.dot` is always of dtype
``float``.

inv and det
-----------

::

    m = np.array([[1, 2, 3, 4],
                  [4, 5, 6, 4],
                  [7, 9, 9, 4],
                  [3, 4, 5, 6]])
    print(np.linalg.inv(m))
    print(np.linalg.det(m))

The inverse is computed by Gauss-Jordan elimination, so
:func:`~ulab.numpy.linalg.inv` raises :exc:`ValueError`
when the matrix is singular (a diagonal entry becomes
zero during elimination). The RAM cost is roughly twice
the size of the input.

The determinant re-uses the same elimination -- runtime
is essentially the same as the inverse.

When the application's goal is to *solve* a linear
system, do not invert and multiply -- prefer the
dedicated solvers below. Both are faster and
better-behaved numerically.

cholesky
--------

For a symmetric positive-definite matrix ``A``,
:func:`~ulab.numpy.linalg.cholesky` returns a
lower-triangular ``L`` such that ``A = L @ L.T``::

    a = np.array([[25, 15, -5],
                  [15, 18,  0],
                  [-5,  0, 11]])
    L = np.linalg.cholesky(a)

If the input is not positive definite or not symmetric,
:exc:`ValueError` is raised.

The Cholesky factor is half the work of an LU
factorisation and is the right starting point for any
problem whose matrix is known to be symmetric positive
definite (covariance updates, normal equations from a
least-squares fit).

eig
---

:func:`~ulab.numpy.linalg.eig` works only on *real
symmetric* matrices. Non-symmetric matrices raise
:exc:`ValueError`. It returns a 2-tuple
``(eigenvalues, eigenvectors)``::

    a = np.array([[1, 2, 1, 4],
                  [2, 5, 3, 5],
                  [1, 3, 6, 1],
                  [4, 5, 1, 7]], dtype=np.uint8)
    x, y = np.linalg.eig(a)

Notes:

* The eigenvalues come back in no particular order.
  Apply :func:`~ulab.numpy.sort` (and the same
  permutation to the eigenvectors via
  :func:`~ulab.numpy.argsort`) when a sorted order
  matters.
* An eigenvector is unique only up to a non-zero scalar,
  so the *sign* of individual eigenvectors is not
  uniquely defined. Two correct runs may produce vectors
  of opposite sign; this is harmless.

norm
----

The Euclidean (Frobenius) norm of a vector or matrix::

    v = np.array([1, 2, 3, 4, 5])
    m = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])

    np.linalg.norm(v)        # 7.416...
    np.linalg.norm(m)        # 16.881...

The optional ``axis=`` keyword takes the norm along a
single axis instead of over the whole array.

qr
--

:func:`~ulab.numpy.linalg.qr` factors a rectangular
matrix ``A`` (shape ``(M, N)``) into an orthonormal
``Q`` and an upper-triangular ``R`` such that
``A == Q @ R``::

    A = np.arange(6).reshape((3, 2))

    q, r = np.linalg.qr(A)
    # mode='reduced' (default): q is (3, 2), r is (2, 2)

    q, r = np.linalg.qr(A, mode='complete')
    # q is (3, 3), r is (3, 2)

The decomposition is implemented via successive Givens
rotations. The right choice for least-squares problems
where the matrix is not symmetric.

Solving systems
---------------

The two dedicated solvers under
:mod:`ulab.scipy.linalg` are both faster and more
accurate than ``np.dot(np.linalg.inv(A), b)``:

* :func:`~ulab.scipy.linalg.solve_triangular(a, b, lower=False)`
  -- solve ``a @ x = b`` assuming ``a`` is triangular::

      A = np.array([[3, 0, 0, 0],
                    [2, 1, 0, 0],
                    [1, 0, 1, 0],
                    [1, 2, 1, 8]])
      b = np.array([4, 2, 4, 2])
      x = sp.linalg.solve_triangular(A, b, lower=True)

* :func:`~ulab.scipy.linalg.cho_solve(L, b)` -- given a
  Cholesky factor ``L``, solve ``A @ x = b`` where
  ``A = L @ L.T``::

      L = np.linalg.cholesky(A)
      x = sp.linalg.cho_solve(L, b)

Reach for these instead of inverting whenever the
structure of ``A`` lets you -- they save elimination
work *and* the explicit inverse.

A worked example: small linear system
-------------------------------------

::

    A = np.array([[3, 0, 1, 1],
                  [0, 1, 0, 2],
                  [1, 0, 1, 1],
                  [1, 2, 1, 8]])
    b = np.array([4, 2, 4, 2])

    x = np.dot(np.linalg.inv(A), b)
    print(x)
    print(np.dot(A, x))         # should equal b

The same problem can be expressed by factoring ``A`` and
calling the appropriate solver -- faster and more
accurate when ``A`` has the right structure.

For the complete argument-level reference, see
:doc:`/library/omv.ulab.numpy.linalg` and
:doc:`/library/omv.ulab.scipy.linalg`.
