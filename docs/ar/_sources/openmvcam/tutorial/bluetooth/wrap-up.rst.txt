Wrap up
=======

You have walked through Bluetooth Low Energy from the
radio up to the Python API used to drive it:

* **The motivation** -- BLE is the answer when the
  camera wants to talk to something close by without
  any infrastructure between them. A phone in the same
  room, a wearable on a wrist, a beacon on a wall.
  Short range, no network to join, almost no power.

* **The radio** -- 2.4 GHz, 40 channels: three for
  advertising, 37 for connection data, hopped on a
  pseudo-random sequence with adaptive avoidance of
  noisy channels. Brief packets, mostly-asleep radios.

* **The link layer** -- packet framing, addressing,
  connection scheduling, retransmission, and link-layer
  encryption. None of it is configured from Python; all
  of it shows through in the connection parameters and
  the MTU.

* **Generic Access Profile (GAP)** -- discovery and
  connection management. Four roles: peripheral and
  broadcaster (advertise), central and observer (scan).
  Advertising payloads carry the local name, service
  UUIDs, appearance, and manufacturer-specific data --
  31 bytes plus an optional 31-byte scan response. The
  connection interval, peripheral latency, and supervision
  timeout govern what an open connection feels like.

* **Generic Attribute Profile (GATT)** -- a tree of
  services, each holding characteristics, each
  optionally holding descriptors, identified by UUIDs
  (16-bit for Bluetooth-SIG standards, 128-bit for
  custom ones). Five operations: *read* and *write*
  (pull, client-initiated), *notify* and *indicate*
  (push, server-initiated, subscribed via the
  Client Characteristic Configuration Descriptor).
  Payload size is bounded by the negotiated MTU.

* **The Python API** -- :mod:`aioble` turns every BLE
  pattern into an asyncio coroutine. A peripheral is
  :func:`aioble.advertise` looping over connections,
  with :class:`~aioble.Service` /
  :class:`~aioble.Characteristic` objects built once
  and committed by
  :func:`aioble.register_services`. A central is
  :func:`aioble.scan` to find a peer,
  :meth:`~aioble.Device.connect` to open the link,
  :meth:`~aioble.DeviceConnection.service` and
  :meth:`~aioble.ClientService.characteristic` to walk
  the remote GATT tree, then :meth:`~aioble.ClientCharacteristic.read`
  / :meth:`~aioble.ClientCharacteristic.write` /
  :meth:`~aioble.ClientCharacteristic.subscribe` /
  :meth:`~aioble.ClientCharacteristic.notified` for the
  actual data. Disconnects surface as
  :exc:`aioble.DeviceDisconnectedError` inside the
  coroutine that was waiting.

* **L2CAP channels** -- the escape hatch for bulk
  byte streams that do not fit GATT's key/value model.
  :meth:`aioble.DeviceConnection.l2cap_accept` /
  :meth:`~aioble.DeviceConnection.l2cap_connect` open a
  per-application channel on top of the GAP
  connection, with credit-flow-controlled send / recv
  and a larger MTU than GATT can carry.

* **Pairing and encryption** -- BLE links are public
  by default. :meth:`aioble.DeviceConnection.pair`
  initiates a key exchange that produces an encrypted
  link; ``bond=True`` (the default) persists the keys
  so subsequent connections skip the handshake. Without
  ``mitm=True`` and a usable IO capability, encryption
  protects against passive eavesdroppers but not
  against an active redirect during the original
  pairing.

That is enough to write camera applications that
publish status as a peripheral, read sensor data as a
central, push live values to a phone over BLE, secure
the link with a pair-and-bond step, and -- for the rare
bulk-transfer case -- step off GATT into an L2CAP
channel.

Troubleshooting
---------------

BLE failures are mostly mismatches between what the two
sides expect, and a phone-side inspector is the fastest
way to see whose expectations are off. The standard
tool is **nRF Connect for Mobile** (Nordic Semiconductor,
free on Android and iOS): it scans, connects, walks the
GATT database, reads and writes characteristics, and
subscribes to notifications -- so the camera-side
behaviour can be tested in isolation, without writing a
companion app at all.

The common failure modes:

* **"My device shows up in the scanner but won't
  connect."** Most often the advertising packet has
  ``connectable=False`` (broadcaster mode), or a
  previous connection is still open and the cam is
  already past :func:`aioble.advertise`. Add print
  statements around the advertise call to confirm.

* **"exchange_mtu(512) ran but my notifications are
  still capped at 20 bytes."** The negotiated MTU is
  ``min(local, peer)`` -- the phone or central library
  may not have requested a larger MTU on its side, in
  which case the connection stays at 23. Inspect
  :attr:`~aioble.DeviceConnection.mtu` after
  :meth:`~aioble.DeviceConnection.exchange_mtu`
  returns. Also note that
  :meth:`~aioble.DeviceConnection.exchange_mtu` only
  works once per connection; call it before the first
  large operation.

* **"Pairing fails with a generic error."** Two usual
  culprits: the IO-capability mismatch (asking for
  ``mitm=True`` on a cam declaring ``io=3`` / no input
  no output -- there is no way to confirm the numeric
  code, so the pairing engine bails), and a wildly
  wrong wall-clock time on the cam when the peer
  requires it. Set the clock with
  :func:`ntptime.settime` before the first pairing
  attempt.

* **"Notifications never arrive at the client."** Two
  things to check, in order: (a) was the characteristic
  declared with ``notify=True``? -- the property bit
  must be set on the server side; (b) did the client
  call :meth:`~aioble.ClientCharacteristic.subscribe`?
  -- without writing the Client Characteristic
  Configuration Descriptor (CCCD), the server is told
  no client wants notifications and silently drops
  them.

* **"The advertised name is truncated or missing."**
  The advertising payload is 31 bytes, and the
  flags + service-UUID + appearance fields each take
  bytes off the top. A long ``name=`` plus several
  service UUIDs overflows. Either shorten the name or
  use active scanning so the scan response (another
  31 bytes) carries the overflow. nRF Connect shows
  both halves separately, which makes the split
  obvious.

* **"L2CAP connect raises immediately."** Usually a PSM
  mismatch -- both sides have to agree on the same PSM
  number out of band. A
  :exc:`~aioble.L2CAPConnectionError` carries the
  Bluetooth status code as its first argument; status
  ``2`` ("PSM not supported") is the giveaway.

* **"Bonded connections still trigger a full pairing
  handshake on every reconnect."** :func:`aioble.security.load_secrets`
  was not called at startup. Without it, the saved
  keys are on flash but never loaded into memory, so
  the peer's identity is unknown and pairing runs from
  scratch every time.

When all else fails, the lower-level :mod:`bluetooth`
module exposes an IRQ callback that fires for every
underlying event; subscribing to it briefly and printing
the events is the equivalent of a Wireshark trace for
the cam side.

Using this reference later
--------------------------

Treat the Bluetooth chapters as reference material;
coming back for the exact layout of a peripheral's
advertising payload or the central scan-and-subscribe
flow is the intended use. The :doc:`/library/aioble`
and :doc:`/library/bluetooth` reference pages list
every method, flag, and constant in one place when the
question is just "what is the exact name of this call".
