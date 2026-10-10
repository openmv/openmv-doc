Acting as a peripheral
======================

The most common camera-side BLE pattern is to act as a
*peripheral* -- publish a small GATT database, advertise
its existence, accept a connection from a phone or a
companion device, and stream values to whoever is on
the other end.

Building the GATT database
--------------------------

The first thing a peripheral does at startup -- even
before turning the radio on -- is build the database it
plans to expose, construct objects for each service and
characteristic, then register the lot::

    import aioble
    import bluetooth

    ENV_SERVICE = bluetooth.UUID(0x181A)              # Environmental Sensing
    TEMP_UUID = bluetooth.UUID(0x2A6E)                # Temperature
    HUMID_UUID = bluetooth.UUID(0x2A6F)               # Humidity

    env = aioble.Service(ENV_SERVICE)
    temp_char = aioble.Characteristic(
        env, TEMP_UUID,
        read=True, notify=True, initial=b"\\x00\\x00",
    )
    humid_char = aioble.Characteristic(
        env, HUMID_UUID,
        read=True, notify=True, initial=b"\\x00\\x00",
    )

    aioble.register_services(env)

Each :class:`aioble.Characteristic` is attached to its
service simply by constructing it with the service as
the first argument. The boolean keyword arguments
(``read``, ``write``, ``write_no_response``, ``notify``,
``indicate``) select which GATT operations the client
will be allowed to perform; passing ``False`` (the
default) means the property bit is not set.

:func:`aioble.register_services` commits the assembled
tree to the GATT server. It must be called once, before
any :func:`aioble.advertise` starts; calling it again
replaces the previous database.

Advertising
-----------

Once the database is in place, advertising is one
coroutine call that waits for a connection::

    async def serve_one():
        connection = await aioble.advertise(
            interval_us=250000,
            name="openmv-env",
            services=[ENV_SERVICE],
            appearance=0x0540,           # Generic Sensor
        )

The keyword arguments map directly onto the advertising
payload fields. ``name`` is the local-name field;
``services`` is the list of service UUIDs the device
hosts (a phone-side scanner can filter on these);
``appearance`` is a hint from the standard 16-bit
appearance values that lets the central display a
sensible icon. Manufacturer-specific data goes in via
``manufacturer=(company_id, data_bytes)``.

A handful of less-common keywords cover the rest of the
advertising flag space:

* ``connectable=False`` -- broadcast-only mode (no
  connection ever accepted). The right choice for
  beacon-style payloads.
* ``limited_disc=True`` -- use the *limited
  discoverable* flag instead of *general
  discoverable*; some operating systems treat the two
  differently in their pairing UI.
* ``adv_data`` / ``resp_data`` -- raw bytes if the
  application needs full control over the layout.
* ``timeout_ms`` -- give up after a fixed time. The
  default is to advertise forever.

When a central connects, :func:`aioble.advertise`
returns the resulting :class:`aioble.DeviceConnection`.
The peripheral stops advertising at this point.

Serving one client
------------------

A peripheral's main loop typically looks like this:

::

    async def serve():
        while True:
            connection = await aioble.advertise(
                interval_us=250000,
                name="openmv-env",
                services=[ENV_SERVICE],
            )
            print("connected:", connection.device.addr_hex())
            async with connection:
                await connection.disconnected()
            print("disconnected; advertising again")

    asyncio.run(serve())

``async with connection`` makes the disconnect cleanup
automatic.
:meth:`~aioble.DeviceConnection.disconnected` is a
coroutine that suspends until either side ends the
connection -- a clean way to keep the peripheral
serving until the central goes away, then loop back to
advertising the next round.

Updating a characteristic
-------------------------

The peripheral updates the local GATT database with
:meth:`aioble.Characteristic.write`::

    temp_char.write(b"\\x9a\\x09")              # 24.58 deg C as sint16, 0.01 units

That changes the value the next ``read`` from any
client would return. By itself, it does *not* push the
new value -- a subscribed client will not see anything
until either the client polls or the peripheral sends
an explicit notification.

The push side is a single keyword on the same call::

    temp_char.write(temp_bytes, send_update=True)

``send_update=True`` notifies (or indicates) every
client that has subscribed to this characteristic. Most
sensor-style code lives in a per-connection task that
loops reading the sensor and writing the value with
``send_update=True`` every second or so::

    async def stream_temperature(connection):
        while connection.is_connected():
            temp_char.write(encode_temperature(read_sensor()), send_update=True)
            await asyncio.sleep(1)

    async def serve():
        while True:
            connection = await aioble.advertise(
                interval_us=250000,
                name="openmv-env",
                services=[ENV_SERVICE],
            )
            async with connection:
                asyncio.create_task(stream_temperature(connection))
                await connection.disconnected()

If you would rather direct a notification at one
specific client rather than the whole subscribed set
(say a connection-private response to that client's
command), :meth:`aioble.Characteristic.notify` and
:meth:`~aioble.Characteristic.indicate` take a
:class:`~aioble.DeviceConnection` argument and an
optional payload.

Receiving writes
----------------

The other direction -- a client *writing* to a
characteristic -- becomes available when the
characteristic is constructed with ``write=True`` or
``write_no_response=True``. The peripheral awaits the
next write with
:meth:`aioble.Characteristic.written`::

    cmd_char = aioble.Characteristic(env, CMD_UUID, write=True, capture=True)

    async def handle_commands():
        while True:
            connection, data = await cmd_char.written()
            print("command from", connection.device.addr_hex(), "=", data)

Without ``capture=True``, ``written()`` returns just
the writing connection; the new value lives in the
characteristic's backing buffer and the application
fetches it with :meth:`~aioble.Characteristic.read`.
If a second write arrives before the application has
read the first, the second value *overwrites* the first
in the buffer and the original value is lost --
``written()`` still wakes the application up, but only
once per "there is something new", not once per write.

The ``capture=True`` keyword fixes that. Each incoming
write is appended to a module-wide queue, and
``written()`` returns a ``(connection, data)`` tuple
for every individual write -- the application loop sees
each one exactly once, in arrival order. Two practical
consequences:

* The queue is bounded and is *shared across every
  capture-enabled characteristic on the device*. Short
  bursts of back-to-back writes are tolerated;
  sustained overrun (writes arriving faster than the
  application drains them) silently drops the
  **oldest** queued entries, and bursty traffic on one
  characteristic can evict pending entries from
  another.
* Pick ``capture=True`` for command-style writes where
  every value matters. Leave it off for state-style
  characteristics where the latest value is the only
  one of interest.

If a read from the client should be answered by code
running on demand rather than a static value, override
:meth:`~aioble.Characteristic.on_read`. The method is
called synchronously when a read comes in; return ``0``
to permit the read (the current value from
:meth:`~aioble.Characteristic.write` will be sent), or a
non-zero ATT error code to reject it::

    import time

    _ATT_ERR_READ_NOT_PERMITTED = const(0x02)
    _MIN_READ_INTERVAL_MS = const(1000)            # at most once per second

    class TempChar(aioble.Characteristic):
        _last_read_ms = 0

        def on_read(self, connection):
            now = time.ticks_ms()
            if time.ticks_diff(now, self._last_read_ms) < _MIN_READ_INTERVAL_MS:
                return _ATT_ERR_READ_NOT_PERMITTED
            self._last_read_ms = now
            self.write(encode_temperature(read_sensor()))
            return 0

    temp_char = TempChar(env, TEMP_UUID, read=True)

The callback samples the sensor and updates the
characteristic's value just before the GATT stack serves
the read, so the client always sees fresh data. The
rate limit stops a client from hammering the sensor
faster than it can be sampled -- any read inside the
one-second cooldown is bounced back as a
``Read Not Permitted`` ATT error rather than a stale
value.

Larger backing buffers -- BufferedCharacteristic
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The backing buffer for a regular
:class:`~aioble.Characteristic` is 20 bytes wide -- the
practical limit at the default 23-byte MTU. A client
that writes more than that into a regular characteristic
gets its value truncated. For larger incoming values or
for queuing back-to-back writes that the application
loop will catch up to later, declare the characteristic
as :class:`~aioble.BufferedCharacteristic` and pick the
buffer size up front::

    blob = aioble.BufferedCharacteristic(
        service, BLOB_UUID,
        max_len=512, append=True,
        write=True, capture=True,
    )

    async def receive_blob():
        while True:
            connection, chunk = await blob.written()
            handle_chunk(connection, chunk)

Two knobs distinguish it from a plain
:class:`~aioble.Characteristic`:

* ``max_len`` is the size of the backing buffer in
  bytes. Pick it to match the largest single write the
  client is expected to make (after MTU negotiation).
* ``append=True`` makes sequential writes *append*
  into the buffer rather than overwriting -- useful for
  receiving a value that arrives across several writes
  (firmware-update chunks, log lines). With
  ``append=False`` the buffer behaves like a normal
  characteristic, just wider.

All the other constructor flags (``read``, ``write``,
``notify``, ``indicate``, ``capture``, ``initial``)
forward unchanged to the underlying characteristic.

Standard services and the SIG-assigned UUIDs
--------------------------------------------

Sticking to the assigned-numbers UUIDs (``0x180F`` for
Battery Service, ``0x181A`` for Environmental Sensing,
``0x180D`` for Heart Rate, and so on) means a phone's
generic Bluetooth menu or any third-party scanner app
can identify the device's purpose without any custom
client code. The byte layout inside each standard
characteristic is also fixed by the spec -- Battery
Level (``0x2A19``) is a single byte 0..100; Temperature
(``0x2A6E``) is little-endian sint16 in 0.01 deg-C
units. For applications that do *not* fit a standard
service, generate a 128-bit UUID once and use it
across the device's services and characteristics.

A peripheral that publishes only custom UUIDs is still
fine -- it just needs a custom client app that knows
about those UUIDs.

.. note::

   BLE values are **little-endian everywhere** -- the
   GATT spec, every standard characteristic, every
   advertising field. Multi-byte integers go on the
   wire low byte first. The ``<`` prefix in
   :mod:`struct` format strings is what you want for
   encoding/decoding (``"<h"``, ``"<H"``, ``"<I"``,
   ...); using the default native byte order on a
   little-endian MCU happens to work for now, but
   spelling out ``<`` is the safe habit.

The radio behind it all
-----------------------

The radio is on the moment the first :mod:`aioble`
coroutine touches it. Until a central is connected the
peripheral spends its time switching between brief
advertising bursts and sleep; after a connection it
follows the negotiated connection interval. The
peripheral pays a small power cost per advertisement,
so the choice of ``interval_us`` on
:func:`aioble.advertise` is the most direct knob a
peripheral has for trading discovery latency against
battery life.
