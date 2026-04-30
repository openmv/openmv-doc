.. currentmodule:: image

class Threshold -- Threshold Object
===================================

The threshold object is an attrtuple returned by `histogram.get_threshold()`.

Grayscale thresholds have one channel; use ``value``. RGB565 thresholds have
three channels; use ``l_value``, ``a_value``, and ``b_value``.

Fields are accessible by name (``threshold.value``) or by index
(``threshold[0]``). It has no public constructor.

.. class:: threshold

   Please call `histogram.get_threshold()` to create this object.

   .. method:: threshold.value() -> int

      Returns the grayscale threshold value (0 - 255).

      Also accessible as ``threshold[0]``.

   .. method:: threshold.l_value() -> int

      Returns the RGB565 LAB L channel threshold value (0 - 100).

      Also accessible as ``threshold[1]``.

   .. method:: threshold.a_value() -> int

      Returns the RGB565 LAB A channel threshold value (-128 - 127).

      Also accessible as ``threshold[2]``.

   .. method:: threshold.b_value() -> int

      Returns the RGB565 LAB B channel threshold value (-128 - 127).

      Also accessible as ``threshold[3]``.
