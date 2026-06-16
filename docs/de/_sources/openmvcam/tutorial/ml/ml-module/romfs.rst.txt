ROMFS
=====

ROMFS is a read-only filesystem built into the cam at compile time
and mounted at ``/rom/``. The file blocks live in flash and are
mapped into the address space, so opening a file there exposes its
bytes directly from flash with no RAM copy. Models, label files, and
Haar cascades are the typical contents.

Why models live here
--------------------

Two reasons. The first is the RAM trade-off already noted: a model
on ``/rom/`` reads in place from flash and costs no RAM beyond its
tensor arena, where a model on ``/sdcard/`` is copied into RAM at
load time and costs the file size on top of the arena. On the
smaller cams that difference is often the difference between fitting
and not fitting.

The second is the NPU. The N6's NPU and the Ethos-U on the AE3
expect their weights in a memory-addressable region with the right
alignment, and the build tooling that compiles a model for those
accelerators (STEdgeAI for the N6's NPU, Vela for the AE3's
Ethos-U) places the result in ROMFS with that layout. A model loaded from ``/sdcard/``
lands in heap RAM, which is fine for the CPU paths the H7 and
RT1062 use, but gives up the direct-from-flash NPU path the faster
cams were designed around.

A normal MicroPython filesystem
-------------------------------

At runtime ROMFS behaves like any other mounted MicroPython
filesystem: :func:`os.listdir` enumerates ``/rom/``,
:func:`builtins.open` opens files in it, and a path under it passes
to any API that accepts a path. The only restriction is that
scripts cannot write to it -- the partition is read-only at run
time.

The IDE *can* edit ROMFS. It exposes the partition's contents in
its file browser and supports adding, removing, and replacing files
there the same way it does for the SD card. The
intended use is to add custom models, label files, helper scripts,
or any other resource the application needs to ship with the cam.
Anything dropped into ``/rom/`` through the IDE gets the same
direct-from-flash, NPU-accessible storage the preloaded models
have.
