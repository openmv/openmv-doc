Finding lines and segments
==========================

Some scene features are not connected regions
of colour but oriented straight edges: a
painted line on the floor, the seam between
two surfaces, the side of a printed
rectangle, the edge of a doorway. Asking the
blob detector to find them is the wrong
question -- the edge is one pixel wide, the
blob algorithm wants area-with-colour, and
the answer comes back empty or noisy.

The right detector for oriented edges is the
*Hough line transform*. The image module
exposes it in two flavours:
:meth:`~image.Image.find_lines` returns
*infinite* lines (every line extends across
the full image);
:meth:`~image.Image.find_line_segments`
returns *finite* segments (each line has
endpoints inside the frame). Which one the
application needs depends on whether the
edges of interest are continuous across the
whole frame or only span part of it.

How the Hough transform works
-----------------------------

Both detectors share the same core idea, so
it pays to understand it once. The image
module first runs a Sobel-style edge filter
on the input to score every pixel by how
likely it is to lie on an oriented edge.
Each such edge pixel then *votes* for all
the lines it might lie on. The lines that
collect the most votes win.

A line is parameterised in *Hough space* by
two numbers: ``theta``, the angle of the
line (0 -- 179 degrees), and ``rho``, the
perpendicular distance from the image origin
to the line (signed, in pixels). Every line
the image contains is one point in
(``theta``, ``rho``) space. Each edge pixel
in the input contributes one vote to every
``(theta, rho)`` combination consistent with
its position -- conceptually, a curve through
Hough space. Where many such curves cross,
many edge pixels agree on the same line, and
that crossing is a detection.

The detector returns the local maxima in
Hough space whose vote totals exceed a
threshold. Each returned
:class:`Line <image.line>` carries both
representations: ``x1, y1, x2, y2`` for the
endpoint form (clipped to the image bounds
for the infinite case), ``theta, rho`` for
the Hough form, and ``length`` and
``magnitude`` for size and vote-count
respectively.

Infinite lines
--------------

:meth:`~image.Image.find_lines` runs the
Hough transform and returns the strongest
lines, each extended across the full image:

::

    lines = img.find_lines(threshold=1500, theta_margin=25, rho_margin=25)

    for l in lines:
        img.draw_line(l.line(), color=(255, 0, 0))

The ``threshold`` is the minimum vote total
for a line to be accepted. The vote total
adds up the Sobel edge magnitudes of every
contributing pixel, so larger ``threshold``
values demand longer or stronger edges to
pass. A threshold of ``1000`` works for a
modest line in a clear image; targets with
weak contrast or short lines may need to
drop to ``500`` or below; busy scenes may
need ``2000`` or more to suppress
false-positive lines through clusters of
edge noise.

``theta_margin`` and ``rho_margin`` control
*merging* of nearby maxima. A single
physical edge produces a small cluster of
high-vote bins around its true
(``theta``, ``rho``), and the detector
collapses each cluster to its peak before
returning. ``theta_margin=25`` (degrees)
merges any peaks within 25 degrees of
orientation; ``rho_margin=25`` (pixels)
merges peaks within 25 pixels of distance.
The defaults are reasonable; raising them
returns *fewer*, more-distinct lines and
lowering them returns *more*, sometimes
duplicated lines.

``x_stride`` and ``y_stride`` step through
edge pixels during voting, the same way they
step through pixels in
:meth:`~image.Image.find_blobs`. The
defaults of ``2`` and ``1`` work for the
common case; raising them speeds up the
search at the cost of resolution. ``roi``
restricts the search to a region of the
frame, which both narrows the lines returned
and reduces work.

Each returned line is drawable directly. The
:meth:`image.line.line` accessor returns the
``(x1, y1, x2, y2)`` 4-tuple that
:meth:`~image.Image.draw_line` expects.
``l.theta`` is the angle in degrees, which
classifies the line as horizontal, vertical,
or diagonal in one comparison.
``l.magnitude`` is the vote total, which
sorts the returned lines from strongest to
weakest.

Line segments
-------------

:meth:`~image.Image.find_lines` is the right
detector for edges that span the whole
frame, but many real edges -- the left side
of a printed barcode, the top edge of a
label, the visible side of a ruler -- only
run across part of the image.
:meth:`~image.Image.find_line_segments`
returns *finite* segments whose endpoints
are inside the frame:

::

    segments = img.find_line_segments(merge_distance=5, max_theta_difference=10)

    for s in segments:
        img.draw_line(s.line(), color=(0, 255, 0))

The segment detector traces along oriented
edge pixels directly, rather than voting in
Hough space, and the result is a collection
of short straight runs. ``merge_distance``
sets the maximum pixel gap that two
collinear short runs can span and still
merge into one returned segment;
``max_theta_difference`` sets how many
degrees of orientation the merger tolerates
between adjacent runs. A generous merge
(``merge_distance=10,
max_theta_difference=15``) returns a small
number of long segments at the cost of
sometimes bridging genuinely separate edges;
a strict merge (``merge_distance=0,
max_theta_difference=5``) returns many short
segments and lets the application sort them
out in Python.

The result objects are the same
:class:`Line <image.line>` type as
:meth:`~image.Image.find_lines` returns,
with the same properties, so a pipeline can
process either kind of detection through the
same downstream code path. The only
practical difference is that the segments'
endpoints are the actual ends of the line in
the image, whereas the infinite lines'
endpoints are wherever the line crosses the
image border.

When to use each
----------------

The choice between the two methods comes down
to a single question: *does the application
care where the line stops?*

:meth:`~image.Image.find_lines` is the right
tool when the answer is no. A
line-following robot needs to know *which
way the line is going* and *where it crosses
the bottom of the frame*; the line itself
runs to the horizon and beyond. A horizon
detector wants the strongest oriented edge
in the image; it does not need to know
where the horizon ends.

:meth:`~image.Image.find_line_segments` is
the right tool when the answer is yes.
Identifying the four sides of a printed
rectangle needs four segments with known
endpoints. Tracking a finger pointing at a
display means following a short segment
whose endpoints are the finger's tip and
base. Measuring the length of a visible
scratch needs the segment's actual extent in
pixels.

Both detectors share a common limitation:
they need *contrast*. The Sobel edge filter
they build on responds to brightness
gradients; a coloured edge against an equally
bright background (a red line on a green
wall of the same luminance) produces no
gradient and no detection. When that case
shows up in practice, the fix is to extract a
single LAB channel as a grayscale image with
the right contrast before searching --
:meth:`~image.Image.to_grayscale` with the
``b`` channel selected isolates red against
green where the luminance channel alone is
flat -- and hand that channel image to the
line detector.

With infinite lines for the unbounded case
and segments for the bounded case, the image
module covers oriented straight edges as
thoroughly as :meth:`~image.Image.find_blobs`
covers connected coloured regions. Some
other geometric features the camera looks
for are not straight at all, and the
remaining detectors handle the curved and
quadrilateral cases.
