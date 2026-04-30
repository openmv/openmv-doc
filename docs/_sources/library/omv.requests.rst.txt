:mod:`requests` --- HTTP client
===============================

.. module:: requests
   :synopsis: HTTP client providing common request methods.

The ``requests`` module provides a minimal HTTP/HTTPS client API similar to the
`Python requests <https://docs.python-requests.org/>`_ library. Each request
function returns a `requests.Response` object.

Response class
--------------

.. class:: Response(code: int, reason: str, headers: bytes = None, content: bytes = None)

   Represents an HTTP response. Instances are returned by `requests.request`
   and the per-method helpers.

   .. attribute:: status_code
      :type: int

      Integer HTTP status code returned by the server.

   .. attribute:: reason
      :type: str

      Reason phrase returned by the server (decoded ``str``).

   .. attribute:: encoding
      :type: str

      String encoding used to decode `requests.Response.headers` and
      `requests.Response.content`. Defaults to ``"utf-8"``.

   .. attribute:: headers
      :type: str

      Response headers decoded with `requests.Response.encoding` and returned
      as a ``str``.

   .. attribute:: content
      :type: str

      Response body decoded with `requests.Response.encoding` and returned as
      a ``str``.

   .. method:: json() -> dict

      Parse `requests.Response.content` as JSON and return the resulting
      object.

Functions
---------

.. function:: request(method: str, url: str, data: bytes | None = None, json: Any | None = None, files: dict | None = None, headers: dict = {}, auth: tuple | None = None, stream: Any | None = None) -> Response

   Send an HTTP request to ``url`` and return a `requests.Response`.

   - ``method`` --- HTTP method as a ``str`` (e.g. ``"GET"``, ``"POST"``).
   - ``url`` --- Target URL. Must start with ``http://`` or ``https://``.
   - ``data`` --- Raw request body. If set, ``Content-Length`` is added
     automatically.
   - ``json`` --- Object serialized to JSON and sent as the body. Sets
     ``Content-Type: application/json``.
   - ``files`` --- Dict mapping field name to a ``(filename, fileobj)`` tuple.
     Sent as ``multipart/form-data``.
   - ``headers`` --- Dict of additional request headers.
   - ``auth`` --- ``(username, password)`` tuple for HTTP Basic
     authentication.
   - ``stream`` --- Accepted for API compatibility; not used.

.. function:: head(url: str, **kw) -> Response

   Send a ``HEAD`` request. ``**kw`` is forwarded to `requests.request`.

.. function:: get(url: str, **kw) -> Response

   Send a ``GET`` request. ``**kw`` is forwarded to `requests.request`.

.. function:: post(url: str, **kw) -> Response

   Send a ``POST`` request. ``**kw`` is forwarded to `requests.request`.

.. function:: put(url: str, **kw) -> Response

   Send a ``PUT`` request. ``**kw`` is forwarded to `requests.request`.

.. function:: patch(url: str, **kw) -> Response

   Send a ``PATCH`` request. ``**kw`` is forwarded to `requests.request`.

.. function:: delete(url: str, **kw) -> Response

   Send a ``DELETE`` request. ``**kw`` is forwarded to `requests.request`.
