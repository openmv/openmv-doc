Acting as a central
===================

The other side of the conversation is the *central* --
the device that scans for advertising peripherals, picks
one to talk to, opens a connection, walks the remote
GATT database, and reads or subscribes to characteristics
on it. A camera that collects readings from a wearable
sensor, listens to a beacon, or talks to a companion
microcontroller is a central.

The central pattern in :mod:`aioble` runs through four
stages: scan, connect, discover, operate.

Scanning
--------

:func:`aioble.scan` returns an async context manager
that doubles as an async iterator over discovered
devices. The typical use is to scan until a device of
interest shows up, then break out of the iteration::

    import aioble
    import asyncio
    import bluetooth

    HR_SERVICE = bluetooth.UUID(0x180D)

    async def find_heart_rate():
        async with aioble.scan(duration_ms=5000, active=True) as scanner:
            async for result in scanner:
                if HR_SERVICE in result.services():
                    return result.device
        return None

``duration_ms=5000`` caps how long the scan runs;
``duration_ms=0`` scans forever (until the context
manager exits). ``active=True`` requests scan
responses, which doubles the per-device payload size at
the cost of a small additional transmission from both
sides. The remaining ``interval_us`` / ``window_us``
keyword arguments tune the scanner's own radio duty
cycle and are rarely changed from the defaults.

Each :class:`aioble.ScanResult` exposes the device
address, the last RSSI, the raw advertising and scan
response bytes, and helpers that parse the standard
fields:

* ``result.device`` -- a :class:`aioble.Device` ready
  to call :meth:`~aioble.Device.connect` on.
* ``result.rssi`` -- received-signal-strength
  indicator in dBm, useful for "pick the closest" logic.
* ``result.name()`` -- the local-name string, or
  ``None`` if not advertised.
* ``result.services()`` -- a generator of
  :class:`bluetooth.UUID` for every service the device
  advertises.
* ``result.manufacturer()`` -- a generator of
  ``(company_id, data)`` tuples for the manufacturer-
  specific fields.
* ``result.connectable`` -- whether the most recent
  advertisement was a connectable one.

The same ``ScanResult`` is re-yielded as new advertising
data arrives for the same device, so a passive listener
that just wants to track devices indefinitely can run
the async iterator forever and dispatch on each event.

Connecting
----------

Once a target device is identified, opening a connection
is one ``await``::

    async def talk_to(device):
        connection = await device.connect()           # 10 s timeout
        async with connection:
            # ... do GATT work ...
            pass

:meth:`aioble.Device.connect` takes ``timeout_ms`` (how
long to wait for the connection to come up; default
10 s), and ``min_conn_interval_us`` /
``max_conn_interval_us`` (the requested connection-
interval range from
:doc:`/openmvcam/tutorial/bluetooth/gap/connections`).

Reconnecting to a known peer without scanning
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Once a bond exists with a peer, the address is already
known and another scan-and-pick round is wasted radio
time. Construct a :class:`aioble.Device` directly with
the saved address and skip straight to
:meth:`~aioble.Device.connect`::

    import aioble

    KITCHEN_CAM = aioble.Device(aioble.ADDR_PUBLIC,
                                "aa:bb:cc:dd:ee:ff")

    async def talk_to_kitchen():
        async with await KITCHEN_CAM.connect() as connection:
            # ... GATT work ...
            pass

The first argument is one of
:data:`aioble.ADDR_PUBLIC` (a controller's factory
address) or :data:`aioble.ADDR_RANDOM` (a generated
static or resolvable private address); the second is
either a six-byte ``bytes`` value or a colon-separated
hex string. The :attr:`~aioble.Device.addr_type` and
:attr:`~aioble.Device.addr` attributes of any
:class:`~aioble.Device` (e.g. one obtained earlier from
a :class:`~aioble.ScanResult`) can be persisted and
fed back in here.

The returned :class:`aioble.DeviceConnection` is what
the rest of the central's work hangs off. ``async
with`` ensures the connection is closed when the block
exits -- on success, on cancellation, or on any
exception including
:exc:`aioble.DeviceDisconnectedError` from the peer
going away.

If the central needs a larger characteristic value than
the default 23-byte MTU allows, this is the place to
negotiate it::

    await connection.exchange_mtu(512)

(:meth:`~aioble.DeviceConnection.exchange_mtu` returns
the actually negotiated MTU, which is the minimum of
the requested value and what the peer supports.)

Discovery
---------

Discovery walks the remote GATT database to find the
services and characteristics by their UUIDs. There are
two flavours: targeted (you know the UUID and want one
specific thing) and exhaustive (you want everything).

Targeted -- the common case::

    service = await connection.service(HR_SERVICE)
    if service is None:
        return                                        # no such service

    char = await service.characteristic(HR_MEASUREMENT)
    if char is None:
        return                                        # no such characteristic

:meth:`aioble.DeviceConnection.service` and
:meth:`aioble.ClientService.characteristic` each take a
:class:`bluetooth.UUID` and return the matching object
(or ``None``). Both have a per-discovery
``timeout_ms`` keyword that defaults to 2 s.

Exhaustive::

    async for service in connection.services():
        print("service:", service.uuid)
        async for char in service.characteristics():
            print("  characteristic:", char.uuid, "properties:", hex(char.properties))

This is what generic Bluetooth-explorer apps do --
useful for development, less so for production code
that knows what UUIDs it expects.

Inspecting what a characteristic supports
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Discovery returns the GATT property bitmask the peer
advertised for each characteristic as
:attr:`~aioble.ClientCharacteristic.properties`. The
bits are the GATT-defined ones -- read (``0x02``),
write-without-response (``0x04``), write (``0x08``),
notify (``0x10``), indicate (``0x20``), and friends.
Inspecting the bitmask before issuing an operation
lets a generic client adapt to characteristics whose
capabilities it does not know in advance::

    _PROP_READ = const(0x02)
    _PROP_NOTIFY = const(0x10)

    char = await service.characteristic(STATUS_UUID)
    if char.properties & _PROP_NOTIFY:
        await char.subscribe(notify=True)
        value = await char.notified()
    elif char.properties & _PROP_READ:
        value = await char.read()
    else:
        value = None                                  # nothing the client can do

Production code that already knows the peer's GATT
profile usually does not need this -- the UUIDs were
documented up front. Generic / exploratory clients
(a settings page that walks an unknown device, a
plugin host) lean on it.

Operating
---------

Once the central holds a
:class:`~aioble.ClientCharacteristic`, each GATT
operation is one coroutine call:

* **Read.** Issue a GATT read and get the value back::

      value = await char.read()
      print("value:", value)

  Long reads (values larger than the MTU) are handled
  transparently.

* **Write.** Send a new value to the server::

      await char.write(b"\\x01")

  ``response=True`` waits for a write-response and
  raises :exc:`aioble.GattError` if the server rejects
  the write. ``response=False`` is write-without-
  response: fire-and-forget. ``response=None`` (the
  default) auto-picks based on what the peer advertised.

* **Subscribe.** Enable notifications or indications by
  writing to the characteristic's CCCD::

      await char.subscribe(notify=True)

  After this returns, the central can wait for incoming
  pushes.

* **Notified / indicated.** Wait for the next push from
  the server::

      while True:
          data = await char.notified()
          print("push:", data)

  ``timeout_ms=None`` (the default) waits forever;
  pass an integer in milliseconds to give up after a
  while.

Putting the four together gives the canonical "connect,
subscribe, stream" central program::

    async def stream_heart_rate():
        async with aioble.scan(duration_ms=5000, active=True) as scanner:
            async for result in scanner:
                if HR_SERVICE in result.services():
                    device = result.device
                    break
            else:
                return

        async with await device.connect() as connection:
            service = await connection.service(HR_SERVICE)
            char = await service.characteristic(HR_MEASUREMENT)
            await char.subscribe(notify=True)
            while connection.is_connected():
                data = await char.notified()
                print("hr push:", data)

    asyncio.run(stream_heart_rate())

The whole thing is about a dozen lines and covers the
flow from "no Bluetooth running" to "live data
streaming". The scan iterator matches the
broadcaster/observer pattern, ``connect`` opens the
GAP connection, ``service`` / ``characteristic`` walks
the GATT tree, ``subscribe`` writes the CCCD, and
``notified`` waits for pushes.

Disconnects and reconnection
----------------------------

Anything that happens to the radio link surfaces in the
coroutine that was waiting on it.
:exc:`aioble.DeviceDisconnectedError` is the signal that
the peer went away or the supervision timeout fired; the
exception terminates whatever
:meth:`~aioble.ClientCharacteristic.read`,
:meth:`~aioble.ClientCharacteristic.write`, or
:meth:`~aioble.ClientCharacteristic.notified` call was
in flight, and any ``async with connection`` block exits
cleanly.

A central that should reconnect on loss wraps the work
in its own outer loop::

    async def keep_streaming():
        while True:
            try:
                await stream_heart_rate()
            except aioble.DeviceDisconnectedError:
                print("disconnected, retrying...")
                await asyncio.sleep(2)

Bracketing a sequence with timeout()
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

When several GATT operations in a row should all
complete within one budget -- not each individually
on its own ``timeout_ms`` -- use
:meth:`aioble.DeviceConnection.timeout` to wrap them.
The returned context manager cancels its body if the
budget elapses (raising :exc:`asyncio.TimeoutError`)
or if the peer disconnects (raising
:exc:`aioble.DeviceDisconnectedError`)::

    async with await device.connect() as connection:
        try:
            with connection.timeout(2000):                    # 2 s for the whole block
                service = await connection.service(HR_SERVICE)
                char = await service.characteristic(HR_MEASUREMENT)
                await char.subscribe(notify=True)
        except asyncio.TimeoutError:
            print("discovery + subscribe took too long")

This is the cleaner alternative to wrapping each call
individually in :func:`asyncio.wait_for` and avoids
spurious successes where each call meets its own deadline
but the sequence as a whole runs over. Passing
``timeout_ms=None`` to :meth:`~aioble.DeviceConnection.timeout`
disables the deadline and leaves only the disconnect
guard active.
