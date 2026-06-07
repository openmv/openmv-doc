Barcodes and Data Matrix codes
==============================

QR codes and AprilTags are recent
inventions, born in the era of dense
two-dimensional symbols and cheap
smartphone cameras. The codes printed on
the side of a cereal box, the wrist band a
hospital patient wears, the maker mark
laser-etched onto a circuit board predate
all of that. They are *one-dimensional*
*barcodes* and small high-density
*Data Matrix* codes, and the image module
has dedicated decoders for both. The
applications they fit are the industrial,
retail, and inventory ones the consumer
2D codes never quite covered.

1D barcodes
-----------

A *one-dimensional* barcode encodes its
payload as a sequence of vertical bars of
varying widths, read left-to-right (or
top-to-bottom for vertically-oriented
codes). The widths quantise to one of a
small set of values, and the sequence of
widths spells out characters in whatever
symbology the printer chose: numeric for a
UPC product code, alphanumeric for a
warehouse part number, or arbitrary text
for a Code 128 label.

:meth:`~image.Image.find_barcodes` scans
the frame for 1D barcodes in any of the
supported symbologies and returns a list
of :class:`BarCode <image.barcode>` result
objects:

::

    codes = img.find_barcodes()

    for c in codes:
        img.draw_rectangle(c.rect, color=(0, 255, 0))
        print(c.payload, c.type, c.quality)

The decoder scans both horizontally and
vertically across the frame in a single
call, so a barcode printed at any angle is
found in one pass without the application
having to rotate the input. ``roi``
restricts the search; no other tuning
parameters exist -- the decoder is
self-contained.

The supported *symbologies* cover the
common consumer and industrial families.
The retail set is :data:`image.EAN2`,
:data:`image.EAN5`, :data:`image.EAN8`,
:data:`image.UPCE`, :data:`image.UPCA`,
:data:`image.EAN13` (the numeric
fixed-length codes on most consumer
packaging), :data:`image.ISBN10`, and
:data:`image.ISBN13` (the same families
re-purposed for books). The
general-purpose set is :data:`image.I25`
(Interleaved 2 of 5, common in shipping
labels), :data:`image.CODABAR` (used in
libraries and blood banks),
:data:`image.CODE39`, :data:`image.CODE93`,
and :data:`image.CODE128` (variable-length
alphanumeric symbologies for arbitrary
text). The high-density two-row symbology
:data:`image.PDF417` decodes too, and the
shelf-edge family
:data:`image.DATABAR` (RSS-14) and
:data:`image.DATABAR_EXP` (RSS-Expanded)
round out the list.

Each detection carries the bounding-box
vocabulary -- ``x``, ``y``, ``w``, ``h``,
``rect``, ``corners`` -- and the decoded
``payload`` as a string. ``type`` is the
symbology constant from the list above,
which an application checks when it cares
specifically about which family was
decoded (e.g. accepting only ``EAN13`` for
a grocery-scanner application).

The two fields that matter for filtering
are ``rotation`` and ``quality``.
``rotation`` is the in-image-plane angle
of the barcode in radians: the decoder
copes with arbitrary rotations, but
downstream code that wants to display the
detection cleanly may want to filter out
codes that come back tilted past some
threshold.

``quality`` is the decode count: the
number of scanlines that successfully
decoded the same payload. The decoder
runs across every row (and column) of
the frame that intersects the barcode,
and increments the counter each time the
decode succeeds. A printed barcode in
sharp focus and good lighting yields a
``quality`` in the tens; a partially
occluded or smudged barcode might decode
on just one or two scanlines and report
``quality`` of 1 -- 2. Filtering out
detections below ``quality > 5``
discards transient single-scanline
mis-decodes at no cost to the genuine
detections.

A 1D barcode application is small. Capture
a frame, call
:meth:`~image.Image.find_barcodes`,
iterate the returned list, filter on
``c.type`` and ``c.quality``, and forward
``c.payload`` over UART or USB to whatever
downstream stage is logging or
ringing up the scan.

Data Matrix
-----------

A *Data Matrix* code is a 2D symbol that
encodes its payload as a grid of black and
white cells, the way a QR code does. It
differs from a QR code in two practical
respects: it is *smaller* at the same
payload size (the encoding is denser) and
it is targeted at *industrial* use rather
than consumer use (where QR codes
dominate). The patterns laser-etched into
metal parts on a factory floor, the
labels printed on integrated-circuit
packages, the marks placed on medical
syringes -- all of those are typically
Data Matrices, not QR codes.

:meth:`~image.Image.find_datamatrices`
scans the frame for Data Matrix codes and
returns a list of
:class:`DataMatrix <image.datamatrix>`
result objects:

::

    codes = img.find_datamatrices()

    for c in codes:
        img.draw_rectangle(c.rect, color=(0, 255, 0))
        print(c.payload, c.rows, c.columns)

``roi`` restricts the search the usual
way. The one decoder-specific tuning knob
is ``effort``, an integer that controls
how hard the decoder works to find a
match. Higher values improve detection of
faint, damaged, or oblique codes at the
cost of frame rate; lower values run
faster but may miss codes the higher
effort would have found. Values below
about 160 effectively fail to detect;
values above about 240 give diminishing
returns. The default of 200 is a
reasonable balance for a clear image, and
the right starting point for a new
application is the default plus or minus
20 depending on whether the targets are
clean (lower) or distressed (higher).

Each detection carries the bounding-box
vocabulary and the four detected corners,
the decoded ``payload``, and the
in-image-plane ``rotation`` in radians.
The *layout metadata* describes the size
and density of the symbol the decoder
read: ``rows`` and ``columns`` are the
cell counts of the data grid; ``capacity``
is the maximum number of payload
characters the symbol could carry at that
size; ``padding`` is how many of those
slots went unused (``capacity -
len(payload)``).

The layout fields are useful for
applications that need to validate the
*format* of an etched mark rather than
its content. A part-tracking system might
require all marks to be 12-by-12 codes
with at most two padding characters; a
detection that came back at 8-by-8 (a
smaller symbol than the spec calls for)
or with 10 padding characters (mostly
empty) is flagged for re-marking.

When to pick which
------------------

Where QR versus AprilTag came down to
*payload kind* (arbitrary data versus
small ID), barcodes versus Data Matrix
codes come down to *physical density* and
*industry*.

When the application is consumer-facing
and the codes already exist in the
field -- groceries, books, shipping
labels, library books -- the right
detector is :meth:`~image.Image.find_barcodes`.
The codes the application is reading
were printed for a different system to
read, and the standardised retail
symbologies are what that system
expected.

When the application is industrial and
the codes are *being printed for the
application* -- inventory tracking on a
factory floor, lot codes etched onto
parts, traceability marks on medical
devices -- the right detector is
:meth:`~image.Image.find_datamatrices`
or :meth:`~image.Image.find_qrcodes`,
depending on whether the application
needs the higher density of Data Matrix
or the wider tooling support of QR.

A handful of applications mix all four
detectors in one pipeline. A package
inspection cam might run a
:meth:`~image.Image.find_barcodes` pass
for the printed UPC, a
:meth:`~image.Image.find_qrcodes` pass
for a shipping QR code on the same box,
and a :meth:`~image.Image.find_datamatrices`
pass for an etched part code, all on the
same captured frame; the three result
lists are correlated by bounding-box
position and reported as a single
detection record. Each detector's cost
adds, so applications that do this
typically narrow each pass with an
appropriate ``roi`` rather than searching
the full frame for every kind of code.

With 1D barcodes, Data Matrix codes, QR
codes, and AprilTags, the camera reads
the four families of printed and etched
symbols an application is likely to
encounter. The remaining detectors do not
decode symbols at all but instead measure
similarity: how closely two patches of
the same captured frame, or two frames at
different times, line up with each other.
That is the work of the matching methods,
and they come next.
