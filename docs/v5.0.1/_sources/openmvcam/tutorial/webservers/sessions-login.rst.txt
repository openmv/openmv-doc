Login for the dashboard
=======================

The web dashboard needs a login form -- random people on the LAN
shouldn't see the yard. That's what cookie-backed sessions and the
login decorator do.

A session is a small dict the cam writes into a cookie. The cookie is
signed with the JWT-signing secret loaded earlier in the chapter, so
the browser can carry it around but can't tamper with the contents
without invalidating the signature.

Set up the session and login objects
------------------------------------

:class:`microdot.session.Session` installs the session machinery on
``app``. :class:`microdot.login.Login` adds the
``login_required``-style decorator and the ``login_user`` /
``logout_user`` helpers:

.. code-block:: python

   # auth/login.py
   from microdot.session import Session
   from microdot.login import Login

   Session(app, secret_key=SECRET,
           cookie_options={'http_only': True, 'secure': False})
   login = Login()

   USERS = {
       'owner': {'id': 'owner', 'password_hash': load_password_hash()},
   }

   @login.user_loader
   async def load_user(user_id):
       return USERS.get(user_id)

``http_only=True`` keeps JavaScript on the page from reading the
cookie -- a layered defense against an XSS attacker hijacking the
session. ``secure=False`` is a placeholder until HTTPS is in place;
flip it to ``True`` once the server runs over TLS so the cookie
never travels over plain HTTP.

.. note::

   *Cross-site scripting* (XSS) is the class of attacks where the
   attacker gets JavaScript executing inside the user's view of a
   trusted page -- typically through an unescaped form field, an
   HTML-rendered comment, or a vulnerable third-party widget. The
   ``http_only`` cookie flag doesn't prevent XSS; it just keeps the
   session cookie out of reach of the injected script, so a
   successful XSS can't trivially be turned into session
   hijacking.

The ``user_loader`` is called on every protected request to turn the
ID stored in the session into the user record the handler will see.
Keep it cheap -- it runs on the hot path.

Login form, login post, logout
------------------------------

The login form itself is a static page served from ``/sdcard/static/``
just like the dashboard. The form ``POST``\ s to ``/login``:

.. code-block:: python

   from microdot import redirect

   @app.get('/login')
   async def login_form(request):
       return Response.send_file('/sdcard/static/login.html')

   @app.post('/login')
   async def do_login(request):
       form = request.form
       user = USERS.get(form.get('user'))
       if not user or not check_password(user, form.get('pass')):
           return redirect('/login?error=1')
       return await login.login_user(request, user, remember=True)

   @app.post('/logout')
   async def logout(request):
       await login.logout_user(request)
       return redirect('/login')

:meth:`microdot.login.Login.login_user` writes the session cookie and
returns a 302 redirect to whatever page the client originally tried
to reach (``next=`` query argument, falling back to ``/``).
``remember=True`` also writes a longer-lived ``_remember`` cookie so
the session survives a browser restart.

:meth:`microdot.login.Login.logout_user` clears both cookies and a
follow-up redirect sends the browser back to the form.

Protecting the dashboard
------------------------

Decorate every dashboard-facing route with ``@login`` so an
unauthenticated request gets a 302 to ``/login`` instead of the
content:

.. code-block:: python

   @app.get('/<path:filename>')
   @login
   async def static(request, filename):
       ...

   @app.get('/config')
   @login
   async def get_config(request):
       ...

   @app.post('/config')
   @login
   async def set_config(request):
       ...

   @app.get('/events')
   @login
   @with_sse
   async def events(request, sse):
       ...

   @app.get('/control')
   @login
   @with_websocket
   async def control(request, ws):
       ...

The token-based API endpoints (``/api/login``, ``/api/ack``) stay
token-based -- they're for the phone app, not the browser. Token
auth and session auth happily coexist on the same ``app``.

Fresh vs remembered sessions
----------------------------

The ``_remember`` cookie keeps the user logged in across browser
restarts, but it's a weaker form of auth -- the browser could have
been left in a cafe. For routes that change passwords, register API
tokens, or do anything else worth re-authenticating for, decorate
with :meth:`@login.fresh <microdot.login.Login.fresh>` instead of
``@login``. A fresh login is one where the user typed their password
*this* session; a remembered login is not. The dashboard has nothing
that rises to that bar, but the decorator is there when you need it.

The dashboard now requires a login before any of its routes respond.
