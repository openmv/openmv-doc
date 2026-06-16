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

   "P7",        "PWM control for the white LEDs"
   "P8",        "PWM control for the 850 nm IR LEDs"
   "P9",        "Wakeup (alternative)"
   "P11",       "Wakeup (default) — pulls low when the PIR detects motion"
   "RAW rail",  "Always-on power for the PIR sensor — keeps motion detection alive while the camera is in deep sleep"
   "3.3V rail", "Powers the shield's on-board electronics"
   "GND rail",  "Common ground"

.. note::

   Each of P7, P8, P9, and P11 can be reclaimed for unrelated use.
   P7, P8, and P11 are connected by default through back-side solder
   jumpers — open the jumper on any pin you want to free. P9 defaults
   to disconnected: bridge its back-side jumper to route the wakeup
   signal to P9 instead (and open P11's back-side jumper to release
   P11).

.. note::

   P11 is the wakeup pin on all modern OpenMV Cams — leave the shield
   on its default mapping for ``deepsleep()`` motion wake. The P9
   alternative exists for legacy OpenMV Cams, which don't have a
   dedicated wakeup line — P9 lands on a regular GPIO that you'd
   poll or attach an IRQ to instead.

Usage
-----

PWM-dim the white and IR illumination LEDs::

    from machine import PWM, Pin

    white = PWM(Pin("P7"), freq=50_000, duty_u16=0)
    ir = PWM(Pin("P8"), freq=50_000, duty_u16=0)

    white.duty_u16(32_768)  # 50% white
    ir.duty_u16(16_384)  # 25% IR

Wake the camera from deep sleep on motion. P11 (the default wakeup
line) pulls low when the PIR triggers and resets the camera::

    from machine import deepsleep

    deepsleep()  # the next motion event resets the camera
