The aioble module
=================

The Bluetooth Core specification gives a vocabulary
that maps onto two MicroPython modules.

* :mod:`bluetooth` -- the *low-level* binding to the
  BLE controller. Synchronous, event-driven through an
  IRQ-style callback, and structured around byte
  buffers, handles, and the bare GATT primitives. It
  exposes the protocol as it is, not as Python
  applications want to consume it.
* :mod:`aioble` -- a higher-level wrapper, written in
  Python on top of :mod:`bluetooth`, that turns every
  remote operation into an :mod:`asyncio` coroutine
  and every BLE object (services, characteristics,
  connections, scan results, L2CAP channels) into an
  ergonomic Python class. Scans become async iterators;
  connections become async context managers;
  notifications become awaitable.

When to reach for the lower-level module
----------------------------------------

:mod:`bluetooth` is still the right answer for two
narrow cases:

* You are writing the kind of code :mod:`aioble` itself
  is built out of -- a new pattern that needs IRQ-level
  control over the protocol.
* You are running on a hardware target where the
  :mod:`aioble` package is not available, and a thin
  shim around the controller is the only option.

For every camera application, :mod:`aioble` is the
right answer.

Pieces of an aioble program
---------------------------

Every :mod:`aioble`-based application has a small set of
moving parts, regardless of which roles it plays.

* A long-running :mod:`asyncio` event loop. Everything
  in :mod:`aioble` is a coroutine, so the application
  is structured as one or more tasks on a single event
  loop. See :doc:`/openmvcam/tutorial/asyncio/index` for
  the loop, tasks, and exceptions in detail.
* A radio that is on. :mod:`aioble` activates the BLE
  radio implicitly on first use, but it can also be
  controlled explicitly with :func:`aioble.config`
  (which forwards to :meth:`bluetooth.BLE.config` after
  ensuring the radio is up) and shut down with
  :func:`aioble.stop`.
* One or more *roles* in flight at once. On the
  peripheral side: a registered set of GATT services
  (see :func:`aioble.register_services`) and a running
  :func:`aioble.advertise` coroutine. On the central
  side: a running :func:`aioble.scan` iterator or a
  pending :meth:`aioble.Device.connect`. The radio
  multiplexes the work; the application sees each role
  as an independent task.

A minimal peripheral
--------------------

The smallest useful :mod:`aioble` program -- a
peripheral that advertises a single read-only
characteristic -- is short::

    import aioble
    import asyncio
    import bluetooth

    SERVICE_UUID = bluetooth.UUID(0x181A)            # Environmental Sensing
    TEMP_UUID = bluetooth.UUID(0x2A6E)               # Temperature

    service = aioble.Service(SERVICE_UUID)
    temp = aioble.Characteristic(service, TEMP_UUID, read=True)
    aioble.register_services(service)

    async def main():
        while True:
            conn = await aioble.advertise(
                interval_us=250000,
                name="openmv-temp",
                services=[SERVICE_UUID],
            )
            async with conn:
                await conn.disconnected()

    asyncio.run(main())

A central that does nothing more than connect and read
once is similarly short::

    import aioble
    import asyncio
    import bluetooth

    SERVICE_UUID = bluetooth.UUID(0x181A)
    TEMP_UUID = bluetooth.UUID(0x2A6E)

    async def main():
        device = None
        async with aioble.scan(duration_ms=5000, active=True) as scanner:
            async for result in scanner:
                if SERVICE_UUID in result.services():
                    device = result.device
                    break
        if device is None:
            return

        async with await device.connect() as conn:
            service = await conn.service(SERVICE_UUID)
            char = await service.characteristic(TEMP_UUID)
            print(await char.read())

    asyncio.run(main())

Both programs are about fifteen lines and they cover
the whole flow from "radio is off" to "useful work
done".

Turning the radio off
---------------------

On a battery-powered camera the BLE radio is the
biggest discretionary draw on the budget. Two knobs
matter.

The first is *implicit*: :mod:`aioble` activates the
radio on first use, and the radio sleeps between
scheduled events (advertising bursts, connection
events, scan windows) automatically. Picking longer
intervals on
:func:`aioble.advertise` / :func:`aioble.scan` and
agreeing on a longer connection interval at
:meth:`~aioble.Device.connect` time keeps the radio
off proportionally more of the time. The advertising
table in
:doc:`/openmvcam/tutorial/bluetooth/gap/advertising-and-scanning`
is the practical guide here.

The second is *explicit* shutdown::

    import aioble

    await do_burst_of_ble_work()
    aioble.stop()                             # radio deactivated; in-flight tasks unwound
    await asyncio.sleep(60)                   # sleep with the radio off
    # ... next aioble call brings the radio back up automatically

:func:`aioble.stop` deactivates the underlying BLE
radio and tears down anything in flight -- open
connections drop, scanners and advertisers cancel,
L2CAP channels close. Coroutines that were waiting on
those operations raise their usual exceptions
(:exc:`~aioble.DeviceDisconnectedError` and friends),
which is the cleanup mechanism the surrounding
``async with`` blocks were written for. Calling any
:mod:`aioble` coroutine afterwards activates the
radio again from cold.

The typical pattern for a periodic battery-powered
sensor cam is:

* Wake on a schedule (timer, motion sensor, button).
* Run the burst of BLE work -- advertise, accept a
  connection, push the value, disconnect.
* Call :func:`aioble.stop` and sleep until the next
  wake.

What aioble does not do
-----------------------

:mod:`aioble` deliberately covers GATT, GAP, and L2CAP
-- the layers an application uses. Three pieces are
out of scope:

* **Anything below the link layer.** Channel selection,
  frequency hopping, packet acknowledgements, and
  link-layer encryption all happen inside the BLE port
  and the controller silicon; :mod:`aioble` does not
  expose hooks at that level.
* **Classic Bluetooth.** :mod:`aioble` is BLE-only.
  Audio links, RFCOMM, A2DP, and other classic-profile
  features are not part of the API.
* **Bluetooth Mesh.** The Bluetooth SIG's mesh
  networking layer (a separate stack on top of BLE
  advertising) is not implemented on the camera. The
  cam can advertise and observe, but it cannot
  participate in a mesh network's relay / friend /
  proxy roles.

Exceptions
----------

Four exception types come out of :mod:`aioble`. Each
fires from inside a coroutine that was awaiting an
operation when something went wrong; ``async with``
blocks unwind cleanly when they propagate.

* :exc:`aioble.DeviceDisconnectedError` -- the BLE
  link to the peer dropped while a GATT operation
  (``read``, ``write``, ``notified``, ``indicated``,
  ``subscribe``, ``exchange_mtu``, ...) was in flight.
  Raised inside whichever coroutine was waiting. The
  most common exception by far; catch it in any code
  that should reconnect on loss.
* :exc:`aioble.GattError` -- a GATT operation reached
  the peer but completed with a non-zero ATT status
  (write-with-response rejected, indicate not
  acknowledged, read-not-permitted, ...). The status
  code is on the exception's ``_status`` attribute.
* :exc:`aioble.L2CAPDisconnectedError` -- the L2CAP
  channel dropped while a
  :meth:`~aioble.L2CAPChannel.send`,
  :meth:`~aioble.L2CAPChannel.recvinto`, or
  :meth:`~aioble.L2CAPChannel.flush` was in flight.
  Either side may have closed the channel, or the
  underlying GAP connection went away.
* :exc:`aioble.L2CAPConnectionError` -- raised by
  :meth:`~aioble.DeviceConnection.l2cap_connect` when
  the listener refused or the controller failed the
  channel setup. The Bluetooth status code is the
  first positional argument.

Operations that take an explicit ``timeout_ms`` (the
connect / discovery / read / write / pair calls, plus
:meth:`~aioble.DeviceConnection.timeout` as a wrapper)
additionally raise :exc:`asyncio.TimeoutError` from
:mod:`asyncio` when the deadline elapses before the
operation completes.
