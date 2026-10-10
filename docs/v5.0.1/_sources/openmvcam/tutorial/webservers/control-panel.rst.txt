Building the dashboard
======================

The cam's JSON API is fine for ``curl``, but the owner wants to point
a phone at a URL and *see* something. That means serving HTML, JS,
and CSS from the cam alongside the API.

Static files from the filesystem
--------------------------------

:meth:`microdot.Response.send_file` reads a file from the cam's
filesystem and writes it back with the right ``Content-Type`` inferred
from the extension. One catch-all route at the bottom of the routing
table sends everything that didn't match an API route:

.. code-block:: python

   @app.get('/<path:filename>')
   async def static(request, filename):
       if '..' in filename or filename.startswith('/'):
           abort(403)
       return Response.send_file('/sdcard/static/' + filename)

The ``<path:filename>`` converter from the last page matches segments
that contain slashes -- ``app.js`` and ``css/site.css`` both come
through. The two-line sanity check rejects any path that tries to
escape ``/sdcard/static/`` with ``..`` or an absolute path -- without
it a curious client could read ``../../boot.py`` or
``/flash/secrets.txt``. :func:`~microdot.Response.send_file` itself
does *no* sanitization: it opens whatever path you hand it.

The dashboard files
-------------------

Three files on the cam under ``/sdcard/static/``:

.. code-block:: html

   <!-- /sdcard/static/index.html -->
   <!doctype html>
   <html>
     <head>
       <meta charset="utf-8">
       <title>Backyard cam</title>
       <link rel="stylesheet" href="style.css">
     </head>
     <body>
       <h1>Backyard cam</h1>
       <img id="stream" src="/stream.jpg">
       <label>Threshold:
         <input id="threshold" type="range" min="0" max="100">
         <span id="threshold-value"></span>
       </label>
       <h2>Recent events</h2>
       <ul id="events"></ul>
       <script src="app.js"></script>
     </body>
   </html>

.. code-block:: javascript

   // /sdcard/static/app.js
   const slider = document.getElementById('threshold');
   const sliderValue = document.getElementById('threshold-value');

   async function loadConfig() {
       const r = await fetch('/config');
       const cfg = await r.json();
       slider.value = cfg.threshold;
       sliderValue.textContent = cfg.threshold;
   }
   loadConfig();

   slider.addEventListener('change', async () => {
       sliderValue.textContent = slider.value;
       await fetch('/config', {
           method: 'POST',
           headers: {'Content-Type': 'application/json'},
           body: JSON.stringify({threshold: parseInt(slider.value)}),
       });
   });

.. code-block:: css

   /* /sdcard/static/style.css */
   body { font-family: sans-serif; max-width: 720px; margin: 1em auto; }
   img#stream { width: 100%; }

The HTML loads the MJPEG stream straight into an ``<img>`` -- the
browser handles the multipart response transparently. The slider
reads the threshold from ``/config`` on page load and posts the new
value back on every change.

MIME types and compression
--------------------------

:meth:`~microdot.Response.send_file` reads the file's extension and
picks a ``Content-Type`` from :attr:`microdot.Response.types_map`.
``.html`` becomes ``text/html``, ``.js`` becomes
``text/javascript``, ``.css`` becomes ``text/css``, ``.jpg`` becomes
``image/jpeg``. Extensions you've added to your dashboard
(``.svg``, ``.ico``) are already registered. Anything unknown
defaults to ``application/octet-stream`` -- to add a new mapping,
extend ``Response.types_map`` once at startup.

For assets you've pre-compressed (``style.css.gz``, ``app.js.gz``)
pass ``compressed=True`` and microdot serves the ``.gz`` file with
``Content-Encoding: gzip``. The browser decompresses transparently
and you save a few KB on each page load.

The owner now opens ``http://yard-cam.local/index.html`` and sees the
live feed, the current threshold, and an empty event log.
