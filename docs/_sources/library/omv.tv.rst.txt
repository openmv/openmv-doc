.. currentmodule:: display

class TVDisplay -- TV Shield Driver
===================================

The `TVDisplay` class is used for driving the TV shield (NTSC analog video output, 352x240).

Example usage::

    import csi, display

    # Setup camera.
    csi0 = csi.CSI()
    csi0.reset()
    csi0.pixformat(csi.RGB565)
    csi0.framesize(csi.SIF)
    csi0.snapshot(time=2000)
    tv = display.TVDisplay()

    # Show image.
    while(True):
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

      ``hint`` can be a logical OR of the flags defined in the `image` module (e.g. `image.BILINEAR`,
      `image.CENTER`, `image.SCALE_ASPECT_KEEP`, etc.). See `display.SPIDisplay.write` for the full list.

   .. method:: clear(display_off: bool = False) -> None

      Clears the screen to black.

      ``display_off`` is accepted for API compatibility with other display classes and is ignored.

   .. method:: ioctl(cmd:int, *args) -> object

      Generic ioctl entry point.

      Pass `display.IOCTL_CHANNEL` as ``cmd`` to set or get the wireless TV shield broadcast channel.
      With a second argument (1-8) the channel is set; with no second argument the current channel
      is returned. The default is channel 8.
