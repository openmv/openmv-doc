Concurrent roles and multiple connections
=========================================

The peripheral and central pages each show a single
role serving a single connection at a time. Real
applications are rarely that simple. A camera may
publish a sensor service to a phone *while also*
reading values from a heart-rate strap, or accept
connections from two simultaneously paired phones.
The :mod:`aioble` API supports both patterns because
the radio multiplexes underneath and every operation
is already a coroutine -- run more coroutines, and
the work happens in parallel on one event loop.

This page collects the patterns that come up.

Multiple clients connecting to one peripheral
---------------------------------------------

The simple peripheral loop on
:doc:`/openmvcam/tutorial/bluetooth/aioble/peripheral`
serves one connected central at a time:

::

    async def serve():
        while True:
            connection = await aioble.advertise(...)
            async with connection:
                await connection.disconnected()

The pattern that lets it accept *more than one* client
is to fire off a per-connection task and immediately
loop back to :func:`aioble.advertise` so the next
client can connect too::

    async def handle_client(connection):
        async with connection:
            # ... per-client work: subscribe their CCCDs,
            # push notifications, await writes ...
            await connection.disconnected()

    async def serve():
        while True:
            connection = await aioble.advertise(
                interval_us=250000,
                name="openmv-env",
                services=[ENV_SERVICE],
            )
            asyncio.create_task(handle_client(connection))

Each connection runs in its own task. The GATT
database is shared -- all clients see the same
services and characteristics -- but per-connection
state lives inside the task. Notifications go to
*every* subscribed client when
:meth:`~aioble.Characteristic.write` is called with
``send_update=True``; directed pushes that should
only reach one client use
:meth:`~aioble.Characteristic.notify` /
:meth:`~aioble.Characteristic.indicate` with the
specific :class:`~aioble.DeviceConnection` argument.

Keep the fan-out small. Each held connection costs
radio time, RAM, and a slot in the controller's
connection table, and the camera is not designed to be
a hub for dozens of clients. Two or three centrals (a
phone, a tablet, a companion microcontroller) are well
within reach; designs that need more belong on a
proper BLE gateway rather than on the cam.

Peripheral and central at the same time
---------------------------------------

A camera can advertise its own service to a phone
while *also* acting as a central to a wearable.
:mod:`aioble` does not have a "mode" switch -- the
advertise loop and the scan-and-connect loop are
just independent coroutines::

    async def be_peripheral():
        while True:
            connection = await aioble.advertise(
                interval_us=250000,
                name="openmv-hub",
                services=[ENV_SERVICE],
            )
            asyncio.create_task(handle_client(connection))

    async def be_central():
        while True:
            sensor = await find_sensor()
            if sensor is None:
                await asyncio.sleep(5)
                continue
            try:
                async with await sensor.connect() as conn:
                    await stream_from_sensor(conn)
            except aioble.DeviceDisconnectedError:
                pass

    async def main():
        await asyncio.gather(be_peripheral(), be_central())

    asyncio.run(main())

The radio time-shares between the two roles -- a
scan window here, an advertising burst there, a
connection event when one of either side's
connections is live. Throughput on each role drops
when both are active because the radio cannot
literally do two things at once, but for the
low-bandwidth conversations BLE was designed for,
the cost is usually invisible.

Two practical things to keep in mind:

* **Both roles need to be in their own coroutine.**
  Calling :func:`aioble.scan` from inside the
  per-client task that handles a connected central
  works, but blocks that client's notifications
  until the scan finishes -- run scanning on its own
  task instead.
* **Only one scan runs at a time.** If you need to
  scan from two different places, share the scan
  iterator or coordinate access; do not enter two
  :func:`aioble.scan` context managers in parallel.

Coordinating multiple connections from one task
-----------------------------------------------

When several connections need to be combined into
one logical operation -- for example, the camera
talks to two sensors at once and only reports the
result after both have answered -- the standard
:mod:`asyncio` primitives apply directly.
:func:`asyncio.gather` runs the per-connection
coroutines concurrently and returns when all have
finished; :func:`asyncio.wait_for` adds a deadline.

::

    async def read_pair():
        async with await sensor_a.connect() as a:
            async with await sensor_b.connect() as b:
                value_a, value_b = await asyncio.gather(
                    read_value(a, A_SERVICE, A_CHAR),
                    read_value(b, B_SERVICE, B_CHAR),
                )
                return value_a, value_b

Same pattern that the asyncio chapter
(:doc:`/openmvcam/tutorial/asyncio/index`) uses for
networking -- BLE coroutines plug into ``gather`` /
``wait_for`` / ``Event`` / ``Lock`` the same way TCP
ones do.

When one role finishes per-cycle and the other does not
-------------------------------------------------------

A cycle in a battery-powered cam might look like:

* Wake.
* As a central, read fresh values from a paired
  sensor strap.
* As a peripheral, advertise for a phone to
  download the day's measurements.
* When both are idle, call :func:`aioble.stop` and
  sleep.

The sequencing is straightforward with two tasks and
an :class:`asyncio.Event`::

    phone_done = asyncio.Event()

    async def serve_phone():
        connection = await aioble.advertise(
            interval_us=250000,
            name="openmv-hub",
            services=[ENV_SERVICE],
        )
        async with connection:
            await stream_measurements(connection)
        phone_done.set()

    async def read_strap():
        async with await strap.connect() as conn:
            await pull_fresh_values(conn)

    async def cycle():
        await asyncio.gather(read_strap(), serve_phone())
        aioble.stop()                              # radio off until next wake
