OpenMV STM32 cameras: dfu-util
==============================

For scripted or CI flashing of the single-core STM32 OpenMV cameras
(M4, M7, H7, H7 Plus, Pure Thermal, N6), use ``dfu-util`` directly. It
is included in the OpenMV SDK and in OpenMV IDE's tool directory. On
Linux, non-root access to the DFU device requires udev rules: install
OpenMV IDE (which installs them), or copy its ``99-openmv*.rules``
files from ``share/qtcreator/pydfu/`` into ``/etc/udev/rules.d/`` and
run ``sudo udevadm control --reload-rules && sudo udevadm trigger``.
Otherwise run ``dfu-util`` with ``sudo``.

These cameras use the ``openmv_dfu`` bootloader and are flashed *by DFU
alt setting* (``-a N``), not by absolute address -- the bootloader maps
each alt to the correct flash region. To enter the bootloader, just
plug the camera in: it listens briefly at power-up, and ``-w`` makes
``dfu-util`` wait for it to appear. ``--reset`` on the final transfer
reboots the camera into the new firmware.

.. list-table::
   :header-rows: 1
   :widths: 22 15 15 24 24

   * - Camera (``TARGET``)
     - App VID:PID
     - DFU VID:PID
     - Firmware command
     - ROMFS command
   * - OpenMV Cam M4 (``OPENMV2``)
     - ``37C5:1202``
     - ``37C5:9202``
     - ``-a 2 -D firmware.bin``
     - ``-a 3 -D romfs0.img``
   * - OpenMV Cam M7 (``OPENMV3``)
     - ``37C5:1203``
     - ``37C5:9203``
     - ``-a 2 -D firmware.bin``
     - ``-a 3 -D romfs0.img``
   * - OpenMV Cam H7 (``OPENMV4``)
     - ``37C5:1204``
     - ``37C5:9204``
     - ``-a 2 -D firmware.bin``
     - ``-a 3 -D romfs0.img``
   * - OpenMV Cam H7 Plus (``OPENMV4P``)
     - ``37C5:124A``
     - ``37C5:924A``
     - ``-a 2 -D firmware.bin``
     - ``-a 4 -D romfs0.img``
   * - OpenMV Pure Thermal (``OPENMVPT``)
     - ``37C5:1205``
     - ``37C5:9205``
     - ``-a 2 -D firmware.bin``
     - ``-a 4 -D romfs0.img``
   * - OpenMV Cam N6 (``OPENMV_N6``)
     - ``37C5:1206``
     - ``37C5:9206``
     - ``-a 1 -D firmware.bin``
     - ``-a 3 -D romfs0.img``

Flash the OpenMV Cam H7, firmware then ROMFS::

    dfu-util -w -d ,37C5:9204 -a 2 -D build/OPENMV4/bin/firmware.bin
    dfu-util -w -d ,37C5:9204 -a 3 --reset -D build/OPENMV4/bin/romfs0.img

.. seealso::

   To wipe the camera's internal FAT filesystem -- the fix when a bad
   ``main.py`` or a corrupted filesystem stops the camera from booting
   -- see :doc:`erasing`.

   To restore the camera's bootloader itself, see :doc:`../recovery`.
