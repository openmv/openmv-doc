:mod:`fir` --- thermal sensor driver (fir == far infrared)
==========================================================

.. module:: fir
   :synopsis: thermal sensor driver (fir == far infrared)

The ``fir`` module is used for controlling the thermal sensors.

Example usage::

    import csi, fir

    # Setup camera.
    csi0 = csi.CSI()
    csi0.reset()
    csi0.pixformat(csi.RGB565)
    csi0.framesize(csi.QVGA)
    csi0.snapshot(time=2000)
    fir.init()

    # Show image.
    while(True):
        img = csi0.snapshot()
        ta, ir, to_min, to_max = fir.read_ir()
        fir.draw_ir(img, ir)
        print("====================")
        print("Ambient temperature: %0.2f" % ta)
        print("Min temperature seen: %0.2f" % to_min)
        print("Max temperature seen: %0.2f" % to_max)

Functions
---------

.. function:: init(type:int=-1, refresh:Optional[int]=None, resolution:Optional[int]=None) -> None

   Initializes an attached thermal sensor.

   ``type`` indicates the type of thermal sensor:

      * `fir.FIR_SHIELD`: 16x4 pixels (MLX90621).
      * `fir.FIR_MLX90621`: 16x4 pixels.
      * `fir.FIR_MLX90640`: 32x24 pixels.
      * `fir.FIR_MLX90641`: 16x12 pixels.
      * `fir.FIR_AMG8833`: 8x8 pixels.

   By default ``type`` is ``-1`` which causes `fir.init()` to automatically scan and initialize an
   attached thermal sensor based on its I2C address. Note that `fir.FIR_MLX90640` and
   `fir.FIR_MLX90641` share the same I2C address so you must pass `fir.FIR_MLX90641` to ``type``
   to initialize it specifically.

   ``refresh`` is the thermal sensor refresh rate in Hz:

      * `fir.FIR_MLX90621`: Defaults to 64 Hz. Can be 1, 2, 4, 8, 16, 32, 64, 128, 256, or 512 Hz.
      * `fir.FIR_MLX90640`: Defaults to 32 Hz. Can be 1, 2, 4, 8, 16, 32, or 64 Hz.
      * `fir.FIR_MLX90641`: Defaults to 32 Hz. Can be 1, 2, 4, 8, 16, 32, or 64 Hz.
      * `fir.FIR_AMG8833`: Fixed at 10 Hz.

   A higher refresh rate lowers the accuracy and vice-versa.

   ``resolution`` is the thermal sensor measurement resolution in bits:

      * `fir.FIR_MLX90621`: Defaults to 18. Can be 15, 16, 17, or 18.
      * `fir.FIR_MLX90640`: Defaults to 19. Can be 16, 17, 18, or 19.
      * `fir.FIR_MLX90641`: Defaults to 19. Can be 16, 17, 18, or 19.
      * `fir.FIR_AMG8833`: Fixed at 12.

   A higher resolution lowers the maximum temperature range and vice-versa.

.. function:: deinit() -> None

   Deinitializes the thermal sensor and frees up resources.

.. function:: width() -> int

   Returns the horizontal resolution (in pixels) of the thermal sensor in-use.

.. function:: height() -> int

   Returns the vertical resolution (in pixels) of the thermal sensor in-use.

.. function:: type() -> int

   Returns the type of the thermal sensor in-use. One of `fir.FIR_MLX90621`,
   `fir.FIR_MLX90640`, `fir.FIR_MLX90641`, or `fir.FIR_AMG8833`.

.. function:: refresh() -> int

   Returns the current refresh rate (Hz) set during the `fir.init()` call.

.. function:: resolution() -> int

   Returns the current resolution (bits) set during the `fir.init()` call.

.. function:: read_ta() -> float

   Returns the ambient temperature (i.e. sensor temperature) in celsius as a float.

.. function:: read_ir(hmirror:bool=False, vflip:bool=False, transpose:bool=False, timeout:int=-1) -> Tuple[float, List[float], float, float]

   Returns a 4-tuple ``(ta, ir, to_min, to_max)`` containing the ambient temperature, a flat
   ``width * height`` list of float temperatures, the minimum temperature seen, and the maximum
   temperature seen. All values are in celsius.

   ``hmirror`` if True horizontally mirrors the ``ir`` array.

   ``vflip`` if True vertically flips the ``ir`` array.

   ``transpose`` if True transposes the ``ir`` array (swaps width and height).

   ``timeout`` if not -1, the number of milliseconds to wait for a new frame.

.. function:: draw_ir(image:image.Image, ir:List[float], x:int=0, y:int=0, x_scale:Optional[float]=None, y_scale:Optional[float]=None, roi:Optional[Tuple[int,int,int,int]]=None, rgb_channel:int=-1, alpha:int=255, color_palette:Optional[int]=image.PALETTE_RAINBOW, alpha_palette:Optional[int]=None, hint:int=0, scale:Optional[Tuple[float,float]]=None) -> None

   Draws the ``ir`` array onto ``image`` with its top-left corner at ``(x, y)``.

   ``ir`` is the flat ``width * height`` temperature list returned by `fir.read_ir()`.

   ``x_scale`` controls how much the rendered image is scaled in the x direction. A negative value
   flips horizontally. If unspecified, matches ``y_scale`` to maintain aspect ratio.

   ``y_scale`` controls how much the rendered image is scaled in the y direction. A negative value
   flips vertically. If unspecified, matches ``x_scale`` to maintain aspect ratio.

   ``roi`` is the region-of-interest rectangle ``(x, y, w, h)`` of the source IR data to draw.

   ``rgb_channel`` is the RGB channel (0=R, 1=G, 2=B) to render onto the destination image when the
   destination is RGB565. ``-1`` (default) renders all channels.

   ``alpha`` controls how much of the source image to blend into the destination (0-255). 255 is
   fully opaque; 0 results in no modification.

   ``color_palette`` is a color palette enum (e.g. `image.PALETTE_RAINBOW`, `image.PALETTE_IRONBOW`)
   or a 256-pixel RGB565 image used as a lookup table on the grayscale source value.

   ``alpha_palette`` is a 256-pixel GRAYSCALE image used as an alpha lookup table that modulates
   ``alpha`` per source pixel value.

   ``hint`` is a logical OR of:

      * `image.AREA`: Use area scaling when downscaling.
      * `image.BILINEAR`: Use bilinear scaling.
      * `image.BICUBIC`: Use bicubic scaling.
      * `image.CENTER`: Center the image on the destination.
      * `image.HMIRROR`: Horizontally mirror.
      * `image.VFLIP`: Vertically flip.
      * `image.TRANSPOSE`: Transpose (swap x/y).
      * `image.EXTRACT_RGB_CHANNEL_FIRST`: Apply rgb_channel extraction before scaling.
      * `image.APPLY_COLOR_PALETTE_FIRST`: Apply color palette before scaling.
      * `image.SCALE_ASPECT_KEEP`: Fit inside the destination keeping aspect ratio.
      * `image.SCALE_ASPECT_EXPAND`: Fill the destination keeping aspect ratio (crops).
      * `image.SCALE_ASPECT_IGNORE`: Fill the destination ignoring aspect ratio (stretches).
      * `image.ROTATE_90`: Rotate by 90 degrees.
      * `image.ROTATE_180`: Rotate by 180 degrees.
      * `image.ROTATE_270`: Rotate by 270 degrees.

   ``scale`` is a 2-tuple ``(min, max)`` controlling the min/max temperature (in celsius) used to
   scale the ``ir`` array. Defaults to the actual ``ir`` min and max.

.. function:: snapshot(hmirror:bool=False, vflip:bool=False, transpose:bool=False, x_scale:Optional[float]=None, y_scale:Optional[float]=None, roi:Optional[Tuple[int,int,int,int]]=None, rgb_channel:int=-1, alpha:int=255, color_palette:Optional[int]=image.PALETTE_RAINBOW, alpha_palette:Optional[int]=None, hint:int=0, scale:Optional[Tuple[float,float]]=None, pixformat:int=image.RGB565, copy_to_fb:bool=False, timeout:int=-1) -> image.Image

   Captures a frame from the thermal sensor and returns it as an `image.Image`. Works similarly to
   `sensor.snapshot()`. If ``copy_to_fb`` is False the new image is allocated on the MicroPython
   heap (which is limited); set ``copy_to_fb`` to True to write the result into the frame buffer
   instead.

   ``hmirror`` if True horizontally mirrors the new image.

   ``vflip`` if True vertically flips the new image.

   ``transpose`` if True transposes the new image.

   ``x_scale`` controls how much the new image is scaled in the x direction. A negative value flips
   horizontally. If unspecified, matches ``y_scale`` to maintain aspect ratio.

   ``y_scale`` controls how much the new image is scaled in the y direction. A negative value flips
   vertically. If unspecified, matches ``x_scale`` to maintain aspect ratio.

   ``roi`` is the region-of-interest rectangle ``(x, y, w, h)`` of the source IR data to draw.

   ``rgb_channel`` is the RGB channel (0=R, 1=G, 2=B) to render. ``-1`` (default) renders all channels.

   ``alpha`` controls how much of the source image is blended (0-255). 255 is fully opaque.

   ``color_palette`` is a color palette enum or a 256-pixel RGB565 image used as a lookup table on
   the grayscale source value.

   ``alpha_palette`` is a 256-pixel GRAYSCALE image used as an alpha lookup table.

   ``hint`` is a logical OR of the same flags accepted by `fir.draw_ir()`.

   ``scale`` is a 2-tuple ``(min, max)`` controlling the min/max temperature (in celsius) used to
   scale the IR array. Defaults to the actual IR min and max.

   ``pixformat`` controls the output pixel format. Must be `image.GRAYSCALE` or `image.RGB565`.

   ``copy_to_fb`` if True writes the result into the frame buffer instead of allocating on the heap.

   ``timeout`` if not -1, the number of milliseconds to wait for a new frame.

Constants
---------

.. data:: FIR_SHIELD
   :type: int

   The OpenMV Cam Thermopile Shield (MLX90621). Alias for `fir.FIR_MLX90621`.

.. data:: FIR_MLX90621
   :type: int

   MLX90621 thermal sensor (16x4).

.. data:: FIR_MLX90640
   :type: int

   MLX90640 thermal sensor (32x24).

.. data:: FIR_MLX90641
   :type: int

   MLX90641 thermal sensor (16x12).

.. data:: FIR_AMG8833
   :type: int

   AMG8833 thermal sensor (8x8).
