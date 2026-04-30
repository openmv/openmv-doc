.. currentmodule:: image

class Statistics -- Statistics Object
=====================================

The statistics object is an attrtuple returned by `histogram.get_statistics()`
or `Image.get_statistics()`.

Grayscale statistics have one channel; use the non ``l_*``, ``a_*``, ``b_*``
fields. RGB565 statistics use the ``l_*``, ``a_*``, and ``b_*`` fields.

Fields are accessible by name (``statistics.mean``) or by index
(``statistics[0]``). It has no public constructor.

.. class:: statistics

   Please call `histogram.get_statistics()` or `Image.get_statistics()` to
   create this object.

   .. method:: statistics.mean() -> int

      Returns the grayscale mean (0 - 255). Also accessible as ``statistics[0]``.

   .. method:: statistics.median() -> int

      Returns the grayscale median (0 - 255). Also accessible as ``statistics[1]``.

   .. method:: statistics.mode() -> int

      Returns the grayscale mode (0 - 255). Also accessible as ``statistics[2]``.

   .. method:: statistics.stdev() -> int

      Returns the grayscale standard deviation (0 - 255). Also accessible as
      ``statistics[3]``.

   .. method:: statistics.min() -> int

      Returns the grayscale min (0 - 255). Also accessible as ``statistics[4]``.

   .. method:: statistics.max() -> int

      Returns the grayscale max (0 - 255). Also accessible as ``statistics[5]``.

   .. method:: statistics.lq() -> int

      Returns the grayscale lower quartile (0 - 255). Also accessible as
      ``statistics[6]``.

   .. method:: statistics.uq() -> int

      Returns the grayscale upper quartile (0 - 255). Also accessible as
      ``statistics[7]``.

   .. method:: statistics.l_mean() -> int

      Returns the RGB565 LAB L mean (0 - 100). Also accessible as
      ``statistics[8]``.

   .. method:: statistics.l_median() -> int

      Returns the RGB565 LAB L median (0 - 100). Also accessible as
      ``statistics[9]``.

   .. method:: statistics.l_mode() -> int

      Returns the RGB565 LAB L mode (0 - 100). Also accessible as
      ``statistics[10]``.

   .. method:: statistics.l_stdev() -> int

      Returns the RGB565 LAB L standard deviation (0 - 100). Also accessible as
      ``statistics[11]``.

   .. method:: statistics.l_min() -> int

      Returns the RGB565 LAB L min (0 - 100). Also accessible as
      ``statistics[12]``.

   .. method:: statistics.l_max() -> int

      Returns the RGB565 LAB L max (0 - 100). Also accessible as
      ``statistics[13]``.

   .. method:: statistics.l_lq() -> int

      Returns the RGB565 LAB L lower quartile (0 - 100). Also accessible as
      ``statistics[14]``.

   .. method:: statistics.l_uq() -> int

      Returns the RGB565 LAB L upper quartile (0 - 100). Also accessible as
      ``statistics[15]``.

   .. method:: statistics.a_mean() -> int

      Returns the RGB565 LAB A mean (-128 - 127). Also accessible as
      ``statistics[16]``.

   .. method:: statistics.a_median() -> int

      Returns the RGB565 LAB A median (-128 - 127). Also accessible as
      ``statistics[17]``.

   .. method:: statistics.a_mode() -> int

      Returns the RGB565 LAB A mode (-128 - 127). Also accessible as
      ``statistics[18]``.

   .. method:: statistics.a_stdev() -> int

      Returns the RGB565 LAB A standard deviation (-128 - 127). Also accessible as
      ``statistics[19]``.

   .. method:: statistics.a_min() -> int

      Returns the RGB565 LAB A min (-128 - 127). Also accessible as
      ``statistics[20]``.

   .. method:: statistics.a_max() -> int

      Returns the RGB565 LAB A max (-128 - 127). Also accessible as
      ``statistics[21]``.

   .. method:: statistics.a_lq() -> int

      Returns the RGB565 LAB A lower quartile (-128 - 127). Also accessible as
      ``statistics[22]``.

   .. method:: statistics.a_uq() -> int

      Returns the RGB565 LAB A upper quartile (-128 - 127). Also accessible as
      ``statistics[23]``.

   .. method:: statistics.b_mean() -> int

      Returns the RGB565 LAB B mean (-128 - 127). Also accessible as
      ``statistics[24]``.

   .. method:: statistics.b_median() -> int

      Returns the RGB565 LAB B median (-128 - 127). Also accessible as
      ``statistics[25]``.

   .. method:: statistics.b_mode() -> int

      Returns the RGB565 LAB B mode (-128 - 127). Also accessible as
      ``statistics[26]``.

   .. method:: statistics.b_stdev() -> int

      Returns the RGB565 LAB B standard deviation (-128 - 127). Also accessible as
      ``statistics[27]``.

   .. method:: statistics.b_min() -> int

      Returns the RGB565 LAB B min (-128 - 127). Also accessible as
      ``statistics[28]``.

   .. method:: statistics.b_max() -> int

      Returns the RGB565 LAB B max (-128 - 127). Also accessible as
      ``statistics[29]``.

   .. method:: statistics.b_lq() -> int

      Returns the RGB565 LAB B lower quartile (-128 - 127). Also accessible as
      ``statistics[30]``.

   .. method:: statistics.b_uq() -> int

      Returns the RGB565 LAB B upper quartile (-128 - 127). Also accessible as
      ``statistics[31]``.
