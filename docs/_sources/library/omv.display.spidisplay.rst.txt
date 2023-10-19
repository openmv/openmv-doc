.. currentmodule:: display
.. _display.SPIDisplay:

class SPIDisplay -- SPI Display Driver
======================================

The `SPIDisplay` class is used for driving SPI LCDs.

Example usage for driving the 128x160 LCD shield::

    import sensor, display

    # Setup camera.
    sensor.reset()
    sensor.set_pixformat(sensor.RGB565)
    sensor.set_framesize(sensor.LCD)
    sensor.skip_frames()
    lcd = display.SPIDisplay()

    # Show image.
    while(True):
        lcd.write(sensor.snapshot())

Constructors
------------

.. class:: SPIDisplay([width=128, [height=160, [refresh=60, [bgr=False, [byte_swap=False, [triple_buffer]]]]]])

    ``width`` SPI LCD width. By default this is 128 to match the OpenMV 128x160 LCD shield.

    ``height`` SPI LCD height. By default this is 160 to match the OpenMV 128x160 LCD shield.

    ``refresh`` Sets the LCD refresh rate in hertz. This controls the SPI LCD shield clock.

    ``bgr`` set to True to swap the red and blue channels.
    This argument allows you to use our driver with more types of displays.

    ``byte_swap`` set to True to swap RGB565 pixel bytes sent to the LCD.
    This argument allows you to use our driver with more types of displays.

    ``triple_buffer`` If True then makes updates to the screen non-blocking at the cost of 3X the
    display size in RAM. This is on by default for OpenMV Cam boards with SDRAM.

    .. note::

        Uses pins P0, P2, P3, P6, P7, and P8.

Methods
-------

.. method:: SPIDisplay.deinit()

   Releases the I/O pins and RAM used by the class. This is called automatically on destruction.

.. method:: SPIDisplay.width()

   Returns the width of the screen.

.. method:: SPIDisplay.height()

   Returns the height of the screen.

.. method:: SPIDisplay.refresh()

   Returns the refresh rate.

.. method:: SPIDisplay.bgr()

   Returns if the red and blue channels are swapped.

.. method:: SPIDisplay.byte_swap()

   Returns if the RGB565 pixels are displayed byte reversed.

.. method:: SPIDisplay.triple_buffer()

   Returns if triple buffering is enabled.

.. method:: SPIDisplay.write(image, [x=0, [y=0, [x_scale=1.0, [y_scale=1.0, [roi=None, [rgb_channel=-1, [alpha=256, [color_palette=None, [alpha_palette=None, [hint=0, [x_size=None, [y_size=None]]]]]]]]]]]])

   Displays an ``image`` whose top-left corner starts at location x, y. You may either pass x, y
   separately, as a tuple (x, y), or neither.

   ``x_scale`` controls how much the displayed image is scaled by in the x direction (float). If this
   value is negative the image will be flipped horizontally.

   ``y_scale`` controls how much the displayed image is scaled by in the y direction (float). If this
   value is negative the image will be flipped vertically.

   ``roi`` is the region-of-interest rectangle tuple (x, y, w, h) of the image to display. This
   allows you to extract just the pixels in the ROI to scale.

   ``rgb_channel`` is the RGB channel (0=R, G=1, B=2) to extract from an RGB565 image (if passed)
   and to render on the display. For example, if you pass ``rgb_channel=1`` this will
   extract the green channel of the RGB565 image and display that in grayscale.

   ``alpha`` controls how opaque the image is. A value of 256 displays an opaque image while a
   value lower than 256 produces a black transparent image. 0 results in a perfectly black image.

   ``color_palette`` if not ``-1`` can be `sensor.PALETTE_RAINBOW`, `sensor.PALETTE_IRONBOW`, or
   a 256 pixel in total RGB565 image to use as a color lookup table on the grayscale value of
   whatever the input image is. This is applied after ``rgb_channel`` extraction if used.

   ``alpha_palette`` if not ``-1`` can be a 256 pixel in total GRAYSCALE image to use as a alpha
   palette which modulates the ``alpha`` value of the input image being displayed at a pixel pixel
   level allowing you to precisely control the alpha value of pixels based on their grayscale value.
   A pixel value of 255 in the alpha lookup table is opaque which anything less than 255 becomes
   more transparent until 0. This is applied after ``rgb_channel`` extraction if used.

   ``hint`` can be a logical OR of the flags:

      * `image.AREA`: Use area scaling when downscaling versus the default of nearest neighbor.
      * `image.BILINEAR`: Use bilinear scaling versus the default of nearest neighbor scaling.
      * `image.BICUBIC`: Use bicubic scaling versus the default of nearest neighbor scaling.
      * `image.CENTER`: Center the image image being displayed on (x, y).
      * `image.EXTRACT_RGB_CHANNEL_FIRST`: Do rgb_channel extraction before scaling.
      * `image.APPLY_COLOR_PALETTE_FIRST`: Apply color palette before scaling.

   ``x_size`` may be passed if ``x_scale`` is not passed to specify the size of the image to display
   and ``x_scale`` will automatically be determined passed on the input image size. If neither
   ``y_scale`` or ``y_size`` are specified then ``y_scale`` internally will be set to be equal to
   ``x_size`` to maintain the aspect-ratio.

   ``y_size`` may be passed if ``y_scale`` is not passed to specify the size of the image to display
   and ``y_scale`` will automatically be determined passed on the input image size. If neither
   ``x_scale`` or ``x_size`` are specified then ``x_scale`` internally will be set to be equal to
   ``y_size`` to maintain the aspect-ratio.

.. method:: SPIDisplay.clear([display_off=False])

   Clears the lcd screen to black.

   ``display_off`` if True instead turns off the display logic versus clearing the frame LCD
   frame buffer to black. You should also turn off the backlight too after this to ensure the
   screen goes to black as many displays are white when only the backlight is on.

.. method:: SPIDisplay.backlight([value])

   Sets the lcd backlight dimming value. 0 (off) to 255 (on).

   In this controls the DAC on P6 to provide the dimming value. If set to 0
   P6 is pulled low and if set to 255 P6 is unitialized assuming that the SPI LCD shield's backlight
   is by default always on.

   Pass no arguments to get the state of the backlight value.
