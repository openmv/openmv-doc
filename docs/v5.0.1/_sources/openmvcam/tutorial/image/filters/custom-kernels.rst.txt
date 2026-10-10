Custom convolution kernels
==========================

The neighbourhood filters covered so far each
had a *built-in* statistic the filter applied to
the window at every position -- the mean, the
Gaussian-weighted average, the median.
:meth:`~image.Image.morph` is the one filter
that lets the application supply the statistic
itself, in the form of a kernel: a small
matrix of weights that describes how the filter
should combine the neighbourhood pixels into a
single output value.

The mechanism is the classical *convolution*
operation. At every output position, every
neighbourhood pixel is multiplied by the
matching weight in the kernel, the products are
summed, the result is optionally scaled and
offset, and the value is written to the output
pixel. Different kernels produce different
results from the same input. A kernel with all
equal positive weights reproduces the
:meth:`~image.Image.mean` filter; a
bell-shaped one reproduces
:meth:`~image.Image.gaussian`. Patterns
beyond those produce edge responses, embosses,
gradients, sharpening, motion blur, and a long
catalogue of other effects -- everything
classical image processing has ever wanted to
do with a single linear pass.

The morph method
----------------

The signature looks like the other neighbourhood
filters with one extra argument:

::

    img.morph(size, kernel, mul=1.0, add=0.0)

``size`` is the radius the same way as
everywhere else, so the kernel must be exactly
``(2 * size + 1)`` rows by ``(2 * size + 1)``
columns. The kernel itself is a flat Python
list of those many numbers, in *row-major*
order -- the first ``(2 * size + 1)`` entries
are the top row, the next ``(2 * size + 1)``
are the second row, and so on, down to the
bottom row. ``mul`` scales the sum-of-products
before it is written into the output pixel,
and ``add`` adds a constant. The default
``mul=1.0`` and ``add=0.0`` leave the
convolution output unchanged.

One detail worth being explicit about: the
method automatically divides the
sum-of-products by the *sum of the kernel
entries* before writing the output. That
auto-division means an averaging kernel whose
entries sum to nine -- a 3-by-3 box blur, for
example -- comes out at one-ninth scale with
no extra effort, and a Gaussian-approximation
kernel that sums to sixteen comes out at
one-sixteenth scale, both without the
application having to compute the division
itself. The application sets ``mul`` only when
it wants a *further* scale on top of the
auto-normalisation -- or, more commonly, when
the kernel sums to zero (an edge-response
kernel) and the auto-division would be a
division by nothing. The framework treats the
sum as one in that case, and ``mul`` becomes
the only knob for keeping the unscaled
sum-of-products in range.

The ``threshold=True`` / ``offset=N`` pair
from the adaptive-threshold section also
works on :meth:`~image.Image.morph`, so the
same custom-kernel framework can produce a
binary threshold whose cutoff is computed by
a custom statistic.

The kernel layout
-----------------

A 3-by-3 kernel (``size=1``) is a flat list of
nine numbers laid out left to right, top to
bottom. The convention reads naturally if the
list is broken across three Python lines:

::

    sobel_x = [-1,  0,  1,
               -2,  0,  2,
               -1,  0,  1]

This is the *Sobel-x* gradient operator -- the
first standard kernel any application is going
to want and a useful one to walk through end
to end. The pattern is straightforward:
negative weights on the left column, positive
weights on the right column, with the centre
column zero. The row weights ``-1, -2, -1`` (or
``1, 2, 1`` on the right) are higher in the
middle than at the corners, which gives the
centre row more influence over the result than
the corner rows.

When the kernel sweeps across a vertical edge
-- a column of pixels that goes from dark on
the left to bright on the right -- the
negative weights pick up the dark side and the
positive weights pick up the bright side. The
sum of products is a large positive number,
which the filter writes as a bright output
pixel. A horizontal patch of uniform
brightness produces zero, because every
positive weight is matched by a negative
weight of the same magnitude on a pixel with
the same value.

Running the kernel:

::

    img.morph(1, sobel_x, mul=0.25)

The Sobel kernel sums to zero -- every
negative weight on the left side is matched by
an equal positive weight on the right -- so
the auto-division does not divide by anything,
and ``mul`` is the only scale on the
sum-of-products. ``mul=0.25`` keeps the
response in range: the largest absolute sum
the Sobel-x can produce from a 3-by-3 patch
is roughly ``4 * 255 = 1020`` (eight bright
pixels weighted up to ``2``), and dividing
that down by four lands the extreme cases at
``255``, where the format clips them cleanly.

The matching Sobel-y kernel detects horizontal
edges by rotating the same weight pattern 90
degrees:

::

    sobel_y = [-1, -2, -1,
                0,  0,  0,
                1,  2,  1]

Applications that want to detect *any* edge,
regardless of direction, typically run both
Sobels and combine the responses.

Offsetting the output
---------------------

``add`` is the other half of the scaling
story. A zero-sum kernel's response is
*signed* -- positive on one side of an edge,
negative on the other -- and the negative half
clips to zero when written into an unsigned
pixel. ``add=128`` shifts the response to be
centred at mid-grey, so negative responses
survive as values below ``128`` and positive
ones land above it: an edge response or an
emboss becomes visible in both directions, at
the cost of half the range in each.

Which combination of ``mul`` and ``add`` a
kernel expects is part of the kernel's design;
the :doc:`standard kernel catalogue
<standard-kernels>` lists the right settings
for each common kernel.

Larger kernels
--------------

Everything on this page has been described
with 3-by-3 kernels (``size=1``), because that
is the size the standard catalogue uses and
because the row-major layout is easy to write
out by hand at that size. Nothing in the
mechanism restricts the kernel to 3-by-3,
though. ``size=2`` runs a 5-by-5 kernel, with
twenty-five entries in the flat list;
``size=3`` runs a 7-by-7 with forty-nine; and
so on, up to whatever radius the application
is willing to pay for. The framework handles
either flat-list or nested-row layouts at any
odd size.

The reason to reach for a larger kernel is the
same reason to reach for a larger neighbourhood
on any of the built-in filters: more averaging,
broader feature detection, less sensitivity to
single-pixel noise. The cost grows as the
square of the radius -- a 5-by-5 does roughly
2.8 times the per-pixel work of a 3-by-3, a
7-by-7 about 5.4 times -- and that multiplier
comes straight out of the frame rate.

The practical pattern is to stay at ``size=1``
for the standard catalogue and reach for
larger sizes only when the algorithm needs
the larger neighbourhood. Edge detectors
rarely benefit beyond 3-by-3; smoothing
filters sometimes do; the right size depends
on the scale of the features the application
is trying to emphasise or suppress.

When to reach for morph
-----------------------

For everyday smoothing,
:meth:`~image.Image.mean`,
:meth:`~image.Image.gaussian`, and
:meth:`~image.Image.bilateral` are faster and
cleaner. For edge detection,
:meth:`~image.Image.laplacian` and
:meth:`~image.Image.find_edges` are
purpose-built. The case for reaching into
:meth:`~image.Image.morph` directly is when
the application needs a *specific* convolution
that the built-in filters do not expose -- a
directional Sobel, a custom edge template, a
kernel tuned to a particular texture the rest
of the pipeline is going to look for, or any
of the standard catalogue of useful kernels
that classical image processing has built up
over the decades. The full flexibility of
arbitrary kernels is available; the price is
that the application is responsible for
choosing the kernel values that produce the
result it wants.
