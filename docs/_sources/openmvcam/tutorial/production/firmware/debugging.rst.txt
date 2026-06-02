.. _firmware_debugging:

Debugging the firmware
======================

On-hardware debugging means halting the processor, setting breakpoints in
the C source, single-stepping, and inspecting variables, memory,
registers, and peripherals -- from inside VS Code. This needs three
things: a **debug build**, a **SWD debug probe** (a Segger J-Link), and
the **Cortex-Debug** extension driving ``arm-none-eabi-gdb`` against a
J-Link GDB server.

Build for debugging
-------------------

Always rebuild the target with ``DEBUG=1``::

    make -j$(nproc) TARGET=<TARGET> DEBUG=1

A release (``DEBUG=0``) image is compiled ``-O2``; in the debugger you
will see ``<optimized out>`` for many variables, inlined functions
collapse into their callers, and stepping jumps around unpredictably.
``DEBUG=1`` builds ``-Og -ggdb3``, which is debuggable while still
booting on the camera. The ELF you point the debugger at is::

    build/<TARGET>/bin/firmware.elf

(For the Alif AE3, debug ``build/OPENMV_AE3/bin/firmware_M55_HP.elf`` --
the high-performance core.)

The hardware: J-Link over SWD
-----------------------------

Connect a Segger J-Link to the camera's **SWD** pins (SWDIO, SWCLK, GND,
and target VCC for reference; the camera is powered over USB as usual).
A J-Link EDU / Base / Pro all work. The SWD pads / header location
differs per camera -- check that board's pinout diagram and schematic in
the OpenMV hardware documentation for which pins to wire (some boards
expose SWD on the I/O header, others on dedicated test pads). Install
the **J-Link Software and Documentation Pack** from `segger.com
<https://www.segger.com/downloads/jlink/>`__ on the machine the probe is
physically plugged into. Keep it reasonably current -- older J-Link
software will not know the newer device names (STM32N6, MIMXRT, Alif).

Each MCU needs its exact J-Link **device name** so the probe loads the
right flash loader and memory map:

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
   J-Link *flash-load* of those needs the correct external loader,
   which is less straightforward; it is usually easier to **attach** to
   the already-running firmware (``"request": "attach"`` below) than to
   have the debugger program flash. The STM32H7 cameras (H7 / H7 Plus /
   Pure Thermal) have internal flash and ``launch`` works directly.

VS Code Cortex-Debug setup
--------------------------

Create ``.vscode/launch.json`` in the repository. The simplest case --
VS Code, the J-Link, and the build are all on the **same** Linux / macOS
machine -- uses ``servertype: "jlink"``, which makes Cortex-Debug start
a J-Link GDB server itself::

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

Change ``executable`` and ``device`` for your board (see the table
above). Press :kbd:`F5` to build-flash-and-run to ``main`` and stop
there.

.. tip::

   To rebuild automatically every time you start debugging, add a build
   task to ``.vscode/tasks.json`` and reference it from the launch
   config with ``"preLaunchTask"``. For example a task running ``make
   -j$(nproc) TARGET=OPENMV4 DEBUG=1``, named ``"build-firmware"``,
   plus ``"preLaunchTask": "build-firmware"`` in the configuration
   above, so that :kbd:`F5` rebuilds, flashes, and starts the debugger
   in a single step.

.. warning::

   Cortex-Debug needs ``arm-none-eabi-gdb``. It ships in the SDK at
   ``~/openmv-sdk-<version>/gcc/bin`` but is **not** on ``PATH`` by
   default, so debugging fails with *"GDB executable
   'arm-none-eabi-gdb' was not found"*. Fix it either by setting
   ``armToolchainPath`` / ``gdbPath`` as shown above, or by adding
   ``~/openmv-sdk-<version>/gcc/bin`` to your ``PATH`` (``printenv
   PATH`` should then list it).

Peripheral register view (SVD)
------------------------------

Point Cortex-Debug at a CMSIS **SVD** file to get a decoded
peripheral-register view (timers, DMA, the camera interface, etc.) by
name and bitfield::

    "svdFile": "/path/to/STM32H743.svd"

For STM32 and MIMXRT, get the SVD from the ST / NXP CMSIS packs or the
Cortex-Debug SVD registry. The Alif SVDs are vendored in the firmware
repo at ``lib/micropython/lib/alif_ensemble-cmsis-dfp/Debug/SVD/`` (use
the ``..._CM55_HP_View.svd`` for the AE3 HP core).

.. _firmware_debugging_wsl:

Windows: the WSL ↔ Windows J-Link bridge
----------------------------------------

WSL 2 cannot see the J-Link's USB device directly, so the split is: the
**J-Link GDB server runs on Windows** (where the probe is plugged in)
and **VS Code + gdb run in WSL** and connect to it over TCP.

#. **On Windows**, install the Segger J-Link pack and plug the J-Link
   into a Windows USB port.

#. **On Windows**, start the J-Link GDB server, using your board's
   device name from the table above::

       "C:\Program Files\SEGGER\JLink\JLinkGDBServerCL.exe" -select USB -device STM32H743VI -endian little -if SWD -speed 4000 -port 2331

   Allow it through the Windows firewall when prompted (inbound TCP
   2331). The server window **displays the IP address** it is listening
   on -- note it.

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

   Set ``ipAddress`` to whatever the Windows J-Link server window
   shows. Or use the cleaner ``external`` form, which starts no server
   and just points gdb at the bridge::

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

   Point the config at the Windows host (see below) on the port the
   server uses (``2331`` by default). Windows Firewall must allow
   inbound TCP on that port for ``JLinkGDBServerCL.exe``.

Reaching the Windows host from WSL depends on the WSL networking mode:

* **NAT mode (the default).** The Windows host is the WSL virtual
  network's gateway. Get its address in WSL with ``ip route show
  default`` and use that as the ``ipAddress`` / ``gdbTarget`` host; the
  LAN IP the J-Link server window prints also works if both ends share
  a network. ``host.docker.internal`` resolves to the Windows host
  **only if Docker Desktop's WSL integration is installed** -- do not
  rely on it otherwise.
* **Mirrored mode** (``networkingMode=mirrored`` in
  ``%UserProfile%\.wslconfig`` on recent Windows builds). WSL shares
  the Windows network stack, so the J-Link server is reachable as plain
  ``localhost`` and no IP discovery is needed.

.. tip::

   **Alternative to the GDB-server bridge: usbipd-win.** Instead of
   running a server on Windows you can attach the J-Link's USB device
   straight into WSL with `usbipd-win
   <https://github.com/dorssel/usbipd-win>`__. From an administrator
   PowerShell::

       winget install usbipd
       usbipd list
       usbipd bind --busid <busid>
       usbipd attach --wsl --busid <busid>

   (``<busid>`` is the J-Link's bus ID from ``usbipd list``.) The probe
   then appears *inside* WSL, and you use the plain same-machine
   ``servertype: "jlink"`` configuration from `VS Code Cortex-Debug
   setup`_ with no IP address and no separate Windows server. The
   GDB-server bridge requires less setup for occasional use;
   usbipd-win is more convenient for routine development.

.. tip::

   Use ``"request": "attach"`` to debug the firmware *as it is already
   running* without resetting or reflashing it -- ideal for catching a
   hang in the field, and the reliable choice for the external-flash
   boards (N6 / RT1062 / AE3). Use ``"request": "launch"`` to reset,
   flash the ELF, and start fresh at ``runToEntryPoint``.

The ``make debug`` shortcut
---------------------------

If the J-Link is on the same machine as the build, the repository has
a shortcut that starts a GDB server with the right device automatically::

    make -j$(nproc) TARGET=<TARGET> DEBUG=1 debug

This runs the SDK's ``gdbrunner`` with the board's J-Link arguments
against ``build/<TARGET>/bin/firmware.elf``. It is convenient for
command-line gdb; for source-level stepping, the VS Code Cortex-Debug
setup above is what you want.

Using the debugger
------------------

Once a session is running (the processor halted at ``main``):

* **Breakpoints** -- click the gutter next to a C line, or in the Debug
  Console ``break <file>:<line>`` / ``break <function>``. Cortex-M
  cores have a small number of *hardware* breakpoint comparators
  (typically 6--8 on M7 / H7, 8 on M55). Exceeding that on code in
  flash silently fails -- keep the active breakpoint count modest.

* **Stepping** -- :kbd:`F10` step over (``next``), :kbd:`F11` step into
  (``step``), :kbd:`Shift+F11` step out (``finish``), :kbd:`F5`
  continue. Instruction-level stepping is ``stepi`` / ``nexti`` in the
  Debug Console.

* **Variables / watch / call stack** -- the *Variables* and *Call
  Stack* panes show locals and the backtrace; add expressions to
  *Watch*. Hover a variable in the source to see its value. Anything
  showing ``<optimized out>`` means you are not on a ``DEBUG=1`` build.

* **Watchpoints (data breakpoints)** -- ``watch <expr>`` halts when a
  variable is written, ``rwatch`` on read, ``awatch`` on either. The
  Cortex-M DWT unit supports ~4 hardware watchpoints -- invaluable for
  catching *who* corrupted a variable.

* **Registers and peripherals** -- the *Cortex Registers* view shows
  core registers; with ``svdFile`` set, the *Peripherals* view decodes
  every peripheral register and bitfield (DMA, timers, the camera /
  CSI interface, XSPI, etc.) -- the fastest way to see why a driver is
  misbehaving.

* **Memory** -- use the Cortex-Debug memory viewer or gdb ``x/`` to
  inspect framebuffers, DMA buffers, and structures directly.

* **printf without halting (SWO/RTT)** -- for timing-sensitive issues,
  Segger **RTT** or **SWO** gives near-zero-overhead ``printf`` while
  the target runs. Build with ``DEBUG_PRINTF=1`` and add Cortex-Debug's
  ``rttConfig`` (RTT) or ``swoConfig`` (SWO, needs the core clock).
  This is the right tool when a breakpoint would change the timing you
  are trying to observe.

* **Disconnecting** -- *Stop* on a ``launch`` / ``jlink`` session halts
  the target; *Disconnect* on an ``attach`` / ``external`` session
  leaves the camera running. Power-cycle the camera to return it to
  normal operation afterwards.

OpenOCD alternative (ST-Link)
-----------------------------

If you have an ST-Link instead of a J-Link, the STM32 cameras can be
debugged with OpenOCD. The firmware repository ships OpenOCD configs
under ``lib/micropython/ports/stm32/boards/``:

.. list-table::
   :header-rows: 1
   :widths: 38 62

   * - OpenOCD config
     - Cameras
   * - ``openocd_stm32h7_dual_bank.cfg``
     - STM32H7 -- OpenMV Cam H7, H7 Plus, Pure Thermal; Arduino
       Portenta H7, Giga, Nicla Vision
   * - ``openocd_stm32f7.cfg``
     - STM32F7 -- OpenMV Cam M7

Use ``servertype: "openocd"`` with ``configFiles`` pointing at the
appropriate ``.cfg``. There are no in-repo OpenOCD configs for the N6,
RT1062, or AE3 -- use J-Link for those.

Debugging pitfalls
------------------

* **Everything is ``<optimized out>``** -- you built ``DEBUG=0``.
  Rebuild with ``DEBUG=1``.
* **"GDB executable not found"** -- the SDK ``gcc/bin`` is not on
  ``PATH``; set ``armToolchainPath`` / ``gdbPath``.
* **"Cannot connect" / wrong memory map** -- wrong or missing
  ``device`` name; use the exact string from the table.
* **Breakpoints silently not hit** -- too many hardware breakpoints on
  flash-resident code; reduce them.
* **N6 / RT1062 / AE3 won't flash from the debugger** -- they boot
  from external flash; use ``"request": "attach"`` against running
  firmware instead of ``launch``.
* **Source paths don't match (Docker-built ELF)** -- build with the
  Docker ``build-firmware-dev`` target (same absolute path inside and
  outside the container) or set gdb ``set substitute-path``.
