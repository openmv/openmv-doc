Thermopile Shield
=================

The Thermopile Shield gives the OpenMV Cam a 16x4 thermal-sensor array over I2C for low-resolution thermal imaging and per-pixel temperature measurement.

.. image:: ../thermopile-shield-hero.jpg
    :alt: Thermopile Shield
    :width: 400px
    :align: center

For full datasheet, photos, and ordering see the
`Thermopile Shield product page <https://openmv.io/products/thermopile-shield>`_.

Highlights
----------

* 16x4 thermal sensor array, 60 deg x 16 deg field of view
* Object temperatures from -50 C to 300 C

Pinout
------

.. image:: ../pinout-thermopile-shield.png
    :alt: Thermopile Shield Pinout
    :width: 700px

Pin reference
-------------

.. csv-table::
   :header: "Pin", "Function"
   :widths: 20, 80

   "P4",        "I²C SCL — clock to the thermopile array"
   "P5",        "I²C SDA — data to the thermopile array"
   "3.3V rail", "Powers the thermopile"
   "GND rail",  "Common ground"

Usage
-----

Capture a heat-map from the on-board thermopile array via the
:doc:`fir </library/omv.fir>` module::

    import fir
    import image
    import time

    fir.init()

    clock = time.clock()
    while True:
        clock.tick()
        try:
            img = fir.snapshot(x_scale=10, y_scale=10,
                               color_palette=image.PALETTE_IRONBOW,
                               hint=image.BICUBIC,
                               copy_to_fb=True)
        except OSError:
            continue
        print(clock.fps())

Read the raw per-pixel temperatures as a 16×4 ndarray of celsius
floats. :func:`fir.read_ir` also returns the ambient temperature and
the min/max seen in the frame::

    import fir
    import time
    from ulab import numpy as np

    fir.init()
    w = fir.width()
    h = fir.height()

    while True:
        try:
            ta, ir, to_min, to_max = fir.read_ir()
        except OSError:
            continue
        grid = np.array(ir).reshape((h, w))
        print("Ambient: %.1f C, range: %.1f to %.1f C, mean: %.1f C"
              % (ta, to_min, to_max, np.mean(grid)))
        time.sleep(1)
