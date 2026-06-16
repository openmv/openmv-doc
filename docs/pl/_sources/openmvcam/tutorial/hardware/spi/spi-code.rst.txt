SPI in code
===========

:class:`machine.SPI` wraps a hardware SPI controller; CS lines
are ordinary :class:`~machine.Pin` outputs managed by the
script. Construct an SPI instance with the bus id, the desired
clock rate, and (if needed) the mode:

::

    from machine import SPI, Pin

    spi = SPI(0, baudrate=1_000_000, polarity=0, phase=0)
    cs = Pin("P3", Pin.OUT, value=1)         # CS idle high

The ``id`` selects which hardware SPI block to use; the
available numbers and the SCK/MOSI/MISO pins they map to
depend on the board (see the :doc:`/openmvcam/quickref`).
``baudrate`` is the SCK frequency in hertz -- the actual rate
the hardware achieves may be slightly lower due to clock
division, which the printed value of the SPI object will show.

The CS pin is constructed with ``value=1`` so it idles
deasserted. Every transaction asserts CS (drives it low),
moves the bytes, and deasserts CS (drives it high) again.

Reading, writing, exchanging
----------------------------

Three methods cover the common cases:

::

    cs.value(0)
    spi.write(b"\x10\x20\x30")              # send 3 bytes, ignore what comes back
    cs.value(1)

    cs.value(0)
    data = spi.read(4)                      # read 4 bytes; sends 0x00 while reading
    cs.value(1)

    rx = bytearray(2)
    cs.value(0)
    spi.write_readinto(b"\x9F\x00", rx)     # send 0x9F, 0x00; receive 2 bytes
    cs.value(1)

:meth:`~machine.SPI.write` is the write-only fast path; the
controller pushes the bytes and discards whatever the
peripheral sent back on MISO.
:meth:`~machine.SPI.read` is the mirror image -- it clocks ``N``
SCK pulses while sending a fixed dummy byte (``0`` by default)
on MOSI and stores the MISO bytes.
:meth:`~machine.SPI.write_readinto` is the full-duplex form:
it sends the bytes from one buffer and stores the simultaneous
MISO bytes into another. Many peripherals use this pattern --
"send a command byte, then read the response in the next
transfer" -- so the two operations naturally fit into one
``write_readinto`` call.

Most peripherals expect the CS line to stay asserted for the
entire transaction (command bytes through response bytes), so
keep the ``cs.value(0)`` / ``cs.value(1)`` brackets around the
*whole* sequence, not around each method call.

A typical sensor read
---------------------

Many SPI sensors organise their state as a set of internal
registers and follow the same exchange shape: send the
register address (with a read/write flag in the top bit),
then read or write the register's bytes. A read of register
``0x0F`` on such a device:

::

    rx = bytearray(2)
    cs.value(0)
    spi.write_readinto(b"\x8F\x00", rx)     # 0x80 = "read" flag, then reg 0x0F
    cs.value(1)
    register_value = rx[1]

The first MISO byte is junk (the device was still receiving
the command at that point); the second MISO byte holds the
register contents. The exact command byte format -- which bit
is the read/write flag, whether the address auto-increments
on multi-byte reads -- is in the device's data sheet.

Bit-banging
-----------

The :class:`SPI` instance above uses a hardware SPI block:
a dedicated peripheral inside the MCU with its own shift
register and clock generator that produces the SCK / MOSI /
MISO waveforms in silicon. Software just hands it a byte; the
bits move on the wire without further CPU help, leaving the
CPU free to do other work in parallel.

The alternative is bit-banging: software loops over each
bit and toggles GPIO pins directly to produce the same
waveform. There is no hardware peripheral involved -- the CPU
drives SCK low, sets MOSI, drives SCK high, samples MISO, and
so on for every bit of every byte. That ties the CPU up for
the whole transaction and runs slower than the hardware
block can, but it works on any pin and does not need a
hardware block to be free.

:class:`machine.SoftSPI` is the bit-bang implementation of
the same SPI API:

::

    from machine import SoftSPI, Pin

    spi = SoftSPI(baudrate=500_000, polarity=0, phase=0,
                  sck=Pin("P2"), mosi=Pin("P0"), miso=Pin("P1"))

Use it when the device needs to be on pins that are not
wired to a hardware SPI block, or when the hardware blocks
are all in use. ``500 kHz`` is a comfortable ceiling on most
cams; the CPU stays busy for the whole transaction.
