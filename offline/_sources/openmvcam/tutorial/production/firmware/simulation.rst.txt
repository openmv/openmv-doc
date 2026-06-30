Simulators
==========

Two ``TARGET`` values build the firmware to run inside a **simulator** on your
host, with no hardware attached. They exist so the firmware can be run and
tested anywhere.

.. list-table::
   :header-rows: 1
   :widths: 20 16 24 40

   * - ``TARGET``
     - Core
     - NPU
     - Simulator
   * - ``MPS2_AN500``
     - Cortex-M7
     - None
     - QEMU
   * - ``MPS3_AN547``
     - Cortex-M55
     - Ethos-U55 (256 MACs)
     - Arm FVP -- Corstone SSE-300

**MPS2_AN500** is the baseline Cortex-M7 target with no NPU. It runs under
QEMU, which is fast to start and is the lightweight way to exercise the
platform-independent code and the test suite.

**MPS3_AN547** is a Cortex-M55 with the Ethos-U55 NPU, run on Arm's Fast
Models -- the FVP, which models the Corstone SSE-300 reference subsystem. This
is the target for exercising the NPU and the ML model path in simulation.

Both provide the ROM filesystem and plenty of RAM (and the NPU on the M55), so
vision and ML scripts run unmodified.

There is no real sensor, but the :mod:`csi` module still works against a virtual
one -- :meth:`csi.CSI.snapshot` returns a synthetic, animated test pattern (a
scrolling checkerboard in grayscale, a gradient in RGB565), not a live scene. To
process real image content, load it from a file instead: an :class:`image.Image`
from a fixture in the ROM filesystem, or an :class:`image.ImageIO` stream for
recorded frames.

Building and running
--------------------

Each simulator is a host tool you install yourself. You build a target like any
other (see :doc:`building`), then ``run`` it under the matching simulator --
``run`` builds the ROMFS image, boots the firmware, and leaves it running with
a serial connection you can attach to.

MPS2_AN500 (QEMU)
~~~~~~~~~~~~~~~~~~

QEMU ships in most package managers as the Arm system emulator:

* **Linux** (Debian / Ubuntu) -- install it with ``apt``::

      sudo apt install qemu-system-arm

* **macOS** -- install it with Homebrew::

      brew install qemu

Then build and run the target::

    make -j$(nproc) TARGET=MPS2_AN500
    make TARGET=MPS2_AN500 run

MPS3_AN547 (Arm FVP)
~~~~~~~~~~~~~~~~~~~~~

The FVP is Arm's Fixed Virtual Platform for the Corstone SSE-300, shipped as
part of `Arm Virtual Hardware
<https://www.arm.com/products/development-tools/simulation/virtual-hardware>`__.
It is available for **Linux** only -- on a Mac, use the QEMU target above
instead.

Download the bundle, extract it, and put its ``bin/`` directory on your
``PATH``::

    wget https://artifacts.tools.arm.com/avh/11.31.28/avh-linux-x86_11.31_28_Linux64.tar.gz
    mkdir -p ~/fvp
    tar --strip-components=1 -xzf avh-linux-x86_11.31_28_Linux64.tar.gz -C ~/fvp
    export PATH="$HOME/fvp/bin:$PATH"

The FVP also needs the SDK's Python libraries on ``LD_LIBRARY_PATH`` when it
runs. Export it once per shell from the repo root -- reading ``SDK_VERSION``
keeps it correct as the repo updates the pinned SDK::

    export LD_LIBRARY_PATH="$HOME/openmv-sdk-$(cat SDK_VERSION)/python/lib:$LD_LIBRARY_PATH"

Then build and run the target::

    make -j$(nproc) TARGET=MPS3_AN547
    make TARGET=MPS3_AN547 run

Running the test suite
----------------------

The unit tests live in ``scripts/unittest/tests/``, with their fixture images
and data in ``scripts/unittest/data/``. They are run with `mpremote
<https://docs.micropython.org/en/latest/reference/mpremote.html>`__, which mounts
``scripts/unittest/`` onto the running simulator and executes its ``run.py``.

The simulator link is slow with stock ``mpremote``, so use the copy bundled in
the repo with the serial patch applied (apply it once)::

    patch -N -p1 -d lib/micropython < tools/mpremote-qemu-serial.patch

For ``MPS2_AN500`` under QEMU, start the target -- it prints the
pseudo-terminal its serial port is on (for example ``/dev/pts/5``)::

    make TARGET=MPS2_AN500 run

Then, from another shell, point the patched ``mpremote`` at that device::

    python3 lib/micropython/tools/mpremote/mpremote.py connect /dev/pts/5 \
        mount scripts/unittest/ run scripts/unittest/run.py

For ``MPS3_AN547`` under the FVP, the serial port is a telnet socket on port
5555 instead::

    make TARGET=MPS3_AN547 run
    python3 lib/micropython/tools/mpremote/mpremote.py connect socket://localhost:5555 \
        mount scripts/unittest/ run scripts/unittest/run.py

``run.py`` discovers and executes every test, printing a ``PASSED`` /
``FAILED`` line per test with timing and a summary at the end.

Adding a test
-------------

Tests are discovered automatically. To add one, drop a file in
``scripts/unittest/tests/`` that defines a
``unittest(data_path, temp_path)`` function returning ``True`` when the test
passes and ``False`` when it fails::

    # scripts/unittest/tests/circles.py
    def unittest(data_path, temp_path):
        import image

        img = image.Image(data_path + "/shapes.ppm", copy_to_fb=True)
        circles = img.find_circles(threshold=5000, x_margin=30, y_margin=30, r_margin=30)
        return len(circles) == 1 and circles[0][0:] == (118, 56, 22, 5856)

The ``data_path`` and ``temp_path`` arguments point into the two filesystems the
simulator sees while the suite runs:

.. list-table::
   :header-rows: 1
   :widths: 16 84

   * - Path
     - Backed by
   * - ``/remote``
     - The host's ``scripts/unittest/`` directory, mounted live over the
       ``mpremote`` connection. ``run.py`` and the ``tests/`` it discovers live
       here, so adding or editing a test takes effect on the next run with no
       rebuild. ``temp_path`` is ``/remote/temp`` on the device, which is your
       host's ``scripts/unittest/temp/`` -- a writable scratch directory for
       tests that create files.
   * - ``/rom``
     - The board's read-only ROM filesystem, built into the firmware image from
       ``romfs_config.json``: the test fixtures (from ``scripts/unittest/data/``)
       and the bundled ML models. ``data_path`` is ``/rom`` -- reach a fixture as
       ``data_path + "/<file>"``.

So a new **test** needs no rebuild, but a new **fixture** does: the ROM image is
keyed off ``romfs_config.json`` rather than the individual data files, so force
the rebuild by touching the board's ``romfs_config.json`` (or ``make
TARGET=<TARGET> clean``) and running again.

Expected values are asserted inline in the test, so there is no separate
expected-output file to maintain. To skip a test at runtime -- for example when
it needs hardware the simulator does not model -- raise an exception whose
message contains ``"SKIPPED"``.
