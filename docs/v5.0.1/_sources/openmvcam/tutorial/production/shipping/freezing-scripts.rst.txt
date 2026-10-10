Freezing scripts into the firmware
==================================

A *frozen* module is a ``.py`` file compiled to bytecode and
linked into the firmware image at build time. The runtime
imports a frozen module straight from flash, without ever
looking at the on-disk filesystem. For a shipped product this
is the right place for the application code: nothing for the
end user to delete, nothing for a stale ``.py`` on the SD card
to override, and the cam runs the same code every boot
regardless of what (if anything) is on its drives.

This page covers the startup sequence the cam follows, then how
``manifest.py`` and the ``freeze`` directive bake an application
into the build.

The startup sequence
--------------------

What runs, and when, on a cam coming out of reset:

* **The bootloader.** Power-up enters a short DFU window the
  IDE uses to push firmware updates. The window closes after a
  few seconds and the bootloader hands off to MicroPython. A
  running script can re-enter this window on demand by calling
  :func:`machine.bootloader`.

* **Frozen filesystem init.** Before any application code
  runs, the runtime brings the filesystems up. Internal flash
  is mounted at ``/flash`` (and formatted blank if there is
  nothing there). If an SD card is present *and* a marker
  file called ``SKIPSD`` does **not** exist on internal flash,
  the SD card is mounted at ``/sdcard``. ROMFS, when the
  build includes it, is mounted automatically at ``/rom``.
  The working directory is set to the boot directory
  (``/sdcard`` if the card mounted, ``/flash`` otherwise), and
  :data:`sys.path` is populated with ``/flash``, ``/flash/lib``,
  ``/sdcard``, ``/sdcard/lib``, ``/rom``, and ``/rom/lib``.
  The flash-resident setup is handled by a frozen module
  called ``_boot.py`` -- port and board infrastructure, not
  an application hook. Applications do not customise
  ``_boot.py``; the build does. Dropping a ``SKIPSD`` file
  onto flash from the IDE is the supported way to make the
  cam boot from internal flash instead of the SD card.

* **Pre-REPL setup.** ``boot.py`` runs on *every* soft reset
  -- cold boot, ``Ctrl-D`` from the REPL, the running script
  returning, and watchdog recovery -- *before* the REPL
  becomes reachable. Its job is to prepare the environment
  the rest of the system runs in: the kind of setup the REPL,
  the application, and any recovery tooling all need in
  place to function. It is not where the application itself
  lives. ``main.py`` is the application's entry point.

* **Main loop.** ``main.py`` is the application's main loop.
  Runs once on cold boot, immediately after ``boot.py``. *Not*
  re-run on subsequent soft resets -- the cam drops to the
  REPL instead. That asymmetry matters for development (a
  Ctrl-D drops to the REPL without re-running the loop, so
  the developer can inspect state) but not for production: a
  fielded cam sees power-on, watchdog, and hard resets, which
  are all hardware resets that re-enter the cold-boot path
  and run ``main.py`` again.

Freezing into the firmware
--------------------------

A board's frozen-module set is declared in
``boards/<TARGET>/manifest.py`` in the firmware tree. The
manifest is a small Python file that calls a handful of
directives:

* ``freeze("$(OMV_LIB_DIR)/", "foo.py")`` -- bakes a single
  ``foo.py`` into the build.
* ``package("mylib", base_path="...")`` -- bakes a multi-file
  Python package, preserving its directory layout under the
  given base path.
* ``include("...")`` -- pulls in another manifest file. The
  board manifests use this to share common module sets.
* ``require("logging")`` -- pulls in a named upstream
  ``micropython-lib`` module by name.

A minimal application manifest adds one ``freeze`` line per
top-level script and a ``package`` line per package the
application depends on.

Where the source lives
~~~~~~~~~~~~~~~~~~~~~~

Application source lives under ``scripts/libraries/`` in
the firmware tree, alongside the modules the build already
freezes. The manifest variable ``$(OMV_LIB_DIR)`` expands to
that path, so manifest entries stay short. Editing the
manifest is already an in-tree operation, so keeping the
source in-tree avoids juggling a separate project repo on
the path resolution.

A typical layout for an application that ships a single
``main.py`` plus a supporting package::

    scripts/libraries/
        main.py
        my_lib/
            __init__.py
            helpers.py

And in the board's ``boards/<TARGET>/manifest.py``, one
``freeze`` line for the script and one ``package`` line for
the package::

    freeze("$(OMV_LIB_DIR)/", "main.py")
    package("my_lib", base_path="$(OMV_LIB_DIR)/my_lib")

Single-file scripts -- ``main.py`` here, but the same rule
applies to ``boot.py`` or any standalone helper -- use
``freeze``. Multi-file packages use ``package``. Adding
another script is one more ``freeze`` line; adding another
package is one more ``package`` line.

Building and flashing
~~~~~~~~~~~~~~~~~~~~~

Once the manifest is in place, build the firmware exactly as
the :doc:`firmware chapter
</openmvcam/tutorial/production/firmware/building>` describes::

    make -j$(nproc) -C lib/micropython/mpy-cross   # once, builds the cross-compiler
    make -j$(nproc) TARGET=<TARGET>                # builds the firmware

The output lands in ``build/<TARGET>/bin/``::

    build/<TARGET>/bin/
        firmware.bin     # flash through the IDE
        romfs0.img       # flash through the IDE in a separate step

Flashing the ``.bin`` and ``.img`` through the IDE lands a
cam whose application is part of the build.

The startup sequence above is what makes the bake-in
effective: the runtime resolves ``boot.py`` and ``main.py`` to
the frozen copies before it ever checks the filesystem, so a
shipped cam runs the build's code even if the SD card holds a
stale ``boot.py`` left from development.

Lookup order
~~~~~~~~~~~~

The override semantics are *different* for the ``boot.py`` /
``main.py`` execution path and for ordinary ``import``
statements. Knowing which is which matters for both production
and development:

* For ``boot.py`` and ``main.py``: the runtime looks for a
  *frozen* copy first, then the filesystem. A frozen
  ``boot.py`` cannot be overridden by dropping one onto the SD
  card -- whoever holds the cam cannot change the entry point
  without reflashing.

* For ``import foo``: the runtime searches :data:`sys.path`
  first -- which covers ``/flash``, ``/sdcard``, ``/rom``,
  and their ``lib`` subdirectories -- then frozen modules. A
  same-name ``foo.py`` on flash or SD *does* override a frozen
  ``foo``. This is the development affordance: drop a fixed
  module on the card, soft-reset, see the change without
  reflashing.

A shipped product that wants to suppress the
filesystem-overrides-frozen behaviour for imports can clear
:data:`sys.path` early in ``boot.py``::

    import sys

    sys.path.clear()

With ``sys.path`` empty, all imports resolve from the frozen
modules only; nothing on flash, SD, or ROMFS can shadow
them.

The asset problem
~~~~~~~~~~~~~~~~~

Freezing is great for code. It is *not* great for large
binary assets: machine-learning model files, label tables,
JSON configuration, image templates. Embedding those as Python
literals balloons the source, recompiles slowly, and wastes
the bytecode container on data the interpreter is just going
to read raw anyway. The :doc:`romfs-image` page covers the
read-only flash filesystem that fills this gap.
