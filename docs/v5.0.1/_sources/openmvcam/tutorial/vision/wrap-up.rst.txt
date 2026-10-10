Wrap up
=======

You have walked through the parts of the camera's imaging
stack that come up every time a script captures a frame:

* **The optics in front of the sensor** -- a pinhole as the
  simplest image-forming element, then lenses, which gather
  far more light while still focusing, with focal length,
  aperture, depth of field, and field of view as the knobs
  the application picks from. Real lenses come with
  distortion, vignetting, and chief-ray-angle effects that
  the sensor and ISP later compensate for.

* **The sensor grid** -- a two-dimensional array of
  photodiodes that turns photons into charge, with exposure
  time and analog gain trading brightness against motion blur
  and noise. Rolling and global shutters pick how rows of the
  array are read out, and a small set of on-chip calibrations
  -- column FPN, black level, defect pixel, lens shading --
  clean the data before it leaves the chip. Two buses connect
  the chip to the MCU: a slow I2C control bus for registers
  and a fast parallel or MIPI bus for pixels.

* **Colour and the ISP** -- a Bayer colour filter array gives
  each pixel one of red, green, or blue; debayering
  interpolates the missing two channels. The image signal
  processor stitches the rest of the pipeline together --
  statistics extraction, auto-white-balance, debayering,
  colour-matrix correction, gamma, scaling, cropping, and a
  final pack into the requested pixel format.

* **Pixel formats** -- raw Bayer, RGB888, RGB565, YUV422,
  grayscale, BINARY, and the compressed JPEG / PNG outputs
  trade memory size against colour fidelity and downstream
  algorithm compatibility. RGB565 is the default for finished
  colour because it lines up with the MCU's word width and
  halves the memory cost relative to RGB888.

* **The CSI API** -- five lines of setup plus a snapshot loop
  is the shape every script starts from. Framebuffer pools
  (single, double, triple, video FIFO, or triggered) decide
  how the application and the camera share frames; a separate
  preview channel feeds whatever debug program is attached
  without competing for the application's buffers; sensor
  knobs cover orientation, exposure, gain, white balance,
  frame-rate cap, and a colour-bar test pattern.

* **Multiple sensors and memory pools** -- boards with two
  sensors instantiate one :class:`~csi.CSI` per chip and run
  each at its own rate. Underneath, the framebuffer pool, the
  preview region, the MicroPython heap, and the smaller
  fast-memory allocations live in distinct regions of RAM,
  placed so the parts that need speed get it and the parts
  that just need size get that instead.

That is enough to take a frame out of the sensor with the
right format, framesize, and exposure for the scene; pick a
framebuffer mode that matches the application's processing
time; expose a live preview to whatever is attached; and read
the :class:`~image.Image` back into Python ready to be
operated on.

Using this reference later
--------------------------

Treat the imaging chapters as reference material, not a
one-pass read. Coming back to refresh on framebuffer modes,
pixel formats, or the meaning of a given sensor knob is the
intended use. The :class:`csi.CSI` reference page lists every
method in one place when the question is just "what is the
exact name of this call again".

Where to go from here
---------------------

**Image processing** is the natural next topic. With the
buffer in hand and the :mod:`csi` API understood, what is
left is what to *do* with the pixels: thresholds, edge
detection, blob finding, line and shape detection, QR codes,
AprilTags, machine-learning inference. The toolkit shifts to
the :mod:`image` module and its catalogue of methods on the
:class:`~image.Image` object. Everything from this section
carries forward; the loop shape, the framebuffer mode, the
pixel format -- all of it is what the image-processing
methods operate on.
