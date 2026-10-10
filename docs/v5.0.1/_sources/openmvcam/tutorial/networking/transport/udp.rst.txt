UDP -- send a packet, hope for the best
=======================================

UDP, the User Datagram Protocol, is the simpler of the
two services the transport layer offers. Each UDP send
is one *datagram* -- a self-contained chunk of bytes
addressed to an IP and a port, dropped into the network
on its own. The protocol delivers it if it can; if it
cannot, it does not retry, does not warn the sender, and
does not preserve any ordering between datagrams.

What UDP adds to IP
-------------------

UDP is a thin layer on top of IP. It adds three things
to the raw IP delivery:

* **Port numbers** at both ends, so a datagram can be
  delivered to the right *program* on the destination
  host, not just the host (see :doc:`ports`).
* **A length field** so the receiver knows exactly how
  many bytes of payload to read.
* **A small checksum** over the header and payload, so
  the receiver can detect a corrupt datagram and discard
  it.

That is it. Everything else IP did or did not do, UDP
keeps. Datagrams are not retried. They can arrive out of
order. They can be duplicated by quirks of the
underlying network. They can be silently dropped if the
network is congested, the buffer at the destination is
full, or one of the routers in between decides to.

.. figure:: ../figures/udp.svg
   :alt: A diagram with sender on the left and
         receiver on the right. Three arrows point
         from sender to receiver, labelled "datagram 1",
         "datagram 2", "datagram 3". The arrow for
         datagram 2 is shown as a dashed line with an
         X over it, indicating loss.

   Each UDP datagram is sent independently. If one is
   lost in transit, nothing tells the sender or the
   receiver -- the gap is silent.

Why anyone would use it
-----------------------

If UDP is so unreliable, why have it at all? Three
reasons.

* **Speed and overhead.** A UDP send is a single packet
  going out; no handshake, no acknowledgements, no
  connection state to maintain. Latency and bandwidth
  cost are minimal.
* **Independent messages.** Some traffic is a stream of
  *status updates* where every message is a fresh
  snapshot and an old one is worthless. A camera
  publishing "I am still alive, here is my current
  reading" every second cares about delivering each
  *new* reading, not about replaying the readings that
  got lost.
* **Multicast.** A single UDP datagram can be sent to
  many receivers at once. (TCP cannot do that; every
  TCP connection is between exactly two endpoints.)
  Useful for service discovery, telemetry to many
  listeners, video streaming.

Where the network is good and the sender's tolerance
for loss is high, UDP is the right answer. Where
delivery and ordering have to be guaranteed, UDP either
needs another layer of reliability on top, or the
application should just use TCP instead.

When *not* to use it
--------------------

The opposite is also worth being explicit about. UDP is
the wrong choice when:

* **Every byte matters.** Configuration data, code
  updates, signed transactions -- any case where a
  missing byte makes the result wrong.
* **Order matters.** UDP datagram 2 might arrive
  before datagram 1.
* **The message is large.** Big payloads have to be
  split into smaller datagrams by the application; the
  transport layer will not do it. If any one piece is
  lost the whole message is incomplete.

If any of those apply, reach for TCP instead.

Concrete examples on a camera
-----------------------------

Camera-side examples of UDP traffic in the wild:

* **Discovery.** A camera broadcasts a "who is here"
  datagram to the local network on startup; other
  devices reply.
* **Telemetry.** Once a second, the camera sends a
  small datagram with its current sensor readings to a
  collector. Losing the occasional sample does not
  matter because the next one arrives in a second
  anyway.
* **Time synchronisation.** NTP, the network time
  protocol, runs over UDP. The client sends a small
  request, the server replies with the current time; if
  the reply is lost, the client just asks again later.
* **DNS lookups.** Asking the network "what IP does
  this name map to?" runs over UDP. (Covered on
  :doc:`../names/dns`.)

The Python API for sending and receiving datagrams is on
:doc:`../sockets/udp-sockets`, after the rest of the
transport layer story is in place.
