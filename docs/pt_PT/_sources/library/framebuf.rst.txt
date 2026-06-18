:mod:`framebuf` --- frame buffer manipulation
=============================================

.. module:: framebuf
   :synopsis: Frame buffer manipulation

The :mod:`framebuf` module provides a small, allocation-free pixel
buffer with primitive drawing operations. It is intended for driving
external displays (OLEDs, LCDs, e-paper, etc.).

.. note::

   For image-processing work on captured frames, use OpenMV's much
   richer :class:`image.Image` class instead -- it offers far more
   drawing primitives, colour conversions and analysis features than
   :mod:`framebuf`.

class FrameBuffer
-----------------

A :class:`FrameBuffer` wraps a user-supplied buffer-protocol object
(typically a :class:`bytearray`) and exposes methods to draw pixels,
lines, rectangles, ellipses, polygons, text and other :class:`FrameBuffer`\
s into it.

Example::

    import framebuf

    # FrameBuffer needs 2 bytes for every RGB565 pixel.
    fbuf = framebuf.FrameBuffer(bytearray(100 * 10 * 2), 100, 10, framebuf.RGB565)

    fbuf.fill(0)
    fbuf.text("MicroPython!", 0, 0, 0xffff)
    fbuf.hline(0, 9, 96, 0xffff)

Constructors
------------

.. class:: FrameBuffer(buffer: Any, width: int, height: int, format: int, stride: int | None = None, /)

   Construct a :class:`FrameBuffer` object.

   - ``buffer`` -- any object supporting the buffer protocol; must be
     large enough to hold ``stride * height`` pixels at the chosen
     ``format``.
   - ``width`` -- width of the frame buffer in pixels.
   - ``height`` -- height of the frame buffer in pixels.
   - ``format`` -- pixel format; one of the constants listed under
     :ref:`framebuf-constants` below. The format determines both the
     size of each pixel in ``buffer`` and how a colour integer ``c``
     passed to any drawing method is interpreted.
   - ``stride`` -- number of pixels per horizontal row, including any
     padding. Defaults to ``width``. Set this to use a sub-region of a
     larger buffer.

   Passing a ``buffer`` that is too small, or invalid dimensions, will
   produce undefined results -- the constructor does not validate every
   combination.

Drawing methods
---------------

.. method:: FrameBuffer.fill(c: int) -> None

   Fill the entire frame buffer with colour ``c``.

.. method:: FrameBuffer.fill_rect(x: int, y: int, w: int, h: int, c: int) -> None

   Fill a ``w`` x ``h`` rectangle at ``(x, y)`` with colour ``c``.
   Equivalent to :meth:`rect` with ``f=True``.

.. method:: FrameBuffer.pixel(x: int, y: int, c: Optional[int] = None) -> Optional[int]

   With no ``c`` argument, return the colour value of the pixel at
   ``(x, y)``. With ``c`` given, set that pixel to colour ``c``.

.. method:: FrameBuffer.hline(x: int, y: int, w: int, c: int) -> None
            FrameBuffer.vline(x: int, y: int, h: int, c: int) -> None
            FrameBuffer.line(x1: int, y1: int, x2: int, y2: int, c: int) -> None

   Draw a 1-pixel-thick line in colour ``c``. :meth:`hline` and
   :meth:`vline` draw a horizontal/vertical line of the given length;
   :meth:`line` draws a line between two arbitrary points.

.. method:: FrameBuffer.rect(x: int, y: int, w: int, h: int, c: int, f: bool = False) -> None

   Draw a rectangle at ``(x, y)`` of size ``w`` x ``h`` in colour ``c``.
   If ``f`` is ``True`` the rectangle is filled; otherwise only a 1-pixel
   outline is drawn.

.. method:: FrameBuffer.ellipse(x: int, y: int, xr: int, yr: int, c: int, f: bool = False, m: int = 0) -> None

   Draw an ellipse centred on ``(x, y)`` with x-radius ``xr`` and
   y-radius ``yr`` in colour ``c``. Equal radii produce a circle.
   ``f=True`` fills the shape instead of just outlining it.

   ``m`` is a bitmask that restricts drawing to specific quadrants
   (numbered counter-clockwise from the top-right):

   .. list-table::
      :header-rows: 1
      :widths: 18 16 66

      * - Bit
        - Quadrant
        - Region
      * - bit 0
        - Q1
        - Top-right
      * - bit 1
        - Q2
        - Top-left
      * - bit 2
        - Q3
        - Bottom-left
      * - bit 3
        - Q4
        - Bottom-right

   The default ``m=0`` draws all four quadrants.

.. method:: FrameBuffer.poly(x: int, y: int, coords: Any, c: int, f: bool = False) -> None

   Draw an arbitrary closed polygon (convex or concave) at offset
   ``(x, y)`` in colour ``c``. ``coords`` must be an :mod:`array` of
   signed 16-bit integers laid out as
   ``array('h', [x0, y0, x1, y1, ..., xn, yn])``. ``f=True`` fills the
   polygon instead of just outlining it.

.. method:: FrameBuffer.text(s: str, x: int, y: int, c: int = 1) -> None

   Draw the string ``s`` with its top-left corner at ``(x, y)`` in
   colour ``c``. The built-in font is fixed at 8x8 pixels and cannot
   be changed. ``c`` defaults to ``1``.

.. method:: FrameBuffer.scroll(xstep: int, ystep: int) -> None

   Shift the buffer contents by ``(xstep, ystep)``. Pixels shifted in
   from outside the buffer are not cleared, so a "ghost" of the
   previous contents may remain at the trailing edge.

.. method:: FrameBuffer.blit(fbuf: Union[FrameBuffer, Tuple], x: int, y: int, key: int = -1, palette: Optional[FrameBuffer] = None) -> None

   Draw another frame buffer ``fbuf`` on top of this one with its
   top-left corner at ``(x, y)``.

   If ``key`` is given, any source pixel matching that colour value
   is treated as transparent and not drawn. When a ``palette`` is
   provided, the comparison is made against the palette output, not
   the raw ``fbuf`` value.

   ``fbuf`` can be a :class:`FrameBuffer` instance or a tuple/list
   matching the constructor signature::

       (buffer, width, height, format)
       (buffer, width, height, format, stride)

   When the source is a tuple/list, ``buffer`` may be read-only.

   ``palette`` allows blitting between buffers of different formats --
   for example, rendering a monochrome glyph into an RGB565 buffer. It
   is a :class:`FrameBuffer` whose format matches the destination, with
   height 1 and width equal to the number of source colours (``2**N``
   for an N-bit-per-pixel source). Source pixel value ``i`` is replaced
   with the colour at ``palette[i, 0]`` before drawing.

.. _framebuf-constants:

Constants
---------

The following ``format`` values are accepted by the constructor. The
"bytes per pixel" column is the multiplier needed when sizing the
backing buffer.

.. list-table::
   :header-rows: 1
   :widths: 22 14 64

   * - Constant
     - Bytes/pixel
     - Pixel layout
   * - ``MONO_VLSB``
     - 0.125
     - Monochrome (1-bit). Each byte holds 8 vertically-stacked pixels
       with bit 0 nearest the top. Rows of 8 pixels advance left-to-right
       across the buffer, then wrap to the next 8-pixel row.
   * - ``MONO_HLSB``
     - 0.125
     - Monochrome (1-bit). Each byte holds 8 horizontal pixels with bit
       7 leftmost. Rows advance one pixel at a time vertically.
   * - ``MONO_HMSB``
     - 0.125
     - Monochrome (1-bit). Like ``MONO_HLSB`` but with bit 0 leftmost.
   * - ``GS2_HMSB``
     - 0.25
     - 2-bit greyscale (4 levels), packed horizontally most-significant
       bit first.
   * - ``GS4_HMSB``
     - 0.5
     - 4-bit greyscale (16 levels), packed horizontally most-significant
       nibble first.
   * - ``GS8``
     - 1
     - 8-bit greyscale (256 levels).
   * - ``RGB565``
     - 2
     - 16-bit RGB with 5 red, 6 green and 5 blue bits.

``framebuf.MVLSB`` is a deprecated alias for ``framebuf.MONO_VLSB``;
prefer the latter in new code.

Legacy constructor
------------------

.. function:: FrameBuffer1(buffer: Any, width: int, height: int, stride: int | None = None, /) -> FrameBuffer

   Deprecated shortcut for ``FrameBuffer(buffer, width, height,
   framebuf.MONO_VLSB, stride)``. Retained for backwards compatibility;
   use the full :class:`FrameBuffer` constructor instead.
