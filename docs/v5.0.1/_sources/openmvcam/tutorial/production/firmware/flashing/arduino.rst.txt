Arduino boards
==============

The STM32-based Arduino boards (Portenta H7, Giga, Nicla Vision) are
flashed with ``dfu-util`` using **absolute flash addresses** through
the Arduino DFU bootloader. The two Nano boards use their own tools.

STM32 Arduino boards: dfu-util
------------------------------

To enter the bootloader, double-tap the reset button (or open the
board's serial port at 1200 baud -- the Arduino "touch" reset).

.. list-table::
   :header-rows: 1
   :widths: 28 16 28 28

   * - Board
     - DFU VID:PID
     - Firmware command
     - ROMFS command
   * - Arduino Portenta H7
     - ``2341:035b``
     - ``-a 0 -s 0x08040000``
     - ``-a 1 -s 0x90B00000:leave``
   * - Arduino Giga
     - ``2341:0366``
     - ``-a 0 -s 0x08040000``
     - ``-a 1 -s 0x90B00000:leave``
   * - Arduino Nicla Vision
     - ``2341:035f``
     - ``-a 0 -s 0x08040000``
     - ``-a 1 -s 0x90B00000:leave``

Flash the application (Nicla Vision shown)::

    dfu-util -w -d ,2341:035f -a 0 -s 0x08040000 -D firmware.bin

Wi-Fi and Bluetooth need two additional blobs shipped with OpenMV IDE
in ``share/qtcreator/firmware/CYW4343/``:

.. list-table::
   :header-rows: 1
   :widths: 26 24 50

   * - Component
     - Flash address
     - File
   * - Wi-Fi firmware
     - ``0x90F00000``
     - ``cyw4343_7_45_98_102.bin``
   * - Bluetooth firmware
     - ``0x90FC0000``
     - ``cyw4343_btfw.bin``

Flash both onto the external flash alt, with ``:leave`` on the final
transfer (Nicla Vision shown)::

    dfu-util -w -d ,2341:035f -a 1 -s 0x90F00000 -D cyw4343_7_45_98_102.bin
    dfu-util -w -d ,2341:035f -a 1 -s 0x90FC0000:leave -D cyw4343_btfw.bin

Arduino Nano 33 BLE Sense: bossac
---------------------------------

The Nano 33 BLE Sense (nRF52840) does not use ``dfu-util``. To enter
the bootloader, double-tap the **RESET** button; the board enumerates
as the nRF52840 DFU device (``2341:805a``). Flash it with ``bossac``,
writing the application at flash offset ``0x16000`` -- above the
factory SoftDevice and bootloader, which are never written::

    bossac -e -w -v -R --offset=0x16000 firmware.bin

Arduino Nano RP2040 Connect: picotool
-------------------------------------

To enter the bootloader, hold the **BOOTSEL** button while connecting
USB; the board mounts a USB mass-storage drive named ``RPI-RP2``.
Flash it either by copying a ``.uf2`` file onto that drive, or with
``picotool``::

    picotool load -x firmware.uf2

.. warning::

   The Arduino boards' bootloaders are factory-locked and **cannot**
   be restored by the user -- only the application
   region is ever written. A damaged Arduino bootloader must be
   recovered with Arduino's own tooling. The bootloader-restore
   procedures in :doc:`../recovery` apply to the OpenMV-branded
   cameras only.

.. seealso::

   To wipe the camera's internal FAT filesystem -- the fix when a bad
   ``main.py`` or a corrupted filesystem stops the camera from booting
   -- see :doc:`erasing`.
