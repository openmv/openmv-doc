Firmware Source Code and Binaries
=================================

Firmware Source
---------------

You can download the firmware source code here.

.. note::

   The ``!CMUcam4_Firmware_Code_102.zip`` firmware source code archive was not
   preserved in the archive.

Please refer to the
:download:`Programming Guide <dl/CMUcam4-Programming-Guide-102.pdf>` for more
information.

**NOTE:** The CMUcam4 is not programmed in C. It is programmed in a "C like"
language called "SPIN", *lo siento*. For more information please see the P8X32A
Propeller Chip Information section below.

Additionally, for more information about the *Full File System Driver*, included
with the source code, please click
`here <http://www.parallaxsemiconductor.com/an006/>`__.

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
`P8X32A <http://www.parallax.com/tabid/407/Default.aspx>`__ (Propeller Chip) from
`Parallax <http://www.parallax.com/>`__.

.. image:: img/PropellerChips.gif
   :alt: Propeller Chips
   :align: center

(Image provided by `Parallax <http://www.parallax.com/>`__)

For more information about the Propeller Chip please see the
`Propeller P8X32A Q&A <http://www.parallax.com/portals/0/help/P8X32A/QnaWeb/>`__.

Additionally, please see the following websites for useful Propeller Chip
downloads:

* `Propeller Downloads - Parallax <http://www.parallax.com/tabid/832/Default.aspx>`__.

  * You can find the Propeller Tool (Windows GUI IDE) or BST
    (Windows/Macintosh/Linux GUI IDE) here.

* `Propeller Object Exchange - Parallax <http://obex.parallax.com/>`__.

  * You can find free open source software here.

.. image:: img/PropellerBlock-L.jpg
   :alt: Propeller Block Diagram
   :align: center

(Image provided by `Parallax <http://www.parallax.com/>`__)

For future reference, here are the
:download:`P8X32A Manual <dl/Propeller-Manual-v1.2.pdf>`,
:download:`P8X32A Datasheet <dl/Propeller-P8X32A-Datasheet-v1.4.pdf>`, and
:download:`P8X32A Quick Reference <dl/Propeller-Quick-Reference-v1.7.pdf>`.

(Documents provided by `Parallax <http://www.parallax.com/>`__)

**NOTE:** The CMUCam4
`overclocks <http://propeller.wikispaces.com/Oscillator>`__ the Propeller Chip to
**96 Mhz** (over the default of **80 Mhz**) to achieve better performance
(**24 MIPS** per core x 8 = **192 MIPS** over **20 MIPS** per core x 8 =
**160 MIPS**).

.. image:: img/PropDieDiagram.jpg
   :alt: Propeller Die Diagram
   :align: center

(Image provided by `Parallax <http://www.parallax.com/>`__)

OV9665 Camera Module Information
--------------------------------

Due to `OmniVision <http://www.ovt.com/>`__ non-disclosure agreements we cannot
provide the `OV9665 <http://www.ovt.com/products/sensor.php?id=5>`__ data sheet
for download.

* If you would like to request the datasheet from OmniVision please click
  `here <http://www.ovt.com/support/datasheet.php>`__.
* If you would like to request technical support from OmniVision please click
  `here <http://www.ovt.com/support/tech.php>`__.

However, we have extracted all useful information from the OV9665 data sheet and
placed it :doc:`here <ov9665-color-cmos-sxga-sensor>`.
