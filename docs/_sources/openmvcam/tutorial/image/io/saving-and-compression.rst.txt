Saving and compression
======================

Every page until now has worked with images
on the cam: captured into the frame
buffer or allocated on the MicroPython
heap, manipulated through the image-module
methods, and either displayed in the IDE
preview or fed into a downstream stage in
the same script. Most applications need at
some point to do the opposite: take an
image that is currently in RAM and put it
somewhere persistent -- onto the SD card,
onto a USB host, over a network -- where
something other than the camera can read
it.

The image module exposes two paths for
that work. The *save* path writes the
image to a file on the filesystem, with
the file format chosen by the extension
and the encoding details handled by the
method. The *to-format* path returns a
:class:`Image` object containing the
encoded byte stream, suitable for handing
to a streaming or networking call without
ever touching the filesystem. Each fits a
different application; both build on the
same compression engine underneath.

Saving to a file
----------------

:meth:`~image.Image.save` writes the image
to the filesystem at a path:

::

    img.save("/sdcard/capture.jpg")
    img.save("/sdcard/capture.bmp")
    img.save("/sdcard/region.jpg", roi=(40, 60, 200, 150), quality=85)

The format is picked from the file
extension. Five extensions are recognised:
``.bmp`` writes a *Windows bitmap*
(lossless, no compression, byte-for-byte
the captured pixels); ``.pgm`` writes a
*portable graymap* (lossless, grayscale
only); ``.ppm`` writes a *portable
pixmap* (lossless, RGB); ``.jpg`` and
``.jpeg`` both write a JPEG (lossy,
compressed). The receiver image must
already be in the right colour format for
the chosen container -- a colour image
saved as ``.pgm`` is an error.

``roi`` restricts the save to a
sub-rectangle of the image, the way every
other image-module method's ``roi``
keyword does. The full image is the
default. The keyword is ignored when
saving a JPEG-compressed image because
the on-disk form already covers the full
frame and re-encoding through a crop
would defeat the point of saving the
existing compressed bytes.

``quality`` is the JPEG compression
quality in ``0 -- 100`` and is only
meaningful when the output is JPEG (the
keyword is ignored for the lossless
formats). The default of ``50`` is the
right balance for *most* applications;
``70 -- 85`` is the band for higher
visual quality, ``30 -- 50`` is the
right range for small thumbnails and
bandwidth-constrained transmission, and
``90+`` is reserved for cases where the
image will be inspected manually or run
through a downstream algorithm sensitive
to compression artefacts.

The receiver image is returned so the
call chains:
``img.save("/sdcard/x.jpg").draw_string(0, 0, "saved")``.
The returned object is the same in-memory
image; the save is a side effect.

A typical use is the *capture-and-log*
pattern. A trigger fires (a blob is
detected, a button is pressed, a timer
elapses); the script captures a frame; it
appends a timestamp to the filename; and
it calls :meth:`~image.Image.save` to
push the image to the SD card. The IDE
preview keeps running, the next trigger
fires, and the saved files accumulate.

Encoding to memory
------------------

When the destination is not the
filesystem but a network connection, a
serial port, or another module's input,
the application needs the encoded byte
stream *in memory* rather than on disk.
:meth:`~image.Image.to_jpeg` and
:meth:`~image.Image.to_png` produce
exactly that:

::

    encoded = img.to_jpeg(quality=80, copy=True)
    bytes_to_send = encoded.bytearray()
    sock.send(bytes_to_send)

The default behaviour is in-place
conversion: the receiver is converted
into a JPEG (or PNG) image and the same
object is returned. With ``copy=True``
the conversion writes into a
freshly-allocated heap object; with
``copy_to_fb=True`` the output lands in
the frame buffer. The choice is the same
one any other conversion method offers --
in-place by default, copy when the
original is needed afterwards.

``quality`` and ``subsampling`` are the
same JPEG tuning knobs the save path
exposes. ``subsampling`` chooses the
chroma-subsampling scheme:
:data:`image.JPEG_SUBSAMPLING_AUTO`
picks the best for the chosen quality,
:data:`image.JPEG_SUBSAMPLING_444`
keeps chroma at full resolution
(largest file, best colour accuracy),
:data:`image.JPEG_SUBSAMPLING_422` and
:data:`image.JPEG_SUBSAMPLING_420` halve
the chroma resolution along one or both
axes (smaller files, slight colour
softening that is invisible at typical
viewing distances). The default of
``AUTO`` is the right choice unless the
application has a specific need.

PNG via :meth:`~image.Image.to_png` is
*lossless* but slower to encode and
produces larger files than JPEG for
photographic content (photographic
content compresses badly under PNG's
prediction scheme). Use PNG when the
image is line art, a screenshot, or
contains hard-edged graphics drawn over
a captured frame -- the lossless
encoding preserves the sharp edges that
JPEG would soften. Otherwise JPEG is
the right default.

Both :meth:`~image.Image.to_jpeg` and
:meth:`~image.Image.to_png` accept the
same drawing-style positional and scale
keywords other conversion methods take
-- ``x_scale``, ``y_scale``, ``roi``,
``rgb_channel``, ``alpha``,
``color_palette``, ``alpha_palette``,
``hint`` -- so the same call can encode
a scaled, cropped, or palette-mapped
version of the source in one step.
:meth:`~image.Image.compress` is the
legacy spelling of
:meth:`~image.Image.to_jpeg`; the two
take the same arguments and produce the
same result.

What compression buys
---------------------

The numbers behind the JPEG-versus-raw
trade-off are worth working through
once.

A 320-by-240 RGB565 frame is 153,600
bytes (one captured frame at QVGA). A
640-by-480 frame is 614,400 bytes; a
1280-by-960 frame is 2,457,600 bytes.
None of those are large compared to a
desktop or phone display, but they are
substantial in the context of a cam
that has a few MB of RAM total, an SD
card with a finite write bandwidth,
and a host link that is typically
running over USB CDC, a UART, or a
wireless module at modest speeds.

JPEG at ``quality=50`` typically
compresses a photographic captured
frame by 10 -- 20x: that 614 KB
640-by-480 frame becomes a 30 -- 60 KB
encoded byte stream. At ``quality=85``
the compression drops to 5 -- 10x
(60 -- 120 KB for the same frame). At
``quality=10`` -- artefact-laden but
still recognisable -- the compression
reaches 30 -- 50x (12 -- 20 KB).

Those numbers determine what is
practical to *do* with the saved
frames. An SD card writing at 10 MB/s
sustains 30 frames per second of
``quality=50`` JPEG-encoded 480p
content with room to spare; saving the
same content uncompressed at the same
rate requires roughly 18 MB/s and
quickly outruns even a fast card. A
USB host pulling JPEG-encoded frames
over CDC at 1 MB/s receives 30 -- 50
KB frames at 20 -- 30 frames per
second; pulling raw frames at the same
rate it gets one or two frames a
second.

In short: the compression methods are
not just a convenience for saving. They
are what makes the captured frame
*usable* outside the cam at frame
rates the application cares about.
Choosing the right compression -- JPEG
quality 50 for general logging, 80 for
quality work, PNG for line-art capture
-- is part of the routine work of any
non-trivial cam application.

With :meth:`~image.Image.save` putting
captured frames onto the filesystem and
:meth:`~image.Image.to_jpeg` /
:meth:`~image.Image.to_png` producing
encoded byte streams in RAM, the camera
can hand its captures off to anything
downstream. Some applications need more
than single-frame I/O, though: they
need to record a *sequence* of frames
at the natural capture rate and play
them back later, the way a video
recorder does. The recording-and-
playback path is covered next.
