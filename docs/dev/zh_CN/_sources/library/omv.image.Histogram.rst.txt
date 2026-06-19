.. currentmodule:: image

class Histogram -- Histogram Object
===================================

The histogram object is returned by `Image.get_histogram()`. The underlying
class name is ``histogram``.

For grayscale images the histogram has a single channel of bins. For RGB565
images the histogram has three channels covering the CIE-LAB ``L``, ``A``,
and ``B`` axes. In both cases each channel is normalized so that its bins
sum to 1.0.

Per-channel bin lists are exposed as both bound methods (``hist.bins()``)
and through subscript notation (``hist[0]``). The high-level reductions
:meth:`get_percentile`, :meth:`get_threshold`, and :meth:`get_statistics`
return the corresponding :class:`Percentile <percentile>`,
:class:`Threshold <threshold>`, and :class:`Statistics <statistics>` attrtuples.

.. class:: histogram

   Please call `Image.get_histogram()` to create this object. It has no public
   constructor.

   .. method:: bins() -> list[float]

      Return the bin list for a grayscale histogram. Each entry is in the
      range 0.0 to 1.0 and the entries sum to 1.0.

      Equivalent to ``histogram[0]``.

   .. method:: l_bins() -> list[float]

      Return the bin list for the LAB ``L`` channel of an RGB565 histogram.
      Each entry is in the range 0.0 to 1.0 and the entries sum to 1.0.

      Equivalent to ``histogram[0]``.

   .. method:: a_bins() -> list[float]

      Return the bin list for the LAB ``A`` channel of an RGB565 histogram.
      Each entry is in the range 0.0 to 1.0 and the entries sum to 1.0.

      Equivalent to ``histogram[1]``.

   .. method:: b_bins() -> list[float]

      Return the bin list for the LAB ``B`` channel of an RGB565 histogram.
      Each entry is in the range 0.0 to 1.0 and the entries sum to 1.0.

      Equivalent to ``histogram[2]``.

   .. method:: get_percentile(percentile: float) -> image.percentile

      Compute the CDF of every histogram channel and return the bin value at
      the requested ``percentile`` (a float in ``0.0`` -- ``1.0``).

      Useful for finding the min/max of a color distribution while ignoring
      outliers (``get_percentile(0.05)`` and ``get_percentile(0.95)`` give a
      robust min/max).

      Returns a :class:`Percentile <percentile>` attrtuple.

   .. method:: get_threshold() -> image.threshold

      Use Otsu's Method on every channel to find the threshold value that
      best splits each channel's distribution into a "background" and
      "foreground" half. The returned thresholds are well-suited to feed
      directly into `Image.binary()` or any other method that takes
      LAB ``L/A/B`` color thresholds.

      Returns a :class:`Threshold <threshold>` attrtuple.

   .. method:: get_statistics() -> image.statistics

      Compute the mean, median, mode, standard deviation, min, max, lower
      quartile, and upper quartile of every histogram channel.

      Returns a :class:`Statistics <statistics>` attrtuple.

   .. method:: get_stats() -> image.statistics

      Alias for :meth:`get_statistics`.

   .. method:: statistics() -> image.statistics

      Alias for :meth:`get_statistics`.
