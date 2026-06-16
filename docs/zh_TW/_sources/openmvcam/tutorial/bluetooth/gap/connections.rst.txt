Connections
===========

Once a central picks a peripheral from the advertising
stream and sends it a *connect request*, both sides drop
out of advertising / scanning mode and into a *connection*.
The radio now schedules its activity on the data channels
of the link layer, hopping pseudo-randomly between them
on the sequence agreed at connection time. Everything
above the link layer -- GATT, security, L2CAP -- runs on
top of the connection that is established here.

The connection event
--------------------

Two devices in a BLE connection do not stream
continuously. They agree on a *connection interval*, and
at every interval both sides wake up the radio, exchange
whatever packets are queued, acknowledge what they have
received, and go back to sleep. Each of those exchanges
is called a *connection event*.

.. figure:: ../figures/connection-events.svg
   :alt: A timeline with the central on the top track and
         the peripheral on the bottom track. At each
         connection interval boundary both tracks show a
         short pulse labelled "TX/RX". The gap between
         pulses is labelled "connection interval"; the
         duration of each pulse is "connection event".
         The peripheral has a few skipped events labelled
         "peripheral latency: peripheral may skip if idle".

   The radio on each side is awake only during the brief
   connection events, with everything else asleep. The
   peripheral may skip events under *peripheral latency*.

The numbers that govern this are negotiated at connect
time and the link layer enforces them. They are visible
to the application both as request-side knobs and as
the resulting values reported back.

* **Connection interval.** 7.5 ms to 4 s, in 1.25 ms
  steps. The central picks the value the peripheral
  asks for unless the request is unreasonable. Shorter
  intervals deliver data with lower latency at the
  cost of more radio activity; longer ones save power
  but make every round trip slower.
* **Peripheral latency.** A non-negative integer N.
  The peripheral is allowed to skip up to N connection
  events with nothing to send, going back to sleep
  instead of waking the radio for an empty exchange.
  Useful for sensors that wake to report once a second
  but want a low *responsive* connection interval for
  the rare immediate message.
* **Supervision timeout.** 100 ms to 32 s. If either
  side hears nothing from the other for this long, the
  link is declared lost and both sides go back to
  advertising / scanning. The timeout must be longer
  than ``connection_interval * (1 + peripheral_latency)``
  -- the link layer rejects values that violate that.

:meth:`aioble.Device.connect` takes
``min_conn_interval_us`` and ``max_conn_interval_us`` so
the central can request a particular range; the actual
value the radio settled on can be read back through the
link-layer configuration after the connection is up.

What "central" and "peripheral" mean inside a connection
--------------------------------------------------------

The roles set at advertising time stick after the
connection comes up:

* The *central* drives the timing -- it owns the master
  side of the hopping sequence and the connection
  events.
* The *peripheral* is reactive. It can request a change
  to the connection parameters (a slower interval to
  save power, say) but the central decides whether to
  accept.

The roles are independent of who hosts the GATT
database, which is a separate axis. By convention the
peripheral is also the GATT *server* and the central is
the GATT *client*, but BLE allows either side to host
GATT services. Cameras almost always follow the
convention: peripheral + server for "the camera publishes
data" applications, central + client for "the camera
reads from a sensor" applications.

The maximum transmission unit (MTU)
-----------------------------------

The link layer carries packets that are short by
default -- 27 bytes of payload, of which only 23 are
available to GATT. That is enough for a small reading
or a short command but tiny next to anything
multi-byte. Both sides can negotiate this upward, up to
the limit the radio firmware supports (typically a few
hundred bytes on modern controllers).

The ``aioble`` API drives the negotiation through
:meth:`aioble.DeviceConnection.exchange_mtu` and the
result becomes available on the
:attr:`~aioble.DeviceConnection.mtu` attribute. Larger
MTUs mean fewer round trips for any value bigger than
~20 bytes, at a small cost in buffer memory.

Lifetime
--------

A connection lasts until one of:

* either side calls
  :meth:`~aioble.DeviceConnection.disconnect`,
* the supervision timeout fires (out-of-range, radio
  off, peer crashed), or
* an explicit link-layer failure (encryption mismatch,
  pairing rejection).

When the connection drops, every GATT operation queued
or in flight on it raises
:exc:`aioble.DeviceDisconnectedError`, and any
``async with connection`` blocks the application is in
exit cleanly. A peripheral typically responds by going
back to :func:`aioble.advertise` and waiting for the
next central; a central responds by either scanning
again or surfacing the disconnect to the application.

The lifetime is one of the reasons :mod:`aioble` is
useful. A synchronous BLE API would have to expose
disconnect callbacks and event masks; the asyncio
version turns disconnects into exceptions inside the
coroutine that was waiting for the operation, which is
what ``async with`` cleanup is built for.
