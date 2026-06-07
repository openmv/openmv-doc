Compositing images
==================

The previous page's drawing primitives paint
*geometric* marks onto an image -- a line, a
rectangle, a piece of text. That covers most
annotations an algorithm needs to make visible,
but not all of them. Sometimes the annotation is
itself an image: a captured reference frame to
display side by side with the current one, a
small icon or logo overlaid in a corner of the
preview, a previously stored template visualised
on top of a live frame for calibration. The
mechanism for drawing one image onto another is
a single method -- :meth:`~image.Image.draw_image`
-- with enough parameters to handle the position,
the scaling, the colour palette, and the
transparency that real composition needs.

The basic call
--------------

In its simplest form, ``draw_image`` takes
another :class:`Image` and a position to draw
it at:

::

    icon = image.Image("/sdcard/logo.bmp")
    img.draw_image(icon, x=10, y=10)

The destination is ``img``; the source is
``icon``; the source's top-left pixel lands at
``(10, 10)`` of ``img``, and the rest of the
source's pixels follow to the right and downward
from there. Pixels of the destination that the
source covers are overwritten with the source's
corresponding pixels; pixels outside the
source's footprint are left alone.

If the source extends past the edge of the
destination, the parts that fall off are
silently clipped -- the same forgiving behaviour
``set_pixel`` shows for out-of-range positions.
Application code does not have to clamp the
position to the image dimensions in advance; it
can pass the position it wants and let the
method handle the clipping.

Loading a file inline
---------------------

``draw_image`` accepts a file path in place of
the ``Image`` argument and loads the file before
composing it:

::

    img.draw_image("/sdcard/logo.bmp", x=10, y=10)

That looks like a convenience -- one line
instead of two -- and it is, but the difference
is more than syntax. Constructing an
:class:`Image` from a file allocates a buffer to
hold the decoded pixels, and that buffer
survives until garbage collection releases it.
Passing the path directly to ``draw_image`` lets
the module decode the file into a scratch
buffer, composite from it, and release the
buffer when the call returns, without the
application code having to hold a reference to a
separate :class:`Image` between frames.

Scaling
-------

When the source and the destination are
different sizes -- a low-resolution capture
being composed onto a higher-resolution canvas,
or a logo that needs to be sized to a particular
fraction of the frame -- two scale parameters
take care of resizing the source as it is drawn:

::

    img.draw_image(icon, x=10, y=10, x_scale=2.0, y_scale=2.0)

``x_scale`` and ``y_scale`` are independent
floats; passing both at the same value scales
uniformly, and passing different values
stretches or shrinks the source along one axis.
The scaling happens at draw time; the source
``icon`` is not modified.

A bitmask of *hint* flags decides how the
scaling actually interpolates between pixels.
``image.BILINEAR`` produces smoother results at
the cost of more computation; ``image.BICUBIC``
produces still smoother results and costs more
again; the default uses nearest-neighbour, which
is the cheapest and the right choice when the
source is already at the destination's pixel
resolution. Aspect-handling flags --
``SCALE_ASPECT_KEEP``, ``SCALE_ASPECT_EXPAND``,
``SCALE_ASPECT_IGNORE`` -- decide what to do
when the source's aspect ratio does not match
the rectangle it is being drawn into.

Alpha blending
--------------

By default, ``draw_image`` *replaces*
destination pixels with source pixels. When the
goal is a *translucent* overlay -- so the
destination shows through the source -- the
``alpha`` parameter controls how the two are
mixed. ``alpha=0`` shows only the destination
(no source); ``alpha=255`` is the default and
shows only the source (full replacement);
intermediate values mix the two proportionally:

::

    img.draw_image(overlay, x=0, y=0, alpha=128)

A separate ``alpha_palette`` argument takes a
:data:`~image.GRAYSCALE` image whose values are
used as *per-pixel* alpha. That is the right
form when the overlay has a non-uniform
transparency -- an icon with soft anti-aliased
edges, say, or a heatmap whose alpha varies
with its intensity.

Source ROI and palette
----------------------

Two further parameters round out the composition
mechanism:

* ``roi=(x, y, w, h)`` restricts the source to
  a sub-rectangle of itself, so only that
  rectangle gets composed onto the destination.
  Useful for cropping inside the same call,
  without preparing a cropped intermediate.
* ``color_palette`` substitutes each source
  pixel's value through a lookup table before
  drawing -- the same mechanism
  :meth:`~image.Image.to_rainbow` and
  :meth:`~image.Image.to_ironbow` use, exposed
  here so an overlay can be palettised on its
  way onto the destination without a separate
  conversion pass.

Both compose with everything else on the call:
the scaling, the alpha, the destination-side
``mask`` argument, and the destination-side
``roi`` parameter that scopes the *write* to a
rectangle of the destination.

Aliases that signal intent
--------------------------

``draw_image`` has four aliases that do exactly
the same thing under different names:

* :meth:`~image.Image.blend`
* :meth:`~image.Image.replace`
* :meth:`~image.Image.assign`
* :meth:`~image.Image.set`

They exist because what the code is *doing*
frames how the code reads. A call to ``blend``
suggests the writer means an alpha-mixed
overlay; a call to ``replace`` suggests a full
substitution of the destination's pixels;
``assign`` and ``set`` suggest the destination
is being initialised from the source. The
behaviour is identical, but the name picked at
the call site tells the next reader of the code
what the intent was without making them inspect
the argument list.

With geometric primitives for known geometry,
the text primitive for labels, and image
composition for overlays, application code has
a complete set of ways to write *into* an
image. What remains is the small handful of
methods that mark the image based on what is
*already there* -- a flood fill grown from a
seed pixel, glyphs that visualise the structure
of a detection result.
