.. currentmodule:: image

class Percentile -- Percentile Object
=====================================

The percentile object is an `attrtuple <https://docs.micropython.org/en/latest/library/collections.html#collections.namedtuple>`_
returned by `histogram.get_percentile()`. It reports the bin value at a
user-supplied CDF position (e.g. ``0.05`` for the 5th percentile,
``0.5`` for the median, ``0.95`` for the 95th percentile) for each channel
of the underlying :class:`Histogram <histogram>`.

For grayscale histograms, use ``value`` (the other three fields are 0). For
RGB565 histograms, ``l_value`` / ``a_value`` / ``b_value`` give the
percentile for the LAB ``L``, ``A``, and ``B`` channels respectively.

Fields are accessible by attribute name (``percentile.value``) or by index
(``percentile[0]``). The object has no public constructor.

.. class:: percentile

   Please call `histogram.get_percentile()` to create this object.

   .. attribute:: value

      Grayscale bin value at the requested percentile. Integer 0 -- 255.
      Index ``[0]``.

   .. attribute:: l_value

      LAB ``L`` channel bin value at the requested percentile. Integer
      0 -- 100. Index ``[1]``.

   .. attribute:: a_value

      LAB ``A`` channel bin value at the requested percentile. Integer
      -128 -- 127. Index ``[2]``.

   .. attribute:: b_value

      LAB ``B`` channel bin value at the requested percentile. Integer
      -128 -- 127. Index ``[3]``.
