FLIR Boson Adapter
==================

The FLIR Boson Adapter Module connects FLIR Boson and Boson+ thermal cores to the OpenMV Cam (sold separately). Use it for higher-resolution thermal imaging than the Lepton family.

.. image:: ../flir-boson-hero.jpg
    :alt: FLIR Boson Adapter
    :width: 400px
    :align: center

For full datasheet, photos, and ordering see the
`FLIR Boson Adapter product page <https://openmv.io/products/flir-boson-adapter-module>`_.

.. note::

   Supported on the OpenMV N6, RT1062, and H7 Plus.

Highlights
----------

* Compatible with FLIR Boson and Boson+ thermal cores (sold separately)
* Higher resolution than the Lepton family for finer thermal detail

Usage
-----

Drive the Boson through `csi.CSI`. Set the framesize to match
the module you have: `csi.QVGA` (320x256) for the 320 module or
`csi.VGA` (640x512) for the 640 module::

    import csi
    import time

    csi0 = csi.CSI()
    csi0.reset()
    csi0.pixformat(csi.GRAYSCALE)
    csi0.framesize(csi.QVGA)  # csi.VGA for the 640 module
    clock = time.clock()

    while True:
        clock.tick()
        img = csi0.snapshot()
        print(clock.fps())

To get colorized frames straight from the sensor, switch the
pixformat to `csi.RGB565` and set `csi.CSI.color_palette` to
`image.PALETTE_IRONBOW` — the driver emits RGB565 frames with the
palette applied, so ``snapshot()`` returns ironbow-colored frames
directly::

    csi0.pixformat(csi.RGB565)
    csi0.color_palette(image.PALETTE_IRONBOW)

.. note::

   The FLIR Boson does not support temperature measurement at
   this time.
