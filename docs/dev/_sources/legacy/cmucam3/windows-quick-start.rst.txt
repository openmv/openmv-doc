CMUcam3 Windows Quick Start Guide
=================================

This is for advanced users. For more detailed instructions see
:doc:`documentation`. You can grab a bundled version of all of this software
from the :doc:`downloads` page.

* Download and install cygwin

  * `http://www.cygwin.com <http://www.cygwin.com>`__
  * Make sure to install "Make", "CVS", "openssh"

* Go to `CodeSourcery ARM compiler download site <http://www.codesourcery.com/gnu_toolchains/arm/download.html>`__

  * Get the "EABI" or "Bare Metal" target for Windows
  * Install

* Go to `http://www.lpc2100.com <http://www.lpc2100.com>`__

  * Download and Install LPC ISP
  * `http://www.semiconductors.philips.com/files/products/standard/microcontrollers/utilities/lpc2000_flash_utility.zip <http://www.semiconductors.philips.com/files/products/standard/microcontrollers/utilities/lpc2000_flash_utility.zip>`__

* Download cc3 source

  * Get a zip of the latest stable snapshot from our :doc:`downloads` page
  * **or** checkout a fresh copy from svn by typing:

    .. code-block:: text

       svn co https://cc3.svn.sourceforge.net/svnroot/cc3/trunk cc3

* Open up Cygwin Shell

  * Go to cc3

    * ``cd c:`` to get to c drive, then cd into the ``cc3`` directory
    * typing ``ls`` will list all of the files

  * Type ``make``

    * typing ``make clean`` will remove all compiled files.
    * make needs to be run in the root directory before you can compile individual projects

* Startup in programming mode

  * Hold in push button while turning on power to startup in programming mode

* Open LPC ISP and load compiled hex file

  * Browse to ``cc3/projects/cmucam2/cmucam2_lpc2106-cmucam3.hex``
  * Flash board
  * Close ISP program

* Open up a terminal program

  * Power Cycle Board
  * A Green Power LED should turn on
  * If the code is running correctly, the red LED will turn off and the blue and yellow LEDs will dimly illuminate
  * Make sure it prints a startup message

* Use a Graphical User Interface to View Images and Focus Camera

  * Option 1: CMUcam3 Frame Grab Utility

    * Download the CMUcam3 Frame Grab Utility and install .NET (both on the :doc:`downloads` page)
    * Double Click on "CMUcam3 Frame Grabber.exe"
    * Select Correct COM port and Press "Connect"
    * Click "Send" button to check for an "ACK" message to see if the port is connected
    * Click "Grab Frame" to grab a sample image

  * Option 2: CMUcam2 GUI

    * See the CMUcam2 GUI documentation
    * Check if GUI detects camera and can send frame
    * GUI does not set serial port correctly, so a terminal program must be run in between downloading from the ISP and use of the CMUcam2 GUI
