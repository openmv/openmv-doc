:mod:`display` --- display driver
=================================

.. module:: display
   :synopsis: display driver

The :mod:`display` module exposes drivers for external displays that
can be attached to an OpenMV Cam. Four interfaces are supported:

- SPI-attached TFTs (the smaller 16-bit displays such as the SSD1351),
  via :class:`SPIDisplay`.
- 24-bit parallel RGB panels driven by the LTDC/LCD-TFT controller,
  via :class:`RGBDisplay`. The same parallel bus also feeds external
  HDMI / DisplayPort converters (e.g. a TFP410), so HDMI and
  DisplayPort outputs are configured through :class:`RGBDisplay` too.
- MIPI-DSI panels, via :class:`DSIDisplay`.
- NTSC analog video on the OpenMV TV shield, via :class:`TVDisplay`.

Panel-specific initialisation lives in dedicated controller classes
(:class:`SSD1351` for SPI panels, :class:`ST7701` for DSI panels) that
are passed to the display constructor through the ``controller``
argument. Backlight brightness is driven by :class:`DACBacklight` or
:class:`PWMBacklight`, hooked in via the ``backlight`` argument.

The constants below select the output frame size and are accepted as
the ``framesize`` argument by every display class. Once constructed a
display object accepts :class:`image.Image` buffers via its
``write()`` method to present a frame.

Classes
-------

.. toctree::
   :maxdepth: 1

   omv.tv.rst
   omv.display.spidisplay.rst
   omv.display.rgbdisplay.rst
   omv.display.dsidisplay.rst
   omv.display.displaydata.rst
   omv.display.ST7701.rst
   omv.display.SSD1351.rst
   omv.display.DACBacklight.rst
   omv.display.PWMBacklight.rst

Constants
---------

.. data:: QVGA
   :type: int

   320x240 resolution for framesize.

.. data:: TQVGA
   :type: int

   240x320 resolution for framesize.

.. data:: FHVGA
   :type: int

   480x272 resolution for framesize.

.. data:: FHVGA2
   :type: int

   480x128 resolution for framesize.

.. data:: VGA
   :type: int

   640x480 resolution for framesize.

.. data:: THVGA
   :type: int

   320x480 resolution for framesize.

.. data:: FWVGA
   :type: int

   800x480 resolution for framesize.

.. data:: FWVGA2
   :type: int

   800x320 resolution for framesize.

.. data:: TFWVGA
   :type: int

   480x800 resolution for framesize.

.. data:: TFWVGA2
   :type: int

   480x480 resolution for framesize.

.. data:: SVGA
   :type: int

   800x600 resolution for framesize.

.. data:: WSVGA
   :type: int

   1024x600 resolution for framesize.

.. data:: XGA
   :type: int

   1024x768 resolution for framesize.

.. data:: SXGA
   :type: int

   1280x1024 resolution for framesize.

.. data:: SXGA2
   :type: int

   1280x400 resolution for framesize.

.. data:: UXGA
   :type: int

   1600x1200 resolution for framesize.

.. data:: HD
   :type: int

   1280x720 resolution for framesize.

.. data:: FHD
   :type: int

   1920x1080 resolution for framesize.

   .. note::

      Use a ``refresh`` of 30 Hz with this setting. The STM32H7 is not capable of
      driving 1080p at 60 Hz.

.. data:: IOCTL_CHANNEL
   :type: int

   ``ioctl`` selector for setting the TV display channel (TVDisplay only).
