The ISP pipeline
================

The *image signal processor* (ISP) is the hardware pipeline
that turns the raw pixel values from the sensor into a
finished colour image. The on-sensor :doc:`pixel-level
corrections <../sensor/calibration>` are the first stages
of that pipeline. After those run, the rest of the pipeline
does the colour processing and output formatting in a
fixed order on every frame.

.. figure:: ../figures/isp-pipeline.svg
   :alt: A vertical pipeline diagram with eight labelled
         boxes, top to bottom: statistics extraction, auto
         white balance, debayering, colour matrix
         correction, gamma correction, image scaling,
         image cropping, and pixel packing. An arrow at
         the top is labelled "corrected Bayer pixels" and
         an arrow at the bottom is labelled "finished
         frame".

   The colour-processing and output stages of the ISP. The
   pipeline runs each stage over every pixel in the frame
   before the next one starts.

The stages
----------

Each stage applies one well-defined transformation in
turn. The order matters -- later stages assume earlier
ones have already run, and a couple of stages take inputs
from the *previous* frame's output as well.

1. **Statistics extraction** measures per-region average
   brightness and per-channel sums from the corrected
   Bayer frame. The numbers feed the auto-exposure,
   auto-gain, and auto-white-balance control loops, which
   then update the sensor's settings for the *next*
   frame.
2. **Auto-white-balance gains** scale each Bayer pixel
   by a per-colour multiplier -- red pixels by an R gain,
   green pixels by a G gain, blue pixels by a B gain --
   pushing the scene's white reference toward neutral
   grey so the recorded colours look the way the eye saw
   them. The multipliers come from the previous frame's
   AWB statistics.
3. **Debayering** reconstructs the missing two colour
   channels at every pixel from the Bayer mosaic, turning
   one-channel-per-pixel raw data into three-channel RGB.
   (See :doc:`debayering`.) Everything after this stage
   runs on RGB pixels rather than on the Bayer mosaic.
4. **Colour matrix correction (CCM)** applies a 3x3
   matrix multiply to each RGB pixel that maps the
   sensor's native red-green-blue response into a standard
   colour space. Each sensor's filters have their own
   spectral response, which is not exactly what any
   standard expects; the matrix is a per-sensor calibrated
   transform that turns "sensor RGB" into "standard RGB".
5. **Gamma correction** applies a non-linear curve to
   each channel that compresses the linear sensor signal
   into a perception-matched encoding. The eye notices
   differences between dark tones more than differences
   between bright tones, so an encoding that spends more
   of its bit budget on the dark end captures more visible
   detail at a given bit depth.
6. **Image scaling** resizes the frame from the sensor's
   native resolution to the target output resolution.
   Most applications run at less than the sensor's full
   pixel count, and scaling down reduces both the
   bandwidth and the memory pressure on everything that
   follows.
7. **Image cropping** extracts a sub-rectangle of the
   scaled frame and discards the pixels outside it. Used
   to capture a region of interest, match a specific
   aspect ratio, or drop a border the application does
   not need.
8. **Pixel packing** converts the per-channel internal
   representation (typically 10 or 12 bits per channel)
   into the chosen output format and writes the result to
   RAM.

The control-loop feedback
-------------------------

Stages 1 and 2 form a control loop that spans multiple
frames. The statistics extracted from frame N tell the
sensor how bright the scene was and how its colour balance
sat that frame; the auto-exposure, auto-gain, and
auto-white-balance controllers use those numbers to pick
new exposure, gain, and white-balance register values for
frame N+1. The new values take effect on the next frame's
read-out, the new frame's statistics come back, and the
loop closes.

For a scene that does not change, the loop converges
within a few frames and stays at a constant setting. For a
scene whose brightness or colour cast changes -- the
camera panning from indoors to a sunlit window, for
example -- the loop tracks the change over several frames,
and the user sees a brief brightness or colour drift on
the way to the new steady state.

Where the ISP runs
------------------

Two arrangements are common.

* An *on-sensor ISP* runs the whole pipeline inside the
  sensor chip and outputs a finished RGB image. The MCU
  just collects the result.
* An *off-sensor ISP* lives in the host MCU or SoC. The
  sensor outputs raw Bayer; the MCU's silicon (or its
  driver code) runs the pipeline before handing the
  finished frame to user code.

The split affects what output formats the sensor can hand
the user directly. A sensor with a full on-chip ISP lets
the user pick from any finished format the chip supports.
A sensor without one outputs Bayer only, and the format
conversions happen in MCU silicon or software.
