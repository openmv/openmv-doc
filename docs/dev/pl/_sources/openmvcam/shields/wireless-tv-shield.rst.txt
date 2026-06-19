Wireless TV Shield
==================

The Wireless TV Shield combines a VS23S010 SPI-to-NTSC video generator with an MM213TL 5.8 GHz analog video transmitter so the OpenMV Cam can broadcast its frames to an FPV receiver.

.. image:: ../wireless-tv-shield-hero.jpg
    :alt: Wireless TV Shield
    :width: 400px
    :align: center

For full datasheet, photos, and ordering see the
`Wireless TV Shield product page <https://openmv.io/products/wireless-tv-shield>`_.

Highlights
----------

* VS23S010 SPI-to-NTSC chip
* MM213TL 5.8 GHz analog video transmitter
* 352x240 NTSC output at 60 Hz
* FPV / drone video downlink

Pinout
------

.. image:: ../pinout-wireless-tv-shield.png
    :alt: Wireless TV Shield Pinout
    :width: 700px

Pin reference
-------------

.. csv-table::
   :header: "Pin", "Function"
   :widths: 20, 80

   "P0",        "SPI MOSI — data to the VS23S010"
   "P2",        "SPI clock"
   "P3",        "SPI chip select"
   "3.3V rail", "Powers the VS23S010 and 5.8 GHz transmitter"
   "GND rail",  "Common ground (also routed to the front-edge video breakout)"

.. note::

   The NTSC video output, VIN, and GND are also broken out to
   through-hole pads on the bottom of the shield — solder wires
   there to take the wired composite video signal off the board.

Usage
-----

Drive the shield through the :doc:`TVDisplay class </library/omv.tv>`
exposed by the :doc:`display module </library/omv.display>`. Stream
camera frames over the 5.8 GHz FPV downlink — ``IOCTL_CHANNEL``
selects which of the eight Boscam channels (1–8) the transmitter
uses::

    import csi
    import display
    import time

    csi0 = csi.CSI()
    csi0.reset()
    csi0.pixformat(csi.RGB565)
    csi0.framesize(csi.SIF)

    tv = display.TVDisplay()
    tv.ioctl(display.IOCTL_CHANNEL, 8)

    clock = time.clock()
    while True:
        clock.tick()
        tv.write(csi0.snapshot())
        print(clock.fps())
