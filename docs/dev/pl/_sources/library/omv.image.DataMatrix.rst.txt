.. currentmodule:: image

class DataMatrix -- DataMatrix object
=====================================

The datamatrix object is an `attrtuple <https://docs.micropython.org/en/latest/library/collections.html#collections.namedtuple>`_
returned by `Image.find_datamatrices()`. Each instance describes a
decoded Data Matrix 2D-barcode: its bounding box, decoded payload,
in-image-plane rotation, layout metadata (rows, columns, capacity,
padding), and the four detected corners.

Fields are accessible by attribute name (``dm.payload``) or by index
(``dm[0]``). The object has no public constructor.

.. class:: datamatrix

   Please call `Image.find_datamatrices()` to create this object.

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
      of the data matrix, sorted clockwise starting from the top-left
      corner. Index ``[10]``.

   .. attribute:: rect

      ``(x, y, w, h)`` 4-tuple of the bounding box. Suitable for passing
      directly to drawing/cropping methods such as `Image.draw_rectangle()`
      or `Image.crop()`. Index ``[11]``.

   Decoded payload
   ---------------

   .. attribute:: payload

      Decoded payload string. Index ``[4]``.

   .. attribute:: rotation

      In-image-plane rotation of the data matrix in radians. Float.
      Index ``[5]``.

   Layout
   ------

   .. attribute:: rows

      Number of cell rows in the data matrix. Integer. Index ``[6]``.

   .. attribute:: columns

      Number of cell columns in the data matrix. Integer. Index ``[7]``.

   .. attribute:: capacity

      Maximum number of payload characters this data matrix could carry
      at the current row/column size. Integer. Index ``[8]``.

   .. attribute:: padding

      Number of unused payload character slots in this data matrix
      (``capacity - len(payload)``). Integer. Index ``[9]``.
