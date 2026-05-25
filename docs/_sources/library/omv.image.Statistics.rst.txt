.. currentmodule:: image

class Statistics -- Statistics Object
=====================================

The statistics object is an `attrtuple <https://docs.micropython.org/en/latest/library/collections.html#collections.namedtuple>`_
returned by `histogram.get_statistics()` (and its aliases
`histogram.get_stats()` / `histogram.statistics()`) or directly by
`Image.get_statistics()`. It summarises the bin distribution of the
underlying :class:`Histogram <histogram>` with eight reductions per channel:
mean, median, mode, standard deviation, min, max, lower quartile, and upper
quartile.

For grayscale data, only the un-prefixed fields (``mean``, ``median``,
``mode``, ``stdev``, ``min``, ``max``, ``lq``, ``uq``) carry useful values
and they are reused as the LAB ``L`` channel reductions for RGB565 data --
the ``l_*`` fields therefore mirror the un-prefixed fields and are provided
for symmetry. ``a_*`` and ``b_*`` only carry useful values for RGB565
histograms.

Fields are accessible by attribute name (``statistics.mean``) or by index
(``statistics[0]``). The object has no public constructor.

.. class:: statistics

   Please call `histogram.get_statistics()` or `Image.get_statistics()` to
   create this object.

   Grayscale / LAB L (also exposed as ``l_*`` below)
   --------------------------------------------------

   .. attribute:: mean

      Grayscale mean of the histogram. Integer 0 -- 255. Index ``[0]``.

   .. attribute:: median

      Grayscale median of the histogram. Integer 0 -- 255. Index ``[1]``.

   .. attribute:: mode

      Grayscale mode of the histogram. Integer 0 -- 255. Index ``[2]``.

   .. attribute:: stdev

      Grayscale standard deviation of the histogram. Integer 0 -- 255.
      Index ``[3]``.

   .. attribute:: min

      Grayscale minimum of the histogram. Integer 0 -- 255. Index ``[4]``.

   .. attribute:: max

      Grayscale maximum of the histogram. Integer 0 -- 255. Index ``[5]``.

   .. attribute:: lq

      Grayscale lower quartile (25th percentile) of the histogram.
      Integer 0 -- 255. Index ``[6]``.

   .. attribute:: uq

      Grayscale upper quartile (75th percentile) of the histogram.
      Integer 0 -- 255. Index ``[7]``.

   LAB L channel (RGB565)
   ----------------------

   .. attribute:: l_mean

      LAB ``L`` channel mean. Integer 0 -- 100. Index ``[8]``.

   .. attribute:: l_median

      LAB ``L`` channel median. Integer 0 -- 100. Index ``[9]``.

   .. attribute:: l_mode

      LAB ``L`` channel mode. Integer 0 -- 100. Index ``[10]``.

   .. attribute:: l_stdev

      LAB ``L`` channel standard deviation. Integer 0 -- 100. Index ``[11]``.

   .. attribute:: l_min

      LAB ``L`` channel minimum. Integer 0 -- 100. Index ``[12]``.

   .. attribute:: l_max

      LAB ``L`` channel maximum. Integer 0 -- 100. Index ``[13]``.

   .. attribute:: l_lq

      LAB ``L`` channel lower quartile. Integer 0 -- 100. Index ``[14]``.

   .. attribute:: l_uq

      LAB ``L`` channel upper quartile. Integer 0 -- 100. Index ``[15]``.

   LAB A channel (RGB565)
   ----------------------

   .. attribute:: a_mean

      LAB ``A`` channel mean. Integer -128 -- 127. Index ``[16]``.

   .. attribute:: a_median

      LAB ``A`` channel median. Integer -128 -- 127. Index ``[17]``.

   .. attribute:: a_mode

      LAB ``A`` channel mode. Integer -128 -- 127. Index ``[18]``.

   .. attribute:: a_stdev

      LAB ``A`` channel standard deviation. Integer -128 -- 127.
      Index ``[19]``.

   .. attribute:: a_min

      LAB ``A`` channel minimum. Integer -128 -- 127. Index ``[20]``.

   .. attribute:: a_max

      LAB ``A`` channel maximum. Integer -128 -- 127. Index ``[21]``.

   .. attribute:: a_lq

      LAB ``A`` channel lower quartile. Integer -128 -- 127. Index ``[22]``.

   .. attribute:: a_uq

      LAB ``A`` channel upper quartile. Integer -128 -- 127. Index ``[23]``.

   LAB B channel (RGB565)
   ----------------------

   .. attribute:: b_mean

      LAB ``B`` channel mean. Integer -128 -- 127. Index ``[24]``.

   .. attribute:: b_median

      LAB ``B`` channel median. Integer -128 -- 127. Index ``[25]``.

   .. attribute:: b_mode

      LAB ``B`` channel mode. Integer -128 -- 127. Index ``[26]``.

   .. attribute:: b_stdev

      LAB ``B`` channel standard deviation. Integer -128 -- 127.
      Index ``[27]``.

   .. attribute:: b_min

      LAB ``B`` channel minimum. Integer -128 -- 127. Index ``[28]``.

   .. attribute:: b_max

      LAB ``B`` channel maximum. Integer -128 -- 127. Index ``[29]``.

   .. attribute:: b_lq

      LAB ``B`` channel lower quartile. Integer -128 -- 127. Index ``[30]``.

   .. attribute:: b_uq

      LAB ``B`` channel upper quartile. Integer -128 -- 127. Index ``[31]``.
