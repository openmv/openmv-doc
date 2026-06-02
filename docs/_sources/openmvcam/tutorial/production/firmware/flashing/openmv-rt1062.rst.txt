OpenMV Cam RT1062: NXP SPSDK
============================

The OpenMV Cam RT1062 is the only camera **without** a USB DFU
bootloader. It boots from external flash through an on-flash secure
bootloader (SBL) that presents the NXP MCU-bootloader USB interface.
Flashing uses the NXP **SPSDK** tools ``blhost`` and ``sdphost``, which
the OpenMV SDK and OpenMV IDE bundle and invoke as ``python -m
spsdk.apps.blhost`` / ``python -m spsdk.apps.sdphost``. Because the
commands and addresses are intricate, *Load Custom Firmware* in OpenMV
IDE is the preferred method for the RT1062; the sequence below is for
automation or for understanding what the IDE does.

For a normal firmware update the SBL is already present, so no jumper
is needed -- a reset leaves the camera enumerated as the SBL device
(``blhost`` VID:PID ``0x15A2:0x0073``). The firmware-only sequence
is::

    blhost -u 0x15A2,0x0073 -t 120000 -- flash-erase-region 0x60040000 <firmware_size>
    blhost -u 0x15A2,0x0073 -- write-memory 0x60040000 firmware.bin
    blhost -u 0x15A2,0x0073 -- reset

``<firmware_size>`` is the byte size of ``firmware.bin``. To also
reset the ROMFS, run these before the firmware steps::

    blhost -u 0x15A2,0x0073 -t 120000 -- flash-erase-region 0x60800000 0x00800000
    blhost -u 0x15A2,0x0073 -- write-memory 0x60800000 romfs0.img

The RT1062 16 MiB external-flash map (``0x60000000``--``0x61000000``,
from OpenMV IDE's configuration):

.. list-table::
   :header-rows: 1
   :widths: 30 18 16 36

   * - Region
     - Address
     - Size (hex)
     - Size (bytes)
   * - Flash configuration block (FCB)
     - ``0x60000000``
     - ``0x1000``
     - 4,096 (4 KiB)
   * - Secure bootloader (SBL)
     - ``0x60001000``
     - ``0x3F000``
     - 258,048 (252 KiB)
   * - Firmware
     - ``0x60040000``
     - ``0x3C0000``
     - 3,932,160 (3.75 MiB)
   * - FAT disk (internal filesystem)
     - ``0x60400000``
     - ``0x400000``
     - 4,194,304 (4 MiB)
   * - ROMFS
     - ``0x60800000``
     - ``0x800000``
     - 8,388,608 (8 MiB)

The FCB, FAT disk, and ROMFS sizes are fixed in the IDE configuration.
The SBL and firmware sizes shown are the region span to the next
region's base address (the start addresses are fixed; the actual
image is smaller).

Recreating the SBL itself (a damaged RT1062) is a longer, jumper-based
procedure -- see :doc:`../recovery`.
