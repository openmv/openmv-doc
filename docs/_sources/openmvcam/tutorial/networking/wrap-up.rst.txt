Wrap up
=======

You have walked through the layers a network message
crosses on its way from the camera to the rest of the
world:

* **The motivation** -- networks exist because
  point-to-point wiring stops scaling the moment more
  than a couple of devices need to talk, or the
  counterpart is not on the same wire, or many
  programs share the same link at once. The answer is
  shared media, logical addresses, and routing.

* **The layered model** -- five layers, each solving
  one problem and offering a clean interface to the
  next. Physical and link layers handle bits and
  frames between immediate neighbours, the network
  layer handles addressing and routing across the
  internet, the transport layer handles
  program-to-program delivery, and application
  protocols build on all of that.

* **The bottom layers** -- Ethernet and Wi-Fi as
  practical link technologies; MAC addresses identify
  hardware on a local segment. The camera's
  :mod:`network` module exposes one knob worth
  knowing about: which Wi-Fi network to join. After
  that, everything below is automatic.

* **The network layer (IP)** -- IPv4 and IPv6
  addresses identify hosts independently of which
  cable they are plugged into. Routers hop packets
  between local segments until they arrive. Private
  address ranges and NAT are why home and office
  networks have their own internal address space and
  one shared public address at the edge; outbound
  traffic works freely, inbound needs help.

* **The transport layer** -- ports identify
  *programs* inside a host; the full ``(IP, port)``
  pair identifies one specific socket. UDP is a thin
  layer that sends one self-contained datagram at a
  time with no guarantees -- fast, cheap, and the
  right tool when loss is acceptable. TCP is a
  connection-oriented, reliable, ordered byte stream
  -- the workhorse for most internet traffic, paid
  for with one round-trip of handshake latency.

* **The Python API** -- :class:`socket.socket` is the
  one class for both protocols.
  :meth:`~socket.socket.sendto` /
  :meth:`~socket.socket.recvfrom` for UDP; the
  connect-or-listen patterns plus
  :meth:`~socket.socket.send` /
  :meth:`~socket.socket.recv` for TCP. Sockets pair
  cleanly with :mod:`asyncio`:
  :func:`asyncio.open_connection` and
  :func:`asyncio.start_server` give every TCP
  connection a reader/writer pair, so many concurrent
  conversations share one event loop without
  threading.

* **Names and time** --
  :func:`socket.getaddrinfo` turns a name like
  ``example.com`` into an IP address ready to hand to
  a socket. :func:`network.hostname` sets the cam's
  own name, which routers register under their local
  DNS and which the cam's built-in mDNS responder
  answers for as ``<name>.local``.
  :func:`ntptime.settime` is the same "look up a
  thing on the network" idea applied to the
  wall-clock time, setting the on-board clock to UTC
  from a public NTP server.

* **Encryption** -- :mod:`ssl` wraps a socket in TLS.
  The cam ships with no certificate authority store,
  so out of the box you get encryption only -- the
  conversation is no longer in the clear, but the cam
  is not verifying who answered. For real
  authentication -- verifying public HTTPS servers,
  running the cam as a TLS server, mutual TLS -- the
  certificate-based workflow is covered in
  :doc:`/openmvcam/tutorial/production/tls/index`.
  DTLS (TLS over UDP) uses the same module the same
  way.

That is enough to write camera applications that talk
to other machines, publish data to remote services,
accept connections from clients on the local network,
and do all of it concurrently with the rest of the
camera's work.

Using this reference later
--------------------------

Treat the networking chapters as reference material;
coming back for the exact shape of a UDP listener or
the TLS-with-asyncio pattern is the intended use. The
:doc:`/library/network`, :doc:`/library/socket`,
:doc:`/library/ssl`, and :doc:`/library/ntptime`
reference pages list every method, flag, and constant
in one place when the question is just "what is the
exact name of this call".

Where to go from here
---------------------

**Web servers** is the next major topic. With sockets
working and TLS available, the natural next layer up
is the protocols that build on them: HTTP for serving
content and APIs, WebSockets for keeping connections
open both ways, and the small frameworks that hide
the boilerplate. Everything from this section carries
forward -- a web server is, after all, just a TCP
server that speaks HTTP on its accepted sockets,
often with TLS wrapping the whole thing.
