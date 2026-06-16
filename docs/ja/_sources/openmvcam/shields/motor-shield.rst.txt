Motor Shield
============

The Motor Shield drives two DC motors from the OpenMV Cam using a TB6612FNG dual H-bridge, with an NCP1117 5 V linear regulator that powers both the camera and the motors from a single 6.5–18 V battery input.

.. image:: ../motor-shield-hero.jpg
    :alt: Motor Shield
    :width: 400px
    :align: center

For full datasheet, photos, and ordering see the
`Motor Shield product page <https://openmv.io/products/motor-shield>`_.

Highlights
----------

* Two independent motor channels with PWM speed control
* Up to 2 A drive current per channel
* Can also drive a bipolar stepper motor
* Stacks with the Servo Shield

Pinout
------

.. image:: ../pinout-motor-shield.png
    :alt: Motor Shield Pinout
    :width: 700px

Pin reference
-------------

.. csv-table::
   :header: "Pin", "Function"
   :widths: 20, 80

   "P0",         "DIR B1 (motor B direction)"
   "P1",         "DIR B0 (motor B direction)"
   "P2",         "DIR A1 (motor A direction)"
   "P3",         "DIR A0 (motor A direction)"
   "P6",         "TB6612FNG STANDBY — defaults on; pull low to enter low-power mode"
   "P7",         "PWM speed input for motor A"
   "P8",         "PWM speed input for motor B"
   "VBAT in",    "6.5–18 V battery input on the screw terminal (NCP1117 limits)"
   "VIN out",    "5 V from the on-board NCP1117 regulator (powers the camera)"
   "3.3V rail",  "Powers the TB6612FNG logic"
   "GND rail",   "Common ground"

.. note::

   P6 drives the TB6612 STANDBY input by default. Cut the solder
   trace on the back of the shield to disconnect P6 if you'd rather
   use the pin for something else (the driver then stays enabled).

.. note::

   The TB6612FNG drives each motor through a two-input truth table
   plus a PWM enable. For motor A (with STBY high and PWMA at any
   non-zero duty):

   * ``(P3, P2) = (H, L)`` → forward
   * ``(P3, P2) = (L, H)`` → reverse
   * ``(P3, P2) = (L, L)`` → coast (outputs Hi-Z)
   * ``(P3, P2) = (H, H)`` → brake (outputs both low)

   Driving PWMA low forces a short brake regardless of the direction
   inputs — a 0 % duty cycle brakes the motor. Motor B follows the
   same table on ``(P1, P0)`` with PWM on P8.

Usage
-----

Cycle motor A through forward → brake → reverse → coast on a fixed
PWM duty::

    from machine import Pin, PWM
    import time

    a0 = Pin("P3", Pin.OUT)  # AIN1
    a1 = Pin("P2", Pin.OUT)  # AIN2
    pwma = PWM(Pin("P7"), freq=1_000, duty_u16=40_000)  # ~60%


    def drive(in1, in2):
        a0.value(in1)
        a1.value(in2)


    while True:
        drive(1, 0)         # forward
        time.sleep(2)
        drive(1, 1)         # brake
        time.sleep_ms(500)
        drive(0, 1)         # reverse
        time.sleep(2)
        drive(0, 0)         # coast
        time.sleep_ms(500)

For variable-speed control, hold the direction inputs constant and
ramp PWMA. The loop below ramps motor A from coast up to full
forward and back down::

    from machine import Pin, PWM
    import time

    Pin("P3", Pin.OUT, value=1)  # AIN1=H
    Pin("P2", Pin.OUT, value=0)  # AIN2=L → forward direction
    pwma = PWM(Pin("P7"), freq=1_000, duty_u16=0)

    while True:
        for duty in range(0, 65_536, 1024):
            pwma.duty_u16(duty)
            time.sleep_ms(10)
        for duty in range(65_535, -1, -1024):
            pwma.duty_u16(duty)
            time.sleep_ms(10)

The TB6612's two H-bridges can also wave-drive a bipolar stepper —
energize one coil at a time, walking through four phases. Hold both
PWM channels at the desired drive current and call ``step()`` to
advance one full sequence in either direction::

    from machine import Pin, PWM
    import time

    a0 = Pin("P3", Pin.OUT)
    a1 = Pin("P2", Pin.OUT)
    b0 = Pin("P1", Pin.OUT)
    b1 = Pin("P0", Pin.OUT)
    PWM(Pin("P7"), freq=1_000, duty_u16=32_768)  # 50% drive on A
    PWM(Pin("P8"), freq=1_000, duty_u16=32_768)  # 50% drive on B

    SEQUENCE = [(1, 0, 0, 0), (0, 0, 1, 0), (0, 1, 0, 0), (0, 0, 0, 1)]


    def step(forward=True):
        for s in SEQUENCE if forward else reversed(SEQUENCE):
            a0.value(s[0])
            a1.value(s[1])
            b0.value(s[2])
            b1.value(s[3])
            time.sleep_ms(5)


    while True:
        for _ in range(50):  # ~1 revolution forward (200 phases)
            step()
        for _ in range(50):  # ~1 revolution backward
            step(forward=False)

The on-board STANDBY line defaults high (driver enabled). Pull P6 low
to put the TB6612 to sleep::

    from machine import Pin
    Pin("P6", Pin.OUT).value(0)  # standby
