Light Shield
============

The Light Shield gives the OpenMV Cam nine high-power white LEDs driven by a TPS61169 LED driver, with brightness controllable from the camera over PWM.

.. image:: ../light-shield-hero.jpg
    :alt: Light Shield
    :width: 400px
    :align: center

For full datasheet, photos, and ordering see the
`Light Shield product page <https://openmv.io/products/light-shield>`_.

Highlights
----------

* Nine high-power white LEDs
* PWM dimming control from the OpenMV Cam

Pinout
------

.. image:: ../pinout-light-shield.png
    :alt: Light Shield Pinout
    :width: 700px

Pin reference
-------------

.. csv-table::
   :header: "Pin", "Function"
   :widths: 20, 80

   "P6",        "PWM lighting control — drives the TPS61169 LED driver"
   "VIN rail",  "Powers the LEDs (from the camera's VIN pin)"
   "3.3V rail", "Powers the shield's on-board electronics"
   "GND rail",  "Common ground"

.. note::

   The shield draws LED power straight from the camera's VIN pin.
   USB does not feed VIN on any OpenMV Cam, so VIN must be supplied
   externally (battery, bench supply, or similar) — pick a source
   rated for the combined current draw of all nine LEDs at full
   brightness.

Usage
-----

PWM-dim the nine high-power LEDs through the TPS61169 driver on P6::

    from machine import Pin, PWM
    import time

    pwm = PWM(Pin("P6"), freq=50_000, duty_u16=0)

    while True:
        for i in range(101):              # ramp up
            pwm.duty_u16((i * 65535) // 100)
            time.sleep_ms(10)
        for i in range(101):              # ramp down
            pwm.duty_u16(((100 - i) * 65535) // 100)
            time.sleep_ms(10)
