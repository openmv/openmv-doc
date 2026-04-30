.. currentmodule:: image

class AprilTag -- AprilTag object
=================================

The apriltag object is returned by `Image.find_apriltags()`. It is an
attrtuple with 24 fields.

.. class:: apriltag

   Please call `Image.find_apriltags()` to create this object. It has no public
   constructor.

   .. method:: x() -> int

      Returns the apriltag's bounding box x coordinate (int).

      You may also get this value doing ``[0]`` on the object.

   .. method:: y() -> int

      Returns the apriltag's bounding box y coordinate (int).

      You may also get this value doing ``[1]`` on the object.

   .. method:: w() -> int

      Returns the apriltag's bounding box w coordinate (int).

      You may also get this value doing ``[2]`` on the object.

   .. method:: h() -> int

      Returns the apriltag's bounding box h coordinate (int).

      You may also get this value doing ``[3]`` on the object.

   .. method:: cx() -> int

      Returns the centroid x position of the apriltag (int).

      You may also get this value doing ``[4]`` on the object.

   .. method:: cy() -> int

      Returns the centroid y position of the apriltag (int).

      You may also get this value doing ``[5]`` on the object.

   .. method:: id() -> int

      Returns the numeric id of the apriltag. The id range depends on the family.

      You may also get this value doing ``[6]`` on the object.

   .. method:: family() -> int

      Returns the numeric family of the apriltag — one of:

        * `image.TAG16H5`
        * `image.TAG25H9`
        * `image.TAG36H10`
        * `image.TAG36H11`
        * `image.TAGCIRCLE21H7`
        * `image.TAGCIRCLE49H12`
        * `image.TAGCUSTOM48H12`
        * `image.TAGSTANDARD41H12`
        * `image.TAGSTANDARD52H13`

      You may also get this value doing ``[7]`` on the object.

   .. method:: name() -> str

      Returns the family name of the apriltag as a qstr (str), e.g.
      ``"TAG36H11"``.

      You may also get this value doing ``[8]`` on the object.

   .. method:: cxf() -> float

      Returns the centroid x position of the apriltag (float).

      You may also get this value doing ``[9]`` on the object.

   .. method:: cyf() -> float

      Returns the centroid y position of the apriltag (float).

      You may also get this value doing ``[10]`` on the object.

   .. method:: rotation() -> float

      Returns the rotation of the apriltag in radians (float).

      You may also get this value doing ``[11]`` on the object.

   .. method:: decision_margin() -> float

      Returns the quality of the apriltag match (0.0 - 1.0) where 1.0 is the
      best.

      You may also get this value doing ``[12]`` on the object.

   .. method:: hamming() -> int

      Returns the number of accepted bit errors for this tag.

        * TAG16H5 -> 0 bit errors will be accepted
        * TAG25H9 -> up to 3 bit errors may be accepted
        * TAG36H10 -> up to 3 bit errors may be accepted
        * TAG36H11 -> up to 4 bit errors may be accepted

      You may also get this value doing ``[13]`` on the object.

   .. method:: goodness() -> float

      Returns the quality of the apriltag image (0.0 - 1.0) where 1.0 is the
      best. Currently always 0.0.

      You may also get this value doing ``[14]`` on the object.

   .. method:: x_translation() -> float

      Returns the translation in unknown units from the camera in the X
      direction (left-to-right).

      You may also get this value doing ``[15]`` on the object.

   .. method:: y_translation() -> float

      Returns the translation in unknown units from the camera in the Y
      direction (up-to-down).

      You may also get this value doing ``[16]`` on the object.

   .. method:: z_translation() -> float

      Returns the translation in unknown units from the camera in the Z
      direction (front-to-back).

      You may also get this value doing ``[17]`` on the object.

   .. method:: x_rotation() -> float

      Returns the rotation in radians of the apriltag in the X plane (float).

      You may also get this value doing ``[18]`` on the object.

   .. method:: y_rotation() -> float

      Returns the rotation in radians of the apriltag in the Y plane (float).

      You may also get this value doing ``[19]`` on the object.

   .. method:: z_rotation() -> float

      Returns the rotation in radians of the apriltag in the Z plane (float).
      This is a renamed version of `apriltag.rotation()`.

      You may also get this value doing ``[20]`` on the object.

   .. method:: corners() -> Tuple[Tuple[int, int], Tuple[int, int], Tuple[int, int], Tuple[int, int]]

      Returns a tuple of 4 (x, y) tuples of the 4 corners of the object.
      Corners are returned in sorted clock-wise order starting from the top
      left.

      You may also get this value doing ``[21]`` on the object.

   .. method:: area() -> int

      Returns the area (w * h) of the apriltag's bounding box (int).

      You may also get this value doing ``[22]`` on the object.

   .. method:: rect() -> Tuple[int, int, int, int]

      Returns a rectangle tuple (x, y, w, h) of the apriltag's bounding box for
      use with other `image` methods like `Image.draw_rectangle()`.

      You may also get this value doing ``[23]`` on the object.
