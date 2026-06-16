Uploading triggered frames to the cloud
=======================================

When motion fires the cam now lights up the dashboard. That's enough
for live use, but the owner also wants a permanent archive of every
triggered frame, stored somewhere outside the cam. That's an outbound
HTTP call -- the cam acting as a *client*.

The cam as a client
-------------------

The :mod:`requests` module is the cam's outbound HTTP client. Its
surface is a deliberate copy of CPython's ``requests`` -- the same
verb-named module functions, the same ``files=``, ``json=``,
``headers=``, ``auth=`` keyword arguments. If you've made HTTP calls
from CPython you already know the API:

.. code-block:: python

   import requests
   import io

   ARCHIVE_URL = 'https://api.backyard-cloud.com/frames'
   ARCHIVE_TOKEN = load_archive_token()

   async def archive_frame(jpeg, ts):
       try:
           r = requests.post(
               ARCHIVE_URL,
               files={'image': (
                   'frame-{}.jpg'.format(ts),
                   io.BytesIO(jpeg),
               )},
               headers={'Authorization': 'Bearer ' + ARCHIVE_TOKEN},
           )
       except OSError as e:
           print('upload failed:', e)
           return False
       if r.status_code >= 400:
           print('archive rejected:', r.status_code, r.reason)
           return False
       return True

:func:`requests.post` opens a TCP connection, sends the request, and
returns a :class:`~requests.Response` with ``status_code``,
``reason``, ``headers``, ``content``, ``json()``, and the rest of
the familiar properties.

``files={...}`` builds a ``multipart/form-data`` body. The value is a
``(filename, file-like)`` tuple; :func:`requests.post` reads the
file-like in chunks so the whole JPEG doesn't have to be re-buffered
into a string first. :class:`io.BytesIO` wraps the already-in-memory
JPEG bytes so they expose a read-as-file interface.

``headers={...}`` is a straight dict that gets sent as request
headers -- here, a bearer token in the standard ``Authorization``
position. The archive provider documents what token format they want;
the example is the most common form.

Wiring it into the motion detector
----------------------------------

The motion-detector coroutine introduced earlier already runs on
every new frame and fires when ``change > state['threshold']``. Add
the upload there, but fire it as a *background* task so the detector
doesn't stop watching while the upload is in flight:

.. code-block:: python

   async def motion_detector():
       global last_motion
       prev = None
       while True:
           await new_frame.wait()
           change = compute_change(prev, latest_jpeg)
           if change > state['threshold']:
               state['trigger_count'] += 1
               ts = int(time.time())
               last_motion = {'ts': ts,
                              'count': state['trigger_count'],
                              'change': change}
               motion_event.set()
               asyncio.create_task(archive_frame(latest_jpeg, ts))
           prev = latest_jpeg
           await asyncio.sleep_ms(50)

:func:`asyncio.create_task` schedules the upload coroutine and
returns immediately. The detector keeps grabbing frames; the upload
runs alongside it; the cam never stalls.

Failure modes
-------------

Network code fails. The cam might be offline, the archive might be
down, the bearer token might have expired. The categories worth
catching:

* :exc:`OSError` -- the TCP connection couldn't be opened or was
  closed mid-transfer. DNS failure, no route, connection reset.
  ``requests`` raises this exact exception.
* ``status_code >= 400`` -- the server received the request and
  rejected it. 401 for an expired token, 403 for a revoked one, 413
  for a too-large body, 5xx for the archive being unhealthy.
* Silent timeout -- ``requests`` uses a default socket timeout (a few
  seconds); past that it raises :exc:`OSError` with
  :data:`errno.ETIMEDOUT`.

For an archive that genuinely matters, you'd queue rejected frames to
``/sdcard/pending/`` and retry on a slower loop -- that's a few more
lines per case, on top of what's shown.

What :mod:`requests` doesn't do
-------------------------------

The MicroPython port is deliberately small. A few things the CPython
``requests`` does that this one doesn't:

* Connection pooling. Every call opens a new TCP connection.
* Automatic retries on transient errors. Wrap the call yourself.
* Streaming responses. ``r.content`` is read into RAM in full;
  there's no ``stream=True`` equivalent.
* Automatic decompression of gzipped responses. Set the
  ``Accept-Encoding`` header explicitly only if the server is
  configured for it.

See :doc:`/library/omv.requests` for the full method list and what's
in / out of scope.

HTTPS works out of the box -- the URL scheme drives it, and the
default SSL context is created on the fly. For verifying the
archive's cert against a CA bundle you've loaded onto the cam, see
the *as a client* section of :doc:`/openmvcam/tutorial/production/tls/as-client`.

The app is fully shipped: live preview, motion detection, dashboard
with login, HTTPS, CORS/CSRF, cloud archive.
