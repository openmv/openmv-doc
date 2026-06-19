ImageIO streams
===============

:meth:`~image.Image.save` and
:meth:`~image.Image.to_jpeg` cover the
*single-frame* I/O case: an application
captures a frame, encodes it, and pushes
it somewhere. A different class of
application needs the *sequence* case:
record many frames in a row at the
natural capture rate, store them somewhere
they can be retrieved later, and play them
back at the right speed. A training-data
collection script captures a few hundred
example frames for a machine-learning
pipeline; an inspection-station log
records every captured part for
traceability; a
development script replays a stored
sequence to test a new algorithm against
data that was previously captured live.

The :class:`ImageIO <image.ImageIO>`
class is the image module's recorder /
player. A single stream holds a sequence
of :class:`Image` frames -- possibly of
different sizes and pixel formats --
together with the inter-frame interval
of each one, so playback can re-create
the original frame rate. Two backing
stores are available: a file on the
filesystem or a fixed-size buffer in RAM.

The two backing stores
----------------------

A *file stream* persists the recording
across power cycles and is sized only by
the storage backing it. It starts with
a 16-byte magic header
``OMV IMG STR Vx.y`` followed by one
chunk per frame; the current writer emits
``V2.0`` and the reader still accepts
``V1.0`` and ``V1.1`` files for backward
compatibility. The file path is the
constructor argument; the mode is the
file-open mode (``'r'`` to read an
existing stream, ``'w'`` to truncate and
write fresh).

::

    # Recording to /sdcard/run.bin
    stream = image.ImageIO("/sdcard/run.bin", "w")
    for _ in range(120):
        img = csi0.snapshot()
        stream.write(img)
    stream.close()

A *memory stream* lives in a RAM buffer
allocated at construction. The
constructor takes a ``(w, h, pixformat)``
3-tuple instead of a path, and the
``mode`` argument becomes the
*pre-allocated number of frame slots*.
The buffer is sized exactly for that many
frames at the supplied dimensions and is
*not allowed to grow* once allocated --
writing past the last slot raises
``EOFError``, and writing a frame larger
than the per-slot buffer raises
``ValueError``. Memory streams are the
right tool when the application needs to
hand a *recording* to a downstream stage
without going through the filesystem (a
short ring buffer of recent frames for a
trigger-and-replay pattern, for instance).

::

    # Pre-allocate space for 32 QVGA RGB565 frames in RAM
    stream = image.ImageIO((320, 240, image.RGB565), 32)
    for _ in range(32):
        stream.write(csi0.snapshot())

For the compressed pixel formats
(:data:`image.JPEG`, :data:`image.PNG`)
the per-slot size is estimated at 2 bits
per pixel; an encoded frame larger than
the estimate raises ``ValueError`` at
write time, so an application that
expects to store high-quality JPEGs has
to either over-allocate the slot count or
encode at a lower quality first.

:meth:`~image.ImageIO.type` returns
:data:`image.ImageIO.FILE_STREAM` or
:data:`image.ImageIO.MEMORY_STREAM` so
that downstream code can adapt to
whichever backing store it is given.

Recording
---------

:meth:`~image.ImageIO.write` appends a
captured :class:`Image` to a file stream
(or stores it at the current slot of a
memory stream) and advances the offset by
one. The same call records the
*inter-frame interval* since the last
write, so
the playback half can pause for the right
amount of time between frames and the
recording's natural frame rate is
preserved.

Heterogeneous frames are allowed within a
single file stream: a recording can mix
RGB565 captures, grayscale crops, and
JPEG-encoded thumbnails freely, and the
reader will decode each at its original
size and format. Memory streams are
homogeneous (all slots share the
constructor-supplied ``(w, h,
pixformat)``), so a memory recording is
restricted to one frame configuration.

:meth:`~image.ImageIO.write` returns the
stream object so calls can chain.
Writing at a non-end offset of a file
stream truncates the rest of the file --
useful for editing a stored sequence,
risky if the next-write position was
moved unintentionally by an earlier
:meth:`~image.ImageIO.seek`.

:meth:`~image.ImageIO.sync` flushes
pending writes to disk for file streams
(it is a no-op on memory streams) and
should be called periodically when the
recording is long-running, to avoid
losing the tail of the recording if the
cam reboots before the file is closed.
The destructor closes the stream
automatically when the :class:`ImageIO`
goes out of scope, but explicit
:meth:`~image.ImageIO.close` is the
right discipline.

Playback
--------

:meth:`~image.ImageIO.read` reads the
frame at the current offset, advances
the offset, and returns the new
:class:`Image`. The receiver remains in
the frame buffer when ``copy_to_fb=True``
(the default) so the returned image is
drawable through the IDE preview; with
``copy_to_fb=False`` the frame lands on
the MicroPython heap.

::

    # Loop a recorded stream at its natural frame rate
    stream = image.ImageIO("/sdcard/run.bin", "r")
    while True:
        img = stream.read()
        # img is now in the frame buffer; the IDE shows it
        # and the script can run any analysis it likes

Two keywords control the playback
behaviour. ``loop=True`` (the default
for file streams) wraps the read pointer
back to the start when the end of the
recording is reached, so the call never
returns ``None``; ``loop=False`` returns
``None`` once the recording is exhausted
and the caller's loop terminates.
``pause=True`` (the default) blocks the
call until the inter-frame interval
recorded at write time has elapsed, so
the playback frame rate matches the
original capture frame rate;
``pause=False`` returns immediately,
useful for analysis pipelines that want
to chew through the recording as fast as
possible without honouring the original
timing.

The same loop pattern works for memory
streams except that ``loop`` is
ignored -- reading past the end of a
memory stream raises ``EOFError``. The
expected pattern for a memory ring is to
:meth:`~image.ImageIO.seek` back to zero
explicitly when wrapping is wanted.

Navigation and inspection
-------------------------

:meth:`~image.ImageIO.seek` moves the
read/write pointer to a specific frame
index. For memory streams the offset
must be less than
:meth:`~image.ImageIO.count`; for file
streams the seek walks the file
frame-by-frame from the start (the
per-frame chunks are variable-sized, so
the cost of a seek grows with how far
into the recording the target frame
sits). Seeks are the standard mechanism
for jumping back to a known frame in a
recording -- a "play from time T" user
interface, a re-analysis pass over a
specific event.

:meth:`~image.ImageIO.count` returns the
number of frames currently stored;
:meth:`~image.ImageIO.offset` returns
the current read/write position;
:meth:`~image.ImageIO.size` returns the
total bytes the stream occupies (file
size for file streams, full RAM buffer
size for memory streams);
:meth:`~image.ImageIO.version` returns
the on-disk format version for file
streams (``10`` for ``V1.0``, ``11`` for
``V1.1``, ``20`` for ``V2.0``) or
``None`` for memory streams.
:meth:`~image.ImageIO.buffer_size`
returns the per-slot pixel buffer size
for memory streams and ``None`` for file
streams; combined with
:meth:`~image.ImageIO.count` it gives
the application enough information to
decide whether a new frame configuration
will fit.

:meth:`~image.ImageIO.is_closed` reports
whether :meth:`~image.ImageIO.close` has
been called -- a closed stream raises
``OSError("Stream closed")`` on any
further read, write, or seek.

Host-playable recordings
------------------------

ImageIO streams are the right tool when
the recording is going to be played back
*on the cam* -- they preserve every
captured frame in its native pixel format,
the inter-frame interval is recorded
exactly, and a downstream script can step
through them, seek, and re-analyse with
no loss. They are not, however, the
right tool when the recording has to be
playable on a *host* -- a workstation, a
phone, a web player. A host expects a
*standard* video container, not the OpenMV
on-disk magic-header format.

Two separate modules cover the
host-playable case. The :mod:`mjpeg`
module records Motion JPEG: a sequence
of JPEG-compressed frames packed into a
single AVI-style container that VLC,
QuickTime, ffmpeg, and the standard web
video tag all play directly. The
:mod:`gif` module records an animated
GIF: a sequence of uncompressed (or
palette-compressed) frames with explicit
per-frame delays, playable in any web
browser or image viewer that handles
animated GIFs.

The :mod:`mjpeg` module is the natural
choice for *long* recordings. JPEG
compression keeps the file size
manageable -- comparable to
:meth:`~image.Image.to_jpeg` at the
configured quality, frame after frame --
so an extended capture session stays
within the SD card's budget. The usage
mirrors :class:`ImageIO <image.ImageIO>`
recording closely:

::

    import mjpeg

    m = mjpeg.Mjpeg("/sdcard/run.mjpeg")
    while running:
        m.add_frame(csi0.snapshot(), quality=85)
    m.close()

:class:`mjpeg.Mjpeg` accepts the same
drawing-style positional and scale
keywords other image methods take, so a
recording can be scaled, cropped, or
palette-mapped per frame on the way in.
The constructor's ``width`` and ``height``
arguments default to the main frame
buffer's dimensions and fix the output
resolution; every appended frame is
scaled (preserving aspect ratio) to fit.
:meth:`~mjpeg.Mjpeg.sync` flushes the file
to disk during a long recording, and
:meth:`~mjpeg.Mjpeg.close` finalises the
container -- a Motion JPEG file that
hasn't been closed cleanly is not
playable, so the discipline matters.

The :mod:`gif` module is the natural
choice for *short* recordings shared
verbatim with a non-technical viewer --
a few seconds of action captured for a
demo, an animated illustration for
documentation, an event clip embedded in
a chat message. GIF frames are stored
uncompressed (or palette-compressed at
7-bit colour depth), which makes the
files much larger per second than Motion
JPEG and rules the format out for
recordings longer than a few seconds, but
the result drops directly into any
browser:

::

    import gif

    g = gif.Gif("/sdcard/clip.gif")
    while running:
        g.add_frame(csi0.snapshot(), delay=10)
    g.close()

The ``delay`` argument on
:meth:`~gif.Gif.add_frame` is the
per-frame display time in centi-seconds
(``10`` is 100 ms per frame, or 10 fps),
which is the standard GIF playback
control. The constructor's ``loop``
keyword sets whether the resulting clip
auto-loops in viewers (the default is
``True``, which matches the conventional
"animated GIF" expectation).

The three recording paths cover the
common cases between them: ImageIO for
on-cam re-processing, Motion JPEG for
long host-playable recordings, animated
GIF for short host-playable clips. The
choice between them comes down to *who
plays the recording back*. A downstream
stage running on the cam itself reads
ImageIO; a host workstation or web
viewer reads MJPEG or GIF.

A trigger-and-replay pattern
----------------------------

A useful pattern combines a memory
stream with a trigger condition. The cam
records continuously into a
``count``-slot memory ring buffer,
overwriting the oldest slot each time
around. When a trigger condition fires
(a blob enters the frame, a motion event
exceeds threshold, a button is pressed)
the application snapshots the contents of
the ring -- the most recent ``count``
frames -- and writes them to a file
stream on the SD card. The result is a
*pre-trigger recording* that captures
the seconds *before* the event the cam
actually noticed, not just the seconds
after, which is the classical
limitation of a naive
"capture-when-triggered" recorder.

The implementation is straightforward
once the stream classes are in hand: a
fixed-size memory stream serves as the
ring (with explicit
:meth:`~image.ImageIO.seek` to zero when
the offset reaches the slot count), the
main loop captures into it on every
iteration, and the trigger handler reads
the memory stream out frame by frame and
writes each into a file stream named
after the timestamp of the trigger.
