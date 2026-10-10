Proto Shield
============

The Proto Shield gives the OpenMV Cam a 10x10 through-hole prototyping area with 3.3 V and GND rails tied to the camera, plus broken-out I/O pins for soldering on custom circuits.

.. image:: ../proto-shield-hero.jpg
    :alt: Proto Shield
    :width: 400px
    :align: center

For full datasheet, photos, and ordering see the
`Proto Shield product page <https://openmv.io/products/proto-shield>`_.

Highlights
----------

* 10x10 through-hole prototyping grid
* 3.3 V and GND power rails tied to the OpenMV Cam
* Broken-out OpenMV Cam I/O pins
* Solder on accelerometers, sensors, or LED circuits

Pinout
------

.. image:: ../pinout-proto-shield.png
    :alt: Proto Shield Pinout
    :width: 700px

Every header pin is broken out unconnected to the prototyping grid
for the user to wire as they like. The 3.3 V and GND rails are tied
through to the camera so soldered-on circuits can be powered directly.

Usage
-----

Whatever you wire to the prototyping grid is driven through whichever
peripheral API fits — GPIO, PWM, ADC, I²C, SPI, UART, and so on. As a
simple example, blink an LED soldered to one of the broken-out I/O
pads::

    from machine import Pin
    import time

    led = Pin("P0", Pin.OUT)
    while True:
        led.on()
        time.sleep_ms(500)
        led.off()
        time.sleep_ms(500)
