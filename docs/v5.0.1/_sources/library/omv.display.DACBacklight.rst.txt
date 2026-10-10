.. currentmodule:: display

class DACBacklight -- DAC Backlight
===================================

The `DACBacklight` class controls a screen backlight via a DAC channel. Pass an instance
as the ``backlight`` argument to any display constructor that accepts a backlight controller.

Constructors
------------

.. class:: DACBacklight(channel: int, bits: int = 8)

   Creates a DAC-driven backlight controller.

   ``channel`` specifies the DAC channel (or GPIO pin) to use.

   ``bits`` specifies the DAC resolution.

   .. method:: deinit() -> None

      Deinitializes the backlight controller.

   .. method:: backlight(value: int) -> None

      Sets the backlight strength from 0-100.
