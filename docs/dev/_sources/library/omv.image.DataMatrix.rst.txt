.. currentmodule:: image

class DataMatrix -- DataMatrix object
=====================================

The datamatrix object is returned by `Image.find_datamatrices()`. It is an
attrtuple with 12 fields.

.. class:: datamatrix

   Please call `Image.find_datamatrices()` to create this object. It has no
   public constructor.

   .. method:: x() -> int

      Returns the datamatrix's bounding box x coordinate (int).

      You may also get this value doing ``[0]`` on the object.

   .. method:: y() -> int

      Returns the datamatrix's bounding box y coordinate (int).

      You may also get this value doing ``[1]`` on the object.

   .. method:: w() -> int

      Returns the datamatrix's bounding box w coordinate (int).

      You may also get this value doing ``[2]`` on the object.

   .. method:: h() -> int

      Returns the datamatrix's bounding box h coordinate (int).

      You may also get this value doing ``[3]`` on the object.

   .. method:: payload() -> str

      Returns the payload string of the datamatrix (str).

      You may also get this value doing ``[4]`` on the object.

   .. method:: rotation() -> float

      Returns the rotation of the datamatrix in radians (float).

      You may also get this value doing ``[5]`` on the object.

   .. method:: rows() -> int

      Returns the number of rows in the data matrix (int).

      You may also get this value doing ``[6]`` on the object.

   .. method:: columns() -> int

      Returns the number of columns in the data matrix (int).

      You may also get this value doing ``[7]`` on the object.

   .. method:: capacity() -> int

      Returns how many characters could fit in this data matrix (int).

      You may also get this value doing ``[8]`` on the object.

   .. method:: padding() -> int

      Returns how many unused characters are in this data matrix (int).

      You may also get this value doing ``[9]`` on the object.

   .. method:: corners() -> Tuple[Tuple[int, int], Tuple[int, int], Tuple[int, int], Tuple[int, int]]

      Returns a tuple of 4 (x, y) tuples of the 4 corners of the object.
      Corners are returned in sorted clock-wise order starting from the top
      left.

      You may also get this value doing ``[10]`` on the object.

   .. method:: rect() -> Tuple[int, int, int, int]

      Returns a rectangle tuple (x, y, w, h) of the datamatrix's bounding box
      for use with other `image` methods like `Image.draw_rectangle()`.

      You may also get this value doing ``[11]`` on the object.
