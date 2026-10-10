:mod:`microdot.cors` --- Cross-Origin Resource Sharing
======================================================

.. module:: microdot.cors
   :synopsis: CORS support for Microdot

Adds the headers a browser needs to allow JavaScript running on one
origin to call your camera-hosted endpoints on a different origin. The
class wires itself into the application's ``OPTIONS`` handler (for
preflight requests) and after-request hook (for the ``Access-Control-*``
headers on normal responses).

class CORS
----------

.. class:: CORS(app: Microdot | None = None, allowed_origins=None, allow_credentials: bool = False, allowed_methods: list | None = None, expose_headers: list | None = None, allowed_headers: list | None = None, max_age: int | None = None, handle_cors: bool = True)

   *app*
       The :class:`microdot.Microdot` instance to attach to. May be
       ``None`` to defer attachment; call :meth:`initialize` later.

   *allowed_origins*
       A list of origin strings (``["https://app.example.com"]``) or the
       literal ``'*'`` to allow any origin. Origins that do not match
       this list get no CORS headers, which the browser interprets as
       "this request is not allowed".

   *allow_credentials*
       If ``True``, add ``Access-Control-Allow-Credentials: true`` so
       the browser sends cookies and auth headers with cross-origin
       requests. Cannot be used with ``allowed_origins='*'`` for any
       request that needs credentials (browsers reject that
       combination).

   *allowed_methods*
       List of methods (``['GET', 'POST']``) the browser may use cross-
       origin. ``None`` means any.

   *expose_headers*
       List of response header names the browser may expose to
       JavaScript.

   *allowed_headers*
       List of request header names clients may include cross-origin.
       ``None`` means any (echoes the preflight's
       ``Access-Control-Request-Headers``).

   *max_age*
       Seconds the browser may cache the preflight result. Skipping it
       means the browser revalidates every preflight.

   *handle_cors*
       If ``False``, the class is configured but does not actually
       attach itself -- useful when you want to manually combine its
       :meth:`get_cors_headers` output with other middleware.

   .. method:: initialize(app: Microdot, handle_cors: bool = True)

      Attach to *app* if construction was deferred.

   .. method:: get_cors_headers(request) -> dict

      Compute the set of ``Access-Control-*`` headers that apply to
      *request*. Used internally by the after-request hook;
      applications can call it directly when emitting CORS headers from
      custom middleware.

   .. attribute:: allowed_origins
      :type: list | str | None

      The configured list of origins, or the literal ``'*'``. Mirrors
      the *allowed_origins* constructor argument; reassign at runtime
      to change the policy without rebuilding the object.

   .. attribute:: allow_credentials
      :type: bool

      Whether ``Access-Control-Allow-Credentials: true`` is emitted on
      matching requests. Mirrors the *allow_credentials* constructor
      argument.

   .. attribute:: allowed_methods
      :type: list | None

      List of method names allowed cross-origin, or ``None`` for "any".
      Mirrors the *allowed_methods* constructor argument.

   .. attribute:: expose_headers
      :type: list | None

      List of response headers the browser may expose to JavaScript,
      or ``None`` to omit the ``Access-Control-Expose-Headers`` header.
      Mirrors the *expose_headers* constructor argument.

   .. attribute:: allowed_headers
      :type: list | None

      List of request header names accepted cross-origin, lowercased,
      or ``None`` for "echo whatever the preflight asked for". Mirrors
      the *allowed_headers* constructor argument (the constructor
      lowercases the list before storing it).

   .. attribute:: max_age
      :type: int | None

      Seconds the browser may cache the preflight response, or
      ``None`` to omit the ``Access-Control-Max-Age`` header. Mirrors
      the *max_age* constructor argument.

Example::

    from microdot import Microdot
    from microdot.cors import CORS

    app = Microdot()
    CORS(app,
         allowed_origins=['https://dashboard.example.com'],
         allow_credentials=True,
         max_age=86400)

    @app.get('/api/status')
    async def status(request):
        return {'ok': True}

The preflight ``OPTIONS`` request is handled automatically; the camera
returns the appropriate ``Access-Control-*`` headers and ``204 No
Content``. Actual ``GET`` / ``POST`` / etc. responses pick up the
``Access-Control-Allow-Origin`` header via the registered after-request
hook.
