Lens and perspective correction
===============================

The previous page covered the transforms that
keep the source image rectangular:
*scaling*, *flipping*, *transposing*,
*cropping*. Two more
classes of geometric correction reshape the
image in ways that a rectangle-to-rectangle
mapping cannot. *Lens correction* undoes the
radial distortion a real wide-angle lens
introduces -- the fisheye bulge that bends
straight scene lines into visible curves
near the corners of the frame. *Perspective
correction* undoes the keystone effect that
happens when the lens is not pointed
perpendicular to the scene -- the trapezoidal
warp that turns a known rectangle in the world
into a non-rectangular blob in the image.

Vision Sensors covered the optical *causes*
of both. This page is about the operations
that undo them after the capture is done.

Radial lens distortion
----------------------

Vision Sensors' real-lens-effects section
described the *barrel* distortion that
inexpensive wide-angle lenses introduce.
Pixels near the centre of the frame are
roughly where the pinhole model predicts;
pixels near the edges are bowed outward by an
amount that grows with the square of the
radial distance from the optical axis. A
straight line in the scene that runs near the
edge of the frame curves visibly in the
captured image, and any classical MV
algorithm that assumes straight lines stay
straight -- AprilTag corner detection, edge
following, line-following navigation -- gets
the wrong answer near the corners.

:meth:`~image.Image.lens_corr` undoes the
distortion. The method runs the inverse
mapping: every output pixel is sampled from
the position in the input that the lens would
have bowed *out from* it, and the result is a
geometrically straight image.

::

    img.lens_corr(strength=1.8)

The ``strength`` parameter is the heart of the
correction. It is a single number that
describes how strongly the lens bows; a
value near ``1.0`` is a mild correction for
a moderately wide lens, and values up to
about ``2.0`` are reasonable for a strong
fisheye. The default of ``1.8`` is a
reasonable starting point for the stock
OpenMV Cam lenses; the right value for any
specific lens is a matter of trying a few
and watching the image.

The two side parameters are usually fine at
their defaults. ``zoom`` (default ``1.0``)
scales the output -- a value larger than one
crops outward to compensate for the way
lens correction pushes the corners further
out; smaller values leave more of the
corrected scene visible at the cost of
including blank pixels at the image edges.
``x_corr`` and ``y_corr`` shift the
correction's centre away from the geometric
centre of the image, which is useful when
the lens is not optically centred over the
sensor (an unusual case but worth knowing
about).

A typical pipeline: capture, run
:meth:`~image.Image.lens_corr` once to
straighten the geometry, then run whatever
the application actually does with the
result.

3D rotation correction
----------------------

The other class of geometric distortion is
the *perspective* warp that happens when the
sensor plane is not parallel to the scene
plane. The classical case is a sign or a
license plate viewed from below: the top of
the sign is farther from the lens than the
bottom, so it projects smaller, and the
captured image shows the rectangle as a
trapezoid with the top edge shorter than the
bottom edge.

The fix is to apply a *3D rotation* to the
captured frame that virtually re-orients the
sensor plane to be parallel to the scene
plane. The math is the same homography
that AprilTag detection uses to recover a
tag's pose from its four corners, run in
reverse: given a rotation, the operation
maps every output pixel back to the input
position the rotation would have come from.

:meth:`~image.Image.rotation_corr` runs that
correction:

::

    img.rotation_corr(x_rotation=10.0, y_rotation=0.0, z_rotation=0.0)

The three rotation parameters are in degrees
and describe rotations around the x, y, and
z axes of a virtual camera centred on the
image. ``x_rotation`` tilts the camera up
or down (the natural correction for a
ground-level shot of a wall); ``y_rotation``
pans the camera left or right; ``z_rotation``
rotates the camera around its optical axis
(the natural correction for an off-level
mount).

``x_translation`` and ``y_translation``
move the virtual camera laterally without
rotating it. ``zoom`` (default ``1.0``)
scales the output. ``fov`` (default
``60.0``) describes the camera's vertical
field of view, used to compute the
projection -- the value should match the
actual lens to keep the geometry
consistent.

For an arbitrary tilt and pan combination,
multiple non-zero rotations compose in one
call. The order of operations is fixed
inside the implementation; the application
just provides the angles and the result
comes out.

Rectifying a known rectangle
----------------------------

The most commonly useful form of
:meth:`~image.Image.rotation_corr` is the
``corners=`` keyword, which takes a list of
four ``(x, y)`` tuples describing the
corners of a known rectangle in the input
image. The method computes whatever 3D
rotation would have mapped a true rectangle
to those particular four points, applies the
*inverse* of that rotation to the entire
image, and returns a result in which the
known rectangle is rectangular again:

::

    plate_corners = [(45, 80), (300, 60), (310, 180), (40, 200)]
    img.rotation_corr(corners=plate_corners)

The classical use is exactly what the name
suggests: a license plate (or any other
rectangular feature) photographed from an
oblique angle. An upstream stage detects the
plate and reports its four corner positions
in the captured image; passing those corners
to :meth:`~image.Image.rotation_corr`
produces an image in which the plate sits as
a true rectangle, ready for whatever
character-recognition or template-matching
stage comes next.

When the four-corner form solves the
problem an application is trying to solve,
it is dramatically more useful than the
six-parameter form. The application does not
have to estimate any rotation angles; it
just hands the method four points and lets
the method figure out the rest. The
six-parameter form is useful when no
identifiable rectangle is visible in the
scene and the rotation has to be
hand-tuned from external knowledge (a
calibrated mounting angle, for instance).

With :meth:`~image.Image.lens_corr` for
radial fisheye distortion and
:meth:`~image.Image.rotation_corr` for 3D
perspective rotations (and the four-corner
form for rectifying a known rectangle), the
two canned correction methods cover the
common cases. The more general *projective*
form -- a hand-supplied 3-by-3 matrix that
describes an arbitrary affine or perspective
warp -- gets its own page, since the
mathematics and the use cases stand on their
own.
