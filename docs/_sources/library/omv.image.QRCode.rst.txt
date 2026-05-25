.. currentmodule:: image

class QRCode -- QRCode object
=============================

The qrcode object is an `attrtuple <https://docs.micropython.org/en/latest/library/collections.html#collections.namedtuple>`_
returned by `Image.find_qrcodes()`. Each instance describes a decoded
QR-code: its bounding box, decoded payload, decoder metadata (version, ECC
level, mask, data type, ECI), the four detected corners, and convenience
boolean flags identifying the encoding of the payload.

Fields are accessible by attribute name (``qrcode.payload``) or by index
(``qrcode[0]``). The object has no public constructor.

.. class:: qrcode

   Please call `Image.find_qrcodes()` to create this object.

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

   .. attribute:: corners

      4-tuple of ``(x, y)`` integer tuples for the four detected corners
      of the QR code, sorted clockwise starting from the top-left corner.
      Index ``[10]``.

   .. attribute:: rect

      ``(x, y, w, h)`` 4-tuple of the bounding box. Suitable for passing
      directly to drawing/cropping methods such as `Image.draw_rectangle()`
      or `Image.crop()`. Index ``[15]``.

   Decoded payload
   ---------------

   .. attribute:: payload

      Decoded payload string. Index ``[4]``.

   Decoder metadata
   ----------------

   .. attribute:: version

      QR-code version, 1 -- 40. Higher versions encode more data and have
      larger modules. Integer. Index ``[5]``.

   .. attribute:: ecc_level

      Error-correction level, 0 -- 3 (corresponding to L / M / Q / H).
      Higher values reserve more codewords for error correction.
      Integer. Index ``[6]``.

   .. attribute:: mask

      Mask pattern, 0 -- 7. Used by the QR-code encoder to choose the
      module pattern that minimises decoder confusion. Integer.
      Index ``[7]``.

   .. attribute:: data_type

      Encoding of the payload as the decoder reported it. One of the
      following bitmask values: ``1`` numeric, ``2`` alphanumeric,
      ``4`` binary, ``8`` Kanji. See the per-flag attributes below for a
      friendlier form. Integer. Index ``[8]``.

   .. attribute:: eci

      Extended Channel Interpretation value. Encodes the text encoding
      used for the bytes in the payload (e.g. UTF-8 versus ISO-8859-1).
      Integer. Index ``[9]``.

   Encoding flags
   --------------

   .. attribute:: is_numeric

      ``True`` if ``data_type`` indicates a numeric payload. Index ``[11]``.

   .. attribute:: is_alphanumeric

      ``True`` if ``data_type`` indicates an alphanumeric payload.
      Index ``[12]``.

   .. attribute:: is_binary

      ``True`` if ``data_type`` indicates a binary payload. Check ``eci``
      to determine the text encoding when this is ``True``. Index ``[13]``.

   .. attribute:: is_kanji

      ``True`` if ``data_type`` indicates a Kanji payload. Kanji symbols
      are 10 bits per character and MicroPython does not parse this
      encoding -- the payload must be treated as a byte array.
      Index ``[14]``.
