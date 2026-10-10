Erasing the internal filesystem
===============================

Every camera has a small writable FAT filesystem (where ``main.py``
and user files live, separate from any SD card). Erasing it is the fix
when a bad ``main.py`` or a corrupted filesystem prevents the camera
from booting. In OpenMV IDE this is the **Erase internal file system**
checkbox in *Load Custom Firmware*; the command-line equivalent
differs by camera family.

OpenMV cameras with the ``openmv_dfu`` bootloader
-------------------------------------------------

The bootloader exposes a dedicated **erase DFU alt**. Write a small
zero-filled file to it (a 4 KB block of zeros is plenty -- it clears
the filesystem header so the camera reformats on the next boot) with
``--reset``::

    dd if=/dev/zero of=erase.bin bs=4096 count=1
    dfu-util -w -d ,<DFU VID:PID> -a <erase alt> --reset -D erase.bin

.. list-table::
   :header-rows: 1
   :widths: 36 24 20

   * - Camera (``TARGET``)
     - DFU VID:PID
     - Erase alt
   * - OpenMV Cam M4 (``OPENMV2``)
     - ``37C5:9202``
     - ``-a 1``
   * - OpenMV Cam M7 (``OPENMV3``)
     - ``37C5:9203``
     - ``-a 1``
   * - OpenMV Cam H7 (``OPENMV4``)
     - ``37C5:9204``
     - ``-a 1``
   * - OpenMV Cam H7 Plus (``OPENMV4P``)
     - ``37C5:924A``
     - ``-a 3``
   * - OpenMV Pure Thermal (``OPENMVPT``)
     - ``37C5:9205``
     - ``-a 3``
   * - OpenMV Cam N6 (``OPENMV_N6``)
     - ``37C5:9206``
     - ``-a 2``
   * - OpenMV AE3 (``OPENMV_AE3``)
     - ``37C5:96E3``
     - ``-a 5``

The **OpenMV AE3** has a single writable FAT filesystem shared by
both Cortex-M55 cores, erased once via ``-a 5``. There is no
separate per-core filesystem erase.

OpenMV Cam RT1062
-----------------

The RT1062 has no DFU bootloader; erase its FAT disk's master boot
record (at ``0x60400000``) with the SPSDK flashloader, which forces a
reformat on the next boot::

    blhost -u 0x15A2,0x0073 -t 120000 -- flash-erase-region 0x60400000 0x1000

STM32 Arduino boards
--------------------

The Portenta H7, Giga, and Nicla Vision erase by absolute address
rather than an alt::

    dd if=/dev/zero of=erase.bin bs=4096 count=1
    dfu-util -w -d ,<DFU VID:PID> -a 0 -s 0x08020000 -D erase.bin
    dfu-util -w -d ,<DFU VID:PID> -a 1 -s 0x90000000 --reset -D erase.bin
