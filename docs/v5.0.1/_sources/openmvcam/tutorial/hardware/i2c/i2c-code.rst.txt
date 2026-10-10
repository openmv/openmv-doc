I2C in code
===========

:class:`machine.I2C` wraps a hardware I2C controller. Construct
one with the bus id and an optional clock frequency:

::

    from machine import I2C

    i2c = I2C(2, freq=400_000)

``id`` selects which hardware I2C block to use; the available
numbers and the SDA / SCL pins they map to depend on the board
(see the :doc:`/openmvcam/quickref`). ``freq`` is the SCL
clock rate -- ``100_000`` is standard mode, ``400_000`` is the
common "fast" speed that most sensors support.

Scanning the bus
----------------

:meth:`~machine.I2C.scan` walks the 7-bit address space and
returns a list of every device that acknowledged its address:

::

    >>> i2c.scan()
    [0x40, 0x68]

This is the first thing to try after wiring up a new bus. If a
device is on the list, the wiring and pull-ups are fine. If
the list is empty (or shorter than expected), suspect the
pull-ups, the wiring, or the device's address pins before
suspecting code.

The memory-mapped pattern
-------------------------

Most I2C sensors expose their state as a set of internal
registers: status flags at one address, measurement bytes at
another, configuration at a third. The library has two
convenience methods that map directly to the "address the
device, point at a register, then read or write data" pattern.

Reading a register:

::

    addr = 0x68
    reg  = 0x3B
    data = i2c.readfrom_mem(addr, reg, 6)
    # `data` is 6 bytes starting at register 0x3B

That single call issues a START, sends the device address with
the write bit, sends the register address (a repeated start),
re-sends the address with the read bit, reads 6 bytes,
NACKs the last one, and STOPs. The device sees the standard
"read from register" sequence; the script sees one Python call.

Writing to a register:

::

    i2c.writeto_mem(addr, 0x6B, b"\x00")

That sequence is the same in mirror image: START, address +
write, register, payload byte, STOP.

For devices whose register address is two bytes wide (some
EEPROMs and 16-bit-addressed memories) pass ``addrsize=16``:

::

    data = i2c.readfrom_mem(addr, 0x0100, 32, addrsize=16)

Reading a sensor
----------------

A short loop reading the WHO_AM_I identifier and the
accelerometer X axis on a typical MEMS sensor:

::

    import time
    import struct
    from machine import I2C

    i2c         = I2C(2, freq=400_000)
    ADDR        = 0x68
    WHO_AM_I    = 0x75
    ACCEL_X_HI  = 0x3B

    print("WHO_AM_I:", i2c.readfrom_mem(ADDR, WHO_AM_I, 1)[0])

    while True:
        raw = i2c.readfrom_mem(ADDR, ACCEL_X_HI, 2)
        x   = struct.unpack(">h", raw)[0]
        print("accel X:", x)
        time.sleep_ms(100)

:meth:`~machine.I2C.readfrom_mem` returns a ``bytes`` object,
so the WHO_AM_I read indexes the first (and only) byte with
``[0]``. The accelerometer read is two raw bytes that have to
be assembled into one signed 16-bit value; the :mod:`struct`
format ``">h"`` does that as big-endian signed -- the byte
order most I2C sensors use, opposite of the little-endian
convention common on UART links.
:func:`struct.unpack` always returns a tuple (one element per
format character), so ``[0]`` pulls out the single value.

Lower-level access
------------------

For devices that do not follow the register-map pattern, two
lower-level methods give direct control over the address phase
and data direction:

::

    i2c.writeto(addr, b"\x01\x02\x03")    # write 3 bytes to addr
    data = i2c.readfrom(addr, 4)          # read 4 bytes from addr

These are useful for devices with command-stream interfaces
(displays, some real-time clocks) where the register-map
convenience helpers do not quite fit.

Bit-banging when no hardware block is available
-----------------------------------------------

:class:`machine.SoftI2C` provides the same API on arbitrary
GPIO pins, bit-banging the protocol in software:

::

    from machine import SoftI2C, Pin

    i2c = SoftI2C(scl=Pin("P5"), sda=Pin("P4"), freq=100_000)

Use it when the device needs to be on pins that are not wired
to a hardware I2C block, or when every hardware block is in
use. The bit-bang loop is slower than hardware I2C and the CPU
stays busy for the whole transaction, but the API is identical
to :class:`~machine.I2C` so existing code switches over by
changing only the constructor.
