Image Processing
================

Every page until now has handled pixel data only long
enough to get it: capture a frame, configure a sensor,
move bytes from the camera into RAM. *Image processing*
turns the direction around -- the pixels are the input,
and the goal is whatever the application needs from them.

The :mod:`image` module is the toolkit. Every operation
takes one or two :class:`Image` objects and returns
either a transformed :class:`Image` -- pixels filtered,
thresholded, warped, or composited differently -- or a
list of result objects: blobs, lines, codes, matches,
statistics. The two flavours compose. A typical pipeline
cleans up the captured frame, extracts a set of result
objects from it, turns those into measurements, and
draws annotations back onto the frame for display.

.. toctree::
   :caption: Foundations
   :maxdepth: 1

   foundations/what-is-an-image.rst
   foundations/coordinates.rst
   foundations/pixel-formats.rst
   foundations/pixel-access.rst
   foundations/regions-and-masks.rst

.. toctree::
   :caption: Drawing
   :maxdepth: 1

   drawing/shapes-and-text.rst
   drawing/image-composition.rst
   drawing/flood-fill-and-detection-glyphs.rst

.. toctree::
   :caption: Pixel math
   :maxdepth: 1

   pixel-math/arithmetic.rst
   pixel-math/bitwise.rst
   pixel-math/frame-differencing.rst

.. toctree::
   :caption: Thresholding
   :maxdepth: 1

   thresholding/binary-method.rst

.. toctree::
   :caption: Filters and morphology
   :maxdepth: 1

   filters/linear-neighborhood.rst
   filters/gaussian-and-edges.rst
   filters/morphology.rst
   filters/custom-kernels.rst
   filters/standard-kernels.rst

.. toctree::
   :caption: Tonal and statistical analysis
   :maxdepth: 1

   analysis/histograms-and-statistics.rst
   analysis/tonal-corrections.rst
   analysis/regression-and-similarity.rst

.. toctree::
   :caption: Geometric transforms
   :maxdepth: 1

   transforms/scale-flip-crop.rst
   transforms/lens-and-perspective.rst
   transforms/perspective-correction.rst
   transforms/polar.rst

.. toctree::
   :caption: Finding shapes
   :maxdepth: 1

   finding/blobs.rst
   finding/lines-and-segments.rst
   finding/circles-and-rectangles.rst

.. toctree::
   :caption: Decoding 1D and 2D codes
   :maxdepth: 1

   decoding/qr-apriltag.rst
   decoding/barcodes-and-datamatrix.rst

.. toctree::
   :caption: Matching and similarity
   :maxdepth: 1

   matching/template-and-similarity.rst
   matching/displacement-and-keypoints.rst

.. toctree::
   :caption: Image I/O
   :maxdepth: 1

   io/saving-and-compression.rst
   io/imageio-streams.rst

.. toctree::
   :caption: Wrap up
   :maxdepth: 1

   wrap-up.rst
