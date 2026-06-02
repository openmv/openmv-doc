OpenMV AE3: dfu-util
====================

The OpenMV AE3 uses the ``openmv_dfu`` bootloader (application VID:PID
``37C5:16E3``, DFU VID:PID ``37C5:96E3``), but it is a **dual-core**
device: an Alif Ensemble with a high-performance (HP) and a
high-efficiency (HE) Cortex-M55 core. Each core runs its own firmware
image and has its own read-only ROMFS, so a full flash is four images,
plus a fifth DFU alt that erases the shared internal FAT filesystem.
The complete DFU alt-setting map:

.. list-table::
   :header-rows: 1
   :widths: 8 22 12 26 16 16

   * - Alt
     - Purpose
     - Core
     - Image file
     - Size (hex)
     - Size (bytes)
   * - ``-a 1``
     - Firmware
     - M55-HP
     - ``firmware_M55_HP.bin``
     - ``0x300000``
     - 3,145,728
   * - ``-a 2``
     - Firmware
     - M55-HE
     - ``firmware_M55_HE.bin``
     - ``0x15E000``
     - 1,433,600
   * - ``-a 3``
     - ROMFS
     - M55-HE
     - ``romfs1.img``
     - ``0x100000``
     - 1,048,576
   * - ``-a 5``
     - Erase internal FAT filesystem
     - shared
     - *(4 KB of zeros)*
     - --
     - --
   * - ``-a 6``
     - ROMFS
     - M55-HP
     - ``romfs0.img``
     - ``0x1800000``
     - 25,165,824

A full flash writes the four images, with ``--reset`` only on the
final transfer::

    dfu-util -w -d ,37C5:96E3 -a 1 -D firmware_M55_HP.bin
    dfu-util -w -d ,37C5:96E3 -a 2 -D firmware_M55_HE.bin
    dfu-util -w -d ,37C5:96E3 -a 3 -D romfs1.img
    dfu-util -w -d ,37C5:96E3 -a 6 --reset -D romfs0.img

To replace just one core's firmware, flash only that core's alt
(``-a 1`` for HP, ``-a 2`` for HE); to replace one core's ROMFS, flash
that core's ROMFS alt (``-a 6`` for HP / ``romfs0``, ``-a 3`` for HE /
``romfs1``). The writable internal FAT filesystem is shared by both
cores and is wiped once via ``-a 5`` (see :doc:`erasing`). The AE3's
bootloader is restored by a different procedure -- see
:doc:`../recovery`.
