:mod:`microdot.session` --- signed cookie sessions
==================================================

.. module:: microdot.session
   :synopsis: Signed-cookie session store for Microdot

A per-user key/value store backed by a :mod:`jwt` in a single
``session`` cookie. The JWT is signed with a secret known only to the
application, so the client can read the cookie but cannot tamper with
the payload without the server detecting it.

class Session
-------------

.. class:: Session(app: Microdot | None = None, secret_key: bytes | str | None = None, cookie_options: dict | None = None)

   *app*
       The :class:`microdot.Microdot` instance to install on. Optional;
       call :meth:`initialize` later if not given.

   *secret_key*
       Symmetric key used to sign the session JWT. Required before any
       session is read or written -- accessing :meth:`get` without one
       raises :exc:`ValueError`. Store it outside source control; on a
       camera this is typically a file on the FAT filesystem.

   *cookie_options*
       Dict of options forwarded to
       :meth:`microdot.Response.set_cookie` whenever the session cookie
       is written. Defaults set ``path='/'`` and ``http_only=True``.
       Add ``secure=True`` for HTTPS-only deployments.

   .. method:: initialize(app: Microdot, secret_key=None, cookie_options=None)

      Attach to *app* if construction was deferred. *secret_key* /
      *cookie_options* override constructor values if given.

   .. method:: get(request) -> SessionDict

      Return the session dictionary for *request*. The dictionary is
      lazily decoded from the ``session`` cookie on first access and
      cached on ``request.g._session`` for the rest of the request.
      Tampered / unsignable cookies return an empty dict.

   .. method:: encode(payload: dict, secret_key=None) -> str

      Encode *payload* as a JWT with the session's secret. Used
      internally; exposed for callers that want to mint compatible
      tokens.

   .. method:: decode(session: str, secret_key=None) -> dict

      Verify and decode a JWT-string session value. Returns ``{}`` on
      any verification failure.

   .. attribute:: secret_key
      :type: bytes | str | None

      The signing secret used to sign and verify the session JWT.
      Settable post-construction. ``None`` until set; reading the
      session without it raises :exc:`ValueError`.

   .. attribute:: cookie_options
      :type: dict

      The dict of options applied to the session cookie when it is
      written, forwarded to :meth:`microdot.Response.set_cookie`.
      Defaults set ``path='/'`` and ``http_only=True`` after
      :meth:`initialize` runs.

class SessionDict
-----------------

.. class:: SessionDict(request, session_dict)

   The dict-like object returned by :meth:`Session.get`. Subclasses
   ``dict``, so all standard mutations work; two extra methods commit
   the changes back into the response.

   .. method:: save()

      Write the (possibly mutated) session back into the response as a
      new ``session`` cookie. Without this call, in-place edits are
      lost when the request ends.

   .. method:: delete()

      Remove the session by emitting a cookie-deletion header on the
      response.

Module-level decorators
-----------------------

.. function:: with_session(f)

   Decorator that passes the session dictionary to the route handler as
   a second argument::

       from microdot import Microdot
       from microdot.session import Session, with_session

       app = Microdot()
       Session(app, secret_key=load_secret())

       @app.get('/counter')
       @with_session
       async def counter(request, session):
           session['n'] = session.get('n', 0) + 1
           session.save()
           return {'n': session['n']}

   The decorator does not auto-save -- call :meth:`SessionDict.save`
   when the session was modified.

The session payload itself is a regular Python dict serialized as JSON
inside the JWT. Keep it small: every request and every response carries
the full cookie, and JWTs are not designed for storing large objects.
For per-user state larger than a few hundred bytes, store the data
server-side keyed by a small session identifier.
