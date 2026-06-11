Finding circles and rectangles
==============================

Lines and segments cover the *straight* edges
in the captured frame, but plenty of
real-world features the camera looks for are
not straight. A coin lying on a desk is a
*circle*. A printed label, a sticky note, the
top of a box viewed off-axis is a
*quadrilateral*. The image module exposes a
dedicated detector for each: a Hough-style
search for circles and an AprilTag-derived
search for four-sided shapes.

Both methods follow the same template the
line detectors do -- ``threshold`` controls
how many votes a detection needs, ``roi``
narrows the search, and the returned objects
carry both a position and a confidence
magnitude -- but the parameter spaces and
the right defaults differ enough to deserve
explicit coverage.

Hough circles
-------------

:meth:`~image.Image.find_circles` runs the
circular variant of the Hough transform.
Each edge pixel from the Sobel pre-pass
votes for every circle that could pass
through it; circles that collect enough
votes are returned.

::

    circles = img.find_circles(threshold=3500,
                                x_margin=10, y_margin=10, r_margin=10,
                                r_min=10, r_max=80, r_step=2)

    for c in circles:
        img.draw_circle((c.x, c.y, c.r), color=(255, 0, 0))

``threshold`` is the minimum sum of Sobel
edge magnitudes along the candidate circle.
Bigger circles trace more pixels and so
need higher thresholds to pass; a value
that finds a 20-pixel-radius coin will
also fire on noise around a 100-pixel
edge, while a value tuned for the large
coin will miss the small one. When the
target radius range is known, the right
threshold scales with the circumference --
roughly ``threshold = 50 * 2 * pi * r``
gives a reasonable starting point and the
right value follows from a brief tuning
pass.

``r_min``, ``r_max``, and ``r_step`` set
the *radius search*. Without bounds, the
detector would search every radius from a
few pixels up to the half-width of the
image, which is both slow and a recipe for
false positives. Setting ``r_min`` and
``r_max`` to bracket the expected target
size by a generous margin (e.g.
``r_min=15, r_max=25`` for a coin known to
be around 20 pixels) cuts the work
substantially and improves the signal-
to-noise ratio of the votes. ``r_step``
controls the granularity of the search;
larger steps run faster and may miss a
circle whose true radius falls between two
sampled values. The default ``r_step=2`` is
a reasonable compromise.

``x_margin``, ``y_margin``, and ``r_margin``
control *merging* of nearby detections, the
way ``theta_margin`` and ``rho_margin`` do
for line detection. A single physical circle
in the image votes for a cluster of
candidate circles whose centres and radii
agree to within a few pixels; the margins
collapse each cluster to its peak before the
result list is built. Larger margins return
fewer, more confident detections; smaller
margins return more detections with possible
near-duplicates.

``x_stride`` and ``y_stride`` step the
voting scan, the same way they do in the
other detectors. The default of ``2`` and
``1`` is fine for most images; cranking
both up to ``4`` is the standard speed
trade-off for an image known to contain
large circles.

Each returned :class:`Circle <image.circle>`
carries ``x``, ``y``, ``r`` (the centre and
radius) and ``magnitude`` (the vote total,
useful as a confidence score for sorting or
filtering). Drawing the detection back into
the frame is one call --
:meth:`~image.Image.draw_circle` takes the
``(x, y, r)`` 3-tuple, available as
``(c.x, c.y, c.r)`` directly off the result.

Rectangles
----------

:meth:`~image.Image.find_rects` borrows the
quadrilateral detector from the AprilTag
pipeline -- the same routine that locates
the black square around a tag is exposed
on its own as a general-purpose
rectangle finder.

::

    rects = img.find_rects(threshold=12000)

    for r in rects:
        img.draw_rectangle(r.rect, color=(0, 255, 0))
        for corner in r.corners:
            img.draw_circle((corner[0], corner[1], 4),
                            color=(0, 255, 0))

``threshold`` is the minimum sum of edge
magnitudes around the rectangle's
perimeter. A printed black-on-white
rectangle in a well-lit frame easily clears
``10000``; a faint rectangle on a textured
background may need to drop to ``2000`` --
trading off false positives for sensitivity.
Like the circle detector, the right value
follows from a quick tuning pass with the
intended targets in view.

The detector is *projective* -- it finds
quadrilaterals whose sides are straight but
not necessarily parallel or
axis-aligned. A label viewed off-axis
looks like a trapezoid in the image, and
the rectangle detector finds it
correctly; an axis-aligned rectangle is
just the degenerate case where the four
corners happen to form a right-angled box.
``roi`` restricts the search; the rest of
the keyword arguments take their defaults
from the AprilTag pipeline and rarely need
tuning.

Each returned :class:`Rect <image.rect>`
carries the axis-aligned bounding box --
``x``, ``y``, ``w``, ``h``, plus the
``rect`` 4-tuple that
:meth:`~image.Image.draw_rectangle`
expects -- *and* the four detected corners
as ``corners``. The bounding box is what
the application uses for rough position and
size; the corners describe the projective
quadrilateral itself. When the
camera is viewing a flat target from an
angle and the application needs to undo
the keystone -- read text on a label,
sample colour from a flat patch -- the
corners feed directly into
:meth:`~image.Image.rotation_corr` with the
``corners=`` keyword (see :doc:`lens and
perspective correction
<../transforms/lens-and-perspective>`), and
the output is the rectified rectangle ready
for whatever analysis comes next.

.. warning::

   Because the detector is tuned for what the
   AprilTag pipeline needs -- quadrilaterals
   with strong, high-contrast borders, like a
   black tag outline on white paper -- it is
   not a find-every-rectangle pass.
   Rectangles with soft contrast, textured
   edges, or busy surroundings can go
   undetected entirely. How well it works is
   situation dependent: test it against the
   real targets early, before building a
   pipeline around it.

When the detector misfires
--------------------------

Circles in particular benefit from a
*pre-filter* on the input. A noisy frame
yields lots of stray edge pixels that all
vote, and the resulting Hough space has
broad mushy peaks that the merger has a
hard time separating. A
:meth:`~image.Image.gaussian` or
:meth:`~image.Image.mean` pass before
:meth:`~image.Image.find_circles` smooths
the noise away and leaves the true edges
intact; the detector returns cleaner peaks
in less time.

For rectangles, the common failure mode is
the opposite: low contrast between the
rectangle and its background means the
edge-magnitude sum never clears
``threshold``. An :meth:`~image.Image.histeq`
pass to redistribute the brightness range
across the full 0-to-255 spread restores
the contrast the detector needs. (The
contrast must exist *somewhere* in the
image; histogram equalisation can only
amplify what is already there.)
