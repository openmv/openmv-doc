Wrap up
=======

The cam in the yard now watches what's in front of it, streams the
view to whichever phone is logged in, fires Server-Sent Events the
moment something moves, accepts dashboard commands over a WebSocket,
and uploads a JPEG of every triggered frame to a cloud archive --
all over HTTPS, behind a login, with CORS and CSRF closing the door
on cross-site mischief. One script, four background coroutines
sharing the asyncio loop with one HTTP server, three small files in
``/sdcard/static/`` for the dashboard, one signing secret on the
filesystem.

Reference roadmap
-----------------

When you reach for one of these features in your own application,
the reference pages are the lookup destinations:

* :doc:`/library/microdot` -- :class:`microdot.Microdot`,
  :class:`~microdot.Request`, :class:`~microdot.Response`, the
  route decorators, :meth:`~microdot.Microdot.mount`,
  :func:`microdot.abort`, :func:`microdot.redirect`,
  :meth:`~microdot.Microdot.start_server`,
  :meth:`~microdot.Microdot.run`.
* :doc:`/library/microdot.auth` --
  :class:`~microdot.auth.BasicAuth` and
  :class:`~microdot.auth.TokenAuth` for header-based auth.
* :doc:`/library/microdot.session` -- the signed-cookie session
  store.
* :doc:`/library/microdot.login` -- the login flow built on top of
  session.
* :doc:`/library/microdot.sse` -- Server-Sent Events for one-way
  push.
* :doc:`/library/microdot.websocket` -- WebSockets for two-way
  framed messaging.
* :doc:`/library/microdot.cors` -- the CORS middleware.
* :doc:`/library/microdot.csrf` -- the CSRF middleware.
* :doc:`/library/microdot.multipart` -- form and file upload
  parsing (the backyard cam doesn't accept uploads, but most
  dashboards eventually do).
* :doc:`/library/jwt` -- the JWT primitive that backs both
  :class:`~microdot.auth.TokenAuth` and the session store.
* :doc:`/library/omv.requests` -- the outbound HTTP client.

Each one is a one-page lookup. Use them now that you've seen each
piece in context.
