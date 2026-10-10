.. currentmodule:: image

class Blob -- Blob object
=========================

The blob object is an `attrtuple <https://docs.micropython.org/en/latest/library/collections.html#collections.namedtuple>`_
returned by `Image.find_blobs()`. Each blob represents a connected region of
pixels that matched one or more of the color thresholds passed to
``find_blobs()``. The object packs together the blob's bounding box, centroid,
pixel count, perimeter, orientation, area-density metrics, the set of
thresholds that hit it, the rotated min-area rectangle, and optional X/Y
projection histograms.

Fields are accessible by attribute name (``blob.x``) or by index
(``blob[0]``). The object has no public constructor.

.. class:: blob

   Please call `Image.find_blobs()` to create this object.

   Bounding box and centroid
   -------------------------

   .. attribute:: x

      Bounding box top-left x coordinate, in pixels. Integer. Index ``[0]``.

   .. attribute:: y

      Bounding box top-left y coordinate, in pixels. Integer. Index ``[1]``.

   .. attribute:: w

      Bounding box width, in pixels. Integer. Index ``[2]``.

   .. attribute:: h

      Bounding box height, in pixels. Integer. Index ``[3]``.

   .. attribute:: cx

      Centroid x coordinate (pixel-mean of the blob), rounded to int.
      Integer. Index ``[4]``.

   .. attribute:: cy

      Centroid y coordinate (pixel-mean of the blob), rounded to int.
      Integer. Index ``[5]``.

   .. attribute:: cxf

      Centroid x coordinate as a sub-pixel float. Index ``[16]``.

   .. attribute:: cyf

      Centroid y coordinate as a sub-pixel float. Index ``[17]``.

   .. attribute:: rect

      ``(x, y, w, h)`` 4-tuple of the bounding box. Suitable for passing
      directly to drawing/cropping methods such as `Image.draw_rectangle()`
      or `Image.crop()`. Index ``[22]``.

   Shape descriptors
   -----------------

   .. attribute:: pixels

      Number of pixels that make up this blob. Integer. Index ``[6]``.

   .. attribute:: area

      Area of the axis-aligned bounding box (``w * h``). Integer.
      Index ``[19]``.

   .. attribute:: density

      ``pixels / area`` -- the fraction of the bounding box filled by the
      blob. Float in the range 0.0 -- 1.0. A solid rectangle approaches
      ``1.0``; a thin diagonal line approaches ``0.0``. Index ``[20]``.

   .. attribute:: perimeter

      Number of pixels on the blob's outer perimeter. Integer.
      Index ``[10]``.

   .. attribute:: roundness

      Ratio of the minor axis to the major axis of the blob, computed from
      its second-order moments. Float in the range 0.0 -- 1.0; ``1.0`` is a
      perfect circle, ``0.0`` is a line. Index ``[11]``.

   .. attribute:: elongation

      ``1.0 - roundness`` -- a value in the range 0.0 -- 1.0 where ``0.0``
      is a perfect circle and ``1.0`` is a line. Index ``[18]``.

   .. attribute:: compactness

      ``(pixels * 4 * pi) / (perimeter * perimeter)``. A circle has the
      smallest perimeter for a given area, so this metric is ``1.0`` for a
      perfect circle and drops as the blob becomes more irregular or
      elongated. Float. Index ``[21]``.

   .. attribute:: rotation

      Orientation of the blob in radians, derived from its second-order
      moments. Float in the range 0 to pi (the axis is symmetric so the
      direction is ambiguous past pi). Most accurate for elongated blobs --
      for nearly-round blobs the value becomes noisy. Index ``[7]``.

   Threshold / merge metadata
   --------------------------

   .. attribute:: code

      32-bit bitmap with one bit set for each color threshold (as passed to
      `Image.find_blobs()`) that this blob matched. With one threshold,
      ``code == 1``. With merged multi-color blobs (``merge=True``) more
      than one bit may be set. Index ``[8]``.

   .. attribute:: count

      Number of source blobs merged into this one. ``1`` when
      ``merge=False``; can be larger when ``merge=True``. Index ``[9]``.

   Corners
   -------

   .. attribute:: corners

      4-tuple of ``(x, y)`` integer tuples for the four extreme corners of
      the blob, sorted clockwise starting from the top-left corner. These
      are the *contour-derived* corners (the points on the blob boundary
      farthest from the centroid along four diagonals). Index ``[14]``.

   .. attribute:: min_corners

      4-tuple of ``(x, y)`` integer tuples for the four corners of the
      blob's minimum-area rotated bounding rectangle. Combined with
      ``rotation`` these give you the tightest fit around the blob.
      Index ``[15]``.

   Projection histograms
   ---------------------

   .. attribute:: x_hist_bins

      List of integer counts for the blob's X-axis (column) projection
      histogram. Only populated when ``find_blobs(...)`` is called with
      ``x_hist_bins_max`` > 0; otherwise empty. Index ``[12]``.

   .. attribute:: y_hist_bins

      List of integer counts for the blob's Y-axis (row) projection
      histogram. Only populated when ``find_blobs(...)`` is called with
      ``y_hist_bins_max`` > 0; otherwise empty. Index ``[13]``.
