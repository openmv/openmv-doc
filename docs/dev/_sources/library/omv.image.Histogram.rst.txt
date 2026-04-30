.. currentmodule:: image

class Histogram -- Histogram Object
===================================

The histogram object is returned by `Image.get_histogram()`. The underlying
class name is ``histogram``.

Grayscale histograms have one channel with some number of bins. All bins are
normalized so that they sum to 1.

RGB565 histograms have three channels (LAB L, A, B) with some number of bins
each. All bins in a channel are normalized so that they sum to 1.

.. class:: histogram

   Please call `Image.get_histogram()` to create this object. It has no public
   constructor.

   .. method:: histogram.bins() -> list[float]

      Returns a list of floats for the grayscale histogram.

      Also accessible as ``histogram[0]``.

   .. method:: histogram.l_bins() -> list[float]

      Returns a list of floats for the RGB565 LAB L channel histogram.

      Also accessible as ``histogram[0]``.

   .. method:: histogram.a_bins() -> list[float]

      Returns a list of floats for the RGB565 LAB A channel histogram.

      Also accessible as ``histogram[1]``.

   .. method:: histogram.b_bins() -> list[float]

      Returns a list of floats for the RGB565 LAB B channel histogram.

      Also accessible as ``histogram[2]``.

   .. method:: histogram.get_percentile(percentile: float) -> image.percentile

      Computes the CDF of the histogram channels and returns an `image.percentile`
      object holding the value at ``percentile`` (0.0 - 1.0) for each channel.
      Useful for determining min/max of a color distribution while ignoring
      outliers.

   .. method:: histogram.get_threshold() -> image.threshold

      Uses Otsu's Method to compute the optimal threshold values that split the
      histogram into two halves for each channel. Returns an `image.threshold`
      object. Useful for determining optimal `Image.binary()` thresholds.

   .. method:: histogram.get_statistics() -> image.statistics

      Computes the mean, median, mode, standard deviation, min, max, lower
      quartile, and upper quartile of each channel of the histogram. Returns an
      `image.statistics` object.

   .. method:: histogram.get_stats() -> image.statistics

      Alias for `histogram.get_statistics()`.

   .. method:: histogram.statistics() -> image.statistics

      Alias for `histogram.get_statistics()`.
