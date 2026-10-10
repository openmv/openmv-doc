Sockets with asyncio
====================

A blocking :meth:`~socket.socket.recv` call freezes the
whole script until a byte arrives. A blocking
:meth:`~socket.socket.accept` call serves only one
client at a time. Both of these are exactly the kind of
"wait on I/O" situation :mod:`asyncio` exists to handle.
The :doc:`asyncio chapter </openmvcam/tutorial/asyncio/index>`
covers the event loop, coroutines, and the synchronisation
primitives; this page covers the network-specific
pieces.

The asyncio module exposes networking through a small
number of helpers that take and return *streams* --
high-level objects that wrap a socket and offer
``await``\ -able versions of read and write. The
underlying socket is still there; the application just
does not touch it directly.

A client with asyncio
---------------------

:func:`asyncio.open_connection` is the asyncio
counterpart to :meth:`socket.socket.connect`. It opens
a TCP connection and returns two stream objects: a
*reader* and a *writer*::

    import asyncio

    async def client():
        reader, writer = await asyncio.open_connection("192.168.1.20", 9000)

        writer.write(b"hello\n")
        await writer.drain()                   # wait until bytes have been sent

        reply = await reader.readline()
        print("reply:", reply)

        writer.close()
        await writer.wait_closed()

    asyncio.run(client())

Three things to note:

* The connection setup is one ``await`` instead of a
  blocking call. While the handshake is in flight, the
  event loop is free to run other coroutines.
* :meth:`~asyncio.StreamWriter.write` puts bytes into
  an outbound buffer; :meth:`~asyncio.StreamWriter.drain`
  is the ``await`` that yields to the loop until those
  bytes have actually been sent over the network.
* :meth:`~asyncio.StreamReader.readline` reads bytes
  until a newline arrives. The stream class includes
  :meth:`~asyncio.StreamReader.read` (read up to N
  bytes) and :meth:`~asyncio.StreamReader.readexactly`
  (read exactly N bytes) as well, which solve TCP's
  message-boundary problem without writing the framing
  loops by hand.

A server with asyncio
---------------------

:func:`asyncio.start_server` is the asyncio counterpart
to the bind/listen/accept dance. It takes a callback
that will be run once per incoming connection, with the
same reader/writer pair the client side uses::

    import asyncio

    async def handle(reader, writer):
        addr = writer.get_extra_info("peername")
        print("connection from", addr)

        while True:
            data = await reader.read(1024)
            if not data:
                break
            writer.write(data)                 # echo back
            await writer.drain()

        writer.close()
        await writer.wait_closed()

    async def main():
        server = await asyncio.start_server(handle, "0.0.0.0", 9000)
        print("listening on", server.sockets[0].getsockname())
        async with server:
            await server.serve_forever()

    asyncio.run(main())

Every accepted connection becomes its own task running
``handle``. The event loop dispatches between them
naturally -- one slow client cannot block the others,
because while it is waiting on ``await reader.read(...)``
the loop is free to make progress on every other
connection. Adding ten concurrent clients does not
require ten threads; the same single-threaded event
loop drives them all.

This is the practical reason camera networking
applications written for asyncio scale so much better
than the equivalent blocking code: the server picture
on :doc:`tcp-sockets` was one-client-at-a-time; this
one is many-clients-at-once with no extra effort.

Concurrent work alongside networking
------------------------------------

The big payoff is mixing networking with the rest of
the camera's work in the same loop. The camera can
capture a frame, run image processing, *and* serve a
network protocol, all interleaved::

    import asyncio

    async def capture_loop():
        while True:
            img = await camera.snapshot()
            # process img ...
            await asyncio.sleep_ms(100)

    async def handle(reader, writer):
        ...

    async def main():
        server = await asyncio.start_server(handle, "0.0.0.0", 9000)
        await asyncio.gather(
            server.serve_forever(),
            capture_loop(),
        )

    asyncio.run(main())

:func:`asyncio.gather` runs the two coroutines on the
same event loop. While the camera is sleeping in
:func:`~asyncio.sleep_ms` between frames, the server
gets to dispatch network traffic. While the server is
waiting for the next byte, the camera gets to capture.
Both make progress on a single MicroPython thread.

UDP with asyncio
----------------

The asyncio module does *not* offer the same high-level
streams for UDP -- datagrams do not fit the read/write
shape of a stream. The practical approach on the camera
is to put the UDP work in its own coroutine, switch the
socket to non-blocking mode, and yield to the event
loop between read attempts::

    import asyncio
    import socket

    async def udp_listener(port):
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.setblocking(False)
        s.bind(("0.0.0.0", port))

        while True:
            try:
                data, src = s.recvfrom(1024)
            except OSError:
                await asyncio.sleep_ms(10)
                continue
            print("got", data, "from", src)

The socket is set non-blocking with
``s.setblocking(False)``, so
:meth:`~socket.socket.recvfrom` raises
:exc:`OSError` immediately when no datagram is waiting
instead of blocking the whole event loop. The
``await asyncio.sleep_ms(10)`` in the empty branch
hands control back to the event loop until the next
poll.

Sending follows the same shape:
:meth:`~socket.socket.sendto` on a non-blocking socket
either succeeds immediately or raises. There is no
``sendallto`` -- UDP datagrams are atomic, so each send
is one whole datagram or none. If the send buffer is
full, the right move for UDP is usually to drop the
datagram and let the next one go out the next time
through the loop::

    async def udp_telemetry(target_addr, period_ms):
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.setblocking(False)

        while True:
            payload = collect_telemetry()
            try:
                s.sendto(payload, target_addr)
            except OSError:
                pass                # buffer full -- skip this one

            await asyncio.sleep_ms(period_ms)

The failing branch is rare in practice. UDP has no flow
control, so :meth:`~socket.socket.sendto` almost always
succeeds on first try; the ``except`` mostly exists so
a brief network hiccup does not crash the coroutine.

The :doc:`Asyncio </openmvcam/tutorial/asyncio/index>`
section covers the broader patterns for mixing
blocking I/O into an asyncio program; the same
patterns apply directly to a UDP socket.

Timeouts and cancellation
-------------------------

Wrapping a network call in :func:`asyncio.wait_for`
puts a deadline on it::

    try:
        reply = await asyncio.wait_for(reader.readline(), timeout=2.0)
    except asyncio.TimeoutError:
        print("server is slow")

A coroutine that is taking too long can also be
:meth:`~asyncio.Task.cancel`-led from elsewhere. Both
mechanisms are covered in detail in the
:doc:`coordination chapter </openmvcam/tutorial/asyncio/coordination/timeouts-and-cancellation>`;
they apply unchanged to streams returned by
:func:`asyncio.open_connection` and
:func:`asyncio.start_server`.

For the full :class:`~asyncio.Stream` reference (the
class behind the readers and writers, plus the helpers
this page used in passing), see
:doc:`/library/asyncio`.
