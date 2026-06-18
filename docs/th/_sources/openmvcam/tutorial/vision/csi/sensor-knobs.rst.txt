Sensor knobs
============

Beyond :meth:`~csi.CSI.pixformat` and
:meth:`~csi.CSI.framesize`, the :class:`~csi.CSI` class
exposes a handful of per-sensor controls that almost every
application reaches for sooner or later -- mounting
orientation, exposure, gain, white balance, and a few
debugging aids. Each one maps directly onto a sensor concept
covered earlier; the API just provides a Python handle for
the register write the driver makes underneath.

All of the methods below act on the underlying sensor. They
all push register writes over the sensor's :doc:`I2C control
bus <../sensor/data-bus>`, so the cost is microseconds and
the new setting takes effect on the *next* exposure --
typically the next :meth:`~csi.CSI.snapshot`.

Orientation
-----------

The camera does not know which way up it has been mounted.
Two flip flags applied at the sensor turn the picture the
right way around before any pixel leaves the chip::

    csi0.hmirror(True)
    csi0.vflip(True)

:meth:`~csi.CSI.hmirror` flips left-to-right and
:meth:`~csi.CSI.vflip` flips top-to-bottom. Together they
cover the cases that come up in practice: a board mounted
upside down (both flags ``True``), a board behind a
front-silvered mirror (``hmirror`` only), or one looking at a
reflected scene from below (``vflip`` only).

Because the flip happens in the sensor's read-out logic,
there is no CPU cost and no memory overhead -- the frame
lands in the framebuffer already oriented.

Exposure
--------

Exposure is the integration time -- how long the photodiode
in each pixel collects charge before the row is read out, in
microseconds. The driver starts with the sensor's
auto-exposure loop running, so the camera tries to keep the
average pixel value near a target. Disabling the loop pins
the exposure to a value the application chooses::

    csi0.auto_exposure(False, exposure_us=8000)

A fixed exposure is the right choice when the scene
brightness is stable and the application needs predictable
motion blur or consistent frame-to-frame intensity for
thresholding. Reading the current exposure back -- whether
the loop set it or the application did -- is a separate
call::

    us = csi0.exposure_us()

Calling :meth:`~csi.CSI.auto_exposure` with ``True`` and no
exposure value hands control back to the loop.

Gain
----

Gain is the amplifier applied to the pixel voltage before it
reaches the ADC, in decibels. Like exposure, the driver
starts with the auto-gain loop on. Two patterns come up
often. Capping the ceiling lets the loop adapt to lighting
but stops it from amplifying noise indefinitely in dim
scenes::

    csi0.auto_gain(True, gain_db_ceiling=16)

Pinning a fixed gain is the right move when the application
also pins the exposure -- gain stability matters for
applications that compare pixel values frame to frame, like
colour tracking::

    csi0.auto_gain(False, gain_db=0)

The current gain reads back through :meth:`~csi.CSI.gain_db`.
Whenever the application disables auto-gain it should also
disable auto-white-balance and auto-exposure -- otherwise the
control loops still in play will pull the image around in
ways that defeat the fixed gain.

White balance
-------------

White balance is the per-channel gain the ISP applies to the
red, green, and blue channels coming out of the debayer
stage so a white object looks white under any colour of
light. The auto-white-balance loop computes those three
gains from the per-region :doc:`statistics
<../color/isp-pipeline>` the ISP collects on every frame and
applies them on the next frame.

Most applications leave the loop running. Colour tracking is
the common exception -- the gains are also what the loop
will push around to chase a coloured object, so if the
application is trying to find a red blob, the loop will
quietly dim the red channel and the blob will stop matching.
Locking the loop fixes that::

    csi0.auto_whitebal(False)

Pass an explicit ``(r, g, b)`` tuple in decibels for repeatable
colour calibration -- the same gains across boards and
sessions::

    csi0.auto_whitebal(False, rgb_gain_db=(0.0, 0.0, 0.0))

The current gains read back as a tuple through
:meth:`~csi.CSI.rgb_gain_db`.

Frame rate cap
--------------

Sensors run at their native frame rate by default -- 30 to
60 frames per second on most parts, much higher on the
high-speed sensors when the framesize is small enough.
Capping the rate lets the application throttle the camera
to whatever the downstream processing can keep up with::

    csi0.framerate(15)

On sensors that support a hardware rate control the call
also lengthens the per-frame exposure budget, which can
help in low light; on the others the driver simply skips
the extra frames at the framebuffer level.

Test pattern
------------

The colour-bar test pattern is built into most sensors and
useful for separating an *imaging* problem from an *output*
problem. Turning it on bypasses the photodiode array and
sends a fixed pattern down the same pixel data path::

    csi0.colorbar(True)

If the test pattern looks right but the live image does
not, the fault is in the optics or the sensor's analog
front-end; if even the test pattern is corrupted, the
problem is somewhere on the pixel-data bus or in the
:meth:`~csi.CSI.pixformat` / :meth:`~csi.CSI.framesize`
configuration. Pass ``False`` to return to the live image.

See :class:`csi.CSI` for the full API, including the
sensor-specific :meth:`~csi.CSI.ioctl` commands that expose
controls unique to particular sensor families.
