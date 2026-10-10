UDP sockets
===========

UDP traffic in Python is sent and received with two
methods on a datagram socket:
:meth:`~socket.socket.sendto` to fire off a datagram at
a chosen destination, and :meth:`~socket.socket.recvfrom`
to receive a datagram and find out where it came from.
Each call moves one self-contained message; there is no
connection state.

Sending a datagram
------------------

The simplest UDP send is one line of Python on top of a
socket constructor::

    import socket

    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.sendto(b"hello", ("192.168.1.20", 9000))
    s.close()

That sends ``b"hello"`` to port ``9000`` on
``192.168.1.20`` and walks away. MicroPython picks an
ephemeral source port; the script does not have to bind
anything.

Sending the same payload to many destinations is just a
loop -- the socket is reusable between sends, and there
is no connection to set up::

    targets = [
        ("192.168.1.20", 9000),
        ("192.168.1.21", 9000),
        ("192.168.1.22", 9000),
    ]

    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
        for addr in targets:
            s.sendto(b"hello", addr)

Receiving a datagram
--------------------

To receive datagrams, the socket has to claim a known
port that the senders will use as their destination.
That is the :meth:`~socket.socket.bind` call::

    import socket

    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.bind(("0.0.0.0", 9000))

    while True:
        data, src = s.recvfrom(1024)
        print("from", src, "got", data)

The ``"0.0.0.0"`` address means "every IPv4 interface
on the camera" -- whatever Wi-Fi or Ethernet interface
brings packets in, port ``9000`` belongs to this
socket.

The ``1024`` argument to :meth:`~socket.socket.recvfrom`
is the maximum number of bytes to read into the
returned buffer. UDP datagrams above this size will be
*truncated*; pick the value to match the largest
datagram the application expects.

:meth:`~socket.socket.recvfrom` returns ``(data,
src)``: the bytes received, and the address of the
sender. The sender's address is what to reply to,
making it easy to write a small request/response
protocol::

    while True:
        request, src = s.recvfrom(1024)
        if request == b"ping":
            s.sendto(b"pong", src)

By default :meth:`~socket.socket.recvfrom` *blocks*
until a datagram arrives. The patterns for making it
not block -- timeouts, non-blocking sockets, asyncio --
are on :doc:`async-sockets`.

A request and a reply
---------------------

Two short scripts: one sends a request, one receives
and replies.

The receiver::

    import socket

    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.bind(("0.0.0.0", 9000))

    while True:
        req, src = s.recvfrom(64)
        print("got", req, "from", src)
        s.sendto(b"ack: " + req, src)

The sender::

    import socket

    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
        s.settimeout(2.0)                              # 2 s reply window
        s.sendto(b"ping", ("192.168.1.20", 9000))
        try:
            reply, _ = s.recvfrom(64)
            print("reply:", reply)
        except OSError:
            print("no reply in 2 s -- packet lost?")

A few things worth noting in the sender:

* No :meth:`~socket.socket.bind` and no
  :meth:`~socket.socket.connect`. UDP clients just send.
* :meth:`~socket.socket.settimeout` puts a deadline on
  the receive call. If no reply lands in two seconds,
  the call raises :exc:`OSError` rather than blocking
  forever -- a natural way to detect a lost packet.
* The :class:`with` block closes the socket
  automatically.

Datagram size limits
--------------------

UDP datagrams can be up to about 64 KB in theory, but
the practical limit is much smaller. Every link in the
path between the sender and receiver has a *Maximum
Transmission Unit* (MTU) -- the largest single block of
bytes that link can carry in one frame. Ethernet and
Wi-Fi both cap this at around 1500 bytes, and almost
every internet path traces back to that limit somewhere.

When a datagram exceeds the MTU of a link it has to
cross, the network layer splits it into smaller
*fragments* and re-assembles them at the destination.
UDP itself never sees the split, but fragments have
several inconvenient properties:

* If any one fragment is lost, the whole datagram is
  dropped at the receiver -- there is no per-fragment
  retransmission. The loss probability grows with the
  fragment count.
* Some networks and firewalls drop fragmented packets
  entirely, treating them as suspicious.
* Re-assembly costs memory at the receiver, which on a
  microcontroller is in short supply.

The practical rule on the camera: keep UDP messages
well under 1500 bytes. About 1400 bytes leaves room for
the IP and UDP headers, any tunneling overhead the path
adds, and small variations in MTU between Ethernet,
Wi-Fi, and VPN links. Applications that need to send
more than that should either chunk the data at the
application layer or switch to TCP, which handles the
splitting and re-assembly automatically.

Common pitfalls
---------------

* **Forgetting that UDP can lose packets.** Code that
  works perfectly on a quiet local network sometimes
  fails in subtle ways on a busier or wider one. Always
  design for the possibility that the message did not
  arrive.
* **Receiver not bound before sender sends.** A
  datagram sent to a port that nobody is listening on
  is silently dropped. Start the receiver first.
* **Sending a datagram larger than the path's MTU.**
  See the previous section -- keep messages under
  ~1400 bytes.

The patterns above cover almost every UDP use the
camera reaches for. The next page does the equivalent
for TCP.
