On-sensor calibration
=====================

The raw output of a pixel cell is not yet ready to be used.
A handful of corrections are applied to it before the data
leaves the sensor -- partly in the chip's silicon, partly
in the driver code that programs the chip -- to deal with
imperfections the sensor introduces along the way. They run
in a fixed order on every frame: column *fixed-pattern
noise* (FPN) trim first, then black-level subtraction,
then defect-pixel correction, then lens-shading correction.
Knowing what each does matters because the image that
reaches user code has already been through all of them.

Column-FPN correction
---------------------

Each column of the sensor has its own amplifier and column
ADC, and small manufacturing variations between them mean
every column reads slightly differently from its
neighbours. Without correction, this *fixed pattern* shows
up as faint vertical streaks in the output -- the streaks
stay put from frame to frame because they come from the
silicon itself rather than from the scene. The sensor
measures the per-column offset and gain trims at the
factory, stores them in its calibration ROM, and applies
them on every read-out before any further correction runs.
Doing this first lets the rest of the pipeline assume
every column behaves the same way, including the dark
reference pixels that black-level calibration uses next.

Black-level calibration
-----------------------

The ADC's zero -- the digital count that should correspond
to an empty photodiode -- is not perfectly stable. It
drifts with temperature, with supply-voltage variation,
and slightly from one pixel to the next. Without
correction, a perfectly dark frame would not read as zero;
each pixel would carry a small positive *dark offset*.

The standard fix is to include rows or columns at the edge
of the sensor that are physically covered by metal so that
no light ever reaches them. Their digital counts give the
true dark reference at the current operating conditions.
The sensor reads those covered pixels every frame, averages
them per row or column, and subtracts the average from
every other pixel. The light pixels then come out with
zero count for an unilluminated photodiode, regardless of
temperature or supply drift.

Defect-pixel correction
-----------------------

A small fraction of pixels in any sensor are *defective* --
they read a constant value (stuck high or stuck low)
regardless of how much light reaches them. Some defects
come from manufacturing variation, and more accumulate
slowly over the sensor's life (cosmic-ray hits during long
periods of operation are the usual culprit).

Modern sensors handle this on the fly with a small spatial
filter. Every frame, each pixel is compared to its
same-colour neighbours; any pixel that lies far enough
outside the local median to be implausible is replaced by
a value derived from those neighbours. The filter catches
both factory defects and ones that develop later, without
needing a per-sensor calibrated bad-pixel map, and the
defect is invisible in the output.

Lens-shading correction
-----------------------

The :doc:`cos⁴ falloff <../optics/real-lens-effects>`
combined with mechanical vignetting from the lens housing
gives every uncorrected frame a noticeable corner
darkening. The *lens-shading correction* (LSC) hardware on
the sensor compensates by multiplying each pixel by a gain
that depends on its position in the frame -- 1.0 at the
centre, rising smoothly toward the corners to follow the
inverse of the measured falloff curve.

The sensor provides the multiplier hardware, but the gain
map itself is the MCU's responsibility. The driver writes
the map into the sensor's LSC registers at start-up,
either from a calibration the driver stores or from a
fresh measurement against a flat reference target. Some
sensors compress the map down to a small set of polynomial
coefficients so the on-chip registers can hold it.

LSC depends on the lens. Swapping lenses moves the falloff
curve, so an LSC map calibrated for one lens will not
match another -- a misapplied map looks like dim corners
(under-correction) or bright corner blotches
(over-correction).
