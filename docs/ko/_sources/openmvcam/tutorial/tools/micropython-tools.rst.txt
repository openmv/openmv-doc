MicroPython tools
=================

The MicroPython project ships a host-side toolchain alongside the
language itself. Two of those tools are useful for any OpenMV cam
workflow that lives outside the IDE; both install from PyPI in a
single command and both work against the same USB serial /
filesystem surface the cam already exposes.

mpremote
--------

`mpremote
<https://github.com/micropython/micropython/tree/master/tools/mpremote>`__
is a CLI alternative to the OpenMV IDE. One command covers what the
IDE does through its file browser, terminal, and run-script button:
connect to a cam over USB serial, drive the REPL, copy files in and
out of the cam's filesystem, run a host-side script against the cam
without uploading it, and install third-party packages with
``mip``::

    $ pip install --user mpremote
    $ mpremote                          # interactive REPL
    $ mpremote cp main.py :             # upload to cam
    $ mpremote run local_script.py      # run host script on cam
    $ mpremote ls                       # list cam filesystem
    $ mpremote mip install aioble       # install package on cam

This is the right tool for automated test rigs, headless deployments,
CI scripts that flash a fresh image and run a smoke test, and any
workflow where running a GUI is overkill. The
:doc:`mpremote reference </reference/mpremote>` documents every
command and option.

mpy-cross
---------

`mpy-cross
<https://github.com/micropython/micropython/tree/master/mpy-cross>`__
is the cross-compiler that turns a ``.py`` source file into a
``.mpy`` binary container ready to import on the cam. Compiling
ahead of time saves the cam from parsing the source at import,
gives a smaller on-disk footprint, and is the only path for
``@native`` and ``@viper`` decorated functions that need a build
matched to the cam's MCU architecture::

    $ pip install --user mpy-cross
    $ mpy-cross foo.py
    $ mpremote cp foo.mpy :

For frozen modules baked into the firmware image and for ROMFS
partitions shipped alongside it, the same tool runs automatically as
part of the firmware build -- the build system invokes mpy-cross
over every ``.py`` under ``scripts/`` on its way to producing the
``.bin``. Direct invocation is what an application reaches for when
it wants to ship a ``.mpy`` separately from the firmware, or drive
the compiler from a build script.

The :ref:`mpy-cross section <mpy_cross_tool>` of the .mpy files
reference covers the command-line flags, the optimisation levels,
the ``-march`` matrix, and the Python module entry points.
