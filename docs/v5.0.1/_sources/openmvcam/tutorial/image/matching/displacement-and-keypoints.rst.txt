Displacement matching
=====================

Template matching answers *where is this
patch inside the frame*; similarity
scoring answers *how alike are these two
images overall*. A different question
sits between them: *the two frames show
the same scene, but the camera (or the
scene) moved between them -- by how
much?* That is the *displacement* problem,
and the image module solves it with a
single phase-correlation method.

Phase-correlation displacement
------------------------------

:meth:`~image.Image.find_displacement`
estimates the rigid alignment between two
same-sized images using *phase
correlation* -- a frequency-domain method
that runs a fast Fourier transform (FFT) on
each image, cross-correlates their phases,
and locates the peak in the result. The peak
position is the translation that aligns
the two images:

::

    d = img.find_displacement(template)

    print("shift:", d.x_translation, d.y_translation,
          " response:", d.response)

The returned
:class:`Displacement <image.displacement>`
carries ``x_translation`` and
``y_translation`` -- the pixel shift in
each axis -- plus ``response``, a
confidence score from ``0.0`` to ``1.0``
where ``1.0`` is a perfect peak. Filtering out
detections below ``response > 0.3``
discards spurious results in which the
phase correlation never found a clean
peak.

Both ``rotation`` and ``scale`` are 0.0
and 1.0 respectively in the default mode;
they take real values only when
``logpolar=True`` (see below).

The method carries two practical
constraints. The first is *power-of-two
dimensions*: the FFT at the heart of
phase correlation is fastest -- and on
the camera, only fully supported -- at
sizes like 32-by-32, 64-by-64, and
128-by-128. The cleanest setup is to
capture at one of those sizes directly,
by passing the resolution to
:meth:`~csi.CSI.framesize` as a tuple:

::

    csi0.framesize((64, 64))

An application that needs displacement
from a larger frame instead crops a
power-of-two patch out of the region it
cares about and runs the matcher on
that.

The second is *same-size inputs*:
``roi`` and ``template_roi`` must select
identical widths and heights, or the
matcher refuses the call. Two captures
from the same camera at the same
configuration satisfy this
automatically; a captured frame compared
against a loaded reference needs both
cropped to matching power-of-two patches
first.

Rotation and scale via log-polar
--------------------------------

The default mode finds *translation
only*. When the two frames also differ
in *rotation* about a chosen centre or
in *scale* about the same centre,
running the phase correlation on the
*log-polar* re-projection of each image
turns those parameters into translation
in the log-polar coordinate system --
which the same phase-correlation matcher
can recover:

::

    d = img.find_displacement(template, logpolar=True)

    print("rotation rad:", d.rotation,
          " scale:", d.scale,
          " response:", d.response)

With ``logpolar=True``, the method runs
the same matching pipeline against the
log-polar-projected images instead of
the originals. The ``rotation`` and
``scale`` fields of the result come back
filled in: ``rotation`` is the angle in
radians between the two frames,
``scale`` is the scale factor between
them. ``x_translation`` and
``y_translation`` become meaningless in
this mode (the translation along the
log-polar axes does not correspond to a
linear translation in the source).

The ``fix_rotation_scale=True`` keyword
covers the in-between case: the two
images differ in *both* translation and
rotation/scale, and the application needs
*translation only* after correcting for
the rotation and scale. The matcher
runs the log-polar pass first to recover
the rotation and scale, applies the
inverse to one of the images, then runs
the translation pass to recover the
remaining shift. The flag is meaningful
only when ``logpolar=False`` -- it asks
the translation-mode matcher to first
strip the rotation/scale.

The pattern from Polar transforms --
*Cartesian → polar → match* -- is what
:meth:`~image.Image.find_displacement`
with ``logpolar=True`` does in one call.
The application stores a reference
log-polar patch at startup, captures and
log-polar-transforms each live frame,
and the method recovers the
rotation-and-scale difference between
them. For applications that need a
rotation- and scale-invariant tracker --
a docking robot whose camera tilts and
zooms as it approaches a target, a
stabilised gimbal that needs to know
how the image is rotating relative to a
reference -- this is the standard
construction.

The classical use
-----------------

The most common use of
:meth:`~image.Image.find_displacement` is
*frame-to-frame motion estimation* in a
pipeline that processes a moving camera.
The cam captures a small power-of-2
patch at frame N, captures the same-sized
patch at frame N+1, runs
:meth:`~image.Image.find_displacement`
on the two, and reads off the pixel
shift between them. The shift is the
estimated motion of the camera (or of
the scene, depending on whose frame of
reference matters) between the two
captures, useful for:

* *Optical-flow-style sensing* -- a hover
  drone with a downward-pointing camera
  uses the per-frame displacement to
  estimate its lateral motion and feed it
  back into the flight controller.
* *Image stabilisation* -- the
  displacement between consecutive frames
  is subtracted out of the captured
  image before it is recorded or
  transmitted, producing a smoother
  video stream.
* *Inspection alignment* -- a scanning
  cam moving along a conveyor uses the
  per-frame displacement to register
  each frame against the next and build
  a stitched view of the whole part.

Each of those applications takes the
same form: capture, displace, accumulate
into a running estimate, capture again.
