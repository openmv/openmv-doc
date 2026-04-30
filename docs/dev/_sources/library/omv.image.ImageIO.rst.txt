class ImageIO -- ImageIO object
===============================

.. currentmodule:: image

The `ImageIO` class allows you to read/write OpenMV `Image` objects in their native form to
disk or to memory, providing fast random-access read/write of frames.

.. class:: ImageIO(path:Union[str, Tuple[int, int, int]], mode:Union[str, int])

   Creates an ImageIO object.

   If ``path`` is a string, it is treated as a file path on disk. ``mode`` must be ``'r'`` to
   open for reading or ``'w'`` to open for writing.

   If ``path`` is a 3-value tuple ``(w, h, pixformat)``, it is treated as in-memory storage.
   ``mode`` is then the integer number of image buffers (frames) to pre-allocate. The in-memory
   storage buffer is not allowed to grow after allocation. ``pixformat`` is a pixformat constant
   such as `image.GRAYSCALE`, `image.RGB565`, `image.BAYER`, or `image.JPEG`.

   .. method:: type() -> int

      Returns whether the ImageIO object is a `FILE_STREAM` or `MEMORY_STREAM`.

   .. method:: is_closed() -> bool

      Returns ``True`` if the ImageIO object is closed and can no longer be used.

   .. method:: count() -> int

      Returns the number of frames stored.

   .. method:: offset() -> int

      Returns the current image index offset.

   .. method:: version() -> Optional[int]

      Returns the stream version if the object is a `FILE_STREAM`. Returns ``None`` for
      `MEMORY_STREAM` objects.

   .. method:: buffer_size() -> Optional[int]

      Returns the per-frame buffer size in bytes for `MEMORY_STREAM` objects. Returns ``None``
      for `FILE_STREAM` objects.

      For memory streams, ``buffer_size() * count() == size()``.

   .. method:: size() -> int

      Returns the total number of bytes used on disk or in memory.

   .. method:: write(img:Image) -> ImageIO

      Writes ``img`` to the stream. For file streams, the file grows as new images are appended.
      For memory streams, the image is written to the current pre-allocated slot before the
      offset advances.

      Returns the ImageIO object.

   .. method:: read(copy_to_fb:bool=True, *, loop:bool=True, pause:bool=True) -> Optional[Image]

      Returns the next image from the stream and advances the offset.

      ``copy_to_fb`` if ``True``, the image is loaded into the frame buffer (like
      `sensor.snapshot()`). If ``False``, the image is allocated on the MicroPython heap.

      ``loop`` if ``True``, automatically seeks to the beginning of the stream when the end is
      reached. If ``False``, returns ``None`` at end-of-stream (file streams only).

      ``pause`` if ``True``, pauses for the originally recorded inter-frame interval to match
      the source frame rate.

   .. method:: seek(offset:int) -> ImageIO

      Seeks to the image slot number ``offset``. Works for both file and memory streams.

      Returns the ImageIO object.

   .. method:: sync() -> ImageIO

      Flushes pending data to disk for file streams. No-op for memory streams.

      Returns the ImageIO object.

   .. method:: close() -> None

      Closes the ImageIO object. For memory streams, frees the allocated buffer. For file
      streams, closes the file and writes out all metadata.

   .. data:: FILE_STREAM
      :type: int

      The ImageIO object was opened on a file.

   .. data:: MEMORY_STREAM
      :type: int

      The ImageIO object was opened in memory.
