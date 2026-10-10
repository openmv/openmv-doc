.. currentmodule:: image

class kptmatch -- Keypoint match object
=======================================

The kptmatch object is an `attrtuple <https://docs.micropython.org/en/latest/library/collections.html#collections.namedtuple>`_
returned by `image.match_descriptor()` when matching two ORB keypoint
descriptors. It describes the cluster of matched keypoints between the two
descriptors: its bounding box, centroid, the number of matched keypoints,
an estimated in-image-plane rotation, and the per-keypoint ``(x, y)`` list
of matches.

Fields are accessible by attribute name (``match.count``) or by index
(``match[0]``). The object has no public constructor.

.. class:: kptmatch

   Please call `image.match_descriptor()` to create this object.

   Bounding box and centroid
   -------------------------

   .. attribute:: x

      Bounding box top-left x coordinate of the matched keypoints, in
      pixels. Integer. Index ``[0]``.

   .. attribute:: y

      Bounding box top-left y coordinate of the matched keypoints, in
      pixels. Integer. Index ``[1]``.

   .. attribute:: w

      Bounding box width of the matched keypoints, in pixels. Integer.
      Index ``[2]``.

   .. attribute:: h

      Bounding box height of the matched keypoints, in pixels. Integer.
      Index ``[3]``.

   .. attribute:: cx

      Centroid x coordinate of the matched keypoints. Integer.
      Index ``[4]``.

   .. attribute:: cy

      Centroid y coordinate of the matched keypoints. Integer.
      Index ``[5]``.

   .. attribute:: rect

      ``(x, y, w, h)`` 4-tuple of the bounding box. Suitable for passing
      directly to drawing/cropping methods such as `Image.draw_rectangle()`
      or `Image.crop()`. Index ``[9]``.

   Match details
   -------------

   .. attribute:: count

      Number of keypoints that matched between the two descriptors. Use
      this as a confidence score -- typical thresholds for a "real"
      match are 10+ keypoints. Integer. Index ``[6]``.

   .. attribute:: theta

      Estimated in-image-plane rotation between the two descriptors, in
      degrees. Integer. Index ``[7]``.

   .. attribute:: match

      List of ``(x, y)`` integer tuples giving the pixel location of each
      matched keypoint in the search image. ``len(match) == count``.
      Index ``[8]``.
