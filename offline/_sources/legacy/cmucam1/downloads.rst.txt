Downloads
=========

User's Manual
-------------

The :download:`CMUcam1 User's Manual <dl/CMUcamManual.pdf>` v2.00 for firmware
v1.12 is available in PDF form. It contains a parts list, board schematic and
software protocol description. Manuals for older versions of the firmware can be
found here: :download:`v1.11 <dl/CMUcamManual_1_8.pdf>`,
:download:`v1.1 <dl/CMUcamManual_1_4.pdf>`,
:download:`v1.0 <dl/CMUcamManual_1_11.pdf>`.

If you decide to experiment with changing the camera register settings you might
also be interested in downloading the
:download:`OV6620 Camera Manual <dl/ov6620DSLF.pdf>` from
`OmniVision <http://www.ovt.com>`__.

Building the Board
------------------

If you are building it yourself from scratch you will need to download this
:download:`HEX code file <dl/CMUcam1_12.zip>` (containing the latest firmware
v1.12) to program the SX28 chip. This is the code which implements the
functionality and the serial protocol described in the manual. You can obtain
the `SX-Key <https://www.parallax.com/package/sx-key-usb-downloads/>`__ downloader and
application from `Parallax Inc. <http://www.parallax.com>`__ Older
:download:`versions <dl/code-history.txt>` of the firmware can be found here:
:download:`v1.11 <dl/CMUcam1_11.zip>`, :download:`v1.1 <dl/CMUcam1_1.zip>`,
:download:`v1.0 <dl/CMUcam1_0.zip>`.

Java Interface Program
----------------------

We have an open source java program that you can download to interface with and
test your CMUcam1. This interface program allows you to track objects, analyze
data and grab complete CMUcam1 images. Here are :doc:`screenshots` of this
interface.

:download:`This is the zipped java project <dl/CMUcamGUI.tar.tar>` written for
Linux.

:download:`This is the version of the GUI <dl/camGUI_1_1b.zip>` that
auto-detects your OS. It runs under UNIX systems that support serial IO as if it
were a file (such as Linux), as well as Windows 95/98/2000/NT/XP. We recommend
using at least a Pentium 2 400 MHz processor running Java 1.2.2 or higher.

To see examples of C code for the Cerebellum microprocessor and the BotBall
Handyboard communicating with the CMUcam1, go to
`this web page <http://www.cs.cmu.edu/~illah/ROBOCODE/index.html>`__.

Schematic
---------

Here is a high resolution JPEG of the current
:download:`CMUcam1 Schematic <img/CMUcam_schematic.jpg>` (board version 1.23).


Before asking about the source code you might be interested in downloading the
:download:`SX28 Processor Manual <dl/SX-DDS-SX2028AC-16.pdf>` from
`Ubicom <http://www.ubicom.com>`__.
