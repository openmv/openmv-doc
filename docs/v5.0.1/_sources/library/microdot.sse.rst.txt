:mod:`microdot.sse` --- Server-Sent Events
==========================================

.. module:: microdot.sse
   :synopsis: Server-Sent Events (one-way push streaming) for Microdot

Server-Sent Events (SSE) is a simple one-way push protocol: the client
opens a normal HTTP request to ``Content-Type: text/event-stream``, and
the server keeps the connection open and writes formatted events as
they happen. The browser exposes the stream as a JavaScript
``EventSource`` object. Compared to WebSockets, SSE is simpler when
only the server pushes; the client always requests.

The typical camera use is publishing detections / sensor readings /
status updates to a phone or dashboard at the rate they happen, without
the dashboard having to poll.

class SSE
---------

.. class:: SSE

   The handle the route receives. Passed to handlers as the second
   argument when :func:`with_sse` is in use.

   .. method:: send(data, event: str | None = None, event_id: str | None = None, retry: int | None = None, comment: bool = False)
      :async:

      Push a single event to the client.

      *data*
          The event payload. Strings and bytes are sent as-is. Dicts
          and lists are serialized to JSON. Anything else is
          ``str()``-converted.

      *event*
          Optional event name -- the browser's ``EventSource``
          dispatches to a JavaScript listener of the same name when
          this is set.

      *event_id*
          Optional event id -- the browser sends it back as
          ``Last-Event-ID`` if the connection drops and reconnects,
          which lets the server resume from where it left off.

      *retry*
          Reconnection delay in seconds; the browser uses this if the
          connection drops.

      *comment*
          If ``True``, the payload is sent as an SSE comment line
          (ignored by the browser). Useful as a keep-alive heartbeat
          to stop NAT timeouts from closing an otherwise-idle stream.

Module-level decorators
-----------------------

.. function:: with_sse(f)

   Decorator that turns a route into an SSE endpoint. The handler
   receives the request and an :class:`SSE` object::

       from microdot import Microdot
       from microdot.sse import with_sse

       app = Microdot()

       @app.get('/events')
       @with_sse
       async def events(request, sse):
           import asyncio
           while True:
               await sse.send({'temp': read_sensor()}, event='reading')
               await asyncio.sleep(1)

   The handler's lifetime equals the stream's lifetime -- it runs for
   as long as the client stays connected. Cancellation (the client
   disconnects, the server shuts down) propagates as
   :exc:`asyncio.CancelledError`, which the framework swallows.

.. function:: sse_response(request, event_function, *args, **kwargs)

   Low-level entry point: returns the response tuple that
   :func:`with_sse` returns under the hood. Useful when an SSE
   endpoint needs custom headers or status codes that the decorator
   does not allow::

       from microdot.sse import sse_response

       @app.get('/events')
       async def events(request):
           if not request.g.current_user:
               return 401
           async def emit(req, sse):
               await sse.send('hello')
           return sse_response(request, emit)

   *event_function* takes ``(request, sse, *args, **kwargs)`` and uses
   ``await sse.send(...)`` to push events.

The SSE response sets ``Content-Type: text/event-stream`` and keeps
the connection open until *event_function* returns or the client
disconnects. Use a ``while True`` loop with an ``await asyncio.sleep``
between sends to avoid hot-looping.
