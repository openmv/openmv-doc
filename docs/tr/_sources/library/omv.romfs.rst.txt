:mod:`romfs` --- ROMFS helper utilities
=======================================

.. module:: romfs
   :synopsis: ROMFS helper utilities

The :mod:`romfs` module provides helper utilities for inspecting the
read-only filesystem (ROMFS) that the OpenMV firmware mounts at
``/rom``. See :ref:`romfs` for an end-to-end description of the ROMFS
filesystem itself, how images are built and deployed, and the
underlying :class:`vfs.VfsRom` / :func:`vfs.rom_ioctl` APIs.

This module focuses on the *physical layout* of an already-mounted
ROMFS rather than its filesystem semantics. Because ``.mpy`` bytecode
files in a ROMFS are executed directly from flash (memory-mapped, zero
copy), MicroPython needs each file's payload to be aligned to a
sufficient boundary -- typically 4 bytes for plain ``.mpy`` files and
up to 16 bytes when a file contains native-code blobs or aligned data
references. :func:`ls_romfs` reports the address, size and largest
power-of-two alignment of every file so a deployed image can be
spot-checked from the REPL before relying on zero-copy imports.

Functions
---------

.. function:: ls_romfs() -> None

   Lists every file present in the ROMFS mounted at ``/rom`` and prints
   diagnostic information about each entry to ``stdout``.

   For each file, the following information is printed:

   - ``addr``: The memory address of the file's data, masked to 28 bits
     and formatted as an 8-digit hexadecimal value.
   - ``size``: The size of the file in bytes, obtained from the length of
     a ``memoryview`` of the open file.
   - ``alignment``: The largest power-of-two alignment (checked against
     ``128``, ``64``, ``32``, ``16``, ``8``, ``4``) that the file's
     address satisfies. If the address is not aligned to any of these
     boundaries, ``NOT aligned`` is printed instead.
   - ``name``: The file name within ``/rom``.

   This function takes no arguments and returns ``None``.
