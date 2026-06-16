:mod:`microdot.login` --- user login flow
=========================================

.. module:: microdot.login
   :synopsis: Cookie-based user login flow for Microdot

A higher-level wrapper around :mod:`microdot.session` that implements
the conventional username / password login flow: a *user loader*
callback maps the session's stored user-id back to the application's
user object, route decorators redirect unauthenticated requests to a
configurable login URL, and optional "remember me" cookies let returning
visitors stay signed in across browser sessions.

Requires :mod:`microdot.session` to be initialized on the application
*before* the login object is constructed -- the session is where the
user-id is stored.

class Login
-----------

.. class:: Login(login_url: str = '/login')

   *login_url*
       URL the decorator redirects unauthenticated requests to. The
       application provides the actual login form/handler at this
       route. Default ``'/login'``.

   .. method:: user_loader(f)

      Decorator that registers the user-resolver callback. *f* takes
      the user-id stored in the session and returns the user object
      (or ``None`` if the id is no longer valid -- a deleted account,
      a revoked session, etc.).

      ::

          login = Login()

          @login.user_loader
          async def load_user(user_id):
              return users.get(user_id)

   .. method:: __call__(f)

      Decorating a route with the :class:`Login` instance gates it
      behind authentication::

          @app.get('/dashboard')
          @login
          async def dashboard(request):
              user = request.g.current_user
              # ...

      Unauthenticated requests are redirected to *login_url* with a
      ``?next=<original-url>`` query parameter so the login handler
      can send the user back where they came from.

   .. method:: fresh(f)

      Like :meth:`__call__`, but rejects sessions restored from a
      "remember me" cookie -- the user must have logged in explicitly
      since the last full login. Used to gate sensitive routes
      (password change, account deletion) so a stolen remember-me
      cookie cannot reach them.

   .. method:: login_user(request, user, remember: bool | int = False, redirect_url: str = '/')
      :async:

      Mark *user* as logged in for *request*. Stores the user id in
      the session and returns a redirect response.

      *user*
          The user object returned by the user loader. Must have an
          ``id`` attribute.

      *remember*
          If truthy, also set a long-lived ``_remember`` cookie. Pass
          ``True`` for the default 30 days, or an integer for the
          number of days the cookie should last.

      *redirect_url*
          Where to redirect after login. Overridden by ``?next=<url>``
          from the original request if it points to a same-site path.

      Returns the redirect response -- return its value from the login
      route handler.

   .. method:: logout_user(request)
      :async:

      Clear the user id from the session and remove any
      ``_remember`` cookie. Use from a ``/logout`` route::

          @app.post('/logout')
          async def logout(request):
              await login.logout_user(request)
              return redirect('/')

   .. method:: get_current_user(request)
      :async:

      Return the currently logged-in user object (or ``None``).
      Memoized on ``request.g.current_user`` so repeated calls within
      one request hit the loader only once.

Example
-------

A minimal login flow::

    from microdot import Microdot, redirect
    from microdot.session import Session
    from microdot.login import Login

    app = Microdot()
    Session(app, secret_key=load_secret())
    login = Login()

    @login.user_loader
    async def load_user(user_id):
        return users.get(user_id)

    @app.get('/login')
    async def login_page(request):
        return Response.send_file('static/login.html')

    @app.post('/login')
    async def do_login(request):
        user = authenticate(request.form['user'], request.form['pass'])
        if not user:
            return redirect('/login?error=1')
        return await login.login_user(request, user, remember=True)

    @app.get('/dashboard')
    @login
    async def dashboard(request):
        return 'hi ' + request.g.current_user.name

    @app.post('/logout')
    async def logout(request):
        await login.logout_user(request)
        return redirect('/')

The ``_remember`` cookie is itself a signed JWT (using the session's
secret), so a stolen cookie cannot be reused on a different
application or after the secret has been rotated.
