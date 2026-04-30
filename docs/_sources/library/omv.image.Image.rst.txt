.. currentmodule:: image

class Image -- Image object
===========================

The image object is the basic object for machine vision operations.

.. _image.Image.hint:

Hint flags
~~~~~~~~~~

Many `Image` methods accept a ``hint`` argument which is a logical OR of the following flags:

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
   * `image.BLACK_BACKGROUND`: Assume the background image being drawn on is black speeding up blending. Only supported by `Image.draw_image()` and `Image.get_similarity()`.

.. class:: Image(arg: str | int | ndarray, height:int=-1, pixformat:int=-1, *, buffer:Optional[Union[bytes, bytearray, memoryview]]=None, copy_to_fb:bool=False)

   If ``arg`` is a string then this creates a new image object from a file at ``arg`` path.
   Supports loading bmp/pgm/ppm/jpg/jpeg/png image files from disk. If ``copy_to_fb`` is true
   the image is copied to the frame buffer verus being allocated on the heap.

   If ``arg`` is an ``ndarray`` then this creates a new image object from the ``ndarray``.
   ``ndarray`` objects with a shape of ``(w, h)`` are treated as grayscale images, ``(w, h, 3)`` are treated
   as RGB565 images. Only float32 point ``ndarrays`` are supported at this time. When creating
   an image this way if you pass a ``buffer`` argument it will be used to store the image data
   versus allocating space on the heap. If ``copy_to_fb`` is true the image is copied to the
   frame buffer verus being allocated on the heap or using the ``buffer``.

   If ``arg`` is an ``int`` it is then considered the width of a new image and a ``height`` value
   and a ``format`` value must follow to create a new blank image object. ``format`` can be
   be any image pixformat value like `image.GRAYSCALE`. The image will be initialized
   to all zeros. Note that a ``buffer`` value is expected for compressed image formats.
   ``buffer`` is considered as the source of image data for creating images this way. If used with
   ``copy_to_fb`` the data from ``buffer`` is copied to the frame buffer. If you'd like to create a
   JPEG image from a JPEG `bytes()` or `bytearray()` object you can pass the ``width``,
   ``height``, ``image.JPEG`` for the JPEG along with setting ``buffer`` to the JPEG byte stream
   to create a JPEG image.

   Images support "[]" notation. Do ``image[index] = 8/16-bit value`` to assign
   an image pixel or ``image[index]`` to get an image pixel which will be
   either an 8-bit value for grayscale/bayer images of a 16-bit value for RGB565/YUV
   images. Binary images return a 1-bit value.

   For JPEG images the "[]" allows you to access the compressed JPEG image blob
   as a byte-array. Reading and writing to the data array is opaque however as
   JPEG images are compressed byte streams.

   Images also support read buffer operations. You can pass images to all sorts
   of MicroPython functions like as if the image were a byte-array object. In
   particular, if you'd like to transmit an image you can just pass it to the
   UART/SPI/I2C write functions to be transmitted automatically.

   Basic Methods
   ~~~~~~~~~~~~~

   .. method:: width() -> int

      Returns the image width in pixels.

   .. method:: height() -> int

      Returns the image height in pixels.

   .. method:: format() -> int

      Returns `image.GRAYSCALE` for grayscale images, `image.RGB565` for RGB565
      images, `image.BAYER` for bayer pattern images, and `image.JPEG` for JPEG
      images.

   .. method:: size() -> int

      Returns the image size in bytes.

   .. method:: bytearray() -> bytearray

      Returns a `bytearray` object that points to the image data for byte-level read/write access.

      .. note::

         Image objects are automatically cast as `bytes` objects when passed to MicroPython driver
         that requires a `bytes` like object. This is read-only access.
         Call `bytearray()` to get read/write access.

   .. method:: get_pixel(x:int, y:int, rgbtuple:Optional[bool]=None) -> Union[int, Tuple[int, int, int]]

      For grayscale images: Returns the grayscale pixel value at location (x, y).
      For RGB565 images: Returns the RGB888 pixel tuple (r, g, b) at location (x, y).
      For bayer pattern images: Returns the the pixel value at the location (x, y).

      Returns None if ``x`` or ``y`` is outside of the image.

      ``x`` and ``y`` may either be passed independently or as a tuple.

      ``rgbtuple`` if True causes this method to return an RGB888 tuple. Otherwise,
      this method returns the integer value of the underlying pixel. I.e. for RGB565
      images this method returns a RGB565 value. Defaults to True
      for RGB565 images and False otherwise.

      Not supported on compressed images.

      .. note::

         `Image.get_pixel()` and `Image.set_pixel()` are the only methods that allow
         you to manipulate bayer pattern images. Bayer pattern images are literal images
         where pixels in the image are R/G/R/G/etc. for even rows and G/B/G/B/etc. for
         odd rows. Each pixel is 8-bits. If you call this method with ``rgbtuple`` set then `Image.get_pixel()`
         will debayer the source image at that pixel location and return a valid RGB888 tuple for the pixel location.

   .. method:: set_pixel(x:int, y:int, pixel:Union[int, Tuple[int, int, int]]) -> Image

      For grayscale images: Sets the pixel at location (x, y) to the grayscale value ``pixel``.
      For RGB565 images: Sets the pixel at location (x, y) to the RGB888 tuple (r, g, b) ``pixel``.
      For bayer pattern images: Sets the pixel value at the location (x, y) to the value ``pixel``.

      Returns the image object so you can call another method using ``.`` notation.

      ``x`` and ``y`` may either be passed independently or as a tuple.

      ``pixel`` may either be an RGB888 tuple (r, g, b) or the underlying pixel
      value (i.e. a RGB565 value for RGB565 images or an 8-bit value
      for grayscale images.

      Not supported on compressed images.

      .. note::

         `Image.get_pixel()` and `Image.set_pixel()` are the only methods that allow
         you to manipulate bayer pattern images. Bayer pattern images are literal images
         where pixels in the image are R/G/R/G/etc. for even rows and G/B/G/B/etc. for
         odd rows. Each pixel is 8-bits. If you call this method with an RGB888 tuple the grayscale
         value of that RGB888 tuple is extracted and set to the pixel location.

   Conversion Methods
   ~~~~~~~~~~~~~~~~~~

   .. method:: to_ndarray(dtype:str, buffer:Optional[Union[bytes, bytearray, memoryview]]=None) -> ndarray

      Returns a ``ndarray`` object created from the image.
      This only works for GRAYSCALE or RGB565 images currently.

      ``dtype`` can be ``b``, ``B``, or ``f`` for creating a signed 8-bit, unsigned 8-bit, or 32-bit floating point ``ndarray``.
      GRAYSCALE images are directly converted to unsigned 8-bit ``ndarray`` objects. For signed 8-bit ``ndarray``
      objects the values (0:255) are mapped to (-127:128). For float 32-bit ``ndarray`` objects the values are
      mapped to (0.0:255.0). RGB565 images are converted to 3-channel ``ndarray`` objects and the same
      process described above for GRAYSCALE images is applied to each channel depending on ``dtype``. Note that
      ``dtype`` also accepts the integer values (e.g. `ord()`) of ``b``, ``B``, and ``f`` respectively.

      ``buffer`` if not ``None`` is a ``bytearray`` object to use as the buffer for the ``ndarray``.
      If ``None`` a new buffer is allocated on the heap to store the ``ndarray`` image data. You can
      use the ``buffer`` argument to directly allocate the ``ndarray`` in a pre-allocated buffer saving
      a heap allocation and a copy operation.

      The ``ndarray`` returned has the shape of ``(height, width)`` for GRAYSCALE images and
      ``(height, width, 3)`` for RGB565 images.

   .. method:: to_bitmap(x_scale:float=1.0, y_scale:float=1.0, roi:Optional[Tuple[int,int,int,int]]=None, rgb_channel:int=-1, alpha:int=255, color_palette:Optional[Union[int, Image]]=None, alpha_palette:Optional[Image]=None, hint:int=0, transform: ndarray | None = None, copy:bool=False, copy_to_fb:bool=False) -> Image

      Converts an image to a bitmap image (1 bit per pixel).

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

      ``color_palette`` if not ``None`` can be an a color palette enum or
      a 256 pixel in total RGB565 image to use as a color lookup table on the grayscale value of
      whatever the source image is. This is applied after ``rgb_channel`` extraction if used.

      ``alpha_palette`` if not ``None`` can be a 256 pixel in total GRAYSCALE image to use as a alpha
      palette which modulates the ``alpha`` value of the source image being drawn at a pixel pixel
      level allowing you to precisely control the alpha value of pixels based on their grayscale value.
      A pixel value of 255 in the alpha lookup table is opaque which anything less than 255 becomes
      more transparent until 0. This is applied after ``rgb_channel`` extraction if used.

      ``hint`` is a logical OR of the flags listed in :ref:`Hint flags <image.Image.hint>` (excluding `image.BLACK_BACKGROUND` which is not supported here).

      ``transform`` is 3x3 ``ndarray`` that is used to perform a persepective transformation on the image. Only
      supported on the OpenMV Cam N6 currently as it has a GPU that can do this in hardware.

      ``copy`` if True create a deep-copy on the heap of the image that's been converted versus converting the
      original image in-place.

      ``copy_to_fb`` if True the image is loaded directly into the frame buffer.
      ``copy_to_fb`` has priority over ``copy``. This has no special effect if the image is already in
      the frame buffer.

      .. note::

         Bitmap images are like grayscale images with only two pixels values - 0
         and 1. Additionally, bitmap images are packed such that they only store
         1 bit per pixel making them very small. The OpenMV image library allows
         bitmap images to be used in all places `sensor.GRAYSCALE` and `sensor.RGB565` images
         can be used. However, many operations when applied on bitmap images don't
         make any sense becuase bitmap images only have 2 values. OpenMV recommends
         using bitmap images for ``mask`` values in operations and such as they
         fit on the MicroPython heap quite easily. Finally, bitmap image pixel values
         0 and 1 are interpreted as black and white when being applied to `sensor.GRAYSCALE`
         or `sensor.RGB565` images. The library automatically handles conversion.

      Returns the image object so you can call another method using ``.`` notation.

   .. method:: to_grayscale(x_scale:float=1.0, y_scale:float=1.0, roi:Optional[Tuple[int,int,int,int]]=None, rgb_channel:int=-1, alpha:int=255, color_palette:Optional[Union[int, Image]]=None, alpha_palette:Optional[Image]=None, hint:int=0, transform: ndarray | None = None, copy:bool=False, copy_to_fb:bool=False) -> Image

      Converts an image to a grayscale image (8-bits per pixel).

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

      ``color_palette`` if not ``None`` can be an a color palette enum or
      a 256 pixel in total RGB565 image to use as a color lookup table on the grayscale value of
      whatever the source image is. This is applied after ``rgb_channel`` extraction if used.

      ``alpha_palette`` if not ``None`` can be a 256 pixel in total GRAYSCALE image to use as a alpha
      palette which modulates the ``alpha`` value of the source image being drawn at a pixel pixel
      level allowing you to precisely control the alpha value of pixels based on their grayscale value.
      A pixel value of 255 in the alpha lookup table is opaque which anything less than 255 becomes
      more transparent until 0. This is applied after ``rgb_channel`` extraction if used.

      ``hint`` is a logical OR of the flags listed in :ref:`Hint flags <image.Image.hint>` (excluding `image.BLACK_BACKGROUND` which is not supported here).

      ``transform`` is 3x3 ``ndarray`` that is used to perform a persepective transformation on the image. Only
      supported on the OpenMV Cam N6 currently as it has a GPU that can do this in hardware.

      ``copy`` if True create a deep-copy on the heap of the image that's been converted versus converting the
      original image in-place.

      ``copy_to_fb`` if True the image is loaded directly into the frame buffer.
      ``copy_to_fb`` has priority over ``copy``. This has no special effect if the image is already in
      the frame buffer.

      Returns the image object so you can call another method using ``.`` notation.

   .. method:: to_rgb565(x_scale:float=1.0, y_scale:float=1.0, roi:Optional[Tuple[int,int,int,int]]=None, rgb_channel:int=-1, alpha:int=255, color_palette:Optional[Union[int, Image]]=None, alpha_palette:Optional[Image]=None, hint:int=0, transform: ndarray | None = None, copy:bool=False, copy_to_fb:bool=False) -> Image

      Converts an image to an RGB565 image (16-bits per pixel).

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

      ``color_palette`` if not ``None`` can be an a color palette enum or
      a 256 pixel in total RGB565 image to use as a color lookup table on the grayscale value of
      whatever the source image is. This is applied after ``rgb_channel`` extraction if used.

      ``alpha_palette`` if not ``None`` can be a 256 pixel in total GRAYSCALE image to use as a alpha
      palette which modulates the ``alpha`` value of the source image being drawn at a pixel pixel
      level allowing you to precisely control the alpha value of pixels based on their grayscale value.
      A pixel value of 255 in the alpha lookup table is opaque which anything less than 255 becomes
      more transparent until 0. This is applied after ``rgb_channel`` extraction if used.

      ``hint`` is a logical OR of the flags listed in :ref:`Hint flags <image.Image.hint>` (excluding `image.BLACK_BACKGROUND` which is not supported here).

      ``transform`` is 3x3 ``ndarray`` that is used to perform a persepective transformation on the image. Only
      supported on the OpenMV Cam N6 currently as it has a GPU that can do this in hardware.

      ``copy`` if True create a deep-copy on the heap of the image that's been converted versus converting the
      original image in-place.

      ``copy_to_fb`` if True the image is loaded directly into the frame buffer.
      ``copy_to_fb`` has priority over ``copy``. This has no special effect if the image is already in
      the frame buffer.

      Returns the image object so you can call another method using ``.`` notation.

   .. method:: to_rainbow(x_scale:float=1.0, y_scale:float=1.0, roi:Optional[Tuple[int,int,int,int]]=None, rgb_channel:int=-1, alpha:int=255, color_palette: int | Image = PALETTE_RAINBOW, alpha_palette: Image | None = None, hint:int=0, transform: ndarray | None = None, copy:bool=False, copy_to_fb:bool=False) -> Image

      Converts an image to an RGB565 rainbow image (16-bits per pixel).

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

      ``color_palette`` if not ``None`` can be an a color palette enum or
      a 256 pixel in total RGB565 image to use as a color lookup table on the grayscale value of
      whatever the source image is. This is applied after ``rgb_channel`` extraction if used.

      ``alpha_palette`` if not ``None`` can be a 256 pixel in total GRAYSCALE image to use as a alpha
      palette which modulates the ``alpha`` value of the source image being drawn at a pixel pixel
      level allowing you to precisely control the alpha value of pixels based on their grayscale value.
      A pixel value of 255 in the alpha lookup table is opaque which anything less than 255 becomes
      more transparent until 0. This is applied after ``rgb_channel`` extraction if used.

      ``hint`` is a logical OR of the flags listed in :ref:`Hint flags <image.Image.hint>` (excluding `image.BLACK_BACKGROUND` which is not supported here).

      ``transform`` is 3x3 ``ndarray`` that is used to perform a persepective transformation on the image. Only
      supported on the OpenMV Cam N6 currently as it has a GPU that can do this in hardware.

      ``copy`` if True create a deep-copy on the heap of the image that's been converted versus converting the
      original image in-place.

      ``copy_to_fb`` if True the image is loaded directly into the frame buffer.
      ``copy_to_fb`` has priority over ``copy``. This has no special effect if the image is already in
      the frame buffer.

      Returns the image object so you can call another method using ``.`` notation.

   .. method:: to_ironbow(x_scale:float=1.0, y_scale:float=1.0, roi:Optional[Tuple[int,int,int,int]]=None, rgb_channel:int=-1, alpha:int=255, color_palette: int | Image = PALETTE_IRONBOW, alpha_palette: Image | None = None, hint:int=0, transform: ndarray | None = None, copy:bool=False, copy_to_fb:bool=False) -> Image

      Converts an image to an RGB565 ironbow image (16-bits per pixel).

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

      ``color_palette`` if not ``None`` can be an a color palette enum or
      a 256 pixel in total RGB565 image to use as a color lookup table on the grayscale value of
      whatever the source image is. This is applied after ``rgb_channel`` extraction if used.

      ``alpha_palette`` if not ``None`` can be a 256 pixel in total GRAYSCALE image to use as a alpha
      palette which modulates the ``alpha`` value of the source image being drawn at a pixel pixel
      level allowing you to precisely control the alpha value of pixels based on their grayscale value.
      A pixel value of 255 in the alpha lookup table is opaque which anything less than 255 becomes
      more transparent until 0. This is applied after ``rgb_channel`` extraction if used.

      ``hint`` is a logical OR of the flags listed in :ref:`Hint flags <image.Image.hint>` (excluding `image.BLACK_BACKGROUND` which is not supported here).

      ``transform`` is 3x3 ``ndarray`` that is used to perform a persepective transformation on the image. Only
      supported on the OpenMV Cam N6 currently as it has a GPU that can do this in hardware.

      ``copy`` if True create a deep-copy on the heap of the image that's been converted versus converting the
      original image in-place.

      ``copy_to_fb`` if True the image is loaded directly into the frame buffer.
      ``copy_to_fb`` has priority over ``copy``. This has no special effect if the image is already in
      the frame buffer.

      Returns the image object so you can call another method using ``.`` notation.

   .. method:: to_depth(x_scale:float=1.0, y_scale:float=1.0, roi:Optional[Tuple[int,int,int,int]]=None, rgb_channel:int=-1, alpha:int=255, color_palette: int | Image = PALETTE_IRONBOW, alpha_palette: Image | None = None, hint:int=0, transform: ndarray | None = None, copy:bool=False, copy_to_fb:bool=False) -> Image

      Converts an image to an RGB565 Depth Image (16-bits per pixel).

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

      ``color_palette`` if not ``None`` can be `image.PALETTE_DEPTH` or
      a 256 pixel in total RGB565 image to use as a color lookup table on the grayscale value of
      whatever the source image is. This is applied after ``rgb_channel`` extraction if used.

      ``alpha_palette`` if not ``None`` can be a 256 pixel in total GRAYSCALE image to use as a alpha
      palette which modulates the ``alpha`` value of the source image being drawn at a pixel pixel
      level allowing you to precisely control the alpha value of pixels based on their grayscale value.
      A pixel value of 255 in the alpha lookup table is opaque which anything less than 255 becomes
      more transparent until 0. This is applied after ``rgb_channel`` extraction if used.

      ``hint`` is a logical OR of the flags listed in :ref:`Hint flags <image.Image.hint>` (excluding `image.BLACK_BACKGROUND` which is not supported here).

      ``transform`` is 3x3 ``ndarray`` that is used to perform a persepective transformation on the image. Only
      supported on the OpenMV Cam N6 currently as it has a GPU that can do this in hardware.

      ``copy`` if True create a deep-copy on the heap of the image that's been converted versus converting the
      original image in-place.

      ``copy_to_fb`` if True the image is loaded directly into the frame buffer.
      ``copy_to_fb`` has priority over ``copy``. This has no special effect if the image is already in
      the frame buffer.

      Returns the image object so you can call another method using ``.`` notation.

   .. method:: to_evt_dark(x_scale:float=1.0, y_scale:float=1.0, roi:Optional[Tuple[int,int,int,int]]=None, rgb_channel:int=-1, alpha:int=255, color_palette: int | Image = PALETTE_IRONBOW, alpha_palette: Image | None = None, hint:int=0, transform: ndarray | None = None, copy:bool=False, copy_to_fb:bool=False) -> Image

      Converts an image to an RGB565 Dark Event Image (16-bits per pixel).

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

      ``color_palette`` if not ``None`` can be an a color palette enum or
      a 256 pixel in total RGB565 image to use as a color lookup table on the grayscale value of
      whatever the source image is. This is applied after ``rgb_channel`` extraction if used.

      ``alpha_palette`` if not ``None`` can be a 256 pixel in total GRAYSCALE image to use as a alpha
      palette which modulates the ``alpha`` value of the source image being drawn at a pixel pixel
      level allowing you to precisely control the alpha value of pixels based on their grayscale value.
      A pixel value of 255 in the alpha lookup table is opaque which anything less than 255 becomes
      more transparent until 0. This is applied after ``rgb_channel`` extraction if used.

      ``hint`` is a logical OR of the flags listed in :ref:`Hint flags <image.Image.hint>` (excluding `image.BLACK_BACKGROUND` which is not supported here).

      ``transform`` is 3x3 ``ndarray`` that is used to perform a persepective transformation on the image. Only
      supported on the OpenMV Cam N6 currently as it has a GPU that can do this in hardware.

      ``copy`` if True create a deep-copy on the heap of the image that's been converted versus converting the
      original image in-place.

      ``copy_to_fb`` if True the image is loaded directly into the frame buffer.
      ``copy_to_fb`` has priority over ``copy``. This has no special effect if the image is already in
      the frame buffer.

      Returns the image object so you can call another method using ``.`` notation.

   .. method:: to_evt_light(x_scale:float=1.0, y_scale:float=1.0, roi:Optional[Tuple[int,int,int,int]]=None, rgb_channel:int=-1, alpha:int=255, color_palette: int | Image = PALETTE_IRONBOW, alpha_palette: Image | None = None, hint:int=0, transform: ndarray | None = None, copy:bool=False, copy_to_fb:bool=False) -> Image

      Converts an image to an RGB565 Light Event Image (16-bits per pixel).

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

      ``color_palette`` if not ``None`` can be an a color palette enum or
      a 256 pixel in total RGB565 image to use as a color lookup table on the grayscale value of
      whatever the source image is. This is applied after ``rgb_channel`` extraction if used.

      ``alpha_palette`` if not ``None`` can be a 256 pixel in total GRAYSCALE image to use as a alpha
      palette which modulates the ``alpha`` value of the source image being drawn at a pixel pixel
      level allowing you to precisely control the alpha value of pixels based on their grayscale value.
      A pixel value of 255 in the alpha lookup table is opaque which anything less than 255 becomes
      more transparent until 0. This is applied after ``rgb_channel`` extraction if used.

      ``hint`` is a logical OR of the flags listed in :ref:`Hint flags <image.Image.hint>` (excluding `image.BLACK_BACKGROUND` which is not supported here).

      ``transform`` is 3x3 ``ndarray`` that is used to perform a persepective transformation on the image. Only
      supported on the OpenMV Cam N6 currently as it has a GPU that can do this in hardware.

      ``copy`` if True create a deep-copy on the heap of the image that's been converted versus converting the
      original image in-place.

      ``copy_to_fb`` if True the image is loaded directly into the frame buffer.
      ``copy_to_fb`` has priority over ``copy``. This has no special effect if the image is already in
      the frame buffer.

      Returns the image object so you can call another method using ``.`` notation.

   .. method:: to_jpeg(x_scale:float=1.0, y_scale:float=1.0, roi:Optional[Tuple[int,int,int,int]]=None, rgb_channel:int=-1, alpha:int=255, color_palette:Optional[Union[int, Image]]=None, alpha_palette:Optional[Image]=None, hint:int=0, transform: ndarray | None = None, copy:bool=False, copy_to_fb:bool=False, quality:int=90, subsampling:int=0) -> Image

      Converts an image to a JPEG image.

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

      ``color_palette`` if not ``None`` can be an a color palette enum or
      a 256 pixel in total RGB565 image to use as a color lookup table on the grayscale value of
      whatever the source image is. This is applied after ``rgb_channel`` extraction if used.

      ``alpha_palette`` if not ``None`` can be a 256 pixel in total GRAYSCALE image to use as a alpha
      palette which modulates the ``alpha`` value of the source image being drawn at a pixel pixel
      level allowing you to precisely control the alpha value of pixels based on their grayscale value.
      A pixel value of 255 in the alpha lookup table is opaque which anything less than 255 becomes
      more transparent until 0. This is applied after ``rgb_channel`` extraction if used.

      ``hint`` is a logical OR of the flags listed in :ref:`Hint flags <image.Image.hint>` (excluding `image.BLACK_BACKGROUND` which is not supported here).

      ``transform`` is 3x3 ``ndarray`` that is used to perform a persepective transformation on the image. Only
      supported on the OpenMV Cam N6 currently as it has a GPU that can do this in hardware.

      ``copy`` if True create a deep-copy on the heap of the image that's been converted versus converting the
      original image in-place.

      ``copy_to_fb`` if True the image is loaded directly into the frame buffer.
      ``copy_to_fb`` has priority over ``copy``. This has no special effect if the image is already in
      the frame buffer.

      ``quality`` controls the jpeg image compression quality. The value can be between 0 and 100.

      ``subsampling`` can be:

         * `image.JPEG_SUBSAMPLING_AUTO`: Use the best subsampling for the image based on the quality.
         * `image.JPEG_SUBSAMPLING_444`: Use 4:4:4 subsampling.
         * `image.JPEG_SUBSAMPLING_422`: Use 4:2:2 subsampling.
         * `image.JPEG_SUBSAMPLING_420`: Use 4:2:0 subsampling.

      Returns the image object so you can call another method using ``.`` notation.

   .. method:: to_png(x_scale:float=1.0, y_scale:float=1.0, roi:Optional[Tuple[int,int,int,int]]=None, rgb_channel:int=-1, alpha:int=255, color_palette:Optional[Union[int, Image]]=None, alpha_palette:Optional[Image]=None, hint:int=0, transform: ndarray | None = None, copy:bool=False, copy_to_fb:bool=False) -> Image

      Converts an image to a PNG image.

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

      ``color_palette`` if not ``None`` can be an a color palette enum or
      a 256 pixel in total RGB565 image to use as a color lookup table on the grayscale value of
      whatever the source image is. This is applied after ``rgb_channel`` extraction if used.

      ``alpha_palette`` if not ``None`` can be a 256 pixel in total GRAYSCALE image to use as a alpha
      palette which modulates the ``alpha`` value of the source image being drawn at a pixel pixel
      level allowing you to precisely control the alpha value of pixels based on their grayscale value.
      A pixel value of 255 in the alpha lookup table is opaque which anything less than 255 becomes
      more transparent until 0. This is applied after ``rgb_channel`` extraction if used.

      ``hint`` is a logical OR of the flags listed in :ref:`Hint flags <image.Image.hint>` (excluding `image.BLACK_BACKGROUND` which is not supported here).

      ``transform`` is 3x3 ``ndarray`` that is used to perform a persepective transformation on the image. Only
      supported on the OpenMV Cam N6 currently as it has a GPU that can do this in hardware.

      ``copy`` if True create a deep-copy on the heap of the image that's been converted versus converting the
      original image in-place.

      ``copy_to_fb`` if True the image is loaded directly into the frame buffer.
      ``copy_to_fb`` has priority over ``copy``. This has no special effect if the image is already in
      the frame buffer.

      Returns the image object so you can call another method using ``.`` notation.

   .. method:: compress(x_scale:float=1.0, y_scale:float=1.0, roi:Optional[Tuple[int,int,int,int]]=None, rgb_channel:int=-1, alpha:int=255, color_palette:Optional[Union[int, Image]]=None, alpha_palette:Optional[Image]=None, hint:int=0, transform: ndarray | None = None, copy:bool=False, copy_to_fb:bool=False, quality:int=90, subsampling:int=0) -> Image

      Converts an image to a JPEG image.

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

      ``color_palette`` if not ``None`` can be an a color palette enum or
      a 256 pixel in total RGB565 image to use as a color lookup table on the grayscale value of
      whatever the source image is. This is applied after ``rgb_channel`` extraction if used.

      ``alpha_palette`` if not ``None`` can be a 256 pixel in total GRAYSCALE image to use as a alpha
      palette which modulates the ``alpha`` value of the source image being drawn at a pixel pixel
      level allowing you to precisely control the alpha value of pixels based on their grayscale value.
      A pixel value of 255 in the alpha lookup table is opaque which anything less than 255 becomes
      more transparent until 0. This is applied after ``rgb_channel`` extraction if used.

      ``hint`` is a logical OR of the flags listed in :ref:`Hint flags <image.Image.hint>` (excluding `image.BLACK_BACKGROUND` which is not supported here).

      ``transform`` is 3x3 ``ndarray`` that is used to perform a persepective transformation on the image. Only
      supported on the OpenMV Cam N6 currently as it has a GPU that can do this in hardware.

      ``copy`` if True create a deep-copy on the heap of the image that's been converted versus converting the
      original image in-place.

      ``copy_to_fb`` if True the image is loaded directly into the frame buffer.
      ``copy_to_fb`` has priority over ``copy``. This has no special effect if the image is already in
      the frame buffer.

      ``quality`` controls the jpeg image compression quality. The value can be between 0 and 100.

      ``subsampling`` can be:

         * `image.JPEG_SUBSAMPLING_AUTO`: Use the best subsampling for the image based on the quality.
         * `image.JPEG_SUBSAMPLING_444`: Use 4:4:4 subsampling.
         * `image.JPEG_SUBSAMPLING_422`: Use 4:2:2 subsampling.
         * `image.JPEG_SUBSAMPLING_420`: Use 4:2:0 subsampling.

      Returns the image object so you can call another method using ``.`` notation.

      .. note::

         `Image.compress` is an alias for `Image.to_jpeg`.

   .. method:: copy(x_scale:float=1.0, y_scale:float=1.0, roi:Optional[Tuple[int,int,int,int]]=None, rgb_channel:int=-1, alpha:int=255, color_palette:Optional[Union[int, Image]]=None, alpha_palette:Optional[Image]=None, hint:int=0, transform: ndarray | None = None, copy_to_fb:bool=False) -> Image

      Creates a deep copy of the image object.

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

      ``color_palette`` if not ``None`` can be an a color palette enum or
      a 256 pixel in total RGB565 image to use as a color lookup table on the grayscale value of
      whatever the source image is. This is applied after ``rgb_channel`` extraction if used.

      ``alpha_palette`` if not ``None`` can be a 256 pixel in total GRAYSCALE image to use as a alpha
      palette which modulates the ``alpha`` value of the source image being drawn at a pixel pixel
      level allowing you to precisely control the alpha value of pixels based on their grayscale value.
      A pixel value of 255 in the alpha lookup table is opaque which anything less than 255 becomes
      more transparent until 0. This is applied after ``rgb_channel`` extraction if used.

      ``hint`` is a logical OR of the flags listed in :ref:`Hint flags <image.Image.hint>` (excluding `image.BLACK_BACKGROUND` which is not supported here).

      ``transform`` is 3x3 ``ndarray`` that is used to perform a persepective transformation on the image. Only
      supported on the OpenMV Cam N6 currently as it has a GPU that can do this in hardware.

      ``copy_to_fb`` if True the image is loaded directly into the frame buffer.
      This has no special effect if the image is already in the frame buffer.

      Returns the image object so you can call another method using ``.`` notation.

   .. method:: crop(x_scale:float=1.0, y_scale:float=1.0, roi:Optional[Tuple[int,int,int,int]]=None, rgb_channel:int=-1, alpha:int=255, color_palette:Optional[Union[int, Image]]=None, alpha_palette:Optional[Image]=None, hint:int=0, transform: ndarray | None = None, copy:bool=False, copy_to_fb:bool=False) -> Image

      Modifies an image in-place without changing the underlying image type.

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

      ``color_palette`` if not ``None`` can be an a color palette enum or
      a 256 pixel in total RGB565 image to use as a color lookup table on the grayscale value of
      whatever the source image is. This is applied after ``rgb_channel`` extraction if used.

      ``alpha_palette`` if not ``None`` can be a 256 pixel in total GRAYSCALE image to use as a alpha
      palette which modulates the ``alpha`` value of the source image being drawn at a pixel pixel
      level allowing you to precisely control the alpha value of pixels based on their grayscale value.
      A pixel value of 255 in the alpha lookup table is opaque which anything less than 255 becomes
      more transparent until 0. This is applied after ``rgb_channel`` extraction if used.

      ``hint`` is a logical OR of the flags listed in :ref:`Hint flags <image.Image.hint>` (excluding `image.BLACK_BACKGROUND` which is not supported here).

      ``transform`` is 3x3 ``ndarray`` that is used to perform a persepective transformation on the image. Only
      supported on the OpenMV Cam N6 currently as it has a GPU that can do this in hardware.

      ``copy`` if True create a deep-copy on the heap of the image that's been converted versus converting the
      original image in-place.

      ``copy_to_fb`` if True the image is loaded directly into the frame buffer.
      ``copy_to_fb`` has priority over ``copy``. This has no special effect if the image is already in
      the frame buffer.

      Returns the image object so you can call another method using ``.`` notation.

   .. method:: scale(x_scale:float=1.0, y_scale:float=1.0, roi:Optional[Tuple[int,int,int,int]]=None, rgb_channel:int=-1, alpha:int=255, color_palette:Optional[Union[int, Image]]=None, alpha_palette:Optional[Image]=None, hint:int=0, transform: ndarray | None = None, copy:bool=False, copy_to_fb:bool=False) -> Image

      Modifies an image in-place without changing the underlying image type.

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

      ``color_palette`` if not ``None`` can be an a color palette enum or
      a 256 pixel in total RGB565 image to use as a color lookup table on the grayscale value of
      whatever the source image is. This is applied after ``rgb_channel`` extraction if used.

      ``alpha_palette`` if not ``None`` can be a 256 pixel in total GRAYSCALE image to use as a alpha
      palette which modulates the ``alpha`` value of the source image being drawn at a pixel pixel
      level allowing you to precisely control the alpha value of pixels based on their grayscale value.
      A pixel value of 255 in the alpha lookup table is opaque which anything less than 255 becomes
      more transparent until 0. This is applied after ``rgb_channel`` extraction if used.

      ``hint`` is a logical OR of the flags listed in :ref:`Hint flags <image.Image.hint>` (excluding `image.BLACK_BACKGROUND` which is not supported here).

      ``transform`` is 3x3 ``ndarray`` that is used to perform a persepective transformation on the image. Only
      supported on the OpenMV Cam N6 currently as it has a GPU that can do this in hardware.

      ``copy`` if True create a deep-copy on the heap of the image that's been converted versus converting the
      original image in-place.

      ``copy_to_fb`` if True the image is loaded directly into the frame buffer.
      ``copy_to_fb`` has priority over ``copy``. This has no special effect if the image is already in
      the frame buffer.

      Returns the image object so you can call another method using ``.`` notation.

      .. note::

         `Image.scale` is an alias for `Image.crop`.

   .. method:: save(path:str, roi:Optional[Tuple[int,int,int,int]]=None, quality:int=50) -> Image

      Saves a copy of the image to the filesystem at ``path``.

      Supports bmp/pgm/ppm/jpg/jpeg image files. Note that you cannot save jpeg
      compressed images to an uncompressed format.

      ``roi`` is the region-of-interest rectangle (x, y, w, h) to save from.
      If not specified, it is equal to the image rectangle which copies the entire
      image. This argument is not applicable for JPEG images.

      ``quality`` is the jpeg compression quality to use to save the image to jpeg
      format if the image is not already compressed (0-100) (int).

      Returns the image object so you can call another method using ``.`` notation.

   .. method:: flush() -> None

      Updates the frame buffer in the IDE with the image in the frame buffer on the camera.

   Drawing Methods
   ~~~~~~~~~~~~~~~

   .. method:: clear(mask:Optional[Image]=None) -> Image

      Sets all pixels in the image to zero (very fast).

      ``mask`` is another image to use as a pixel level mask for the operation.
      The mask should be an image with just black or white pixels and should be the
      same size as the image being operated on. Only pixels set in the mask are
      modified.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images.

   .. method:: draw_line(x0:int, y0:int, x1:int, y1:int, color:Optional[Union[int, Tuple[int,int,int]]]=None, thickness:int=1) -> Image

      Draws a line from (x0, y0) to (x1, y1) on the image. You may either
      pass x0, y0, x1, y1 separately or as a tuple (x0, y0, x1, y1).

      ``color`` is an RGB888 tuple for Grayscale or RGB565 images. Defaults to
      white. However, you may also pass the underlying pixel value (0-255) for
      grayscale images or a RGB565 value for RGB565 images.

      ``thickness`` controls how thick the line is in pixels.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images or bayer images.

   .. method:: draw_rectangle(x:int, y:int, w:int, h:int, color:Optional[Union[int, Tuple[int,int,int]]]=None, thickness:int=1, fill:bool=False) -> Image

      Draws a rectangle on the image. You may either pass x, y, w, h separately
      or as a tuple (x, y, w, h).

      ``color`` is an RGB888 tuple for Grayscale or RGB565 images. Defaults to
      white. However, you may also pass the underlying pixel value (0-255) for
      grayscale images or a RGB565 value for RGB565 images.

      ``thickness`` controls how thick the lines are in pixels.

      Pass ``fill`` set to True to fill the rectangle.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images or bayer images.

   .. method:: draw_circle(x:int, y:int, radius:int, color:Optional[Union[int, Tuple[int,int,int]]]=None, thickness:int=1, fill:bool=False) -> Image

      Draws a circle on the image. You may either pass x, y, radius separately or
      as a tuple (x, y, radius).

      ``color`` is an RGB888 tuple for Grayscale or RGB565 images. Defaults to
      white. However, you may also pass the underlying pixel value (0-255) for
      grayscale images or a RGB565 value for RGB565 images.

      ``thickness`` controls how thick the edges are in pixels.

      Pass ``fill`` set to True to fill the circle.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images or bayer images.

   .. method:: draw_ellipse(cx:int, cy:int, rx:int, ry:int, rotation:int, color:Optional[Union[int, Tuple[int,int,int]]]=None, thickness:int=1, fill:bool=False) -> Image

      Draws an ellipse on the image. You may either pass cx, cy, rx, ry, and the
      rotation (in degrees) separately or as a tuple (cx, yc, rx, ry, rotation).

      ``color`` is an RGB888 tuple for Grayscale or RGB565 images. Defaults to
      white. However, you may also pass the underlying pixel value (0-255) for
      grayscale images or a RGB565 value for RGB565 images.

      ``thickness`` controls how thick the edges are in pixels.

      Pass ``fill`` set to True to fill the ellipse.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images or bayer images.

   .. method:: draw_string(x:int, y:int, text:str, color:Optional[Union[int, Tuple[int,int,int]]]=None, scale:float=1, x_spacing:int=0, y_spacing:int=0, mono_space:bool=True, char_rotation:int=0, char_hmirror:bool=False, char_vflip:bool=False, string_rotation:int=0, string_hmirror:bool=False, string_vflip:bool=False) -> Image

      Draws 8x10 text starting at location (x, y) in the image. You may either pass
      x, y separately or as a tuple (x, y).

      ``text`` is a string to write to the image. ``\n``, ``\r``, and ``\r\n``
      line endings move the cursor to the next line.

      ``color`` is an RGB888 tuple for Grayscale or RGB565 images. Defaults to
      white. However, you may also pass the underlying pixel value (0-255) for
      grayscale images or a RGB565 value for RGB565 images.

      ``scale`` may be increased to increase/decrease the size of the text on the
      image. You can pass greater than 0 integer or floating point values.

      ``x_spacing`` allows you to add (if positive) or subtract (if negative) x
      pixels between cahracters.

      ``y_spacing`` allows you to add (if positive) or subtract (if negative) y
      pixels between cahracters (for multi-line text).

      ``mono_space`` defaults to True which forces text to be fixed spaced. For
      large text scales this looks terrible. Set the False to get non-fixed width
      character spacing which looks A LOT better.

      ``char_rotation`` may be 0, 90, 180, 270 to rotate each character in the
      string by this amount.

      ``char_hmirror`` if True horizontally mirrors all characters in the string.

      ``char_vflip`` if True vertically flips all characters in the string.

      ``string_rotation`` may be 0, 90, 180, 270 to rotate the string by this
      amount.

      ``string_hmirror`` if True horizontally mirrors the string.

      ``string_vflip`` if True vertically flips the string.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images or bayer images.

   .. method:: draw_cross(x:int, y:int, color:Optional[Union[int, Tuple[int,int,int]]]=None, size:int=5, thickness:int=1) -> Image

      Draws a cross at location x, y. You may either pass x, y separately or as a
      tuple (x, y).

      ``color`` is an RGB888 tuple for Grayscale or RGB565 images. Defaults to
      white. However, you may also pass the underlying pixel value (0-255) for
      grayscale images or a RGB565 value for RGB565 images.

      ``size`` controls how long the lines of the cross extend.

      ``thickness`` controls how thick the edges are in pixels.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images or bayer images.

   .. method:: draw_arrow(x0:int, y0:int, x1:int, y1:int, color:Optional[Union[int, Tuple[int,int,int]]]=None, thickness:int=1) -> Image

      Draws an arrow from (x0, y0) to (x1, y1) on the image. You may
      either pass x0, y0, x1, y1 separately or as a tuple (x0, y0, x1, y1).

      ``color`` is an RGB888 tuple for Grayscale or RGB565 images. Defaults to
      white. However, you may also pass the underlying pixel value (0-255) for
      grayscale images or a RGB565 value for RGB565 images.

      ``thickness`` controls how thick the line is in pixels.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images or bayer images.

   .. method:: draw_detection(detection:Tuple[int,int,int,int,int,int], color1:Optional[Union[int, Tuple[int,int,int]]]=None, color2:Optional[Union[int, Tuple[int,int,int]]]=None, size:int=5, thickness:int=1, fill:bool=False, label:Optional[str]=None, label_offset:Optional[Tuple[int,int]]=None) -> Image

      Draws a detection result onto the image. ``detection`` is a 6-tuple
      ``(rx, ry, rw, rh, cx, cy)`` describing a bounding rectangle and a
      centroid (typically returned by NN or color tracking code).

      ``color1`` is the rectangle color and ``color2`` is the centroid cross color.
      ``size`` is the centroid cross size, ``thickness`` controls outline width,
      and ``fill`` fills the rectangle.

      ``label`` if provided is drawn near the rectangle, offset by ``label_offset``
      ``(x, y)``.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images or bayer images.

   .. method:: draw_edges(corners:List[Tuple[int,int]], color:Optional[Union[int, Tuple[int,int,int]]]=None, size:int=0, thickness:int=1, fill:bool=False) -> Image

      Draws line edges between a corner list returned by methods like `blob.corners`. Coners is
      a four valued tuple of two valued x/y tuples. E.g. [(x1,y1),(x2,y2),(x3,y3),(x4,y4)].

      ``color`` is an RGB888 tuple for Grayscale or RGB565 images. Defaults to
      white. However, you may also pass the underlying pixel value (0-255) for
      grayscale images or a RGB565 value for RGB565 images.

      ``size`` if greater than 0 causes the corners to be drawn as circles of radius ``size``.

      ``thickness`` controls how thick the line is in pixels.

      Pass ``fill`` set to True to fill the corner circles if drawn.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images or bayer images.

   .. method:: draw_image(image:Image, x:int=0, y:int=0, x_scale:float=1.0, y_scale:float=1.0, roi:Optional[Tuple[int,int,int,int]]=None, rgb_channel:int=-1, alpha:int=255, color_palette:Optional[Union[int, Image]]=None, alpha_palette:Optional[Image]=None, hint:int=0, transform: ndarray | None = None, mask:Optional[Image]=None) -> Image

      Draws an ``image`` whose top-left corner starts at location x, y. You may either pass x, y
      separately or as a tuple (x, y). This method automatically handles rendering the image passed
      into the correct pixel format for the destination image while also handling clipping seamlessly.

      You may also pass a path instead of an image object for this method to automatically load the image
      from disk and use it in one step. E.g. ``draw_image("test.jpg")``.

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

      ``color_palette`` if not ``None`` can be an a color palette enum or
      a 256 pixel in total RGB565 image to use as a color lookup table on the grayscale value of
      whatever the source image is. This is applied after ``rgb_channel`` extraction if used.

      ``alpha_palette`` if not ``None`` can be a 256 pixel in total GRAYSCALE image to use as a alpha
      palette which modulates the ``alpha`` value of the source image being drawn at a pixel pixel
      level allowing you to precisely control the alpha value of pixels based on their grayscale value.
      A pixel value of 255 in the alpha lookup table is opaque which anything less than 255 becomes
      more transparent until 0. This is applied after ``rgb_channel`` extraction if used.

      ``hint`` is a logical OR of the flags listed in :ref:`Hint flags <image.Image.hint>` (including `image.BLACK_BACKGROUND` which is supported here).

      ``transform`` is 3x3 ``ndarray`` that is used to perform a persepective transformation on the image. Only
      supported on the OpenMV Cam N6 currently as it has a GPU that can do this in hardware.

      Returns the image object so you can call another method using ``.`` notation.

   .. method:: draw_keypoints(keypoints: kp_desc | List[Tuple[int, int, int]], color:Optional[Union[int, Tuple[int,int,int]]]=None, size:int=10, thickness:int=1, fill:bool=False) -> Image

      Draws the keypoints of a keypoints object on the image. You may also pass a
      list of three value tuples containing the (x, y, rotation_angle_in_degrees) to
      re-use this method for drawing keypoint glyphs which are a cirle with a line
      pointing in a particular direction.

      ``color`` is an RGB888 tuple for Grayscale or RGB565 images. Defaults to
      white. However, you may also pass the underlying pixel value (0-255) for
      grayscale images or a RGB565 value for RGB565 images.

      ``size`` controls how large the keypoints are.

      ``thickness`` controls how thick the line is in pixels.

      Pass ``fill`` set to True to fill the keypoints.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images or bayer images.

   .. method:: flood_fill(x:int, y:int, seed_threshold:float=0.05, floating_threshold:float=0.05, color:Optional[Union[int, Tuple[int,int,int]]]=None, invert:bool=False, clear_background:bool=False, mask:Optional[Image]=None) -> Image

      Flood fills a region of the image starting from location x, y. You may either
      pass x, y separately or as a tuple (x, y).

      ``seed_threshold`` controls how different any pixel in the fill area may be
      from the original starting pixel.

      ``floating_threshold`` controls how different any pixel in the fill area may
      be from any neighbor pixels.

      ``color`` is an RGB888 tuple for Grayscale or RGB565 images. Defaults to
      white. However, you may also pass the underlying pixel value (0-255) for
      grayscale images or a RGB565 value for RGB565 images.

      Pass ``invert`` as True to re-color everything outside of the flood-fill
      connected area.

      Pass ``clear_background`` as True to zero the rest of the pixels that
      flood-fill did not re-color.

      ``mask`` is another image to use as a pixel level mask for the operation.
      The mask should be an image with just black or white pixels and should be the
      same size as the image being operated on. Only pixels set in the mask are
      evaluated when flood filling.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images or bayer images.

      This method is not available on the OpenMV Cam M4.

   .. method:: draw_event_histogram(array: ndarray, clear:bool=True, brightness:int=128, contrast:int=16) -> Image

      Draws an ndarray of events from the GENX320 camera module onto an `Image`. The image
      buffer should be a 320x320 GRAYSCALE image.

      ``clear`` if True zeros the image buffer before drawing on it.

      ``brightness`` controls the default value of pixels to be cleared to.

      ``contrast`` controls how much to add/subtract from a pixel per event in the ndarray
      of events (events can be positive or negative). Values are clampped between 0-255.

   Masking Methods
   ~~~~~~~~~~~~~~~

   .. method:: mask_rectangle(x:int, y:int, w:int, h:int) -> Image

      Zeros a rectangular part of the image. If no arguments are supplied this
      method zeros the center of the image.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images or bayer images.

   .. method:: mask_circle(x:int, y:int, radius:int) -> Image

      Zeros a circular part of the image. If no arguments are supplied this
      method zeros the center of the image.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images or bayer images.

   .. method:: mask_ellipse(x:int, y:int, radius_x:int, radius_y:int, rotation_angle_in_degrees:int) -> Image

      Zeros an ellipsed shaped part of the image. If no arguments are supplied this
      method zeros the center of the image.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images or bayer images.

   Binary Methods
   ~~~~~~~~~~~~~~

   .. method:: binary(thresholds:List[Tuple[int,int]], invert:bool=False, zero:bool=False, mask:Optional[Image]=None, to_bitmap:bool=False, copy:bool=False) -> Image

      Sets all pixels in the image to black or white depending on whether each
      pixel is inside one of the threshold tuples in ``thresholds``.

      ``thresholds`` is a list of ``(lo, hi)`` tuples for grayscale images, or
      ``(l_lo, l_hi, a_lo, a_hi, b_lo, b_hi)`` tuples for RGB565 images.
      Swapped min/max values are auto-fixed; missing components default to
      maximum range.

      ``invert`` inverts the threshold matching.

      ``zero`` if True, zeros thresholded pixels and leaves others untouched.

      ``mask`` is a binary image used as a pixel-level mask; only pixels set
      in the mask are modified.

      ``to_bitmap`` if True, converts the image data to a 1-bit-per-pixel
      bitmap. For very small images this may require ``copy=True``.

      ``copy`` if True, returns a new image on the heap instead of modifying
      the source image.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images or bayer images.

   .. method:: invert() -> Image

      Inverts all pixel values in the image (each pixel becomes ``255 - pixel``
      for 8-bit channels).

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images or bayer/yuv images.

   .. method:: b_and(image:Image, mask:Optional[Image]=None) -> Image

      Logically ANDs this image with another image.

      ``image`` can be an image object, a path to an uncompressed image file
      (bmp/pgm/ppm), or a scalar value (RGB888 tuple or underlying pixel value).

      ``mask`` is a binary image used as a pixel-level mask; only pixels set
      in the mask are modified.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images or bayer images.

   .. method:: b_nand(image:Image, mask:Optional[Image]=None) -> Image

      Logically NANDs this image with another image.

      ``image`` can be an image object, a path to an uncompressed image file
      (bmp/pgm/ppm), or a scalar value (RGB888 tuple or underlying pixel value).

      ``mask`` is a binary image used as a pixel-level mask; only pixels set
      in the mask are modified.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images or bayer images.

   .. method:: b_or(image:Image, mask:Optional[Image]=None) -> Image

      Logically ORs this image with another image.

      ``image`` can be an image object, a path to an uncompressed image file
      (bmp/pgm/ppm), or a scalar value (RGB888 tuple or underlying pixel value).

      ``mask`` is a binary image used as a pixel-level mask; only pixels set
      in the mask are modified.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images or bayer images.

   .. method:: b_nor(image:Image, mask:Optional[Image]=None) -> Image

      Logically NORs this image with another image.

      ``image`` can be an image object, a path to an uncompressed image file
      (bmp/pgm/ppm), or a scalar value (RGB888 tuple or underlying pixel value).

      ``mask`` is a binary image used as a pixel-level mask; only pixels set
      in the mask are modified.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images or bayer images.

   .. method:: b_xor(image:Image, mask:Optional[Image]=None) -> Image

      Logically XORs this image with another image.

      ``image`` can be an image object, a path to an uncompressed image file
      (bmp/pgm/ppm), or a scalar value (RGB888 tuple or underlying pixel value).

      ``mask`` is a binary image used as a pixel-level mask; only pixels set
      in the mask are modified.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images or bayer images.

   .. method:: b_xnor(image:Image, mask:Optional[Image]=None) -> Image

      Logically XNORs this image with another image.

      ``image`` can be an image object, a path to an uncompressed image file
      (bmp/pgm/ppm), or a scalar value (RGB888 tuple or underlying pixel value).

      ``mask`` is a binary image used as a pixel-level mask; only pixels set
      in the mask are modified.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images or bayer images.

   ISP Methods
   ~~~~~~~~~~~

   .. method:: awb(max:bool=False) -> Image

      Performs automatic white balance on the image using the gray-world
      algorithm. Operates on RAW Bayer or RGB565 images. Has no effect on
      binary/grayscale images.

      ``max`` if True, uses the white-patch algorithm instead.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed or yuv images.

   .. method:: ccm(matrix:List[List[float]]) -> Image

      Multiplies the passed floating-point color-correction-matrix with the
      image. Matrices may be 3x3 or 3x4 (with offset column), in nested list
      or flat list form::

          [[rr, rg, rb], [gr, gg, gb], [br, bg, bb]]
          [[rr, rg, rb, ro], [gr, gg, gb, go], [br, bg, bb, bo]]
          [rr, rg, rb, ro, gr, gg, gb, go, br, bg, bb, bo]

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images or bayer/yuv images.

   .. method:: gamma(gamma:float=1.0, contrast:float=1.0, brightness:float=0.0) -> Image

      Adjusts the image gamma, contrast, and brightness.

      ``gamma`` applies ``pow(pixel, 1/gamma)`` after normalization. Values
      greater than 1.0 brighten; less than 1.0 darken.

      ``contrast`` applies ``pixel * contrast`` after normalization.

      ``brightness`` applies ``pixel + brightness`` after normalization.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed or bayer/yuv images.

   .. method:: gamma_corr(gamma:float=1.0, contrast:float=1.0, brightness:float=0.0) -> Image

      Alias for `Image.gamma`.

   Math Methods
   ~~~~~~~~~~~~

   .. method:: negate() -> Image

      Alias for `Image.invert`.

   .. method:: replace(image:Optional[Image]=None, **kwargs) -> Image

      Alias for `Image.draw_image()`. Replaces this image with ``image`` (or
      transforms this image in place if ``image`` is omitted) using the standard
      `draw_image` keyword arguments. The ``transform`` argument is a 3x3
      ``ndarray`` describing a perspective transformation (only supported on
      OpenMV cameras with ULAB enabled).

   .. method:: assign(image:Optional[Image]=None, **kwargs) -> Image

      Alias for `Image.replace()`.

   .. method:: set(image:Optional[Image]=None, **kwargs) -> Image

      Alias for `Image.replace()`.

   .. method:: add(image:Image, mask:Optional[Image]=None) -> Image

      Adds an image pixel-wise to this one.

      ``image`` can be an image object, a path to an uncompressed image file
      (bmp/pgm/ppm), or a scalar value (RGB888 tuple or underlying pixel value).

      ``mask`` is a binary image used as a pixel-level mask; only pixels set
      in the mask are modified.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images or bayer images.

   .. method:: sub(image:Image, mask:Optional[Image]=None) -> Image

      Subtracts ``image`` pixel-wise from this image (``self - image``).

      ``image`` can either be an image object, a path to an uncompressed image
      file (bmp/pgm/ppm), or a scalar value (RGB888 tuple or underlying pixel value).

      ``mask`` is a binary image used as a pixel-level mask; only pixels set in
      the mask are modified.

      This method also accepts the full set of `Image.draw_image()` keyword
      arguments (``x``, ``y``, ``x_scale``, ``y_scale``, ``roi``, ``rgb_channel``,
      ``alpha``, ``color_palette``, ``alpha_palette``, ``hint``, ``transform``).

      Not supported on compressed images or bayer images.

   .. method:: rsub(image:Image, mask:Optional[Image]=None) -> Image

      Reverse subtract: replaces this image with ``image - self`` pixel-wise.
      Otherwise identical to `Image.sub()`.

   .. method:: min(image:Image, mask:Optional[Image]=None) -> Image

      Returns the minimum image of two images pixel-wise.

      ``image`` can be an image object, a path to an uncompressed image file
      (bmp/pgm/ppm), or a scalar value (RGB888 tuple or underlying pixel value).

      ``mask`` is a binary image used as a pixel-level mask; only pixels set
      in the mask are modified.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images or bayer images.

   .. method:: max(image:Image, mask:Optional[Image]=None) -> Image

      Returns the maximum image of two images pixel-wise.

      ``image`` can be an image object, a path to an uncompressed image file
      (bmp/pgm/ppm), or a scalar value (RGB888 tuple or underlying pixel value).

      ``mask`` is a binary image used as a pixel-level mask; only pixels set
      in the mask are modified.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images or bayer images.

   .. method:: difference(image:Image, mask:Optional[Image]=None) -> Image

      Returns the absolute difference image between two images (e.g. ||a-b||).

      ``image`` can be an image object, a path to an uncompressed image file
      (bmp/pgm/ppm), or a scalar value (RGB888 tuple or underlying pixel value).

      ``mask`` is a binary image used as a pixel-level mask; only pixels set
      in the mask are modified.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images or bayer images.

   .. method:: blend(image:Image, x:int=0, y:int=0, alpha:int=128, mask:Optional[Image]=None, **kwargs) -> Image

      Alias for `Image.draw_image()`. Alpha-blends ``image`` into this image.
      ``alpha`` is an integer 0-256; values closer to 256 favor the source image.
      Accepts all `Image.draw_image()` keyword arguments.

   .. method:: histeq(adaptive:bool=False, clip_limit:float=-1, mask:Optional[Image]=None) -> Image

      Runs histogram equalization on the image to normalize contrast and
      brightness.

      ``adaptive`` if True, runs adaptive histogram equalization (slower but
      generally better).

      ``clip_limit`` limits contrast in the adaptive variant (a small value
      like 10 produces good CLAHE results).

      ``mask`` is a binary image used as a pixel-level mask; only pixels set
      in the mask are modified.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images or bayer images.

   Filtering Methods
   ~~~~~~~~~~~~~~~~~

   .. method:: erode(size:int, threshold:Optional[int]=None, mask:Optional[Image]=None) -> Image

      Removes pixels from the edges of segmented areas. Convolves a
      ``((size*2)+1)x((size*2)+1)`` kernel across the image, clearing the
      center pixel if more than ``threshold`` neighbors are clear (acts as
      standard erode if ``threshold`` is None).

      ``mask`` is a binary image used as a pixel-level mask; only pixels set
      in the mask are modified.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images or bayer/yuv images.

   .. method:: dilate(size:int, threshold:Optional[int]=None, mask:Optional[Image]=None) -> Image

      Adds pixels to the edges of segmented areas. Convolves a
      ``((size*2)+1)x((size*2)+1)`` kernel across the image, setting the
      center pixel if more than ``threshold`` neighbors are set (acts as
      standard dilate if ``threshold`` is None).

      ``mask`` is a binary image used as a pixel-level mask; only pixels set
      in the mask are modified.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images or bayer/yuv images.

   .. method:: open(size:int, threshold:Optional[int]=None, mask:Optional[Image]=None) -> Image

      Performs erosion then dilation. See `Image.erode()` and `Image.dilate()`.

      ``mask`` is a binary image used as a pixel-level mask; only pixels set
      in the mask are modified.

      Not supported on compressed images or bayer/yuv images.

   .. method:: close(size:int, threshold:Optional[int]=None, mask:Optional[Image]=None) -> Image

      Performs dilation then erosion. See `Image.dilate()` and `Image.erode()`.

      ``mask`` is a binary image used as a pixel-level mask; only pixels set
      in the mask are modified.

      Not supported on compressed images or bayer/yuv images.

   .. method:: top_hat(size:int, threshold:Optional[int]=None, mask:Optional[Image]=None) -> Image

      Returns the image difference of the image and the `Image.open()`-ed image.

      ``mask`` is a binary image used as a pixel-level mask; only pixels set
      in the mask are modified.

      Not supported on compressed images or bayer/yuv images.

   .. method:: black_hat(size:int, threshold:Optional[int]=None, mask:Optional[Image]=None) -> Image

      Returns the image difference of the image and the `Image.close()`-ed image.

      ``mask`` is a binary image used as a pixel-level mask; only pixels set
      in the mask are modified.

      Not supported on compressed images or bayer/yuv images.

   .. method:: mean(size:int, threshold:Optional[bool]=False, offset:Optional[int]=0, invert:Optional[bool]=False, mask:Optional[Image]=None) -> Image

      Standard mean blurring filter using a box filter.

      ``size`` is the kernel size. Use 1 (3x3 kernel), 2 (5x5 kernel), etc.

      ``threshold`` if True, adaptively thresholds the filter output to a
      binary image. ``offset`` shifts the binarization (negative makes more
      pixels white, positive makes fewer). ``invert`` inverts the binary
      output.

      ``mask`` is a binary image used as a pixel-level mask; only pixels set
      in the mask are modified.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images or bayer/yuv images.

   .. method:: median(size:int, percentile:Optional[float]=0.5, threshold:Optional[bool]=False, offset:Optional[int]=0, invert:Optional[bool]=False, mask:Optional[Image]=None) -> Image

      Runs a percentile filter on the image (median by default).

      ``size`` is the kernel size. Use 1 (3x3 kernel), 2 (5x5 kernel), etc.

      ``percentile`` is the percentile to select from each kernel (0 = min,
      0.5 = median, 1.0 = max). Defaults to 0.5.

      ``threshold`` if True, adaptively thresholds the filter output to a
      binary image. ``offset`` shifts the binarization (negative makes more
      pixels white, positive makes fewer). ``invert`` inverts the binary
      output.

      ``mask`` is a binary image used as a pixel-level mask; only pixels set
      in the mask are modified.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images or bayer/yuv images.

   .. method:: mode(size:int, threshold:Optional[bool]=False, offset:Optional[int]=0, invert:Optional[bool]=False, mask:Optional[Image]=None) -> Image

      Replaces each pixel with the mode of its neighbors. May produce
      artifacts on RGB image edges due to the non-linear operation.

      ``size`` is the kernel size. Use 1 (3x3 kernel), 2 (5x5 kernel), etc.

      ``threshold`` if True, adaptively thresholds the filter output to a
      binary image. ``offset`` shifts the binarization (negative makes more
      pixels white, positive makes fewer). ``invert`` inverts the binary
      output.

      ``mask`` is a binary image used as a pixel-level mask; only pixels set
      in the mask are modified.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images or bayer/yuv images.

   .. method:: midpoint(size:int, bias:Optional[float]=0.5, threshold:Optional[bool]=False, offset:Optional[int]=0, invert:Optional[bool]=False, mask:Optional[Image]=None) -> Image

      Runs the midpoint filter on the image. This filter finds the midpoint
      ((max-min)/2) of each pixel neighborhood in the image.

      ``size`` is the kernel size. Use 1 (3x3 kernel), 2 (5x5 kernel), etc.

      ``bias`` controls the min/max mixing. 0 for min filtering only, 1.0 for max
      filtering only. By using the ``bias`` you can min/max filter the image.

      ``threshold`` if True, adaptively thresholds the filter output to a
      binary image. ``offset`` shifts the binarization (negative makes more
      pixels white, positive makes fewer). ``invert`` inverts the binary
      output.

      ``mask`` is a binary image used as a pixel-level mask; only pixels set
      in the mask are modified.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images or bayer/yuv images.

   .. method:: morph(size:int, kernel:list, mul:Optional[float]=1.0, add:Optional[float]=0.0, threshold:Optional[bool]=False, offset:Optional[int]=0, invert:Optional[bool]=False, mask:Optional[Image]=None) -> Image

      Convolves the image with an arbitrary filter kernel.

      ``size`` controls the kernel size, which must be
      ``((size*2)+1)x((size*2)+1)`` elements.

      ``kernel`` is the kernel to convolve with, as a flat 1D list/tuple of
      ``((size*2)+1)*((size*2)+1)`` elements, or as a 2D list/tuple with
      ``((size*2)+1)`` rows of ``((size*2)+1)`` elements.

      ``mul`` is a multiplicative contrast scale (default 1.0).

      ``add`` is an additive brightness offset (default 0.0).

      ``threshold`` if True, adaptively thresholds the filter output to a
      binary image. ``offset`` shifts the binarization (negative makes more
      pixels white, positive makes fewer). ``invert`` inverts the binary
      output.

      ``mask`` is a binary image used as a pixel-level mask; only pixels set
      in the mask are modified.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images or bayer/yuv images.

   .. method:: gaussian(size:int, unsharp:Optional[bool]=False, mul:Optional[float]=1.0, add:Optional[float]=0.0, threshold:Optional[bool]=False, offset:Optional[int]=0, invert:Optional[bool]=False, mask:Optional[Image]=None) -> Image

      Convolves the image with a smoothing gaussian kernel.

      ``size`` is the kernel size. Use 1 (3x3 kernel), 2 (5x5 kernel), etc.

      ``unsharp`` if True, performs an unsharp mask operation (sharpens edges)
      instead of a plain gaussian.

      ``mul`` is a multiplicative contrast scale (default 1.0).

      ``add`` is an additive brightness offset (default 0.0).

      ``threshold`` if True, adaptively thresholds the filter output to a
      binary image. ``offset`` shifts the binarization (negative makes more
      pixels white, positive makes fewer). ``invert`` inverts the binary
      output.

      ``mask`` is a binary image used as a pixel-level mask; only pixels set
      in the mask are modified.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images or bayer/yuv images.

   .. method:: laplacian(size:int, sharpen:Optional[bool]=False, mul:Optional[float]=1.0, add:Optional[float]=0.0, threshold:Optional[bool]=False, offset:Optional[int]=0, invert:Optional[bool]=False, mask:Optional[Image]=None) -> Image

      Convolves the image with an edge-detecting laplacian kernel.

      ``size`` is the kernel size. Use 1 (3x3 kernel), 2 (5x5 kernel), etc.

      ``sharpen`` if True, sharpens the image instead of outputting the raw
      unthresholded edge response.

      ``mul`` is a multiplicative contrast scale (default 1.0).

      ``add`` is an additive brightness offset (default 0.0).

      ``threshold`` if True, adaptively thresholds the filter output to a
      binary image. ``offset`` shifts the binarization (negative makes more
      pixels white, positive makes fewer). ``invert`` inverts the binary
      output.

      ``mask`` is a binary image used as a pixel-level mask; only pixels set
      in the mask are modified.

      Returns the image object so you can call another method using ``.`` notation.

     Not supported on compressed images or bayer/yuv images.

   .. method:: bilateral(size:int, color_sigma:Optional[float]=0.1, space_sigma:Optional[float]=1.0, threshold:Optional[bool]=False, offset:Optional[int]=0, invert:Optional[bool]=False, mask:Optional[Image]=None) -> Image

      Convolves the image with a bilateral filter (edge-preserving smoothing).

      ``size`` is the kernel size. Use 1 (3x3 kernel), 2 (5x5 kernel), etc.

      ``color_sigma`` controls color matching tolerance; larger values produce
      more color blurring.

      ``space_sigma`` controls spatial blurring; larger values produce more
      pixel blurring.

      ``threshold`` if True, adaptively thresholds the filter output to a
      binary image. ``offset`` shifts the binarization (negative makes more
      pixels white, positive makes fewer). ``invert`` inverts the binary
      output.

      ``mask`` is a binary image used as a pixel-level mask; only pixels set
      in the mask are modified.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images or bayer/yuv images.

   Geometric Methods
   ~~~~~~~~~~~~~~~~~

   .. method:: linpolar(reverse:bool=False) -> Image

      Re-project's and image from cartessian coordinates to linear polar coordinates.

      Set ``reverse=True`` to re-project in the opposite direction.

      Linear polar re-projection turns rotation of an image into x-translation.

      Not supported on compressed images or bayer images.

      This method is not available on the OpenMV Cam M4.

   .. method:: logpolar(reverse:bool=False) -> Image

      Re-project's and image from cartessian coordinates to log polar coordinates.

      Set ``reverse=True`` to re-project in the opposite direction.

      Log polar re-projection turns rotation of an image into x-translation
      and scaling/zooming into y-translation.

      Not supported on compressed images or bayer images.

      This method is not available on the OpenMV Cam M4.

   .. method:: lens_corr(strength:float=1.8, zoom:float=1.0, x_corr:float=0.0, y_corr:float=0.0) -> Image

      Performs lens correction to un-fisheye the image due to the lens distortion.

      ``strength`` is a float defining how much to un-fisheye the image. Try 1.8
      out by default and then increase or decrease from there until the image
      looks good.

      ``zoom`` is the amount to zoom in on the image by. 1.0 by default.

      ``x_corr`` floating point pixel offset from center. Can be negative or positive.

      ``y_corr`` floating point pixel offset from center. Can be negative or positive.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images or bayer images.

   .. method:: rotation_corr(x_rotation:float=0.0, y_rotation:float=0.0, z_rotation:float=0.0, x_translation:float=0.0, y_translation:float=0.0, zoom:float=1.0, fov:float=60.0, corners:Optional[List[Tuple[int,int]]]=None) -> Image

      Corrects perspective issues in the image by doing a 3D rotation of the frame buffer.

      ``x_rotation`` is the number of degrees to rotation the image in the frame buffer
      around the x axis (i.e. this spins the image up and down).

      ``y_rotation`` is the number of degrees to rotation the image in the frame buffer
      around the y axis (i.e. this spins the image left and right).

      ``z_rotation`` is the number of degrees to rotation the image in the frame buffer
      around the z axis (i.e. this spins the image in place).

      ``x_translation`` is the number of units to move the image to the left or right
      after rotation. Because this translation is applied in 3D space the units aren't pixels...

      ``y_translation`` is the number of units to move the image to the up or down
      after rotation. Because this translation is applied in 3D space the units aren't pixels...

      ``zoom`` is the amount to zoom in on the image by. 1.0 by default.

      ``fov`` is the field-of-view used for the internal 2D->3D projection.
      As ``fov`` approaches 0 the image is placed at infinity; as it
      approaches 180 the image is placed within the viewport.

      ``corners`` is a list of four (x, y) tuples used to build a 4-point
      homography mapping the corners to (0, 0), (image_width-1, 0),
      (image_width-1, image_height-1), and (0, image_height-1) before
      applying the 3D rotation. Useful for birds-eye-view transforms.

      Returns the image object so you can call another method using ``.`` notation.

      Not supported on compressed images or bayer images.

      This method is not available on the OpenMV Cam M4.

   Get Methods
   ~~~~~~~~~~~

   .. method:: get_similarity(image:Image, x:int=0, y:int=0, x_scale:float=1.0, y_scale:float=1.0, roi:Optional[Tuple[int,int,int,int]]=None, rgb_channel:int=-1, alpha:int=255, color_palette:Optional[Union[int, Image]]=None, alpha_palette:Optional[Image]=None, hint:int=0, transform: ndarray | None = None, dssim:bool=False) -> Similarity

      Computes the similarity between two images using the Structural
      Similarity Index (SSIM). SSIM ranges from -1 (opposite) to 1 (identical).
      Returns an `image.similarity` object.

      ``image`` is the image to compare to (an image object or a path string,
      e.g. ``"test.jpg"``).

      ``x``, ``y``, ``x_scale``, ``y_scale``, ``roi``, ``rgb_channel``,
      ``alpha``, ``color_palette``, ``alpha_palette``, ``hint``, and
      ``transform`` accept the same values as `Image.draw_image()`.

      ``dssim`` if True, returns the Structural Dissimilarity Index (DSSIM)
      instead, where 0 means identical and 1 means completely different.

   .. method:: get_histogram(thresholds:Optional[List[Tuple[int,int]]]=None, invert:bool=False, roi:Optional[Tuple[int,int,int,int]]=None, bins:int=-1, l_bins:int=-1, a_bins:int=-1, b_bins:int=-1, difference:Optional[Image]=None) -> histogram

      Computes the normalized histogram on all color channels for an ``roi``
      and returns an `image.histogram` object. Also available as
      ``Image.get_hist()`` or ``Image.histogram()``.

      ``thresholds`` is a list of ``(lo, hi)`` tuples for grayscale images, or
      ``(l_lo, l_hi, a_lo, a_hi, b_lo, b_hi)`` tuples for RGB565 images. If
      passed, the histogram is computed only over pixels within the thresholds.

      ``invert`` inverts the threshold matching.

      ``roi`` is the region-of-interest rectangle tuple (x, y, w, h). Defaults
      to the image rectangle.

      ``bins`` (grayscale) or ``l_bins``/``a_bins``/``b_bins`` (RGB565) set the
      number of histogram bins per channel. Must be greater than 2. Defaults
      to the maximum bins per channel.

      ``difference`` may be set to an image object to operate on the difference
      between the current image and that image without an extra buffer.

      Not supported on compressed images or bayer images.

   .. method:: get_statistics(thresholds:Optional[List[Tuple[int,int]]]=None, invert:bool=False, roi:Optional[Tuple[int,int,int,int]]=None, bins:int=-1, l_bins:int=-1, a_bins:int=-1, b_bins:int=-1, difference:Optional[Image]=None) -> statistics

      Computes the mean, median, mode, standard deviation, min, max, lower
      quartile, and upper quartile for all color channels for an ``roi`` and
      returns an `image.statistics` object. Also available as
      ``Image.get_stats()`` or ``Image.statistics()``.

      ``thresholds`` is a list of ``(lo, hi)`` tuples for grayscale images, or
      ``(l_lo, l_hi, a_lo, a_hi, b_lo, b_hi)`` tuples for RGB565 images. If
      passed, statistics are computed only over pixels within the thresholds.

      ``invert`` inverts the threshold matching.

      ``roi`` is the region-of-interest rectangle tuple (x, y, w, h). Defaults
      to the image rectangle.

      ``bins`` (grayscale) or ``l_bins``/``a_bins``/``b_bins`` (RGB565) set the
      number of histogram bins per channel. Must be greater than 2. Defaults
      to the maximum bins per channel.

      ``difference`` may be set to an image object to operate on the difference
      between the current image and that image without an extra buffer.

      Not supported on compressed images or bayer images.

   .. method:: get_regression(thresholds:List[Tuple[int,int]], invert:bool=False, roi:Optional[Tuple[int,int,int,int]]=None, x_stride:int=2, y_stride:int=1, area_threshold:int=10, pixels_threshold:int=10, target_size:Tuple[int,int]=(80,60)) -> line

      Computes a linear regression (Theil-Sen) on all the thresholded pixels in the
      image. Returns an `image.line` object, or None if no line was found.

      ``thresholds`` is a list of ``(lo, hi)`` tuples for grayscale images, or
      ``(l_lo, l_hi, a_lo, a_hi, b_lo, b_hi)`` tuples for RGB565 images.

      ``invert`` inverts the threshold matching.

      ``roi`` is the region-of-interest rectangle tuple (x, y, w, h). Defaults to
      the image rectangle.

      ``x_stride`` and ``y_stride`` control how many pixels are skipped over while
      evaluating the image.

      ``area_threshold`` minimum bounding box area; smaller results return None.

      ``pixels_threshold`` minimum thresholded pixel count; smaller results return None.

      ``target_size`` is a ``(w, h)`` tuple. The ROI is area-scaled down to fit
      inside this size before running the O(N^2) algorithm. Defaults to ``(80, 60)``.

      Not supported on compressed images or bayer images.

   Detection Methods
   ~~~~~~~~~~~~~~~~~

   .. method:: find_blobs(thresholds:List[Tuple[int,int]], invert:bool=False, roi:Optional[Tuple[int,int,int,int]]=None, x_stride:int=2, y_stride:int=1, area_threshold:int=10, pixels_threshold:int=10, merge:bool=False, margin:int=0, threshold_cb:Optional[Callable]=None, merge_cb:Optional[Callable]=None, x_hist_bins_max:int=0, y_hist_bins_max:int=0) -> List[blob]

      Finds all blobs (connected pixel regions that pass a threshold test) in the
      image and returns a list of `image.blob` objects.

      ``thresholds`` is a list of ``(lo, hi)`` tuples for grayscale images, or
      ``(l_lo, l_hi, a_lo, a_hi, b_lo, b_hi)`` tuples for RGB565 images (LAB
      channels). Up to 32 tuples may be passed. Swapped min/max values are
      auto-fixed; missing components default to maximum range.

      ``invert`` inverts the threshold matching.

      ``roi`` is the region-of-interest rectangle tuple (x, y, w, h). Defaults
      to the image rectangle.

      ``x_stride`` and ``y_stride`` control how many pixels are skipped while
      searching for a blob. Increase if blobs are known to be large.

      ``area_threshold`` minimum bounding box area; smaller blobs are filtered.

      ``pixels_threshold`` minimum thresholded pixel count; smaller blobs are filtered.

      ``merge`` if True merges blobs whose bounding rectangles intersect.
      ``margin`` grows/shrinks the bounding rectangles used for intersection.
      Merged blobs OR their ``code`` bit vectors together (one bit per threshold).

      ``threshold_cb`` is called per blob after thresholding; return True to keep,
      False to filter.

      ``merge_cb`` is called per pair of blobs about to be merged; return True
      to allow the merge, False to prevent it.

      ``x_hist_bins_max`` if non-zero, populates each blob with an x_histogram
      projection using this many bins.

      ``y_hist_bins_max`` if non-zero, populates each blob with a y_histogram
      projection using this many bins.

      Not supported on compressed images or bayer images.

   .. method:: find_lines(roi:Optional[Tuple[int,int,int,int]]=None, x_stride:int=2, y_stride:int=1, threshold:int=1000, theta_margin:int=25, rho_margin:int=25) -> List[line]

      Finds all infinite lines in the image using the hough transform. Returns
      a list of `image.line` objects.

      ``roi`` is the region-of-interest rectangle tuple (x, y, w, h). Defaults
      to the image rectangle.

      ``x_stride`` and ``y_stride`` control how many pixels are skipped during
      the hough transform.

      ``threshold`` minimum line magnitude (sum of sobel magnitudes along the
      line); lines below this are filtered out.

      ``theta_margin`` and ``rho_margin`` control merging: lines within these
      thresholds are merged.

      Not supported on compressed images or bayer images.

      This method is not available on the OpenMV Cam M4.

   .. method:: find_line_segments(roi:Optional[Tuple[int,int,int,int]]=None, merge_distance:int=0, max_theta_difference:int=15) -> List[line]

      Finds line segments in the image. Returns a list of `image.line` objects.

      ``roi`` is the region-of-interest rectangle tuple (x, y, w, h). Defaults
      to the image rectangle.

      ``merge_distance`` is the maximum pixel separation between two segments
      to be merged.

      ``max_theta_difference`` is the maximum theta difference in degrees
      between segments to be merged.

      This method is not available on the OpenMV Cam M4.

   .. method:: find_circles(roi:Optional[Tuple[int,int,int,int]]=None, x_stride:int=2, y_stride:int=1, threshold:int=2000, x_margin:int=10, y_margin:int=10, r_margin:int=10, r_min:int=2, r_max:Optional[int]=None, r_step:int=2) -> List[circle]

      Finds circles in the image using the hough transform. Returns a list of
      `image.circle` objects.

      ``roi`` is the region-of-interest rectangle tuple (x, y, w, h). Defaults
      to the image rectangle.

      ``x_stride`` and ``y_stride`` control how many pixels are skipped during
      the hough transform.

      ``threshold`` minimum circle magnitude (sum of sobel magnitudes along the
      circle); circles below this are filtered out.

      ``x_margin``, ``y_margin``, and ``r_margin`` control merging: circles
      within these thresholds are merged.

      ``r_min`` minimum circle radius. Defaults to 2.

      ``r_max`` maximum circle radius. Defaults to ``min(roi.w/2, roi.h/2)``.

      ``r_step`` radius step size. Defaults to 2.

      This method is not available on the OpenMV Cam M4.

   .. method:: find_rects(roi:Optional[Tuple[int,int,int,int]]=None, threshold:int=1000) -> List[rect]

      Finds rectangles in the image using the apriltag quad detection algorithm.
      Returns a list of `image.rect` objects.

      ``roi`` is the region-of-interest rectangle tuple (x, y, w, h). Defaults
      to the image rectangle.

      ``threshold`` minimum edge magnitude (sum of sobel magnitudes along the
      rectangle edges); rectangles below this are filtered out.

      This method is not available on the OpenMV Cam M4.

   .. method:: find_qrcodes(roi:Optional[Tuple[int,int,int,int]]=None) -> List[qrcode]

      Finds all qrcodes within the ``roi`` and returns a list of `image.qrcode`
      objects.

      ``roi`` is the region-of-interest rectangle tuple (x, y, w, h). Defaults
      to the image rectangle.

      This method is not available on the OpenMV Cam M4.

   .. method:: find_apriltags(roi:Optional[Tuple[int,int,int,int]]=None, families:int=TAG36H11, fx:Optional[float]=None, fy:Optional[float]=None, cx:Optional[float]=None, cy:Optional[float]=None) -> List[apriltag]

      Finds all apriltags within the ``roi`` and returns a list of
      `image.apriltag` objects.

      ``roi`` is the region-of-interest rectangle tuple (x, y, w, h). Defaults
      to the image rectangle.

      ``families`` is a bitmask of tag families to decode. It is the logical
      OR of:

        * `image.TAG16H5`
        * `image.TAG25H9`
        * `image.TAG36H10`
        * `image.TAG36H11`
        * `image.TAGCIRCLE21H7`
        * `image.TAGCIRCLE49H12`
        * `image.TAGCUSTOM48H12`
        * `image.TAGSTANDARD41H12`
        * `image.TAGSTANDARD52H13`

      Defaults to `image.TAG36H11`. Detection time scales with the number of
      enabled families.

      ``fx`` and ``fy`` are the camera X and Y focal lengths in pixels.

      ``cx`` and ``cy`` are the image center, typically ``image.width()/2``
      and ``image.height()/2``.

      Not supported on compressed images.

      This method is not available on the OpenMV Cam M4.

   .. method:: find_datamatrices(roi:Optional[Tuple[int,int,int,int]]=None, effort:int=200) -> List[datamatrix]

      Finds all datamatrices within the ``roi`` and returns a list of
      `image.datamatrix` objects.

      ``roi`` is the region-of-interest rectangle tuple (x, y, w, h). Defaults
      to the image rectangle.

      ``effort`` controls how much time to spend trying to find data matrix
      matches. Higher values improve detection at the cost of frame rate.
      Values below ~160 fail to detect; values above ~240 yield diminishing
      returns. Defaults to 200.

      This method is not available on the OpenMV Cam M4.

   .. method:: find_barcodes(roi:Optional[Tuple[int,int,int,int]]=None) -> List[barcode]

      Finds all 1D barcodes within the ``roi`` and returns a list of
      `image.barcode` objects. Scans both horizontally and vertically.

      Supported barcode types: `image.EAN2`, `image.EAN5`, `image.EAN8`,
      `image.UPCE`, `image.ISBN10`, `image.UPCA`, `image.EAN13`,
      `image.ISBN13`, `image.I25`, `image.DATABAR` (RSS-14),
      `image.DATABAR_EXP` (RSS-Expanded), `image.CODABAR`, `image.CODE39`,
      `image.PDF417`, `image.CODE93`, `image.CODE128`.

      ``roi`` is the region-of-interest rectangle tuple (x, y, w, h). Defaults
      to the image rectangle.

      This method is not available on the OpenMV Cam M4.

   .. method:: find_displacement(template:Image, roi:Optional[Tuple[int,int,int,int]]=None, template_roi:Optional[Tuple[int,int,int,int]]=None, logpolar:bool=False, fix_rotation_scale:bool=False) -> displacement

      Find the translation offset of this image from ``template`` using phase
      correlation. Returns an `image.displacement` object.

      ``roi`` is the region-of-interest rectangle (x, y, w, h). Defaults to
      the image rectangle.

      ``template_roi`` is the template's region-of-interest. Defaults to the
      template image rectangle. ``roi`` and ``template_roi`` must have the
      same width and height.

      ``logpolar`` if True returns rotation/scale change instead of x/y
      translation.

      ``fix_rotation_scale`` if True, computes displacement after aligning
      rotation and scale (only meaningful when ``logpolar=False``).

      .. note::

         Use this method on power-of-2 image sizes (e.g. `sensor.B64X64`).

      Not supported on compressed images or bayer images. Not available on the OpenMV Cam M4.

   .. method:: find_template(template:Image, threshold:float, roi:Optional[Tuple[int,int,int,int]]=None, step:int=2, search:int=SEARCH_EX) -> Optional[Tuple[int,int,int,int]]

      Tries to find the first location in the image where ``template`` matches
      using Normalized Cross Correlation. Returns a bounding box tuple
      (x, y, w, h), or None.

      ``template`` is a grayscale image to match against this image.

      ``threshold`` is a value (0.0-1.0). Higher values reduce false positives
      and detections; lower values do the opposite.

      ``roi`` is the region-of-interest rectangle tuple (x, y, w, h). Defaults
      to the image rectangle.

      ``step`` is the number of pixels to skip while searching (only used in
      ``image.SEARCH_EX`` mode).

      ``search`` is ``image.SEARCH_DS`` (faster diamond search) or
      ``image.SEARCH_EX`` (exhaustive search).

      Only works on grayscale images.

   .. method:: find_features(cascade: Cascade, threshold:float=0.5, scale:float=1.5, roi:Optional[Tuple[int,int,int,int]]=None) -> List[Tuple[int,int,int,int]]

      Searches the image for areas matching the passed Haar cascade and
      returns a list of bounding box tuples (x, y, w, h). Returns an empty
      list if no features are found.

      ``cascade`` is a Haar Cascade object (see `image.HaarCascade()`).

      ``threshold`` (0.0-1.0). Lower values raise the detection rate and the
      false-positive rate.

      ``scale`` must be greater than 1.0. Higher values run faster but produce
      poorer matches.

      ``roi`` is the region-of-interest rectangle tuple (x, y, w, h). Defaults
      to the image rectangle.

   .. method:: find_eye(roi:Tuple[int,int,int,int]) -> Tuple[int, int]

      Searches for the pupil in a region-of-interest (x, y, w, h) tuple around
      an eye. Returns the (x, y) location of the pupil, or (0, 0) if none is
      found.

      ``roi`` is the region-of-interest rectangle tuple (x, y, w, h).

      Only works on grayscale images.

   .. method:: find_lbp(roi:Tuple[int,int,int,int]) -> lbp_descriptor

      Extracts LBP (local-binary-patterns) keypoints from the
      region-of-interest. Use `image.match_descriptor()` to compare two
      descriptors.

      ``roi`` is the region-of-interest rectangle tuple (x, y, w, h).

      Only works on grayscale images.

   .. method:: find_keypoints(roi:Optional[Tuple[int,int,int,int]]=None, threshold:int=20, normalized:bool=False, scale_factor:float=1.5, max_keypoints:int=100, corner_detector:int=CORNER_AGAST) -> Optional[kp_descriptor]

      Extracts ORB keypoints from the region-of-interest. Use
      `image.match_descriptor()` to compare two descriptors. Returns None if
      no keypoints were found.

      ``roi`` is the region-of-interest rectangle tuple (x, y, w, h). Defaults
      to the image rectangle.

      ``threshold`` (0-255) controls the number of extracted corners. Lower
      thresholds produce more corners. Use ~20 for AGAST, ~60-80 for FAST.

      ``normalized`` if True, disables multi-resolution keypoint extraction.

      ``scale_factor`` must be greater than 1.0. Higher values run faster but
      produce poorer matches.

      ``max_keypoints`` is the maximum number of keypoints to retain.

      ``corner_detector`` is `image.CORNER_FAST` or `image.CORNER_AGAST`.

      Only works on grayscale images.

   .. method:: find_edges(edge_type:int, threshold:Tuple[int,int]=(100, 200)) -> Image

      Turns the image to black and white leaving only the edges as white pixels.

         * image.EDGE_SIMPLE - Simple thresholded high pass filter algorithm.
         * image.EDGE_CANNY - Canny edge detection algorithm.

      ``threshold`` is a two valued tuple containing a low threshold and high
      threshold. You can control the quality of edges by adjusting these values.
      It defaults to (100, 200).

      Only works on grayscale images.

   .. method:: find_hog(roi:Optional[Tuple[int,int,int,int]]=None, size:int=8) -> Image

      Replaces the pixels in the ROI with HOG (histogram of orientated graidients)
      lines.

      ``roi`` is the region-of-interest rectangle tuple (x, y, w, h). If not
      specified, it is equal to the image rectangle. Only pixels within the
      ``roi`` are operated on.

      Only works on grayscale images.

      This method is not available on the OpenMV Cam M4.

   .. method:: stereo_disparity(reversed:bool=False, max_disparity:int=64, threshold:int=64) -> Image

      Takes a double-wide grayscale image containing the output of two side-by-side
      camera sensors and replaces one half with the stereo disparity image (each
      pixel represents depth). E.g. for two 320x240 cameras pass a 640x240 image.

      ``reversed`` By default the left image is compared to the right and the right
      image is replaced. Set True to compare right->left and replace the left image.

      ``max_disparity`` is the maximum distance (1-255) to search for a matching pixel
      block using sum-of-absolute differences. Larger values take exponentially longer
      but produce higher quality output.

      ``threshold`` if the sum-of-absolute differences between two blocks is less than
      or equal to this threshold they are considered matching.

   .. method:: selective_search(threshold:int=500, size:int=20, a1:float=1.0, a2:float=1.0, a3:float=1.0) -> List[Tuple[int,int,int,int]]

      Runs selective search on the image and returns a list of bounding box tuples
      (x, y, w, h) of object proposals.

      ``threshold`` is the segmentation threshold; higher values produce fewer/larger
      regions.

      ``size`` is the minimum region size after merging.

      ``a1``, ``a2``, ``a3`` are the color/texture/size similarity weights used when
      merging regions.

