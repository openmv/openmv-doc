Servo control
=============

A hobby (RC) servo is a small geared motor in a sealed case
with closed-loop position control built in. Inside the case
sits a DC motor, a reduction gearbox, a potentiometer
connected to the output shaft, and a small driver board that
compares the pot's reading against a setpoint coming in from
outside. The driver runs the motor in whichever direction
reduces the error, and stops when the position matches. From
the camera's side none of that is visible -- you just tell
the servo where to go.

The PWM signal
--------------

A servo takes its setpoint as a PWM signal at a fixed 50 Hz
frame rate, where the *pulse width* selects the position:

* A 1.0 ms pulse drives the shaft to one end of its travel.
* A 1.5 ms pulse parks the shaft at the centre.
* A 2.0 ms pulse drives the shaft to the other end.

Anything in between maps to an intermediate position.

.. figure:: ../figures/servo-pulse-timing.svg
   :alt: Three rows of square-wave traces stacked vertically.
         Each row shows one 20 ms period of a 50 Hz PWM with a
         narrow high pulse at the start: 1.0 ms in the top row,
         1.5 ms in the middle, 2.0 ms in the bottom.

   The servo's PWM frame is 20 ms long; the pulse width
   (1.0 -- 2.0 ms) selects the position.

Unlike LEDs and motors, the servo does not *average* the PWM.
The pulse width itself is the command: the servo's internal
logic measures each pulse, sets its target accordingly, and
runs the motor until the output matches. The duty cycle as a
fraction (between 5 % and 10 % across the full range) is
incidental -- it is the absolute pulse width that matters,
which is what software needs to control.

Wiring
------

Hobby servos use a three-wire connector:

* **Power** (commonly red): the servo's own supply,
  typically 4.8 V to 6 V. Do not power the servo from the
  camera's 3.3 V rail -- it cannot supply the stall current,
  and the rail will brown out.
* **Ground** (commonly black or brown): the return path for
  the servo's power, tied to the camera's ground so the signal
  also has a shared reference.
* **Signal** (commonly white, yellow, or orange): the PWM line
  from the camera's GPIO.

Code
----

:meth:`~machine.PWM.duty_u16` would work, but it sets the duty
as a fraction of the period -- awkward for a signal where the
absolute pulse width is what matters and the period is fixed.
:meth:`~machine.PWM.duty_ns` sets the pulse width directly in
nanoseconds:

::

    from machine import PWM, Pin

    servo = PWM(Pin("P7"), freq=50, duty_ns=1_500_000)  # centre

The carrier is 50 Hz (20 ms period); the high time on each
cycle is exactly 1500 µs. A small helper makes the
position-to-pulse mapping explicit:

::

    def set_position(angle):
        # angle: 0..180 degrees mapped to 1.0..2.0 ms
        pulse_us = 1000 + (angle * 1000) // 180
        servo.duty_ns(pulse_us * 1000)

    set_position(0)      # full one way
    set_position(90)     # centre
    set_position(180)    # full the other way

A slow sweep across the range:

::

    import time

    for angle in range(0, 181, 5):
        set_position(angle)
        time.sleep_ms(20)
    for angle in range(180, -1, -5):
        set_position(angle)
        time.sleep_ms(20)

The 1.0 -- 2.0 ms range is the standard, but many servos
accept a wider range (often 500 µs to 2500 µs) for full
travel. The servo's data sheet lists the exact pulse-width
limits; numbers outside that range can slam the motor into its
mechanical stops.

For a servo with a non-standard range, lift the limits into
constants and parameterize the mapping:

::

    PULSE_MIN_US = 500     # full one way (from the data sheet)
    PULSE_MAX_US = 2500    # full the other way

    def set_position(angle):
        span_us = PULSE_MAX_US - PULSE_MIN_US
        pulse_us = PULSE_MIN_US + (angle * span_us) // 180
        servo.duty_ns(pulse_us * 1000)
