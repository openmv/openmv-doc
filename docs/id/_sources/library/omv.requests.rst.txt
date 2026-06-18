:mod:`requests` --- HTTP client
===============================

.. module:: requests
   :synopsis: HTTP client providing common request methods.

The ``requests`` module provides a minimal HTTP/HTTPS client API similar to the
`Python requests <https://docs.python-requests.org/>`_ library. Each request
function returns a `requests.Response` object.

Example::

    import requests

    # GET a JSON resource.
    r = requests.get("https://httpbin.org/get")
    print(r.status_code, r.reason)
    print(r.json())

    # POST JSON.
    r = requests.post(
        "https://httpbin.org/post",
        json={"id": 1, "value": 42},
        headers={"X-Source": "openmv"},
    )
    print(r.json())

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

.. function:: head(url: str, **kw: Any) -> Response

   Send an HTTP ``HEAD`` request and return a :class:`Response`.

   ``HEAD`` is identical to ``GET`` except the server replies with only
   the status line and headers; the body is empty. Use it to check
   whether a resource exists, inspect ``Content-Length`` /
   ``Content-Type`` without downloading the payload, or probe a URL
   before issuing a heavier ``GET``.

   Arguments:

   - ``url`` -- target URL; must start with ``http://`` or ``https://``.
   - ``headers`` (kwarg) -- dict of additional request headers.
   - ``auth`` (kwarg) -- ``(username, password)`` tuple for HTTP Basic
     authentication.

   ``data`` / ``json`` / ``files`` / ``stream`` from :func:`request` are
   accepted for completeness but rarely make sense for ``HEAD``.

.. function:: get(url: str, **kw: Any) -> Response

   Send an HTTP ``GET`` request and return a :class:`Response`.

   ``GET`` is the standard verb for retrieving a representation of the
   resource identified by ``url``. It is *safe* (causes no server-side
   state change) and *idempotent*.

   Arguments:

   - ``url`` -- target URL; must start with ``http://`` or ``https://``.
   - ``headers`` (kwarg) -- dict of additional request headers (for
     example ``Authorization`` or ``Accept``).
   - ``auth`` (kwarg) -- ``(username, password)`` tuple for HTTP Basic
     authentication.

   A request body via ``data`` / ``json`` is permitted by the
   underlying :func:`request` but ignored by most servers.

.. function:: post(url: str, **kw: Any) -> Response

   Send an HTTP ``POST`` request and return a :class:`Response`.

   ``POST`` submits data to ``url``, typically creating a new
   subordinate resource, triggering a form submission, or invoking an
   action. It is neither safe nor idempotent: repeated calls may create
   duplicate resources.

   Arguments:

   - ``url`` -- target URL; must start with ``http://`` or ``https://``.
   - ``data`` (kwarg) -- raw request body (``bytes``-like). Sends a
     ``Content-Length`` header automatically.
   - ``json`` (kwarg) -- object serialised to JSON and sent as the body.
     Sets ``Content-Type: application/json``.
   - ``files`` (kwarg) -- dict mapping a field name to
     ``(filename, fileobj)``. Sent as ``multipart/form-data``.
   - ``headers`` (kwarg) -- dict of additional request headers.
   - ``auth`` (kwarg) -- ``(username, password)`` tuple for HTTP Basic
     authentication.

   Pass at most one of ``data`` / ``json`` / ``files``.

.. function:: put(url: str, **kw: Any) -> Response

   Send an HTTP ``PUT`` request and return a :class:`Response`.

   ``PUT`` replaces the resource at ``url`` with the supplied
   representation, creating it if it does not exist. It is *idempotent*:
   repeating an identical ``PUT`` yields the same final state.

   Arguments:

   - ``url`` -- target URL; must start with ``http://`` or ``https://``.
   - ``data`` (kwarg) -- raw replacement body (``bytes``-like).
   - ``json`` (kwarg) -- object serialised to JSON and sent as the
     replacement body. Sets ``Content-Type: application/json``.
   - ``headers`` (kwarg) -- dict of additional request headers.
   - ``auth`` (kwarg) -- ``(username, password)`` tuple for HTTP Basic
     authentication.

   Pass either ``data`` or ``json`` to carry the new representation.

.. function:: patch(url: str, **kw: Any) -> Response

   Send an HTTP ``PATCH`` request and return a :class:`Response`.

   ``PATCH`` applies a *partial* modification to the resource at ``url``
   -- only the fields contained in the request body change. Unlike
   ``PUT``, it is not required to be idempotent (though many APIs make
   it so).

   Arguments:

   - ``url`` -- target URL; must start with ``http://`` or ``https://``.
   - ``data`` (kwarg) -- raw delta body (``bytes``-like). Format depends
     on the server (e.g. JSON Patch, JSON Merge Patch).
   - ``json`` (kwarg) -- delta object serialised to JSON. Sets
     ``Content-Type: application/json``.
   - ``headers`` (kwarg) -- dict of additional request headers.
   - ``auth`` (kwarg) -- ``(username, password)`` tuple for HTTP Basic
     authentication.

.. function:: delete(url: str, **kw: Any) -> Response

   Send an HTTP ``DELETE`` request and return a :class:`Response`.

   ``DELETE`` requests removal of the resource at ``url``. It is
   *idempotent*: deleting an already-deleted resource is not an error
   (the server typically returns a 404, but the end state is the same).

   Arguments:

   - ``url`` -- target URL; must start with ``http://`` or ``https://``.
   - ``headers`` (kwarg) -- dict of additional request headers.
   - ``auth`` (kwarg) -- ``(username, password)`` tuple for HTTP Basic
     authentication.

   A body via ``data`` / ``json`` is allowed by the underlying
   :func:`request` but rarely used with ``DELETE``.
