Battery Shield
==============

The Battery Shield powers OpenMV Cams from a 1.8-5.5 V source through a 2.1 mm DC barrel jack, making it ideal for alkaline-battery deployments. It also accepts a wide 6-36 V input with reverse-voltage protection.

.. image:: ../battery-shield-hero.jpg
    :alt: Battery Shield
    :width: 400px
    :align: center

For full datasheet, photos, and ordering see the
`Battery Shield product page <https://openmv.io/products/battery-shield>`_.

Highlights
----------

* 1.8-5.5 V DC barrel jack input for battery deployments
* 6-36 V wide input with reverse-voltage and surge protection
* 0-6 V ADC input on P6 for battery-voltage monitoring
* Up to 800 mA draw from the battery input

Pinout
------

.. image:: ../pinout-battery-shield.png
    :alt: Battery Shield Pinout
    :width: 700px

Pin reference
-------------

.. csv-table::
   :header: "Pin", "Function"
   :widths: 20, 80

   "P6",        "0–6 V ADC input (level-shifted to 0–2.8 V on P6) for battery-voltage monitoring"
   "BARREL in", "1.8–5.5 V battery input on the DC barrel jack"
   "PWR in",    "6–36 V wide input on the terminal block (reverse-voltage tolerant)"
   "RAW out",   "3.5 V at up to 800 mA — direct from the barrel jack"
   "VIN out",   "5.6 V at up to 600 mA — regulated from the wide input via OR'ing diode"
   "3.3V rail", "Powers the shield's on-board electronics"
   "GND rail",  "Common ground"

.. note::

   The battery-monitor tap on P6 can be disconnected via the on-board
   solder bridge if you'd rather use the pin for something else.

Usage
-----

Read the attached battery's voltage on P6 (the shield level-shifts
0–6 V down to 0–2.8 V before driving the pin)::

    from machine import ADC
    import time

    bat = ADC("P6")

    while True:
        # 0–6 V on the input scaled to 0–2.8 V on P6
        v = bat.read_u16() * 2.8 / 65535
        print("Battery:", v * (6.0 / 2.8), "V")
        time.sleep_ms(500)

.. warning::

   This page is under construction.
