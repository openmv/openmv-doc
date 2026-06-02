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
user-restorable (see the warning in :doc:`flashing/index`).

STM32 cameras (BOOT--RST jumper)
--------------------------------

For the STM32 OpenMV cameras (M4, M7, H7, H7 Plus, Pure Thermal):

#. Disconnect the camera.
#. Connect a jumper wire between the **BOOT** and **RST** pins.
#. Reconnect. The camera now enumerates as the ST system DFU device
   (``0483:df11``), independent of the damaged firmware.
#. Reflash the bootloader only -- OpenMV IDE *Load Custom Firmware* with
   ``bootloader.dfu``, or::

       dfu-util -w -d ,0483:df11 -a 0 -s 0x08000000 -D bootloader.bin

   Flash ``bootloader.dfu`` / ``bootloader.bin``, not a combined
   ``openmv.dfu`` -- the combined image also erases the filesystem.
#. Remove the jumper and reconnect.
#. Flash the firmware normally (see :doc:`flashing/index`).

OpenMV Cam N6
-------------

The N6 is recovered with STM32CubeProgrammer (included in the OpenMV
SDK) using a flash-layout descriptor that rewrites the first-stage
bootloader, the external-flash loader, and the bootloader::

    STM32_Programmer_CLI -c port=USB1 -d OPENMV_N6/FlashLayout.tsv

OpenMV IDE performs this automatically when it detects a damaged N6.

OpenMV Cam RT1062
-----------------

Recreating the RT1062 secure bootloader requires entering the chip's
ROM serial-download (SDP) mode with a jumper, staging a RAM
flashloader, then rewriting the flash configuration block, the SBL, and
the firmware. This is involved and OpenMV IDE automates it; using the
IDE is strongly recommended. The manual sequence:

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
-- and is error-prone by hand; **use OpenMV IDE**, which drives the
SE Tools and prompts you through the hardware steps. The detail below
documents what it does.

**Connection.** The SE Tools talk to the AE3 over its debug adapter's
serial ISP port -- an FTDI ``0403:6015`` or a CH340 ``1A86:55D3``
interface, together with a J-Link. Recovery requires putting the device
in **hard-maintenance mode**: set the on-board hard-maintenance switch
and press the user button when prompted.

**SE Tools.** OpenMV IDE bundles these Alif executables (with the
config files ``isp_config_data.cfg`` -- the serial-port settings -- and
``global-cfg.db`` -- the device part/revision and the
``MRAM-BURNER {Interface: isp, Jtag-adapter: J-Link}`` settings):

.. list-table::
   :header-rows: 1
   :widths: 28 72

   * - Tool
     - Purpose
   * - ``maintenance``
     - Query the Secure Enclave (``maintenance -opt sesbanner`` reads
       its version) and place the device in hard-maintenance mode.
   * - ``updateSystemPackage``
     - Update the Secure Enclave system package when it is older than
       the version the firmware requires.
   * - ``app-gen-toc``
     - Generate the table-of-contents (TOC) image (used for an
       application-only write).
   * - ``app-write-mram``
     - Write image(s) to MRAM -- the step that restores the bootloader.

**MRAM write targets** (the ``app-write-mram`` step):

.. list-table::
   :header-rows: 1
   :widths: 40 30 30

   * - Image
     - MRAM address
     - Tool argument
   * - ``bootloader.bin``
     - ``0x80000000``
     - ``-i "bootloader.bin 0x80000000``
   * - ``firmware_pad.toc``
     - ``0x8057E000``
     - ``firmware_pad.toc 0x8057E000"``

**Procedure** (as OpenMV IDE performs it):

#. Connect the AE3's serial ISP adapter (FTDI / CH340) and the J-Link;
   the SE Tools write ``isp_config_data.cfg`` and ``global-cfg.db``.
#. ``maintenance -opt sesbanner`` reads the Secure Enclave version. If
   the device is in recovery or hard-maintenance is required, set the
   hard-maintenance switch and press the user button when prompted.
#. ``maintenance`` queries the boot state.
#. If the Secure Enclave system package is out of date,
   ``updateSystemPackage`` updates it; power-cycle when prompted.
#. ``app-write-mram -i "bootloader.bin 0x80000000 firmware_pad.toc
   0x8057E000"`` writes the bootloader and TOC into MRAM.
#. The AE3 re-enumerates as the ``37C5:96E3`` DFU device. Run the
   normal four-image flash from :doc:`flashing/openmv-ae3` to
   load the application.
#. Power-cycle the camera and turn the hard-maintenance switch back
   off.
