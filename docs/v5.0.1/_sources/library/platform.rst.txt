:mod:`platform` --- access to underlying platform’s identifying data
====================================================================

.. module:: platform
   :synopsis: access to underlying platform’s identifying data

This module tries to retrieve as much platform-identifying data as possible. It
makes this information available via function APIs.

Functions
---------

.. function:: platform() -> str

   Returns a string identifying the underlying platform. This string is composed
   of several substrings in the following order, delimited by dashes (``-``):

   - the name of the platform system (``MicroPython`` on the OpenMV Cam)
   - the MicroPython version
   - the architecture of the platform
   - the version of the underlying platform
   - the concatenation of the name of the libc that MicroPython is linked to
     and its corresponding version.

   For example, on an OpenMV Cam this could be
   ``"MicroPython-1.25.0-armv7emsp"``.

.. function:: python_compiler() -> str

   Returns a string identifying the compiler used for compiling MicroPython.

.. function:: libc_ver() -> Tuple[str, str]

   Returns a tuple of strings *(lib, version)*, where *lib* is the name of the
   libc that MicroPython is linked to, and *version* the corresponding version
   of this libc.

.. function:: processor() -> str

   Returns a string with a detailed name of the processor, if one is available.
   If no name for the processor is known, it will return an empty string
   instead.

   On the OpenMV Cam this always returns an empty string; a processor name is
   currently only reported on RISC-V targets.
