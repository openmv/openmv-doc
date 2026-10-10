TCP -- a reliable stream of bytes
=================================

TCP, the Transmission Control Protocol, is the other
transport-layer service on top of IP. Where UDP is best
described as "send a packet and hope", TCP is "open a
connection between two endpoints and treat it as a
two-way pipe of bytes that the other side definitely
gets, in order, and exactly once". Most internet
traffic uses it, and most of what the camera does on the
network uses it too.

What TCP adds to IP
-------------------

TCP does much more than UDP. It adds:

* **A connection.** Before any data flows, the two
  endpoints exchange a short handshake to agree they
  are talking. The connection has a state -- "open",
  "half-closed", "closed" -- that both sides track.
* **Reliable delivery.** Every byte the sender puts
  in is acknowledged by the receiver. Anything not
  acknowledged within a timeout is sent again. The
  application never sees a lost byte; it sees a delay
  while the protocol resends.
* **In-order delivery.** Bytes arrive in the same order
  they were sent. Even if packets arrive at the
  receiver out of order, TCP re-orders them before the
  application reads.
* **Flow control.** If the receiver is slow, the sender
  is told to slow down; the connection adapts to the
  weaker end's rate.
* **Congestion control.** If the network in the middle
  starts dropping packets, the sender backs off until
  things recover. This keeps any one connection from
  taking down a saturated link.

All of this is automatic. The Python API the
application uses is simply ``send(bytes)`` and
``recv(n)``; TCP handles everything else underneath.

The handshake
-------------

A TCP connection opens with a three-way exchange before
any data is allowed through:

.. figure:: ../figures/tcp-handshake.svg
   :alt: A diagram with two columns labelled "client"
         and "server". An arrow from client to server
         labelled "SYN", then an arrow from server to
         client labelled "SYN-ACK", then an arrow
         from client to server labelled "ACK". Below
         that a thick arrow labelled "data flowing
         both ways".

   The three-way handshake. Once both sides have
   acknowledged, the connection is open and data can
   flow.

The client sends a *SYN* (synchronise) packet asking to
open. The server replies with *SYN-ACK* (synchronise +
acknowledge), accepting. The client sends a final *ACK*
to confirm. After this round trip, both sides agree the
connection is open and have synchronised their counters
for tracking which bytes have been sent and received.

The handshake costs one round-trip-time of latency
before the first useful byte gets through. For local
networks that is a millisecond; for cross-continent
connections that is roughly 100 ms. This is the main
cost of TCP and the reason short, one-shot messages
are sometimes better off using UDP instead.

The closing handshake
~~~~~~~~~~~~~~~~~~~~~

TCP connections also close with an exchange (a *FIN*
from each side). Either end can close its half of the
connection independently; a *half-closed* state where
one side has finished sending but the other is still
talking is legal, though uncommon. The application
normally just calls ``close()`` and lets the protocol
handle the shutdown sequence.

What TCP does *not* guarantee
-----------------------------

A few things TCP is sometimes assumed to do but does
not:

* **Message boundaries.** The application sends a
  *stream of bytes*, not a stream of messages. Two
  ``send(b"hello")`` calls might arrive as one
  ``recv()`` of ``b"hellohello"``, or as two
  ``recv()``\ s of varying sizes. If the application
  wants message framing, it has to add the framing
  itself (a newline, a length prefix, whatever).
  Sending JSON documents over TCP, for example, needs
  each document separated by a newline or some other
  marker.
* **Encryption.** TCP carries the bytes the
  application gave it, in the clear, all the way. If
  the contents need to be confidential, the
  application has to wrap the connection in TLS (see
  :doc:`/openmvcam/tutorial/networking/encrypted-sockets`).
* **Authentication.** TCP makes sure the bytes arrived
  intact. It says nothing about *who* sent them.
  Authentication is also a higher-layer concern.
* **Liveness on a quiet connection.** If neither side
  sends data for a long time, the connection is
  technically still open but cannot detect that the
  other end has crashed or disappeared. *Keepalive*
  probes can be enabled on the socket to fix this when
  it matters.

When to use TCP
---------------

TCP is the right answer for almost any conversation
that fits the shape "client opens a connection to a
server, they exchange some bytes, the connection
closes when done". HTTP and HTTPS requests, SSH
sessions, database queries, file transfers, image
uploads -- all over TCP.

Reach for UDP only when the conversation does not fit
that shape: independent self-contained messages where
loss is acceptable, multicast traffic, time
synchronisation, name lookups, or extreme
latency-sensitive cases where the handshake cost is
prohibitive.

With ports, UDP, and TCP all on the table, the
transport layer story is done. The Python API that
exposes both is on the next page:
:doc:`../sockets/socket-objects`.
