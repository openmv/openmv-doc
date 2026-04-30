:mod:`romfs` --- ROMFS helper utilities
=======================================

.. module:: romfs
   :synopsis: ROMFS helper utilities

The ``romfs`` module provides helper utilities for inspecting the read-only
filesystem (ROMFS) mounted at ``/rom``.

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
