Sharing one capture loop across viewers
=======================================

Each connected client calling ``csi0.snapshot()`` independently is
wasteful, and once two streams are open at once it gets worse: the
sensor delivers frames at its own rate, and every duplicated capture
slows everybody down. The right approach is one capture coroutine
that publishes "the latest frame" to a shared slot, plus per-client
iterators that read from the slot.

.. image:: figures/shared-capture-loop.svg
   :alt: One capture task writes JPEG bytes to a single latest_jpeg
         slot; three stream-client iterators read from the slot and
         each wait on the shared new_frame event.
   :align: center

The capture task
----------------

A background coroutine grabs frames as fast as the sensor delivers
them, JPEG-compresses each one into a shared ``bytes``, and pulses an
event so any waiting client wakes up:

.. code-block:: python

   latest_jpeg = None
   new_frame = asyncio.Event()

   async def capture_loop():
       global latest_jpeg
       while True:
           img = await csi0.snapshot()
           latest_jpeg = bytes(img.compress(quality=85).bytearray())
           new_frame.set()
           new_frame.clear()

The ``set()`` / ``clear()`` pair is the *pulse* pattern. ``set()``
unblocks every coroutine currently waiting on the event in one go;
``clear()`` immediately resets the event so the next ``wait()``
blocks again. With multiple consumers (a viewer, another viewer, any
other coroutine that needs to react to a new frame), no single
consumer is responsible for resetting the event, and nobody steals a
wake-up from anybody else.

.. note::

   The ``bytes(...)`` wrap around the JPEG is load-bearing here.
   :meth:`~image.Image.bytearray` returns a view into the camera's
   image buffer; the very next :meth:`~csi.CSI.snapshot` call
   rewrites that buffer in place with the next frame.
   ``latest_jpeg`` outlives the local ``img``, so without the copy
   every reader would see the slot shift under them on every
   capture.

Per-client iterators read from the slot
---------------------------------------

The MJPEG stream handler stops calling ``csi0.snapshot()`` itself.
Instead, each ``FrameStream`` instance waits on the shared event and
reads from the shared bytes:

.. code-block:: python

   class FrameStream:
       # One instance per connected client. Each one independently
       # waits on the shared new_frame pulse; the capture loop is
       # responsible for resetting the event between frames.

       def __aiter__(self):
           return self

       async def __anext__(self):
           await new_frame.wait()
           if latest_jpeg is None:
               return b''
           return (b'--' + BOUNDARY + b'\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n'
                   + latest_jpeg + b'\r\n')

The snapshot route changes too: it no longer triggers a capture, it
returns whatever ``latest_jpeg`` currently holds:

.. code-block:: python

   @app.get('/snapshot.jpg')
   async def snapshot(request):
       if latest_jpeg is None:
           return 'no frame yet', 503
       return Response(
           body=latest_jpeg,
           headers={'Content-Type': 'image/jpeg'},
       )

The ``(body, status)`` tuple is microdot's shorthand for setting an
HTTP status code without constructing a :class:`microdot.Response`.
503 says *I'm here but not ready* -- the right code for "ask again in
a moment."

Running capture alongside the server
------------------------------------

``main`` now has two top-level coroutines: the capture loop and the
HTTP server. :func:`asyncio.gather` runs them both, and if either
crashes the other is cancelled:

.. code-block:: python

   async def main():
       await asyncio.gather(
           capture_loop(),
           app.start_server(host='0.0.0.0', port=80),
       )

   asyncio.run(main())

Now the sensor reads one frame per cycle no matter how many viewers
are connected. The first browser to ``/stream.jpg`` sees frames; so
does the second, the third, the tenth -- they all share the same
capture, and the cam stays as responsive on its other routes.
