.. currentmodule:: pyb
.. _pyb.I2C:

class I2C -- a two-wire serial protocol
=======================================

I2C is a two-wire protocol for communicating between devices. At the
physical level it consists of two lines, ``SCL`` (clock) and ``SDA``
(data). The OpenMV Cam does **not** provide on-board pull-ups on either
line -- external pull-ups are required on both ``SCL`` and ``SDA`` for the
bus to function.

I2C objects are attached to a specific bus and may be initialised at
construction time or later via :meth:`init`.

Example::

    from pyb import I2C

    i2c = I2C(2)                              # create on bus 2 (uninitialised)
    i2c = I2C(2, I2C.CONTROLLER)              # create and init as a controller
    i2c.init(I2C.CONTROLLER, baudrate=20000)  # init as a controller
    i2c.init(I2C.PERIPHERAL, addr=0x42)       # init as a peripheral with the given address
    i2c.deinit()                              # turn off the peripheral

Printing the ``I2C`` object shows its configuration.

The basic methods are :meth:`send` and :meth:`recv`::

    i2c.send("abc")      # send 3 bytes
    i2c.send(0x42)       # send a single byte, given by the number
    data = i2c.recv(3)   # receive 3 bytes

To receive in place, first create a ``bytearray``::

    data = bytearray(3)  # create a buffer
    i2c.recv(data)       # receive 3 bytes, writing them into data

You can specify a timeout (in ms)::

    i2c.send(b"123", timeout=2000)   # timeout after 2 seconds

A controller must specify the recipient's address::

    i2c.init(I2C.CONTROLLER)
    i2c.send("123", 0x42)        # send 3 bytes to peripheral with address 0x42
    i2c.send(b"456", addr=0x42)  # keyword for address

A controller also has these methods::

    # Check if peripheral 0x42 is ready.
    i2c.is_ready(0x42)

    # Scan the bus and return a list of responding addresses.
    i2c.scan()

    # Read 3 bytes from peripheral 0x42 starting at memaddr 2.
    i2c.mem_read(3, 0x42, 2)

    # Write 3 bytes to peripheral 0x42 at memaddr 2.
    i2c.mem_write("abc", 0x42, 2, timeout=1000)

Constructors
------------

.. class:: I2C(bus: Union[int, str], *args, **kwargs)

   Construct an I2C object on the given ``bus`` (an integer peripheral
   index, e.g. ``2`` for ``I2C2``). With no additional parameters the
   object is created but not initialised (it retains the previous bus
   settings, if any); if extra arguments are given the bus is initialised.
   See :meth:`init` for the available parameters.

   ``I2C(2)`` is wired to the same header pins on every OpenMV Cam that
   exposes ``pyb.I2C`` (M4 / M7 / H7 / H7 Plus / Pure Thermal):

   .. list-table::
      :header-rows: 1
      :widths: 24 24 52

      * - Signal
        - Header pin
        - Notes
      * - ``SCL``
        - ``P4``
        -
      * - ``SDA``
        - ``P5``
        -

   ``I2C(4)`` is additionally available on the OpenMV Cam M7, H7, H7 Plus
   and Pure Thermal with ``SCL`` on header pin ``P7`` and ``SDA`` on
   header pin ``P8``.

   The OpenMV Cam N6 does not expose ``pyb.I2C``; use :class:`machine.I2C`
   instead.

   Methods
   -------

   .. method:: deinit() -> None

      Turn off the I2C bus.

   .. method:: init(mode: int, *, addr: int = 0x12, baudrate: int = 400000, gencall: bool = False, dma: bool = False) -> None

      Initialise the I2C bus with the given parameters:

        - ``mode`` must be either ``I2C.CONTROLLER`` or ``I2C.PERIPHERAL``.
        - ``addr`` is the 7-bit address (only sensible for a peripheral).
        - ``baudrate`` is the SCL clock rate (only sensible for a controller).
        - ``gencall`` is whether to support general-call mode.
        - ``dma`` is whether to allow the use of DMA for the I2C transfers
          (note that DMA transfers have more precise timing but currently
          do not handle bus errors properly).

      The actual clock frequency may be lower than the requested frequency.
      This is dependent on the platform hardware. The actual rate may be
      determined by printing the I2C object.

   .. method:: is_ready(addr: int) -> bool

      Check if an I2C device responds to the given address.  Only valid when in controller mode.

   .. method:: mem_read(data: Union[int, bytearray], addr: int, memaddr: int, *, timeout: int = 5000, addr_size: int = 8) -> bytes

      Read from the memory of an I2C device:

        - ``data`` can be an integer (number of bytes to read) or a buffer to read into
        - ``addr`` is the I2C device address
        - ``memaddr`` is the memory location within the I2C device
        - ``timeout`` is the timeout in milliseconds to wait for the read
        - ``addr_size`` selects width of memaddr: 8 or 16 bits

      Returns the read data.
      This is only valid in controller mode.

   .. method:: mem_write(data: Union[int, bytes, bytearray], addr: int, memaddr: int, *, timeout: int = 5000, addr_size: int = 8) -> None

      Write to the memory of an I2C device:

        - ``data`` can be an integer or a buffer to write from.
        - ``addr`` is the I2C device address.
        - ``memaddr`` is the memory location within the I2C device.
        - ``timeout`` is the timeout in milliseconds to wait for the write.
        - ``addr_size`` selects width of ``memaddr``: 8 or 16 bits.

      Only valid in controller mode.

   .. method:: recv(recv: Union[int, bytearray], addr: int = 0x00, *, timeout: int = 5000) -> bytes

      Receive data on the bus:

        - ``recv`` can be an integer, which is the number of bytes to receive,
          or a mutable buffer, which will be filled with received bytes
        - ``addr`` is the address to receive from (only required in controller mode)
        - ``timeout`` is the timeout in milliseconds to wait for the receive

      Return value: if ``recv`` is an integer then a new buffer of the bytes received,
      otherwise the same buffer that was passed in to ``recv``.

   .. method:: send(send: Union[int, bytes, bytearray], addr: int = 0x00, *, timeout: int = 5000) -> None

      Send data on the bus:

        - ``send`` is the data to send (an integer to send, or a buffer object).
        - ``addr`` is the address to send to (only required in controller mode).
        - ``timeout`` is the timeout in milliseconds to wait for the send.

   .. method:: scan() -> List[int]

      Scan all I2C addresses from 0x01 to 0x7f and return a list of those that respond.
      Only valid when in controller mode.

   Constants
   ---------

   .. data:: CONTROLLER
      :type: int

      Initialises the bus as the master (controller) -- it drives ``SCL``
      and initiates transactions.

   .. data:: PERIPHERAL
      :type: int

      Initialises the bus as a slave (peripheral) that listens on the
      ``addr`` set in :meth:`init` and responds to transactions started
      by a controller on the same bus.
