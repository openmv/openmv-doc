:mod:`microdot.auth` --- HTTP authentication
============================================

.. module:: microdot.auth
   :synopsis: HTTP basic and bearer-token authentication for Microdot

Decorators that gate routes behind HTTP authentication. Two flavors:
:class:`BasicAuth` for the ``Authorization: Basic <base64>`` scheme that
browsers prompt for natively, and :class:`TokenAuth` for the
``Authorization: Bearer <token>`` scheme that APIs use.

Both classes derive from a common :class:`BaseAuth` base; an application
constructs the auth object, registers an authentication callback with
:meth:`~BaseAuth.authenticate`, then decorates protected routes with the
auth instance.

class BasicAuth
---------------

.. class:: BasicAuth(realm: str = 'Please login', charset: str = 'UTF-8', scheme: str = 'Basic', error_status: int = 401)

   HTTP Basic authentication. The browser pops a username / password
   dialog when an unauthenticated request hits a protected route and
   sends ``Authorization: Basic <base64(user:pass)>`` on subsequent
   requests.

   *realm*
       The realm string the browser shows next to the prompt.

   *charset*
       Charset advertised in the ``WWW-Authenticate`` challenge.

   *scheme*
       Authentication scheme name. Default ``'Basic'``.

   *error_status*
       HTTP status returned on failed authentication. Default 401.

   .. method:: authenticate(f)

      Decorator that registers the credential check. *f* takes
      ``(request, username, password)`` and returns the authenticated
      user object (or ``None`` on bad credentials). The returned object
      is stored on ``request.g.current_user``.

      ::

          basic = BasicAuth(realm='Camera')

          @basic.authenticate
          async def check(request, username, password):
              user = users.get(username)
              if user and user.check_password(password):
                  return user

   .. method:: __call__(f)

      Decorating a route with the :class:`BasicAuth` instance protects
      it::

          @app.route('/admin')
          @basic
          def admin(request):
              return 'hello ' + request.g.current_user.name

   .. method:: optional(f)

      Like :meth:`__call__`, but does not reject requests that lack
      credentials -- the handler still runs, with
      ``request.g.current_user`` set to either the authenticated user or
      ``None``.

class TokenAuth
---------------

.. class:: TokenAuth(header: str = 'Authorization', scheme: str = 'Bearer', error_status: int = 401)

   Bearer-token authentication. Clients send a token in the
   ``Authorization`` header; the application validates it against
   whatever backing store it likes.

   *header*
       The header name carrying the token. The default
       ``'Authorization'`` expects the value ``Bearer <token>``; a
       custom header carries the token value directly.

   *scheme*
       Auth scheme for the ``Authorization`` header. Default
       ``'Bearer'``.

   *error_status*
       HTTP status on auth failure. Default 401.

   .. method:: authenticate(f)

      Decorator that registers the token check. *f* takes
      ``(request, token)`` and returns a user object or ``None``::

          import jwt

          tokens = TokenAuth()

          @tokens.authenticate
          async def check(request, token):
              try:
                  claims = jwt.decode(token, SECRET)
              except jwt.exceptions.PyJWTError:
                  return None
              return claims['sub']

   .. method:: errorhandler(f)

      Decorator that overrides the default 401 response. *f* takes the
      request object and returns a response (or aborts).

   .. method:: __call__(f: Callable) -> Callable

      Decorating a route with the :class:`TokenAuth` instance protects
      it. Requests without a valid token are rejected (401 by default,
      or whatever :meth:`errorhandler` returned). On success the
      authenticated user is on ``request.g.current_user``::

          @app.get('/api/me')
          @tokens
          async def me(request):
              return {'user': request.g.current_user}

      Returns the wrapped handler.

   .. method:: optional(f: Callable) -> Callable

      Like :meth:`__call__`, but does not reject requests that lack a
      token -- the handler still runs, with ``request.g.current_user``
      set to either the authenticated user or ``None``. Useful for
      routes that change their output based on whether the caller is
      authenticated without requiring it::

          @app.get('/api/feed')
          @tokens.optional
          async def feed(request):
              if request.g.current_user:
                  return personalized_feed(request.g.current_user)
              return public_feed()

      Returns the wrapped handler.

class BaseAuth
--------------

.. class:: BaseAuth

   Common base for :class:`BasicAuth` and :class:`TokenAuth`. Custom auth
   schemes can subclass it.

   .. attribute:: auth_callback
      :type: Callable | None

      The callback registered via :meth:`authenticate
      <BasicAuth.authenticate>`. ``None`` until the application
      registers the callback (decorating a function with
      ``@auth.authenticate`` is what sets it).

   .. attribute:: error_callback
      :type: Callable

      Async callable returning the response sent on auth failure.
      Set by the constructor to a default that returns a 401
      response; replace it via :meth:`errorhandler
      <TokenAuth.errorhandler>` on :class:`TokenAuth`, or directly on
      a custom :class:`BaseAuth` subclass.

The decorated routes get ``request.g.current_user`` populated with the
value returned from the authentication callback. Inside the route,
inspect that attribute to identify the caller.
