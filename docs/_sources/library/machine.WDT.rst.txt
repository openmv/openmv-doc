.. currentmodule:: machine
.. _machine.WDT:

class WDT -- watchdog timer
===========================

The WDT is used to restart the system when the application crashes and ends
up into a non recoverable state. Once started it cannot be stopped or
reconfigured in any way. After enabling, the application must "feed" the
watchdog periodically to prevent it from expiring and resetting the system.

Available on STM32 OpenMV cams (M4 / M7 / H7 / H7 Plus / Pure Thermal /
N6) and the OpenMV Cam RT1062. Not exposed on the OpenMV Cam AE3 (alif
port).

Example usage::

    from machine import WDT
    wdt = WDT(timeout=2000)  # enable it with a timeout of 2s
    wdt.feed()

Constructors
------------

.. class:: WDT(id: int = 0, timeout: int = 5000)

   Create a WDT object and start it. ``timeout`` is given in
   milliseconds. Once started the watchdog cannot be stopped; use
   :meth:`timeout_ms` to change the window at runtime.

   Methods
   -------

   .. method:: feed() -> None

      Feed the WDT to prevent it from resetting the system. The application
      should place this call in a sensible place ensuring that the WDT is
      only fed after verifying that everything is functioning correctly.

   .. method:: timeout_ms(timeout: int) -> None

      Change the watchdog timeout to ``timeout`` milliseconds and
      reload the counter. Useful when one of several states needs a
      longer-than-default window before the next :meth:`feed`. The
      new timeout takes effect immediately. STM32 only.
