.. currentmodule:: machine
.. _machine.SPI:

class SPI -- a Serial Peripheral Interface bus protocol (controller side)
=========================================================================

SPI is a synchronous serial protocol that is driven by a controller. At the
physical level, a bus consists of 3 lines: SCK, MOSI, MISO. Multiple devices
can share the same bus. Each device should have a separate, 4th signal,
CS (Chip Select), to select a particular device on a bus with which
communication takes place. Management of a CS signal should happen in
user code (via machine.Pin class).

Both hardware and software SPI implementations exist via the
:class:`SPI` and :class:`SoftSPI` classes.  Hardware SPI uses
underlying hardware support of the system to perform the
reads/writes and is usually efficient and fast but may have
restrictions on which pins can be used. Software SPI is implemented
by bit-banging and can be used on any pin but is not as efficient.
These classes have the same methods available and differ primarily
in the way they are constructed.

Example usage::

    from machine import SPI, Pin

    spi = SPI(0, baudrate=400000)           # Create SPI peripheral 0 at frequency of 400kHz.
                                            # Depending on the use case, extra parameters may be required
                                            # to select the bus characteristics and/or pins to use.
    cs = Pin(4, mode=Pin.OUT, value=1)      # Create chip-select on pin 4.

    try:
        cs(0)                               # Select peripheral.
        spi.write(b"12345678")              # Write 8 bytes, and don't care about received data.
    finally:
        cs(1)                               # Deselect peripheral.

    try:
        cs(0)                               # Select peripheral.
        rxdata = spi.read(8, 0x42)          # Read 8 bytes while writing 0x42 for each byte.
    finally:
        cs(1)                               # Deselect peripheral.

    rxdata = bytearray(8)
    try:
        cs(0)                               # Select peripheral.
        spi.readinto(rxdata, 0x42)          # Read 8 bytes inplace while writing 0x42 for each byte.
    finally:
        cs(1)                               # Deselect peripheral.

    txdata = b"12345678"
    rxdata = bytearray(len(txdata))
    try:
        cs(0)                               # Select peripheral.
        spi.write_readinto(txdata, rxdata)  # Simultaneously write and read bytes.
    finally:
        cs(1)                               # Deselect peripheral.

Constructors
------------

.. class:: SPI(id: int, baudrate: int = 1000000, *, polarity: int = 0, phase: int = 0, bits: int = 8, firstbit: int = MSB, sck: Pin | None = None, mosi: Pin | None = None, miso: Pin | None = None)

   Construct an SPI object on the given bus, *id*. Values of *id* depend
   on a particular port and its hardware. Values 0, 1, etc. are commonly used
   to select hardware SPI block #0, #1, etc.

   With no additional parameters, the SPI object is created but not
   initialised (it has the settings from the last initialisation of
   the bus, if any).  If extra arguments are given, the bus is initialised.
   See ``init`` for parameters of initialisation.

   Methods
   -------

   .. method:: init(baudrate: int = 1000000, *, polarity: int = 0, phase: int = 0, bits: int = 8, firstbit: int = SPI.MSB, sck: Pin | None = None, mosi: Pin | None = None, miso: Pin | None = None) -> None

      Initialise the SPI bus with the given parameters:

        - ``baudrate`` is the SCK clock rate.
        - ``polarity`` can be 0 or 1, and is the level the idle clock line sits at.
        - ``phase`` can be 0 or 1 to sample data on the first or second clock edge
          respectively.
        - ``bits`` is the width in bits of each transfer. Only 8 is guaranteed to be supported by all hardware.
        - ``firstbit`` can be ``SPI.MSB`` or ``SPI.LSB``.
        - ``sck``, ``mosi``, ``miso`` are pins (machine.Pin) objects to use for bus signals. For most
          hardware SPI blocks (as selected by ``id`` parameter to the constructor), pins are fixed
          and cannot be changed. In some cases, hardware blocks allow 2-3 alternative pin sets for
          a hardware SPI block. Arbitrary pin assignments are possible only for a bitbanging SPI driver
          (``id`` = -1).

      In the case of hardware SPI the actual clock frequency may be lower than the
      requested baudrate. This is dependent on the platform hardware. The actual
      rate may be determined by printing the SPI object.

   .. method:: deinit() -> None

      Turn off the SPI bus.

   .. method:: read(nbytes: int, write: int = 0x00) -> bytes

       Read a number of bytes specified by ``nbytes`` while continuously writing
       the single byte given by ``write``.
       Returns a ``bytes`` object with the data that was read.

   .. method:: readinto(buf: bytearray, write: int = 0x00) -> None

       Read into the buffer specified by ``buf`` while continuously writing the
       single byte given by ``write``.
       Returns ``None``.

   .. method:: write(buf: bytes) -> None

       Write the bytes contained in ``buf``.
       Returns ``None``.

   .. method:: write_readinto(write_buf: bytes, read_buf: bytearray) -> None

       Write the bytes from ``write_buf`` while reading into ``read_buf``.  The
       buffers can be the same or different, but both buffers must have the
       same length.
       Returns ``None``.

   Constants
   ---------

   .. data:: MSB
      :type: int

      Pass to ``firstbit`` to transmit/receive the most-significant
      bit first (the most common ordering).

   .. data:: LSB
      :type: int

      Pass to ``firstbit`` to transmit/receive the least-significant
      bit first.

.. _machine.SoftSPI:

class SoftSPI -- software-emulated SPI bus
==========================================

The :class:`SoftSPI` class implements SPI by bit-banging arbitrary
GPIO pins. It exposes the same method surface as :class:`SPI` so
existing code that targets hardware SPI can switch to software with
only a constructor change. Use it when the pins you need are not
wired to a hardware SPI block, when you need more than the available
hardware buses, or when a peripheral requires a non-standard clock
phasing that the hardware can't produce.

Constructors
------------

.. class:: SoftSPI(baudrate: int = 500000, *, polarity: int = 0, phase: int = 0, bits: int = 8, firstbit: int = MSB, sck: Pin | None = None, mosi: Pin | None = None, miso: Pin | None = None)

   Construct a software SPI object. ``sck``, ``mosi`` and ``miso``
   must be supplied -- there is no implicit pin selection. See
   :meth:`SPI.init` for the meaning of the other parameters. The
   default ``baudrate`` is lower than for hardware :class:`SPI`
   because the bit-bang loop has more overhead.

   Methods
   -------

   .. method:: init(baudrate: int = 500000, *, polarity: int = 0, phase: int = 0, bits: int = 8, firstbit: int = SoftSPI.MSB, sck: Pin | None = None, mosi: Pin | None = None, miso: Pin | None = None) -> None

      Re-initialise the software SPI bus with the given parameters.
      Only arguments supplied are updated; the others retain their
      previous values. See :meth:`SPI.init` for the meaning of each
      argument.

   .. method:: deinit() -> None

      Release the GPIO pins claimed by the bit-bang driver and stop
      driving the bus.

   .. method:: read(nbytes: int, write: int = 0x00) -> bytes

      Read ``nbytes`` bytes while continuously writing the single
      byte ``write``. Returns a ``bytes`` object containing the
      received data.

   .. method:: readinto(buf: bytearray, write: int = 0x00) -> None

      Read into ``buf`` while continuously writing the single byte
      ``write``. Returns ``None``.

   .. method:: write(buf: bytes) -> None

      Write ``buf`` to the bus. Received bytes are discarded.

   .. method:: write_readinto(write_buf: bytes, read_buf: bytearray) -> None

      Simultaneously write ``write_buf`` and read into ``read_buf``.
      Both buffers must be the same length; they may alias.

   Constants
   ---------

   .. data:: MSB
      :type: int

      Pass to ``firstbit`` to transmit/receive the most-significant
      bit first.

   .. data:: LSB
      :type: int

      Pass to ``firstbit`` to transmit/receive the least-significant
      bit first.
