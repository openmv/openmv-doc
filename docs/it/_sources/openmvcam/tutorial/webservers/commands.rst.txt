Two-way control with WebSockets
===============================

Server-Sent Events are push-only. When the owner taps "save a
snapshot right now" or "reset the trigger counter" on the dashboard,
the dashboard has to send a message *to* the cam. That's WebSockets
-- one TCP socket, framed messages flowing both directions.

The /control route
------------------

:func:`microdot.websocket.with_websocket` performs the WebSocket
upgrade handshake and hands the handler a
:class:`~microdot.websocket.WebSocket` object. The handler loops
forever, reading commands and sending acknowledgements:

.. code-block:: python

   from microdot.websocket import with_websocket
   from microdot.websocket import WebSocketError
   import json

   @app.get('/control')
   @with_websocket
   async def control(request, ws):
       while True:
           try:
               msg = await ws.receive()
           except WebSocketError:
               break
           try:
               cmd = json.loads(msg)
           except ValueError:
               await ws.send({'error': 'bad json'})
               continue

           if cmd.get('cmd') == 'snapshot_now':
               if latest_jpeg:
                   path = '/sdcard/snaps/manual-{}.jpg'.format(
                       int(time.time()))
                   with open(path, 'wb') as f:
                       f.write(latest_jpeg)
                   await ws.send({'ok': True, 'saved': path})
               else:
                   await ws.send({'ok': False, 'reason': 'no frame yet'})
           elif cmd.get('cmd') == 'reset':
               state['trigger_count'] = 0
               await ws.send({'ok': True, 'counters': 'reset'})
           else:
               await ws.send({'error': 'unknown command'})

:meth:`~microdot.websocket.WebSocket.receive` returns a string for
text frames and bytes for binary frames. The browser-side
``WebSocket.send(...)`` sends text by default, so JSON-encoded
commands are the natural choice.

:meth:`~microdot.websocket.WebSocket.send` accepts strings, bytes, or
anything JSON-serializable -- a dict is sent as a JSON text frame.

:exc:`~microdot.websocket.WebSocketError` is raised when the client
disconnects (clean close, network drop, or protocol error). The
handler exits the loop and returns; microdot tidies up the socket.

The dashboard sends commands
----------------------------

Two buttons go into ``index.html`` next to the slider:

.. code-block:: html

   <button id="snap-btn">Save snapshot</button>
   <button id="reset-btn">Reset counter</button>

and ``app.js`` opens the WebSocket once and wires both buttons to
``send``:

.. code-block:: javascript

   const proto = location.protocol === 'https:' ? 'wss://' : 'ws://';
   const ws = new WebSocket(proto + location.host + '/control');

   document.getElementById('snap-btn').addEventListener('click', () =>
       ws.send(JSON.stringify({cmd: 'snapshot_now'})));
   document.getElementById('reset-btn').addEventListener('click', () =>
       ws.send(JSON.stringify({cmd: 'reset'})));

   ws.addEventListener('message', (e) => {
       console.log('cam:', JSON.parse(e.data));
   });

The ``ws://`` vs ``wss://`` choice mirrors ``http://`` vs ``https://``
-- the WebSocket inherits the same TLS handling. With HTTPS in place
the dashboard automatically connects via ``wss://``.

When to pick SSE vs WebSockets
------------------------------

Use SSE when the cam pushes and the browser only listens --
notifications, telemetry, status changes. The wire is plain HTTP,
the client side is one line (``new EventSource``), and reconnect is
automatic.

Use WebSockets when the browser also needs to push -- buttons,
sliders that send keystroke-rate updates, anything where waiting on
the next request would be too slow. The connection is bidirectional
and framed, but the API is more involved on both sides.

The cam is now an interactive thing -- watch, push events out, accept
commands in.
