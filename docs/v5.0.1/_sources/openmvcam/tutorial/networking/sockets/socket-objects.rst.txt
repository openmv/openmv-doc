Socket objects
==============

The Python interface to the transport layer is the
:class:`socket.socket` class. A *socket* represents one
endpoint of a network conversation -- an address, a
port, and the protocol (UDP or TCP) the conversation
runs over. The hardware control chapters opened
:class:`~machine.UART` instances to talk on a wire; this
section opens :class:`~socket.socket` instances to talk
on the network. The shape is the same; the underlying
service is just a lot more capable.

Creating a socket
-----------------

Three arguments describe a socket: which *address
family* it speaks, which *socket type* it offers, and
which *protocol* it uses. The defaults cover the cases
the rest of this section uses::

    import socket

    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)   # IPv4 TCP
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)    # IPv4 UDP

The two constants the application picks between in
almost every case:

* :data:`~socket.AF_INET` -- IPv4 addresses (a numeric
  IP plus a port). The most common choice.
  :data:`~socket.AF_INET6` is the IPv6 equivalent.
* :data:`~socket.SOCK_STREAM` -- a TCP connection, the
  reliable byte stream. :data:`~socket.SOCK_DGRAM` is
  the UDP equivalent.

The third argument (the *protocol*) is left at zero,
which picks the right default based on the first two.
The full constructor is documented on
:doc:`/library/socket`.

Addresses on a socket
---------------------

A socket address is a tuple of ``(host, port)``::

    ("192.168.1.50", 80)
    ("0.0.0.0", 8000)

The host is the IP address as a string. The port is
the 16-bit integer covered on :doc:`../transport/ports`.

A handful of *special* host strings are worth knowing:

* ``"0.0.0.0"`` means "every IPv4 interface on this
  device". A server bound to this address accepts
  connections on any address the camera holds.
* ``"127.0.0.1"`` is *localhost* -- traffic to it never
  leaves the device. Useful for testing.
* ``"255.255.255.255"`` is the local broadcast address.
  A UDP datagram sent to it goes to every device on the
  local segment.

Domain names like ``"example.com"`` are *not* valid host
strings in a socket address. They have to be resolved to
an IP first; :doc:`../names/dns` covers the
:func:`~socket.getaddrinfo` call that does that.

The two roles
-------------

The lifecycle of a socket depends on which side of the
conversation it is on. A *client* socket calls
:meth:`~socket.socket.connect` (or, for UDP, just
:meth:`~socket.socket.sendto`) to talk to a known
server. A *server* socket calls
:meth:`~socket.socket.bind` to claim a port, then either
:meth:`~socket.socket.listen` and
:meth:`~socket.socket.accept` (for TCP) or
:meth:`~socket.socket.recvfrom` (for UDP) to receive
incoming traffic.

The same :class:`~socket.socket` constructor is used in
both cases; only the methods called afterwards differ.
The next three pages walk through the practical patterns:

* :doc:`udp-sockets` -- send and receive datagrams.
* :doc:`tcp-sockets` -- TCP client and server.
* :doc:`async-sockets` -- everything above, but inside
  an :mod:`asyncio` event loop.

Closing a socket
----------------

Every socket holds a small piece of operating-system
state (a port reservation, buffers, the connection's
TCP state). When the application is done with it,
:meth:`~socket.socket.close` releases that state. A
forgotten socket is a slow leak that adds up; in a
loop that opens connections, missing a ``close`` will
eventually exhaust the cam's pool of available sockets.

The cleanest pattern is the :keyword:`with` statement::

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.connect(addr)
        s.send(b"GET / HTTP/1.0\r\n\r\n")
        ...
    # socket is closed automatically here, even on error

Sockets implement the context-manager protocol covered
in the Python overview, so the ``with`` block guarantees
``close()`` is called regardless of whether the block
exited normally or by raising an exception.

The :mod:`socket` reference
---------------------------

This and the next pages walk through the API in narrative
form. For the full argument-level reference of every
method, every flag, and every constant the module
exposes, see :doc:`/library/socket`. The reference is
also the place to look for the less-common operations
(socket options, multicast group membership, IPv6 scope
IDs) that this section does not cover.
