:mod:`webrepl` -- WebREPL server
================================

.. module:: webrepl
   :synopsis: WebREPL server

This module exposes the MicroPython WebREPL: a WebSocket-based REPL that lets
clients connect to a board's interactive prompt (and transfer files) over a
network connection. A small static page hosted at ``micropython.org/webrepl``
acts as the JavaScript client.

The WebREPL listens on TCP port 8266 by default and uses `os.dupterm` to
duplicate the REPL onto the WebSocket stream. Only one concurrent client is
supported; further connection attempts are rejected.

Example::

    import webrepl
    webrepl.start(password="changeme")
    # ... or load the password from webrepl_cfg.py:
    # webrepl.start()

Functions
---------

.. function:: start(port: int = 8266, password: str | None = None, accept_handler = accept_conn) -> None

   Start the WebREPL listener.

   If *password* is ``None``, the password is loaded from ``webrepl_cfg.py``
   (created by ``webrepl_setup``). When ``webrepl_cfg`` cannot be imported a
   warning is printed and the server is not started.

   *port* selects the TCP port to listen on.

   *accept_handler* is the callable invoked when a new TCP client connects.
   The default is `accept_conn`, which performs the WebSocket handshake on a
   background socket callback. Pass ``None`` to run the server in foreground
   mode (equivalent to `start_foreground`).

.. function:: start_foreground(port: int = 8266, password: str | None = None) -> None

   Convenience wrapper around `start` that runs the accept loop synchronously
   in the foreground until a client connects.

.. function:: stop() -> None

   Close the listening socket and any active client connection, and detach
   the WebREPL from the duplicated terminal via ``os.dupterm(None)``.

.. function:: accept_conn(listen_sock) -> bool

   Accept a pending TCP connection on *listen_sock* and complete the
   WebSocket handshake. If a client is already connected the new connection
   is rejected and ``False`` is returned. On a successful upgrade, the
   resulting WebSocket is wrapped with ``_webrepl._webrepl`` and attached as
   the duplicated terminal.

   This is exposed primarily so callers can supply it as the
   *accept_handler* argument to `start`.

.. function:: server_handshake(cl) -> bool

   Read the HTTP request on the freshly-accepted socket *cl* and reply with
   the appropriate ``Sec-WebSocket-Accept`` headers. Returns ``True`` if the
   client requested a valid WebSocket upgrade, ``False`` otherwise (in which
   case the caller typically falls back to serving the HTML client via
   `send_html`).

.. function:: send_html(cl) -> None

   Reply to the HTTP request on *cl* with a minimal HTML document that loads
   the WebREPL JavaScript client from `static_host` and then closes the
   socket.

Constants
---------

.. data:: DEBUG
   :type: int

   Set to a non-zero value to enable verbose tracing of HTTP requests and
   WebSocket handshakes on ``sys.stdout``. Defaults to ``0``.

.. data:: static_host
   :type: str

   Base URL of the WebREPL static client used by `send_html`. Defaults to
   ``"https://micropython.org/webrepl/"``. May be overridden by setting
   ``BASE`` in ``webrepl_cfg.py`` or by re-assigning the module attribute
   directly.

.. data:: listen_s

   The currently-active listening socket, or ``None`` if the server is
   stopped. Set by `start` and cleared by `stop`.

.. data:: client_s

   The currently-connected client socket, or ``None`` if no client is
   attached. Set by `accept_conn` and cleared by `stop`.
