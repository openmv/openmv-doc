:mod:`microdot.csrf` --- CSRF protection
========================================

.. module:: microdot.csrf
   :synopsis: Cross-Site Request Forgery protection for Microdot

Rejects state-changing requests that originate cross-site. The check
runs as a ``before_request`` hook and uses the browser-supplied
``Sec-Fetch-Site`` header (with the ``Origin`` header as a fallback for
older browsers, when paired with a :class:`microdot.cors.CORS`
instance).

class CSRF
----------

.. class:: CSRF(app: Microdot | None = None, cors=None, protect_all: bool = True, allow_subdomains: bool = False)

   *app*
       The :class:`microdot.Microdot` instance to install on. Optional;
       call :meth:`initialize` later if not given.

   *cors*
       The :class:`microdot.cors.CORS` instance that defines the
       application's trusted origins. Required for falling back to the
       ``Origin`` header on browsers that do not send
       ``Sec-Fetch-Site``. Optional; without it, only the
       ``Sec-Fetch-Site`` check applies.

   *protect_all*
       If ``True`` (default), every route except ``GET``, ``HEAD``, and
       ``OPTIONS`` is protected automatically. Routes can be exempted
       individually with :meth:`exempt`. If ``False``, no routes are
       protected by default and individual routes opt in with
       :meth:`protect`.

   *allow_subdomains*
       If ``True``, requests from subdomains of the application's
       origins are accepted (``same-site`` Sec-Fetch-Site, or matching
       origin suffix).

   .. method:: initialize(app: Microdot, cors=None)

      Attach to *app* if construction was deferred.

   .. method:: exempt(f)

      Decorator that exempts a route from CSRF protection. Place it
      directly after the route decorator::

          @app.post('/webhook')
          @csrf.exempt
          async def webhook(request):
              # accepts cross-site POSTs

   .. method:: protect(f)

      Decorator that forces CSRF protection on a route that would
      otherwise be exempt (e.g. a ``GET`` route or every route when
      ``protect_all=False``).

   .. attribute:: SAFE_METHODS
      :type: list

      Class attribute listing methods that are not protected by default
      -- ``['GET', 'HEAD', 'OPTIONS']``.

Example::

    from microdot import Microdot
    from microdot.cors import CORS
    from microdot.csrf import CSRF

    app = Microdot()
    cors = CORS(app, allowed_origins=['https://app.example.com'])
    csrf = CSRF(app, cors=cors)

    @app.post('/api/save')
    async def save(request):
        # automatically CSRF-protected
        return {'ok': True}

A request is allowed when ``Sec-Fetch-Site`` reports ``same-origin`` or
``none`` (or ``same-site`` when ``allow_subdomains=True``). If the
header is absent, the request's ``Origin`` is matched against the CORS
allow-list. Requests with neither header are accepted (typical for
direct API calls that aren't subject to browser CSRF).
