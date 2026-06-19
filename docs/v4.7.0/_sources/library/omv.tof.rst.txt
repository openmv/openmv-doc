:mod:`tof` --- time-of-flight sensor driver
===========================================

.. module:: tof
   :synopsis: time-of-flight sensor driver

The ``tof`` module is used for controlling the time-of-flight sensor.

Example usage::

    import sensor, tof

    # Setup camera.
    sensor.reset()
    sensor.set_pixformat(sensor.RGB565)
    sensor.set_framesize(sensor.QVGA)
    sensor.skip_frames()
    tof.init()

    # Show image.
    while(True):
        img = sensor.snapshot()
        depth, depth_min, depth_max = tof.read_depth()
        tof.draw_depth(image, depth)
        print("====================")
        print("Min depth in mm seen: %0.2f" % depth_min)
        print("Max depth in mm seen: %0.2f" % depth_max)

Functions
---------

.. function:: init(type:int=-1) -> None

   Initializes an onboard depth sensor.

   ``type`` indicates the type of thermopile shield:

      * `tof.TOF_NONE`: 0 pixels.
      * `tof.TOF_VL53LX`: 8x8 pixels.

   By default type is ``-1`` which will cause `tof.init()` to automatically scan and initialize an
   attached thermal sensor based on the I2C address.

.. function:: reset(type:int=-1) -> None

   Re-initializes an onboard depth sensor.

   ``type`` indicates the type of thermopile shield:

      * `tof.TOF_NONE`: 0 pixels.
      * `tof.TOF_VL53LX`: 8x8 pixels.

   By default type is ``-1`` which will cause `tof.init()` to automatically scan and initialize an
   attached thermal sensor based on the I2C address.

.. function:: deinit() -> None

   Deinitializes the depth sensor freeing up resources.

.. function:: width() -> int

   Returns the width (horizontal resolution) of the depth sensor in-use:

      * `tof.TOF_NONE`: 0 pixels.
      * `tof.TOF_VL53LX`: 8 pixels.

.. function:: height() -> int

   Returns the height (vertical resolution) of the depth sensor in-use:

      * `tof.TOF_NONE`: 0 pixels.
      * `tof.TOF_VL53LX`: 8 pixels.

.. function:: type() -> int

   Returns the type of the depth sensor in-use:

      * `tof.TOF_NONE`
      * `tof.TOF_VL53LX`

.. function:: refresh() -> int

   Returns the refresh rate of the depth sensor in-use:

      * `tof.TOF_NONE`: 0 Hz.
      * `tof.TOF_VL53LX`: 15 Hz.

.. function:: read_depth(hmirror:bool=False, vflip:bool=False, transpose:bool=False, timeout:int=-1)

   Returns a tuple containing the depth list (width * height),
   the minimum depth seen, and the maximum depth seen.

   ``hmirror`` if set to True horizontally mirrors the ``depth`` array.

   ``vflip`` if set to True vertically flips the ``depth`` array.

   ``transpose`` if set to True transposes the ``depth`` array.

   ``timeout`` if not -1 then how many milliseconds to wait for the new frame.

   If you want to rotate an image by multiples of 90 degrees pass the following::

      * vflip=False, hmirror=False, transpose=False -> 0 degree rotation
      * vflip=True,  hmirror=False, transpose=True  -> 90 degree rotation
      * vflip=True,  hmirror=True,  transpose=False -> 180 degree rotation
      * vflip=False, hmirror=True,  transpose=True  -> 270 degree rotation

   Example::

      depth, to_min, to_max = tof.read_depth()

   The values returned are floats that represent the depth in mm.

   .. note::

      ``depth`` is a (width * height) list of floats (4-bytes each).

.. function:: draw_depth(image:image.Image, tof, x:Optional[int]=None, y:Optional[int]=None, x_scale:float=1.0, y_scale:float=1.0, roi:Optional[Tuple[int,int,int,int]]=None, rgb_channel:int=-1, alpha:int=128, color_palette=image.PALETTE_DEPTH, alpha_palette=-1, hint:int=0, scale=Optional[Tuple[float, float]]) -> None

   Draws an ``depth`` array on ``image`` whose top-left corner starts at location x, y. This method
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

   ``scale`` is a two value tuple which controls the min and max depth (in mm) to scale
   the ``depth`` image. By default it's equal to the image ``depth`` min and ``depth`` max.

   If x/y are not specified the image will be centered in the field of view. If x_scale/y_scale or
   x_size/y_size are not specified the ``depth`` array will be scaled to fit on the ``image``.

   .. note::

      To handle a transposed ``depth`` array `read_depth` remembers if it was called with ``transposed``
      ``True``. This is then passed to ``draw_depth`` internally.

.. function:: snapshot(hmirror:bool=False, vflip:bool=False, transpose:bool=False, x_scale:float=1.0, y_scale:float=1.0, roi:Optional[Tuple[int,int,int,int]]=None, rgb_channel:int=-1, alpha:int=128, color_palette=image.PALETTE_DEPTH, alpha_palette=None, hint:int=0, scale:Optional[Tuple[float, float]]=None, pixformat:int=image.RGB565, copy_to_fb:bool=False, timeout:int=-1) -> image.Image

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

   ``scale`` is a two value tuple which controls the min and max depth (in mm) to scale
   the ``depth`` image. By default it's equal to the image ``depth`` min and ``depth`` max.

   ``pixformat`` if specified controls the final image pixel format.

   ``timeout`` if not -1 then how many milliseconds to wait for the new frame.

   Returns an image object.

Constants
---------

.. data:: TOF_NONE
   :type: int

   No TOF sensor type.

.. data:: TOF_VL53LX
   :type: int

   VL53L5CX or VL53L8CX TOF sensor.
