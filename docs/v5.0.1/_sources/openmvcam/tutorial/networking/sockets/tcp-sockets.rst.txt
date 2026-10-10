TCP sockets
===========

TCP sockets come in two shapes that look different but
share the same underlying type: *client* sockets that
:meth:`~socket.socket.connect` to a remote server, and
*server* sockets that :meth:`~socket.socket.bind`,
:meth:`~socket.socket.listen`, and
:meth:`~socket.socket.accept` incoming connections. Both
roles use the same :class:`~socket.socket` class
introduced on :doc:`socket-objects`; only the methods
called on them differ.

A TCP client
------------

The simplest client opens a connection, sends a
request, reads the reply, and closes::

    import socket

    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect(("192.168.1.20", 9000))

    s.send(b"hello\n")
    reply = s.recv(1024)
    print("reply:", reply)

    s.close()

:meth:`~socket.socket.connect` runs the three-way
handshake covered on :doc:`../transport/tcp` and
returns when the connection is open.
:meth:`~socket.socket.send` writes bytes to the
connection; :meth:`~socket.socket.recv` reads up to a
given number of bytes from it. Once the application is
done, :meth:`~socket.socket.close` shuts the connection
down.

The same script wrapped in the
:keyword:`with`-statement idiom from
:doc:`socket-objects`, so the socket is closed even if
something raises::

    import socket

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.connect(("192.168.1.20", 9000))
        s.send(b"hello\n")
        print(s.recv(1024))

Reading until done
~~~~~~~~~~~~~~~~~~

A single :meth:`~socket.socket.recv` returns *up to*
the requested number of bytes -- it can return fewer,
because TCP is a stream rather than a sequence of
messages. The application has to keep reading until it
has the full reply::

    chunks = []
    while True:
        chunk = s.recv(1024)
        if not chunk:                  # empty bytes -> other side closed
            break
        chunks.append(chunk)
    reply = b"".join(chunks)

The loop ends when :meth:`~socket.socket.recv` returns
an empty :class:`bytes`. That happens when the other
side has cleanly closed its half of the connection;
the application reads "end of stream" as the same as
"end of message" in this style of protocol.

Sending until done
~~~~~~~~~~~~~~~~~~

The opposite caveat applies to
:meth:`~socket.socket.send`: it may send *fewer* bytes
than requested, returning the count of bytes actually
written. For large payloads, retry the unsent
remainder::

    payload = some_big_bytes
    while payload:
        n = s.send(payload)
        payload = payload[n:]

:meth:`~socket.socket.sendall` does the loop
internally, so most code can just call that and avoid
the manual retry::

    s.sendall(some_big_bytes)

A TCP server
------------

The server side is four steps: claim a port, switch
the socket to listening mode, accept connections one
by one, talk on each accepted socket. A minimal echo
server::

    import socket

    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind(("0.0.0.0", 9000))
    server.listen(1)
    print("listening on port 9000")

    while True:
        conn, addr = server.accept()
        print("connection from", addr)

        while True:
            data = conn.recv(1024)
            if not data:
                break
            conn.send(data)            # echo back

        conn.close()

Step by step:

* :meth:`~socket.socket.bind` claims a host and port
  on the camera. ``"0.0.0.0"`` accepts on any
  interface; replacing it with a specific IP restricts
  the listener to that interface.
* :meth:`~socket.socket.listen` switches the socket
  from a normal socket to a *listening* socket. The
  argument is the *backlog* -- how many pending
  connections MicroPython will queue while the
  application is busy. Pick a small number; ``1`` is
  fine for most cases.
* :meth:`~socket.socket.accept` blocks until a client
  connects, then returns ``(conn, addr)``: a *new*
  socket representing this one connection, and the
  client's address. The listening socket itself stays
  open to accept more.
* All the bytes for the conversation flow through
  ``conn``, the new socket. Reads and writes use the
  same :meth:`~socket.socket.recv` /
  :meth:`~socket.socket.send` calls as on the client
  side.
* When the client closes, :meth:`~socket.socket.recv`
  returns ``b""``; the inner loop ends and the server
  closes its end with :meth:`~socket.socket.close`.

The outer ``while True`` jumps back to
:meth:`~socket.socket.accept` to wait for the next
client. The server handles one client at a time in this
shape; running multiple clients in parallel needs
either threads or :mod:`asyncio`. The latter is the
subject of the next page.

Common pitfalls
---------------

* **Treating recv() as message-shaped.** It is not.
  Two ``send(b"hi")`` calls might arrive as one
  ``recv(4)`` of ``b"hihi"``, or as two ``recv(2)``\ s.
  The application has to add framing if message
  boundaries matter -- a newline, a length prefix,
  whatever.
* **Forgetting to retry on short sends.** Use
  :meth:`~socket.socket.sendall` for anything beyond a
  few hundred bytes.
* **Forgetting to close the accepted socket.** Each
  ``conn`` is a separate socket; closing the listening
  socket does not close the accepted ones.
  :class:`with`-blocks on both make this hard to get
  wrong::

      while True:
          with server.accept()[0] as conn:
              # ... talk on conn ...

* **Re-binding to a port still in TIME_WAIT.** When a
  server restarts within a few seconds of closing,
  :meth:`~socket.socket.bind` may fail with "address in
  use" because MicroPython is still holding the port
  for the previous connection.
  ``server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)``
  before :meth:`~socket.socket.bind` clears this.

What's next
-----------

Blocking on :meth:`~socket.socket.accept` means the
server can serve only one client at a time. Blocking on
:meth:`~socket.socket.recv` means a single slow client
hangs the whole loop. The standard answer on the camera
is :mod:`asyncio` -- run each connection as its own
task, let the event loop dispatch between them. The
next page covers the asyncio versions of everything on
this one.
