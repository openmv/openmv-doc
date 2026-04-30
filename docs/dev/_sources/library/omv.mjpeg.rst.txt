:mod:`mjpeg` --- mjpeg recording
================================

.. module:: mjpeg
   :synopsis: mjpeg recording

The ``mjpeg`` module is used for mjpeg recording. Use it to record long video
clips as compressed image data. Use `gif` for short clips.

Example usage::

    import csi, mjpeg, time

    # Setup camera.
    csi0 = csi.CSI()
    csi0.reset()
    csi0.pixformat(csi.RGB565)
    csi0.framesize(csi.QVGA)
    csi0.snapshot(time=2000)
    c = time.clock()

    # Create the mjpeg object.
    m = mjpeg.Mjpeg("example.mjpeg")

    # Add frames.
    for i in range(100):
        c.tick()
        m.add_frame(csi0.snapshot())

    # Finalize.
    m.close()


class Mjpeg -- Mjpeg recorder
-----------------------------

.. class:: Mjpeg(path:str, width:Optional[int]=None, height:Optional[int]=None)

   Create a Mjpeg object which you can add frames to.

   ``path`` is the file system path to save the mjpeg recording to.

   ``width`` is the horizontal resolution of the mjpeg file. Defaults to the
   main framebuffer width when not specified.

   ``height`` is the vertical resolution of the mjpeg file. Defaults to the
   main framebuffer height when not specified.

   .. method:: is_closed() -> bool

      Returns ``True`` if the file has been closed. No more data can be written
      to a closed file.

   .. method:: width() -> int

      Returns the horizontal resolution of the mjpeg file.

   .. method:: height() -> int

      Returns the vertical resolution of the mjpeg file.

   .. method:: count() -> int

      Returns the number of frames written to the mjpeg file.

   .. method:: size() -> int

      Returns the size of the mjpeg file in bytes.

   .. method:: add_frame(image:image.Image, roi:Optional[Tuple[int,int,int,int]]=None, rgb_channel:int=-1, alpha:int=255, color_palette:Optional[image.Image]=None, alpha_palette:Optional[image.Image]=None, hint:int=0, quality:int=90) -> None

      Append ``image`` to the mjpeg recording. The image is automatically
      scaled while preserving aspect ratio to the resolution specified when
      the file was created. Any image format is accepted; this method
      decompresses, scales/converts, and re-compresses as needed.

      ``roi`` is the region-of-interest rectangle tuple ``(x, y, w, h)`` of
      ``image`` to copy. Defaults to the whole image.

      ``rgb_channel`` is the RGB channel (0=R, 1=G, 2=B) to extract from an
      RGB565 source image and render in grayscale. ``-1`` (default) disables
      channel extraction.

      ``alpha`` (0-255) controls how much of the source image to blend into
      the destination. ``255`` is opaque; lower values blend with a black
      background; ``0`` results in a black frame.

      ``color_palette`` is either a color palette enum (e.g.
      `image.PALETTE_RAINBOW`) or a 256-pixel RGB565 image used as a color
      lookup table on the grayscale value of the source image. Applied after
      ``rgb_channel`` extraction.

      ``alpha_palette`` is a 256-pixel grayscale image used as an alpha
      lookup table modulating ``alpha`` per source pixel based on its
      grayscale value. ``255`` is opaque; ``0`` is transparent. Applied
      after ``rgb_channel`` extraction.

      ``hint`` is a logical OR of:

         * `image.AREA`: Use area scaling when downscaling.
         * `image.BILINEAR`: Use bilinear scaling.
         * `image.BICUBIC`: Use bicubic scaling.
         * `image.CENTER`: Center the image on the destination.
         * `image.HMIRROR`: Horizontally mirror the image.
         * `image.VFLIP`: Vertically flip the image.
         * `image.TRANSPOSE`: Transpose the image (swap x/y).
         * `image.EXTRACT_RGB_CHANNEL_FIRST`: Apply ``rgb_channel`` before scaling.
         * `image.APPLY_COLOR_PALETTE_FIRST`: Apply ``color_palette`` before scaling.
         * `image.SCALE_ASPECT_KEEP`: Scale to fit inside the destination.
         * `image.SCALE_ASPECT_EXPAND`: Scale to fill the destination (crops).
         * `image.SCALE_ASPECT_IGNORE`: Scale to fill the destination (stretches).
         * `image.ROTATE_90`: Rotate by 90 degrees (``VFLIP | TRANSPOSE``).
         * `image.ROTATE_180`: Rotate by 180 degrees (``HMIRROR | VFLIP``).
         * `image.ROTATE_270`: Rotate by 270 degrees (``HMIRROR | TRANSPOSE``).

      ``quality`` (0-100) is the JPEG compression quality used for non-JPEG
      source images.

   .. method:: write(image:image.Image, roi:Optional[Tuple[int,int,int,int]]=None, rgb_channel:int=-1, alpha:int=255, color_palette:Optional[image.Image]=None, alpha_palette:Optional[image.Image]=None, hint:int=0, quality:int=90) -> None

      Alias for `Mjpeg.add_frame()`.

   .. method:: sync() -> None

      Flushes the mjpeg file to disk while keeping it open for further
      writes. Call periodically to ensure data is saved.

   .. method:: close() -> None

      Finalizes the mjpeg recording. Must be called once recording is
      complete to make the file viewable.
