Building the firmware
=====================

With the environment from :doc:`setup` in place, building a firmware image
is two ``make`` commands plus a ``TARGET`` selection.

Compiling
---------

First build **mpy-cross**, the host tool that compiles the frozen ``.py``
modules into bytecode (do this once, and again whenever you switch boards
or update MicroPython)::

    make -j$(nproc) -C lib/micropython/mpy-cross

Then build the firmware for a board, where ``<TARGET>`` is one of the
names from the table below::

    make -j$(nproc) TARGET=<TARGET>

``-j$(nproc)`` builds in parallel across all CPU cores (on macOS use
``-j$(sysctl -n hw.ncpu)``). ``TARGET`` is mandatory -- ``make`` with no
target aborts with *"Invalid or no TARGET specified"*.

A complete first build, end to end::

    make sdk
    make -j$(nproc) -C lib/micropython/mpy-cross
    make -j$(nproc) TARGET=OPENMV4

Supported boards
~~~~~~~~~~~~~~~~~

``TARGET`` values are the directory names under ``boards/``. The cameras
and their silicon:

.. list-table::
   :header-rows: 1
   :widths: 26 22 18 16 18

   * - Camera
     - ``TARGET``
     - MCU
     - Port
     - Core
   * - OpenMV Cam M4
     - ``OPENMV1``
     - STM32F407
     - stm32
     - Cortex-M4
   * - OpenMV Cam M4 (V2)
     - ``OPENMV2``
     - STM32F427
     - stm32
     - Cortex-M4
   * - OpenMV Cam M7
     - ``OPENMV3``
     - STM32F765
     - stm32
     - Cortex-M7
   * - OpenMV Cam H7
     - ``OPENMV4``
     - STM32H743
     - stm32
     - Cortex-M7
   * - OpenMV Cam H7 Plus
     - ``OPENMV4P``
     - STM32H743 + SDRAM
     - stm32
     - Cortex-M7
   * - OpenMV Pure Thermal
     - ``OPENMVPT``
     - STM32H743 + SDRAM
     - stm32
     - Cortex-M7
   * - OpenMV Cam N6
     - ``OPENMV_N6``
     - STM32N657
     - stm32
     - Cortex-M55
   * - OpenMV Cam RT1062
     - ``OPENMV_RT1060``
     - MIMXRT1062
     - mimxrt
     - Cortex-M7
   * - OpenMV AE3
     - ``OPENMV_AE3``
     - Alif Ensemble (dual M55)
     - alif
     - Cortex-M55
   * - Arduino Portenta H7
     - ``ARDUINO_PORTENTA_H7``
     - STM32H747
     - stm32
     - Cortex-M7
   * - Arduino Giga
     - ``ARDUINO_GIGA``
     - STM32H747
     - stm32
     - Cortex-M7
   * - Arduino Nicla Vision
     - ``ARDUINO_NICLA_VISION``
     - STM32H747
     - stm32
     - Cortex-M7
   * - Arduino Nano 33 BLE Sense
     - ``ARDUINO_NANO_33_BLE_SENSE``
     - nRF52840
     - nrf
     - Cortex-M4
   * - Arduino Nano RP2040 Connect
     - ``ARDUINO_NANO_RP2040_CONNECT``
     - RP2040
     - rp2
     - Cortex-M0+

Build the exact ``TARGET`` for your hardware -- e.g. ``OPENMV4`` for the
OpenMV Cam H7, ``OPENMV4P`` for the H7 Plus, ``OPENMV_N6`` for the N6.

Build output
~~~~~~~~~~~~~

Everything for a board lands in ``build/<TARGET>/bin/``. For
``TARGET=OPENMV4`` that is ``build/OPENMV4/bin/``, containing:

.. list-table::
   :header-rows: 1
   :widths: 30 70

   * - File
     - What it is
   * - ``firmware.bin``
     - Firmware binary -- flashed by OpenMV IDE *Tools -> Load Custom
       Firmware* and by ``dfu-util``
   * - ``firmware.elf``
     - Firmware with debug symbols -- the file you point the debugger at
   * - ``firmware.dfu``
     - Firmware as a DFU image
   * - ``bootloader.bin`` / ``.elf`` / ``.dfu``
     - The bootloader (only on boards with a bootloader enabled)
   * - ``openmv.bin`` / ``openmv.dfu``
     - Combined bootloader + firmware image
   * - ``romfs<n>.img``
     - Read-only ROM filesystem image flashed alongside the firmware

The Alif AE3 is dual-core, so it produces ``firmware_M55_HP.elf`` /
``firmware_M55_HP.bin`` (the high-performance core) and a separate
``firmware_M55_HE.*`` (the high-efficiency core) plus a TOC image.

Cleaning and rebuilding
~~~~~~~~~~~~~~~~~~~~~~~~

Builds are isolated per board under ``build/<TARGET>/``. To wipe one
board's build::

    make TARGET=<TARGET> clean

There is no ``distclean``; ``clean`` always needs a ``TARGET``.
``mpy-cross`` is shared across boards -- if you switch targets or update
MicroPython, rebuild it too::

    make -C lib/micropython/mpy-cross clean
    make -j$(nproc) -C lib/micropython/mpy-cross

To report the flash/RAM usage of a build::

    make TARGET=<TARGET> size

Building in Docker (no host toolchain)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

If you would rather not install anything on the host (or you are on a
platform without a native build), use the Docker path::

    git clone https://github.com/openmv/openmv.git --depth=50
    cd openmv/docker
    make TARGET=<TARGET>

Artifacts appear in ``openmv/docker/build/<TARGET>``. For repeated builds
there is an incremental dev path that mounts the repo at the same absolute
path inside the container as on the host, so debugger source paths resolve
without remapping::

    make install-sdk
    make build-firmware-dev TARGET=<TARGET>

Run ``make clean-dev`` when switching ``TARGET``.

Build options
-------------

Build behavior is controlled by variables passed on the ``make`` command
line, for example::

    make -j$(nproc) TARGET=OPENMV4 DEBUG=1 V=1

The variables a firmware developer will use:

.. list-table::
   :header-rows: 1
   :widths: 20 12 68

   * - Variable
     - Default
     - Effect
   * - ``TARGET``
     - *(required)*
     - The board to build. Selects ``boards/<TARGET>/board_config.mk``,
       which sets the MCU, core, memory map, USB IDs, and enabled modules.
   * - ``DEBUG``
     - ``0``
     - ``DEBUG=1`` compiles with ``-Og -ggdb3`` (debug-optimized, full GDB
       debug info) and disables MicroPython ROM-text compression -- this
       is the build you debug. ``DEBUG=0`` compiles with ``-O2 -DNDEBUG``
       (smaller, faster, asserts off) and is the release build.
   * - ``V``
     - ``0``
     - ``V=1`` prints every compiler/linker command instead of the short
       ``CC file.c`` summary. Use it to see exact flags or diagnose build
       issues.
   * - ``DEBUG_PRINTF``
     - ``0``
     - ``DEBUG_PRINTF=1`` defines ``OMV_DEBUG_PRINTF``, enabling low-level
       debug ``printf`` output in the firmware (pair with SWO/RTT, see
       :doc:`debugging`).
   * - ``PROFILE_ENABLE``
     - ``0``
     - ``PROFILE_ENABLE=1`` builds with function-call instrumentation
       (``-finstrument-functions``, ``-DOMV_PROFILER_ENABLE=1``) so you
       can profile where time is spent. ``PROFILE_HASH=<N>`` sets the
       profiler hash-table size (power of two; default 256) and
       ``PROFILE_IRQ=1`` also profiles code running in interrupt context.
   * - ``STACK_PROTECTOR``
     - ``0``
     - ``STACK_PROTECTOR=1`` adds ``-fstack-protector-all`` -- stack
       canaries that trap stack-buffer overflows. Useful when chasing
       memory corruption.
   * - ``FB_ALLOC_STATS``
     - ``0``
     - ``FB_ALLOC_STATS=1`` instruments the frame-buffer allocator so you
       can see vision-buffer allocation behavior. Useful for
       out-of-memory debugging in the image pipeline.
   * - ``DEBUGGER``
     - ``JLINK``
     - Which debugger the ``make debug`` / ``make deploy`` targets use.
       ``JLINK`` is the default; ``NONE`` disables the ``debug`` target.

.. note::

   Many more variables exist (camera/sensor drivers, wireless stacks, ML
   backends, USB stack, secure boot, etc.), but those are set per-board
   in ``boards/<TARGET>/board_config.mk`` and are not normally
   overridden on the command line. Changing them is board customization,
   not a normal developer build -- see `docs/boards.md
   <https://github.com/openmv/openmv/blob/master/docs/boards.md>`__ in
   the firmware repository.

For everyday work the only options you need are ``TARGET`` (always),
``DEBUG=1`` (whenever you intend to debug, see :doc:`debugging`), and
occasionally ``V=1``.
