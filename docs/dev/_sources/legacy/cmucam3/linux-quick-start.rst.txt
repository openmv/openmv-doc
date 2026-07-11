CMUcam3 Linux Quick Start Guide
===============================

This is for advanced users. For more detailed instructions see
:doc:`documentation`.

* Make sure you already have the following installed

  * Make
  * Subversion
  * Openssh

* Download from our :doc:`downloads` page:

  * Linux ARM-gcc compiler
  * Linux LPC-ISP Installer

* Not as root, install the files into a subdirectory of your home directory, and
  add to your local PATH

* Download cc3 source

  * Get a zip of the latest stable snapshot from our :doc:`downloads` page
  * **or** checkout a fresh copy from svn by typing:

    .. code-block:: text

       svn co https://cc3.svn.sourceforge.net/svnroot/cc3/trunk cc3

* Install gcc

  * ``bunzip2 arm-200xqx-xx-arm-none-eabi-i686-pc-linux-gnu.tar.bz2``
  * ``tar xvf arm-200xqx-xx-arm-none-eabi-i686-pc-linux-gnu.tar``
  * Add: ``/arm-200xqx/bin`` directory to your path

* Install LPC-ISP

  * ``unzip lpc21isp_unix.zip``
  * ``cd lpc21isp_unix``
  * ``make``
  * Add the directory with lpc21isp to your path

* Open up a new shell

  * Go to cc3
  * Type Make

* Startup in programming mode

  * Hold in push button while turning on power to startup in programming mode

* Load compiled hex file

  * ``cd`` to ``cc3/projects/cmucam2/``
  * Flash board with ``cmucam2_lpc2106-cmucam3.hex``
  * Assuming your COM port is ``/dev/ttyS0`` type:

    .. code-block:: text

       ./lpc21isp cmucam2_lpc2106-cmucam3.hex /dev/ttyS0 115200 14746

* Open up a terminal program

  * Power Cycle Board
  * A Green Power LED should turn on
  * If the code is running correctly, the red LED will turn off and the blue and
    yellow LEDs will dimly illuminate
  * Make sure it prints a startup message

* Open :doc:`minicom` or some other terminal program

  * Configure Minicom as described on our :doc:`minicom` page.
  * Restart the board and wait 5 seconds
  * You should see the following:

    .. code-block:: text

       CMUcam2 v1.00 c6
       :

  * Try typing "gv" followed by enter to see if two-way serial communication is
    working
