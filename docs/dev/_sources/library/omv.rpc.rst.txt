:mod:`rpc` --- rpc library
==========================

.. module:: rpc
   :synopsis: rpc library

The ``rpc`` module on the OpenMV Cam allows you to connect your OpenMV Cam to another microcontroller
or computer and execute remote python (or procedure) calls on your OpenMV Cam. The ``rpc`` module also
allows for the reverse too if you want your OpenMV Cam to be able to execute remote procedure
(or python) calls on another microcontroller or computer.

How to use the Library
----------------------

Please checkout the example scripts in OpenMV IDE under ``Remote Control``.

You will need to edit the example code to choose which interface you want to use and to play with
the settings the scripts use.

In general, for the controller device to use the ``rpc`` library you will create an interface object
using the ``rpc`` library. For example::

    interface = rpc.rpc_uart_master(baudrate=115200)

This create a UART interface to talk to an ``rpc`` slave.

Once the interface is created you just need to do::

    memory_view_object_result = interface.call("remote_function_or_method_name", bytes_object_argument)

And the ``rpc`` library will try to execute that ``"remote_function_or_method_name"`` on the slave. The
remote function or method will receive the ``bytes_object_argument`` which can be up to 2^32-1 bytes in
size. Once the remote method finishes executing it will return a ``memory_view_object_result`` which
can also be up to 2^32-1 bytes in size. Because the argument and response are both generic byte
containers you can pass anything through the ``rpc`` library and receive any type of response. A simple
way to pass arguments is to use ``struct.pack()`` to create the argument and ``struct.unpack()`` to
receieve the argument on the other side. For the response, the other side may send a string
object or json string as the result which the master can then interpret.

As for errors, if you try to execute a non-existant function or method name the
`rpc_master.call()` method will return an empty ``bytes()`` object. If the ``rpc`` library failed to
communicate with the slave the ``rpc`` library will return None.

To keep things simple the ``rpc`` library doesn't maintain a connection between the master and slave
devices. The `rpc_master.call()` method encapsulates trying to connect to the slave, starting execution
of the remote function or method, and getting the result.

Now, on the slave side of things you have to create an ``rpc`` interface to communicate with the
master. This looks like::

    interface = rpc.rpc_uart_slave(baudrate=115200)

This will create the UART interface layer to talk to an ``rpc`` master.

Once you create the slave interface you then need to register call backs that the master can call
with the interface object::

    def remote_function_or_method_name(memoryview_object_argument):
        <lots of code>
        return bytes_object_result

    interface.register_callback(remote_function_or_method_name)

You may register as many callbacks as you like on the slave.
Finally, once you are done registering callbacks you just need to execute::

    interface.loop()

On the slave to start the ``rpc`` library up and begin listening for the master. Note that the
`rpc_slave.loop()` method does not return.


class rpc -- rpc base class
---------------------------

The ``rpc`` base class is reimplemented by the `rpc_master` and `rpc_slave` classes to create the
master and slave interfaces. It is not meant to be used directly.

.. class:: rpc()

   Creates an ``rpc`` object. Not meant to be used directly.

   .. method:: rpc.get_bytes(buff: bytearray | memoryview, timeout_ms: int) -> bytes | None

      Reimplemented by transport-specific subclasses. Fills ``buff`` with bytes from the underlying
      interface within ``timeout_ms`` milliseconds. Returns ``None`` on timeout.

   .. method:: rpc.put_bytes(data: bytes | memoryview, timeout_ms: int) -> None

      Reimplemented by transport-specific subclasses. Sends ``data`` over the underlying interface
      within ``timeout_ms`` milliseconds.

   .. method:: rpc.stream_reader(call_back: Callable[[memoryview], None], queue_depth: int = 1, read_timeout_ms: int = 5000) -> None

      Receives a stream of payloads from a remote `rpc.stream_writer`. Should be called from inside an
      `rpc_slave` callback (or directly after a successful `rpc_master.call`) once both sides have
      synchronized.

      * ``call_back`` -- callable invoked once per received payload as ``call_back(data)`` where
        ``data`` is a ``memoryview``. Return value is ignored.
      * ``queue_depth`` -- number of in-flight frames the writer is allowed to send before waiting on
        the reader. Higher values increase throughput at the cost of memory.
      * ``read_timeout_ms`` -- milliseconds to wait per payload.

      Returns on any error. To cancel, raise an exception inside ``call_back``; the remote side will
      timeout.

   .. method:: rpc.stream_writer(call_back: Callable[[], bytes | memoryview], write_timeout_ms: int = 5000) -> None

      Sends a stream of payloads to a remote `rpc.stream_reader`. Should be called from inside an
      `rpc_slave` callback (or directly after a successful `rpc_master.call`) once both sides have
      synchronized.

      * ``call_back`` -- callable invoked with no arguments that returns the next ``bytes`` or
        ``memoryview`` payload to send.
      * ``write_timeout_ms`` -- milliseconds to wait when sending each payload.

      Returns on any error. To cancel, raise an exception inside ``call_back``; the remote side will
      timeout.


class rpc_master -- rpc_master base class
-----------------------------------------

The `rpc_master` is a base class. Use one of the transport-specific subclasses
(`rpc_can_master`, `rpc_i2c_master`, `rpc_spi_master`, `rpc_uart_master`).

.. class:: rpc_master()

   Creates an ``rpc_master`` object. Not meant to be used directly.

   .. method:: rpc_master.call(name: str, data: bytes = bytes(), send_timeout: int = 1000, recv_timeout: int = 1000) -> memoryview | None

      Executes a remote call on the slave device.

      * ``name`` -- string name of the remote function or method to execute.
      * ``data`` -- ``bytes``-like object passed as the argument to the remote function.
      * ``send_timeout`` -- milliseconds to wait while connecting to the slave and starting execution
        of the remote function. Once the master begins sending the argument this no longer applies;
        the library allows up to 5 seconds for the argument transfer.
      * ``recv_timeout`` -- milliseconds to wait for the slave to begin returning a response. Once
        the master begins receiving the response this no longer applies; the library allows up to
        5 seconds for the response transfer.

      Returns a ``memoryview`` of the response on success, an empty ``bytes()`` if the remote name
      does not exist on the slave, or ``None`` on communication failure.


class rpc_slave -- rpc_slave base class
---------------------------------------

The `rpc_slave` is a base class. Use one of the transport-specific subclasses
(`rpc_can_slave`, `rpc_i2c_slave`, `rpc_spi_slave`, `rpc_uart_slave`).

.. class:: rpc_slave()

   Creates an ``rpc_slave`` object. Not meant to be used directly.

   .. method:: rpc_slave.register_callback(cb: Callable[[memoryview], bytes | memoryview]) -> None

      Registers a callback that the master may invoke by name. ``cb`` is a callable taking one
      ``memoryview`` argument and returning a ``bytes``-like object. The callback's ``__name__`` is
      used as the lookup key.

   .. method:: rpc_slave.schedule_callback(cb: Callable[[], None]) -> None

      Schedules ``cb`` (a callable taking no arguments) to be executed once, immediately after the
      currently-running rpc callback successfully returns its response to the master. Must be called
      from inside an rpc callback. Allows long-running work or `rpc.get_bytes`/`rpc.put_bytes`
      cut-through transfers to run between rpc transactions. Re-register on each invocation if
      repeated execution is required.

   .. method:: rpc_slave.setup_loop_callback(cb: Callable[[], None]) -> None

      Registers ``cb`` (a callable taking no arguments) to be invoked on every iteration of
      `rpc_slave.loop`. Unlike `rpc_slave.schedule_callback`, this callback remains registered.
      Must be non-blocking; the call rate is variable.

   .. method:: rpc_slave.loop(recv_timeout: int = 1000, send_timeout: int = 1000) -> None

      Runs the rpc slave dispatch loop. Does not return except by exception raised from a callback.

      * ``recv_timeout`` -- milliseconds to wait for a command from the master before retrying.
      * ``send_timeout`` -- milliseconds to wait for the master to acknowledge the response before
        returning to receive.


class rpc_can_master -- CAN Master Interface
--------------------------------------------

Control another ``rpc`` device over CAN.

.. class:: rpc_can_master(message_id: int = 0x7FF, bit_rate: int = 250000, sample_point: float = 75, can_bus: int = 2)

   * ``message_id`` -- 11-bit CAN message id used for data transport.
   * ``bit_rate`` -- CAN bit rate in bits per second.
   * ``sample_point`` -- Tseg1/Tseg2 sample-point percentage (e.g. 50.0, 62.5, 75, 87.5).
   * ``can_bus`` -- CAN peripheral number.

   Master and slave ``message_id`` and ``bit_rate`` must match. The bus must be terminated with
   120 ohms.


class rpc_can_slave -- CAN Slave Interface
------------------------------------------

Be controlled by another ``rpc`` device over CAN.

.. class:: rpc_can_slave(message_id: int = 0x7FF, bit_rate: int = 250000, sample_point: float = 75, can_bus: int = 2)

   See `rpc_can_master` for argument descriptions.


class rpc_i2c_master -- I2C Master Interface
--------------------------------------------

Control another ``rpc`` device over I2C.

.. class:: rpc_i2c_master(slave_addr: int = 0x12, rate: int = 100000, i2c_bus: int = 2)

   * ``slave_addr`` -- 7-bit I2C address of the slave device.
   * ``rate`` -- I2C bus clock frequency in Hz.
   * ``i2c_bus`` -- I2C peripheral number.

   Master and slave addresses must match. External pull-ups are required on SCL and SDA, and both
   devices must share a common ground.


class rpc_i2c_slave -- I2C Slave Interface
------------------------------------------

Be controlled by another ``rpc`` device over I2C.

.. class:: rpc_i2c_slave(slave_addr: int = 0x12, i2c_bus: int = 2)

   * ``slave_addr`` -- 7-bit I2C address this slave responds to.
   * ``i2c_bus`` -- I2C peripheral number.


class rpc_spi_master -- SPI Master Interface
--------------------------------------------

Control another ``rpc`` device over SPI.

.. class:: rpc_spi_master(cs_pin: str = "P3", freq: int = 1000000, clk_polarity: int = 1, clk_phase: int = 0, spi_bus: int = 2)

   * ``cs_pin`` -- chip-select pin name.
   * ``freq`` -- SPI bus clock frequency in Hz.
   * ``clk_polarity`` -- idle clock level (0 or 1).
   * ``clk_phase`` -- sample data on the first (0) or second (1) clock edge.
   * ``spi_bus`` -- SPI peripheral number.

   Master and slave settings must match. Connect CS, SCLK, MOSI, MISO directly. Both devices must
   share a common ground.


class rpc_spi_slave -- SPI Slave Interface
------------------------------------------

Be controlled by another ``rpc`` device over SPI.

.. class:: rpc_spi_slave(cs_pin: str = "P3", clk_polarity: int = 1, clk_phase: int = 0, spi_bus: int = 2)

   * ``cs_pin`` -- chip-select input pin name.
   * ``clk_polarity`` -- idle clock level (0 or 1).
   * ``clk_phase`` -- sample data on the first (0) or second (1) clock edge.
   * ``spi_bus`` -- SPI peripheral number.


class rpc_uart_master -- UART Master Interface
----------------------------------------------

Control another ``rpc`` device over Async Serial (UART).

.. class:: rpc_uart_master(baudrate: int = 9600, uart_port: int = 3)

   * ``baudrate`` -- serial baud rate.
   * ``uart_port`` -- UART peripheral number.

   Master and slave baud rates must match. Connect master TX to slave RX and master RX to slave
   TX. Both devices must share a common ground.


class rpc_uart_slave -- UART Slave Interface
--------------------------------------------

Be controlled by another ``rpc`` device over Async Serial (UART).

.. class:: rpc_uart_slave(baudrate: int = 9600, uart_port: int = 3)

   * ``baudrate`` -- serial baud rate.
   * ``uart_port`` -- UART peripheral number.
