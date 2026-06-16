OpenMV AE3: dfu-util
====================

The OpenMV AE3 uses the ``openmv_dfu`` bootloader (application VID:PID
``37C5:16E3``, DFU VID:PID ``37C5:96E3``), but it is a **dual-core**
device: an Alif Ensemble with a high-performance (HP) and a
high-efficiency (HE) Cortex-M55 core. To enter the bootloader, just
plug the camera in: it listens briefly at power-up, and ``-w`` makes
``dfu-util`` wait for it to appear. Each core runs its own firmware
image and has its own read-only ROMFS, so a full flash is four images:

.. list-table::
   :header-rows: 1
   :widths: 20 40 40

   * - Core
     - Firmware command
     - ROMFS command
   * - M55-HP
     - ``-a 1 -D firmware_M55_HP.bin``
     - ``-a 6 -D romfs0.img``
   * - M55-HE
     - ``-a 2 -D firmware_M55_HE.bin``
     - ``-a 3 -D romfs1.img``

A full flash writes the four images, with ``--reset`` only on the
final transfer::

    dfu-util -w -d ,37C5:96E3 -a 1 -D firmware_M55_HP.bin
    dfu-util -w -d ,37C5:96E3 -a 2 -D firmware_M55_HE.bin
    dfu-util -w -d ,37C5:96E3 -a 3 -D romfs1.img
    dfu-util -w -d ,37C5:96E3 -a 6 --reset -D romfs0.img

To replace just one core's firmware, flash only that core's alt
(``-a 1`` for HP, ``-a 2`` for HE); to replace one core's ROMFS, flash
that core's ROMFS alt (``-a 6`` for HP / ``romfs0``, ``-a 3`` for HE /
``romfs1``).

Initializing the Everspin MRAM
------------------------------

Special builds of the OpenMV AE3 replace the standard external flash
-- which holds the internal FAT filesystem and the HP core's ROMFS --
with an Everspin MRAM chip. This section applies to those builds
only. An Everspin part that has never been initialized, or whose
configuration registers have been corrupted, does not respond to
writes, so DFU transfers to those alts fail until the chip is
re-initialized.

The bootloader exposes this as one more DFU alt: downloading a key
file to ``-a 7`` triggers the initialization sequence (a JESD reset,
configuration-register initialization, lock removal, and two full
chip-erase passes). The download itself stores nothing -- the
partition checks that the file starts with the expected 16-byte key
and runs the sequence, at most once per bootloader session.

Generate the key file with ``tools/flash_recovery_key.py`` from the
firmware repository (it writes a 4 KB ``key.bin``), then download
it::

    python tools/flash_recovery_key.py
    dfu-util -w -d ,37C5:96E3 -a 7 -D key.bin

The chip is blank afterwards: re-flash the HP core's ROMFS (``-a 6
-D romfs0.img``), and the internal FAT filesystem reformats itself on
the next boot.

.. seealso::

   To wipe the camera's internal FAT filesystem -- the fix when a bad
   ``main.py`` or a corrupted filesystem stops the camera from booting
   -- see :doc:`erasing`.

   To restore the camera's bootloader itself, see :doc:`../recovery`.
