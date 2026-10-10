TV Shield
=========

The TV Shield gives the OpenMV Cam an NTSC analog video output via a VS23S010 SPI-to-NTSC video generator, driving an on-board RCA jack so you can plug a composite video display straight into the camera.

.. image:: ../tv-shield-hero.jpg
    :alt: TV Shield
    :width: 400px
    :align: center

For full datasheet, photos, and ordering see the
`TV Shield product page <https://openmv.io/products/tv-shield>`_.

Highlights
----------

* VS23S010 SPI-to-NTSC chip
* 352x240 NTSC SIF output at 60 Hz
* On-board RCA jack for composite video

Pinout
------

.. image:: ../pinout-tv-shield.png
    :alt: TV Shield Pinout
    :width: 700px

Pin reference
-------------

.. csv-table::
   :header: "Pin", "Function"
   :widths: 20, 80

   "P0",        "SPI MOSI — data to the VS23S010"
   "P2",        "SPI clock"
   "P3",        "SPI chip select"
   "3.3V rail", "Powers the VS23S010"
   "GND rail",  "Common ground (also routed to the on-board RCA jack)"

.. note::

   The NTSC video output, VIN, and GND are also broken out to
   through-hole pads on the bottom of the shield — solder wires
   there to take the wired composite video signal off the board.

Usage
-----

Drive the shield through the :doc:`TVDisplay class </library/omv.tv>`
exposed by the :doc:`display module </library/omv.display>`. Stream
camera frames out the RCA jack at 352×240 SIF::

    import csi
    import display
    import time

    csi0 = csi.CSI()
    csi0.reset()
    csi0.pixformat(csi.RGB565)
    csi0.framesize(csi.SIF)

    tv = display.TVDisplay()
    clock = time.clock()

    while True:
        clock.tick()
        tv.write(csi0.snapshot())
        print(clock.fps())
