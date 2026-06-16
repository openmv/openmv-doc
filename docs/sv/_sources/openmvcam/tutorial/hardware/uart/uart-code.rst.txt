UART in code
============

:class:`machine.UART` wraps one hardware UART channel. Construct
one with the bus id and a baud rate; everything else has
reasonable defaults:

::

    from machine import UART

    uart = UART(3, baudrate=115200)

The ``id`` selects which hardware UART to use; the value
depends on the board (see the :doc:`/openmvcam/quickref` for
the available bus numbers and pin assignments on a given cam).
The default frame format is 8 data bits, no parity, one stop
bit -- the "8N1" everyone expects.

Writing and reading
-------------------

UART output goes through :meth:`~machine.UART.write`:

::

    uart.write("hello\n")
    uart.write(b"\x01\x02\x03")

``write`` accepts either a ``str`` (encoded as UTF-8) or a
``bytes`` / ``bytearray``. It returns immediately once the
bytes are queued in the TX buffer; the hardware finishes
clocking them out in the background.

Reads happen through three methods, depending on what is
needed:

::

    n = uart.any()              # bytes available to read right now
    data = uart.read(8)         # up to 8 bytes, or None on timeout
    line = uart.readline()      # bytes ending in '\n', or None on timeout

:meth:`~machine.UART.any` checks the RX buffer without
blocking. :meth:`~machine.UART.read` reads a fixed number of
bytes, returning ``None`` if the timeout (configurable via the
``timeout`` argument in the constructor) expires first.
:meth:`~machine.UART.readline` reads up to and including the
next newline, useful for line-based protocols.

A simple loop that echoes whatever it receives:

::

    uart = UART(3, baudrate=115200, timeout=100)

    while True:
        if uart.any():
            data = uart.read()
            uart.write(data)

``read()`` with no length argument keeps reading bytes until
the receive line stays quiet for the configured ``timeout``,
then returns whatever was accumulated. With ``timeout=100``,
each call here returns one *burst* of bytes -- everything the
sender clocked out without a 100 ms gap between bytes. Without
a timeout the call would have no signal that the sender is
done and could hang indefinitely.

Binary data with struct
-----------------------

Sending integers and floats over the wire is what the
:mod:`struct` module is for. It packs fixed-width values into
a ``bytes`` object using a format string that names the byte
order and the type of each field:

::

    import struct

    uart.write(struct.pack("<lhb", count, temperature_x100, status))

The leading ``"<"`` chooses little-endian byte order; ``"l"``
is a 32-bit signed integer, ``"h"`` is a 16-bit signed integer,
``"b"`` is an 8-bit signed integer. The other side unpacks with
the *same* format string:

::

    payload = uart.read(7)        # 4 + 2 + 1 = 7 bytes
    count, temperature_x100, status = struct.unpack("<lhb", payload)

The format string is the contract between the two ends. Any
mismatch -- wrong byte order, wrong type sizes, wrong field
order -- produces nonsense values.

Buffering and high-rate reads
-----------------------------

A polling loop that calls :meth:`~machine.UART.any` and
:meth:`~machine.UART.read` keeps up with most traffic on its
own, as long as the main loop iterates fast enough to drain
the receive buffer before it fills. Two constructor options
matter when the rate climbs or the loop is busy.

``rxbuf`` sets the size of the software RX buffer. The default
is a few hundred bytes; for sensors that emit hundreds of
bytes per burst, or when the main loop does long work between
polls, enlarging the buffer keeps incoming bytes from being
dropped while the loop is busy elsewhere:

::

    uart = UART(3, baudrate=115200, timeout=100, rxbuf=4096)

Anything that arrives while the buffer is full is lost; size
``rxbuf`` to cover the longest gap between drains.

For sustained high rates, :meth:`~machine.UART.readinto` reads
into a pre-allocated buffer instead of returning a fresh
``bytes`` object each call:

::

    buf = bytearray(256)

    while True:
        n = uart.readinto(buf)
        if n:
            process(buf, n)

No allocation happens on the read path, which matters when the
heap is fragmented or when allocation latency would otherwise
push past the inter-byte timing budget.

