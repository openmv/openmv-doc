Setting up the development environment
======================================

You need three things on the host before you can compile: an editor (VS Code
is recommended because the debugger plugs into it), a Linux-flavored shell
(WSL on Windows, native on Linux/macOS), and the OpenMV repository with the
pinned SDK extracted.

VS Code
-------

You can build the firmware from any editor -- the build is just ``make`` --
but **Visual Studio Code** is recommended because the on-hardware debugger
(covered on :doc:`debugging`) uses the VS Code **Cortex-Debug** extension.
Installing VS Code first means the rest of these pages are ready to debug,
not just build.

Installing VS Code
~~~~~~~~~~~~~~~~~~

* **Windows** -- download the installer from `code.visualstudio.com
  <https://code.visualstudio.com>`__ and run it. Install VS Code on
  **Windows**, not inside WSL; it integrates with WSL through the *WSL*
  extension (below), running its UI on Windows while the compiler, files,
  and debugger live in Linux.
* **macOS** -- download the ``.zip`` from `code.visualstudio.com
  <https://code.visualstudio.com>`__, unzip it, and drag *Visual Studio
  Code.app* into ``/Applications``. Or ``brew install --cask
  visual-studio-code``.
* **Linux** -- install the ``.deb`` / ``.rpm`` from `code.visualstudio.com
  <https://code.visualstudio.com>`__ (e.g. ``sudo apt install
  ./code_*.deb``), or use the distribution's Snap/Flatpak.

Extensions to install (from the Extensions panel, :kbd:`Ctrl+Shift+X`):

* **C/C++** (``ms-vscode.cpptools``) -- C source navigation and
  IntelliSense.
* **Cortex-Debug** (``marus25.cortex-debug``) -- on-chip debugging via GDB
  and a J-Link / OpenOCD server. Required for :doc:`debugging`.
* **WSL** (``ms-vscode-remote.remote-wsl``) -- **Windows only**. Lets VS
  Code open a folder *inside* your WSL distribution so the editor,
  terminal, IntelliSense, and Cortex-Debug all operate in Linux. Install
  the C/C++ and Cortex-Debug extensions *into the WSL host* once connected
  (VS Code prompts for this).

Host shell
----------

You need a Linux (x86-64) or macOS (arm64) environment with ``git`` and a
few basic tools. Pick the section for your OS.

Windows: install WSL
~~~~~~~~~~~~~~~~~~~~~

WSL runs a genuine Ubuntu userland on Windows. After it is installed, every
later instruction in this guide is identical to native Linux.

#. Open **PowerShell as Administrator** (right-click Start -> *Terminal
   (Admin)*).

#. Install WSL with the default Ubuntu distribution::

       wsl --install

   This enables the required Windows features, installs the WSL 2 kernel,
   and installs Ubuntu. Reboot if prompted.

#. After the reboot, Ubuntu launches and asks you to create a UNIX
   username and password. This account is independent of your Windows
   account.

#. Update the distribution::

       sudo apt update && sudo apt upgrade -y

#. Confirm you are on **WSL 2** (required -- WSL 1 is not supported for
   this workflow). In PowerShell::

       wsl --list --verbose

   The ``VERSION`` column must say ``2``. If it says ``1``, convert it::

       wsl --set-version Ubuntu 2

.. tip::

   Work inside the Linux filesystem (``~/`` in WSL), **not** under
   ``/mnt/c/``. Building on the Windows-mounted drive is dramatically
   slower and can cause file-permission and line-ending problems. Clone
   the repository into your WSL home directory.

To open the project later: launch *Ubuntu* from the Start menu for a shell,
or from VS Code on Windows press :kbd:`Ctrl+Shift+P` -> *WSL: Connect to
WSL*, then *File -> Open Folder* and pick the cloned repo in the Linux
filesystem.

Linux / WSL prerequisites
~~~~~~~~~~~~~~~~~~~~~~~~~~

The SDK provides the compiler, so only a handful of host packages are
needed (this is also exactly what continuous integration installs on
Ubuntu)::

    sudo apt-get update
    sudo apt-get install git build-essential

macOS prerequisites
~~~~~~~~~~~~~~~~~~~~

Native building is supported on **Apple-silicon (arm64) macOS** only. Using
`Homebrew <https://brew.sh>`__::

    brew install bash make coreutils

(Intel macs are not a supported native build host -- use the Docker build
from :doc:`building` or a Linux VM.)

Getting the source
------------------

Clone the repository with all submodules (MicroPython, CMSIS, vendor
drivers, etc.)::

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
-------------------------

From the repository root, run the one-time SDK install::

    make sdk

This downloads ``openmv-sdk-<version>-<os>-<arch>.tar.xz`` from
``download.openmv.io``, verifies its SHA-256 checksum, and extracts it to
``~/openmv-sdk-<version>/`` (the version is pinned by the repo's
``SDK_VERSION`` file). It is idempotent -- re-running it does nothing if
the correct version is already installed, and the regular build aborts
with *"OpenMV SDK not found. Run 'make sdk' to install it."* if it is
missing or the wrong version.

The SDK bundles everything the build and debugger need, all added to
``PATH`` automatically by the Makefile:

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

   The OpenMV N6 and OpenMV AE3 use Cortex-M55 cores and require **GCC
   14.3 or newer**. The build enforces this for those targets and aborts
   with an *"Upgrade to GCC 14.3+ for proper CM55 support"* error if an
   older ``arm-none-eabi-gcc`` is found ahead of the SDK's on ``PATH``.
   The bundled SDK toolchain already satisfies this; the error means a
   different, older toolchain is shadowing it.
