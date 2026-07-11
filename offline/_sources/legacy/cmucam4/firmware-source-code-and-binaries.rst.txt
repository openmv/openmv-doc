Firmware Source Code and Binaries
=================================

Firmware Source
---------------

You can download the firmware source code
:download:`here <dl/!CMUcam4_Firmware_Code_102.zip>`.

Please refer to the
:download:`Programming Guide <dl/CMUcam4-Programming-Guide-102.pdf>` for more
information.

**NOTE:** The CMUcam4 is not programmed in C. It is programmed in a "C like"
language called "SPIN", *lo siento*. For more information please see the
`P8X32A Propeller Chip Information`_ section below.

Additionally, for more information about the *Full File System Driver*, included
with the source code, please click
`here <https://obex.parallax.com/obex/fat16-fat32-file-system-driver-an006/>`__.

Firmware Binaries
-----------------

You can download the compiled firmware source code binaries
:download:`here <dl/!CMUcam4_Firmware_Binaries_102.zip>`.

Please refer to the
:download:`Programming Guide <dl/CMUcam4-Programming-Guide-102.pdf>` for more
information.

P8X32A Propeller Chip Information
---------------------------------

The CMUcam4 is powered by the
`P8X32A <https://www.parallax.com/propeller-1/>`__ (Propeller Chip) from
`Parallax <https://www.parallax.com/>`__.

.. image:: img/PropellerChips.gif
   :alt: Propeller Chips
   :align: center

(Image provided by `Parallax <https://www.parallax.com/>`__)

For more information about the Propeller Chip please see the
`Propeller P8X32A Q&A <https://www.parallax.com/propeller/qna/Content/QnaTopics/QnaP8X32AIntro.htm>`__.

Additionally, please see the following websites for useful Propeller Chip
downloads:

* `Propeller Downloads - Parallax <https://www.parallax.com/download/propeller-1-software/>`__.

  * You can find the Propeller Tool (Windows GUI IDE) or BST
    (Windows/Macintosh/Linux GUI IDE) here.

* `Propeller Object Exchange - Parallax <https://obex.parallax.com/>`__.

  * You can find free open source software here.

.. image:: img/PropellerBlock-L.jpg
   :target: ../../_images/PropellerBlock-L_P8X32A.jpg
   :alt: Propeller Block Diagram
   :align: center

.. image:: img/PropellerBlock-L_P8X32A.jpg
   :class: legacy-collect-only
   :alt: Propeller Block Diagram (full size)

(Image provided by `Parallax <https://www.parallax.com/>`__)

For future reference, here are the
:download:`P8X32A Manual <dl/Propeller-Manual-v1.2.pdf>`,
:download:`P8X32A Datasheet <dl/Propeller-P8X32A-Datasheet-v1.4.pdf>`, and
:download:`P8X32A Quick Reference <dl/Propeller-Quick-Reference-v1.7.pdf>`.

(Documents provided by `Parallax <https://www.parallax.com/>`__)

**NOTE:** The CMUcam4 overclocks the Propeller Chip to **96 Mhz** (over the
default of **80 Mhz**) to achieve better performance (**24 MIPS** per core x 8 =
**192 MIPS** over **20 MIPS** per core x 8 = **160 MIPS**).

.. image:: img/PropDieDiagram.jpg
   :target: ../../_images/PropDieDiagram_P8X32A.jpg
   :alt: Propeller Die Diagram
   :align: center

.. image:: img/PropDieDiagram_P8X32A.jpg
   :class: legacy-collect-only
   :alt: Propeller Die Diagram (full size)

(Image provided by `Parallax <https://www.parallax.com/>`__)

OV9665 Camera Module Information
--------------------------------

Due to `OmniVision <https://www.ovt.com/>`__ non-disclosure agreements we cannot
provide the OV9665 data sheet for download.

However, we have extracted all useful information from the OV9665 data sheet and
placed it :doc:`here <ov9665-color-cmos-sxga-sensor>`.
