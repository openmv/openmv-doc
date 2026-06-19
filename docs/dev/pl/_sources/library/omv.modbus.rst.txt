:mod:`modbus` --- Modbus RTU slave protocol
===========================================

.. module:: modbus
   :synopsis: Modbus RTU slave protocol

This module provides a pure-Python implementation of a Modbus RTU slave that
communicates over a UART. It maintains an internal holding-register array and
responds to standard Modbus function codes ``0x03`` (Read Holding Registers),
``0x06`` (Write Single Register), and ``0x10`` (Write Multiple Registers).
CRC-16 (Modbus polynomial) is computed using a lookup table.

For example::

    from machine import UART
    from modbus import ModbusRTU

    uart = UART(1, 115200, timeout=10, timeout_char=10)
    modbus = ModbusRTU(uart, slave_id=0x01, register_num=30)

    while True:
        if modbus.any():
            modbus.handle(debug=False)


class ModbusRTU
---------------

A Modbus RTU slave that reads requests from a UART, updates its internal
register array, and writes the corresponding response back to the UART.

.. class:: ModbusRTU(uart: machine.UART, slave_id: int = 0x01, register_num: int = 30)

    Construct a ``ModbusRTU`` slave.

        - *uart* is a UART instance (e.g. ``machine.UART`` or ``pyb.UART``)
          used to send and receive Modbus frames. The UART must be configured
          with appropriate baud rate, parity, and timeouts before being passed
          in.
        - *slave_id* is the Modbus slave address (1-247) this instance will
          respond to. Frames addressed to other slave IDs are ignored.
        - *register_num* is the number of 16-bit holding registers backing
          this slave. Registers are stored in the :attr:`REGISTER` list and
          initialized to zero.

    .. attribute:: ModbusRTU.SLAVE_ID
       :type: int

       The Modbus slave address this instance will respond to. Set from the
       *slave_id* constructor argument.

    .. attribute:: ModbusRTU.uart
       :type: machine.UART

       The UART instance passed to the constructor, used for all I/O.

    .. attribute:: ModbusRTU.register_num
       :type: int

       The number of 16-bit holding registers, set from the *register_num*
       constructor argument.

    .. attribute:: ModbusRTU.REGISTER
       :type: list[int]

       List of length :attr:`register_num` holding the current 16-bit register
       values. Reads and writes performed via incoming Modbus requests update
       this list. Application code may read from or write to this list directly
       to exchange data with the Modbus master.

    .. attribute:: ModbusRTU.CRC16_TABLE
       :type: list[int]

       Precomputed 256-entry lookup table for the Modbus CRC-16 polynomial,
       used by :meth:`crc16`.

    .. method:: any() -> int

        Return the number of bytes currently available in the underlying UART's
        receive buffer (delegates to ``uart.any()``). Use this to check for an
        incoming request before calling :meth:`handle`.

    .. method:: clear() -> None

        Reset every entry in :attr:`REGISTER` to ``0``.

    .. method:: crc16(data: bytes | bytearray) -> bytes

        Compute the Modbus CRC-16 of *data* using :attr:`CRC16_TABLE` and return
        it as a 2-byte little-endian ``bytes`` object suitable for appending to a
        Modbus frame.

            - *data* is a ``bytes``/``bytearray`` (or any iterable of integers)
              containing the bytes to checksum.

    .. method:: handle(debug: bool = False) -> None

        Read a single Modbus request from the UART, update the internal
        register array as required, and write the corresponding response back
        to the UART.

        Supported function codes:

            - ``0x03`` Read Holding Registers --- responds with the requested
              range of register values.
            - ``0x06`` Write Single Register --- writes a single register and
              echoes the address and value.
            - ``0x10`` Write Multiple Registers --- writes a contiguous range
              of registers and responds with the starting address and count.

        Modbus exception responses are returned for:

            - Illegal Function (``0x01``) --- unsupported function code.
            - Illegal Data Address (``0x02``) --- register index out of range.
            - Illegal Data Value (``0x03``) --- byte count does not match the
              declared quantity of registers.

        Frames whose CRC does not match or whose slave address does not match
        :attr:`SLAVE_ID` are silently dropped.

            - *debug* if ``True``, prints the raw request, parsed function code,
              generated response, and any error details to the REPL. Defaults to
              ``False``.
