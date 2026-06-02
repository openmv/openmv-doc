Flashing the firmware
=====================

Once you have a ``firmware.bin`` (and its ``romfs<n>.img``) from
:doc:`../building`, program it onto the camera. OpenMV IDE is the
recommended method; the command-line procedure differs by camera family
and is documented per family on the pages linked at the bottom. The
bootloader itself is restored separately -- see :doc:`../recovery`.

OpenMV IDE: Load Custom Firmware (recommended)
----------------------------------------------

OpenMV IDE bundles every flashing tool (``dfu-util``, the NXP SPSDK tools,
the Alif SE Tools, the STM32 tools), installs the required USB drivers on
Windows, handles entering the bootloader, and selects the correct command
for the connected camera. It is the recommended way to flash a custom
build.

#. Connect the camera over USB (you do not need to click *Connect*).

#. **Tools -> Load Custom Firmware**.

#. In the dialog, set **Firmware Path** to your build's
   ``build/<TARGET>/bin/firmware.bin``.

#. Optionally tick **Erase internal file system** to wipe the camera's
   internal FAT filesystem (not an SD card) -- useful when a bad
   ``main.py`` or corrupted FS prevents normal boot.

#. Optionally tick **Reset ROMFS file system** to reflash the default
   ROMFS (disabled if you selected a ``.img`` directly).

#. Click **Run**. The IDE resets the camera into its bootloader, shows
   the exact flashing command and a progress bar, and reboots the camera
   into the new firmware. Wait for the blue self-test LED; the camera
   then re-enumerates normally.

There is also **Tools -> Force enter OpenMV Cam bootloader** to place the
camera in DFU mode manually before flashing.

Windows: install the USB drivers
--------------------------------

Windows has no built-in driver for the camera's USB DFU, SDP, and ISP
interfaces, so the command-line tools (``dfu-util``, the NXP SPSDK tools,
the Alif SE Tools) cannot detect the device until a WinUSB driver is
bound to it. OpenMV IDE's Windows installer installs all of these
drivers, so the simplest approach is to install OpenMV IDE once -- after
which both the IDE and the command-line tools work. This is why GUI
flashing succeeds on a fresh Windows machine while a standalone
``dfu-util`` does not.

If installing the IDE is not an option, run the matching driver installer
from OpenMV IDE's ``share/qtcreator/drivers/`` directory **as
Administrator**:

.. list-table::
   :header-rows: 1
   :widths: 36 64

   * - Driver installer
     - USB devices it binds
   * - ``openmv\openmv.cmd``
     - OpenMV and AE3 DFU devices, and the RT1062 SPSDK interfaces
       (``0x1FC9:0x0135`` SDP ROM and ``0x15A2:0x0073`` flashloader)
   * - ``arduino\arduino.cmd``
     - Arduino DFU devices (``2341:03xx``)
   * - ``ftdi\ftdi.cmd``
     - The FTDI ``0403:6015`` adapter used for AE3 bootloader recovery
   * - ``DFU_Driver\STM32Bootloader.bat``
     - The ST ``0483:df11`` system DFU device used for STM32 bootloader
       recovery

Alternatively, bind WinUSB to the specific VID:PID with Zadig or
``pnputil``. No command-line flashing on Windows works without this.
Linux and macOS need no driver installation (Linux requires only the
udev rules noted on the per-camera pages).

Flashing over SWD (``make deploy``)
-----------------------------------

If a debug probe is already wired to the camera -- as it is for
debugging -- the fastest edit-build-flash cycle bypasses USB DFU and
programs the chip directly over SWD. On the STM32 cameras::

    make -j$(nproc) TARGET=<TARGET> deploy

This flashes the freshly built firmware via ``STM32_Programmer_CLI``
(from the SDK) over the connected probe. There is no bootloader entry,
no USB re-enumeration, and no cable swapping: build, run ``deploy``, and
the camera restarts running the new code. This is the recommended
workflow during active firmware development. Use DFU or OpenMV IDE when
flashing without a probe or when distributing firmware to others.

Entering bootloader / DFU mode
------------------------------

Flashing requires the camera to be in its bootloader / DFU mode. There
are three ways in:

* **Software reset (normal).** OpenMV IDE (or a ``mpremote`` / serial
  reset) tells running firmware to reboot into the bootloader. This is
  automatic during *Load Custom Firmware* and is all you normally need.
* **BOOT--RST jumper (recovery).** If the firmware is too damaged to
  accept a software reset, disconnect the camera, jumper the **BOOT**
  and **RST** pins, and reconnect; it enumerates as the ST system DFU
  device. This is the recovery path, covered in detail on
  :doc:`../recovery`.
* **Arduino touch-reset.** Arduino boards enter DFU via a 1200-baud
  touch / double-tap reset; OpenMV IDE handles this automatically for
  those targets.

Command-line flashing by camera family
--------------------------------------

.. toctree::
   :maxdepth: 1

   openmv-stm32.rst
   openmv-ae3.rst
   openmv-rt1062.rst
   arduino.rst
   erasing.rst
