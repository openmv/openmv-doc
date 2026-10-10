L2CAP channels
==============

GATT is a key/value model. The operations it offers
(read, write, notify, indicate) move one short value at
a time, and the largest single payload they can carry
is whatever the negotiated MTU allows -- a few hundred
bytes at best. That works well for sensor readings,
command registers, and status flags. It falls apart on
kilobytes or megabytes: splitting a long blob into
hundreds of small writes costs round trips that the
radio is much faster than.

For bulk-data flows -- a captured frame the camera
streams to a phone, an over-the-air update image, a
batched export of measurements -- BLE offers an
alternative path: the *Logical Link Control and
Adaptation Protocol*, L2CAP. L2CAP sits between the link
layer and GATT and lets an application claim its own
*connection-oriented channel* on top of the same radio
link. The channel is a credit-flow-controlled byte path
with a much larger per-packet MTU and no GATT framing
in the middle.

When to use L2CAP
-----------------

L2CAP channels are the right tool when:

* The transfer is more than a few hundred bytes.
* The two ends both know an L2CAP channel will be used
  (it is not exposed in the advertising payload; the
  client has to know the channel's *protocol/service
  multiplexer*, or PSM, number out of band).
* The application is willing to give up the GATT
  niceties: no built-in addressability by UUID, no
  client-discoverability through standard apps, no
  notifications.

The most common case in :mod:`aioble`-based applications
is moving a binary blob between two pieces of software
that both know about the PSM convention -- a custom
camera-to-phone protocol, a pair of openmv cameras
talking to each other, an internal firmware-update path
under a peripheral's GATT service.

For everything else, stay on GATT. A short status, a
control register, a sensor reading -- all of those
belong in a characteristic.

Establishing a channel
----------------------

L2CAP runs *on top of* an existing
:class:`aioble.DeviceConnection`, so the GAP-side
discovery / advertising / connecting flow is exactly the
same as for GATT. Once both sides hold a connection,
one side listens on a PSM, the other side connects to
it.

The PSM is just a small integer. The Bluetooth SIG
reserves the bottom of the range for standardised use
(``0x0001``-``0x007F``); for application-specific
channels use a number from the dynamic range
(``0x0080``-``0x00FF`` for fixed PSMs, ``0x0040``
onwards typically free for custom use). Both sides have
to agree on the value beforehand.

The MTU on an L2CAP channel is the largest single SDU
(*Service Data Unit*) either side will deliver in one
:meth:`~aioble.L2CAPChannel.send` -- not the BLE link
MTU. Aioble fragments larger payloads automatically.
The camera's BLE host caps L2CAP MTU at 1017 bytes;
``512`` is a sensible default that leaves room on both
sides without burning RAM.

On the listener side (e.g. the camera as a peripheral)::

    async def serve_l2cap(connection, image_bytes):
        channel = await connection.l2cap_accept(psm=0x80, mtu=512)
        async with channel:
            # image_bytes is a bytearray -- e.g. csi0.snapshot().bytearray()
            # or a compressed JPEG buffer. send() fragments into MTU-sized
            # chunks automatically and awaits flow-control credits between.
            await channel.send(image_bytes)
            await channel.flush()

On the connector side (e.g. a phone or central)::

    async def open_l2cap(connection, total_bytes):
        channel = await connection.l2cap_connect(psm=0x80, mtu=512)
        async with channel:
            image_bytes = bytearray(total_bytes)
            view = memoryview(image_bytes)
            received = 0
            while received < total_bytes:
                n = await channel.recvinto(view[received:])
                if n == 0:
                    break
                received += n
            return image_bytes

:meth:`~aioble.DeviceConnection.l2cap_accept` blocks
until the peer connects (or ``timeout_ms`` fires);
:meth:`~aioble.DeviceConnection.l2cap_connect` blocks
until the listener accepts (or fails). Both return an
:class:`aioble.L2CAPChannel` -- itself an async context
manager that closes the channel on exit.

Sending and receiving
---------------------

The two main operations on a channel are
:meth:`~aioble.L2CAPChannel.send` (writes bytes to the
peer) and :meth:`~aioble.L2CAPChannel.recvinto` (reads
into a pre-allocated buffer). Both are coroutines.

* :meth:`~aioble.L2CAPChannel.send` fragments the
  buffer into MTU-sized chunks and awaits link-layer
  flow-control credits between them. A long send is
  one ``await`` from the application's perspective;
  internally it may queue many packets and pause
  whenever the peer's receive credits run out.
* :meth:`~aioble.L2CAPChannel.recvinto` fills the
  passed buffer with whatever is available (up to the
  channel's MTU) and returns the byte count. Awaits
  if nothing is available.
* :meth:`~aioble.L2CAPChannel.available` returns
  ``True`` synchronously if there is buffered data
  ready -- useful for polling without suspending.
* :meth:`~aioble.L2CAPChannel.flush` awaits until any
  outstanding send has been fully transmitted to the
  controller.

L2CAP channels are stream-like in the sense that the
bytes arrive in order and without loss, but the
boundaries of a single ``send`` are *preserved* -- each
SDU comes out of a single ``recvinto``. That is unlike
TCP, where the boundaries of one ``send()`` may smear
across multiple ``recv()`` calls.

Disconnect handling
-------------------

The channel goes away on three conditions: either side
calls :meth:`~aioble.L2CAPChannel.disconnect`, the
underlying GAP connection drops, or the L2CAP-level
disconnect arrives. Active operations raise
:exc:`aioble.L2CAPDisconnectedError`. As with the GATT
side, this surfaces as an exception in the coroutine
that was waiting, and the ``async with channel`` block
exits cleanly.

If a channel becomes unreachable through a GAP-level
disconnect, the application loops back to advertising
or scanning the same way it would for a GATT
disconnect.

Memory cost
-----------

Larger MTUs and longer queues use more RAM on both
sides. A 512-byte MTU plus a per-channel receive buffer
is around 1 KB per channel -- not free on a small camera
if several channels are open at once. Stick to one
channel per connection and pick an MTU that matches the
expected message size; the default of one
``L2CAPChannel`` per ``DeviceConnection`` is enough for
most applications.

L2CAP is BLE's safety valve. GATT is what almost every
application reaches for first, and the rest of this
section's central / peripheral examples stick to GATT.
The channel-flavoured API is the answer when an
application outgrows the key/value model.
