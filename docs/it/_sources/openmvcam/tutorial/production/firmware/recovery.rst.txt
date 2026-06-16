Restoring the bootloader
========================

A normal firmware flash never touches the bootloader, so an *interrupted
firmware* update is almost always recoverable: re-run the same flashing
command from :doc:`flashing/index` (``dfu-util -w`` waits for the device) or
re-run *Load Custom Firmware* while the camera is still in its
bootloader. This page covers the rarer case where the **bootloader
itself** is damaged and the camera no longer enumerates as a DFU device
on reset.

The bootloader lives in a separate flash region from the firmware and
filesystem, and every OpenMV-branded camera has a hardware path back, so
a camera is difficult to render permanently unrecoverable. The Arduino
boards are the only exception -- their bootloaders are fixed and not
user-restorable.

OpenMV IDE automates all of these recovery procedures, prompting you
through the hardware steps (jumpers, switches, buttons) along the way.
The sections below document what it does for each camera family, for
when you want to run the recovery yourself.

STM32 cameras (BOOT--RST jumper)
--------------------------------

For the STM32 OpenMV cameras (M4, M7, H7, H7 Plus, Pure Thermal):

#. Disconnect the camera.
#. Connect a jumper wire between the **BOOT** and **RST** pins.
#. Reconnect. The camera now enumerates as the ST system DFU device
   (``0483:df11``), independent of the damaged firmware.
#. Reflash the bootloader only -- OpenMV IDE *Load Custom Firmware* with
   ``bootloader.bin``, or::

       dfu-util -w -d ,0483:df11 -a 0 -s 0x08000000 -D bootloader.bin
#. Remove the jumper and reconnect.
#. Flash the firmware normally (see :doc:`flashing/index`).

OpenMV Cam N6 (BOOT--VCC jumper)
--------------------------------

#. Disconnect the camera.
#. Connect a jumper wire between the **BOOT** and **VCC** pins.
#. Reconnect. The camera now enumerates as the ST system DFU device
   (``0483:df11``), independent of the damaged bootloader.
#. Reflash with STM32CubeProgrammer (included in the OpenMV SDK),
   using the flash-layout descriptor shipped alongside
   ``bootloader.bin`` -- it rewrites the first-stage bootloader, the
   external-flash loader, and the bootloader::

       STM32_Programmer_CLI -c port=USB1 -d OPENMV_N6/FlashLayout.tsv

#. Remove the jumper and reconnect.
#. Flash the firmware normally (see :doc:`flashing/index`).

OpenMV Cam RT1062
-----------------

Recreating the RT1062 secure bootloader requires entering the chip's
ROM serial-download (SDP) mode with a jumper, staging a RAM
flashloader, then rewriting the flash configuration block, the SBL, and
the firmware. The manual sequence:

#. Disconnect the camera, jumper the **SBL** and **3.3V** pins, and
   reconnect. The chip enumerates in SDP ROM mode
   (``0x1FC9:0x0135``).

#. Stage and start the RAM flashloader::

       sdphost -u 0x1FC9,0x0135 -- write-file 0x20001C00 sdphost_flash_loader.bin
       sdphost -u 0x1FC9,0x0135 -- jump-address 0x20001C00

#. The camera now answers as the flashloader (``0x15A2:0x0073``).
   Configure the external flash, write the flash configuration block,
   then write the SBL::

       blhost -u 0x15A2,0x0073 -- fill-memory 0x2000 4 0xC0000008 word
       blhost -u 0x15A2,0x0073 -- configure-memory 9 0x2000
       blhost -u 0x15A2,0x0073 -t 120000 -- flash-erase-region 0x60000000 0x1000
       blhost -u 0x15A2,0x0073 -- fill-memory 0x2000 4 0xF000000F word
       blhost -u 0x15A2,0x0073 -- configure-memory 9 0x2000
       blhost -u 0x15A2,0x0073 -t 120000 -- flash-erase-region 0x60001000 <sbl_size>
       blhost -u 0x15A2,0x0073 -- write-memory 0x60001000 blhost_flash_loader.bin

#. Write the firmware and set the boot-source fuse so the chip boots
   the new SBL from external flash::

       blhost -u 0x15A2,0x0073 -t 120000 -- flash-erase-region 0x60040000 <firmware_size>
       blhost -u 0x15A2,0x0073 -- write-memory 0x60040000 firmware.bin
       blhost -u 0x15A2,0x0073 -- efuse-program-once 0x06 00000010
       blhost -u 0x15A2,0x0073 -- reset

#. Remove the jumper and power-cycle the camera.

.. warning::

   ``efuse-program-once 0x06 00000010`` is a **one-time, irreversible**
   fuse write that sets the device to boot from external flash. This
   is another reason to let OpenMV IDE perform RT1062 bootloader
   recovery rather than running the sequence by hand.

OpenMV AE3
----------

The AE3's secure bootloader is **not** restored over USB DFU. It is
rewritten into the chip's MRAM with **Alif Semiconductor's SE Tools**
(bundled with OpenMV IDE) over a serial ISP connection. This is an
interactive, recovery-only procedure -- not a routine flashing method
-- and it is error-prone by hand; of everything on this page, it is
the one to leave to OpenMV IDE.

**Connection.** The SE Tools talk to the AE3 over its debug adapter's
serial ISP port -- an FTDI ``0403:6015`` or a CH340 ``1A86:55D3``
interface, together with a J-Link. Recovery requires putting the device
in **recovery mode**: enable the on-board recovery switch.

**SE Tools.** OpenMV IDE bundles these Alif executables. They share
two config files -- ``isp_config_data.cfg`` and ``global-cfg.db`` --
created by ``maintenance`` on first connection:

.. list-table::
   :header-rows: 1
   :widths: 28 72

   * - Tool
     - Purpose
   * - ``maintenance``
     - Query the Secure Enclave (``maintenance -opt sesbanner`` reads
       its version) and place the device in recovery mode.
   * - ``updateSystemPackage``
     - Update the Secure Enclave system package when it is older than
       the version the firmware requires.
   * - ``app-gen-toc``
     - Generate the table-of-contents (TOC) image (used for an
       application-only write).
   * - ``app-write-mram``
     - Write image(s) to MRAM -- the step that restores the bootloader.

**Procedure:**

#. Connect to the AE3 with ``maintenance``; it prompts for the serial
   port and the device type, creating ``isp_config_data.cfg`` and
   ``global-cfg.db`` for the other tools.
#. If the Secure Enclave system package is out of date,
   ``updateSystemPackage`` updates it; power-cycle when prompted.
#. ``app-write-mram -i "bootloader.bin 0x80000000 firmware_pad.toc
   0x8057E000"`` writes the bootloader and TOC into MRAM.
#. The AE3 re-enumerates as the ``37C5:96E3`` DFU device. Run the
   normal four-image flash from :doc:`flashing/openmv-ae3` to
   load the application.
#. Power-cycle the camera and turn the recovery switch back
   off.

.. note::

   OpenMV IDE handles much more than this happy path -- a corrupted
   Secure Enclave firmware, a bad bootloader, and the other failure
   states each need their own recovery steps, and a lot can go wrong
   along the way. If the manual steps above don't bring the camera
   back, use OpenMV IDE to recover it.
