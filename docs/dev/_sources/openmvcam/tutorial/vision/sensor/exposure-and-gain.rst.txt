Exposure and gain
=================

Two knobs change how brightly each pixel cell is reported
to the rest of the pipeline:

* *Exposure time* (also called integration time) -- how
  long the photodiode is allowed to collect charge before
  the read-out.
* *Analog gain* -- the multiplier applied to the read-out
  voltage by an on-chip amplifier before the ADC.

Both knobs make the recorded image brighter, but the way
they get there is different and each carries its own cost.

Exposure time
-------------

Longer exposure means each cell collects more electrons per
frame, so the digital count comes out higher for the same
scene. Halving the exposure roughly halves the count;
doubling it roughly doubles. The relationship is linear up
until the well saturates.

The cost is motion. The cell records the average light
arriving at it across the whole integration window, so any
object that moves a noticeable distance during that window
gets smeared across multiple pixels -- *motion blur*. A
walking person at 1/30 s exposure blurs over several
pixels; the same person at 1/500 s appears sharp.

Long exposure also brings the cell closer to saturation, so
in well-lit scenes the exposure has to come *down* even
though brightness is fine -- otherwise the highlights clip.

Analog gain
-----------

Analog gain is a small amplifier between the photodiode
read-out and the ADC. The signal voltage is multiplied by
the gain before it is digitized, so the same number of
electrons ends up reading as a bigger number. Gain is
usually expressed in decibels (dB); a doubling of gain is
+6 dB.

Gain helps in light too dim to expose any longer -- where
extending the exposure would either drop the frame rate
below the application's needs or introduce too much motion
blur. The cost is noise. The amplifier multiplies the noise
floor along with the signal, so the *signal-to-noise ratio*
does not improve with more gain. High gain produces a
grainier, noisier image at the same scene brightness as low
gain.

Some sensors also expose a *digital gain* knob, which is a
post-ADC integer multiplier. Digital gain is even worse for
the noise picture than analog gain, because it also
amplifies the quantization noise from the ADC. Reach for it
last.

Auto-exposure and auto-gain
---------------------------

Real cameras need to handle scenes that span a huge range
of brightness -- a dim indoor room and a sunlit window in
the same field of view. Two control loops adjust the knobs
in real time:

* *Auto-exposure control* (AEC) measures the average pixel
  value in the recent frame (often weighted toward the
  centre, or weighted away from the brightest pixels) and
  adjusts the exposure time to drive that average toward a
  target.
* *Auto-gain control* (AGC) does the same with analog
  gain, usually as a fallback once the exposure time has
  already been pushed to its safe maximum.

The order matters. Adjusting exposure first and gain
second gives the best signal-to-noise ratio for a given
target brightness, since exposure gathers more signal
without amplifying noise, while gain amplifies both. AEC
and AGC therefore work in priority: exposure increases
first to brighten a dim scene, and gain only kicks in once
the exposure has hit its ceiling (set by the frame rate or
by an explicit motion-blur budget).

High dynamic range
------------------

AEC and AGC pick the right single-frame brightness for the
*average* of the scene, but every scene has parts brighter
and dimmer than the average. A single exposure can only
cover so much of that range at once -- short exposures
preserve the highlights but bury the shadows in read-noise;
long exposures pull up the shadows but clip the highlights
at saturation. The sensor's *dynamic range* -- the ratio
between the brightest pixel it can record without clipping
and the darkest it can distinguish from noise -- is fixed
by the photodiode's full-well capacity and the read-noise
floor, and many scenes have a wider range than the sensor
can capture in one frame. A sunlit window in a dim indoor
room is the classic example.

*High dynamic range* (HDR) imaging works around the limit
by combining two or more exposures of the same scene -- at
minimum a short and a long, sometimes more -- into a
single output frame. The short exposures preserve the
highlights without saturating; the long exposures pull the
shadows up out of the noise floor. The combined image
takes the highlights from the short frames and the shadows
from the long ones, ending up with more usable dynamic
range than any single input could carry on its own.

Combining can happen off-chip, with software stitching a
multi-frame burst, or on-chip, with the sensor interleaving
short- and long-exposure rows in alternating scan lines or
running each pixel through two read-out paths at different
conversion gains. Either way the result is one frame with
more bits of dynamic range than the photodiode could record
in a single shot.

That extended-range frame is not directly displayable. The
framebuffer and any consumer downstream of it run at a
fixed bit depth (usually 8 bits per channel), and the HDR
signal can run to 12, 16, or more. *Tone mapping*
compresses the extra bits back down to the output depth by
applying a non-linear curve that keeps both shadow and
highlight detail visible. A straight linear scaling of the
HDR signal would either crush the dim regions to black or
clip the bright regions to white; a good tone map gives up
some absolute brightness fidelity to retain detail across
both ends of the range, and the output looks much closer
to what the eye actually sees in the scene than any single
sensor exposure ever could.
