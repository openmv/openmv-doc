:mod:`omv` --- OpenMV Cam Information
=====================================

.. module:: omv
   :synopsis: OpenMV Cam Information

The :mod:`omv` module exposes runtime information about the OpenMV
Cam itself -- the firmware version, the underlying MCU architecture,
the board model and a stable board ID -- so that scripts can adapt
their behaviour to the hardware they are running on. It also reports
whether the OpenMV IDE is currently attached over the debug protocol
via :func:`debug_mode`, which is useful for switching between live
preview and standalone operation.

Example usage::

    import omv

    print("board:       ", omv.board_type(), omv.board_id())
    print("arch:        ", omv.arch())
    print("firmware:    ", omv.version_string())
    print("IDE attached:", omv.debug_mode())

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
