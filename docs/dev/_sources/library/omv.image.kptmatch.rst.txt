.. currentmodule:: image

class kptmatch -- Keypoint match object
=======================================

The kptmatch object is an `attrtuple <https://docs.micropython.org/en/latest/library/collections.html#collections.namedtuple>`_
returned by `image.match_descriptor()` for keypoint matches with the fields:

.. class:: kptmatch

   Please call `image.match_descriptor()` to create this object. It has no
   public constructor.

   .. method:: x() -> int

      Bounding box x coordinate of the matched keypoints. Index ``[0]``.

   .. method:: y() -> int

      Bounding box y coordinate of the matched keypoints. Index ``[1]``.

   .. method:: w() -> int

      Bounding box width of the matched keypoints. Index ``[2]``.

   .. method:: h() -> int

      Bounding box height of the matched keypoints. Index ``[3]``.

   .. method:: cx() -> int

      Centroid x position of the matched keypoints. Index ``[4]``.

   .. method:: cy() -> int

      Centroid y position of the matched keypoints. Index ``[5]``.

   .. method:: count() -> int

      Number of keypoints matched. Index ``[6]``.

   .. method:: theta() -> int

      Estimated angle of rotation of the match. Index ``[7]``.

   .. method:: match() -> List[Tuple[int, int]]

      List of ``(x, y)`` tuples of the matching keypoints. Index ``[8]``.

   .. method:: rect() -> Tuple[int, int, int, int]

      Bounding box ``(x, y, w, h)`` of the matched keypoints, suitable for
      passing to methods like `Image.draw_rectangle()`. Index ``[9]``.
