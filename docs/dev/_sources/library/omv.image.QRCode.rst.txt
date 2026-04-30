.. currentmodule:: image

class QRCode -- QRCode object
=============================

The qrcode object is returned by `Image.find_qrcodes()`. It is an attrtuple
with 16 fields.

.. class:: qrcode

   Please call `Image.find_qrcodes()` to create this object. It has no public
   constructor.

   .. method:: x() -> int

      Returns the qrcode's bounding box x coordinate (int).

      You may also get this value doing ``[0]`` on the object.

   .. method:: y() -> int

      Returns the qrcode's bounding box y coordinate (int).

      You may also get this value doing ``[1]`` on the object.

   .. method:: w() -> int

      Returns the qrcode's bounding box w coordinate (int).

      You may also get this value doing ``[2]`` on the object.

   .. method:: h() -> int

      Returns the qrcode's bounding box h coordinate (int).

      You may also get this value doing ``[3]`` on the object.

   .. method:: payload() -> str

      Returns the payload string of the qrcode (str).

      You may also get this value doing ``[4]`` on the object.

   .. method:: version() -> int

      Returns the version number of the qrcode (int).

      You may also get this value doing ``[5]`` on the object.

   .. method:: ecc_level() -> int

      Returns the ecc_level of the qrcode (int).

      You may also get this value doing ``[6]`` on the object.

   .. method:: mask() -> int

      Returns the mask of the qrcode (int).

      You may also get this value doing ``[7]`` on the object.

   .. method:: data_type() -> int

      Returns the data type of the qrcode (int).

      You may also get this value doing ``[8]`` on the object.

   .. method:: eci() -> int

      Returns the eci of the qrcode (int). The eci stores the encoding of data
      bytes in the QR Code.

      You may also get this value doing ``[9]`` on the object.

   .. method:: corners() -> Tuple[Tuple[int, int], Tuple[int, int], Tuple[int, int], Tuple[int, int]]

      Returns a tuple of 4 (x, y) tuples of the 4 corners of the object.
      Corners are returned in sorted clock-wise order starting from the top
      left.

      You may also get this value doing ``[10]`` on the object.

   .. method:: is_numeric() -> bool

      Returns True if the data_type of the qrcode is numeric.

      You may also get this value doing ``[11]`` on the object.

   .. method:: is_alphanumeric() -> bool

      Returns True if the data_type of the qrcode is alphanumeric.

      You may also get this value doing ``[12]`` on the object.

   .. method:: is_binary() -> bool

      Returns True if the data_type of the qrcode is binary. Check `eci()` to
      determine the text encoding when this is True.

      You may also get this value doing ``[13]`` on the object.

   .. method:: is_kanji() -> bool

      Returns True if the data_type of the qrcode is Kanji. Kanji symbols are
      10-bits per character and MicroPython does not parse this encoding; the
      payload must be treated as a byte array.

      You may also get this value doing ``[14]`` on the object.

   .. method:: rect() -> Tuple[int, int, int, int]

      Returns a rectangle tuple (x, y, w, h) of the qrcode's bounding box for
      use with other `image` methods like `Image.draw_rectangle()`.

      You may also get this value doing ``[15]`` on the object.
