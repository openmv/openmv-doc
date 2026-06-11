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
A J-Link EDU / Base / Pro all work. Where the debug pins surface
differs per camera -- many boards have a dedicated JTAG/SWD connector,
others expose SWD on the I/O header or on test pads -- so check that
board's pinout diagram and schematic in the OpenMV hardware
documentation for which pins to wire. Install
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
   * - ``OPENMV2``
     - STM32F427
     - ``STM32F427VG``
   * - ``OPENMV3``
     - STM32F765
     - ``STM32F765VI``
   * - ``OPENMV4`` / ``OPENMV4P`` / ``OPENMVPT``
     - STM32H743
     - ``STM32H743VI``
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

WSL 2 cannot see the J-Link's USB device directly, so the split is:
**Windows serves the probe** (where it is plugged in) and **VS Code +
gdb run in WSL** and reach it over TCP.

#. **On Windows**, install the Segger J-Link pack and plug the J-Link
   into a Windows USB port.

#. **On Windows**, start the **J-Link Remote Server** (it ships with
   the J-Link pack): launch it with the J-Link attached and click
   **OK**. Allow it through the Windows firewall when prompted. The
   window shows the **IP address** it is serving the probe on -- note
   it.

#. **In WSL**, build ``DEBUG=1`` and make sure ``arm-none-eabi-gdb`` is
   reachable (set ``armToolchainPath`` as above).

#. **In WSL VS Code**, keep ``servertype: "jlink"`` -- the GDB server
   runs in WSL and reaches the probe through the Remote Server -- and
   add ``serverpath`` + ``ipAddress``::

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

   Set ``ipAddress`` to the address the Remote Server window shows.
   That is the whole bridge.

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
   hang in the field. Use ``"request": "launch"`` to reset, flash the
   ELF, and start fresh at ``runToEntryPoint``.

Command-line debugging with gdbrunner
-------------------------------------

Setting up a GDB session against an embedded target by hand is a
five-step dance: start the J-Link / ST-Link GDB server in
one window with the right device, port, and interface flags; wait
for it to print *Waiting for GDB connection*; run
``arm-none-eabi-gdb`` in a second window; type ``target remote
localhost:<port>``; point gdb at the ELF. When the gdb session ends,
remember to kill the server window. `gdbrunner
<https://github.com/openmv/gdbrunner>`__ is a small CLI that collapses
all of that into one foreground command. It ships in the OpenMV SDK's
Python environment, so there is nothing to install; the usual entry
point is the firmware repository's ``make debug`` target::

    make -j$(nproc) TARGET=<TARGET> DEBUG=1 debug

This runs gdbrunner with the debugger arguments from the board's
configuration -- the J-Link device name and, where needed, the
ST-Link external flash loader -- with the SDK's ``arm-none-eabi-gdb``
already on ``PATH``. The default backend is J-Link; ``make
DEBUGGER=STLINK debug`` works with an ST-Link probe instead.

gdbrunner can also be invoked directly (outside the SDK, ``pip
install gdbrunner``)::

    gdbrunner jlink --device STM32H743VI build/OPENMV4/bin/firmware.elf
    gdbrunner stlink build/OPENMV4/bin/firmware.elf
    gdbrunner qemu --machine mps2-an500 build/MPS2_AN500/bin/firmware.elf

The first positional argument picks the server backend (``jlink``,
``stlink``, ``qemu``); the rest are forwarded to that backend, with
defaults that work for the OpenMV cams. ``gdbrunner --help`` lists
the full per-backend flag list; each backend's argument table is
JSON-driven (``src/gdbrunner/backends.json``), so adding a new server
is a config edit rather than code.

What gdbrunner does for command-line work:

* **One process, clean lifecycle.** Server starts, gdb attaches when
  the port is open, server is terminated cleanly when gdb exits. No
  orphan ``JLinkGDBServer`` surviving the session, no two terminals
  to manage.
* **STM32CubeProgrammer auto-discovery.** The ``stlink`` backend
  searches the usual install locations (``~/STM32CubeProgrammer/``,
  ``/opt/st/``, the STM32CubeIDE plugin tree) for the
  STM32CubeProgrammer tools, so the long ``--cube-prog`` path doesn't
  have to be typed every time. The SDK bundles its own copy at
  ``~/openmv-sdk-<version>/stcubeprog/bin`` -- point ``--cube-prog``
  there if no system install exists.
* **Per-project gdbinit honoured.** A ``.gdbinit`` in the current
  directory is loaded with ``-ix`` -- overriding the user-wide
  ``~/.gdbinit`` -- so per-project gdb scripting (pretty-printers,
  board-specific macros, breakpoint sets) drops in by being present
  in the working directory. ``make debug`` runs from the repository
  root, so a ``.gdbinit`` there applies.
* **Dry run.** ``--dryrun`` prints the server command without
  running it, useful for adapting the invocation to a wrapper
  script, copying it into an IDE launcher config, or just checking
  what arguments gdbrunner is composing.
* **Server output visible.** ``--show-output`` keeps the server's
  stdout / stderr visible. The default suppresses it (so gdb's UI
  stays clean); flip the flag when the server itself is what's
  misbehaving.
* **QEMU backend.** ``qemu-system-arm`` debugs a firmware build with
  no board plugged in. The ``MPS2_AN500`` target selects this backend
  in its board configuration, so ``make TARGET=MPS2_AN500 DEBUG=1
  debug`` builds for QEMU's ``mps2-an500`` machine and steps the
  platform-independent code -- everything that doesn't touch
  cam-specific peripherals -- on a flight. (``qemu-system-arm`` is a
  host install, not part of the SDK.)

For source-level stepping with breakpoint gutters and a peripheral
register view, the VS Code Cortex-Debug setup above is the better
tool; gdbrunner is the right one for everything that lives at the
command line.

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

* **Disconnecting** -- *Stop* on a ``launch`` session halts the
  target; *Disconnect* on an ``attach`` session leaves the camera
  running. Power-cycle the camera to return it to normal operation
  afterwards.

Debugging pitfalls
------------------

* **Optimized-out variables.** Everything shows ``<optimized out>``
  -- you built ``DEBUG=0``. Rebuild with ``DEBUG=1``.
* **"GDB executable not found"** -- the SDK ``gcc/bin`` is not on
  ``PATH``; set ``armToolchainPath`` / ``gdbPath``.
* **"Cannot connect" / wrong memory map** -- wrong or missing
  ``device`` name; use the exact string from the table.
* **Breakpoints silently not hit** -- too many hardware breakpoints on
  flash-resident code; reduce them.
* **Source paths don't match (Docker-built ELF)** -- build with the
  Docker ``build-firmware-dev`` target (same absolute path inside and
  outside the container) or set gdb ``set substitute-path``.
