CMUcam4
=======

.. |c4a| image:: cmucam4-a.jpg
   :alt: CMUcam4
.. |c4b| image:: cmucam4-b.jpg
   :alt: CMUcam4 board

.. container:: legacy-center

   |c4a| |c4b|

The CMUcam4 is a fully programmable embedded computer vision
sensor. The main processor is the Parallax P8X32A (Propeller
chip), connected to an OmniVision 9665 CMOS camera sensor
module. For more information, see the :doc:`wiki <wiki>`.

Features
--------

* Fully open source and re-programmable using the Propeller Tool
* Arduino Shield Compatible

  * w/ Supporting Interface Libraries and Demo Applications for
    the Arduino and BASIC Stamp

* VGA resolution (640x480) RGB565/YUV655 color sensor

  * Image processing rate of 30 frames per second
  * Raw image dumps over serial or to flash card

    * (640:320:160:80)x(480:240:120:60) image resolution
    * RGB565/YUV655 color space

* Onboard Image Processing (QQVGA 160x120)

  * Track user defined color blobs in the RGB/YUV color space
  * Mean, median, mode and standard deviation data collection –
    sampled from a 40x120 resolution
  * Segmented (thresholded) image capture for tracking
    visualization (over serial or to flash card)

    * 80x60 image resolution
    * Monochrome color space

  * Histogram generation (up to 128 Bins) – sampled from a
    40x120 resolution
  * Arbitrary image clipping (windowing)

* µSD/µSDHC flash card slot with FAT16/32 full file system
  driver support

  * w/ Directory and File manipulation

* I/O Interfaces

  * Two-port servo controller (pan and tilt w/ 1us resolution at
    a 50 Hz refresh rate)

    * Pan and/or Tilt servo channels can be configured as GPIOs

  * Indicator user controllable LED (red) and power LED (green)
  * TTL UART (up to 250,000 baud – 19,200 baud by default)

* Monochrome baseband analog video output (NTSC/PAL) of 160x120
  resolution for tracking visualization (segmented (thresholded)
  image w/ color centroid and bounding box overlay at 30 FPS)
* CMUcam4 GUI for viewing images on the PC

Download the feature list in PDF form
:download:`here <dl/CMUcam4-Feature-List-102.pdf>`.

Acknowledgments
---------------

This project was supported through the generosity of
`Parallax <http://www.parallax.com/>`__,
`Lextronic <http://www.lextronic.fr>`__,
`SparkFun <http://www.sparkfun.com/>`__, and the
`Semiconductor Research Corporation <http://www.src.org/>`__. It
came from
`The Electrical and Computer Engineering Department <http://www.ece.cmu.edu/>`__
and the `Undergraduate Research Office <http://www.cmu.edu/uro/>`__
at Carnegie Mellon University.

.. toctree::
   :hidden:

   wiki
   quick-start
   command-list-user-manual
   cmucam4-graphical-user-interface
   lextronic-camera
   sparkfun-camera
   parallax-camera
   firmware-source-code-and-binaries
   how-to-use-the-cmucam4-properly
   color-tracking-explanation
   tips-and-tricks
   frequently-asked-questions
   troubleshooting
   gallery
   people
   legal-information
   multi-shot-cannon
   autonomous-vehicle-control
   low-power-motion-detection
   mobot
   ov9665-color-cmos-sxga-sensor
