.. currentmodule:: image

class BarCode -- BarCode object
===============================

The barcode object is an `attrtuple <https://docs.micropython.org/en/latest/library/collections.html#collections.namedtuple>`_
returned by `Image.find_barcodes()`. Each instance describes a decoded
1D barcode: its bounding box, decoded payload, symbology, in-image-plane
rotation, a decode-quality score, and the four detected corners of the
barcode.

Fields are accessible by attribute name (``barcode.payload``) or by index
(``barcode[0]``). The object has no public constructor.

.. class:: barcode

   Please call `Image.find_barcodes()` to create this object.

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
      of the barcode, sorted clockwise starting from the top-left corner.
      Index ``[8]``.

   .. attribute:: rect

      ``(x, y, w, h)`` 4-tuple of the bounding box. Suitable for passing
      directly to drawing/cropping methods such as `Image.draw_rectangle()`
      or `Image.crop()`. Index ``[9]``.

   Decoded payload
   ---------------

   .. attribute:: payload

      Decoded payload string. Index ``[4]``.

   .. attribute:: type

      Symbology of the decoded barcode. One of:

         * `image.EAN2`
         * `image.EAN5`
         * `image.EAN8`
         * `image.UPCE`
         * `image.ISBN10`
         * `image.UPCA`
         * `image.EAN13`
         * `image.ISBN13`
         * `image.I25`
         * `image.DATABAR`
         * `image.DATABAR_EXP`
         * `image.CODABAR`
         * `image.CODE39`
         * `image.PDF417`
         * `image.CODE93`
         * `image.CODE128`

      Integer. Index ``[5]``.

   .. attribute:: rotation

      In-image-plane rotation of the barcode in radians. Float.
      Index ``[6]``.

   .. attribute:: quality

      Number of times the barcode was decoded across the image. The
      decoder runs across every scanline that crosses the barcode and
      increments this counter on each successful decode -- higher values
      indicate a more confident result. Integer. Index ``[7]``.
