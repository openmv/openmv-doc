Image preview
=============

The framebuffer pool is where the application reads its
frames. While the application is working on those frames,
whatever is connected to the camera to preview them needs a
copy of each frame too. The camera has a second, dedicated
buffer for that purpose, and a single rule for when it gets
filled: *every time the application calls*
:meth:`~csi.CSI.snapshot`, *the previous captured frame is
copied into the preview buffer* before the new frame is
handed back.

The application and the previewer never contend for the same
memory. The application reads its frame out of the pool; the
previewer reads its frame out of the preview buffer. Both
happen in parallel.

The stream framebuffer
----------------------

The preview buffer -- the *stream framebuffer* -- is a single
fixed-size region of RAM separate from the framebuffer pool.
Its size is set at firmware build time and does not change
with :meth:`~csi.CSI.framesize` or
:meth:`~csi.CSI.pixformat`. About a megabyte is typical on
recent OpenMV Cams -- big enough to hold a moderate-resolution
preview, much smaller than a full-resolution frame at the
largest sensor sizes.

The application code does not read or write this buffer
directly; the camera driver fills it as a side effect of
:meth:`~csi.CSI.snapshot`.

What snapshot does for the preview
----------------------------------

On each call to :meth:`~csi.CSI.snapshot`, before the driver
releases the application's previous framebuffer back into the
pool and hands the new one out, it copies the previous frame
through to the preview buffer -- with whatever the application
drew on top of it during processing still on the image.
Two branches are possible. Which one runs is *picked by the
previewer*, not by the camera: the consumer that opened the
preview tells the driver whether it wants the raw image or a
JPEG, and what raw window size it can accept.

* **Raw downscaled copy.** When the previewer has asked for
  raw frames, the driver copies the previous frame across in
  its native pixel format (RGB565, grayscale, etc.). If the
  frame is larger than the raw window the previewer
  requested, the driver scales it down with bilinear
  filtering until it fits; otherwise the pixels go through
  unchanged. No compression artefacts; the previewer sees
  the same pixels the application was working on.
* **JPEG compression.** When the previewer has asked for
  JPEG -- or when the raw copy would not fit in the stream
  buffer at all -- the driver JPEG-compresses the previous
  frame at its full resolution into the stream buffer. The
  quality is adjusted *adaptively* per-frame so the
  compressed output stays within the stream buffer's
  capacity. When a frame fits, the driver creeps the quality
  back up by one step toward a ceiling that depends on the
  captured frame's pixel size (smaller frames are allowed
  higher quality; larger frames are capped lower so they
  cannot overflow on a small content change). When a frame
  does *not* fit, the driver halves the current quality,
  holds it at the reduced level for the next several dozen
  frames so the new setting has time to settle, and drops
  the overflowed frame from the preview. The application
  loop keeps running unaffected; only the previewer misses
  the dropped frame.

Frames the camera produces in a format that is already
compressed (the JPEG pixel format on sensors that emit JPEG
directly) skip both branches: the encoded bitstream is
copied straight into the preview buffer as-is.

The previewer polls on its own schedule, generally much
slower than the camera captures, so it *sub-samples* the
raw capture rate: only the snapshots it happens to read out
in time are shown. If a fresh
:meth:`~csi.CSI.snapshot` arrives at the preview buffer
before the previewer has read the previous frame out, the
buffer is still locked by the previewer and the new preview
update is skipped -- that capture is lost from the preview
stream. The application's own framebuffer pool is unaffected;
the captured frame still goes to the application normally.

Pushing the last frame manually
-------------------------------

Because the preview is updated as a side effect of
:meth:`~csi.CSI.snapshot`, a script that finishes without
ever calling snapshot again leaves whatever it last sent to
the preview sitting on the previewer indefinitely -- which,
for a script that does its work before the first snapshot
and then exits, is an empty preview.
:meth:`image.Image.flush` (or the equivalent
:meth:`~csi.CSI.flush` on the :class:`~csi.CSI` object)
copies the current contents of the application's framebuffer
into the stream buffer on demand, without capturing a new
frame::

    img = csi0.snapshot()
    # process the image and draw on it
    img.flush()                               # previewer sees the annotated frame

The same call is also useful when a long-running operation
sits between snapshots and the previewer would otherwise show
a stale preview the whole time.

.. note::

   The preview application has to read the frame out of the
   stream buffer before the script exits. A flush at the end
   of a short script only stages the frame; if the script
   then returns control to the camera before the previewer
   has polled, the buffer is reused on the next run and that
   final frame is lost. For end-of-script previews, give the
   previewer a moment to pick the frame up (a brief sleep
   after the flush, or simply not exiting immediately) before
   the script ends.
