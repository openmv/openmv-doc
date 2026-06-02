Arduino boards
==============

The STM32-based Arduino boards (Portenta H7, Giga, Nicla Vision) are
flashed with ``dfu-util`` using **absolute flash addresses** through
the Arduino DFU bootloader. The two Nano boards use their own tools.

STM32 Arduino boards: dfu-util
------------------------------

The board enters DFU when its serial port is opened at 1200 baud (a
"touch" / double-tap reset); OpenMV IDE performs this automatically.

.. list-table::
   :header-rows: 1
   :widths: 28 16 28 28

   * - Board
     - DFU VID:PID
     - Firmware command
     - ROMFS command
   * - Arduino Portenta H7
     - ``2341:035b``
     - ``-a 0 -s 0x08040000:leave``
     - ``-a 1 -s 0x90B00000:leave``
   * - Arduino Giga
     - ``2341:0366``
     - ``-a 0 -s 0x08040000:leave``
     - ``-a 1 -s 0x90B00000:leave``
   * - Arduino Nicla Vision
     - ``2341:035f``
     - ``-a 0 -s 0x08040000:leave``
     - ``-a 1 -s 0x90B00000:leave``

Flash the application (Nicla Vision shown)::

    dfu-util -w -d ,2341:035f -a 0 -s 0x08040000:leave -D firmware.bin

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

Arduino Nano 33 BLE Sense: bossac
---------------------------------

The Nano 33 BLE Sense (nRF52840) does not use ``dfu-util``. Double-tap
the **RESET** button; the board enters its bootloader and enumerates
as the nRF52840 DFU device (``2341:805a``). OpenMV IDE flashes it with
the bundled ``bossac``, writing the application at flash offset
``0x16000`` -- above the factory SoftDevice and bootloader, which are
never written. The equivalent manual command (OpenMV IDE supplies the
serial port) is::

    bossac -e -w -v -R --offset=0x16000 firmware.bin

Arduino Nano RP2040 Connect: picotool
-------------------------------------

Hold the **BOOTSEL** button while connecting USB; the board mounts a
USB mass-storage drive named ``RPI-RP2``. Flash it either by copying
a ``.uf2`` file onto that drive, or with the bundled ``picotool``::

    picotool load -x firmware.uf2

OpenMV IDE triggers the reset and runs ``picotool`` automatically.

.. warning::

   The Arduino boards' bootloaders are factory-locked and **cannot**
   be restored by the user or by OpenMV IDE -- only the application
   region is ever written. A damaged Arduino bootloader must be
   recovered with Arduino's own tooling. The bootloader-restore
   procedures in :doc:`../recovery` apply to the OpenMV-branded
   cameras only.
