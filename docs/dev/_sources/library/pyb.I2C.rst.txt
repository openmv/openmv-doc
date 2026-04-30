.. currentmodule:: pyb
.. _pyb.I2C:

class I2C -- a two-wire serial protocol
=======================================

I2C is a two-wire protocol for communicating between devices.  At the physical
level it consists of 2 wires: SCL and SDA, the clock and data lines respectively.
OpenMV Cam does not provide Pullups on the SDA or SCL lines and external pullups
are required on both SDA and SCL lines for the I2C bus to be functional.

I2C objects are created attached to a specific bus.  They can be initialised
when created, or initialised later on.

Example::

    from pyb import I2C

    i2c = I2C(2)                         # create on bus 2
    i2c = I2C(2, I2C.MASTER)             # create and init as a master
    i2c.init(I2C.MASTER, baudrate=20000) # init as a master
    i2c.init(I2C.SLAVE, addr=0x42)       # init as a slave with given address
    i2c.deinit()                         # turn off the peripheral

Printing the i2c object gives you information about its configuration.

The basic methods are send and recv::

    i2c.send('abc')      # send 3 bytes
    i2c.send(0x42)       # send a single byte, given by the number
    data = i2c.recv(3)   # receive 3 bytes

To receive inplace, first create a bytearray::

    data = bytearray(3)  # create a buffer
    i2c.recv(data)       # receive 3 bytes, writing them into data

You can specify a timeout (in ms)::

    i2c.send(b'123', timeout=2000)   # timeout after 2 seconds

A controller must specify the recipient's address::

    i2c.init(I2C.CONTROLLER)
    i2c.send('123', 0x42)        # send 3 bytes to peripheral with address 0x42
    i2c.send(b'456', addr=0x42)  # keyword for address

Master also has other methods::

    i2c.is_ready(0x42)           # check if peripheral 0x42 is ready
    i2c.scan()                   # scan for peripherals on the bus, returning
                                 #   a list of valid addresses
    i2c.mem_read(3, 0x42, 2)     # read 3 bytes from memory of peripheral 0x42,
                                 #   starting at address 2 in the peripheral
    i2c.mem_write('abc', 0x42, 2, timeout=1000) # write 'abc' (3 bytes) to memory of peripheral 0x42
                                                # starting at address 2 in the peripheral, timeout after 1 second

Constructors
------------

.. class:: I2C(bus: Union[int, str], *args, **kwargs)

   Construct an I2C object on the given bus.  ``bus`` can be 2 or 4.
   With no additional parameters, the I2C object is created but not
   initialised (it has the settings from the last initialisation of
   the bus, if any).  If extra arguments are given, the bus is initialised.
   See ``init`` for parameters of initialisation.

   The physical pins of the I2C busses on the OpenMV Cam are:

     - ``I2C(2)`` is on the Y position: ``(SCL, SDA) = (P4, P5) = (PB10, PB11)``

   The physical pins of the I2C busses on the OpenMV Cam M7 are:

     - ``I2C(2)`` is on the Y position: ``(SCL, SDA) = (P4, P5) = (PB10, PB11)``
     - ``I2C(4)`` is on the Y position: ``(SCL, SDA) = (P7, P8) = (PD12, PD13)``

   Methods
   -------

   .. method:: deinit() -> None

      Turn off the I2C bus.

   .. method:: init(mode: int, *, addr: int = 0x12, baudrate: int = 400000, gencall: bool = False, dma: bool = False) -> None

     Initialise the I2C bus with the given parameters:

        - ``mode`` must be either ``I2C.CONTROLLER`` or ``I2C.PERIPHERAL``
        - ``addr`` is the 7-bit address (only sensible for a peripheral)
        - ``baudrate`` is the SCL clock rate (only sensible for a controller)
        - ``gencall`` is whether to support general call mode
        - ``dma`` is whether to allow the use of DMA for the I2C transfers (note
          that DMA transfers have more precise timing but currently do not handle bus
          errors properly)

      The actual clock frequency may be lower than the requested frequency.
      This is dependent on the platform hardware. The actual rate may be determined
      by printing the I2C object.

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

        - ``data`` can be an integer or a buffer to write from
        - ``addr`` is the I2C device address
        - ``memaddr`` is the memory location within the I2C device
        - ``timeout`` is the timeout in milliseconds to wait for the write
        - ``addr_size`` selects width of memaddr: 8 or 16 bits

      Returns ``None``.
      This is only valid in controller mode.

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

        - ``send`` is the data to send (an integer to send, or a buffer object)
        - ``addr`` is the address to send to (only required in controller mode)
        - ``timeout`` is the timeout in milliseconds to wait for the send

      Return value: ``None``.

   .. method:: scan() -> List[int]

      Scan all I2C addresses from 0x01 to 0x7f and return a list of those that respond.
      Only valid when in controller mode.

   Constants
   ---------

   .. data:: CONTROLLER
      :type: int

      for initialising the bus to controller mode

   .. data:: PERIPHERAL
      :type: int

      for initialising the bus to peripheral mode
