Gaussian smoothing and edges
============================

Two jobs dominate what neighbourhood windows
get used for in classical machine vision:
smoothing pixel-to-pixel variation cleanly, and
finding the edges where the image changes
sharply. The Gaussian filter is the standard
tool for the first, the Laplacian-based
detectors the standard tool for the second --
and the two compose, because every edge
detector works better on a lightly smoothed
input.

The Gaussian filter
-------------------

:meth:`~image.Image.gaussian` is the
centre-weighted cousin of
:meth:`~image.Image.mean`. Both compute an
average over each pixel's neighbourhood, but
the Gaussian's weights are not uniform: pixels
nearer the centre of the neighbourhood count
*more*, pixels at the edge of the neighbourhood
count *less*, with the weights following the
familiar bell curve that gives the filter its
name.

The bell-shaped weighting is what makes a
Gaussian filter smoother than a box average.
Mean filtering can produce visible artefacts at
the edges of objects -- a hard cut-off in the
weighting introduces small ringing patterns at
sharp transitions. The Gaussian's
smoothly-falling weights avoid that ringing and
produce a result that looks closer to what
"blurred" should look like. The cost is more
per-pixel computation than the mean filter, but
not dramatically so -- the per-pixel cost is
still much lower than the bilateral filter.

::

    img.gaussian(1)    # 3x3 Gaussian -- a clean light blur
    img.gaussian(2)    # 5x5 Gaussian -- stronger smoothing

Gaussian smoothing is the standard *first stage*
of almost every edge-detection pipeline. The
edge detectors below all amplify
high-frequency content, including the sensor
noise the algorithm does not actually want to
detect. Running a light Gaussian first
suppresses that noise without softening real
edges much, leaving the edge detector to find
*real* edges instead of speckle.

Unsharp masking
---------------

A Gaussian-blurred copy of an image is the raw
material the *unsharp mask* technique uses for
classical sharpening. Setting ``unsharp=True``
on the filter switches it from "produce the
blurred image" to "subtract the blurred image
from the original and add the difference
back to the original" -- the effect is that
high-frequency edges get amplified relative to
smooth interiors.

::

    img.gaussian(1, unsharp=True)

The optional ``mul`` and ``add`` parameters
scale the strength of the unsharp result; the
defaults (``mul=1.0``, ``add=0.0``) are a
moderate sharpening that does not exaggerate
sensor noise.

The Laplacian filter
--------------------

:meth:`~image.Image.laplacian` runs a discrete
approximation of the *second spatial derivative*
of the image. The output is large where pixel
values change *quickly*, near zero where they
are constant or changing linearly. The natural
reading of the result is an edge response:
pixels where the image changes rapidly light
up, pixels in smooth interiors stay dark.

::

    img.laplacian(1)   # 3x3 Laplacian -- edge response

The same parameters as ``gaussian`` are
available. ``sharpen=True`` produces a sharpened
image (the Laplacian *added* back into the
original rather than returned on its own).
``mul`` and ``add`` scale the response.

A practical use beyond edge detection is *focus
measurement*. The Laplacian response averaged
across a region gives a rough measure of how
much high-frequency content the region carries;
on a well-focused frame that average is high,
on a blurry frame it drops. Comparing the
Laplacian response across frames is the cheap
way to ask "is the lens focused?" without
needing a more expensive contrast metric.

The find_edges method
---------------------

:meth:`~image.Image.find_edges` runs a complete
edge-detection pipeline rather than just an
edge-response filter. It works on grayscale
images, and the result is a binary image whose
non-zero pixels mark the positions where the
input has the kind of brightness change that
should count as an edge.

The method takes an ``edge_type`` parameter
that picks between two algorithms:

:data:`~image.EDGE_SIMPLE` runs a
high-pass filter, applies a threshold, and
returns the result. Fast, but the output
includes every brightness change above the
threshold, including noise and texture that
the application probably does not care about.
Reasonable for clean images and for cases
where the noise is going to be cleaned up by
a later morphological pass.

:data:`~image.EDGE_CANNY` runs the *Canny*
edge detector -- the classical multi-stage
algorithm. It computes the brightness
gradient, suppresses every non-maximum
response along the gradient direction (so each
edge is one pixel wide), and applies a
hysteresis threshold (so an edge that is strong
in one place gets traced even where it fades
between). The result is a clean, thin,
connected set of edge pixels of the kind every
classical edge-based algorithm wants.

The ``threshold`` parameter is a two-element
tuple ``(low, high)``. For :data:`~image.EDGE_CANNY`,
the *high* value is the cutoff above which a
pixel is definitely an edge, and the *low*
value is the cutoff above which a pixel is an
edge only if it is connected to a definite one.
For :data:`~image.EDGE_SIMPLE`, only the *high*
value matters; it is the single cutoff above
which a pixel counts as an edge. The default of
``(100, 200)`` is a starting point worth
tuning for the specific scene.

::

    img.gaussian(1)                                   # pre-smooth
    img.find_edges(image.EDGE_CANNY, threshold=(50, 100))

The Canny detector is the better choice for
almost every application where edges matter.
The faster :data:`~image.EDGE_SIMPLE` is worth
remembering for the cases where the cost of
Canny is a problem and the noise rejection of
its hysteresis is not actually needed.

Adaptive thresholding on the Gaussian
-------------------------------------

Like the :doc:`statistical filters
<linear-neighborhood>`,
:meth:`~image.Image.gaussian` accepts the
``threshold=True`` / ``offset=N`` keyword pair
for adaptive thresholding. The behaviour is the
same as with :meth:`~image.Image.mean`: the
Gaussian statistic at each position becomes the
local cutoff, and the source pixel is compared
against the statistic plus the offset to
produce a binary result.

The Gaussian variant is usually the cleanest
choice for adaptive thresholding when the input
is reasonably noise-free. The weighted average
gives a smoother cutoff than the mean filter
produces, with fewer artefacts at sharp
illumination transitions.
