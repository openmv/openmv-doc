.. currentmodule:: pyb
.. _pyb.LED:

class LED -- on-board LED
=========================

The :class:`LED` class drives the individual LEDs soldered onto every
STM32-based OpenMV Cam. Most of those boards expose an RGB indicator
LED plus a fourth status LED (IR illuminator on the imaging cams, a
white illuminator on the Pure Thermal); the N6 has the RGB indicator
only. Each LED is exposed as a separate, on/off-controlled object.

Typical use cases are status indication, frame-grab heartbeats, and
turning the IR illuminator on for low-light captures::

    import pyb
    import time

    red = pyb.LED(1)
    ir = pyb.LED(4)

    # Blink the red LED while the IR ring lights the scene.
    ir.on()
    for _ in range(5):
        red.toggle()
        time.sleep_ms(200)
    ir.off()

Constructors
------------

.. class:: LED(id: int)

   Create an LED object associated with the given LED. ``id`` is the
   1-based LED number; the colour/function and the number of LEDs
   present depend on the OpenMV Cam:

   .. list-table::
      :header-rows: 1
      :widths: 30 18 18 18 18

      * - Camera
        - LED(1)
        - LED(2)
        - LED(3)
        - LED(4)
      * - OpenMV Cam M4 / M7 / H7 / H7 Plus
        - Red
        - Green
        - Blue
        - IR
      * - OpenMV Cam Pure Thermal
        - Red
        - Green
        - Blue
        - White
      * - OpenMV Cam N6
        - Red
        - Green
        - Blue
        - --

   The LED objects are simple GPIO wrappers: there are only three
   operations -- :meth:`on`, :meth:`off` and :meth:`toggle`. For
   colour blending, drive several LEDs at once (e.g. red + green for
   amber).

   Methods
   -------

   .. only:: port_pyboard

      .. method:: intensity(value: Optional[int] = None) -> Optional[int]

         Get or set the LED intensity.  Intensity ranges between 0 (off) and 255 (full on).
         If no argument is given, return the LED intensity.
         If an argument is given, set the LED intensity and return ``None``.

         *Note:* Only LED(3) and LED(4) can have a smoothly varying intensity, and
         they use timer PWM to implement it.  LED(3) uses Timer(2) and LED(4) uses
         Timer(3).  These timers are only configured for PWM if the intensity of the
         relevant LED is set to a value between 1 and 254.  Otherwise the timers are
         free for general purpose use.

   .. method:: on() -> None

      Drive the LED to its on state.

   .. method:: off() -> None

      Drive the LED to its off state.

   .. method:: toggle() -> None

      Flip the LED's current state. If it was on it goes off, and vice
      versa. Useful for heartbeat blinkers in a polled loop or timer
      callback.
