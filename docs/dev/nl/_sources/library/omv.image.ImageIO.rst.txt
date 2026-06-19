.. currentmodule:: image

class ImageIO -- ImageIO object
===============================

The :class:`ImageIO` class records and plays back streams of
:class:`Image` frames in OpenMV's native on-disk format. A single stream
can hold heterogeneous frames (different pixel formats / sizes) and
records the inter-frame interval for each one so playback re-creates the
original frame rate.

There are two backing stores:

* **File stream** -- frames are read from / appended to a file on the
  filesystem. The file starts with a 16-byte magic header
  ``OMV IMG STR Vx.y`` followed by per-frame chunks. The current
  writer emits ``V2.0``; older ``V1.0`` and ``V1.1`` files are still
  readable.
* **Memory stream** -- frames are read from / written to a fixed-size
  RAM buffer allocated at construction time. Useful for round-tripping
  frames through filters that need a recording without touching the
  filesystem.

.. class:: ImageIO(path: Union[str, Tuple[int, int, int]], mode: Union[str, int])

   Create an :class:`ImageIO` stream.

   If ``path`` is a **string**, a file stream is opened at that path.
   ``mode`` must be one of:

      * ``'r'`` -- open an existing file for reading. The magic header
        is validated and the version (``V1.0`` / ``V1.1`` / ``V2.0``)
        is recorded for use by :meth:`version`.
      * ``'w'`` -- truncate / create the file and write a fresh ``V2.0``
        magic header. Frames are appended on each :meth:`write`.

   If ``path`` is a **3-tuple** ``(w, h, pixformat)``, a memory stream
   is allocated. ``mode`` is then the integer **number of frame slots**
   to pre-allocate. The buffer is sized for ``count`` frames of
   ``(w, h, pixformat)`` and is **not allowed to grow** after creation.
   ``pixformat`` is one of `image.BINARY`, `image.GRAYSCALE`,
   `image.RGB565`, `image.BAYER`, `image.YUV422`, `image.JPEG`, or
   `image.PNG`. For the compressed formats (`image.JPEG`, `image.PNG`)
   the per-slot size is estimated at 2 bpp; frames larger than the
   estimate raise ``ValueError`` at :meth:`write` time.

   Inspection
   ----------

   .. method:: type() -> int

      Return the stream backing store: :data:`FILE_STREAM` for a file
      stream, :data:`MEMORY_STREAM` for a memory stream.

   .. method:: is_closed() -> bool

      Return ``True`` if :meth:`close` has been called on this object.
      Once closed the stream raises ``OSError("Stream closed")`` on
      any further read/write/seek.

   .. method:: count() -> int

      Return the number of frames currently stored in the stream. For
      file streams this grows as :meth:`write` appends frames; for
      memory streams this is fixed at construction time.

   .. method:: offset() -> int

      Return the current frame index. Incremented by :meth:`read` and
      :meth:`write`, reset by :meth:`seek`.

   .. method:: version() -> Optional[int]

      Return the on-disk format version for file streams (``10`` for
      ``V1.0``, ``11`` for ``V1.1``, ``20`` for ``V2.0``). Returns
      ``None`` for memory streams.

   .. method:: buffer_size() -> Optional[int]

      Return the per-slot pixel buffer size in bytes for memory
      streams (the slot size minus the internal :class:`Image`
      bookkeeping header). Returns ``None`` for file streams. Use this
      together with :meth:`count` to check whether a particular frame
      size will fit.

   .. method:: size() -> int

      Return the total bytes consumed by the stream -- the file size
      on disk for file streams, or the full RAM-buffer size
      (``count * per_slot_size`` including the per-slot header) for
      memory streams.

   I/O
   ---

   .. method:: write(img: Image) -> ImageIO

      Append (file stream) or store-at-offset (memory stream) ``img``
      and advance :meth:`offset` by one.

      For file streams the file grows as frames are appended. Writing
      at a non-end offset truncates the rest of the file so the count
      can shrink.

      For memory streams the frame is written into the current slot;
      writing past the last slot raises ``EOFError("End of stream")``
      and writing a frame larger than :meth:`buffer_size` raises
      ``ValueError("Invalid frame size")``.

      Returns ``self`` so calls can be chained.

   .. method:: read(copy_to_fb: bool = True, *, loop: bool = True, pause: bool = True) -> Optional[Image]

      Read the frame at the current :meth:`offset`, advance the
      offset, and return the new :class:`Image`. Mirrors the playback
      half of :meth:`write`.

      ``copy_to_fb`` -- when ``True`` (default) the decoded frame is
      placed in the camera frame buffer (the same place a
      `csi.CSI.snapshot()` lands), so the returned :class:`Image` is
      drawable through the IDE preview. When ``False`` the frame is
      allocated on the MicroPython heap instead.

      ``loop`` (file streams only) -- when ``True`` (default) reading
      past the last frame seeks back to the first frame and continues.
      When ``False`` the call returns ``None`` once the end of the
      file is reached.

      ``pause`` -- when ``True`` (default) the call blocks until the
      originally-recorded inter-frame interval has elapsed, so
      playback runs at the recording's native frame rate. Set to
      ``False`` for as-fast-as-possible playback.

   .. method:: seek(offset: int) -> ImageIO

      Move :meth:`offset` to frame ``offset``. ``offset`` must be
      non-negative; memory-stream offsets must also be less than
      :meth:`count`.

      File-stream seeks walk the file frame-by-frame from the start
      since frame chunks are variable-sized -- expect O(offset) time
      for large jumps.

      Returns ``self`` so calls can be chained.

   .. method:: sync() -> ImageIO

      Flush pending writes to disk for file streams (calls the
      underlying file-system ``sync``). No-op for memory streams.

      Returns ``self`` so calls can be chained.

   .. method:: close() -> None

      Close the stream. Releases the memory buffer (memory streams) or
      closes the file (file streams). After ``close()`` the
      :class:`ImageIO` object cannot be reused; subsequent operations
      raise ``OSError("Stream closed")``. Calling ``close()`` twice is
      a no-op.

      An :class:`ImageIO` is also closed automatically when it is
      garbage-collected (it registers a finaliser at construction).

   Constants
   ---------

   .. data:: FILE_STREAM
      :type: int

      Value returned by :meth:`type` for file-backed streams.

   .. data:: MEMORY_STREAM
      :type: int

      Value returned by :meth:`type` for in-memory streams.
