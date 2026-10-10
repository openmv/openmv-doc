Pixel formats
=============

The final stage of the ISP pipeline packs each pixel into
a particular byte layout in memory. The format chosen
trades off image quality, memory size, and how downstream
code reads the bytes back out. A handful of formats
dominate.

RAW (Bayer)
-----------

The default output is raw Bayer -- the same one-channel-
per-pixel mosaic the sensor produces. One byte per pixel,
laid out in the Bayer pattern: red and green alternating
on even rows, green and blue alternating on odd rows. No
debayering has been applied, so each cell still holds
only the value its colour filter passed through.

Raw Bayer is one third the memory of a finished
three-channel RGB image -- one byte per pixel versus
three -- and no ISP cycles have been spent debayering or
converting it. The cost is that user code has to do the
debayering itself before any colour-aware processing can
run.

RGB888
------

RGB888 is the natural finished format for a colour
image: three bytes per pixel, one each for the red,
green, and blue channels at 8 bits per channel.
Twenty-four bits per pixel and just under seventeen
million distinct colours.

RGB888 is the conceptual reference for finished colour
images and most off-board software speaks it. On
embedded hardware its main drawback is the 24-bit pixel
size -- not a multiple of the processor's word size,
awkward for memory alignment, and 50% bigger than the
next format down.

RGB565
------

RGB565 packs each pixel into two bytes: five bits of
red, six bits of green, five bits of blue. The extra
green bit reflects the eye's higher sensitivity to
green, and it matches the green channel's double weight
in the Bayer pattern.

RGB565 is the default colour format on the OpenMV Cam.
Two bytes per pixel is 16-bit aligned, which fits the
MCU's natural data widths -- pixel loads, stores, and
arithmetic all run at full speed, and many operations
can process a pair of pixels at once. RGB888's 24-bit
pixels do not line up that way and pay a cost on every
access. The 33-percent memory saving over RGB888 also
adds up: QVGA (320 x 240) is 150 KB in RGB565 against
225 KB in RGB888, and the gap grows with resolution.

The trade-off is 65 thousand distinct colours instead of
seventeen million. For most machine-vision tasks the
difference is invisible, because the algorithms reduce
the frame to thresholded or edge-detected representations
that drop most of the colour detail anyway. For human
viewing the missing bits show up as faint banding in
smooth colour gradients but not as anything the eye
flags immediately.

YUV422
------

YUV422 splits each pixel's colour into a *luminance*
value (Y) and two *chrominance* values (U and V), and
then subsamples the chrominance because human vision is
much less sensitive to colour variation than to
brightness variation. Each pixel carries its own Y, but
adjacent pixel pairs share one U and one V. The byte
layout for each pair is four bytes -- Y0, U, Y1, V --
which works out to two bytes per pixel on average,
identical to RGB565.

The two bytes mean different things from RGB565's
though. The Y channel alone is a ready-to-use 8-bit
grayscale image, which is what most classical
machine-vision algorithms (edge detection, template
matching, blob analysis) actually consume; the U and V
channels carry the colour information for the small
number of algorithms that need it.

YUV422 is the right choice when the pipeline needs both
-- an early-stage algorithm that reads only Y followed
by a later stage that uses the chroma for finer colour
decisions -- because the Y values are sitting right
there ready to use without a colour-space conversion.

Grayscale
---------

Grayscale is one byte per pixel: the luminance value
only, no colour at all. It is the smallest finished
format -- half the size of RGB565 and YUV422, one-third
the size of RGB888.

Most classical machine-vision algorithms work on
grayscale anyway, so dropping the colour channel
directly out of the sensor is often the simplest and
most memory-efficient choice. Edge detection,
line-finding, blob analysis, QR-code decoding, template
matching, and AprilTag detection all run on grayscale
and benefit from the smaller buffer.

Other formats
-------------

A few formats the OpenMV Cam can produce do not come out
of the ISP pipeline as part of the normal flow.

**BINARY** is one bit per pixel -- the smallest possible
representation. Used for thresholded images, mask
buffers, and the output of any operation that
distinguishes only between match and no-match at each
pixel.

**JPEG** is a compressed colour format. Some sensors
include an on-chip JPEG encoder and can deliver
JPEG-compressed frames directly; for sensors without
one, the MCU runs a JPEG encoder over a finished RGB or
grayscale frame after the ISP. Either way the output is
a JPEG bitstream, useful for saving frames to storage or
sending them over a bandwidth-limited link.

**PNG** is a lossless compressed format. Sensors do not
produce PNG directly; the MCU compresses a finished RGB
or grayscale frame on demand. Useful when bandwidth or
storage matters but the lossy compression JPEG applies
would discard information the application later needs.
