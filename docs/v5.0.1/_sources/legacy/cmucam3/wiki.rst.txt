Wiki
====

.. |wc1| image:: img/components_thumb.jpg
   :alt: Components
.. |wc2| image:: img/sample_thumb.jpg
   :alt: Sample image
.. |wc3| image:: img/face_thumb.jpg
   :alt: Face detection
.. |wc4| image:: img/spoonBot_thumb.jpg
   :alt: SpoonBot

.. container:: legacy-center legacy-even

   |wc1| |wc2| |wc3| |wc4|

Overview
--------

The goal of the CMUcam project is to provide simple vision capabilities to small
embedded systems in the form of an intelligent sensor. The CMUcam3 extends upon
this idea by providing a flexible and easy to use open source development
environment that complements a low cost hardware platform. The CMUcam3 is an
ARM7TDMI based fully programmable embedded computer vision sensor. The main
processor is the
`NXP LPC2106 <https://www.nxp.com/docs/en/data-sheet/LPC2104_2105_2106.pdf>`__
connected
to an Omnivision CMOS camera sensor module. Custom C code can be developed for
the CMUcam3 using a port of the GNU toolchain along with a set of open source
libraries and example programs. Executables can be built and flashed onto the
board using the serial port with no external downloading hardware required.

Features
--------

* Fully open source and programmable using `GCC <http://gcc.gnu.org/>`__
* `CIF <http://en.wikipedia.org/wiki/Common_Intermediate_Format>`__ resolution
  (352x288) RGB color sensor
* Open source development environment for Windows and Linux
* :doc:`MMC/SD <mmc>` flash slot with FAT16 driver support
* Four-port servo controller
* Image processing rate of 26 frames per second
* `Lua <http://www.lua.org/>`__ light-weight language interpreter for rapid
  prototyping
* Software JPEG compression
* Basic image manipulation library

  * Arbitrary image clipping
  * Image downsampling
  * Threshold and convolution functions
  * RGB, YCrCb and HSV color space
  * :doc:`CMUcam2 <cmucam2>` emulation

    * User defined color blobs
    * Frame differencing
    * Mean and variance data collection
    * Raw images dumps over serial
    * Histogram generation

* B/W :doc:`analog video output <analog-out>` (PAL or NTSC)
* FIFO image buffer for multiple pass hi-res image processing
* Wireless Mote networking interface
  `802.15.4 <http://www.ieee802.org/15/pub/TG4.html>`__

  * :doc:`telos_tmote <telos-tmote>` Tmote Sky / Telos Connection

* :doc:`Virtual-cam <virtual-cam>` for prototyping on the PC
* :doc:`CMUcam3-Frame-Grabber <cmucam3-frame-grabber>` for viewing images on the
  PC

Quick Links
-----------

* :doc:`Quick-Start <quick-start>`
* :doc:`Hardware <hardware>`
* :doc:`Software <software>`
* :doc:`Downloads <downloads>`
* :doc:`Documentation <documentation>`
* :doc:`FAQ <faq>`
* :doc:`Gallery <gallery>`
* :doc:`Projects <projects>`
* :doc:`Publications <publications>`
* :doc:`Troubleshooting <troubleshooting>`
* :doc:`About Us <people>`
* Please make sure to check for the latest documentation to avoid
  :doc:`Hardware Problems <hardware-problems>` damaging hardware.

Applications
------------

* Robotics (:doc:`SpoonBot <spoonbot>`)
* Surveillance
* Sensor Networks
* Education
* Interactive toys
* Object recognition and tracking
* Programmable servo control
* Serial :doc:`MMC/SD <mmc>` flash data logging

Where can I buy a CMUcam3?
--------------------------

* `Lextronic (France) <http://lextronic.fr/>`__

.. toctree::
   :hidden:

   quick-start
   windows-quick-start
   linux-quick-start
   hello-world
   hardware
   hardware-power
   hardware-serial
   camera-bus
   hardware-servo
   hardware-gpio-port
   hardware-leds
   hardware-isp
   hardware-lens
   hardware-problems
   analog-out
   mmc
   minicom
   software
   software-problems
   newtools
   new-grabbing-tool
   camscripter
   camscriptergettingstarted
   luaapi
   luaapiconstants
   luaapifunctions
   luaapistructimage
   luaapistructpixel
   luaapistructtracker
   luaapistructframediff
   luasamples
   simple-get-mean
   simple-histogram
   simple-track-color
   multi-track
   ppm-grab
   snippets
   viola-jones
   cmucam2
   cmucam2-emulation
   cmucam3-frame-grabber
   virtual-cam
   projects
   spoonbot
   spoonbot-demo
   polly
   cpn
   security-cam
   telos-tmote
   wsn
   documentation
   downloads
   faq
   troubleshooting
   publications
   people
   gallery
   links
   contributing
