Scale, flip, and crop
=====================

The previous subsections all worked on pixels
at the same positions they started in. The
*transform* family changes that. Scaling sends
every input pixel to a *different* output
position, possibly to several output positions
at once (when upscaling) or to a position
shared with several other input pixels (when
downscaling). Flipping and rotating do the same
thing through a different mapping. Cropping
keeps a rectangular subset of input pixels and
discards the rest.

The image module exposes that family through
three methods that share most of their
arguments and most of their behaviour:

* :meth:`~image.Image.copy` -- produce a copy
  of the image, possibly scaled, cropped, or
  re-oriented.
* :meth:`~image.Image.crop` -- the same
  operation as ``copy``, but with the
  expectation that the application is going to
  pick a sub-rectangle out of the source.
* :meth:`~image.Image.scale` -- the same again,
  with the expectation that the application is
  going to resize the result.

The three share the same arguments and the
same transform machinery; the difference is
where the result lands by default.
:meth:`~image.Image.copy` produces a new
image, while :meth:`~image.Image.crop` and
:meth:`~image.Image.scale` modify the source
in place.

The shared arguments
--------------------

A single call combines whatever combination of
scaling, cropping, orientation, and channel
extraction the application asks for:

``x_scale`` and ``y_scale`` scale the input
along the horizontal and vertical axes
independently. Both default to ``1.0`` (no
scaling). Different values for each produce a
non-uniform scaling -- a frame stretched twice
as wide as it is tall, for example.

``roi`` restricts the input to a rectangle of
the source image, taking only those pixels
through the rest of the transformation. This
is the "crop" part of the operation: pass an
``roi`` to extract a sub-region.

``hint`` is a bitfield of flags that selects
the interpolation method and any orientation
flips. Multiple flags combine through bitwise
OR (``hint=image.BILINEAR | image.HMIRROR``).
The flags break into two groups -- the
*interpolation* family and the *orientation*
family -- that have nothing to do with each
other but share the same bitfield.

``rgb_channel`` selects a single channel of an
RGB565 source. ``0`` means red, ``1`` means
green, ``2`` means blue; the result comes out
as a grayscale image containing just that
channel. Useful for thresholding on the red
channel alone, for example.

``color_palette`` and ``alpha_palette``
remap pixel values through a lookup table on
the way out, the same way the conversion
methods :meth:`~image.Image.to_rainbow` and
:meth:`~image.Image.to_ironbow` do.

``copy=True`` and ``copy_to_fb=True`` follow
the same convention every other
result-producing method uses -- in place by
default, ``copy=True`` allocates a separate
result, ``copy_to_fb=True`` places the result
in the frame buffer for the IDE preview.

Interpolation: AREA, BILINEAR, BICUBIC
--------------------------------------

When scaling sends each output pixel to a
position that does not align with any single
input pixel, the method has to pick what value
to write. Three flags control how:

``image.BILINEAR`` interpolates between the
four nearest input pixels weighted by their
distance from the output position. The result
is smoother than nearest-neighbour, with no
visible jaggies on diagonal lines, but the
extra arithmetic costs about four times the
nearest-neighbour pass. The right choice for
most upscaling work and for any non-integer
scale factor.

``image.BICUBIC`` interpolates between the
sixteen nearest input pixels using a cubic
curve, which produces still-smoother results
at the cost of more arithmetic again. Best
quality for the cost-sensitive applications
that need it; rarely worth the extra
computation for live frames the IDE will only
display.

``image.AREA`` averages every input pixel that
falls inside the output pixel's footprint --
the right algorithm for *downscaling*.
Bilinear and bicubic are interpolators: they
estimate a value *between* source pixels,
which is what upscaling needs, but when
downscaling each output pixel covers many
source pixels and an interpolator reads only
the few nearest ones -- the detail it skips
comes back as aliasing. ``image.AREA`` folds
every covered pixel into the average instead.

The default scaling algorithm without any hint
is nearest-neighbour, which is the cheapest
and the right answer when the source is
already at the destination's pixel resolution.

Orientation: flips and rotations
--------------------------------

The orientation flags are a small set of
boolean transformations that compose freely
with each other and with the interpolation
flags:

* ``image.VFLIP`` flips the image vertically
  (top becomes bottom).
* ``image.HMIRROR`` mirrors it horizontally
  (left becomes right).
* ``image.TRANSPOSE`` swaps the x and y axes
  (rows become columns).

Most rotations come from composing those
three. The module also exposes named
shortcuts:

* ``image.ROTATE_90`` (=
  ``VFLIP | TRANSPOSE``)
* ``image.ROTATE_180`` (=
  ``HMIRROR | VFLIP``)
* ``image.ROTATE_270`` (=
  ``HMIRROR | TRANSPOSE``)

In code:

::

    img.copy(hint=image.ROTATE_90, copy_to_fb=True)

Aspect handling
---------------

When the source's aspect ratio does not match
the rectangle it is being drawn into, three
flags decide what to do with the mismatch:

``image.SCALE_ASPECT_KEEP`` preserves the
source's aspect ratio and *letterboxes* the
result -- the source is scaled until it fits
inside the destination, with empty (zero)
pixels filling the rest of the destination.
The right choice when keeping the source
undistorted matters more than filling the
whole output.

``image.SCALE_ASPECT_EXPAND`` preserves the
source's aspect ratio and *crops* it -- the
source is scaled until it fills the
destination, with the parts that extend past
the destination cut off. The right choice
when filling the whole output matters more
than seeing every part of the source.

``image.SCALE_ASPECT_IGNORE`` ignores the
aspect ratio and stretches the source to fill
the destination, accepting whatever
distortion that introduces. The right choice
when the application has already accounted
for the distortion -- when the destination's
dimensions are not actually a rectangle of
the same scene, for example.

The default (no aspect flag set) is the same
as ``SCALE_ASPECT_IGNORE``: stretch to fill.
Applications that care about aspect ratio
specify one of the three explicitly.

When to reach for which
-----------------------

Most resizes use :meth:`~image.Image.scale`
with an ``x_scale`` / ``y_scale`` pair and an
interpolation hint:

::

    img.scale(x_scale=0.5, y_scale=0.5, hint=image.AREA)

Most rotations use the same call with
``hint=image.ROTATE_90`` or similar.

Cropping uses :meth:`~image.Image.crop` with
a non-default ``roi``:

::

    img.crop(roi=(40, 30, 200, 150))

When the source has to survive the operation
-- capturing a reference frame, taking a
thumbnail of a frame that is about to be
processed destructively --
:meth:`~image.Image.copy` produces the result
as a new image and leaves the source
untouched:

::

    thumbnail = img.copy(x_scale=0.25, y_scale=0.25, hint=image.AREA)

That default is the real difference behind
the three names: ``scale`` and ``crop``
transform in place, ``copy`` allocates. The
result-placement keywords bridge the gap:
``copy=True`` on ``scale`` or ``crop``
allocates the result as a separate heap
buffer instead of overwriting the source, and
``copy_to_fb=True`` on any of the three lands
it in the frame buffer for the IDE preview.

