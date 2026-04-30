:mod:`omv` --- OpenMV Cam Information
=====================================

.. module:: omv
   :synopsis: OpenMV Cam Information

The ``omv`` module is used to get OpenMV Cam information.

Functions
---------

.. function:: version_string() -> str

   Returns the firmware version string (e.g. ``"2.8.0"``).

.. function:: arch() -> str

   Returns the board architecture string.

.. function:: board_type() -> str

   Returns the board type string.

.. function:: board_id() -> str

   Returns the board id string.

.. function:: debug_mode() -> bool

   Returns ``True`` if the OpenMV debug protocol is currently active
   (i.e. the cam is connected to the IDE), ``False`` otherwise.

Constants
---------

.. data:: version_major
   :type: int

   The firmware major version number.

.. data:: version_minor
   :type: int

   The firmware minor version number.

.. data:: version_patch
   :type: int

   The firmware patch version number.
