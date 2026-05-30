.. _firmware_development:

Building, flashing, and debugging the firmware
==============================================

This page is for **firmware developers** -- people who want to change the C
code that runs on the OpenMV Cam, not just write MicroPython scripts. It
covers the whole loop: setting up an editor, installing the build toolchain,
compiling the firmware for every supported board, the build options you can
pass to ``make``, flashing your build onto a camera, and debugging it on real
hardware with a J-Link probe and single-step source-level debugging in VS
Code.

By the end you should be able to take a clean machine, build the firmware,
put it on a camera, set a breakpoint in the C source, and single-step the
processor.

.. note::

   The OpenMV firmware is a fork of `MicroPython
   <https://github.com/micropython/micropython>`__ with the OpenMV machine
   vision library, drivers, and board ports added. The source lives at
   `github.com/openmv/openmv <https://github.com/openmv/openmv>`__. The Python
   ``image``/``ml``/``csi`` modules you use in scripts are C code in this
   repository.

How the build works
-------------------

Two things are worth understanding before you start, because they explain
every instruction below:

* **The build is SDK-driven.** You do not install the ARM compiler, CMake,
  Python, or the ST tools yourself. The repository pins an exact OpenMV SDK
  version (the ``SDK_VERSION`` file -- ``1.6.0`` at the time of writing), and
  ``make sdk`` downloads and unpacks that SDK into ``~/openmv-sdk-<version>/``.
  The build then prepends the SDK's ``gcc``, ``llvm``, ``cmake``, ``python``,
  and ST tool directories to ``PATH``. This means everyone builds with the
  *exact same* toolchain, and host setup is tiny.

* **There is no native Windows build.** The toolchain and build scripts target
  Linux (x86-64) and macOS (arm64) only. On Windows you build inside **WSL**
  (Windows Subsystem for Linux), which is a real Linux environment -- so once
  WSL is installed, Windows users follow the Linux instructions exactly. A
  Docker-based build and a Linux VM are also options.

The high-level sequence on any supported system is always:

#. Install an editor (VS Code).
#. Get a Linux-like shell (native Linux, macOS, or WSL on Windows).
#. Clone the repository and its submodules.
#. ``make sdk`` -- one-time toolchain install.
#. ``make -C lib/micropython/mpy-cross`` -- build the bytecode compiler.
#. ``make TARGET=<board>`` -- build the firmware.
#. Flash it (OpenMV IDE or ``dfu-util``).
#. Optionally, attach a J-Link and debug it.

The development environment
---------------------------

You can build the firmware from any editor -- the build is just ``make`` --
but **Visual Studio Code** is recommended because the on-hardware debugger
(`Debugging the firmware`_, below) uses the VS Code **Cortex-Debug**
extension. Installing VS Code first means the rest of this guide is ready to
debug, not just build.

Installing VS Code
~~~~~~~~~~~~~~~~~~

* **Windows** -- download the installer from `code.visualstudio.com
  <https://code.visualstudio.com>`__ and run it. Install VS Code on
  **Windows**, not inside WSL; it integrates with WSL through the *WSL*
  extension (below), running its UI on Windows while the compiler, files, and
  debugger live in Linux.
* **macOS** -- download the ``.zip`` from `code.visualstudio.com
  <https://code.visualstudio.com>`__, unzip it, and drag *Visual Studio
  Code.app* into ``/Applications``. Or ``brew install --cask
  visual-studio-code``.
* **Linux** -- install the ``.deb``/``.rpm`` from `code.visualstudio.com
  <https://code.visualstudio.com>`__ (e.g. ``sudo apt install
  ./code_*.deb``), or use the distribution's Snap/Flatpak.

Extensions to install (from the Extensions panel, :kbd:`Ctrl+Shift+X`):

* **C/C++** (``ms-vscode.cpptools``) -- C source navigation and IntelliSense.
* **Cortex-Debug** (``marus25.cortex-debug``) -- on-chip debugging via GDB and
  a J-Link/OpenOCD server. Required for `Debugging the firmware`_.
* **WSL** (``ms-vscode-remote.remote-wsl``) -- **Windows only**. Lets VS Code
  open a folder *inside* your WSL distribution so the editor, terminal,
  IntelliSense, and Cortex-Debug all operate in Linux. Install the C/C++ and
  Cortex-Debug extensions *into the WSL host* once connected (VS Code prompts
  for this).

Setting up the build system
---------------------------

You need a Linux (x86-64) or macOS (arm64) environment with ``git`` and a few
basic tools. Pick the section for your OS.

Windows: install WSL
~~~~~~~~~~~~~~~~~~~~~

WSL runs a genuine Ubuntu userland on Windows. After it is installed, every
later instruction in this guide is identical to native Linux.

#. Open **PowerShell as Administrator** (right-click Start -> *Terminal
   (Admin)*).

#. Install WSL with the default Ubuntu distribution::

       wsl --install

   This enables the required Windows features, installs the WSL 2 kernel, and
   installs Ubuntu. Reboot if prompted.

#. After the reboot, Ubuntu launches and asks you to create a UNIX username
   and password. This account is independent of your Windows account.

#. Update the distribution::

       sudo apt update && sudo apt upgrade -y

#. Confirm you are on **WSL 2** (required -- WSL 1 is not supported for this
   workflow). In PowerShell::

       wsl --list --verbose

   The ``VERSION`` column must say ``2``. If it says ``1``, convert it::

       wsl --set-version Ubuntu 2

.. tip::

   Work inside the Linux filesystem (``~/`` in WSL), **not** under
   ``/mnt/c/``. Building on the Windows-mounted drive is dramatically slower
   and can cause file-permission and line-ending problems. Clone the
   repository into your WSL home directory.

To open the project later: launch *Ubuntu* from the Start menu for a shell,
or from VS Code on Windows press :kbd:`Ctrl+Shift+P` -> *WSL: Connect to
WSL*, then *File -> Open Folder* and pick the cloned repo in the Linux
filesystem.

Linux / WSL prerequisites
~~~~~~~~~~~~~~~~~~~~~~~~~~

The SDK provides the compiler, so only a handful of host packages are needed
(this is also exactly what continuous integration installs on Ubuntu)::

    sudo apt-get update
    sudo apt-get install git build-essential

macOS prerequisites
~~~~~~~~~~~~~~~~~~~~

Native building is supported on **Apple-silicon (arm64) macOS** only. Using
`Homebrew <https://brew.sh>`__::

    brew install bash make coreutils

(Intel macs are not a supported native build host -- use the Docker build or
a Linux VM.)

Getting the source
~~~~~~~~~~~~~~~~~~~

Clone the repository with all submodules (MicroPython, CMSIS, vendor drivers,
etc.)::

    git clone --recursive https://github.com/openmv/openmv.git
    cd openmv

A full recursive clone is large. For a faster, shallow clone::

    git clone --depth=1 https://github.com/openmv/openmv.git
    cd openmv
    git submodule update --init --depth=1 --no-single-branch
    git -C lib/micropython/ submodule update --init --depth=1

.. note::

   When building a specific board you can instead let ``make`` pull just
   that board's submodules::

       make TARGET=<board> submodules

   The explicit ``git submodule update`` shown above already covers
   everything, so this step is optional.

Installing the OpenMV SDK
~~~~~~~~~~~~~~~~~~~~~~~~~~

From the repository root, run the one-time SDK install::

    make sdk

This downloads ``openmv-sdk-<version>-<os>-<arch>.tar.xz`` from
``download.openmv.io``, verifies its SHA-256 checksum, and extracts it to
``~/openmv-sdk-<version>/`` (the version is pinned by the repo's
``SDK_VERSION`` file). It is idempotent -- re-running it does nothing if the
correct version is already installed, and the regular build aborts with
*"OpenMV SDK not found. Run 'make sdk' to install it."* if it is missing or
the wrong version.

The SDK bundles everything the build and debugger need, all added to ``PATH``
automatically by the Makefile:

.. list-table::
   :header-rows: 1
   :widths: 30 70

   * - Component
     - Purpose
   * - ARM GNU toolchain (``arm-none-eabi-gcc`` 14.3)
     - Compiler, linker, ``arm-none-eabi-gdb`` for debugging
   * - LLVM/clang
     - Used for selected objects on some ports (e.g. Alif)
   * - CMake, GNU Make
     - Build orchestration for vendor libraries
   * - Python (relocatable)
     - Build scripts, ``mpy-cross`` helpers, signing, model tools
   * - STM32CubeProgrammer (``STM32_Programmer_CLI``)
     - SWD flashing and the STM32N6 recovery flow
   * - ST Edge AI
     - Neural-network compiler for the STM32N6 NPU
   * - ``dfu-util``
     - USB DFU flashing
   * - ``gdbrunner`` + ``JLinkGDBServer``
     - The ``make debug`` target's GDB server launcher

.. warning::

   The OpenMV N6 and OpenMV AE3 use Cortex-M55 cores and require **GCC 14.3
   or newer**. The build enforces this for those targets and aborts with an
   *"Upgrade to GCC 14.3+ for proper CM55 support"* error if an older
   ``arm-none-eabi-gcc`` is found ahead of the SDK's on ``PATH``. The bundled
   SDK toolchain already satisfies this; the error means a different,
   older toolchain is shadowing it.

Compiling the firmware
----------------------

Two ``make`` invocations build a board. First build **mpy-cross**, the host
tool that compiles the frozen ``.py`` modules into bytecode (do this once,
and again whenever you switch boards or update MicroPython)::

    make -j$(nproc) -C lib/micropython/mpy-cross

Then build the firmware for a board, where ``<TARGET>`` is one of the names
from the table below::

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

``TARGET`` values are the directory names under ``boards/``. The cameras and
their silicon:

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

Builds are isolated per board under ``build/<TARGET>/``. To wipe one board's
build::

    make TARGET=<TARGET> clean

There is no ``distclean``; ``clean`` always needs a ``TARGET``. ``mpy-cross``
is shared across boards -- if you switch targets or update MicroPython,
rebuild it too::

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
       debug info) and disables MicroPython ROM-text compression -- this is
       the build you debug. ``DEBUG=0`` compiles with ``-O2 -DNDEBUG``
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
       `Debugging the firmware`_).
   * - ``PROFILE_ENABLE``
     - ``0``
     - ``PROFILE_ENABLE=1`` builds with function-call instrumentation
       (``-finstrument-functions``, ``-DOMV_PROFILER_ENABLE=1``) so you can
       profile where time is spent. ``PROFILE_HASH=<N>`` sets the profiler
       hash-table size (power of two; default 256) and ``PROFILE_IRQ=1``
       also profiles code running in interrupt context.
   * - ``STACK_PROTECTOR``
     - ``0``
     - ``STACK_PROTECTOR=1`` adds ``-fstack-protector-all`` -- stack
       canaries that trap stack-buffer overflows. Useful when chasing memory
       corruption.
   * - ``FB_ALLOC_STATS``
     - ``0``
     - ``FB_ALLOC_STATS=1`` instruments the frame-buffer allocator so you can
       see vision-buffer allocation behavior. Useful for out-of-memory
       debugging in the image pipeline.
   * - ``DEBUGGER``
     - ``JLINK``
     - Which debugger the ``make debug`` / ``make deploy`` targets use.
       ``JLINK`` is the default; ``NONE`` disables the ``debug`` target.

.. note::

   Many more variables exist (camera/sensor drivers, wireless stacks, ML
   backends, USB stack, secure boot, etc.), but those are set per-board in
   ``boards/<TARGET>/board_config.mk`` and are not normally overridden on the
   command line. Changing them is board customization, not a normal
   developer build -- see `docs/boards.md
   <https://github.com/openmv/openmv/blob/master/docs/boards.md>`__ in the
   firmware repository.

For everyday work the only options you need are ``TARGET`` (always),
``DEBUG=1`` (whenever you intend to debug, see below), and occasionally
``V=1``.

.. _firmware_debugging:

Debugging the firmware
----------------------

On-hardware debugging means halting the processor, setting breakpoints in the
C source, single-stepping, and inspecting variables, memory, registers, and
peripherals -- from inside VS Code. This needs three things: a **debug
build**, a **SWD debug probe** (a Segger J-Link), and the **Cortex-Debug**
extension driving ``arm-none-eabi-gdb`` against a J-Link GDB server.

Build for debugging
~~~~~~~~~~~~~~~~~~~~

Always rebuild the target with ``DEBUG=1``::

    make -j$(nproc) TARGET=<TARGET> DEBUG=1

A release (``DEBUG=0``) image is compiled ``-O2``; in the debugger you will
see ``<optimized out>`` for many variables, inlined functions collapse into
their callers, and stepping jumps around unpredictably. ``DEBUG=1`` builds
``-Og -ggdb3``, which is debuggable while still booting on the camera. The
ELF you point the debugger at is::

    build/<TARGET>/bin/firmware.elf

(For the Alif AE3, debug ``build/OPENMV_AE3/bin/firmware_M55_HP.elf`` -- the
high-performance core.)

The hardware: J-Link over SWD
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Connect a Segger J-Link to the camera's **SWD** pins (SWDIO, SWCLK, GND, and
target VCC for reference; the camera is powered over USB as usual). A J-Link
EDU/Base/Pro all work. The SWD pads/header location differs per camera --
check that board's pinout diagram and schematic in the OpenMV hardware
documentation for which pins to wire (some boards expose SWD on the I/O
header, others on dedicated test pads). Install the **J-Link Software and
Documentation Pack** from `segger.com
<https://www.segger.com/downloads/jlink/>`__ on the machine the probe is
physically plugged into. Keep it reasonably current -- older J-Link software
will not know the newer device names (STM32N6, MIMXRT, Alif).

Each MCU needs its exact J-Link **device name** so the probe loads the right
flash loader and memory map:

.. list-table::
   :header-rows: 1
   :widths: 34 26 40

   * - Camera (``TARGET``)
     - MCU
     - J-Link ``device``
   * - ``OPENMV4`` / ``OPENMV4P`` / ``OPENMVPT``
     - STM32H743
     - ``STM32H743VI``
   * - ``OPENMV3``
     - STM32F765
     - ``STM32F765VI``
   * - ``OPENMV_N6``
     - STM32N657
     - ``STM32N657L0``
   * - ``OPENMV_RT1060``
     - MIMXRT1062
     - ``MIMXRT1062xxx6A``
   * - ``OPENMV_AE3``
     - Alif Ensemble (M55-HP)
     - ``AE302F80F55D5_HP``
   * - ``ARDUINO_PORTENTA_H7`` / ``ARDUINO_GIGA`` / ``ARDUINO_NICLA_VISION``
     - STM32H747
     - ``STM32H747XI``

.. note::

   The STM32N6, MIMXRT1062, and Alif AE3 boot from **external** flash. A
   J-Link *flash-load* of those needs the correct external loader, which is
   less straightforward; it is usually easier to **attach** to the
   already-running firmware (``"request": "attach"`` below) than to have the
   debugger program flash.
   The STM32H7 cameras (H7/H7 Plus/Pure Thermal) have internal flash and
   ``launch`` works directly.

VS Code Cortex-Debug setup
~~~~~~~~~~~~~~~~~~~~~~~~~~~

Create ``.vscode/launch.json`` in the repository. The simplest case -- VS
Code, the J-Link, and the build are all on the **same** Linux/macOS machine
-- uses ``servertype: "jlink"``, which makes Cortex-Debug start a J-Link GDB
server itself::

    {
      "version": "0.2.0",
      "configurations": [
        {
          "name": "OpenMV J-Link",
          "type": "cortex-debug",
          "request": "launch",
          "cwd": "${workspaceFolder}",
          "executable": "${workspaceFolder}/build/OPENMV4/bin/firmware.elf",
          "servertype": "jlink",
          "device": "STM32H743VI",
          "interface": "swd",
          "runToEntryPoint": "main",
          "armToolchainPath": "${env:HOME}/openmv-sdk-1.6.0/gcc/bin",
          "gdbPath": "${env:HOME}/openmv-sdk-1.6.0/gcc/bin/arm-none-eabi-gdb"
        }
      ]
    }

Change ``executable`` and ``device`` for your board (see the table above).
Press :kbd:`F5` to build-flash-and-run to ``main`` and stop there.

.. tip::

   To rebuild automatically every time you start debugging, add a build task
   to ``.vscode/tasks.json`` and reference it from the launch config with
   ``"preLaunchTask"``. For example a task running ``make -j$(nproc)
   TARGET=OPENMV4 DEBUG=1``, named ``"build-firmware"``, plus
   ``"preLaunchTask": "build-firmware"`` in the configuration above, so that
   :kbd:`F5` rebuilds, flashes, and starts the debugger in a single step.

.. warning::

   Cortex-Debug needs ``arm-none-eabi-gdb``. It ships in the SDK at
   ``~/openmv-sdk-<version>/gcc/bin`` but is **not** on ``PATH`` by default,
   so debugging fails with *"GDB executable 'arm-none-eabi-gdb' was not
   found"*. Fix it either by setting ``armToolchainPath`` / ``gdbPath`` as
   shown above, or by adding ``~/openmv-sdk-<version>/gcc/bin`` to your
   ``PATH`` (``printenv PATH`` should then list it).

Peripheral register view (SVD)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Point Cortex-Debug at a CMSIS **SVD** file to get a decoded
peripheral-register view (timers, DMA, the camera interface, etc.) by name
and bitfield::

    "svdFile": "/path/to/STM32H743.svd"

For STM32 and MIMXRT, get the SVD from the ST/NXP CMSIS packs or the
Cortex-Debug SVD registry. The Alif SVDs are vendored in the firmware repo at
``lib/micropython/lib/alif_ensemble-cmsis-dfp/Debug/SVD/`` (use the
``..._CM55_HP_View.svd`` for the AE3 HP core).

.. _firmware_debugging_wsl:

Windows: the WSL ↔ Windows J-Link bridge
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

WSL 2 cannot see the J-Link's USB device directly, so the split is: the
**J-Link GDB server runs on Windows** (where the probe is plugged in) and
**VS Code + gdb run in WSL** and connect to it over TCP.

#. **On Windows**, install the Segger J-Link pack and plug the J-Link into a
   Windows USB port.

#. **On Windows**, start the J-Link GDB server, using your board's device
   name from the table above::

       "C:\Program Files\SEGGER\JLink\JLinkGDBServerCL.exe" -select USB -device STM32H743VI -endian little -if SWD -speed 4000 -port 2331

   Allow it through the Windows firewall when prompted (inbound TCP 2331).
   The server window **displays the IP address** it is listening on -- note
   it.

#. **In WSL**, build ``DEBUG=1`` and make sure ``arm-none-eabi-gdb`` is
   reachable (set ``armToolchainPath`` as above).

#. **In WSL VS Code**, use a ``launch.json`` that connects to the
   already-running server instead of starting one. Either keep
   ``servertype: "jlink"`` and add ``serverpath`` + ``ipAddress``::

       {
         "name": "OpenMV J-Link (Windows host)",
         "type": "cortex-debug",
         "request": "launch",
         "cwd": "${workspaceFolder}",
         "executable": "${workspaceFolder}/build/OPENMV4/bin/firmware.elf",
         "servertype": "jlink",
         "serverpath": "/opt/SEGGER/JLink/JLinkGDBServer",
         "ipAddress": "192.168.x.x",
         "device": "STM32H743VI",
         "interface": "swd",
         "runToEntryPoint": "main",
         "armToolchainPath": "${env:HOME}/openmv-sdk-1.6.0/gcc/bin"
       }

   Set ``ipAddress`` to whatever the Windows J-Link server window shows. Or
   use the cleaner ``external`` form, which starts no server and just points
   gdb at the bridge::

       {
         "name": "OpenMV J-Link (external)",
         "type": "cortex-debug",
         "request": "attach",
         "cwd": "${workspaceFolder}",
         "executable": "${workspaceFolder}/build/OPENMV4/bin/firmware.elf",
         "servertype": "external",
         "gdbTarget": "host.docker.internal:2331",
         "armToolchainPath": "${env:HOME}/openmv-sdk-1.6.0/gcc/bin",
         "gdbPath": "${env:HOME}/openmv-sdk-1.6.0/gcc/bin/arm-none-eabi-gdb"
       }

   Point the config at the Windows host (see below) on the port the server
   uses (``2331`` by default). Windows Firewall must allow inbound TCP on
   that port for ``JLinkGDBServerCL.exe``.

Reaching the Windows host from WSL depends on the WSL networking mode:

* **NAT mode (the default).** The Windows host is the WSL virtual network's
  gateway. Get its address in WSL with ``ip route show default`` and use that
  as the ``ipAddress`` / ``gdbTarget`` host; the LAN IP the J-Link server
  window prints also works if both ends share a network.
  ``host.docker.internal`` resolves to the Windows host **only if Docker
  Desktop's WSL integration is installed** -- do not rely on it otherwise.
* **Mirrored mode** (``networkingMode=mirrored`` in
  ``%UserProfile%\.wslconfig`` on recent Windows builds). WSL shares the
  Windows network stack, so the J-Link server is reachable as plain
  ``localhost`` and no IP discovery is needed.

.. tip::

   **Alternative to the GDB-server bridge: usbipd-win.** Instead of running a
   server on Windows you can attach the J-Link's USB device straight into
   WSL with `usbipd-win <https://github.com/dorssel/usbipd-win>`__. From an
   administrator PowerShell::

       winget install usbipd
       usbipd list
       usbipd bind --busid <busid>
       usbipd attach --wsl --busid <busid>

   (``<busid>`` is the J-Link's bus ID from ``usbipd list``.) The probe then
   appears *inside* WSL, and you use the plain same-machine ``servertype:
   "jlink"`` configuration from `VS Code Cortex-Debug setup`_ with no IP
   address and no separate Windows server. The GDB-server bridge requires
   less setup for occasional use; usbipd-win is more convenient for routine
   development.

.. tip::

   Use ``"request": "attach"`` to debug the firmware *as it is already
   running* without resetting or reflashing it -- ideal for catching a hang
   in the field, and the reliable choice for the external-flash boards
   (N6/RT1062/AE3). Use ``"request": "launch"`` to reset, flash the ELF, and
   start fresh at ``runToEntryPoint``.

The ``make debug`` shortcut
~~~~~~~~~~~~~~~~~~~~~~~~~~~

If the J-Link is on the same machine as the build, the repository has a
shortcut that starts a GDB server with the right device automatically::

    make -j$(nproc) TARGET=<TARGET> DEBUG=1 debug

This runs the SDK's ``gdbrunner`` with the board's J-Link arguments against
``build/<TARGET>/bin/firmware.elf``. It is convenient for command-line gdb;
for source-level stepping, the VS Code Cortex-Debug setup above is what you
want.

Using the debugger
~~~~~~~~~~~~~~~~~~~

Once a session is running (the processor halted at ``main``):

* **Breakpoints** -- click the gutter next to a C line, or in the Debug
  Console ``break <file>:<line>`` / ``break <function>``. Cortex-M cores have
  a small number of *hardware* breakpoint comparators (typically 6--8 on
  M7/H7, 8 on M55). Exceeding that on code in flash silently fails -- keep
  the active breakpoint count modest.

* **Stepping** -- :kbd:`F10` step over (``next``), :kbd:`F11` step into
  (``step``), :kbd:`Shift+F11` step out (``finish``), :kbd:`F5` continue.
  Instruction-level stepping is ``stepi`` / ``nexti`` in the Debug Console.

* **Variables / watch / call stack** -- the *Variables* and *Call Stack*
  panes show locals and the backtrace; add expressions to *Watch*. Hover a
  variable in the source to see its value. Anything showing ``<optimized
  out>`` means you are not on a ``DEBUG=1`` build.

* **Watchpoints (data breakpoints)** -- ``watch <expr>`` halts when a
  variable is written, ``rwatch`` on read, ``awatch`` on either. The
  Cortex-M DWT unit supports ~4 hardware watchpoints -- invaluable for
  catching *who* corrupted a variable.

* **Registers and peripherals** -- the *Cortex Registers* view shows core
  registers; with ``svdFile`` set, the *Peripherals* view decodes every
  peripheral register and bitfield (DMA, timers, the camera/CSI interface,
  XSPI, etc.) -- the fastest way to see why a driver is misbehaving.

* **Memory** -- use the Cortex-Debug memory viewer or gdb ``x/`` to inspect
  framebuffers, DMA buffers, and structures directly.

* **printf without halting (SWO/RTT)** -- for timing-sensitive issues,
  Segger **RTT** or **SWO** gives near-zero-overhead ``printf`` while the
  target runs. Build with ``DEBUG_PRINTF=1`` and add Cortex-Debug's
  ``rttConfig`` (RTT) or ``swoConfig`` (SWO, needs the core clock). This is
  the right tool when a breakpoint would change the timing you are trying to
  observe.

* **Disconnecting** -- *Stop* on a ``launch``/``jlink`` session halts the
  target; *Disconnect* on an ``attach``/``external`` session leaves the
  camera running. Power-cycle the camera to return it to normal operation
  afterwards.

OpenOCD alternative (ST-Link)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

If you have an ST-Link instead of a J-Link, the STM32 cameras can be debugged
with OpenOCD. The firmware repository ships OpenOCD configs under
``lib/micropython/ports/stm32/boards/``:

.. list-table::
   :header-rows: 1
   :widths: 38 62

   * - OpenOCD config
     - Cameras
   * - ``openocd_stm32h7_dual_bank.cfg``
     - STM32H7 -- OpenMV Cam H7, H7 Plus, Pure Thermal; Arduino Portenta
       H7, Giga, Nicla Vision
   * - ``openocd_stm32f7.cfg``
     - STM32F7 -- OpenMV Cam M7

Use ``servertype: "openocd"`` with ``configFiles`` pointing at the
appropriate ``.cfg``. There are no in-repo OpenOCD configs for the N6,
RT1062, or AE3 -- use J-Link for those.

Debugging pitfalls
~~~~~~~~~~~~~~~~~~~

* **Everything is ``<optimized out>``** -- you built ``DEBUG=0``. Rebuild
  with ``DEBUG=1``.
* **"GDB executable not found"** -- the SDK ``gcc/bin`` is not on ``PATH``;
  set ``armToolchainPath``/``gdbPath``.
* **"Cannot connect" / wrong memory map** -- wrong or missing ``device``
  name; use the exact string from the table.
* **Breakpoints silently not hit** -- too many hardware breakpoints on
  flash-resident code; reduce them.
* **N6 / RT1062 / AE3 won't flash from the debugger** -- they boot from
  external flash; use ``"request": "attach"`` against running firmware
  instead of ``launch``.
* **Source paths don't match (Docker-built ELF)** -- build with the Docker
  ``build-firmware-dev`` target (same absolute path inside and outside the
  container) or set gdb ``set substitute-path``.

Flashing the firmware
---------------------

Once you have a ``firmware.bin`` (and its ``romfs<n>.img``), program it onto
the camera. OpenMV IDE is the recommended method; the command-line procedure
differs by camera family and is documented per family below. The bootloader
itself is restored separately -- see `Restoring the bootloader`_.

OpenMV IDE: Load Custom Firmware (recommended)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

OpenMV IDE bundles every flashing tool (``dfu-util``, the NXP SPSDK tools,
the Alif SE Tools, the STM32 tools), installs the required USB drivers on
Windows, handles entering the bootloader, and selects the correct command
for the connected camera. It is the recommended way to flash a custom build.

#. Connect the camera over USB (you do not need to click *Connect*).

#. **Tools -> Load Custom Firmware**.

#. In the dialog, set **Firmware Path** to your build's
   ``build/<TARGET>/bin/firmware.bin``.

#. Optionally tick **Erase internal file system** to wipe the camera's
   internal FAT filesystem (not an SD card) -- useful when a bad ``main.py``
   or corrupted FS prevents normal boot.

#. Optionally tick **Reset ROMFS file system** to reflash the default ROMFS
   (disabled if you selected a ``.img`` directly).

#. Click **Run**. The IDE resets the camera into its bootloader, shows the
   exact flashing command and a progress bar, and reboots the camera into the
   new firmware. Wait for the blue self-test LED; the camera then
   re-enumerates normally.

There is also **Tools -> Force enter OpenMV Cam bootloader** to place the
camera in DFU mode manually before flashing.

Windows: install the USB drivers
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Windows has no built-in driver for the camera's USB DFU, SDP, and ISP
interfaces, so the command-line tools (``dfu-util``, the NXP SPSDK tools,
the Alif SE Tools) cannot detect the device until a WinUSB driver is bound
to it. OpenMV IDE's Windows installer installs all of these drivers, so the
simplest approach is to install OpenMV IDE once -- after which both the IDE
and the command-line tools work. This is why GUI flashing succeeds on a
fresh Windows machine while a standalone ``dfu-util`` does not.

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
``pnputil``. No command-line flashing on Windows works without this. Linux
and macOS need no driver installation (Linux requires only the udev rules
noted below).

Flashing over SWD (``make deploy``)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

If a debug probe is already wired to the camera -- as it is for debugging --
the fastest edit-build-flash cycle bypasses USB DFU and programs the chip
directly over SWD. On the STM32 cameras::

    make -j$(nproc) TARGET=<TARGET> deploy

This flashes the freshly built firmware via ``STM32_Programmer_CLI`` (from
the SDK) over the connected probe. There is no bootloader entry, no USB
re-enumeration, and no cable swapping: build, run ``deploy``, and the camera
restarts running the new code. This is the recommended workflow during
active firmware development. Use DFU or OpenMV IDE when flashing without a
probe or when distributing firmware to others.

Entering bootloader / DFU mode
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Flashing requires the camera to be in its bootloader/DFU mode. There are
three ways in:

* **Software reset (normal).** OpenMV IDE (or a ``mpremote``/serial reset)
  tells running firmware to reboot into the bootloader. This is automatic
  during *Load Custom Firmware* and is all you normally need.
* **BOOT--RST jumper (recovery).** If the firmware is too damaged to accept
  a software reset, disconnect the camera, jumper the **BOOT** and **RST**
  pins, and reconnect; it enumerates as the ST system DFU device. This is
  the recovery path, covered in detail under `Restoring the bootloader`_.
* **Arduino touch-reset.** Arduino boards enter DFU via a 1200-baud
  touch/double-tap reset; OpenMV IDE handles this automatically for those
  targets.

STM32 cameras: dfu-util
~~~~~~~~~~~~~~~~~~~~~~~

For scripted or CI flashing of the STM32 OpenMV cameras, use ``dfu-util``
directly. It is included in the OpenMV SDK and in OpenMV IDE's tool
directory. On Linux, non-root access to the DFU device requires udev rules:
install OpenMV IDE (which installs them), or copy its ``99-openmv*.rules``
files from ``share/qtcreator/pydfu/`` into ``/etc/udev/rules.d/`` and run
``sudo udevadm control --reload-rules && sudo udevadm trigger``. Otherwise
run ``dfu-util`` with ``sudo``.

These cameras use the ``openmv_dfu`` bootloader and are flashed *by DFU alt
setting* (``-a N``), not by absolute address -- the bootloader maps each alt
to the correct flash region. ``-w`` makes ``dfu-util`` wait for the device
to appear; ``--reset`` on the final transfer reboots the camera into the new
firmware.

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

OpenMV AE3: dfu-util
~~~~~~~~~~~~~~~~~~~~

The OpenMV AE3 uses the ``openmv_dfu`` bootloader (application VID:PID
``37C5:16E3``, DFU VID:PID ``37C5:96E3``), but it is a **dual-core** device:
an Alif Ensemble with a high-performance (HP) and a high-efficiency (HE)
Cortex-M55 core. Each core runs its own firmware image and has its own
read-only ROMFS, so a full flash is four images, plus a fifth DFU alt that
erases the shared internal FAT filesystem. The complete DFU alt-setting map:

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

A full flash writes the four images, with ``--reset`` only on the final
transfer::

    dfu-util -w -d ,37C5:96E3 -a 1 -D firmware_M55_HP.bin
    dfu-util -w -d ,37C5:96E3 -a 2 -D firmware_M55_HE.bin
    dfu-util -w -d ,37C5:96E3 -a 3 -D romfs1.img
    dfu-util -w -d ,37C5:96E3 -a 6 --reset -D romfs0.img

To replace just one core's firmware, flash only that core's alt (``-a 1``
for HP, ``-a 2`` for HE); to replace one core's ROMFS, flash that core's
ROMFS alt (``-a 6`` for HP / ``romfs0``, ``-a 3`` for HE / ``romfs1``). The
writable internal FAT filesystem is shared by both cores and is wiped once
via ``-a 5`` (see `Erasing the internal filesystem`_). The AE3's bootloader
is restored by a different procedure -- see `Restoring the bootloader`_.

OpenMV Cam RT1062: NXP SPSDK
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The OpenMV Cam RT1062 is the only camera **without** a USB DFU bootloader.
It boots from external flash through an on-flash secure bootloader (SBL)
that presents the NXP MCU-bootloader USB interface. Flashing uses the NXP
**SPSDK** tools ``blhost`` and ``sdphost``, which the OpenMV SDK and OpenMV
IDE bundle and invoke as ``python -m spsdk.apps.blhost`` / ``python -m
spsdk.apps.sdphost``. Because the commands and addresses are intricate,
*Load Custom Firmware* in OpenMV IDE is the preferred method for the RT1062;
the sequence below is for automation or for understanding what the IDE does.

For a normal firmware update the SBL is already present, so no jumper is
needed -- a reset leaves the camera enumerated as the SBL device (``blhost``
VID:PID ``0x15A2:0x0073``). The firmware-only sequence is::

    blhost -u 0x15A2,0x0073 -t 120000 -- flash-erase-region 0x60040000 <firmware_size>
    blhost -u 0x15A2,0x0073 -- write-memory 0x60040000 firmware.bin
    blhost -u 0x15A2,0x0073 -- reset

``<firmware_size>`` is the byte size of ``firmware.bin``. To also reset the
ROMFS, run these before the firmware steps::

    blhost -u 0x15A2,0x0073 -t 120000 -- flash-erase-region 0x60800000 0x00800000
    blhost -u 0x15A2,0x0073 -- write-memory 0x60800000 romfs0.img

The RT1062 16 MiB external-flash map (``0x60000000``--``0x61000000``, from
OpenMV IDE's configuration):

.. list-table::
   :header-rows: 1
   :widths: 30 18 16 36

   * - Region
     - Address
     - Size (hex)
     - Size (bytes)
   * - Flash configuration block (FCB)
     - ``0x60000000``
     - ``0x1000``
     - 4,096 (4 KiB)
   * - Secure bootloader (SBL)
     - ``0x60001000``
     - ``0x3F000``
     - 258,048 (252 KiB)
   * - Firmware
     - ``0x60040000``
     - ``0x3C0000``
     - 3,932,160 (3.75 MiB)
   * - FAT disk (internal filesystem)
     - ``0x60400000``
     - ``0x400000``
     - 4,194,304 (4 MiB)
   * - ROMFS
     - ``0x60800000``
     - ``0x800000``
     - 8,388,608 (8 MiB)

The FCB, FAT disk, and ROMFS sizes are fixed in the IDE configuration. The
SBL and firmware sizes shown are the region span to the next region's base
address (the start addresses are fixed; the actual image is smaller).

Recreating the SBL itself (a damaged RT1062) is a longer, jumper-based
procedure -- see `Restoring the bootloader`_.

Arduino boards: dfu-util
~~~~~~~~~~~~~~~~~~~~~~~~

The STM32-based Arduino boards (Portenta H7, Giga, Nicla Vision) are flashed
with ``dfu-util`` using **absolute flash addresses** through the Arduino DFU
bootloader. The board enters DFU when its serial port is opened at 1200 baud
(a "touch" / double-tap reset); OpenMV IDE performs this automatically.

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

Wi-Fi and Bluetooth need two additional blobs shipped with OpenMV IDE in
``share/qtcreator/firmware/CYW4343/``:

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

The two Arduino Nano boards do not use ``dfu-util`` and are flashed with
their own bundled tools.

**Arduino Nano 33 BLE Sense** (nRF52840). Double-tap the **RESET** button;
the board enters its bootloader and enumerates as the nRF52840 DFU device
(``2341:805a``). OpenMV IDE flashes it with the bundled ``bossac``, writing
the application at flash offset ``0x16000`` -- above the factory SoftDevice
and bootloader, which are never written. The equivalent manual command
(OpenMV IDE supplies the serial port) is::

    bossac -e -w -v -R --offset=0x16000 firmware.bin

**Arduino Nano RP2040 Connect** (RP2040). Hold the **BOOTSEL** button while
connecting USB; the board mounts a USB mass-storage drive named ``RPI-RP2``.
Flash it either by copying a ``.uf2`` file onto that drive, or with the
bundled ``picotool``::

    picotool load -x firmware.uf2

OpenMV IDE triggers the reset and runs ``picotool`` automatically. Neither
board's bootloader is user-writable (see the warning below).

.. warning::

   The Arduino boards' bootloaders are factory-locked and **cannot** be
   restored by the user or by OpenMV IDE -- only the application region is
   ever written. A damaged Arduino bootloader must be recovered with
   Arduino's own tooling. The bootloader-restore procedures below apply to
   the OpenMV-branded cameras only.

Erasing the internal filesystem
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Every camera has a small writable FAT filesystem (where ``main.py`` and
user files live, separate from any SD card). Erasing it is the fix when a
bad ``main.py`` or a corrupted filesystem prevents the camera from booting.
In OpenMV IDE this is the **Erase internal file system** checkbox in *Load
Custom Firmware*; the command-line equivalent differs by camera family.

For the ``openmv_dfu`` cameras, the bootloader exposes a dedicated **erase
DFU alt**. Write a small zero-filled file to it (a 4 KB block of zeros is
plenty -- it clears the filesystem header so the camera reformats on the
next boot) with ``--reset``::

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

The **OpenMV AE3** has a single writable FAT filesystem shared by both
Cortex-M55 cores, erased once via ``-a 5``. There is no separate per-core
filesystem erase; to replace a core's *read-only ROMFS* instead, re-flash
that core's ROMFS image (``-a 6`` for the HP core / ``romfs0``, ``-a 3`` for
the HE core / ``romfs1`` -- see `OpenMV AE3: dfu-util`_).

The **OpenMV Cam RT1062** has no DFU bootloader; erase its FAT disk's master
boot record (at ``0x60400000``) with the SPSDK flashloader, which forces a
reformat on the next boot::

    blhost -u 0x15A2,0x0073 -t 120000 -- flash-erase-region 0x60400000 0x1000

The **STM32 Arduino boards** (Portenta H7, Giga, Nicla Vision) erase by
absolute address rather than an alt::

    dd if=/dev/zero of=erase.bin bs=4096 count=1
    dfu-util -w -d ,<DFU VID:PID> -a 0 -s 0x08020000 -D erase.bin
    dfu-util -w -d ,<DFU VID:PID> -a 1 -s 0x90000000 --reset -D erase.bin

Restoring the bootloader
------------------------

A normal firmware flash never touches the bootloader, so an *interrupted
firmware* update is almost always recoverable: re-run the same flashing
command (``dfu-util -w`` waits for the device) or re-run *Load Custom
Firmware* while the camera is still in its bootloader. This section covers
the rarer case where the **bootloader itself** is damaged and the camera no
longer enumerates as a DFU device on reset.

The bootloader lives in a separate flash region from the firmware and
filesystem, and every OpenMV-branded camera has a hardware path back, so a
camera is difficult to render permanently unrecoverable. The Arduino boards
are the only exception -- their bootloaders are fixed and not user-restorable
(see the warning above).

STM32 cameras (BOOT--RST jumper)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

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
#. Flash the firmware normally.

OpenMV Cam N6
~~~~~~~~~~~~~

The N6 is recovered with STM32CubeProgrammer (included in the OpenMV SDK)
using a flash-layout descriptor that rewrites the first-stage bootloader,
the external-flash loader, and the bootloader::

    STM32_Programmer_CLI -c port=USB1 -d OPENMV_N6/FlashLayout.tsv

OpenMV IDE performs this automatically when it detects a damaged N6.

OpenMV Cam RT1062
~~~~~~~~~~~~~~~~~

Recreating the RT1062 secure bootloader requires entering the chip's ROM
serial-download (SDP) mode with a jumper, staging a RAM flashloader, then
rewriting the flash configuration block, the SBL, and the firmware. This is
involved and OpenMV IDE automates it; using the IDE is strongly recommended.
The manual sequence:

#. Disconnect the camera, jumper the **SBL** and **3.3V** pins, and
   reconnect. The chip enumerates in SDP ROM mode (``0x1FC9:0x0135``).

#. Stage and start the RAM flashloader::

       sdphost -u 0x1FC9,0x0135 -- write-file 0x20001C00 sdphost_flash_loader.bin
       sdphost -u 0x1FC9,0x0135 -- jump-address 0x20001C00

#. The camera now answers as the flashloader (``0x15A2:0x0073``). Configure
   the external flash, write the flash configuration block, then write the
   SBL::

       blhost -u 0x15A2,0x0073 -- fill-memory 0x2000 4 0xC0000008 word
       blhost -u 0x15A2,0x0073 -- configure-memory 9 0x2000
       blhost -u 0x15A2,0x0073 -t 120000 -- flash-erase-region 0x60000000 0x1000
       blhost -u 0x15A2,0x0073 -- fill-memory 0x2000 4 0xF000000F word
       blhost -u 0x15A2,0x0073 -- configure-memory 9 0x2000
       blhost -u 0x15A2,0x0073 -t 120000 -- flash-erase-region 0x60001000 <sbl_size>
       blhost -u 0x15A2,0x0073 -- write-memory 0x60001000 blhost_flash_loader.bin

#. Write the firmware and set the boot-source fuse so the chip boots the new
   SBL from external flash::

       blhost -u 0x15A2,0x0073 -t 120000 -- flash-erase-region 0x60040000 <firmware_size>
       blhost -u 0x15A2,0x0073 -- write-memory 0x60040000 firmware.bin
       blhost -u 0x15A2,0x0073 -- efuse-program-once 0x06 00000010
       blhost -u 0x15A2,0x0073 -- reset

#. Remove the jumper and power-cycle the camera.

.. warning::

   ``efuse-program-once 0x06 00000010`` is a **one-time, irreversible** fuse
   write that sets the device to boot from external flash. This is another
   reason to let OpenMV IDE perform RT1062 bootloader recovery rather than
   running the sequence by hand.

OpenMV AE3
~~~~~~~~~~

The AE3's secure bootloader is **not** restored over USB DFU. It is rewritten
into the chip's MRAM with **Alif Semiconductor's SE Tools** (bundled with
OpenMV IDE) over a serial ISP connection. This is an interactive,
recovery-only procedure -- not a routine flashing method -- and is
error-prone by hand; **use OpenMV IDE**, which drives the SE Tools and
prompts you through the hardware steps. The detail below documents what it
does.

**Connection.** The SE Tools talk to the AE3 over its debug adapter's serial
ISP port -- an FTDI ``0403:6015`` or a CH340 ``1A86:55D3`` interface,
together with a J-Link. Recovery requires putting the device in
**hard-maintenance mode**: set the on-board hard-maintenance switch and press
the user button when prompted.

**SE Tools.** OpenMV IDE bundles these Alif executables (with the config
files ``isp_config_data.cfg`` -- the serial-port settings -- and
``global-cfg.db`` -- the device part/revision and the
``MRAM-BURNER {Interface: isp, Jtag-adapter: J-Link}`` settings):

.. list-table::
   :header-rows: 1
   :widths: 28 72

   * - Tool
     - Purpose
   * - ``maintenance``
     - Query the Secure Enclave (``maintenance -opt sesbanner`` reads its
       version) and place the device in hard-maintenance mode.
   * - ``updateSystemPackage``
     - Update the Secure Enclave system package when it is older than the
       version the firmware requires.
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

#. Connect the AE3's serial ISP adapter (FTDI/CH340) and the J-Link; the SE
   Tools write ``isp_config_data.cfg`` and ``global-cfg.db``.
#. ``maintenance -opt sesbanner`` reads the Secure Enclave version. If the
   device is in recovery or hard-maintenance is required, set the
   hard-maintenance switch and press the user button when prompted.
#. ``maintenance`` queries the boot state.
#. If the Secure Enclave system package is out of date, ``updateSystemPackage``
   updates it; power-cycle when prompted.
#. ``app-write-mram -i "bootloader.bin 0x80000000 firmware_pad.toc
   0x8057E000"`` writes the bootloader and TOC into MRAM.
#. The AE3 re-enumerates as the ``37C5:96E3`` DFU device. Run the normal
   four-image flash from `OpenMV AE3: dfu-util`_ to load the application.
#. Power-cycle the camera and turn the hard-maintenance switch back off.

See also
--------

* The firmware source: `github.com/openmv/openmv
  <https://github.com/openmv/openmv>`__. Build reference: `docs/firmware.md
  <https://github.com/openmv/openmv/blob/master/docs/firmware.md>`__.
  Per-board customization: `docs/boards.md
  <https://github.com/openmv/openmv/blob/master/docs/boards.md>`__.
* :ref:`tls_certificates` -- an example of working on the networking side of
  the firmware from the Python level.
