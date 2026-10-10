Frame differencing
==================

Frame differencing compares each new frame
against a stored reference frame to find the
parts of the scene that have changed. It is the
workhorse of camera applications that watch for
something happening -- motion-triggered
capture, intrusion alerts, "save a video when
something moves" -- and it is built entirely
from the pixel-wise operations covered earlier:
an absolute difference, a threshold, and a
region search, run on every frame.

The basic pipeline
------------------

The first stage is to *acquire a reference*. At
some point near startup -- ideally when the
scene is in the state that "no change" means --
the application captures a frame and keeps it.
The frame becomes the baseline that every
subsequent capture will be compared against.

::

    reference = csi0.snapshot().copy()

The ``.copy()`` matters. ``csi0.snapshot()`` by
itself returns an :class:`Image` whose buffer
lives in the frame buffer, where the *next*
call to ``snapshot`` will overwrite it.
``.copy()`` allocates a separate buffer for
the reference and lets the pixels of *this*
frame survive past the next capture.

The second stage runs on every frame: capture
a fresh image, then compute the absolute
difference between it and the reference. That
is exactly what :meth:`~image.Image.difference`
does:

::

    current = csi0.snapshot()
    current.difference(reference)

After this call, ``current`` holds an image
whose non-zero pixels mark every position where
the scene changed since the reference was
taken, with the magnitude of each pixel
proportional to how much it changed at that
position.

The third stage *thresholds* the difference
image. The raw difference always contains some
noise: small brightness variations from sensor
shot noise, gradient changes from lighting
drift, sub-pixel jitter from slight camera
motion. A threshold pass --
:meth:`~image.Image.binary` with a threshold
set above that noise floor -- keeps only the
changes large enough to count as real motion
and discards the rest, producing a binary
image whose non-zero pixels are the
actually-changed positions.

The fourth stage extracts *connected regions*
of that binary mask -- groups of adjacent
non-zero pixels that form contiguous patches.
:meth:`~image.Image.find_blobs` does that in
one call, returning a list of motion regions,
each with a bounding box and a pixel count,
that the rest of the application can act on.

.. figure:: ../figures/frame-diff-pipeline.svg
   :alt: A horizontal pipeline diagram. The
         leftmost two panels are a reference
         frame and a current frame side by
         side, with a plus mark between them.
         An arrow leads from the pair to a
         third panel labelled difference, in
         which a few patches are bright against
         a dark background. An arrow leads from
         there to a fourth panel showing a
         binary thresholded version of the
         difference, with the same patches now
         solid white. A final arrow leads to a
         fifth panel showing the binary mask
         annotated with rectangular bounding
         boxes drawn around each patch.

   The *frame-differencing* pipeline: a
   reference frame plus a current frame become
   a difference image; thresholding turns the
   difference into a binary mask of changed
   positions; a connected-region step turns
   the mask into a list of motion regions.

In-memory and on-disk references
--------------------------------

The basic pipeline keeps the reference frame
in RAM. That is the right answer when the
reference is captured *this* run of the script
and only has to survive for as long as the
script keeps running.

For a long-running application -- a cam that
should resume change detection after a power
cycle, an intermittent script that needs to
detect *any* change since some earlier moment
-- the reference frame has to outlive the
running script. The pattern is to *save* the
reference to disk:

::

    csi0.snapshot().save("/sdcard/reference.bmp")

and to load it back at the start of each run:

::

    reference = image.Image("/sdcard/reference.bmp")

The differencing logic does not change; only
where the reference lives between captures
does. A few refinements naturally extend this
on-disk variant -- automatic re-capture of the
reference on a timer, optional rolling
averages to track slow lighting drift -- but
the substitution at the centre is the same.

Light-source isolation
----------------------

The same subtraction pattern shows up in a
slightly different setting: isolating a
*light source* against the rest of the scene.
The trick is to capture a "lights-off"
reference -- a frame taken when whatever is
being detected (an IR beacon, a screen pixel,
a status indicator) is *not* illuminated --
and to subtract that reference from each
subsequent frame. The result has zero
brightness everywhere the scene was the same
in both captures, and non-zero brightness
only where the light source actually lit up.

Choosing difference or sub
--------------------------

A practical note about which arithmetic
operation to pick.
:meth:`~image.Image.difference` returns the
absolute value of the change -- sign-free --
which makes it sensitive to change in either
direction (brightening or darkening) at the
cost of not telling the application *which*
direction the change went. For pure motion
detection that is the right answer: anything
that moved is interesting, regardless of
which way the brightness shifted.

For light-source detection, the lit pixel is
always *brighter* than the lights-off
reference, so :meth:`~image.Image.sub` (with
its clipping at zero) is the more honest
choice. Anywhere the current frame is darker
than the reference (which would be sensor
noise around the unlit value)
clips to zero rather than reporting a spurious
"the light was on" signal.
