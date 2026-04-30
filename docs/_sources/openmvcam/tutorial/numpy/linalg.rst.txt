Linear algebra
==============

``ulab`` provides a focused, microcontroller-friendly subset of
``numpy.linalg``. Everything you need for small-matrix problems --
camera calibration, IMU sensor fusion, simple kinematics -- is here.

The functions are accessed as ``np.linalg.*``::

   from ulab import numpy as np

   inv  = np.linalg.inv(matrix)
   det  = np.linalg.det(matrix)
   evs  = np.linalg.eig(matrix)

The available functions are:

* ``np.linalg.cholesky(a)`` -- Cholesky decomposition of a symmetric
  positive-definite matrix.
* ``np.linalg.det(a)`` -- determinant.
* ``np.linalg.eig(a)`` -- eigenvalues and eigenvectors of a real
  symmetric matrix.
* ``np.linalg.inv(a)`` -- matrix inverse.
* ``np.linalg.norm(a)`` -- 2-norm of a vector or matrix.
* ``np.linalg.qr(a, mode='reduced')`` -- QR decomposition.

Plus the matrix-product functions, available at the ``np`` top level:

* ``np.dot(a, b)`` -- matrix / vector product;
* ``np.cross(a, b)`` -- 3-D vector cross product;
* ``np.trace(a)`` -- sum of diagonal elements.

inv: matrix inverse
-------------------

::

   m = np.array([[1, 2, 3, 4],
                 [4, 5, 6, 4],
                 [7, 8.6, 9, 4],
                 [3, 4, 5, 6]])
   print(np.linalg.inv(m))

The inverse is computed by Gaussian elimination, so ``inv`` raises
``ValueError`` when the matrix is singular (a diagonal entry becomes
zero during elimination). The cost in RAM is roughly twice the size
of the input, and in time is roughly proportional to the number of
entries (a 2x2 ~ 65 us, 4x4 ~ 105 us, 8x8 ~ 300 us on STM32-class
hardware).

If you need to *solve* a linear system, do not invert and multiply
-- use the dedicated solvers in :doc:`scipy`
(``scipy.linalg.solve_triangular`` and ``scipy.linalg.cho_solve``)
which are both faster and numerically better behaved.

det: determinant
----------------

::

   a = np.array([[1, 2], [3, 4]], dtype=np.uint8)
   print(np.linalg.det(a))            # -2.0

The result is always a float, regardless of the input dtype. The
implementation re-uses ``inv``'s elimination, so the runtime is
essentially the same.

cholesky: Cholesky decomposition
--------------------------------

For a symmetric positive-definite matrix ``A``, ``cholesky`` returns
a lower-triangular ``L`` such that ``A = L @ L.T``::

   a = np.array([[25, 15, -5],
                 [15, 18,  0],
                 [-5,  0, 11]])
   L = np.linalg.cholesky(a)
   # L is lower triangular; L @ L.T == a

If the input is not positive definite or not symmetric, the function
raises ``ValueError``.

eig: eigenvalues and eigenvectors
---------------------------------

``eig`` works only on **real symmetric** matrices. (Non-symmetric
matrices raise ``ValueError``.) The function returns a 2-tuple of
``(eigenvalues, eigenvectors)``::

   a = np.array([[1, 2, 1, 4],
                 [2, 5, 3, 5],
                 [1, 3, 6, 1],
                 [4, 5, 1, 7]], dtype=np.uint8)
   x, y = np.linalg.eig(a)

   print('eigenvalues:\n', x)
   print('\neigenvectors (one per row):\n', y)

A few notes:

* Eigenvalues are not necessarily returned in any particular order.
  If you need them sorted, call ``np.sort`` on the result (and apply
  the same permutation to the eigenvectors).
* An eigenvector is determined only up to a non-zero scalar, so the
  signs of individual eigenvectors may differ from those returned by
  CPython ``numpy``. This is harmless.
* The implementation uses Givens rotations, with no closed-form
  estimate of run time -- it iterates to convergence.

norm: vector or matrix 2-norm
-----------------------------

The Euclidean (Frobenius) norm of a vector or matrix::

   v = np.array([1, 2, 3, 4, 5])
   m = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])

   np.linalg.norm(v)        # 7.4162...
   np.linalg.norm(m)        # 16.881...

qr: QR decomposition
--------------------

``qr`` factors a rectangular matrix ``A`` (shape ``(M, N)``) into an
orthonormal ``Q`` and an upper-triangular ``R`` such that
``A == Q @ R``. The default ``mode='reduced'`` gives compact
matrices; ``mode='complete'`` gives full ``(M, M)`` and ``(M, N)``
factors::

   A = np.arange(6).reshape((3, 2))

   # reduced (default):
   q, r = np.linalg.qr(A)
   # q.shape == (3, 2), r.shape == (2, 2)

   # complete:
   q, r = np.linalg.qr(A, mode='complete')
   # q.shape == (3, 3), r.shape == (3, 2)

dot, cross, trace
-----------------

These three live at the top of ``numpy``, not under ``linalg``::

   from ulab import numpy as np

   a = np.array([1, 2, 3])
   b = np.array([4, 5, 6])

   np.dot(a, b)             # 32.0 (scalar product)
   np.cross(a, b)           # array([-3.0, 6.0, -3.0])

   m = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
   np.dot(m, a)             # matrix-vector product
   np.dot(m, m)             # matrix-matrix product
   np.trace(m)              # 1 + 5 + 9 = 15.0

A worked example: solving a small system
----------------------------------------

To solve a 4x4 system ``A x = b`` using inversion::

   from ulab import numpy as np

   A = np.array([[3, 0, 1, 1],
                 [0, 1, 0, 2],
                 [1, 0, 1, 1],
                 [1, 2, 1, 8]])
   b = np.array([4, 2, 4, 2])

   x = np.dot(np.linalg.inv(A), b)
   print(x)
   print(np.dot(A, x))         # should equal b

For triangular ``A`` or systems with a Cholesky factorisation
already in hand, prefer ``scipy.linalg.solve_triangular`` and
``scipy.linalg.cho_solve`` -- see :doc:`scipy`.

API reference
-------------

* :doc:`/library/omv.ulab.numpy.linalg` -- complete linalg API.
* :doc:`/library/omv.ulab.scipy.linalg` -- ``scipy.linalg``
  reference.
