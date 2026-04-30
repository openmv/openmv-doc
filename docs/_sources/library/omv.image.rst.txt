:mod:`image` --- machine vision
===============================

.. module:: image
   :synopsis: machine vision

The ``image`` module is used for machine vision.

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

.. function:: binary_to_grayscale(value: int) -> int

   Convert a binary value (0-1) to a grayscale value (0-255).

.. function:: binary_to_rgb(value: int) -> Tuple[int, int, int]

   Convert a binary value (0-1) to a 3-value RGB888 tuple.

.. function:: binary_to_lab(value: int) -> Tuple[int, int, int]

   Convert a binary value (0-1) to a 3-value LAB tuple. L is 0-100; A/B are -128 to 127.

.. function:: binary_to_yuv(value: int) -> Tuple[int, int, int]

   Convert a binary value (0-1) to a 3-value YUV tuple. Y is 0-255; U/V are -128 to 127.

.. function:: grayscale_to_binary(value: int) -> int

   Convert a grayscale value (0-255) to a binary value (0-1).

.. function:: grayscale_to_rgb(value: int) -> Tuple[int, int, int]

   Convert a grayscale value (0-255) to a 3-value RGB888 tuple.

.. function:: grayscale_to_lab(value: int) -> Tuple[int, int, int]

   Convert a grayscale value (0-255) to a 3-value LAB tuple. L is 0-100; A/B are -128 to 127.

.. function:: grayscale_to_yuv(value: int) -> Tuple[int, int, int]

   Convert a grayscale value (0-255) to a 3-value YUV tuple. Y is 0-255; U/V are -128 to 127.

.. function:: rgb_to_binary(value: Tuple[int, int, int]) -> int

   Convert a 3-value RGB888 tuple to a binary value (0-1).

.. function:: rgb_to_grayscale(value: Tuple[int, int, int]) -> int

   Convert a 3-value RGB888 tuple to a grayscale value (0-255).

.. function:: rgb_to_lab(value: Tuple[int, int, int]) -> Tuple[int, int, int]

   Convert a 3-value RGB888 tuple to a 3-value LAB tuple. L is 0-100; A/B are -128 to 127.

.. function:: rgb_to_yuv(value: Tuple[int, int, int]) -> Tuple[int, int, int]

   Convert a 3-value RGB888 tuple to a 3-value YUV tuple. Y is 0-255; U/V are -128 to 127.

.. function:: lab_to_binary(value: Tuple[int, int, int]) -> int

   Convert a 3-value LAB tuple to a binary value (0-1).

.. function:: lab_to_grayscale(value: Tuple[int, int, int]) -> int

   Convert a 3-value LAB tuple to a grayscale value (0-255).

.. function:: lab_to_rgb(value: Tuple[int, int, int]) -> Tuple[int, int, int]

   Convert a 3-value LAB tuple to a 3-value RGB888 tuple.

.. function:: lab_to_yuv(value: Tuple[int, int, int]) -> Tuple[int, int, int]

   Convert a 3-value LAB tuple to a 3-value YUV tuple. Y is 0-255; U/V are -128 to 127.

.. function:: yuv_to_binary(value: Tuple[int, int, int]) -> int

   Convert a 3-value YUV tuple to a binary value (0-1).

.. function:: yuv_to_grayscale(value: Tuple[int, int, int]) -> int

   Convert a 3-value YUV tuple to a grayscale value (0-255).

.. function:: yuv_to_rgb(value: Tuple[int, int, int]) -> Tuple[int, int, int]

   Convert a 3-value YUV tuple to a 3-value RGB888 tuple.

.. function:: yuv_to_lab(value: Tuple[int, int, int]) -> Tuple[int, int, int]

   Convert a 3-value YUV tuple to a 3-value LAB tuple. L is 0-100; A/B are -128 to 127.

.. function:: HaarCascade(path: str, stages: int = -1) -> Cascade

   Load a Haar Cascade from a binary file at ``path`` and return a cascade object usable
   with `Image.find_features()`. Pass ``"frontalface"`` or ``"eye"`` to load a built-in
   cascade.

   ``stages`` selects how many cascade stages to evaluate. ``-1`` uses all stages in the
   file. Lowering this value speeds up detection at the cost of more false positives.

.. function:: load_descriptor(path: str) -> Any

   Load a descriptor object (``lbp_desc`` or ``kp_desc``) from the file at ``path`` and
   return it.

.. function:: save_descriptor(descriptor: Any, path: str) -> None

   Save the ``descriptor`` object (``lbp_desc`` or ``kp_desc``) to the file at ``path``.

.. function:: match_descriptor(descriptor0: Any, descriptor1: Any, threshold: int = 85, filter_outliers: bool = False) -> int | kptmatch

   Match two descriptors of the same type.

   For LBP descriptors returns an integer distance between the two descriptors (lower is
   a closer match).

   For ORB descriptors returns a `kptmatch` object.

   ``threshold`` (0-100) is used by ORB matching to filter ambiguous matches. Lower values
   tighten matching.

   ``filter_outliers`` enables outlier filtering for ORB matches.

.. function:: get_solidity(blob: blob) -> float

   Return the solidity (blob area divided by convex-hull area) of ``blob``.

.. function:: get_convexity(blob: blob) -> float

   Return the convexity (convex-hull perimeter divided by blob perimeter) of ``blob``.

.. function:: get_major_axis_line(blob: blob) -> line

   Return a `line` object along the major axis of ``blob``.

.. function:: get_minor_axis_line(blob: blob) -> line

   Return a `line` object along the minor axis of ``blob``.

.. function:: get_enclosing_circle(blob: blob) -> circle

   Return a `circle` object that encloses ``blob``.

.. function:: get_enclosed_ellipse(blob: blob) -> ellipse

   Return an ellipse attribute tuple ``(x, y, rx, ry, rotation)`` enclosed by ``blob``.

Constants
---------

.. data:: BINARY
   :type: int

   BINARY (bitmap) pixel format. Each pixel is 1-bit.

.. data:: GRAYSCALE
   :type: int

   GRAYSCALE pixel format. Each pixel is 8-bits, 1-byte.

.. data:: RGB565
   :type: int

   RGB565 pixel format. Each pixel is 16-bits, 2-bytes. 5-bits are used for red,
   6-bits are used for green, and 5-bits are used for blue.

.. data:: BAYER
   :type: int

   Raw Bayer pixel format. Most image processing methods are not available on Bayer images.

.. data:: YUV422
   :type: int

   YUV422 pixel format. Each pixel pair is stored as ``Y1, U, Y2, V`` (4 bytes for
   2 pixels). Only some image processing methods work with YUV422.

.. data:: JPEG
   :type: int

   A JPEG image.

.. data:: PNG
   :type: int

   A PNG image.

.. data:: PALETTE_RAINBOW
   :type: int

   Default OpenMV Cam color palette for thermal images using a smooth color wheel.

.. data:: PALETTE_IRONBOW
   :type: int

   Makes images look like the FLIR Lepton thermal images using a very non-linear color palette.

.. data:: PALETTE_DEPTH
   :type: int

   Depth color palette for depth images.

.. data:: PALETTE_EVT_DARK
   :type: int

   Dark background color palette for event images.

.. data:: PALETTE_EVT_LIGHT
   :type: int

   Light background color palette for event images.

.. data:: AREA
   :type: int

   Use area scaling when downscaling an image (Nearest Neighbor is used for upscaling).

.. data:: BILINEAR
   :type: int

   Use bilinear scaling. Subsamples when downscaling.

.. data:: BICUBIC
   :type: int

   Use bicubic scaling. Higher quality than bilinear but slower. Subsamples when downscaling.

.. data:: VFLIP
   :type: int

   Vertically flip the image being drawn.

.. data:: HMIRROR
   :type: int

   Horizontally mirror the image being drawn.

.. data:: TRANSPOSE
   :type: int

   Transpose (swap x/y) the image being drawn.

.. data:: CENTER
   :type: int

   Center the drawn image on the destination. Any x/y offsets become offsets from center.

.. data:: EXTRACT_RGB_CHANNEL_FIRST
   :type: int

   When extracting an RGB channel via `Image.draw_image()`, extract the channel before
   scaling instead of after.

.. data:: APPLY_COLOR_PALETTE_FIRST
   :type: int

   When applying a color palette via `Image.draw_image()`, apply the palette before scaling
   instead of after.

.. data:: SCALE_ASPECT_KEEP
   :type: int

   Scale the drawn image to fit inside the destination while maintaining aspect ratio.

.. data:: SCALE_ASPECT_EXPAND
   :type: int

   Scale the drawn image to fill the destination while maintaining aspect ratio (may crop).

.. data:: SCALE_ASPECT_IGNORE
   :type: int

   Scale the drawn image to fill the destination, ignoring aspect ratio.

.. data:: BLACK_BACKGROUND
   :type: int

   Skip reading the destination pixel when drawing on a known-black destination. Speeds up
   alpha effects.

.. data:: ROTATE_90
   :type: int

   Rotate the drawn image 90 degrees (equivalent to ``VFLIP | TRANSPOSE``).

.. data:: ROTATE_180
   :type: int

   Rotate the drawn image 180 degrees (equivalent to ``HMIRROR | VFLIP``).

.. data:: ROTATE_270
   :type: int

   Rotate the drawn image 270 degrees (equivalent to ``HMIRROR | TRANSPOSE``).

.. data:: JPEG_SUBSAMPLING_AUTO
   :type: int

   Automatically select JPEG chroma subsampling based on image quality.

.. data:: JPEG_SUBSAMPLING_444
   :type: int

   Force 4:4:4 JPEG chroma subsampling.

.. data:: JPEG_SUBSAMPLING_422
   :type: int

   Force 4:2:2 JPEG chroma subsampling. Recommended when streaming MJPEG to third-party
   video players.

.. data:: JPEG_SUBSAMPLING_420
   :type: int

   Force 4:2:0 JPEG chroma subsampling.

.. data:: SEARCH_EX
   :type: int

   Exhaustive template matching search.

.. data:: SEARCH_DS
   :type: int

   Diamond-search (faster) template matching.

.. data:: EDGE_CANNY
   :type: int

   Canny edge detection algorithm. See `Image.find_edges()`.

.. data:: EDGE_SIMPLE
   :type: int

   Thresholded high-pass-filter edge detection. See `Image.find_edges()`.

.. data:: CORNER_FAST
   :type: int

   Faster, less accurate ORB corner detector.

.. data:: CORNER_AGAST
   :type: int

   Slower, more accurate ORB corner detector.

.. data:: TAG16H5
   :type: int

   AprilTag family. See `Image.find_apriltags()`.

.. data:: TAG25H9
   :type: int

   AprilTag family. See `Image.find_apriltags()`.

.. data:: TAG36H10
   :type: int

   AprilTag family. See `Image.find_apriltags()`.

.. data:: TAG36H11
   :type: int

   AprilTag family. See `Image.find_apriltags()`.

.. data:: TAGCIRCLE21H7
   :type: int

   AprilTag family. See `Image.find_apriltags()`.

.. data:: TAGCIRCLE49H12
   :type: int

   AprilTag family. See `Image.find_apriltags()`.

.. data:: TAGCUSTOM48H12
   :type: int

   AprilTag family. See `Image.find_apriltags()`.

.. data:: TAGSTANDARD41H12
   :type: int

   AprilTag family. See `Image.find_apriltags()`.

.. data:: TAGSTANDARD52H13
   :type: int

   AprilTag family. See `Image.find_apriltags()`.

.. data:: EAN2
   :type: int

   EAN2 barcode type.

.. data:: EAN5
   :type: int

   EAN5 barcode type.

.. data:: EAN8
   :type: int

   EAN8 barcode type.

.. data:: UPCE
   :type: int

   UPCE barcode type.

.. data:: ISBN10
   :type: int

   ISBN10 barcode type.

.. data:: UPCA
   :type: int

   UPCA barcode type.

.. data:: EAN13
   :type: int

   EAN13 barcode type.

.. data:: ISBN13
   :type: int

   ISBN13 barcode type.

.. data:: I25
   :type: int

   Interleaved 2 of 5 barcode type.

.. data:: DATABAR
   :type: int

   GS1 DataBar barcode type.

.. data:: DATABAR_EXP
   :type: int

   GS1 DataBar Expanded barcode type.

.. data:: CODABAR
   :type: int

   Codabar barcode type.

.. data:: CODE39
   :type: int

   Code 39 barcode type.

.. data:: PDF417
   :type: int

   PDF417 barcode type.

.. data:: CODE93
   :type: int

   Code 93 barcode type.

.. data:: CODE128
   :type: int

   Code 128 barcode type.
