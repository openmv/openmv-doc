.. currentmodule:: display

class PWMBacklight -- PWM Backlight
===================================

The `PWMBacklight` class controls a screen backlight via a PWM timer channel. Pass an instance
as the ``backlight`` argument to any display constructor that accepts a backlight controller.

Constructors
------------

.. class:: PWMBacklight(pin: machine.Pin, timer: int = 3, channel: int = 3, frequency: int = 200)

   Creates a PWM-driven backlight controller.

   ``pin`` specifies the Pin to use.

   ``timer`` specifies the Timer number to use.

   ``channel`` specifies the Timer channel to use.

   ``frequency`` specifies the PWM frequency in Hz.

   .. method:: deinit() -> None

      Deinitializes the backlight controller.

   .. method:: backlight(value: int) -> None

      Sets the backlight strength from 0-100.
