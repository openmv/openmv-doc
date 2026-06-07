Displacement and keypoint matching
==================================

Template matching answers *where is this
patch inside the frame*; similarity
scoring answers *how alike are these two
images overall*. A different question
sits between them: *the two frames show
the same scene, but the camera (or the
scene) moved between them -- by how
much?*

The answer to *how much* takes a couple
of forms depending on what kind of motion
is involved. A pure pixel-level shift
between two whole-frame images is the
*displacement* problem, and the image
module solves it with a single
phase-correlation method. A more general
match, where some recognisable features
moved together while others stayed put
or moved differently, is the *keypoint*
problem -- harder, more expensive, and
the area where the image module's
classical methods now sit firmly behind
machine-learning alternatives.

Phase-correlation displacement
------------------------------

:meth:`~image.Image.find_displacement`
estimates the rigid alignment between two
same-sized images using *phase
correlation* -- a frequency-domain method
that runs an FFT on each image,
cross-correlates their phases, and
locates the peak in the result. The peak
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
confidence score in ``0.0 -- 1.0`` where
``1.0`` is a perfect peak. Filtering out
detections below ``response > 0.3``
discards spurious results in which the
phase correlation never found a clean
peak.

Both ``rotation`` and ``scale`` are 0.0
and 1.0 respectively in the default mode;
they take real values only when
``logpolar=True`` (see below).

The method has *two practical
constraints* that the application has to
respect. The first is *power-of-2
dimensions*. Phase correlation runs an
FFT on each image, and the FFT is
fastest -- and on the cam, only fully
supported -- at power-of-two sizes:
32-by-32, 64-by-64, 128-by-128. The
:data:`sensor.B64X64`,
:data:`sensor.B128X128`, and similar
framesize constants exist exactly for
this method: configure the sensor to one
of them, capture, and the displacement
matcher runs cleanly. Applications that
want to estimate displacement on a
larger captured frame typically take a
power-of-2 crop of the relevant region
and run the matcher on that.

The second constraint is *same-size
inputs*. ``roi`` and ``template_roi``
must produce identical width and height;
otherwise the matcher refuses the call.
When the two images come from the same
sensor at the same configuration the
constraint is automatic; when they
come from different sources (a captured
frame and a loaded reference, for
instance) the application crops each to
matching power-of-2 patches first.

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

Legacy keypoint matchers
------------------------

The image module also exposes a classical
*keypoint*-based matcher that predates
the embedded machine-learning support.
The pipeline is the three-method sequence
:meth:`~image.Image.find_keypoints`,
:meth:`~image.Image.find_lbp`, and
:func:`image.match_descriptor`.
:meth:`~image.Image.find_keypoints` runs
ORB (Oriented FAST and Rotated BRIEF)
corner detection over a region and
returns an opaque keypoint *descriptor*;
:meth:`~image.Image.find_lbp` runs the
LBP (local binary patterns) alternative
and returns a different descriptor.
Either descriptor can be saved with
:func:`image.save_descriptor` and loaded
with :func:`image.load_descriptor` so
the calibration step can run once
off-line. :func:`image.match_descriptor`
compares two descriptors and returns the
matched-keypoint cluster as a
:class:`kptmatch <image.kptmatch>` with
``x``, ``y``, ``w``, ``h``, ``cx``,
``cy``, ``rect``, ``count``, ``theta``,
and the per-keypoint ``match`` list.

In practice the keypoint matchers are
*usable but narrow*. ORB and LBP both
struggle on the small low-resolution
images a cam typically captures, the
descriptors are not robust against
significant rotation or scale changes
without tuning, and a modern CNN-based
feature matcher running through the
embedded ML pipeline does the same job
with substantially better accuracy. New
applications that need feature-matching
should reach for the Machine Learning
chapter's methods rather than these. The
ORB and LBP paths remain documented for
legacy scripts and for applications
where the cam's compute budget cannot
accommodate an ML model.

With :meth:`~image.Image.find_template`
for the *where-is-this-patch* case,
:meth:`~image.Image.get_similarity` for
the *how-alike-are-these* case,
:meth:`~image.Image.find_displacement`
for the *how-much-did-the-frame-move*
case, and the keypoint matchers for the
legacy *match-these-features* case, the
matching toolkit covers what the image
module does for comparing images. The
detectors return result objects; the
matchers return alignments and scores;
the camera still has to *do* something
with all of them. The final piece is
getting the image data on and off the
cam -- saving captures to disk,
compressing for network transfer,
streaming over a connection. That is
the work of the I/O methods.
