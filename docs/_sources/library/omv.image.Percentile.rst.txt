.. currentmodule:: image

class Percentile -- Percentile Object
=====================================

The percentile object is an attrtuple returned by
`histogram.get_percentile()`.

Grayscale percentiles have one channel; use ``value``. RGB565 percentiles have
three channels; use ``l_value``, ``a_value``, and ``b_value``.

Fields are accessible by name (``percentile.value``) or by index
(``percentile[0]``). It has no public constructor.

.. class:: percentile

   Please call `histogram.get_percentile()` to create this object.

   .. method:: percentile.value() -> int

      Returns the grayscale percentile value (0 - 255).

      Also accessible as ``percentile[0]``.

   .. method:: percentile.l_value() -> int

      Returns the RGB565 LAB L channel percentile value (0 - 100).

      Also accessible as ``percentile[1]``.

   .. method:: percentile.a_value() -> int

      Returns the RGB565 LAB A channel percentile value (-128 - 127).

      Also accessible as ``percentile[2]``.

   .. method:: percentile.b_value() -> int

      Returns the RGB565 LAB B channel percentile value (-128 - 127).

      Also accessible as ``percentile[3]``.
