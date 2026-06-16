Pushing events to the dashboard
===============================

The dashboard needs to be told the moment motion fires -- not on the
next poll. That's what Server-Sent Events do: one HTTP connection
from the browser to the cam, and the cam pushes events down it
whenever they happen.

A motion-detector coroutine
---------------------------

A third top-level task runs alongside the capture loop and the HTTP
server. It waits for each new frame, runs a difference against the
previous frame, and -- when the change is above the configured
threshold -- bumps a counter and signals an event:

.. code-block:: python

   import time

   motion_event = asyncio.Event()
   last_motion = None

   async def motion_detector():
       global last_motion
       prev = None
       while True:
           await new_frame.wait()
           change = compute_change(prev, latest_jpeg)
           if change > state['threshold']:
               state['trigger_count'] += 1
               last_motion = {
                   'ts': time.time(),
                   'count': state['trigger_count'],
                   'change': change,
               }
               motion_event.set()
           prev = latest_jpeg
           await asyncio.sleep_ms(50)

The ``compute_change`` implementation is out of scope for this
chapter -- the image-processing section covers frame-differencing
properly. For now treat it as a placeholder that returns a number.

Add the new task to ``main``:

.. code-block:: python

   async def main():
       await asyncio.gather(
           capture_loop(),
           motion_detector(),
           app.start_server(host='0.0.0.0', port=80),
       )

The /events route
-----------------

:func:`microdot.sse.with_sse` decorates an async handler so microdot
performs the SSE handshake (status 200, ``Content-Type:
text/event-stream``, no buffering) and hands the handler an
:class:`~microdot.sse.SSE` object. The handler stays awake for as long
as the browser keeps the connection open:

.. code-block:: python

   from microdot.sse import with_sse

   @app.get('/events')
   @with_sse
   async def events(request, sse):
       while True:
           try:
               await asyncio.wait_for(motion_event.wait(), timeout=15)
               motion_event.clear()
               if last_motion:
                   await sse.send(last_motion, event='motion')
           except asyncio.TimeoutError:
               await sse.send('keepalive', comment=True)

:meth:`~microdot.sse.SSE.send` writes one event to the wire and
yields back to the event loop. ``event='motion'`` names the event
type so the browser-side ``EventSource`` can register a listener for
just that name. ``event_id=`` (not shown) sets the
``id:`` line so the browser can resume from a known offset on
reconnect via the ``Last-Event-ID`` header.

The 15-second timeout + ``comment=True`` send is the keep-alive
trick. Comment lines start with ``:`` and the browser ignores them
entirely, but the bytes moving over the wire stop intermediate
proxies and NAT boxes from killing an idle connection.

The dashboard consumes events
-----------------------------

Add this to ``app.js``:

.. code-block:: javascript

   const events = document.getElementById('events');
   const source = new EventSource('/events');
   source.addEventListener('motion', (e) => {
       const data = JSON.parse(e.data);
       const li = document.createElement('li');
       const t = new Date(data.ts * 1000).toLocaleTimeString();
       li.textContent = t + ' -- change ' + data.change;
       events.prepend(li);
   });

The browser opens one persistent HTTP connection to ``/events`` and
re-opens it automatically on any disconnect. Every ``motion`` event
the cam pushes appears as a new ``<li>`` at the top of the list.

The owner now sees motion events the instant they fire.
