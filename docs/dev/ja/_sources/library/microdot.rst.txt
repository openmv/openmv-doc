:mod:`microdot` --- minimal HTTP framework
==========================================

.. module:: microdot
   :synopsis: A small, asyncio-based HTTP framework for MicroPython

Microdot is a small, Flask-inspired HTTP framework for MicroPython. It runs
on top of :mod:`asyncio`, handles multiple concurrent clients without
threads, and exposes a familiar route-decorator API. A minimal application
looks like::

    from microdot import Microdot

    app = Microdot()

    @app.route('/')
    async def index(request):
        return 'Hello, world!'

    app.run(host='0.0.0.0', port=80)

class Microdot
--------------

.. class:: Microdot()

   An HTTP application instance. One instance is constructed near the top
   of the script and decorated with route handlers; calling
   :meth:`run` or awaiting :meth:`start_server` begins serving.

   .. rubric:: Route registration

   .. method:: route(url_pattern: str, methods: list | None = None) -> Callable

      Decorator that registers a handler for *url_pattern* under the listed
      HTTP methods (default ``['GET']``). Returns the decorator that, when
      applied to a function, registers it as the handler and returns the
      function unchanged.

      *url_pattern*
          A path pattern. Supports static segments (``/users``) and dynamic
          segments enclosed in ``<`` / ``>``. Dynamic segments accept an
          optional type prefix separated by ``:`` -- ``<int:id>``,
          ``<path:rest>``, ``<re:[0-9a-f]+:hex>``. The default type is
          ``string``.

      *methods*
          List of HTTP method names. If omitted, only ``GET`` is matched.

      The handler is called with the request object first, then any
      captured dynamic segments as keyword arguments. The handler's
      return value becomes the HTTP response: a :class:`Response`, a
      string, a tuple ``(body, status_code[, headers])``, or a dict /
      list (sent as JSON).

   .. method:: get(url_pattern: str) -> Callable

      Convenience alias for ``route(url_pattern, methods=['GET'])`` --
      register the decorated function as a ``GET`` handler for
      *url_pattern*. Returns the decorator.

   .. method:: post(url_pattern: str) -> Callable

      Convenience alias for ``route(url_pattern, methods=['POST'])`` --
      register the decorated function as a ``POST`` handler for
      *url_pattern*. Returns the decorator.

   .. method:: put(url_pattern: str) -> Callable

      Convenience alias for ``route(url_pattern, methods=['PUT'])`` --
      register the decorated function as a ``PUT`` handler for
      *url_pattern*. Returns the decorator.

   .. method:: patch(url_pattern: str) -> Callable

      Convenience alias for ``route(url_pattern, methods=['PATCH'])`` --
      register the decorated function as a ``PATCH`` handler for
      *url_pattern*. Returns the decorator.

   .. method:: delete(url_pattern: str) -> Callable

      Convenience alias for ``route(url_pattern, methods=['DELETE'])`` --
      register the decorated function as a ``DELETE`` handler for
      *url_pattern*. Returns the decorator.

   .. rubric:: Lifecycle hooks

   .. method:: before_request(f: Callable) -> Callable

      Decorator that registers *f* to run before every request. *f*
      takes the request object; its return value is normally ignored.
      To short-circuit the request, return a :class:`Response` (or a
      value that converts to one) -- the rest of the pipeline is then
      skipped and that response is sent. Returns *f* unchanged.

   .. method:: after_request(f: Callable) -> Callable

      Decorator that registers *f* to run after every successful
      request. *f* takes ``(request, response)`` and must return the
      (possibly modified) response object. Returns *f* unchanged.

   .. method:: after_error_request(f: Callable) -> Callable

      Decorator that registers *f* to run after Microdot generates an
      error response (404, 500, raised exception, etc.). *f* takes
      ``(request, response)`` and must return the (possibly modified)
      response object. Returns *f* unchanged.

   .. method:: errorhandler(status_code_or_exception_class) -> Callable

      Decorator that registers a custom handler for an HTTP status code
      or a Python exception class. For status codes, the handler takes
      only the request; for exception classes, ``(request, exception)``.
      Returns the decorator.

   .. rubric:: Mounting and aborting

   .. method:: mount(subapp: Microdot, url_prefix: str = '', local: bool = False) -> None

      Attach another :class:`Microdot` instance's routes under
      *url_prefix*. When *local* is ``False`` (default), the sub-app's
      before / after / error handlers are also attached to the parent. When
      ``True``, those handlers run only for sub-app routes. Returns
      ``None``.

   .. staticmethod:: abort(status_code: int, reason: str | None = None) -> None

      Raise :exc:`HTTPException` to abort the current request with the
      given status code. Never returns normally -- the framework catches
      the exception and turns it into the corresponding error response.
      Convenient inside route bodies::

          from microdot import abort

          @app.get('/users/<int:id>')
          def get_user(request, id):
              user = lookup(id)
              if user is None:
                  abort(404)
              return user.to_dict()

   .. rubric:: Running the server

   .. method:: run(host: str = '0.0.0.0', port: int = 5000, debug: bool = False, ssl=None) -> None

      Block the calling thread, run :func:`asyncio.run` on
      :meth:`start_server`. Returns ``None`` only after :meth:`shutdown`
      has been called and the listening loop exits. The simplest way to
      launch a standalone app::

          app.run(host='0.0.0.0', port=80)

   .. method:: start_server(host: str = '0.0.0.0', port: int = 5000, debug: bool = False, ssl=None, start_serving: bool = True) -> None
      :async:

      Start the server as a coroutine. Use this when integrating with an
      existing :mod:`asyncio` event loop alongside other tasks. The
      coroutine does not return until :meth:`shutdown` is called::

          async def main():
              await asyncio.gather(
                  app.start_server(port=80),
                  capture_loop(),
              )

      *host*
          Network interface to listen on. ``'0.0.0.0'`` (default) means
          all interfaces; ``'127.0.0.1'`` means loopback only.

      *port*
          TCP port to listen on. Default ``5000`` -- pick ``80`` for plain
          HTTP, ``443`` for HTTPS.

      *debug*
          If ``True``, log every request and dump tracebacks to stdout.

      *ssl*
          An :class:`ssl.SSLContext` to wrap incoming connections in TLS.
          ``None`` (default) means plain HTTP.

      *start_serving*
          Only relevant on CPython; ignored on MicroPython.

   .. method:: shutdown() -> None

      Request a graceful server shutdown. Safe to call from a route
      handler -- the current request completes before the loop exits.
      Returns immediately; the actual shutdown happens once the
      in-flight request finishes.

   .. rubric:: Attributes

   .. attribute:: url_map
      :type: list

      List of registered routes as ``(methods, URLPattern, handler,
      url_prefix, subapp)`` tuples.

   .. attribute:: before_request_handlers
      :type: list

      List of callables registered with :meth:`before_request`, in
      registration order. Each runs with the request object before the
      route handler. Mutating the list directly works but is rarely
      needed -- prefer the decorator.

   .. attribute:: after_request_handlers
      :type: list

      List of callables registered with :meth:`after_request`, in
      registration order. Each runs with ``(request, response)`` after a
      successful request and must return the (possibly modified)
      response.

   .. attribute:: after_error_request_handlers
      :type: list

      List of callables registered with :meth:`after_error_request`, in
      registration order. Each runs with ``(request, response)`` after
      an error response is generated (by the framework or by an
      application error handler) and must return the response.

   .. attribute:: error_handlers
      :type: dict

      Mapping of error keys to handler callables, populated by
      :meth:`errorhandler`. Keys are either HTTP status codes
      (``int``) or Python exception classes; values are the registered
      handlers. Status-code handlers take ``(request)``; exception-class
      handlers take ``(request, exception)``.

   .. attribute:: debug
      :type: bool

      ``True`` while the server is running with ``debug=True``.

class Request
-------------

.. class:: Request

   An incoming HTTP request. Instances are passed to route handlers as
   the first positional argument. Applications do not construct
   :class:`Request` directly.

   .. rubric:: Class attributes

   .. attribute:: max_content_length
      :type: int

      Reject requests whose ``Content-Length`` exceeds this many bytes
      with a 413 response. Default 16 KB.

   .. attribute:: max_body_length
      :type: int

      Largest body that is buffered into memory and exposed via
      :attr:`body`. Larger bodies (up to :attr:`max_content_length`)
      remain on the socket and must be read through :attr:`stream`.
      Default 16 KB.

   .. attribute:: max_readline
      :type: int

      Maximum length of a single request line / header line in bytes.
      Default 2 KB.

   .. rubric:: Instance attributes

   .. attribute:: app
      :type: Microdot

      The :class:`Microdot` instance handling the request.

   .. attribute:: client_addr
      :type: tuple

      The client's address as ``(host, port)``.

   .. attribute:: method
      :type: str

      HTTP method string (``'GET'``, ``'POST'``, ...).

   .. attribute:: scheme
      :type: str

      ``'http'`` or ``'https'``.

   .. attribute:: url
      :type: str

      The full request URL path and query string (everything after the
      host).

   .. attribute:: path
      :type: str

      Just the path portion.

   .. attribute:: query_string
      :type: str | None

      The raw query string portion, or ``None``.

   .. attribute:: args
      :type: MultiDict

      Parsed query string as a :class:`MultiDict`.

   .. attribute:: headers
      :type: NoCaseDict

      Request headers as a :class:`NoCaseDict` (case-insensitive lookup).

   .. attribute:: cookies
      :type: dict

      Parsed ``Cookie`` header as a ``dict``.

   .. attribute:: content_length
      :type: int

      The integer ``Content-Length`` value, or 0 if absent.

   .. attribute:: content_type
      :type: str | None

      The ``Content-Type`` header value, or ``None``.

   .. attribute:: g
      :type: object

      A free-form per-request container (a bare object). Assign
      attributes to it to pass values between hooks and handlers
      (``request.g.user = ...``).

   .. attribute:: route
      :type: Callable

      The handler function that matched this request.

   .. attribute:: url_prefix
      :type: str

      Prefix the route was mounted under, or ``''``.

   .. attribute:: subapp
      :type: Microdot | None

      The mounted sub-app instance, or ``None``.

   .. rubric:: Body access

   .. attribute:: body
      :type: bytes

      The full request body as ``bytes``. Empty when the body is being
      streamed (see :attr:`stream`).

   .. attribute:: stream
      :type: object

      An async stream object exposing ``read()`` over the body. Use this
      for bodies larger than :attr:`max_body_length`.

   .. attribute:: json
      :type: dict | list | str | int | float | bool | None

      The body parsed as JSON (a ``dict``, ``list``, ``str``, ``int``,
      ``float``, or ``bool`` -- whatever the payload encodes), or
      ``None`` if the ``Content-Type`` is not ``application/json``.

   .. attribute:: form
      :type: MultiDict | None

      URL-encoded form fields as a :class:`MultiDict`, or ``None``. For
      ``multipart/form-data``, decorate the route with
      :func:`microdot.multipart.with_form_data`.

   .. attribute:: files
      :type: dict | None

      Uploaded files as ``{name: FileUpload}``, populated by
      :func:`microdot.multipart.with_form_data`. ``None`` until that
      decorator runs.

   .. method:: after_request(f: Callable) -> Callable

      Register a request-local after-request hook -- runs after the
      application-level after-request handlers, only on success. *f*
      takes ``(request, response)`` and must return the (possibly
      modified) response object. Returns *f* unchanged.

class Response
--------------

.. class:: Response(body=b'', status_code: int = 200, headers: dict | None = None, reason: str | None = None)

   An HTTP response. Most handlers return values that Microdot converts
   to a :class:`Response` automatically; construct one directly when you
   need custom headers or a specific status code.

   *body*
       Response body. ``str`` is UTF-8-encoded; ``dict`` / ``list`` is
       JSON-encoded and the ``Content-Type`` set accordingly; ``bytes``
       is sent as-is; a file-like object or async generator streams.

   *status_code*
       Numeric HTTP status. Default 200.

   *headers*
       Dict of response headers (case-insensitive).

   *reason*
       Custom reason phrase. Defaults to ``"OK"`` for 200 and ``"N/A"``
       otherwise.

   .. rubric:: Class attributes

   .. attribute:: default_content_type
      :type: str

      Content-Type used when none is set explicitly. Default
      ``'text/plain'``.

   .. attribute:: default_send_file_max_age
      :type: int | None

      ``Cache-Control: max-age`` value for :meth:`send_file` when ``max_age``
      is not given. ``None`` (default) means no Cache-Control header.

   .. attribute:: send_file_buffer_size
      :type: int

      Chunk size for :meth:`send_file` streaming. Default 1024.

   .. attribute:: already_handled
      :type: None

      Sentinel returned from handlers that have already written the
      response directly (used by WebSocket upgrades). Always ``None``;
      the identity is what matters.

   .. attribute:: types_map
      :type: dict

      Extension-to-mime-type map used by :meth:`send_file` for content-
      type inference. Maps ``css``, ``gif``, ``html``, ``jpg``, ``js``,
      ``json``, ``png``, ``txt``, ``svg``.

   .. rubric:: Methods

   .. method:: set_cookie(cookie: str, value: str, path: str | None = None, domain: str | None = None, expires=None, max_age: int | None = None, secure: bool = False, http_only: bool = False, partitioned: bool = False) -> None

      Add a ``Set-Cookie`` header. *expires* may be a pre-formatted
      string or a ``datetime``-like object with ``timetuple()``.
      Returns ``None``; the header is appended to this response in
      place.

   .. method:: delete_cookie(cookie: str, **kwargs) -> None

      Set a ``Set-Cookie`` that expires the given cookie immediately.
      ``kwargs`` accepts the same options as :meth:`set_cookie` (``path``,
      ``domain``, ``secure``, ``http_only``, ``partitioned``); ``expires``
      and ``max_age`` are ignored. Returns ``None``; the header is
      appended to this response in place.

   .. classmethod:: redirect(location: str, status_code: int = 302) -> Response

      Return a redirect response::

          @app.get('/old')
          def old(request):
              return Response.redirect('/new')

   .. classmethod:: send_file(filename: str, status_code: int = 200, content_type: str | None = None, stream=None, max_age: int | None = None, compressed: bool | str = False, file_extension: str = '') -> Response

      Stream a file from the filesystem as the response body.
      ``content_type`` is inferred from the extension via
      :attr:`types_map` if not given. ``compressed=True`` sets
      ``Content-Encoding: gzip`` (the file must already be compressed).

      .. warning::

         *filename* is opened directly. Never pass an unsanitized
         user-supplied path -- doing so allows arbitrary file
         disclosure.

Exceptions
----------

.. exception:: HTTPException

   Raised by :func:`abort` to short-circuit a request with a specific
   status code. Microdot catches this and turns it into the corresponding
   error response.

   .. attribute:: status_code
      :type: int

      Numeric HTTP status code to return -- the value passed to
      :func:`abort`.

   .. attribute:: reason
      :type: str

      Reason phrase to include in the error response. If not given to
      :func:`abort`, defaults to ``"<status_code> error"`` (e.g.
      ``"404 error"``).

class URLPattern
----------------

.. class:: URLPattern(url_pattern: str)

   The compiled form of a route's URL pattern. Constructed automatically
   by :meth:`Microdot.route`; applications rarely instantiate one
   directly.

   .. classmethod:: register_type(type_name: str, pattern: str = '[^/]+', parser: Callable | None = None) -> None

      Register a new dynamic-segment type for use in route patterns.
      Returns ``None``; the type is added to the class-level type
      registry. For example to add a ``<uuid:...>`` type::

          URLPattern.register_type('uuid', '[0-9a-f-]{36}')

      *parser* is an optional callable that converts the captured string
      before it reaches the handler.

   .. method:: match(path: str) -> dict | None

      Match *path* against the pattern and return a dict of captured
      groups, or ``None`` on no match.

Helper classes
--------------

.. class:: MultiDict(initial_dict: dict | None = None)

   A dict subclass that stores multiple values per key. Used for query
   strings and URL-encoded form bodies where the same key can appear
   more than once (``?tag=a&tag=b``).

   .. method:: get(key, default=None, type: Callable | None = None)

      Return the first value for *key*, optionally converted with
      *type* (a callable). Returns *default* if the key is missing or
      the conversion fails; otherwise returns the (optionally
      converted) value.

   .. method:: getlist(key, type: Callable | None = None) -> list

      Return all values for *key* as a list, optionally with each
      value converted by *type*. Returns an empty list if *key* is not
      present.

.. class:: NoCaseDict

   A dict subclass with case-insensitive string keys. Used for
   :attr:`Request.headers` and :attr:`Response.headers`.

Module-level functions
----------------------

.. function:: abort(status_code: int, reason: str | None = None) -> None

   Shortcut for :meth:`Microdot.abort`. Never returns normally -- raises
   :exc:`HTTPException`. Importable as ``from microdot import abort``.

.. function:: redirect(location: str, status_code: int = 302) -> Response

   Shortcut for :meth:`Response.redirect`. Importable as ``from microdot
   import redirect``.

.. function:: send_file(filename: str, **kwargs) -> Response

   Shortcut for :meth:`Response.send_file`.

.. function:: urlencode(s: str) -> str

   Percent-encode a URL component. Replaces characters that have
   reserved meaning in a URL (``/``, ``?``, ``&``, ``=``, ``#``, space,
   ...) with their ``%xx`` hex escapes so the result can safely sit
   inside a path segment or query value. Returns the encoded ``str``.

.. function:: urldecode(s: str) -> str

   Percent-decode a URL component -- the inverse of :func:`urlencode`.
   ``%xx`` escapes are replaced with the byte they encode, and
   ``+`` is converted to a space (the historical query-string
   convention). Returns the decoded ``str``.

Submodules
----------

.. toctree::
   :maxdepth: 1

   microdot.auth.rst
   microdot.cors.rst
   microdot.csrf.rst
   microdot.login.rst
   microdot.multipart.rst
   microdot.session.rst
   microdot.sse.rst
   microdot.websocket.rst
