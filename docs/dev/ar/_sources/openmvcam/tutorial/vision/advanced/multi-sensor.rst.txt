Multiple sensors
================

A handful of OpenMV Cams pair two image sensors on the same
board -- most commonly a colour camera alongside a FLIR®
Lepton® thermal sensor, but the same shape applies to the
colour-plus-event boards and any future dual-sensor
hardware. Each sensor has its own pixel array, its own
control bus, and runs its own pipeline at its own frame
rate. The :class:`~csi.CSI` API extends to cover them by
letting the application instantiate one :class:`~csi.CSI`
object per physical sensor.

Selecting which sensor
----------------------

The :class:`~csi.CSI` constructor takes a ``cid`` argument
that names a specific sensor on the board. ``cid=-1``
(the default) selects the *primary* sensor; the named ``cid``
constants select a secondary by chip ID::

    import csi

    csi_rgb     = csi.CSI()                    # primary colour sensor
    csi_thermal = csi.CSI(cid=csi.LEPTON)      # FLIR® Lepton®

Each instance owns its own configuration -- pixel format,
framesize, exposure / gain knobs, framebuffer pool -- and
is reset, configured, and read independently of the other.
The constants for the supported secondary sensors
(:data:`~csi.LEPTON`, :data:`~csi.GENX320`, and the others
listed in the :class:`~csi.CSI` reference) name the chip
the application expects on the secondary port; the driver
fails the construction if the actual chip does not match.

Capturing from both sensors
---------------------------

Each sensor runs its capture pipeline independently of the
other -- the colour sensor might deliver thirty frames a
second while the Lepton® delivers nine. The straightforward
way to handle that mismatch is to let the *faster* sensor
drive the loop and read the slower sensor non-blockingly,
taking whatever is ready and skipping the iteration when
nothing is::

    import csi

    csi_rgb     = csi.CSI()
    csi_thermal = csi.CSI(cid=csi.LEPTON)

    csi_rgb.reset()                        # powers the rail, pulses RESET
    csi_rgb.pixformat(csi.RGB565)
    csi_rgb.framesize(csi.QVGA)

    csi_thermal.reset(hard=False)          # I2C reconfigure only
    csi_thermal.pixformat(csi.GRAYSCALE)
    csi_thermal.framesize(csi.QQVGA)

    while True:
        rgb_img     = csi_rgb.snapshot()                  # blocks for next colour frame
        thermal_img = csi_thermal.snapshot(blocking=False)  # returns None if not ready
        if thermal_img is not None:
            # process aligned colour + thermal pair
            pass
        else:
            # process colour only on this iteration
            pass

The blocking :meth:`~csi.CSI.snapshot` paces the loop; the
non-blocking one returns the most recent thermal frame when
a fresh one has landed since the previous call, and ``None``
otherwise. The application keeps running at the colour
sensor's frame rate and gets a thermal frame whenever the
Lepton® produces one.

The opposite pattern -- two blocking snapshots back to back
-- works too, but the loop then runs at the *slower* of the
two sensors' rates, with the faster sensor's pipeline
stalling between iterations. Pick whichever rate the
application's downstream processing actually wants to drive.

Reset on shared power rails
---------------------------

Some dual-sensor boards run both chips off a single power
rail or share a reset line. On those, the first
:meth:`~csi.CSI.reset` brings the rail up and pulses the
shared signal; subsequent resets on the other
:class:`~csi.CSI` instances should pass ``hard=False`` so
they reprogram only their own chip without dragging the
neighbour through a reset::

    csi_rgb.reset()                        # primary -- powers the rail, pulses RESET
    csi_thermal.reset(hard=False)          # secondary -- I2C reconfigure only

A ``hard=True`` on a secondary in this shape would re-reset
the primary as a side effect, undoing any setup the
application had already pushed. The reference page for each
dual-sensor board calls out whether the rails are shared.

Selecting the stream source
---------------------------

Cameras with two sensors have two :class:`~csi.CSI`
instances but still only one stream framebuffer between them.
A constructor argument picks which sensor's frames feed the
preview::

    csi_rgb     = csi.CSI()                    # primary
    csi_thermal = csi.CSI(cid=csi.LEPTON,
                          stream=True)         # preview source

``stream=True`` makes the named instance the source. With no
``stream=`` argument the primary sensor (``cid=-1``, the
default) is the source; instances built with ``cid=`` of a
secondary sensor stay silent on the preview unless
``stream=True`` is passed explicitly. Calls to
:meth:`~csi.CSI.snapshot` on the non-selected sensor still
capture frames into that sensor's framebuffers normally --
they just do not update the preview.
