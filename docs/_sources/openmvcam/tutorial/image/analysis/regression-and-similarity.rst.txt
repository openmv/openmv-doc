Regression and similarity
=========================

Two more measurements on the :class:`Image`
class summarise the image as something other
than a distribution of pixel values. Linear
regression of thresholded pixels gives an
application a *line* it can act on -- the
classical input to a line-following robot.
Similarity measurement gives an application a
single number describing how alike two images
are -- the natural input to a golden-image
regression test or a gross-change detector.

Linear regression
-----------------

When the foreground pixels of an image
happen to form a *line* across the frame
-- the tape on a track that a robot is
following, the line of a horizon, the edge
of a road or a corridor -- the application
usually does not want every individual
foreground pixel. It wants the *best-fit
line* through them all, parameterised so it
can decide how the line is oriented and where
it crosses the frame.

:meth:`~image.Image.get_regression` does
that fit. It takes the same threshold tuple
form that :meth:`~image.Image.binary` and
:meth:`~image.Image.find_blobs` use,
identifies every pixel that matches the
threshold, and returns a single
:class:`line` result describing the
best-fit line through those pixels:

::

    line = img.get_regression([(0, 60)])
    if line:
        img.draw_line((line.x1(), line.y1(),
                       line.x2(), line.y2()),
                      color=(255, 0, 0))

The fit is *Theil-Sen* linear regression --
a robust method that tolerates outliers
better than the more familiar least-squares
fit. A small handful of pixels far from the
true line do not skew the result the way
they would with least squares, which matches
the noisy-foreground reality of a real
threshold output.

The :class:`line` result carries the
endpoints clipped to the image rectangle
(``x1``, ``y1``, ``x2``, ``y2``), the line
length and magnitude (``length``,
``magnitude``), and the line's geometric
description in polar form (``theta``,
``rho``) -- the angle of the line from
horizontal and its perpendicular distance
from the origin. The polar form is what a
control loop usually wants: ``theta`` tells
the robot which way the line is leaning,
``rho`` tells it where the line crosses
the image, and a feedback loop on the two
keeps the robot centred on the line.

A handful of keyword arguments tune the
robustness and the cost. ``x_stride`` and
``y_stride`` skip pixels during the fit --
larger strides make the regression cheaper
at the cost of fitting fewer pixels.
``area_threshold`` and ``pixels_threshold``
reject lines that do not have enough
matching pixels behind them. ``target_size``
re-scales the input to a smaller size before
fitting -- the regression runs faster on a
80-by-60 surrogate of the image without
much loss in line direction accuracy.

If no acceptable line could be fit -- if the
threshold matched no pixels, or matched a
pattern that does not look like a line --
the method returns :data:`None`. Real
line-following code guards every
:meth:`~image.Image.get_regression` call
with a ``None`` check before reaching for the
line's attributes.

Image similarity
----------------

A different kind of measurement: instead of
asking "what does the image contain?", ask
"how alike are these two images?". The
operation to reach for is
:meth:`~image.Image.get_similarity`, which
computes the *Structural Similarity Index*
(SSIM) between the source image and a
reference image.

::

    s = img.get_similarity(reference)
    print(s.mean, s.stdev)

SSIM is the standard image-similarity metric
used across image processing because it
behaves the way a human's intuition about
similarity behaves -- a small shift or a
small brightness change reduces the score
slightly, while a large structural change
(missing object, different scene) reduces
it dramatically. The score ranges from
``-1`` to ``+1``: ``+1`` means the two
images are identical, ``0`` means they are
unrelated, and ``-1`` means they are
structurally opposite. A returned
:class:`similarity` object exposes the mean
SSIM across the image, plus the standard
deviation, min, and max of the per-tile
scores.

For the kind of comparison where a *small*
number is better than a large one -- a
regression test that should report zero on
"nothing changed" and rise as changes
accumulate -- the ``dssim=True`` flag
returns the structural dissimilarity: the
mean SSIM subtracted from ``1``, so the
return value is ``0.0`` for identical
images and rises as they differ.

Use cases for SSIM
------------------

The two common applications:

*Golden-image regression testing*.
A test framework captures a reference frame
under known-good conditions and stores it as
the golden image. Subsequent test runs
capture under the same conditions and
compare against the golden image with SSIM.
A score above some threshold (``0.95`` or
``0.98`` depending on tolerance) is a pass;
below is a fail. The test framework does not
need to know *what* changed -- the SSIM
score is the signal.

*Gross change detection*. An application
that wants a coarser version of frame
differencing -- one that ignores small
brightness changes but reacts to large
structural changes -- can use SSIM against
a reference frame instead of the
per-pixel :meth:`~image.Image.difference`
followed by a threshold. SSIM is less
sensitive to lighting drift than per-pixel
differencing, which makes it the better
choice when the goal is to detect "the
scene looks materially different" rather
than "any individual pixel changed."

Both applications use the same call --
``img.get_similarity(reference)`` -- and
trigger on a threshold of the returned
score. The difference is just whether the
threshold is high (regression test, looking
for a near-identical match) or low (change
detection, looking for any large structural
change).

The transform-and-compare form
------------------------------

A useful subtlety:
:meth:`~image.Image.get_similarity` accepts
the same ``x``, ``y``, ``x_scale``,
``y_scale``, ``roi``, ``rgb_channel``,
``alpha``, ``color_palette``,
``alpha_palette``, ``hint``, and
``transform`` parameters as
:meth:`~image.Image.draw_image`. The
reference image is positioned, scaled, and
transformed by those parameters *before* the
SSIM comparison runs.

That means an application can ask "how
similar is this scene to a reference frame
*after* a known displacement / rotation /
scale" without preparing a pre-transformed
reference image. It is the cheap way to
build a tracker that searches a parameter
space and reports which transform of the
reference best matches the current frame.
