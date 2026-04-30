.. currentmodule:: display

class RGBDisplay -- RGB Display Driver
======================================

The `RGBDisplay` class drives 24-bit parallel RGB LCDs via the LTDC controller.

Constructors
------------

.. class:: RGBDisplay(framesize:int=display.FWVGA, refresh:int=60, display_on:bool=True, triple_buffer:bool=True, portrait:bool=False, controller:Optional[object]=None, backlight:Optional[object]=None)

    ``framesize`` One of the standard supported resolutions (see the `display` module constants).

    ``refresh`` Sets the screen refresh rate in hertz (30-120). This controls the RGB LCD pixel clock.

    ``display_on`` Enables the display. Pass ``False`` when the 24-bit parallel LCD output is shared
    by multiple devices (e.g. the TFP410 chip for driving HDMI displays) to keep the display off
    while still driving the data bus.

    ``triple_buffer`` If ``True``, makes updates to the screen non-blocking at the cost of 3x the
    display size in RAM.

    ``portrait`` Swaps the framesize width and height.

    ``controller`` Pass a controller chip class instance to initialize it along with the display.

    ``backlight`` Pass a backlight controller module instance to use. By default the backlight will
    be controlled via a GPIO pin.

   .. method:: deinit() -> None

      Releases the I/O pins and RAM used by the class. This is called automatically on destruction.

   .. method:: width() -> int

      Returns the width of the screen.

   .. method:: height() -> int

      Returns the height of the screen.

   .. method:: triple_buffer() -> bool

      Returns whether triple buffering is enabled.

   .. method:: bgr() -> bool

      Returns whether the red and blue channels are swapped.

   .. method:: byte_swap() -> bool

      Returns whether the RGB565 pixel bytes are swapped on output.

   .. method:: framesize() -> int

      Returns the framesize constant the display was configured with.

   .. method:: refresh() -> int

      Returns the refresh rate.

   .. method:: clear(display_off:bool=False) -> None

      Clears the LCD screen to black.

      ``display_off`` if ``True``, turns off the display logic instead of clearing the framebuffer to
      black. You should also turn off the backlight after this to ensure the screen goes black, as
      many displays are white when only the backlight is on.

   .. method:: backlight(value:Optional[int]=None) -> int

      Sets the LCD backlight dimming value, from 0 (off) to 100 (on). Pass no arguments to get the
      current backlight value.

      Unless a `DACBacklight` or `PWMBacklight` controller was passed to the constructor, the
      backlight is controlled as a GPIO pin and will only go from 0 (off) to non-zero (on).

   .. method:: write(image:image.Image, x:int=0, y:int=0, x_scale:float=1.0, y_scale:float=1.0, roi:Optional[Tuple[int,int,int,int]]=None, rgb_channel:int=-1, alpha:int=255, color_palette:Optional[image.Image]=None, alpha_palette:Optional[image.Image]=None, hint:int=0) -> None

      Displays an ``image`` whose top-left corner starts at location ``x``, ``y``. A path string may
      also be passed instead of an image object to automatically load the image from disk.

      ``x_scale`` controls how much the displayed image is scaled by in the x direction. If this value
      is negative the image will be flipped horizontally. If ``y_scale`` is not specified it will
      match ``x_scale`` to maintain the aspect ratio.

      ``y_scale`` controls how much the displayed image is scaled by in the y direction. If this value
      is negative the image will be flipped vertically (requires triple buffering). If ``x_scale`` is
      not specified it will match ``y_scale`` to maintain the aspect ratio.

      ``roi`` is the region-of-interest rectangle tuple ``(x, y, w, h)`` of the image to display.

      ``rgb_channel`` is the RGB channel (0=R, 1=G, 2=B) to extract from an RGB565 image and render in
      grayscale. ``-1`` disables channel extraction.

      ``alpha`` controls how opaque the image is, from 0 (fully transparent / black) to 255 (opaque).

      ``color_palette`` an RGB565 image of 256 pixels total used as a color lookup table on the
      grayscale value of the input image. Applied after ``rgb_channel`` extraction. May also be a
      palette enum (e.g. `image.PALETTE_RAINBOW`).

      ``alpha_palette`` a GRAYSCALE image of 256 pixels total used as a per-pixel alpha lookup table
      on the grayscale value of the input image. Applied after ``rgb_channel`` extraction.

      ``hint`` is a logical OR of the flags:

         * `image.AREA`: Use area scaling when downscaling instead of nearest neighbor.
         * `image.BILINEAR`: Use bilinear scaling instead of nearest neighbor.
         * `image.BICUBIC`: Use bicubic scaling instead of nearest neighbor.
         * `image.CENTER`: Center the image on the display (applied after scaling).
         * `image.HMIRROR`: Horizontally mirror the image.
         * `image.VFLIP`: Vertically flip the image.
         * `image.TRANSPOSE`: Transpose the image (swap x/y).
         * `image.EXTRACT_RGB_CHANNEL_FIRST`: Do ``rgb_channel`` extraction before scaling.
         * `image.APPLY_COLOR_PALETTE_FIRST`: Apply ``color_palette`` before scaling.
         * `image.SCALE_ASPECT_KEEP`: Scale the image to fit inside the display.
         * `image.SCALE_ASPECT_EXPAND`: Scale the image to fill the display (cropping).
         * `image.SCALE_ASPECT_IGNORE`: Scale the image to fill the display (stretching).
         * `image.ROTATE_90`: Rotate by 90 degrees (``VFLIP | TRANSPOSE``).
         * `image.ROTATE_180`: Rotate by 180 degrees (``HMIRROR | VFLIP``).
         * `image.ROTATE_270`: Rotate by 270 degrees (``HMIRROR | TRANSPOSE``).
