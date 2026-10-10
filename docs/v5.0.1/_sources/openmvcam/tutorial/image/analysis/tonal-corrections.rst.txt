Tonal corrections
=================

Tonal corrections change how brightness and
colour are distributed in a captured image --
the fixes an application applies when a frame
is too dark, too bright, too flat, or skewed
toward the wrong colour.

The corrections belong to two families:
brightness-and-contrast adjustments that
redistribute brightness, and colour
adjustments that change which colour each
pixel reads as. Both have analogues in the
sensor's :doc:`ISP
</openmvcam/tutorial/vision/color/isp-pipeline>`,
which corrects each frame on its way in; the
methods here apply to an already-captured
:class:`Image`, after the fact, for the cases
where the frame needs more correction than the
ISP provided.

Histogram equalisation
----------------------

The simplest contrast-stretching operation is
*histogram equalisation*. The idea is to
remap pixel values so the histogram of the
output is as flat as possible -- every value
appears roughly equally often. The visual
effect is that a low-contrast image (one
whose histogram is concentrated in a narrow
band) becomes a high-contrast one whose
pixels cover the full ``0`` -- ``255`` range.

:meth:`~image.Image.histeq` runs the
equalisation:

::

    img.histeq()

The mechanic is direct. The cumulative
distribution function (CDF) of the source's
histogram is computed; each input pixel value
is mapped to its position in the CDF, scaled
to the output range. Where pixels were
already evenly spread, the mapping is close
to the identity; where pixels were piled up
at one brightness, the mapping spreads them
out by stretching that brightness across a
wider range of output values.

The result is dramatic on low-contrast
scenes -- the difference between a dim
indoor photograph and the same photograph
after histeq is often the difference between
"unreadable" and "perfectly legible." The
trade-off is that the operation amplifies
*everything*, including sensor noise. On a
scene with real low-contrast detail to
recover, histeq is the right answer; on a
clean, well-exposed scene that simply does
not need it, histeq introduces visible
noise.

CLAHE: adaptive equalisation
----------------------------

Histogram equalisation is global: it uses
one CDF computed from the whole image and
applies it everywhere. That works on images
whose brightness range is roughly uniform,
but fails on scenes with localised dark and
bright regions -- the CDF gets pulled toward
the side that has more pixels, and the
opposite side gets overcorrected.

The adaptive variant is *Contrast Limited
Adaptive Histogram Equalisation*, commonly
referred to as CLAHE. Instead of one *global*
CDF, CLAHE computes a separate CDF for every
small tile of the image, equalises each tile
against its own CDF, and blends the tile
boundaries together. The result is that
brightness adjustments happen *locally* --
the shadowed corner gets its own equalisation
without the bright corner pulling it the
wrong way.

The ``adaptive=True`` flag switches
:meth:`~image.Image.histeq` into CLAHE mode:

::

    img.histeq(adaptive=True, clip_limit=10)

The ``clip_limit`` parameter is the part of
CLAHE that the "contrast limited" in the name
refers to. Local equalisation can over-amplify
noise in flat regions where the CDF has very
few distinct values; the clip limit caps how
aggressively any single bin can be
redistributed, which prevents the noise
amplification while still allowing the
contrast stretching where it matters. A value
around ``10`` is a reasonable starting point;
larger values let CLAHE work harder at the
cost of more visible noise, smaller values
make it gentler.

CLAHE is more expensive than the *global*
histeq, but produces cleaner results on
scenes where the brightness is unevenly
distributed -- which is most real-world
scenes.

Gamma, contrast, and brightness
-------------------------------

Histogram equalisation is the data-driven
way to remap brightness. The
*data-independent* way is to apply a chosen
curve, parameterised by a few easy-to-tune
knobs. :meth:`~image.Image.gamma` provides
three:

::

    img.gamma(gamma=1.0, contrast=1.0, brightness=0.0)

Each parameter applies one specific
transformation to every pixel:

``gamma`` runs each pixel's value through the
power function ``output = input ** (1 / gamma)``.
The standard meaning: values larger than ``1.0``
*brighten* the image and lift midtones (the
classical "monitor gamma" correction); values
smaller than ``1.0`` *darken* it. The
parameter is non-linear -- it preserves the
black and white points and only reshapes the
distribution in between, which is the right
behaviour when the goal is to recover detail
in shadow or highlight regions without
crushing the existing extremes.

``contrast`` runs each pixel through a
straight multiplication around the mid-grey
point. Values larger than ``1.0`` increase
contrast (dark gets darker, bright gets
brighter, mid-grey stays the same); values
smaller than ``1.0`` reduce contrast.

``brightness`` adds a constant to every
pixel value. Positive values brighten,
negative values darken. The shift is
*uniform* -- nothing is preserved -- which
is rarely what an application wants by
itself, but pairs well with a contrast pass
to recentre the result.

The three parameters compose: a single
:meth:`~image.Image.gamma` call can apply a
gamma curve, then a contrast multiplication,
then a brightness shift, all in one pass.
The order is gamma first, then contrast,
then brightness, which matches the order
that gives the most intuitive results when
all three are non-default.

Auto white balance
------------------

The colour family of tonal corrections starts
with *auto white balance*. The same mechanism
the sensor's ISP runs as part of the imaging
pipeline -- adjusting the relative gains on
the red, green, and blue channels so that an
average grey-coloured patch reads as actual
grey -- is also available as a post-capture
operation on a finished :class:`Image`:

::

    img.awb()

The default uses the *gray-world* algorithm:
the average colour of the whole image is
assumed to be neutral grey, and the
per-channel gains are adjusted to make it so.
The alternative ``max=True`` form uses the
*white-patch* algorithm: the brightest pixels
are assumed to be neutral white, and the
gains are adjusted to make them so. Both work
on RGB565 and on raw Bayer; neither works on
grayscale (where there is no colour to
balance) or YUV (where the colour
representation is not what these algorithms
operate on).

When to reach for the post-capture form rather
than the ISP's auto white balance: when the
ISP's choice was a poor match for the
particular scene, when the application is
loading reference frames from disk that were
captured under different conditions, or when
the colour judgement matters enough that the
application wants to re-run it with its own
choice of algorithm.

The colour correction matrix
----------------------------

When the colour correction the image needs is
not the per-channel scaling that white balance
gives, but a more general
*channel-mixing*, the operation to reach for
is the *colour correction matrix*. The
:meth:`~image.Image.ccm` method applies a
3-by-3 (or 3-by-4 with offset) matrix that
multiplies every pixel's ``(r, g, b)`` vector
to produce a new ``(r, g, b)`` vector:

::

    img.ccm([[1.1, -0.05, -0.05],
            [-0.05, 1.1, -0.05],
            [-0.05, -0.05, 1.1]])

The matrix lets the application correct
crosstalk between the colour channels --
where the red sensor's response includes
some green light, for example, the matrix
can subtract a fraction of the green channel
from the red output to compensate.
Combined with a per-channel offset, the
3-by-4 form lets the application also
re-zero each channel.

The :doc:`ISP pipeline
</openmvcam/tutorial/vision/color/isp-pipeline>`
material covers the *why* of colour correction
matrices. The post-capture form on the
:class:`Image` is just the same operation,
applied after the fact.
