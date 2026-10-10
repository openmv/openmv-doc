A control API for the cam
=========================

The owner needs to set the motion detector's sensitivity from
anywhere -- the wind moves trees more on a windy day. That means
routes the dashboard can read the current settings from and post
changes to.

A small shared state dict on the module is enough to hold the knobs.
Later pages add more keys to it; for now there's one:

.. code-block:: python

   state = {
       'threshold': 12,
       'frame_count': 0,
       'trigger_count': 0,
   }

GET to read, POST to write
--------------------------

A pair of routes -- one ``get``, one ``post`` -- gives the dashboard
read/write access to ``state``:

.. code-block:: python

   from microdot import abort

   @app.get('/config')
   async def get_config(request):
       return state

   @app.post('/config')
   async def set_config(request):
       body = request.json
       if not body or 'threshold' not in body:
           abort(400, 'missing threshold')
       try:
           threshold = int(body['threshold'])
       except (TypeError, ValueError):
           abort(400, 'threshold must be an integer')
       if not 0 <= threshold <= 100:
           abort(400, 'threshold out of range')
       state['threshold'] = threshold
       return {'ok': True, 'threshold': threshold}

:attr:`microdot.Request.json` returns the body parsed as JSON, or
:data:`None` if ``Content-Type`` wasn't ``application/json``. The
``post`` handler walks each failure mode -- missing key, wrong type,
out of range -- and bails with :func:`microdot.abort`, which raises
:class:`microdot.HTTPException` to short-circuit the handler with the
given status and message.

GET, POST, PUT, DELETE
----------------------

:meth:`~microdot.Microdot.get` and :meth:`~microdot.Microdot.post` are
the two we'll use most. :meth:`~microdot.Microdot.put` and
:meth:`~microdot.Microdot.delete` exist for cases that follow REST
conventions -- a ``PUT /events/42`` to replace event 42, a
``DELETE /events/42`` to drop it. The handler is otherwise identical.

Reading query strings and forms
-------------------------------

The dashboard posts JSON, so ``request.json`` is what we want. Two
other ways the cam might receive data:

* :attr:`~microdot.Request.args` -- the query string. ``?foo=1&bar=2``
  becomes a :class:`microdot.MultiDict` you can read with
  ``request.args.get('foo')``.
* :attr:`~microdot.Request.form` -- an HTML form posted as
  ``application/x-www-form-urlencoded``. Same :class:`MultiDict`
  type.

The MultiDict is dict-like but lets one key carry multiple values
(``?tag=cat&tag=dog`` is two ``tag`` values); see
:class:`microdot.MultiDict` for the full surface.

Dynamic URL segments
--------------------

A route path can declare typed placeholders that microdot passes to
the handler as extra arguments:

.. code-block:: python

   @app.get('/events/<int:event_id>')
   async def get_event(request, event_id):
       return {'id': event_id, 'msg': 'placeholder'}

The supported converters are ``<int:>``, ``<re:>`` for a custom
regex, ``<path:>`` for a segment that can contain slashes, and the
default (no prefix) for "match anything up to the next slash."
``<int:event_id>`` accepts ``/events/42`` and rejects
``/events/abc`` -- the rejection becomes a 404 without the handler
running.

Custom error responses
----------------------

The default 404 microdot sends is plain ``Not found``. The dashboard
expects JSON for every response; override the 404 handler so it
returns JSON too:

.. code-block:: python

   @app.errorhandler(404)
   async def not_found(request):
       return {'error': 'not found', 'path': request.path}, 404

:meth:`~microdot.Microdot.errorhandler` takes either a status code
(catches every error of that status) or an exception class (catches
every handler that raised that exception). The ``(body, status)``
tuple short-circuits the response without constructing a
:class:`~microdot.Response`.

The cam now exposes its state and accepts edits.
