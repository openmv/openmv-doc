.. currentmodule:: display

class DSIDisplay -- DSI Display Driver
======================================

The `DSIDisplay` class is used for driving MIPI DSI LCDs.

Constructors
------------

.. class:: DSIDisplay(framesize:int=FWVGA, *, refresh:int=60, display_on:bool=True, triple_buffer:bool=True, portrait:bool=False, channel:int=0, controller: Any | None=None, backlight: Any | None=None)

    ``framesize`` One of the standard supported resolutions (e.g. `display.FWVGA`).

    ``refresh`` Sets the screen refresh rate in hertz. Valid range is 30 to 120. This controls the DSI LCD clock.

    ``display_on`` Enables the display.

    ``triple_buffer`` Allocates three framebuffers to allow tear-free display updates. Required for vertical
    flipping in `write()`.

    ``portrait`` Swap the framesize width and height.

    ``channel`` The virtual MIPI DSI channel to use to talk to the display.

    ``controller`` Pass the controller chip class here to initialize it along with the display. E.g.
    `display.ST7701()` which is a standard display controller for MIPI DSI displays.

    ``backlight`` Specify a backlight controller module to use. By default the backlight will be
    controlled via a GPIO pin.

   .. method:: deinit() -> None

      Releases the I/O pins and RAM used by the class. This is called automatically on destruction.

   .. method:: width() -> int

      Returns the width of the screen.

   .. method:: height() -> int

      Returns the height of the screen.

   .. method:: triple_buffer() -> int

      Returns whether triple buffering is enabled.

   .. method:: bgr() -> int

      Returns whether the display expects BGR ordered pixels.

   .. method:: byte_swap() -> int

      Returns whether the display expects byte-swapped pixels.

   .. method:: framesize() -> int

      Returns the framesize constant the display was initialized with.

   .. method:: refresh() -> int

      Returns the refresh rate in hertz.

   .. method:: write(image:image.Image, x:int=0, y:int=0, x_scale:float=1.0, y_scale:float=1.0, roi:Optional[Tuple[int,int,int,int]]=None, rgb_channel:int=-1, alpha:int=255, color_palette:Optional[image.Image]=None, alpha_palette:Optional[image.Image]=None, hint:int=0) -> None

      Displays an ``image`` whose top-left corner starts at location ``x``, ``y``.

      ``image`` may be a path string instead of an image object to automatically load the image from
      disk. E.g. ``write("test.jpg")``.

      ``x_scale`` controls how much the displayed image is scaled by in the x direction (float). If this
      value is negative the image will be flipped horizontally. If ``y_scale`` is not specified then it
      will match ``x_scale`` to maintain the aspect ratio.

      ``y_scale`` controls how much the displayed image is scaled by in the y direction (float). If this
      value is negative the image will be flipped vertically. Vertical flip requires
      ``triple_buffer=True``. If ``x_scale`` is not specified then it will match ``y_scale``.

      ``roi`` is the region-of-interest rectangle tuple (x, y, w, h) of the image to display.

      ``rgb_channel`` is the RGB channel (0=R, 1=G, 2=B) to extract from an RGB565 image and render on
      the display in grayscale. ``-1`` disables extraction. Valid range is -1 to 2.

      ``alpha`` controls how opaque the image is. 255 displays an opaque image, lower values blend
      toward black, and 0 produces a fully black image. Valid range is 0 to 255.

      ``color_palette`` may be a color palette enum or a 256 pixel RGB565 image to use as a color
      lookup table on the grayscale value of the input image. Applied after ``rgb_channel`` extraction.

      ``alpha_palette`` may be a 256 pixel grayscale image used as an alpha lookup table that
      modulates ``alpha`` per input pixel grayscale value. Applied after ``rgb_channel`` extraction.

      ``hint`` is a logical OR of the flags:

         * `image.AREA`: Use area scaling when downscaling versus the default of nearest neighbor.
         * `image.BILINEAR`: Use bilinear scaling versus the default of nearest neighbor scaling.
         * `image.BICUBIC`: Use bicubic scaling versus the default of nearest neighbor scaling.
         * `image.CENTER`: Center the image being drawn on the display. This is applied after scaling.
         * `image.HMIRROR`: Horizontally mirror the image.
         * `image.VFLIP`: Vertically flip the image.
         * `image.TRANSPOSE`: Transpose the image (swap x/y).
         * `image.EXTRACT_RGB_CHANNEL_FIRST`: Do rgb_channel extraction before scaling.
         * `image.APPLY_COLOR_PALETTE_FIRST`: Apply color palette before scaling.
         * `image.SCALE_ASPECT_KEEP`: Scale the image being drawn to fit inside the display.
         * `image.SCALE_ASPECT_EXPAND`: Scale the image being drawn to fill the display (results in cropping).
         * `image.SCALE_ASPECT_IGNORE`: Scale the image being drawn to fill the display (results in stretching).
         * `image.ROTATE_90`: Rotate the image by 90 degrees (this is just VFLIP | TRANSPOSE).
         * `image.ROTATE_180`: Rotate the image by 180 degrees (this is just HMIRROR | VFLIP).
         * `image.ROTATE_270`: Rotate the image by 270 degrees (this is just HMIRROR | TRANSPOSE).

   .. method:: clear(display_off:bool=False) -> None

      Clears the LCD framebuffer to black.

      ``display_off`` if True turns off the display logic instead of clearing the framebuffer.

   .. method:: backlight(value:Optional[int]=None) -> int

      Sets the LCD backlight dimming value, 0 (off) to 100 (on). Pass no arguments to get the
      current backlight value.

      Unless a `DACBacklight` or `PWMBacklight` controller is passed to the constructor, the
      backlight is controlled as a GPIO pin and will only go from 0 (off) to non-zero (on).

   .. method:: bus_write(cmd:int, args: int | bytes | None = None, *, dcs:bool=False) -> None

      Send DSI command ``cmd`` to the display.

      ``args`` is an optional integer or buffer containing command parameters.

      ``dcs`` if True sends the command as a DCS (Display Command Set) packet.

   .. method:: bus_read(cmd:int, len:int, args: int | bytes | None = None, *, dcs:bool=False) -> bytes

      Read ``len`` bytes from the display using DSI command ``cmd``.

      ``args`` is an optional integer or buffer containing command parameters.

      ``dcs`` if True sends the command as a DCS (Display Command Set) packet.

   .. method:: ioctl(cmd:int, arg: Any | None = None) -> Any

      Send a driver-specific ioctl ``cmd`` with optional ``arg`` to the display. Raises ``ValueError``
      if the display does not support ioctl.
