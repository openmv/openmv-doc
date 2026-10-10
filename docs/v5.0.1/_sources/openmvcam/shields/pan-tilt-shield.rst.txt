Pan and Tilt Shield
===================

The Pan and Tilt Shield gives the OpenMV Cam three servo channels with an NCP1117 5 V linear regulator that powers both the camera and the servos from a single 6.5–18 V battery input.

.. image:: ../pan-tilt-shield-hero.jpg
    :alt: Pan and Tilt Shield
    :width: 400px
    :align: center

For full datasheet, photos, and ordering see the
`Pan and Tilt Shield product page <https://openmv.io/products/pan-and-tilt-shield>`_.

Highlights
----------

* Three independent servo channels
* Stacks with the Servo Shield

Pinout
------

.. image:: ../pinout-pan-tilt-shield.png
    :alt: Pan and Tilt Shield Pinout
    :width: 700px

Pin reference
-------------

.. csv-table::
   :header: "Pin", "Function"
   :widths: 20, 80

   "P7",        "Servo 0 (S0)"
   "P8",        "Servo 1 (S1)"
   "P9",        "Servo 2 (S2)"
   "VBAT in",   "6.5–18 V battery input on the screw terminal (NCP1117 limits)"
   "VIN out",   "5 V regulated from the on-board NCP1117 — powers both the camera and the servo rail"
   "GND rail",  "Servo and camera common ground"

Usage
-----

Drive the three servo channels with 50 Hz PWM. The pulse-width range
varies between servos, so tune ``MIN_US`` and ``MAX_US`` to match
yours — typical values are around 1000–2000 µs::

    from machine import Pin, PWM
    import time

    MIN_US = 1000  # full-left pulse width (microseconds)
    MAX_US = 2000  # full-right pulse width

    pan = PWM(Pin("P7"), freq=50)  # S0
    tilt = PWM(Pin("P8"), freq=50)  # S1
    aux = PWM(Pin("P9"), freq=50)  # S2

    def angle(servo, deg):
        pulse_us = MIN_US + (deg * (MAX_US - MIN_US)) // 180
        servo.duty_ns(pulse_us * 1000)

    while True:
        angle(pan, 0)
        angle(tilt, 90)
        time.sleep(1)
        angle(pan, 180)
        angle(tilt, 45)
        time.sleep(1)
