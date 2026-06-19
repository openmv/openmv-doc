.. currentmodule:: display

class TVDisplay -- TV Shield Driver
===================================

The :class:`TVDisplay` class drives the OpenMV TV Shield, which
converts an RGB565 framebuffer into an NTSC composite video signal
(352x240, 60 fields/s interlaced) suitable for any television or
analog video monitor.

Two shield variants are supported:

- The wired **TV Shield**, which exposes the composite signal on a
  single RCA jack.
- The **Wireless TV Shield**, which feeds the same signal into a
  2.4 GHz analog video transmitter. The receiver channel (1--8) is
  selected at runtime via :meth:`ioctl` with
  :data:`display.IOCTL_CHANNEL`; until that call is made no channel
  is selected.

Resolution and framing are fixed -- :class:`TVDisplay` does not take a
``framesize`` argument. Frames are presented by passing an
:class:`image.Image` to :meth:`write`, which handles scaling, ROI,
palette and orientation transforms internally.

Example usage::

    import csi
    import display

    csi0 = csi.CSI()
    csi0.reset()
    csi0.pixformat(csi.RGB565)
    csi0.framesize(csi.SIF)              # 352x240, matches the TV output

    tv = display.TVDisplay()

    while True:
        tv.write(csi0.snapshot())

Constructors
------------

.. class:: TVDisplay(triple_buffer: bool = True)

    ``triple_buffer`` If True then makes updates to the screen non-blocking at the cost of 3X the
    display size in RAM. The default is board-dependent.

   .. method:: deinit() -> None

      Releases the I/O pins and RAM used by the class. This is called automatically on destruction.

   .. method:: width() -> int

      Returns the width of the screen (352).

   .. method:: height() -> int

      Returns the height of the screen (240).

   .. method:: refresh() -> int

      Returns the refresh rate (60).

   .. method:: triple_buffer() -> bool

      Returns if triple buffering is enabled.

   .. method:: write(image:image.Image, x:int=0, y:int=0, x_scale:float=1.0, y_scale:float=1.0, roi:Optional[Tuple[int,int,int,int]]=None, rgb_channel:int=-1, alpha:int=256, color_palette: int | "image.Image" | None = None, alpha_palette: "image.Image" | None = None, hint:int=0) -> None

      Displays an ``image`` whose top-left corner starts at location x, y.

      ``x_scale`` controls how much the displayed image is scaled by in the x direction (float). If this
      value is negative the image will be flipped horizontally.

      ``y_scale`` controls how much the displayed image is scaled by in the y direction (float). If this
      value is negative the image will be flipped vertically.

      ``roi`` is the region-of-interest rectangle tuple (x, y, w, h) of the image to display.

      ``rgb_channel`` is the RGB channel (0=R, G=1, B=2) to extract from an RGB565 image and render
      on the display.

      ``alpha`` controls how opaque the image is. A value of 256 displays an opaque image while a
      value lower than 256 produces a black transparent image. 0 results in a perfectly black image.

      ``color_palette`` if not ``-1`` can be a color palette enum or a 256 pixel in total RGB565
      image to use as a color lookup table on the grayscale value of the input image.

      ``alpha_palette`` if not ``-1`` can be a 256 pixel in total GRAYSCALE image to use as an alpha
      palette which modulates the ``alpha`` value of the input image at a per-pixel level.

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

      Clears the screen to black.

      ``display_off`` is accepted for API compatibility with other display classes and is ignored.

   .. method:: ioctl(cmd:int, *args) -> object

      Generic ioctl entry point.

      Pass `display.IOCTL_CHANNEL` as ``cmd`` to set or get the wireless TV shield broadcast channel.
      With a second argument (1-8) the channel is set; with no second argument the current channel
      is returned. No channel is selected until the first set call is made.
