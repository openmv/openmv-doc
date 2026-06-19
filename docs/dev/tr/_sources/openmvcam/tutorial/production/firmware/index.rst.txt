.. _firmware_development:

Firmware development
====================

These pages are for **firmware developers** -- people who want to change
the C code that runs on the OpenMV Cam, not just write MicroPython scripts.
They cover the whole loop: setting up an editor, installing the build
toolchain, compiling the firmware for every supported board, flashing your
build onto a camera, and debugging it on real hardware with a J-Link probe
and single-step source-level debugging in VS Code.

By the end you should be able to take a clean machine, build the firmware,
put it on a camera, set a breakpoint in the C source, and single-step the
processor.

.. note::

   The OpenMV firmware is a fork of `MicroPython
   <https://github.com/micropython/micropython>`__ with the OpenMV machine
   vision library, drivers, and board ports added. The source lives at
   `github.com/openmv/openmv <https://github.com/openmv/openmv>`__. The
   Python ``image`` / ``ml`` / ``csi`` modules you use in scripts are C
   code in this repository.

How the build works
-------------------

Two things are worth understanding before you start, because they explain
every instruction below:

* **The build is SDK-driven.** You do not install the ARM compiler, CMake,
  Python, or the ST tools yourself. The repository pins an exact OpenMV SDK
  version (the ``SDK_VERSION`` file -- ``1.6.0`` at the time of writing),
  and ``make sdk`` downloads and unpacks that SDK into
  ``~/openmv-sdk-<version>/``. The build then prepends the SDK's ``gcc``,
  ``llvm``, ``cmake``, ``python``, and ST tool directories to ``PATH``.
  This means everyone builds with the *exact same* toolchain, and host
  setup is tiny.

* **There is no native Windows build.** The toolchain and build scripts
  target Linux (x86-64) and macOS (arm64) only. On Windows you build inside
  **WSL** (Windows Subsystem for Linux), which is a real Linux environment
  -- so once WSL is installed, Windows users follow the Linux instructions
  exactly. A Docker-based build and a Linux VM are also options.

The high-level sequence on any supported system is always:

#. Install an editor (VS Code).
#. Get a Linux-like shell (native Linux, macOS, or WSL on Windows).
#. Clone the repository and its submodules.
#. ``make sdk`` -- one-time toolchain install.
#. ``make -C lib/micropython/mpy-cross`` -- build the bytecode compiler.
#. ``make TARGET=<board>`` -- build the firmware.
#. Flash it (OpenMV IDE or ``dfu-util``).
#. Optionally, attach a J-Link and debug it.

The pages below walk through each step in order.

.. toctree::
   :maxdepth: 1

   setup.rst
   building.rst
   flashing/index.rst
   debugging.rst
   recovery.rst
