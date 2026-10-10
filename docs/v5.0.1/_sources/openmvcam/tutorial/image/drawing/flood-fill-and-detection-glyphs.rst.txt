Flood fill and detection glyphs
===============================

The geometric primitives at the start of this
section put marks at positions the application
already knows. Image composition lays one image
onto another. A small final group of drawing
methods does something different: it puts marks
whose form depends on what is *already in* the
image, or what some previous algorithm *found*
in it.

Flood fill
----------

:meth:`~image.Image.flood_fill` starts from a
single pixel -- the *seed* -- and grows outward,
painting every pixel that is similar enough to
the seed and connected to it through a chain of
other similar pixels. The result is a filled
region whose boundary is decided by the image
itself, not by anything passed to the call.

The simplest form takes the seed coordinate and
a colour to fill with:

::

    img.flood_fill(x=160, y=120, color=(0, 255, 0))

Two threshold parameters control how aggressively
the fill grows. ``seed_threshold`` (a normalised
fraction from ``0.0`` to ``1.0``) sets how
different a pixel can be from the *original
seed's* value while still being included.
``floating_threshold`` sets how different it can
be from each *already-included* neighbour. The
two thresholds work together: a generous
``floating_threshold`` lets the fill follow a
gradient across the image, while a tight
``seed_threshold`` keeps it from straying too
far from the seed value even along that
gradient.

A few flags refine the result further:

* ``invert=True`` paints every pixel that does
  *not* match -- the complement of the matching
  region -- rather than the matching pixels
  themselves.
* ``clear_background=True`` zeros every pixel
  outside the fill region. Useful for
  extracting just the filled region as a mask.
* The ``mask`` keyword has its usual meaning:
  pixels off in the mask are left alone
  regardless of whether the fill would
  otherwise have reached them.

Flood fill is most useful for two patterns. The
first is *visualising* what some region detector
found, by filling the detected region with a
distinct colour so it stands out against the
rest of the frame. The second is *extracting*
the region itself, by combining
``clear_background=True`` with a known seed
inside the region and reading the resulting
image as a mask for downstream operations.

Drawing detection results
-------------------------

Image-processing algorithms often return
*result objects* that carry both a position and
some additional structure: a keypoint with an
orientation, a face detection with a centroid
distinct from its bounding box, an AprilTag
with four corner points. Drawing those well --
with a glyph that captures the structure, not
just a bounding box -- is a recurring enough
pattern that the module exposes two helpers for
it.

:meth:`~image.Image.draw_keypoints` takes either
a keypoint descriptor returned by a feature
extractor, or a plain list of
``(x, y, rotation)`` triples, and draws a small
glyph at each point. The glyph carries both the
position and the orientation: a circle around
the point plus a line out of the centre
indicating the rotation. That single-call
visualisation is the easiest way to sanity-check
that a keypoint extractor is returning the
orientations the application expects.

:meth:`~image.Image.draw_detection` takes a
six-tuple ``(rx, ry, rw, rh, cx, cy)`` -- the
bounding rectangle plus a separately reported
centroid -- and draws both at once: a rectangle
around the bounding box, a cross at the
centroid, and optionally a text label at the
corner of the rectangle. The form matches what
a neural-network detection or a template
tracker typically reports, where the centroid
is a more precise position than the centre of
the bounding box would give.

Both glyph methods are convenience layers over
the geometric primitives at the start of this
section. An application can always reproduce the
same visualisation by calling
:meth:`~image.Image.draw_rectangle`,
:meth:`~image.Image.draw_circle`,
:meth:`~image.Image.draw_cross`, and
:meth:`~image.Image.draw_string` directly; the
glyph methods just save the bookkeeping for the
patterns that come up over and over.

With the geometric primitives for known geometry,
image composition for overlays, flood fill for
image-derived regions, and the detection
glyphs for the standard visualisation patterns,
the drawing toolkit is complete. Anything an
application needs to make algorithm output
visible has a method on the surface that puts
it there.
