Returning a snapshot
====================

A status endpoint is fine, but the reason the cam exists is the lens.
Add an endpoint that returns the JPEG of whatever the sensor is
looking at right now.

.. code-block:: python

   import csi
   from microdot import Response

   csi0 = csi.CSI()
   csi0.reset()
   csi0.pixformat(csi.RGB565)
   csi0.framesize(csi.QVGA)

   @app.get('/snapshot.jpg')
   async def snapshot(request):
       img = csi0.snapshot().compress(quality=85)
       return Response(
           body=img.bytearray(),
           headers={'Content-Type': 'image/jpeg'},
       )

Hit ``http://<cam-ip>/snapshot.jpg`` from a browser and a JPEG of the
current view fills the tab. Refresh and you get a fresh one.

The Response object
-------------------

A dict-returning handler lets microdot do the rest. JPEG bytes need
the long form: a :class:`microdot.Response` constructed explicitly.
The ``body`` argument takes any bytes-like value -- the camera's
:class:`image.Image` buffer is exposed via
:meth:`~image.Image.bytearray`, so the same buffer the sensor wrote
into goes straight to the socket.

``Content-Type: image/jpeg`` is what tells the browser to render the
body as an image. Without it the browser would try to display the
JPEG bytes as text and you'd see a screenful of garbage.

:meth:`image.Image.compress` runs JPEG encoding on the existing image
buffer in place and returns the same image (now JPEG-formatted) so
its bytes can be sent as-is. ``quality=85`` is the usual default --
high enough that the picture is sharp, low enough that the file fits
through a slow link.

Capture blocks the loop
-----------------------

:meth:`csi.CSI.snapshot` waits for the sensor to finish exposing and
DMA'ing a frame before it returns. Inside an async handler that means
the event loop stalls for the duration of the exposure -- ten,
twenty, fifty milliseconds depending on lighting. With one client
asking one route at a time this is invisible; with multiple clients,
or a capture coroutine running alongside, it would block everything
else.

A non-blocking variant of :meth:`~csi.CSI.snapshot` exists for the
multi-coroutine case (``blocking=False`` returns the next ready frame
or :data:`None`). For one snapshot per request, the default blocking
call is fine.

The owner can now poke a URL and get a fresh frame.
