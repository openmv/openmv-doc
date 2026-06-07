Perspective correction
======================

.. warning::

   **The arbitrary 3-by-3 ``transform``
   matrix discussed on this page is only
   supported on the OpenMV Cam N6.** The
   keyword is silently ignored on every other
   board. Applications that need to run on
   anything other than the N6 must use the
   canned correction methods on the previous
   page -- :meth:`~image.Image.lens_corr` and
   :meth:`~image.Image.rotation_corr` (with
   its ``corners=`` form) -- or pre-compute
   the corrected image off-board. The rest of
   this page is N6-specific.

The previous page covered two specific
correction methods --
:meth:`~image.Image.lens_corr` for radial
fisheye, :meth:`~image.Image.rotation_corr`
for 3D rotations -- each of which packages a
particular form of warp behind a small set
of parameters. Those methods run on every
supported board. Some applications need a
warp that does not fit either of those
forms: an arbitrary projective remap from
one quadrilateral to another, a calibrated
correction for a known mounting that has
already been worked out off-line, a
homography supplied by some upstream
algorithm. For those, the
:meth:`~image.Image.copy`,
:meth:`~image.Image.crop`, and
:meth:`~image.Image.scale` methods accept a
``transform`` keyword that takes a hand-built
3-by-3 matrix describing the warp directly
-- but only when the cam doing the work is
an N6.

This page is about that matrix -- what it
represents, how to construct one, and the
N6 GPU that runs it.

Affine and projective transformations
-------------------------------------

A *projective* transformation is the most
general geometric warp that takes straight
lines to straight lines. Every transformation
the previous pages have covered -- scaling,
flipping, transposing, rotating, lens
correction, the rotation correction with
four corners -- is a special case of a
projective transformation. The general form
maps input pixel coordinates ``(x, y)`` to
output coordinates ``(x', y')`` through a
3-by-3 matrix:

.. math::

   \begin{bmatrix} x' w' \\ y' w' \\ w' \end{bmatrix}
   = \begin{bmatrix} a & b & c \\ d & e & f \\ g & h & 1 \end{bmatrix}
     \begin{bmatrix} x \\ y \\ 1 \end{bmatrix}

The output ``(x', y')`` is recovered as
``(x' w' / w', y' w' / w')`` -- the division
by ``w'`` is what makes the transformation
*projective* rather than merely affine. When
``g`` and ``h`` are both zero, ``w'`` stays
at one and the division does nothing; the
transformation collapses to the simpler
*affine* form that includes scaling,
rotation, shearing, and translation but not
the foreshortening of a perspective warp.
When ``g`` or ``h`` is non-zero, ``w'``
varies with the input position and pixels at
different positions get foreshortened by
different amounts -- which is what produces
the keystone effect of looking at a flat
plane from an oblique angle.

A handful of named cases drop out of the
matrix form:

* The identity transformation is the
  identity matrix.
* A translation by ``(tx, ty)`` sets
  ``c = tx`` and ``f = ty`` with the rest
  of the matrix at identity.
* A scaling by ``(sx, sy)`` sets
  ``a = sx`` and ``e = sy``.
* A rotation by angle ``theta`` sets
  ``a = cos(theta)``, ``b = -sin(theta)``,
  ``d = sin(theta)``, ``e = cos(theta)``.
* A 2D affine transformation -- the
  composition of any of the above without
  perspective foreshortening -- has
  ``g = 0`` and ``h = 0``.
* A perspective transformation has
  non-zero ``g`` or ``h``.

For most hand-built transforms an
application starts with one of these as a
base, multiplies in further matrices for
each additional operation, and ends with a
single 3-by-3 matrix that describes the
composite warp.

The transform keyword
---------------------

:meth:`~image.Image.copy`,
:meth:`~image.Image.crop`, and
:meth:`~image.Image.scale` all accept the
matrix through a ``transform`` keyword. The
matrix is supplied as a 3-by-3
:class:`ulab.numpy.ndarray`:

::

    import ulab.numpy as np

    M = np.array([[1.2,  0.0, -20.0],
                  [0.0,  1.2, -15.0],
                  [0.0,  0.0,   1.0]])

    img.copy(transform=M, copy_to_fb=True)

The example above scales the image by 1.2 in
each direction and shifts the result left
and up by 20 and 15 pixels respectively --
an affine warp built directly from the
matrix entries described above.

A projective warp that brings a known
quadrilateral in the source onto a
rectangular output is the textbook
*perspective correction* problem, and the
matrix that solves it is the *homography*
that maps the four source corners to the
four corners of the desired output
rectangle. The math for computing such a
matrix from four point correspondences is
standard; libraries on the host side that
do machine vision off-board frequently
expose a routine for it, and the matrix
that routine returns is exactly what the
``transform`` keyword expects.

Where the transform runs
------------------------

The board the application is targeting
decides where the per-pixel resampling
happens. On the OpenMV Cam N6, the
``transform`` keyword runs on the on-board
GPU, which is substantially faster than a
CPU pass at full resolution -- often the
difference between a real-time pipeline and
one that drops frames. On every other
supported board the keyword is ignored, and
the application has to fall back to the
canned correction methods on the previous
page (or pre-compute the corrected image
off-board).

That asymmetry is worth being explicit about
when targeting code for multiple boards.
A pipeline that works at full speed on the
N6 because the GPU is doing the warp may
not run at the same speed elsewhere. Test
plans that need to confirm a perspective
correction works should run on the slowest
target board the script is expected to
support; performance numbers measured on
the N6 do not generalise.

When to use the canned forms instead
------------------------------------

The hand-built matrix is the most flexible
of the perspective tools, but flexibility is
not always what the application needs. The
canned methods on the previous page solve
specific problems with less ceremony:

* If the problem is *radial* lens distortion
  -- the fisheye bow of a wide-angle lens --
  :meth:`~image.Image.lens_corr` does the
  job in one parameter (``strength``). No
  matrix construction needed.
* If the problem is *3D rotation* with known
  angles -- a calibrated mounting tilt, an
  off-level installation --
  :meth:`~image.Image.rotation_corr` takes
  the angles directly.
* If the problem is rectifying a *known
  rectangle* whose four corners can be
  located in the source --
  :meth:`~image.Image.rotation_corr` with
  the ``corners=`` keyword takes the four
  points directly and constructs the warp.

The ``transform`` keyword is the right
answer when none of those forms fit:
when the warp comes from an off-line
calibration, when the matrix is the output
of a host-side algorithm whose result has
to be reproduced exactly on the cam, when
multiple warps need to be composed into
one operation before being applied. The
matrix is also the natural language for
expressing those cases, even if a series
of named-method calls could produce a
visually similar result with more
arithmetic.

With the four canned correction methods on
the previous page for the common cases and
the ``transform`` matrix for everything
else, the perspective-correction toolkit
covers what classical image processing
applies to undo the optical reality of a
real lens, a real sensor, and a real
mounting angle. The remaining transform
moves *out* of the Cartesian grid entirely.
