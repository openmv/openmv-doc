QR codes and AprilTags
======================

The detectors so far -- blobs, lines,
circles, rectangles -- find *geometric*
features: positions and outlines that a
downstream stage interprets. The remaining
detectors find *symbolic* features: printed
patterns whose visual structure exists
specifically to encode a payload. The camera
locates them, the decoder reads the bits, and
what comes back is not a position but a
*string* (or an *ID*) the printer of the
symbol chose deliberately.

Two such families dominate small-camera
applications. *QR codes* carry arbitrary
text, URLs, contact cards, or binary
payloads -- the consumer-facing 2D codes
that appear on posters, packaging, and
boarding passes. *AprilTags* carry a single
numeric ID from a small fixed set, decode
quickly even from a long distance, and (when
the lens intrinsics are supplied) report a
6-DoF *pose* in the camera frame -- the
robotics-facing 2D codes that mark drones,
calibration targets, and fiducials. Both
detectors return result objects with the
same bounding-box vocabulary the blob and
rect detectors use, but the payload makes
them genuinely different from anything
covered so far.

QR codes
--------

:meth:`~image.Image.find_qrcodes` scans the
frame for QR codes and returns a list of
:class:`QRCode <image.qrcode>` result
objects:

::

    codes = img.find_qrcodes()

    for c in codes:
        img.draw_rectangle(c.rect, color=(0, 255, 0))
        for corner in c.corners:
            img.draw_circle((corner[0], corner[1], 4),
                            color=(0, 255, 0))
        print(c.payload)

The detector takes a single optional ``roi``
to restrict the search. It needs grayscale
input -- a colour frame is converted
internally before decoding -- and it works
on every supported board except the M4.

Each detection carries the bounding box
(``x``, ``y``, ``w``, ``h``, ``rect``), the
four detected corners (``corners``, the
projective quadrilateral the QR code's
finder patterns trace out), and the decoded
payload as a string. The corners are the
right thing to draw when annotating the
detection -- a QR code viewed off-axis is
not axis-aligned and the bounding box gives
only a loose outline.

The decoder metadata covers everything the
QR decoder learned along the way.
``version`` is the QR-code version, 1 -- 40,
which sets the module grid size (a version-1
code is 21 modules wide, a version-40 code
is 177). ``ecc_level`` is the error-
correction level (0 -- 3 for L / M / Q / H);
higher levels reserve more codewords for
error correction and survive more damage at
the cost of less payload room. ``mask`` is
the mask pattern (0 -- 7) the encoder picked
to minimise decoder confusion. ``data_type``
is the encoding the decoder reported --
numeric, alphanumeric, binary, or Kanji --
and the ``is_numeric`` / ``is_alphanumeric``
/ ``is_binary`` / ``is_kanji`` flags expose
the same value as friendlier booleans.

``eci`` is the Extended Channel
Interpretation value, which identifies the
text encoding the bytes are in (UTF-8,
ISO-8859-1, and so on). A QR code from
arbitrary printed material may not be
guaranteed UTF-8; an application that needs
to decode the bytes correctly checks ``eci``
and decodes accordingly. The Kanji case in
particular: MicroPython does not parse
Kanji encoding, so an ``is_kanji`` payload
has to be treated as a byte array and
decoded by the application.

A typical use: a camera reads QR codes off a
conveyor and reports the decoded payload to
a host. The cam runs
:meth:`~image.Image.find_qrcodes` once per
frame, iterates the returned list, picks the
codes whose ``data_type`` matches what the
application expects, and forwards
``c.payload`` over UART or USB. The
bounding-box and corner data are useful for
the IDE preview but are not what the host
cares about.

AprilTags
---------

:meth:`~image.Image.find_apriltags` scans
the frame for AprilTags and returns a list
of :class:`AprilTag <image.apriltag>`
result objects:

::

    tags = img.find_apriltags(families=image.TAG36H11)

    for t in tags:
        img.draw_rectangle(t.rect, color=(0, 255, 0))
        img.draw_cross(t.cx, t.cy, color=(0, 255, 0))
        print(t.id, t.decision_margin)

AprilTags differ from QR codes in their
design goals. A QR code is built to encode
*arbitrary data* in a single dense symbol
the user reads once at close range. An
AprilTag is built to encode *a small ID*
in a sparse symbol the camera reads
continuously from a distance, with as much
error tolerance as the Hamming code of its
family allows. The trade-off shows up in
both directions: a QR code can carry
hundreds of bytes but needs to be read up
close; an AprilTag carries only a few
hundred unique IDs but reads reliably from
metres away.

The ``families`` keyword takes a bitmask of
the tag families to decode. The available
families are :data:`image.TAG16H5`,
:data:`image.TAG25H9`,
:data:`image.TAG36H10`,
:data:`image.TAG36H11`,
:data:`image.TAGCIRCLE21H7`,
:data:`image.TAGCIRCLE49H12`,
:data:`image.TAGCUSTOM48H12`,
:data:`image.TAGSTANDARD41H12`, and
:data:`image.TAGSTANDARD52H13`. Each family
trades off ID count against
error-correction strength: ``TAG16H5`` has
30 IDs and 0 bit errors tolerated;
``TAG25H9`` has 35 IDs and 3 bit errors;
``TAG36H11`` (the default and the most
common) has 587 IDs and 4 bit errors.
Detection time scales with the number of
enabled families, so an application enables
only what it actually prints. The bitmask
is the bitwise OR of the family constants
when multiple families are needed in one
call.

Each detection carries the bounding-box
vocabulary -- ``x``, ``y``, ``w``, ``h``,
``rect``, ``area``, integer and sub-pixel
centroids (``cx``, ``cy``, ``cxf``, ``cyf``)
-- and the four detected corners
(``corners``). The identification fields
follow: ``id`` is the numeric ID within the
family (0 -- 586 for ``TAG36H11``),
``family`` is the numeric family constant,
and ``name`` is the family name as a
string.

The *match-quality* fields are what an
application uses to filter detections.
``decision_margin`` is a 0.0 -- 1.0
confidence score; higher is better, and
filtering out detections below
``decision_margin > 0.1`` cleans up most
spurious hits at no cost. ``hamming``
counts the bit errors the decoder accepted
for this tag -- lower is better, ``0``
meaning a perfect decode. ``goodness`` is a
historical image-quality metric the current
decoder no longer computes; it is always
0.0 and can be ignored.

Pose from intrinsics
--------------------

The transformative feature of
:meth:`~image.Image.find_apriltags`, the one
that justifies AprilTags as the robotics
fiducial of choice, is that the method can
recover the tag's *6-DoF pose in the camera
frame* directly from the detected corners
and a small set of calibration intrinsics.
The intrinsics are the camera's X and Y
focal lengths in pixels (``fx``, ``fy``) and
the optical centre in pixels (``cx``,
``cy``), all four of which the application
measures once with a calibration procedure
and hard-codes thereafter.

When the intrinsics are supplied, the
returned :class:`AprilTag <image.apriltag>`
populates its ``x_translation``,
``y_translation``, ``z_translation`` fields
with the tag's position relative to the
camera, and ``x_rotation``, ``y_rotation``,
``z_rotation`` (and the duplicate
``rotation`` for symmetry) with the tag's
orientation. Without intrinsics, all six
fields are 0.0 and the application is
responsible for any pose estimation it
needs.

The translation fields are reported in
tag widths: the decoder treats the tag as
1 unit wide, so the application multiplies
each translation by the physical width of
the printed tag to get metric distances. A
tag printed at 100 mm across and reporting
``z_translation = 8.3`` is 830 mm away from
the camera; the same tag printed at 50 mm
across at the same distance would report
``z_translation = 16.6``. The rotation
fields are in radians and need no scaling.

The pose estimate is the basis for a wide
range of robotics applications: docking a
robot to a charging station marked with a
tag, following a printed waypoint trail,
recovering the camera's own pose from
multiple known tags in the environment. A
camera that knows the intrinsics, sees a
tag, and has a real-world position for the
tag has, by the same arithmetic, a
real-world position for itself.

When to pick which
------------------

QR codes and AprilTags solve different
problems. The choice between them comes
down to *what the printed symbol carries*.

When the application needs to carry
*arbitrary data* through the printed symbol
-- a URL, a serial number string, a contact
record -- the QR code is the right choice.
Hundreds of bytes fit in a modestly-sized
code, the encoding is public and supported
on every smartphone, and the decoder copes
with rotation, moderate damage, and oblique
angles.

When the application needs *a small ID
read continuously from a distance with
optional pose* -- a fiducial on a moving
robot, a calibration target in a room, a
docking marker on a charging station -- the
AprilTag is the right choice. Hundreds of
IDs are plenty for the use case, the
Hamming code recovers from bit errors that
would defeat a QR code, and the pose
estimate is free once the intrinsics are
calibrated.

Some applications use both: an AprilTag
marks a known location and an associated QR
code (printed alongside) carries the
metadata about what that location *means*.
The two detectors run independently on the
same frame and the application correlates
their bounding boxes to match each tag to
its companion code.

With QR codes for arbitrary payloads and
AprilTags for IDs and pose, the cam can
read the two most common 2D codes the
camera will ever see. Older code families
the camera also handles -- the 1D barcodes
printed on consumer goods and the
high-density Data Matrix codes printed on
industrial parts -- have their own
detectors, and those come next.
