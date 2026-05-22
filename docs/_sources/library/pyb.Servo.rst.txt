.. currentmodule:: pyb
.. _pyb.Servo:

class Servo -- 3-wire hobby servo driver
========================================

Servo objects control standard hobby servo motors with 3-wires (ground, power,
signal).

Example usage::

    import pyb

    s1 = pyb.Servo(1)   # create a servo object on position P7
    s2 = pyb.Servo(2)   # create a servo object on position P8

    s1.angle(45)        # move servo 1 to 45 degrees
    s2.angle(0)         # move servo 2 to 0 degrees

    # move servo1 and servo2 synchronously, taking 1500ms
    s1.angle(-60, 1500)
    s2.angle(30, 1500)

.. note:: The Servo objects use Timer(5) to produce the PWM output.  You can
   use Timer(5) for Servo control, or your own purposes, but not both at the
   same time.

Constructors
------------

.. class:: Servo(id: int)

   Create a servo object. ``id`` selects which servo channel to use; each
   channel is wired to a fixed header pin. The number of available
   channels depends on the OpenMV Cam:

   .. list-table::
      :header-rows: 1
      :widths: 32 16 52

      * - Camera
        - Channels
        - Channel → header pin
      * - OpenMV Cam M7 / H7
        - 4
        - ``Servo(1)`` → ``P7``, ``Servo(2)`` → ``P8``, ``Servo(3)`` → ``P9``, ``Servo(4)`` → ``P10``
      * - OpenMV Cam M4 / H7 Plus / Pure Thermal
        - 2
        - ``Servo(1)`` → ``P7``, ``Servo(2)`` → ``P8``

   ``pyb.Servo`` is not available on the OpenMV Cam N6.

   Methods
   -------

   .. method:: angle(angle: Optional[int] = None, time: int = 0) -> Optional[int]

      If no arguments are given, this function returns the current angle.

      If arguments are given, this function sets the angle of the servo:

        - ``angle`` is the angle to move to in degrees.
        - ``time`` is the number of milliseconds to take to get to the specified
          angle.  If omitted, then the servo moves as quickly as possible to its
          new position.

   .. method:: speed(speed: Optional[int] = None, time: int = 0) -> Optional[int]

      If no arguments are given, this function returns the current speed.

      If arguments are given, this function sets the speed of the servo:

        - ``speed`` is the speed to change to, between -100 and 100.
        - ``time`` is the number of milliseconds to take to get to the specified
          speed.  If omitted, then the servo accelerates as quickly as possible.

   .. method:: pulse_width(value: Optional[int] = None) -> Optional[int]

      If no arguments are given, this function returns the current raw pulse-width
      value.

      If an argument is given, this function sets the raw pulse-width value.

   .. method:: calibration(pulse_min: Optional[int] = None, pulse_max: Optional[int] = None, pulse_centre: Optional[int] = None, pulse_angle_90: Optional[int] = None, pulse_speed_100: Optional[int] = None) -> Optional[Tuple[int, int, int, int, int]]

      If no arguments are given, this function returns the current calibration
      data, as a 5-tuple.

      If arguments are given, this function sets the timing calibration:

        - ``pulse_min`` is the minimum allowed pulse width.
        - ``pulse_max`` is the maximum allowed pulse width.
        - ``pulse_centre`` is the pulse width corresponding to the centre/zero position.
        - ``pulse_angle_90`` is the pulse width corresponding to 90 degrees.
        - ``pulse_speed_100`` is the pulse width corresponding to a speed of 100.
