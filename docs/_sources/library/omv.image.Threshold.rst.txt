.. currentmodule:: image

class Threshold -- Threshold Object
===================================

The threshold object is an `attrtuple <https://docs.micropython.org/en/latest/library/collections.html#collections.namedtuple>`_
returned by `histogram.get_threshold()`. It reports the Otsu-optimal split
value for each channel of the underlying :class:`Histogram <histogram>` --
i.e. the bin value that best separates the channel into a "background" and
"foreground" half.

For grayscale histograms, use ``value`` (the other three fields are 0). For
RGB565 histograms, ``l_value`` / ``a_value`` / ``b_value`` give the
Otsu threshold for the LAB ``L``, ``A``, and ``B`` channels respectively.
The returned values are well-suited to feed directly into `Image.binary()`
or any other method that takes LAB color thresholds.

Fields are accessible by attribute name (``threshold.value``) or by index
(``threshold[0]``). The object has no public constructor.

.. class:: threshold

   Please call `histogram.get_threshold()` to create this object.

   .. attribute:: value

      Grayscale Otsu threshold value. Integer 0 -- 255. Index ``[0]``.

   .. attribute:: l_value

      LAB ``L`` channel Otsu threshold value. Integer 0 -- 100.
      Index ``[1]``.

   .. attribute:: a_value

      LAB ``A`` channel Otsu threshold value. Integer -128 -- 127.
      Index ``[2]``.

   .. attribute:: b_value

      LAB ``B`` channel Otsu threshold value. Integer -128 -- 127.
      Index ``[3]``.
