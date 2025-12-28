:mod:`fir` --- thermal sensor driver (fir == far infrared)
==========================================================

.. module:: fir
   :synopsis: thermal sensor driver (fir == far infrared)

The ``fir`` module is used for controlling the thermal sensors.

Example usage::

    import sensor, fir

    # Setup camera.
    sensor.reset()
    sensor.set_pixformat(sensor.RGB565)
    sensor.set_framesize(sensor.QVGA)
    sensor.skip_frames()
    fir.init()

    # Show image.
    while(True):
        img = sensor.snapshot()
        ta, ir, to_min, to_max = fir.read_ir()
        fir.draw_ir(image, ir)
        print("====================")
        print("Ambient temperature: %0.2f" % ta)
        print("Min temperature seen: %0.2f" % to_min)
        print("Max temperature seen: %0.2f" % to_max)

Functions
---------

.. function:: init(type=-1, refresh:Optional[int]=None, resolution:Optional[int]=None) -> None

   Initializes an attached thermopile shield using I/O pins P4 and P5.

   ``type`` indicates the type of thermopile shield:

      * `fir.FIR_NONE`: 0 pixels.
      * `fir.FIR_SHIELD`: 16x4 pixels.
      * `fir.FIR_MLX90621`: 16x4 pixels.
      * `fir.FIR_MLX90640`: 32x24 pixels.
      * `fir.FIR_MLX90641`: 16x12 pixels.
      * `fir.FIR_AMG8833`: 8x8 pixels.

   By default type is ``-1`` which will cause `fir.init()` to automatically scan and initialize an
   attached thermal sensor based on the I2C address. Note that `fir.FIR_MLX90640` and
   `fir.FIR_MLX90641` have the same I2C address so you must pass `fir.FIR_MLX90641` to type
   to initialize it specifically.

   ``refresh`` is the thermopile sensor power-of-2 refresh rate in Hz:

      * `fir.FIR_NONE`: N/A
      * `fir.FIR_SHIELD`: Defaults to 64 Hz. Can be 1 Hz, 2 Hz, 4 Hz, 8 Hz, 16 Hz, 32 Hz, 64 Hz, 128 Hz, 256 Hz, or 512 Hz. Note that a higher refresh rate lowers the accuracy and vice-versa.
      * `fir.FIR_MLX90621`: Defaults to 64 Hz. Can be 1 Hz, 2 Hz, 4 Hz, 8 Hz, 16 Hz, 32 Hz, 64 Hz, 128 Hz, 256 Hz, or 512 Hz. Note that a higher refresh rate lowers the accuracy and vice-versa.
      * `fir.FIR_MLX90640`: Defaults to 32 Hz. Can be 1 Hz, 2 Hz, 4 Hz, 8 Hz, 16 Hz, 32 Hz, or 64 Hz. Note that a higher refresh rate lowers the accuracy and vice-versa.
      * `fir.FIR_MLX90641`: Defaults to 32 Hz. Can be 1 Hz, 2 Hz, 4 Hz, 8 Hz, 16 Hz, 32 Hz, or 64 Hz. Note that a higher refresh rate lowers the accuracy and vice-versa.
      * `fir.FIR_AMG8833`: 10 Hz

   ``resolution`` is the thermopile sensor measurement resolution:

      * `fir.FIR_NONE`: N/A
      * `fir.FIR_SHIELD`: Defaults to 18-bits. Can be 15-bits, 16-bits, 17-bits, or 18-bits. Note that a higher resolution lowers the maximum temperature range and vice-versa.
      * `fir.FIR_MLX90621`: Defaults to 18-bits. Can be 15-bits, 16-bits, 17-bits, or 18-bits. Note that a higher resolution lowers the maximum temperature range and vice-versa.
      * `fir.FIR_MLX90640`: Defaults to 19-bits. Can be 16-bits, 17-bits, 18-bits, or 19-bits. Note that a higher resolution lowers the maximum temperature range and vice-versa.
      * `fir.FIR_MLX90641`: Defaults to 19-bits. Can be 16-bits, 17-bits, 18-bits, or 19-bits. Note that a higher resolution lowers the maximum temperature range and vice-versa.
      * `fir.FIR_AMG8833`: 12-bits.

   For the `fir.FIR_SHIELD` and `fir.FIR_MLX90621`:

      * 15-bits -> Max of ~950C.
      * 16-bits -> Max of ~750C.
      * 17-bits -> Max of ~600C.
      * 18-bits -> Max of ~450C.

   For the `fir.FIR_MLX90640` and `fir.FIR_MLX90641`:

      * 16-bits -> Max of ~750C.
      * 17-bits -> Max of ~600C.
      * 18-bits -> Max of ~450C.
      * 19-bits -> Max of ~300C.

   For the `fir.FIR_AMG8833`:

      * Max of ~80C.

.. function:: deinit() -> None

   Deinitializes the thermal sensor freeing up resources.

.. function:: width() -> int

   Returns the width (horizontal resolution) of the thermal sensor in-use:

      * `fir.FIR_NONE`: 0 pixels.
      * `fir.FIR_SHIELD`: 16 pixels.
      * `fir.FIR_MLX90621`: 16 pixels.
      * `fir.FIR_MLX90640`: 32 pixels.
      * `fir.FIR_MLX90641`: 16 pixels.
      * `fir.FIR_AMG8833`: 8 pixels.

.. function:: height() -> int

   Returns the height (vertical resolution) of the thermal sensor in-use:

      * `fir.FIR_NONE`: 0 pixels.
      * `fir.FIR_SHIELD`: 4 pixels.
      * `fir.FIR_MLX90621`: 4 pixels.
      * `fir.FIR_MLX90640`: 24 pixels.
      * `fir.FIR_MLX90641`: 12 pixels.
      * `fir.FIR_AMG8833`: 8 pixels.

.. function:: type() -> int

   Returns the type of the thermal sensor in-use:

      * `fir.FIR_NONE`
      * `fir.FIR_SHIELD`
      * `fir.FIR_MLX90621`
      * `fir.FIR_MLX90640`
      * `fir.FIR_MLX90641`
      * `fir.FIR_AMG8833`

.. function:: refresh() -> int

   Returns the current refresh rate set during `fir.init()` call.

.. function:: resolution() -> int

   Returns the current resolution set during the `fir.init()` call.

.. function:: read_ta() -> float

   Returns the ambient temperature (i.e. sensor temperature).

   Example::

      ta = fir.read_ta()

   The value returned is a float that represents the temperature in celsius.

.. function:: read_ir(hmirror=False, vflip=False, transpose=False, timeout=-1)

   Returns a tuple containing the ambient temperature (i.e. sensor temperature),
   the temperature list (width * height), the minimum temperature seen, and
   the maximum temperature seen.

   ``hmirror`` if set to True horizontally mirrors the ``ir`` array.

   ``vflip`` if set to True vertically flips the ``ir`` array.

   ``transpose`` if set to True transposes the ``ir`` array.

   ``timeout`` if not -1 then how many milliseconds to wait for the new frame.

   If you want to rotate an image by multiples of 90 degrees pass the following::

      * vflip=False, hmirror=False, transpose=False -> 0 degree rotation
      * vflip=True,  hmirror=False, transpose=True  -> 90 degree rotation
      * vflip=True,  hmirror=True,  transpose=False -> 180 degree rotation
      * vflip=False, hmirror=True,  transpose=True  -> 270 degree rotation

   Example::

      ta, ir, to_min, to_max = fir.read_ir()

   The values returned are floats that represent the temperature in celsius.

   .. note::

      ``ir`` is a (width * height) list of floats (4-bytes each).

.. function:: draw_ir(image:image.Image, ir, x:Optional[int]=None, y:Optional[int]=None, x_scale=1.0, y_scale=1.0, roi:Optional[Tuple[int,int,int,int]]=None, rgb_channel=-1, alpha=128, color_palette=image.PALETTE_RAINBOW, alpha_palette=-1, hint=0, scale=Optional[Tuple[float, float]]) -> None

   Draws an ``ir`` array on ``image`` whose top-left corner starts at location x, y. This method
   automatically handles rendering the image passed into the correct pixel format for the destination
   image while also handling clipping seamlessly.

   ``x_scale`` controls how much the displayed image is scaled by in the x direction (float). If this
   value is negative the image will be flipped horizontally. Note that if ``y_scale`` is not specified
   then it will match ``x_scale`` to maintain the aspect ratio.

   ``y_scale`` controls how much the displayed image is scaled by in the y direction (float). If this
   value is negative the image will be flipped vertically. Note that if ``x_scale`` is not specified
   then it will match ``x_scale`` to maintain the aspect ratio.

   ``roi`` is the region-of-interest rectangle tuple (x, y, w, h) of the source image to draw. This
   allows you to extract just the pixels in the ROI to scale and draw on the destination image.

   ``rgb_channel`` is the RGB channel (0=R, G=1, B=2) to extract from an RGB565 image (if passed)
   and to render onto the destination image. For example, if you pass ``rgb_channel=1`` this will
   extract the green channel of the source RGB565 image and draw that in grayscale on the
   destination image.

   ``alpha`` controls how much of the source image to blend into the destination image. A value of
   255 draws an opaque source image while a value lower than 255 produces a blend between the source
   and destination image. 0 results in no modification to the destination image.

   ``color_palette`` if not ``-1`` can be an a color palette enum or
   a 256 pixel in total RGB565 image to use as a color lookup table on the grayscale value of
   whatever the source image is. This is applied after ``rgb_channel`` extraction if used.

   ``alpha_palette`` if not ``-1`` can be a 256 pixel in total GRAYSCALE image to use as a alpha
   palette which modulates the ``alpha`` value of the source image being drawn at a pixel pixel
   level allowing you to precisely control the alpha value of pixels based on their grayscale value.
   A pixel value of 255 in the alpha lookup table is opaque which anything less than 255 becomes
   more transparent until 0. This is applied after ``rgb_channel`` extraction if used.

   ``hint`` can be a logical OR of the flags:

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
      * `image.SCALE_ASPECT_EXPAND`: Scale the image being drawn to fill the display (results in cropping)
      * `image.SCALE_ASPECT_IGNORE`: Scale the image being drawn to fill the display (results in stretching).
      * `image.ROTATE_90`: Rotate the image by 90 degrees (this is just VFLIP | TRANSPOSE).
      * `image.ROTATE_180`: Rotate the image by 180 degrees (this is just HMIRROR | VFLIP).
      * `image.ROTATE_270`: Rotate the image by 270 degrees (this is just HMIRROR | TRANSPOSE).

   ``scale`` is a two value tuple which controls the min and max temperature (in celsius) to scale
   the ``ir`` image. By default it's equal to the image ``ir`` min and ``ir`` max.

   If x/y are not specified the image will be centered in the field of view. If x_scale/y_scale or
   x_size/y_size are not specified the ``ir`` array will be scaled to fit on the ``image``.

   .. note::

      To handle a transposed ``ir`` array `read_ir` remembers if it was called with ``transposed``
      ``True``. This is then passed to ``draw_ir`` internally.

.. function:: snapshot(hmirror=False, vflip=False, transpose=False, x_scale=1.0, y_scale=1.0, roi:Optional[Tuple[int,int,int,int]]=None, rgb_channel=-1, alpha=128, color_palette=image.PALETTE_RAINBOW, alpha_palette=None, hint=0, scale:Optional[Tuple[float, float]]=None, pixformat=image.RGB565, copy_to_fb=False, timeout=-1) -> image.Image

   Works like `sensor.snapshot()` and returns an `image` object that is either
   `image.GRAYSCALE` (grayscale) or `image.RGB565` (color). If ``copy_to_fb`` is False then
   the new image is allocated on the MicroPython heap. However, the MicroPython heap is limited
   and may not have space to store the new image if exhausted. Instead, set ``copy_to_fb`` to
   True to set the frame buffer to the new image making this function work just like `sensor.snapshot()`.

   ``hmirror`` if set to True horizontally mirrors the new image.

   ``vflip`` if set to True vertically flips the new image.

   ``transpose`` if set to True transposes the new image.

   If you want to rotate an image by multiples of 90 degrees pass the following::

      * vflip=False, hmirror=False, transpose=False -> 0 degree rotation
      * vflip=True,  hmirror=False, transpose=True  -> 90 degree rotation
      * vflip=True,  hmirror=True,  transpose=False -> 180 degree rotation
      * vflip=False, hmirror=True,  transpose=True  -> 270 degree rotation

   ``x_scale`` controls how much the displayed image is scaled by in the x direction (float). If this
   value is negative the image will be flipped horizontally. Note that if ``y_scale`` is not specified
   then it will match ``x_scale`` to maintain the aspect ratio.

   ``y_scale`` controls how much the displayed image is scaled by in the y direction (float). If this
   value is negative the image will be flipped vertically. Note that if ``x_scale`` is not specified
   then it will match ``x_scale`` to maintain the aspect ratio.

   ``roi`` is the region-of-interest rectangle tuple (x, y, w, h) of the source image to draw. This
   allows you to extract just the pixels in the ROI to scale and draw on the destination image.

   ``rgb_channel`` is the RGB channel (0=R, G=1, B=2) to extract from an RGB565 image (if passed)
   and to render onto the destination image. For example, if you pass ``rgb_channel=1`` this will
   extract the green channel of the source RGB565 image and draw that in grayscale on the
   destination image.

   ``alpha`` controls how much of the source image to blend into the destination image. A value of
   255 draws an opaque source image while a value lower than 255 produces a blend between the source
   and destination image. 0 results in no modification to the destination image.

   ``color_palette`` if not ``-1`` can be an a color palette enum or
   a 256 pixel in total RGB565 image to use as a color lookup table on the grayscale value of
   whatever the source image is. This is applied after ``rgb_channel`` extraction if used.

   ``alpha_palette`` if not ``-1`` can be a 256 pixel in total GRAYSCALE image to use as a alpha
   palette which modulates the ``alpha`` value of the source image being drawn at a pixel pixel
   level allowing you to precisely control the alpha value of pixels based on their grayscale value.
   A pixel value of 255 in the alpha lookup table is opaque which anything less than 255 becomes
   more transparent until 0. This is applied after ``rgb_channel`` extraction if used.

   ``hint`` can be a logical OR of the flags:

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
      * `image.SCALE_ASPECT_EXPAND`: Scale the image being drawn to fill the display (results in cropping)
      * `image.SCALE_ASPECT_IGNORE`: Scale the image being drawn to fill the display (results in stretching).
      * `image.ROTATE_90`: Rotate the image by 90 degrees (this is just VFLIP | TRANSPOSE).
      * `image.ROTATE_180`: Rotate the image by 180 degrees (this is just HMIRROR | VFLIP).
      * `image.ROTATE_270`: Rotate the image by 270 degrees (this is just HMIRROR | TRANSPOSE).

   ``scale`` is a two value tuple which controls the min and max temperature (in celsius) to scale
   the ``ir`` image. By default it's equal to the image ``ir`` min and ``ir`` max.

   ``pixformat`` if specified controls the final image pixel format.

   ``timeout`` if not -1 then how many milliseconds to wait for the new frame.

   Returns an image object.

Constants
---------

.. data:: FIR_NONE
   :type: int

   No FIR sensor type.

.. data:: FIR_SHIELD
   :type: int

   The OpenMV Cam Thermopile Shield Type (MLX90621).

.. data:: FIR_MLX90621
   :type: int

   FIR_MLX90621 FIR sensor.

.. data:: FIR_MLX90640
   :type: int

   FIR_MLX90640 FIR sensor.

.. data:: FIR_MLX90641
   :type: int

   FIR_MLX90640 FIR sensor.

.. data:: FIR_AMG8833
   :type: int

   FIR_AMG8833 FIR sensor.
