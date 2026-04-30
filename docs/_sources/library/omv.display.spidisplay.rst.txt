.. currentmodule:: display

class SPIDisplay -- SPI Display Driver
======================================

The `SPIDisplay` class is used for driving SPI LCDs.

Constructors
------------

.. class:: SPIDisplay(width: int = 128, height: int = 160, refresh: int = 60, bgr: bool = False, byte_swap: bool = False, hmirror: bool = True, vflip: bool = True, triple_buffer: bool = ..., *, controller: Optional[object] = None, backlight: Optional[object] = None)

    ``width`` SPI LCD width in pixels (1..32767).

    ``height`` SPI LCD height in pixels (1..32767).

    ``refresh`` LCD refresh rate in hertz (1..120). Controls the SPI clock rate.

    ``bgr`` set to True to swap the red and blue channels.

    ``byte_swap`` set to True to swap RGB565 pixel bytes sent to the LCD.

    ``hmirror`` set to True to horizontally mirror the display output.

    ``vflip`` set to True to vertically flip the display output.

    ``triple_buffer`` if True makes updates to the screen non-blocking at the cost of 3X
    the display size in RAM. Default depends on the board (on for boards with SDRAM).

    ``controller`` keyword-only. Pass a controller chip class instance to initialize it
    along with the display. When provided, the controller's ``init``, ``display_on``,
    ``display_off``, and ``ram_write`` methods (if present) are invoked instead of the
    built-in commands.

    ``backlight`` keyword-only. Pass a backlight controller module to use. By default
    the backlight is controlled via a GPIO pin.

   .. method:: width() -> int

      Returns the width of the screen.

   .. method:: height() -> int

      Returns the height of the screen.

   .. method:: refresh() -> int

      Returns the refresh rate.

   .. method:: bgr() -> bool

      Returns whether the red and blue channels are swapped.

   .. method:: byte_swap() -> bool

      Returns whether RGB565 pixels are sent byte-reversed.

   .. method:: triple_buffer() -> bool

      Returns whether triple buffering is enabled.

   .. method:: framesize() -> int

      Returns the configured framesize identifier.

   .. method:: write(image: image.Image, x: int = 0, y: int = 0, x_scale: float = 1.0, y_scale: float = 1.0, roi: Optional[Tuple[int, int, int, int]] = None, rgb_channel: int = -1, alpha: int = 255, color_palette: Optional[Union[int, image.Image]] = None, alpha_palette: Optional[image.Image] = None, hint: int = 0) -> None

      Displays ``image`` with its top-left corner at ``(x, y)``. A path string may be
      passed in place of an image to load and draw it in one step.

      ``x_scale`` x-axis scale factor. Negative values flip horizontally. If ``y_scale``
      is omitted it follows ``x_scale`` to preserve aspect ratio.

      ``y_scale`` y-axis scale factor. Negative values flip vertically (requires
      ``triple_buffer=True``). If ``x_scale`` is omitted it follows ``y_scale``.

      ``roi`` region-of-interest rectangle ``(x, y, w, h)`` of the source image to draw.

      ``rgb_channel`` RGB channel to extract from an RGB565 source image (0=R, 1=G, 2=B,
      -1=all). Range: -1..2.

      ``alpha`` opacity of the image. 0 is fully transparent (black), 255 is opaque.
      Range: 0..255.

      ``color_palette`` color palette enum (e.g. `image.PALETTE_RAINBOW`) or a 256-pixel
      RGB565 image used as a color lookup table on the grayscale value of the source.
      Applied after ``rgb_channel`` extraction.

      ``alpha_palette`` 256-pixel grayscale image used as a per-pixel alpha lookup table
      modulating ``alpha`` based on source grayscale value.

      ``hint`` logical OR of the flags:

         * `image.AREA`: Use area scaling when downscaling.
         * `image.BILINEAR`: Use bilinear scaling.
         * `image.BICUBIC`: Use bicubic scaling.
         * `image.CENTER`: Center the image on the display (after scaling).
         * `image.HMIRROR`: Horizontally mirror the image.
         * `image.VFLIP`: Vertically flip the image.
         * `image.TRANSPOSE`: Transpose the image (swap x/y).
         * `image.EXTRACT_RGB_CHANNEL_FIRST`: Apply ``rgb_channel`` extraction before scaling.
         * `image.APPLY_COLOR_PALETTE_FIRST`: Apply ``color_palette`` before scaling.
         * `image.SCALE_ASPECT_KEEP`: Scale to fit inside the display.
         * `image.SCALE_ASPECT_EXPAND`: Scale to fill the display (cropping).
         * `image.SCALE_ASPECT_IGNORE`: Scale to fill the display (stretching).
         * `image.ROTATE_90`: Rotate by 90 degrees (``VFLIP | TRANSPOSE``).
         * `image.ROTATE_180`: Rotate by 180 degrees (``HMIRROR | VFLIP``).
         * `image.ROTATE_270`: Rotate by 270 degrees (``HMIRROR | TRANSPOSE``).

   .. method:: clear(display_off: bool = False) -> None

      Clears the LCD screen to black.

      ``display_off`` if True, turns off the display logic instead of clearing the
      framebuffer. The backlight should also be disabled afterwards.

   .. method:: backlight(value: Optional[int] = None) -> Optional[int]

      With ``value``, sets the backlight intensity (0=off..100=full). Without arguments,
      returns the current backlight value.

      Unless a `DACBacklight` or `PWMBacklight` controller is passed at construction,
      the backlight is driven as a GPIO pin and only goes from 0 (off) to non-zero (on).

   .. method:: bus_write(cmd: int, args: Optional[Union[int, bytes]] = None, *, dcs: bool = False) -> None

      Sends ``cmd`` to the display over the SPI bus, optionally followed by ``args``
      (an int byte or a buffer of bytes). ``dcs`` selects DCS framing when supported by
      the controller.

   .. method:: bus_read(cmd: int, len: int, args: Optional[Union[int, bytes]] = None, *, dcs: bool = False) -> bytearray

      Sends ``cmd`` over the SPI bus and reads ``len`` bytes back, returning them as a
      ``bytearray``. ``args`` is optionally written before the read (an int byte or a
      buffer of bytes). ``dcs`` selects DCS framing when supported by the controller.

   .. method:: ioctl(cmd: int, arg: Optional[object] = None) -> object

      Issues a controller-specific ioctl ``cmd`` with optional ``arg``. Raises
      ``ValueError`` if the underlying display does not support ioctl.
