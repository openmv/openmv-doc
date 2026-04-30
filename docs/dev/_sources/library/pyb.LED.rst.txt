.. currentmodule:: pyb
.. _pyb.LED:

class LED -- LED object
=======================

The LED object controls an individual LED (Light Emitting Diode).


Constructors
------------

.. class:: LED(id: int)

   Create an LED object associated with the given LED:

     - ``id`` is the LED number, 1-4.


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

   .. method:: off() -> None

      Turn the LED off.

   .. method:: on() -> None

      Turn the LED on, to maximum intensity.

   .. method:: toggle() -> None

      Toggle the LED between on (maximum intensity) and off.  If the LED is at
      non-zero intensity then it is considered "on" and toggle will turn it off.
