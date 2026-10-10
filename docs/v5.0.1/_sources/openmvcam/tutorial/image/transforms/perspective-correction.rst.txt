Perspective correction
======================

.. warning::

   The arbitrary 3-by-3 ``transform`` matrix
   is **only supported on the OpenMV Cam N6**
   -- the keyword is silently ignored on every
   other board. Applications that need to run
   anywhere else must use the canned
   :meth:`~image.Image.rotation_corr` method
   (with its ``corners=`` form) or pre-compute
   the corrected image off-board.

The canned :meth:`~image.Image.rotation_corr`
method packages a particular family of
perspective warps behind a small set of
parameters, and runs on every supported
board. Some applications need a warp that
does not fit that form: an arbitrary
projective remap from one quadrilateral to
another, a calibrated correction for a known
mounting that has already been worked out
off-line, a warp matrix handed over
ready-made by some upstream algorithm. For those,
:meth:`~image.Image.draw_image` -- along with
:meth:`~image.Image.copy`,
:meth:`~image.Image.crop`, and
:meth:`~image.Image.scale` -- accepts a
``transform`` keyword that takes a hand-built
3-by-3 matrix describing the warp directly.

Affine and projective transformations
-------------------------------------

Geometric warps are expressed in *homogeneous
coordinates*: the pixel position ``(x, y)``
with a ``1`` appended, multiplied by a 3-by-3
matrix.

The *affine* form is the place to start. Its
bottom row is fixed at :math:`(0, 0, 1)`:

.. math::

   \begin{bmatrix} x' \\ y' \\ 1 \end{bmatrix}
   = \begin{bmatrix} a & b & c \\ d & e & f \\ 0 & 0 & 1 \end{bmatrix}
     \begin{bmatrix} x \\ y \\ 1 \end{bmatrix}

Written out, each output coordinate is a
linear combination of the input coordinates
plus a constant:

.. math::

   x' = a x + b y + c, \qquad
   y' = d x + e y + f

which covers scaling, rotation, shearing, and
translation in any combination -- and under
all of them, parallel lines stay parallel.

The *projective* (perspective) form frees the
bottom row:

.. math::

   \begin{bmatrix} x'' \\ y'' \\ w' \end{bmatrix}
   = \begin{bmatrix} a & b & c \\ d & e & f \\ g & h & 1 \end{bmatrix}
     \begin{bmatrix} x \\ y \\ 1 \end{bmatrix},
   \qquad
   (x', y') = \left( \frac{x''}{w'}, \; \frac{y''}{w'} \right)

Written out:

.. math::

   x' = \frac{a x + b y + c}{g x + h y + 1}, \qquad
   y' = \frac{d x + e y + f}{g x + h y + 1}

The division by :math:`w' = g x + h y + 1` is
what makes the transformation projective
rather than merely affine. When :math:`g` and :math:`h` are both
zero, :math:`w'` stays at one and the
division does nothing -- the affine form
again. When either is non-zero, :math:`w'`
varies with the input position and pixels at
different positions get foreshortened by
different amounts, which no longer keeps
parallel lines parallel -- it is exactly the
keystone effect of looking at a flat plane
from an oblique angle. A projective
transformation is the most general geometric
warp that takes straight lines to straight
lines; scaling, flipping, transposing,
rotating, and the four-corner rotation
correction are all special cases of one.

The named transformations drop out of the
affine form directly. The identity
transformation is the identity matrix, and:

.. math::

   \underbrace{\begin{bmatrix}
   1 & 0 & t_x \\ 0 & 1 & t_y \\ 0 & 0 & 1
   \end{bmatrix}}_{\text{translate by } (t_x, \; t_y)}
   \qquad
   \underbrace{\begin{bmatrix}
   s_x & 0 & 0 \\ 0 & s_y & 0 \\ 0 & 0 & 1
   \end{bmatrix}}_{\text{scale by } (s_x, \; s_y)}
   \qquad
   \underbrace{\begin{bmatrix}
   \cos\theta & -\sin\theta & 0 \\
   \sin\theta & \cos\theta & 0 \\
   0 & 0 & 1
   \end{bmatrix}}_{\text{rotate by } \theta}

For most hand-built transforms an application
starts with one of these as a base and
multiplies in further matrices for each
additional operation, ending with a single
3-by-3 matrix that describes the composite
warp. Matrices apply right to left:
:math:`M = T R S` runs the scale first, then
the rotation, then the translation. The
composite everyone needs eventually is
rotation about the image centre -- a bare
rotation matrix spins the image about the
pixel origin at the top-left corner, so the
centred version moves the centre
:math:`(c_x, c_y)` to the origin, rotates,
and moves it back:

.. math::

   M =
   \underbrace{\begin{bmatrix}
   1 & 0 & c_x \\ 0 & 1 & c_y \\ 0 & 0 & 1
   \end{bmatrix}}_{\text{move centre back}}
   \underbrace{\begin{bmatrix}
   \cos\theta & -\sin\theta & 0 \\
   \sin\theta & \cos\theta & 0 \\
   0 & 0 & 1
   \end{bmatrix}}_{\text{rotate}}
   \underbrace{\begin{bmatrix}
   1 & 0 & -c_x \\ 0 & 1 & -c_y \\ 0 & 0 & 1
   \end{bmatrix}}_{\text{move centre to origin}}

The transform keyword
---------------------

The matrix goes in through a ``transform``
keyword, supplied as a 3-by-3
:class:`ulab.numpy.ndarray <numpy.ndarray>`. The method to
reach for is :meth:`~image.Image.draw_image`,
which warps the source through the matrix as
it draws it onto a destination -- the result
lands in a buffer the application controls,
and the warp composes with everything else on
the call: the scaling, the alpha blending,
the masking.

::

    import ulab.numpy as np

    M = np.array([[1.2,  0.0, -20.0],
                  [0.0,  1.2, -15.0],
                  [0.0,  0.0,   1.0]])

    canvas.draw_image(img, transform=M)

The example warps ``img`` onto ``canvas``
scaled by 1.2 in each direction and shifted
left and up by 20 and 15 pixels respectively
-- an affine warp built directly from the
matrix entries described above. The same
keyword on :meth:`~image.Image.copy`,
:meth:`~image.Image.crop`, and
:meth:`~image.Image.scale` applies the warp
to the image itself.
