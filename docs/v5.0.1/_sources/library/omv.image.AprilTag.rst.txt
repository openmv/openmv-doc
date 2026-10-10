.. currentmodule:: image

class AprilTag -- AprilTag object
=================================

The apriltag object is an `attrtuple <https://docs.micropython.org/en/latest/library/collections.html#collections.namedtuple>`_
returned by `Image.find_apriltags()`. Each instance describes a decoded
AprilTag: its bounding box, sub-pixel centroid, family/id, decoder quality
metrics, the four detected corners, and -- when intrinsics are supplied to
`Image.find_apriltags()` -- a 6-DoF pose estimate in the camera frame.

Fields are accessible by attribute name (``tag.id``) or by index
(``tag[0]``). The object has no public constructor.

.. class:: apriltag

   Please call `Image.find_apriltags()` to create this object.

   Bounding box and corners
   ------------------------

   .. attribute:: x

      Bounding box top-left x coordinate, in pixels. Integer. Index ``[0]``.

   .. attribute:: y

      Bounding box top-left y coordinate, in pixels. Integer. Index ``[1]``.

   .. attribute:: w

      Bounding box width, in pixels. Integer. Index ``[2]``.

   .. attribute:: h

      Bounding box height, in pixels. Integer. Index ``[3]``.

   .. attribute:: cx

      Centroid x coordinate, rounded to int. Integer. Index ``[4]``.

   .. attribute:: cy

      Centroid y coordinate, rounded to int. Integer. Index ``[5]``.

   .. attribute:: cxf

      Centroid x coordinate as a sub-pixel float. Index ``[9]``.

   .. attribute:: cyf

      Centroid y coordinate as a sub-pixel float. Index ``[10]``.

   .. attribute:: corners

      4-tuple of ``(x, y)`` integer tuples for the four detected corners
      of the tag, sorted clockwise starting from the top-left corner.
      Index ``[21]``.

   .. attribute:: area

      Area of the bounding box (``w * h``). Integer. Index ``[22]``.

   .. attribute:: rect

      ``(x, y, w, h)`` 4-tuple of the bounding box. Suitable for passing
      directly to drawing/cropping methods such as `Image.draw_rectangle()`
      or `Image.crop()`. Index ``[23]``.

   Identification
   --------------

   .. attribute:: id

      Numeric id of the tag within its family. The valid range depends on
      the family (e.g. 0 -- 586 for ``TAG36H11``). Integer. Index ``[6]``.

   .. attribute:: family

      Numeric family identifier, one of:

         * `image.TAG16H5`
         * `image.TAG25H9`
         * `image.TAG36H10`
         * `image.TAG36H11`
         * `image.TAGCIRCLE21H7`
         * `image.TAGCIRCLE49H12`
         * `image.TAGCUSTOM48H12`
         * `image.TAGSTANDARD41H12`
         * `image.TAGSTANDARD52H13`

      Integer. Index ``[7]``.

   .. attribute:: name

      Family name as a string, e.g. ``"TAG36H11"``. Index ``[8]``.

   Match quality
   -------------

   .. attribute:: decision_margin

      Quality of the tag match in the range 0.0 -- 1.0 where 1.0 is the
      best. Use this to reject low-confidence detections. Float.
      Index ``[12]``.

   .. attribute:: hamming

      Number of bit errors the decoder accepted for this tag. Bounded by
      the family's correction capability:

         * ``TAG16H5`` -> up to 0 bit errors
         * ``TAG25H9`` -> up to 3 bit errors
         * ``TAG36H10`` -> up to 3 bit errors
         * ``TAG36H11`` -> up to 4 bit errors

      Lower is better. Integer. Index ``[13]``.

   .. attribute:: goodness

      Image quality of the tag in the range 0.0 -- 1.0 where 1.0 is the
      best. Currently always 0.0 in the released firmware (the underlying
      decoder no longer computes this metric). Float. Index ``[14]``.

   Pose estimate
   -------------

   The translation and rotation fields below are populated only when
   `Image.find_apriltags()` is called with the ``fx``, ``fy``, ``cx``, and
   ``cy`` camera intrinsics. Without intrinsics they are 0.0. The tag is
   assumed to be 1 unit wide, so translations are in "tag widths" -- scale
   by the real-world tag size to get metric distances.

   .. attribute:: x_translation

      X translation from the camera (left-right) in tag widths. Float.
      Index ``[15]``.

   .. attribute:: y_translation

      Y translation from the camera (up-down) in tag widths. Float.
      Index ``[16]``.

   .. attribute:: z_translation

      Z translation from the camera (forward-back) in tag widths. Float.
      Index ``[17]``.

   .. attribute:: x_rotation

      Rotation about the X axis (pitch) in radians. Float. Index ``[18]``.

   .. attribute:: y_rotation

      Rotation about the Y axis (yaw) in radians. Float. Index ``[19]``.

   .. attribute:: z_rotation

      Rotation about the Z axis (roll) in radians. Same value as
      ``rotation`` -- duplicated for symmetry with ``x_rotation`` and
      ``y_rotation``. Float. Index ``[20]``.

   .. attribute:: rotation

      In-image-plane rotation of the tag in radians. Equal to
      ``z_rotation``. Float. Index ``[11]``.
