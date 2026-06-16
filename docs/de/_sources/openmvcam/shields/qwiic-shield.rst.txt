QWIIC Shield
============

The QWIIC Shield gives the OpenMV Cam two daisy-chainable Qwiic (JST-SH 4-pin) connectors wired to its I2C pins, so SparkFun Qwiic ecosystem boards can plug straight in.

.. image:: ../qwiic-shield-hero.jpg
    :alt: QWIIC Shield
    :width: 400px
    :align: center

For full datasheet, photos, and ordering see the
`QWIIC Shield product page <https://openmv.io/products/qwiic-shield>`_.

Highlights
----------

* Two Qwiic JST-SH connectors for daisy-chaining I2C peripherals
* Routes the OpenMV Cam's P4 (SCL) and P5 (SDA) pins
* Compatible with the SparkFun Qwiic ecosystem
* No on-board pull-ups (use software pull-ups or external)

Pinout
------

.. image:: ../pinout-qwiic-shield.png
    :alt: QWIIC Shield Pinout
    :width: 700px

Pin reference
-------------

.. csv-table::
   :header: "Pin", "Function"
   :widths: 20, 80

   "P4",        "Qwiic SCL — I²C clock to both Qwiic connectors"
   "P5",        "Qwiic SDA — I²C data to both Qwiic connectors"
   "3.3V rail", "Powers connected Qwiic devices"
   "GND rail",  "Common ground (also routed to both Qwiic connectors)"

Usage
-----

Scan for connected Qwiic devices on the I²C bus. The shield does not
fit pull-up resistors on board — enable internal pull-ups in
software, or rely on pull-ups built into the connected Qwiic boards::

    from machine import Pin, SoftI2C

    bus = SoftI2C(scl=Pin("P4", Pin.OPEN_DRAIN, Pin.PULL_UP),
                  sda=Pin("P5", Pin.OPEN_DRAIN, Pin.PULL_UP),
                  freq=100_000)

    print("Qwiic devices:", [hex(addr) for addr in bus.scan()])
