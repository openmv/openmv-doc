:mod:`omv` --- OpenMV Cam Information
=====================================

.. module:: omv
   :synopsis: OpenMV Cam Information

The ``omv`` module is used to get OpenMV Cam information.

Functions
---------

.. function:: version_major() -> int

   Returns the major version number (int).

.. function:: version_minor() -> int

   Returns the minor version number (int).

.. function:: version_patch() -> int

   Returns the patch version number (int).

.. function:: version_string() -> str

   Returns the version string (e.g. "2.8.0").

.. function:: arch() -> str

   Returns the board architecture string. This string is really just meant for
   OpenMV IDE but you can get it with this function.

.. function:: board_type() -> str

   Returns the board type string. This string is really just meant for
   OpenMV IDE but you can get it with this function.

.. function:: board_id() -> str

   Returns the board id string. This string is really just meant for
   OpenMV IDE but you can get it with this function.
