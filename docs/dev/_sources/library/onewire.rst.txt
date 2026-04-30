:mod:`onewire` --- 1-Wire bus protocol
======================================

.. module:: onewire
   :synopsis: 1-Wire bus protocol

The :mod:`onewire` module implements the 1-Wire bus master protocol used by
devices such as the DS18x20 temperature sensor. It uses a single
:py:class:`machine.Pin` configured as open-drain to communicate with one or
more slave devices on the shared bus.

Example::

    from machine import Pin
    from onewire import OneWire

    ow = OneWire(Pin(15))
    devices = ow.scan()
    for rom in devices:
        print(rom)

Classes
-------

.. class:: OneWire(pin: machine.Pin)

   Construct a 1-Wire bus master on the given :py:class:`machine.Pin`. The
   pin is automatically configured as open-drain with a pull-up.

   **ROM command constants:**

   .. data:: SEARCH_ROM
      :type: int

      Search ROM command (``0xF0``). Used internally by :meth:`scan` to
      discover devices on the bus.

   .. data:: MATCH_ROM
      :type: int

      Match ROM command (``0x55``). Used internally by :meth:`select_rom` to
      address a specific device by its 64-bit ROM code.

   .. data:: SKIP_ROM
      :type: int

      Skip ROM command (``0xCC``). Addresses all devices on the bus
      simultaneously, skipping ROM matching.

   **Bus reset:**

   .. method:: reset(required: bool = False) -> bool

      Issue a reset pulse on the bus. Returns ``True`` if at least one slave
      device responded with a presence pulse, otherwise ``False``. If
      *required* is ``True`` and no device responds, raises :exc:`OneWireError`.

   **Bit/byte I/O:**

   .. method:: readbit() -> int

      Read a single bit from the bus and return it as ``0`` or ``1``.

   .. method:: readbyte() -> int

      Read a single byte from the bus and return it as an integer
      (0--255).

   .. method:: readinto(buf: bytearray) -> None

      Read ``len(buf)`` bytes from the bus into the given pre-allocated
      buffer.

   .. method:: writebit(value: int) -> None

      Write a single bit (``0`` or ``1``) to the bus.

   .. method:: writebyte(value: int) -> None

      Write a single byte (0--255) to the bus.

   .. method:: write(buf: bytes | bytearray) -> None

      Write the bytes in *buf* to the bus.

   **Device addressing:**

   .. method:: select_rom(rom: bytes | bytearray) -> None

      Issue a reset followed by a MATCH ROM command to address the device
      whose 64-bit ROM code is in *rom* (an 8-byte buffer).

   .. method:: scan() -> list[bytearray]

      Search the bus and return a list of 8-byte ROM codes (one
      ``bytearray`` per detected device). Returns an empty list if no
      devices are present.

   **Cyclic redundancy check:**

   .. method:: crc8(data: bytes | bytearray) -> int

      Compute the Maxim/Dallas 8-bit CRC over *data*. The result is ``0``
      when *data* already includes a valid trailing CRC byte, which can be
      used to validate received scratchpad contents.

Exceptions
----------

.. exception:: OneWireError

   Raised when a 1-Wire operation fails. Currently raised by
   :meth:`OneWire.reset` when *required* is ``True`` and no slave responds
   to the reset pulse.
