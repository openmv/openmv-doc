:mod:`microdot.websocket` --- WebSocket support
===============================================

.. module:: microdot.websocket
   :synopsis: WebSocket endpoint support for Microdot

WebSockets are a two-way persistent connection over HTTP -- after an
upgrade handshake, client and server send and receive framed messages
on the same socket. Use them when the camera and a browser-side
application need full-duplex traffic that SSE (one-way push) and plain
HTTP polling cannot give them cheaply.

class WebSocket
---------------

.. class:: WebSocket(request)

   The handle the route receives. Passed to handlers as the second
   argument when :func:`with_websocket` is in use; do not construct
   directly.

   .. rubric:: Class attributes

   .. attribute:: max_message_length
      :type: int

      Maximum payload size that :meth:`receive` will accept. Messages
      larger than this raise :exc:`WebSocketError` and close the
      connection. ``0`` disables the check (be aware of memory-
      exhaustion attacks if you set this). ``-1`` (default) uses
      :attr:`Request.max_body_length <microdot.Request.max_body_length>`.

   .. attribute:: CONT
      :type: int

      Continuation-frame opcode, ``0x0``. Marks a frame that
      continues the payload of the previous frame for the same
      message. Microdot does not generate continuation frames itself
      (each message goes out as a single frame) and rejects them on
      receive, but the constant is exposed for applications that
      implement custom framing.

   .. attribute:: TEXT
      :type: int

      Text-frame opcode, ``0x1``. The opcode :meth:`send` picks
      automatically when *data* is a ``str``; the payload is
      UTF-8-encoded on the way out.

   .. attribute:: BINARY
      :type: int

      Binary-frame opcode, ``0x2``. The opcode :meth:`send` picks
      automatically when *data* is ``bytes`` / ``bytearray``; the
      payload is sent verbatim.

   .. attribute:: CLOSE
      :type: int

      Close-frame opcode, ``0x8``. Sent by :meth:`close`; receiving
      one raises :exc:`WebSocketError` ("Websocket connection
      closed") out of :meth:`receive`.

   .. attribute:: PING
      :type: int

      Ping-frame opcode, ``0x9``. Microdot answers incoming pings
      with a matching :attr:`PONG` automatically inside
      :meth:`receive`; the application does not normally observe
      them.

   .. attribute:: PONG
      :type: int

      Pong-frame opcode, ``0xA``. Sent automatically in reply to a
      :attr:`PING`. Incoming pongs are silently dropped.

   .. rubric:: Instance attributes

   .. attribute:: request
      :type: microdot.Request

      The originating :class:`microdot.Request` -- the same object the
      route handler received.

   .. attribute:: closed
      :type: bool

      ``True`` once :meth:`close` has run. Inspect to avoid double-
      closing in cleanup paths.

   .. rubric:: Methods

   .. method:: receive()
      :async:

      Wait for and return the next message from the client. The return
      type matches the frame opcode: ``str`` for text frames, ``bytes``
      for binary frames. ``ping`` frames are answered automatically
      with a ``pong``; ``pong`` frames are silently dropped; a ``close``
      frame raises :exc:`WebSocketError` ("Websocket connection
      closed").

   .. method:: send(data, opcode: int | None = None)
      :async:

      Send *data* to the client. Strings are sent as text frames,
      bytes as binary frames; pass *opcode* explicitly to override.

   .. method:: close()
      :async:

      Send a close frame and mark the connection as closed. Called
      automatically when :func:`with_websocket`'s wrapper exits.

class WebSocketError
--------------------

.. exception:: WebSocketError

   Raised inside :meth:`WebSocket.receive` when the connection ends or
   the protocol is violated. Use this in a route to detect normal
   client disconnects::

       try:
           message = await ws.receive()
       except WebSocketError:
           # client closed the connection

Module-level decorators
-----------------------

.. function:: with_websocket(f)

   Decorator that turns a route into a WebSocket endpoint. The handler
   receives the request and a :class:`WebSocket` object::

       from microdot import Microdot
       from microdot.websocket import with_websocket

       app = Microdot()

       @app.get('/echo')
       @with_websocket
       async def echo(request, ws):
           while True:
               msg = await ws.receive()
               await ws.send(msg)

   The handler's lifetime equals the connection lifetime. Returning,
   raising, or a client disconnect closes the WebSocket cleanly.

.. function:: websocket_upgrade(request)
   :async:

   Low-level upgrade helper. Use this inside a route when the upgrade
   should happen conditionally -- e.g. only after an authorization
   check passes::

       @app.get('/private')
       async def private(request):
           if not authenticate(request):
               abort(401)
           ws = await websocket_upgrade(request)
           while True:
               msg = await ws.receive()
               await ws.send(msg.upper())

   Returns the upgraded :class:`WebSocket`. The handler must return
   :attr:`microdot.Response.already_handled` (or raise) once it's
   done -- microdot has already taken over the socket.

The implementation supports the standard text and binary opcodes,
ping / pong, and a clean close. Fragmented (continuation) frames are
not supported -- each message is sent as a single frame, which is
appropriate for the typical small-message camera applications.
