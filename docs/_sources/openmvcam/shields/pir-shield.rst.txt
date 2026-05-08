PIR Shield
==========

The PIR Shield wakes the OpenMV Cam from deep sleep on motion, draws an ultra-low 6 µA in standby, and adds eight white plus eight 850 nm infrared LEDs for illumination. Ideal for battery-powered surveillance and trail cameras.

.. image:: ../pir-shield-hero.jpg
    :alt: PIR Shield
    :width: 400px
    :align: center

For full datasheet, photos, and ordering see the
`PIR Shield product page <https://openmv.io/products/pir-shield>`_.

Highlights
----------

* 6 µA standby PIR sensor for years of battery operation
* Eight 3500 K white LEDs and eight 850 nm IR LEDs (PWM-dimmable)
* 90 deg x 90 deg detection cone, up to 7 m range
* Wakes the camera from deep sleep on the P11 pin

Pinout
------

.. image:: ../pinout-pir-shield.png
    :alt: PIR Shield Pinout
    :width: 700px

Pin reference
-------------

.. csv-table::
   :header: "Pin", "Function"
   :widths: 20, 80

   "P7",        "PWM control for the white LEDs (swappable with P8 via solder bridge)"
   "P8",        "PWM control for the 850 nm IR LEDs"
   "P9",        "Wakeup (alternative — selectable via solder bridge)"
   "P11",       "Wakeup (default) — pulls low when the PIR detects motion"
   "RAW rail",  "Always-on power for the PIR sensor — keeps motion detection alive while the camera is in deep sleep"
   "3.3V rail", "Powers the shield's on-board electronics"
   "GND rail",  "Common ground"

Usage
-----

PWM-dim the white and IR illumination LEDs::

    from machine import PWM, Pin

    white = PWM(Pin("P7"), freq=50_000, duty_u16=0)
    ir = PWM(Pin("P8"), freq=50_000, duty_u16=0)

    white.duty_u16(32_768)  # 50% white
    ir.duty_u16(16_384)  # 25% IR

Wake the camera from deep sleep on motion. P11 (the default wakeup
line) pulls low when the PIR triggers::

    from machine import Pin, deepsleep

    Pin("P11", Pin.IN, Pin.PULL_UP).irq(trigger=Pin.IRQ_FALLING, wake=4)
    deepsleep()  # the next motion event resets the camera

.. warning::

   This page is under construction.
