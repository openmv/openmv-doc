A catalogue of standard kernels
===============================

The previous page introduced the
:meth:`~image.Image.morph` method as the way to
run an arbitrary 3-by-3 (or larger) kernel
across an image. The natural follow-up is which
kernels are *worth* running. Classical image
processing has accumulated a fair-sized
catalogue of weight patterns that come up over
and over -- edge detectors, sharpeners,
embosses, smoothers, motion-blurs. Each is
short, each does one thing, and most are
straightforward to read once the basic logic
of the weights makes sense.

This page is that catalogue. The kernels are
all 3-by-3 unless noted, so they all use
``size=1`` in the call. The structure of each
kernel's weights is described alongside it,
since reading the weights is what builds the
intuition for why one kernel emboss and
another sharpens.

The identity kernel
-------------------

The simplest possible kernel is the *identity*
-- one in the centre, zero everywhere else:

::

    identity = [0, 0, 0,
                0, 1, 0,
                0, 0, 0]

    img.morph(1, identity)

Each output pixel takes its value from the
centre of the neighbourhood, which is the
input pixel at the same position. The image
passes through unchanged. The identity has no
practical use as a filter, but it is the
useful baseline for understanding every other
kernel: any non-identity kernel is the identity
plus some modification.

A kernel where the centre weight is large and
the surrounding weights are small but negative
*subtracts* the surround from the centre. A
kernel with no centre weight and a structured
pattern in the surrounds produces a response
based purely on neighbour-to-neighbour
relationships. Reading any kernel as "identity
plus something" is the fastest way to predict
what it does.

Edge detection
--------------

*Edge-detection* kernels respond strongly to
positions where brightness is changing rapidly
in a particular direction, and produce near-zero
output where brightness is uniform. They are
the family whose weights sum to zero: a flat
patch (every pixel the same value) produces
zero output, because every positive weight is
exactly cancelled by an equal-magnitude
negative weight.

**Sobel-x** was introduced on the previous page
and is the canonical example. It detects
*vertical* edges (left/right brightness
transitions):

::

    sobel_x = [-1,  0,  1,
               -2,  0,  2,
               -1,  0,  1]

    img.morph(1, sobel_x, mul=0.25, add=128)

The matching **Sobel-y** is the same pattern
rotated 90 degrees; it detects horizontal edges
(up/down brightness transitions):

::

    sobel_y = [-1, -2, -1,
                0,  0,  0,
                1,  2,  1]

The middle row of Sobel-x has weights ``-2``
and ``2`` rather than ``-1`` and ``1``. The
extra weight on the centre row gives the kernel
a small built-in smoothing in the direction
*along* the edge, which makes it more robust
against noise than the simpler **Prewitt**
operator that drops those extra magnitudes:

::

    prewitt_x = [-1, 0, 1,
                 -1, 0, 1,
                 -1, 0, 1]

    prewitt_y = [-1, -1, -1,
                  0,  0,  0,
                  1,  1,  1]

Prewitt is faster (slightly smaller arithmetic)
and produces sharper edge responses, at the
cost of being more sensitive to single-pixel
noise. On a clean image with strong edges, it
is a perfectly serviceable substitute for Sobel.

**Scharr** goes the other direction. Its weights
are larger and tuned for accurate detection of
edge direction at finer angles:

::

    scharr_x = [-3,   0,  3,
                -10,  0, 10,
                -3,   0,  3]

    img.morph(1, scharr_x, mul=0.0625, add=128)

The ``mul=0.0625`` divisor (``1/16``) brings the
output back inside ``0`` -- ``255`` after the
larger sum-of-products. Scharr is the right
answer when the application needs the most
geometrically faithful gradient response and is
willing to pay slightly more arithmetic for it.

The Laplacian
-------------

A *Laplacian* kernel responds to edges in *any*
direction at once. Where the Sobels each detect
brightness changes along one axis, the
Laplacian's symmetric weight pattern responds
the same way regardless of which direction the
edge is going:

::

    laplacian_4 = [ 0, -1,  0,
                   -1,  4, -1,
                    0, -1,  0]

    img.morph(1, laplacian_4, add=128)

The structure: centre weight ``4``, four
horizontal/vertical neighbours weighted ``-1``,
the four diagonals weighted zero. The kernel
sums to zero, so flat patches produce zero
output. Where brightness is changing, the
centre value differs from the average of its
four cardinal neighbours, and the output is the
size of that difference.

The 8-connected variant includes the diagonal
neighbours:

::

    laplacian_8 = [-1, -1, -1,
                   -1,  8, -1,
                   -1, -1, -1]

Each kernel detects slightly different things.
The 4-connected version produces cleaner output
on horizontal and vertical edges; the
8-connected one is more isotropic -- it
responds equally well in every direction --
but produces slightly noisier output.

Sharpening
----------

A *sharpening* kernel is the identity plus an
edge-response kernel. The output is the
original image plus a copy of the edges, so
high-frequency features get amplified relative
to smooth interiors.

The standard 4-connected sharpening kernel adds
the 4-connected Laplacian to the identity:

::

    sharpen = [ 0, -1,  0,
               -1,  5, -1,
                0, -1,  0]

    img.morph(1, sharpen)

Reading the kernel: the centre weight is
``identity (1) + Laplacian centre (4) = 5``,
and the surrounds match the Laplacian's. Flat
patches produce ``5 * 1 - 4 * 1 = 1`` times
the centre value -- the identity. Edges
produce the original plus the Laplacian
response. The sum of weights is ``1``, so
``mul`` and ``add`` stay at their defaults.

For stronger sharpening, the 8-connected
variant goes further:

::

    sharpen_strong = [-1, -1, -1,
                      -1,  9, -1,
                      -1, -1, -1]

    img.morph(1, sharpen_strong)

The centre weight ``9`` is ``identity (1) +
Laplacian-8 centre (8)``. Same logic, more
amplification, more risk of also amplifying
sensor noise.

Strong sharpening kernels are essentially
:meth:`~image.Image.gaussian` with
``unsharp=True``, just expressed directly as
a kernel rather than as the unsharp-mask
operation on the previous page. The pixel-level
behaviour is the same; the choice is between
the convenience of the named method and the
fine control of a hand-tuned kernel.

Emboss
------

An *emboss* kernel produces the lighting-from-
the-side effect found in classical image
editors. The output looks like the image was
extruded into a relief and then lit from one
corner:

::

    emboss = [-2, -1,  0,
              -1,  1,  1,
               0,  1,  2]

    img.morph(1, emboss, add=128)

The trick is the *asymmetry across the diagonal*.
The upper-left corner has the most negative
weight, the lower-right has the most positive
weight, and the diagonal from corner to corner
runs from negative through one to positive. At
each pixel the kernel essentially computes
"brightness on my lower-right minus brightness
on my upper-left," which is positive where the
image gets brighter in that direction and
negative where it gets darker. Adding ``128``
recentres the signed output to mid-grey so the
effect is visible.

Rotating the asymmetry across the other
diagonal embosses from the opposite direction:

::

    emboss_alt = [ 0,  1,  2,
                  -1,  1,  1,
                  -2, -1,  0]

    img.morph(1, emboss_alt, add=128)

The two emboss directions are useful in
combination -- subtracting one from the other,
or running each on the same image and
comparing the responses -- when an application
needs to detect orientation.

Smoothing
---------

Smoothing kernels are the family whose weights
sum to one (and are all non-negative). A flat
patch through such a kernel produces the same
flat brightness, because the kernel averages
the pixel values together rather than amplifying
their differences.

The simplest is the **box blur**, which is
exactly what :meth:`~image.Image.mean` computes:

::

    box_blur = [1, 1, 1,
                1, 1, 1,
                1, 1, 1]

    img.morph(1, box_blur)

The kernel sums to ``9``, so the auto-division
by the kernel sum (introduced on the previous
page) turns the sum-of-products into a true
average over the nine neighbourhood pixels.
There is no reason to prefer this over
:meth:`~image.Image.mean` when both produce the
same output; the box blur is in the catalogue
because it is the right baseline for
understanding every other smoothing kernel.

A 3-by-3 approximation of the **Gaussian**
weights the centre and the cardinal
neighbours more than the corners:

::

    gaussian = [1, 2, 1,
                2, 4, 2,
                1, 2, 1]

    img.morph(1, gaussian)

The weights are the Pascal-triangle row
``1, 2, 1`` outer-producted with itself. The
centre weight ``4`` is the largest because the
centre pixel contributes most to its own
output; the corners are ``1`` because they are
the farthest from the centre. The kernel sums
to ``16``, and the auto-division by the kernel
sum handles the normalisation -- no ``mul``
argument needed. The 3-by-3 form is a coarse
approximation of a true Gaussian and
indistinguishable from
:meth:`~image.Image.gaussian` at ``size=1``;
the morph form is mostly useful when an
application wants to compose the smoothing
with another operation in the same pass.

Motion blur
-----------

A **motion-blur** kernel averages pixels along
*one direction*, leaving the perpendicular
direction unblurred. The simplest case is
horizontal:

::

    motion_h = [0, 0, 0,
                1, 1, 1,
                0, 0, 0]

    img.morph(1, motion_h)

The middle row averages three pixels along the
horizontal axis; the top and bottom rows are
zero. The kernel sums to ``3``, so the
auto-division by the kernel sum produces a
true three-pixel average without any ``mul``
needed. The output is a horizontally-smeared
copy of the input -- the effect a camera
captures when the subject is moving sideways
during the exposure. The vertical motion blur
is the same pattern rotated:

::

    motion_v = [0, 1, 0,
                0, 1, 0,
                0, 1, 0]

A diagonal motion blur uses the main diagonal:

::

    motion_diag = [1, 0, 0,
                   0, 1, 0,
                   0, 0, 1]

    img.morph(1, motion_diag)

Motion blur kernels are useful both as an
*effect* (deliberately blurring a frame for
visual purposes) and as a *test pattern* for
algorithms that need to be robust against
motion artefacts (run the algorithm on a
motion-blurred input and check that it still
produces the right answer).

Outline
-------

An *outline* kernel highlights edges -- much
like a Laplacian -- but is sometimes preferred
because it produces a thicker, more visually
prominent edge response:

::

    outline = [-1, -1, -1,
               -1,  8, -1,
               -1, -1, -1]

    img.morph(1, outline)

This is identical to the 8-connected Laplacian.
The two names exist because the same kernel is
used for two slightly different purposes -- the
Laplacian when an application is treating the
output as a gradient signal, the outline when
the goal is visualising edges for human eyes.

Reading kernels at a glance
---------------------------

A few rules of thumb make new kernels easier to
read at sight:

* **Sum-to-one** with non-negative weights ⇒
  smoothing (preserves average brightness).
* **Sum-to-zero** with both positive and
  negative weights ⇒ edge response (zero on
  flat patches).
* **Sum-to-one** with a large positive centre
  and small negative surrounds ⇒ sharpening
  (identity plus edge response).
* **Asymmetric across a diagonal** with sum to
  one ⇒ embossing (highlights one side of every
  brightness transition).
* **Concentrated along one axis** with sum to
  one ⇒ directional blur.

The first one of these the kernel matches is
usually the right guess at what it does. Most
useful kernels are recognisable from the layout
of their weight pattern alone.

When *none* of the standard kernels does what
the application wants, the next step is to
hand-tune one. The combination of the rules
above and the ``mul`` / ``add`` controls covers
nearly every linear pass that a classical CV
pipeline has ever wanted; from there it is a
matter of trying weights, looking at the
output, and iterating.

With the morph mechanism understood from the
previous page and this catalogue of standard
kernels in hand, custom convolution covers the
linear filtering work that the built-in methods
do not -- and the bulk of the work that
classical image processing has spent decades
finding useful patterns for.
