Vision Sensors
==============

Every page so far has treated the OpenMV Cam as a small
microcontroller that happens to have a camera attached.
Vision sensors swaps the framing: the camera *is* the
product, and everything else on the board exists to feed
pixels out of it into Python.

The :mod:`csi` module is the bridge. A single class
(:class:`~csi.CSI`) wraps the long chain of physics and
silicon between photons and a buffer. A lens focuses the
scene onto a grid of photodiodes that turn photons into
charge; an exposure / gain / read-out controller decides
how brightly each pixel is reported; an *image signal
processor* (ISP) corrects, debayers, colour-grades, and
packs the pixels into a chosen format; and an MCU
peripheral catches the resulting stream into RAM, ready
for :meth:`~csi.CSI.snapshot` to return as an
:class:`image.Image`.

.. toctree::
   :caption: Optics
   :maxdepth: 1

   optics/pinhole-camera.rst
   optics/lenses-and-focus.rst
   optics/field-of-view.rst
   optics/real-lens-effects.rst

.. toctree::
   :caption: Sensor
   :maxdepth: 1

   sensor/sensor-grid.rst
   sensor/shutter-types.rst
   sensor/exposure-and-gain.rst
   sensor/calibration.rst
   sensor/data-bus.rst

.. toctree::
   :caption: Colour and the ISP
   :maxdepth: 1

   color/color-sensors.rst
   color/debayering.rst
   color/isp-pipeline.rst

.. toctree::
   :caption: Image formats
   :maxdepth: 1

   formats/pixel-formats.rst

.. toctree::
   :caption: CSI
   :maxdepth: 1

   csi/csi-basics.rst
   csi/framebuffers.rst
   csi/ide-preview.rst
   csi/sensor-knobs.rst

.. toctree::
   :caption: Advanced
   :maxdepth: 1

   advanced/multi-sensor.rst
   advanced/memory-pools.rst

.. toctree::
   :caption: Wrap up
   :maxdepth: 1

   wrap-up.rst
