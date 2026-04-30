.. currentmodule:: image

class BarCode -- BarCode object
===============================

The barcode object is returned by `Image.find_barcodes()`. It is an attrtuple
with 10 fields.

.. class:: barcode

   Please call `Image.find_barcodes()` to create this object. It has no public
   constructor.

   .. method:: x() -> int

      Returns the barcode's bounding box x coordinate (int).

      You may also get this value doing ``[0]`` on the object.

   .. method:: y() -> int

      Returns the barcode's bounding box y coordinate (int).

      You may also get this value doing ``[1]`` on the object.

   .. method:: w() -> int

      Returns the barcode's bounding box w coordinate (int).

      You may also get this value doing ``[2]`` on the object.

   .. method:: h() -> int

      Returns the barcode's bounding box h coordinate (int).

      You may also get this value doing ``[3]`` on the object.

   .. method:: payload() -> str

      Returns the payload string of the barcode (str).

      You may also get this value doing ``[4]`` on the object.

   .. method:: type() -> int

      Returns the type enumeration of the barcode (int).

        * image.EAN2
        * image.EAN5
        * image.EAN8
        * image.UPCE
        * image.ISBN10
        * image.UPCA
        * image.EAN13
        * image.ISBN13
        * image.I25
        * image.DATABAR
        * image.DATABAR_EXP
        * image.CODABAR
        * image.CODE39
        * image.PDF417
        * image.CODE93
        * image.CODE128

      You may also get this value doing ``[5]`` on the object.

   .. method:: rotation() -> float

      Returns the rotation of the barcode in radians (float).

      You may also get this value doing ``[6]`` on the object.

   .. method:: quality() -> int

      Returns the number of times this barcode was detected in the image
      (int). Each scanline that decodes the same barcode increments this
      value.

      You may also get this value doing ``[7]`` on the object.

   .. method:: corners() -> Tuple[Tuple[int, int], Tuple[int, int], Tuple[int, int], Tuple[int, int]]

      Returns a tuple of 4 (x, y) tuples of the 4 corners of the object.
      Corners are returned in sorted clock-wise order starting from the top
      left.

      You may also get this value doing ``[8]`` on the object.

   .. method:: rect() -> Tuple[int, int, int, int]

      Returns a rectangle tuple (x, y, w, h) of the barcode's bounding box for
      use with other `image` methods like `Image.draw_rectangle()`.

      You may also get this value doing ``[9]`` on the object.
