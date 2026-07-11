Software
========

The cc3 project provides software for embedded vision systems. Currently, the
software runs on the CMUcam3 hardware platform, which is a NXP LPC2106-based
board with an onboard CMOS camera and FIFO, MMC interface, serial UARTs, and
servo controller. For information on how to install the CC3 development
environment please refer to the CMUcam SDK Setup Guide located in the
:doc:`Documentation <documentation>` section. For advanced users refer to the
online :doc:`Quick-Start-Guide <quick-start>`.

You can find a ZIP file containing a stable snapshot of the cc3 code on the
:doc:`Downloads <downloads>` page.

Alternatively, you can find the cc3 source code on sourceforge:
`CC3 Project <http://sourceforge.net/projects/cc3>`__.

To check the latest experimental source out of subversion type:

.. code-block:: none

   svn co https://cc3.svn.sourceforge.net/svnroot/cc3/trunk cc3

Local Mirror (Go here for most downloads)
-----------------------------------------

Local copies of software can be found on our :doc:`Downloads <downloads>` page.

Compiler
--------

`Arm GNU Toolchain <https://developer.arm.com/downloads/-/arm-gnu-toolchain-downloads>`__.
Get the "EABI" or "Bare Metal" target for your particular platform.

Firmware Downloader
-------------------

* For Windows: `Flash Magic <https://www.flashmagictool.com>`__
* For Linux: `LPC21ISP <https://github.com/capiman/lpc21isp>`__

Utilities
---------

* `Cygwin Installer <http://www.cygwin.com/setup.exe>`__ -- Windows development
  will require the Cygwin development environment. Make sure to install Make and
  Subversion as part of the installation process.
* CMUcam3 Frame Grabber -- A Windows jpeg frame grabber and terminal client for
  the CMUcam2 firmware running on the CMUcam3. This will only work with the
  CMUcam3. You may need to install the .NET runtime on your machine if it does
  not already exist. For more information see our
  :doc:`CMUcam3-Frame-Grabber <cmucam3-frame-grabber>` page.
* `.NET Framework <https://dotnet.microsoft.com/en-us/download/dotnet-framework>`__
  -- This is a link to the .NET runtime package. You will need to install this
  before using the CMUcam3 Frame Grabber.

CC3 Sample Projects
-------------------

Below are descriptions of sample projects that come with the CC3 source code.
Check out some code :doc:`snippets <snippets>` for various cc3 operations. Make
sure to check the :doc:`Software-Problems <software-problems>` page for any bug
fixes since the release version of the code.

* :doc:`hello-world <hello-world>` -- A simple application to access the camera,
  MMC and serial ports
* :doc:`cmucam2 <cmucam2-emulation>` -- CMUcam2 firmware emulation
* :doc:`security-cam <security-cam>` -- A security camera application that waits
  for motion changes and write images to the MMC
* :doc:`simple-track-color <simple-track-color>` -- A very simple track color
  that uses the cc3-ilp
* :doc:`simple-histogram <simple-histogram>` -- Example that uses the cc3-ilp
  histogram function
* :doc:`simple-get-mean <simple-get-mean>` -- A very simple sample of getting
  min, mean and max colors that uses the cc3-ilp
* histogram-match -- A simple program that grabs image templates and then does
  histogram matching against them.
* jpeg-cam -- A digital camera that waits for a button press and then writes
  jpeg files to MMC
* :doc:`ppm-grab <ppm-grab>` -- A program that waits for a button press and then
  streams PPM files to MMC for the :doc:`virtual-cam <virtual-cam>`.
* hsv-ppm-grab -- Same as ppm-grab only in the hsv color space.
* png-grab -- Same as ppm-grab except with png files.
* led-test -- Yes, you can blink the LEDs
* :doc:`spoonBot-demo <spoonbot-demo>` -- Sample of using servos to control a
  small robot. Go here to learn more about :doc:`spoonBot <spoonbot>`.
* edge-follow -- Example of using texture and color to find an edge and then
  compute the distance and slope of that edge. This can be used for wall or
  carpet following robots.
* lua -- A sample of running a LUA on the CMUcam3
* :doc:`viola-jones <viola-jones>` -- A preliminary implementation of the
  Viola-Jones face detector running on CMUcam3
* benchmark -- Times how long it takes to grab a frame.
* :doc:`polly <polly>` -- Implements a modified version of Ian Horswill's Polly
  algorithm for robot navigation.
* :doc:`polly-cc2-gui <polly>` -- Version of polly code that overloads the
  CMUcam2 get histogram command to display its output in the CMUcam2 GUI.
