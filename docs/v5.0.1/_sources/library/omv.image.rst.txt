:mod:`image` --- machine vision
===============================

.. module:: image
   :synopsis: machine vision

The :mod:`image` module is the heart of the OpenMV machine-vision
stack. It exposes the :class:`Image` class -- the in-memory pixel
buffer that every drawing, filtering, transformation and feature-
extraction routine operates on -- together with the supporting
result objects returned by those routines (:class:`Blob <blob>`,
:class:`Line <line>`, :class:`Circle <circle>`, :class:`Rect <rect>`,
:class:`QRCode <qrcode>`, :class:`AprilTag <apriltag>`,
:class:`DataMatrix <datamatrix>`, :class:`BarCode <barcode>`, ...)
and the helper classes used to configure them
(:class:`Threshold <threshold>`, :class:`Histogram <histogram>`,
:class:`Statistics <statistics>`, :class:`HaarCascade <Cascade>`,
:class:`Similarity <similarity>`, :class:`Percentile <percentile>`,
:class:`Displacement <displacement>`, :class:`ImageIO`).

Acquiring an Image
------------------

There are four ways to get an :class:`Image` into RAM:

* **Live capture from the camera sensor.** Call
  :meth:`csi.CSI.snapshot` to capture the next frame straight into
  the frame buffer; the returned :class:`Image` references that
  buffer.
* **From a file.** Pass a path to the :class:`Image` constructor
  (``image.Image("/sd/photo.jpg")``); supported on-disk formats are
  BMP, PPM/PGM, JPEG, PNG and the OpenMV :class:`ImageIO` recording
  format.
* **From an ndarray.** Pass a float32 ``(h, w)`` or ``(h, w, 3)``
  ``ndarray`` to the :class:`Image` constructor. The pixels are
  scaled from ``0.0 -- 255.0`` into a GRAYSCALE or RGB565 image
  respectively. Use this to bring tensor output from :mod:`ml` (or
  any :mod:`ulab` pipeline) back into a drawable image.
* **Empty buffer.** Construct an :class:`Image` with a given size
  and pixel format (``image.Image(320, 240, image.RGB565)``) to
  draw into from scratch, or to use as a scratch surface for image
  arithmetic.

Pixel formats
-------------

Every :class:`Image` has one of the following pixel formats; the
choice trades off memory, processing cost and what algorithms can
run on it. Use :data:`BINARY`, :data:`GRAYSCALE`, :data:`RGB565`,
:data:`BAYER`, :data:`YUV422`, :data:`JPEG` or :data:`PNG` as the
``pixformat`` argument when constructing an image or configuring
the camera sensor:

* **BINARY (1 bpp)** -- one bit per pixel. The smallest format;
  used internally by thresholding and morphology routines but
  rarely captured directly from the sensor.
* **GRAYSCALE (8 bpp)** -- one byte per pixel (the Y channel of
  YUV422). Fastest format for most computer-vision algorithms
  (AprilTag, edge detection, optical flow).
* **RGB565 (16 bpp)** -- two bytes per pixel, 5-bit red / 6-bit
  green / 5-bit blue. The default colour format.
* **BAYER (8 bpp)** -- raw Bayer-pattern colour data straight off
  the sensor. Useful for custom de-mosaicing or for storing more
  pixels in less memory before debayering on demand.
* **YUV422 (16 bpp)** -- 4:2:2 chroma-subsampled colour, two bytes
  per pixel. Useful when you want chroma-specific algorithms
  without paying the full RGB cost.
* **JPEG / PNG** -- compressed buffers. Best for storage and
  network transmission. Pixel-level operations require
  :meth:`Image.to_grayscale` or :meth:`Image.to_rgb565` first.

Working with results
--------------------

The detection / feature-extraction methods on :class:`Image`
return objects you can iterate over and combine -- a
:meth:`Image.find_blobs` call returns a list of
:class:`Blob <blob>`, a :meth:`Image.find_apriltags` call returns
a list of :class:`AprilTag <apriltag>`, etc. Each result class
exposes the geometric properties of the detection (centroid,
bounding box, area, code value, etc.) so you can act on them
directly or pass them back into drawing methods
(:meth:`Image.draw_rectangle`, :meth:`Image.draw_string`, ...).

Color-space helpers
-------------------

The module also exposes small pure functions for converting
individual pixel values between the binary / grayscale / RGB / LAB
/ YUV colour spaces. These are useful when you need to convert
threshold values or palette entries in Python before passing them
into image operations -- for full-image conversion use the
:class:`Image` ``to_*`` methods, which are much faster than calling
these helpers in a loop.

Classes
-------

.. toctree::
   :maxdepth: 1

   omv.image.Image.rst
   omv.image.ImageIO.rst
   omv.image.HaarCascade.rst
   omv.image.Similarity.rst
   omv.image.Histogram.rst
   omv.image.Percentile.rst
   omv.image.Threshold.rst
   omv.image.Statistics.rst
   omv.image.Blob.rst
   omv.image.Line.rst
   omv.image.Circle.rst
   omv.image.Rect.rst
   omv.image.QRCode.rst
   omv.image.AprilTag.rst
   omv.image.DataMatrix.rst
   omv.image.BarCode.rst
   omv.image.Displacement.rst
   omv.image.kptmatch.rst

Functions
---------

Color-space conversion helpers
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Each of the ``X_to_Y`` functions below performs a single pixel-value
conversion. They all take/return values in the canonical OpenMV ranges:

* binary -- ``int`` 0 -- 1.
* grayscale -- ``int`` 0 -- 255.
* RGB -- ``(r, g, b)`` tuple of 8-bit integers (each 0 -- 255).
* LAB -- ``(l, a, b)`` tuple with ``L`` in 0 -- 100 and ``A``/``B`` in
  -128 -- 127.
* YUV -- ``(y, u, v)`` tuple with ``Y`` in 0 -- 255 and ``U``/``V`` in
  -128 -- 127.

For full-image conversion use the :class:`Image` ``to_*`` methods, which
are much faster than calling these helpers in a loop.

.. function:: binary_to_grayscale(value: int) -> int

   Convert a binary value to a grayscale value.

.. function:: binary_to_rgb(value: int) -> Tuple[int, int, int]

   Convert a binary value to an RGB tuple.

.. function:: binary_to_lab(value: int) -> Tuple[int, int, int]

   Convert a binary value to a LAB tuple.

.. function:: binary_to_yuv(value: int) -> Tuple[int, int, int]

   Convert a binary value to a YUV tuple.

.. function:: grayscale_to_binary(value: int) -> int

   Convert a grayscale value to a binary value.

.. function:: grayscale_to_rgb(value: int) -> Tuple[int, int, int]

   Convert a grayscale value to an RGB tuple.

.. function:: grayscale_to_lab(value: int) -> Tuple[int, int, int]

   Convert a grayscale value to a LAB tuple.

.. function:: grayscale_to_yuv(value: int) -> Tuple[int, int, int]

   Convert a grayscale value to a YUV tuple.

.. function:: rgb_to_binary(value: Tuple[int, int, int]) -> int

   Convert an RGB tuple to a binary value.

.. function:: rgb_to_grayscale(value: Tuple[int, int, int]) -> int

   Convert an RGB tuple to a grayscale value.

.. function:: rgb_to_lab(value: Tuple[int, int, int]) -> Tuple[int, int, int]

   Convert an RGB tuple to a LAB tuple.

.. function:: rgb_to_yuv(value: Tuple[int, int, int]) -> Tuple[int, int, int]

   Convert an RGB tuple to a YUV tuple.

.. function:: lab_to_binary(value: Tuple[int, int, int]) -> int

   Convert a LAB tuple to a binary value.

.. function:: lab_to_grayscale(value: Tuple[int, int, int]) -> int

   Convert a LAB tuple to a grayscale value.

.. function:: lab_to_rgb(value: Tuple[int, int, int]) -> Tuple[int, int, int]

   Convert a LAB tuple to an RGB tuple.

.. function:: lab_to_yuv(value: Tuple[int, int, int]) -> Tuple[int, int, int]

   Convert a LAB tuple to a YUV tuple.

.. function:: yuv_to_binary(value: Tuple[int, int, int]) -> int

   Convert a YUV tuple to a binary value.

.. function:: yuv_to_grayscale(value: Tuple[int, int, int]) -> int

   Convert a YUV tuple to a grayscale value.

.. function:: yuv_to_rgb(value: Tuple[int, int, int]) -> Tuple[int, int, int]

   Convert a YUV tuple to an RGB tuple.

.. function:: yuv_to_lab(value: Tuple[int, int, int]) -> Tuple[int, int, int]

   Convert a YUV tuple to a LAB tuple.

Feature descriptors
~~~~~~~~~~~~~~~~~~~

.. function:: HaarCascade(path: str, stages: int = -1) -> Cascade

   Load a Haar Cascade and return a :class:`Cascade <Cascade>` handle for
   use with `Image.find_features()`.

   ``path`` may be either:

      * the literal string ``"frontalface"`` or ``"eye"`` to load one of
        the two cascades baked into firmware ROM, or
      * a filesystem path to a custom ``.cascade`` binary file produced
        by the OpenMV cascade-converter tools.

   ``stages`` selects how many cascade stages to evaluate at detection
   time. ``-1`` uses every stage stored in the file. Reducing this value
   speeds up detection at the cost of more false positives.

.. function:: load_descriptor(path: str) -> kp_desc | lbp_desc

   Load a descriptor from the file at ``path`` and return it. The file's
   internal type tag selects which descriptor class is reconstructed:

      * ORB keypoint descriptor -- saved by `Image.find_keypoints()`
        followed by `image.save_descriptor()`.
      * LBP descriptor -- saved by `Image.find_lbp()` followed by
        `image.save_descriptor()`.

.. function:: save_descriptor(descriptor: kp_desc | lbp_desc, path: str) -> None

   Serialise ``descriptor`` (an ORB keypoint or LBP descriptor) to the
   file at ``path`` in the OpenMV descriptor file format. The same file
   can later be reloaded via `image.load_descriptor()`.

.. function:: match_descriptor(descriptor0, descriptor1, threshold: int = 85, filter_outliers: bool = False) -> int | kptmatch

   Match two descriptors of the same type.

   * For two LBP descriptors -- returns an integer Hamming distance
     between them (lower is a closer match).
   * For two ORB keypoint descriptors -- returns a
     :class:`kptmatch <kptmatch>` describing the matched-keypoint
     cluster, or ``None`` if no match passes ``threshold``.

   ``threshold`` (0 -- 100) sets how strict ORB matching is when
   accepting a keypoint pair. Lower values tighten matching by rejecting
   weak nearest-neighbour matches.

   ``filter_outliers`` enables RANSAC-style outlier rejection across the
   set of matched keypoints. Use it when you expect a single rigid
   transform between the two views; disable it when the matched
   keypoints span multiple objects.

Blob geometry helpers
~~~~~~~~~~~~~~~~~~~~~

These helpers take a :class:`Blob <blob>` (as returned by
`Image.find_blobs()`) and compute additional geometric properties on
demand. They live at module scope -- not on :class:`Blob <blob>` -- so
the basic ``find_blobs()`` path doesn't pay for them unless you ask.

.. function:: get_solidity(blob: blob) -> float

   Return the solidity (``blob.pixels / convex_hull_area``) of ``blob``.
   Float, 0 -- 1; 1.0 means the blob fully fills its convex hull.

.. function:: get_convexity(blob: blob) -> float

   Return the convexity (``convex_hull_perimeter / blob.perimeter``) of
   ``blob``. Float, 0 -- 1; 1.0 is a perfectly convex blob.

.. function:: get_major_axis_line(blob: blob) -> line

   Return a :class:`Line <line>` along the major axis of ``blob`` (the
   longer of the two principal axes of the minimum-area rotated
   rectangle).

.. function:: get_minor_axis_line(blob: blob) -> line

   Return a :class:`Line <line>` along the minor axis of ``blob`` (the
   shorter of the two principal axes of the minimum-area rotated
   rectangle).

.. function:: get_enclosing_circle(blob: blob) -> circle

   Return a :class:`Circle <circle>` that encloses ``blob``.

.. function:: get_enclosed_ellipse(blob: blob) -> Tuple[int, int, int, int, int]

   Return a 5-tuple ``(cx, cy, a, b, rotation)`` describing the ellipse
   inscribed in the minimum-area rotated rectangle around ``blob``:

      * ``cx`` / ``cy`` -- ellipse centre in pixels (integer).
      * ``a`` / ``b`` -- semi-axis lengths in pixels (integer).
      * ``rotation`` -- ellipse rotation **in degrees** (integer).

   This is a plain tuple, not an attrtuple, so the fields are accessible
   only by index.

Constants
---------

Pixel formats
~~~~~~~~~~~~~

Pass any of the following as the ``pixformat`` argument to the
:class:`Image` constructor or to :meth:`csi.CSI.pixformat`.

.. data:: BINARY
   :type: int

   1-bit-per-pixel bitmap. Smallest format -- used internally by
   thresholding and morphology, rarely captured directly from a sensor.

.. data:: GRAYSCALE
   :type: int

   8-bit-per-pixel grayscale (one byte per pixel). The fastest format
   for most computer-vision algorithms (AprilTag, edge detection,
   optical flow).

.. data:: RGB565
   :type: int

   16-bit-per-pixel colour packed as 5 bits red / 6 bits green / 5 bits
   blue. The default colour format.

.. data:: BAYER
   :type: int

   8-bit-per-pixel raw Bayer data straight off the sensor. Most image
   processing methods are not available on Bayer images; use this when
   you want to debayer on demand or store more pixels in less memory.

.. data:: YUV422
   :type: int

   4:2:2 chroma-subsampled colour, two bytes per pixel, packed as
   ``Y1, U, Y2, V`` per pixel pair. Only some image processing methods
   work directly on YUV422.

.. data:: JPEG
   :type: int

   Compressed JPEG buffer. Pixel-level operations require
   :meth:`Image.to_grayscale` or :meth:`Image.to_rgb565` first.

.. data:: PNG
   :type: int

   Compressed PNG buffer. Pixel-level operations require
   :meth:`Image.to_grayscale` or :meth:`Image.to_rgb565` first.

Colour palettes
~~~~~~~~~~~~~~~

Pass any of the following to :meth:`Image.to_rainbow`,
:meth:`Image.to_ironbow`, :meth:`Image.draw_image` (``color_palette=``)
or to :meth:`csi.CSI.color_palette` to colorize a grayscale image.

.. data:: PALETTE_RAINBOW
   :type: int

   Smooth rainbow colour wheel. The default OpenMV palette for thermal
   imagery.

.. data:: PALETTE_IRONBOW
   :type: int

   Non-linear "ironbow" palette that mimics the look of the FLIR Lepton
   thermal viewfinder.

.. data:: PALETTE_DEPTH
   :type: int

   Depth-image palette. Only available on builds with depth-sensor
   support (the ToF pipeline -- e.g. OpenMV Cam AE3 or any cam with a
   ToF Pmod attached).

.. data:: PALETTE_EVT_DARK
   :type: int

   Palette for visualising GENX320 event-camera frames on a dark
   background. Pass to `csi.CSI.color_palette` to have the GENX320
   driver emit colorized RGB565 frames in histogram mode, or to
   :meth:`Image.draw_image` ``color_palette=`` when colorising a
   grayscale event image.

   Only available on builds with GENX320 support (OpenMV Cam AE3 and
   the GENX320 Pmod).

.. data:: PALETTE_EVT_LIGHT
   :type: int

   Palette for visualising GENX320 event-camera frames on a light
   background. Same dispatch and availability as
   :data:`PALETTE_EVT_DARK`.

Scaling modes
~~~~~~~~~~~~~

Pass any of the following as the ``hint`` argument to
:meth:`Image.draw_image`, :meth:`Image.scale`, or similar scaling
methods.

.. data:: AREA
   :type: int

   Area-averaging scaler. Used when downscaling; Nearest-Neighbor is
   used for upscaling.

.. data:: BILINEAR
   :type: int

   Bilinear scaler. Subsamples when downscaling.

.. data:: BICUBIC
   :type: int

   Bicubic scaler. Higher quality than :data:`BILINEAR` but slower.
   Subsamples when downscaling.

Drawing / draw_image hints
~~~~~~~~~~~~~~~~~~~~~~~~~~

Bit-OR any of these together and pass as the ``hint`` argument of
:meth:`Image.draw_image`.

.. data:: VFLIP
   :type: int

   Vertically flip the source while drawing.

.. data:: HMIRROR
   :type: int

   Horizontally mirror the source while drawing.

.. data:: TRANSPOSE
   :type: int

   Transpose (swap x/y) the source while drawing.

.. data:: CENTER
   :type: int

   Centre the source on the destination. Any explicit x/y offsets then
   become offsets from the centre instead of from the top-left.

.. data:: EXTRACT_RGB_CHANNEL_FIRST
   :type: int

   When extracting an RGB channel via :meth:`Image.draw_image`, extract
   the channel **before** scaling. Without this hint, the channel is
   extracted after scaling.

.. data:: APPLY_COLOR_PALETTE_FIRST
   :type: int

   When applying a colour palette via :meth:`Image.draw_image`, apply
   the palette **before** scaling. Without this hint, the palette is
   applied after scaling.

.. data:: SCALE_ASPECT_KEEP
   :type: int

   Scale the source to fit inside the destination while maintaining
   aspect ratio (letterboxes when ratios differ).

.. data:: SCALE_ASPECT_EXPAND
   :type: int

   Scale the source to fill the destination while maintaining aspect
   ratio (crops when ratios differ).

.. data:: SCALE_ASPECT_IGNORE
   :type: int

   Scale the source to fill the destination, ignoring aspect ratio.

.. data:: BLACK_BACKGROUND
   :type: int

   Tell the alpha-blending path that the destination is known-black so
   it can skip the read-back of the destination pixel. Speeds up alpha
   effects on freshly-cleared buffers.

.. data:: ROTATE_90
   :type: int

   Shortcut for ``VFLIP | TRANSPOSE`` (rotate 90 degrees clockwise).

.. data:: ROTATE_180
   :type: int

   Shortcut for ``HMIRROR | VFLIP`` (rotate 180 degrees).

.. data:: ROTATE_270
   :type: int

   Shortcut for ``HMIRROR | TRANSPOSE`` (rotate 270 degrees clockwise).

JPEG subsampling
~~~~~~~~~~~~~~~~

Pass any of the following as the ``subsampling`` argument to
:meth:`Image.to_jpeg`, :meth:`Image.compress`, or :meth:`Image.save`
when writing a JPEG.

.. data:: JPEG_SUBSAMPLING_AUTO
   :type: int

   Pick chroma subsampling automatically based on the JPEG quality
   setting.

.. data:: JPEG_SUBSAMPLING_444
   :type: int

   Force 4:4:4 chroma subsampling (no chroma compression).

.. data:: JPEG_SUBSAMPLING_422
   :type: int

   Force 4:2:2 chroma subsampling. Recommended when streaming MJPEG to
   third-party video players that misbehave with 4:2:0.

.. data:: JPEG_SUBSAMPLING_420
   :type: int

   Force 4:2:0 chroma subsampling.

Template matching
~~~~~~~~~~~~~~~~~

Pass either of the following as the ``search`` argument to
:meth:`Image.find_template`.

.. data:: SEARCH_EX
   :type: int

   Exhaustive search -- evaluates every position in the ROI. Slowest
   but guaranteed to find the best match.

.. data:: SEARCH_DS
   :type: int

   Diamond search -- coarse-to-fine search that is much faster than
   :data:`SEARCH_EX` but may miss the global optimum on highly
   self-similar templates.

Edge detection
~~~~~~~~~~~~~~

Pass either of the following as the ``algorithm`` argument to
:meth:`Image.find_edges`.

.. data:: EDGE_CANNY
   :type: int

   Canny edge detector -- gradient magnitude + non-max suppression +
   hysteresis. Higher quality, slower.

.. data:: EDGE_SIMPLE
   :type: int

   Thresholded high-pass-filter edge detector. Faster but produces
   thicker, noisier edges than :data:`EDGE_CANNY`.

ORB corner detectors
~~~~~~~~~~~~~~~~~~~~

Pass either of the following as the ``corner_detector`` argument to
:meth:`Image.find_keypoints`.

.. data:: CORNER_FAST
   :type: int

   FAST corner detector. Faster than :data:`CORNER_AGAST` but less
   accurate.

.. data:: CORNER_AGAST
   :type: int

   AGAST corner detector. Slower than :data:`CORNER_FAST` but produces
   more stable keypoints.

AprilTag families
~~~~~~~~~~~~~~~~~

Bit-OR any combination of the following and pass as the ``families``
argument to :meth:`Image.find_apriltags`. Each family is gated by its
own build option in firmware; unsupported families are absent at
runtime rather than always-zero.

.. data:: TAG16H5
   :type: int

   AprilTag ``16h5`` family (30 unique IDs, 0-bit error correction).

.. data:: TAG25H9
   :type: int

   AprilTag ``25h9`` family (35 unique IDs, up to 3-bit error
   correction).

.. data:: TAG36H10
   :type: int

   AprilTag ``36h10`` family (2320 unique IDs, up to 3-bit error
   correction).

.. data:: TAG36H11
   :type: int

   AprilTag ``36h11`` family (587 unique IDs, up to 4-bit error
   correction). The most common family.

.. data:: TAGCIRCLE21H7
   :type: int

   AprilTag ``Circle21h7`` family.

.. data:: TAGCIRCLE49H12
   :type: int

   AprilTag ``Circle49h12`` family.

.. data:: TAGCUSTOM48H12
   :type: int

   AprilTag ``Custom48h12`` family.

.. data:: TAGSTANDARD41H12
   :type: int

   AprilTag ``Standard41h12`` family.

.. data:: TAGSTANDARD52H13
   :type: int

   AprilTag ``Standard52h13`` family.

Barcode symbologies
~~~~~~~~~~~~~~~~~~~

The values reported in :attr:`BarCode.type <barcode.type>` for entries
returned by :meth:`Image.find_barcodes`.

.. data:: EAN2
   :type: int

   EAN-2 supplemental barcode.

.. data:: EAN5
   :type: int

   EAN-5 supplemental barcode.

.. data:: EAN8
   :type: int

   EAN-8 barcode.

.. data:: UPCE
   :type: int

   UPC-E barcode.

.. data:: ISBN10
   :type: int

   ISBN-10 barcode.

.. data:: UPCA
   :type: int

   UPC-A barcode.

.. data:: EAN13
   :type: int

   EAN-13 barcode.

.. data:: ISBN13
   :type: int

   ISBN-13 barcode.

.. data:: I25
   :type: int

   Interleaved 2-of-5 barcode.

.. data:: DATABAR
   :type: int

   GS1 DataBar barcode.

.. data:: DATABAR_EXP
   :type: int

   GS1 DataBar Expanded barcode.

.. data:: CODABAR
   :type: int

   Codabar barcode.

.. data:: CODE39
   :type: int

   Code 39 barcode.

.. data:: PDF417
   :type: int

   PDF417 2D stacked barcode. The constant exists for completeness,
   but the barcode decoder does not currently implement PDF417 --
   `Image.find_barcodes()` will not return detections of this type.

.. data:: CODE93
   :type: int

   Code 93 barcode.

.. data:: CODE128
   :type: int

   Code 128 barcode.
