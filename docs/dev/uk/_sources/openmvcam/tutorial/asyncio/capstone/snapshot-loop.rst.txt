AsyncCSI
========

A typical OpenMV Cam script ends in
``while True: img = csi0.snapshot()`` -- a blocking
snapshot loop that does not need asyncio at all. The
moment the application has to do *something else* alongside
captures -- listen for a button, send data to a peer, run a
background task -- the blocking call gets in the way. While
``snapshot`` is waiting on the next frame the event loop is
not running, so every other coroutine in the program is
frozen until the frame arrives.

This page builds a small wrapper around :class:`~csi.CSI`
that turns ``snapshot`` into an :keyword:`await`-friendly
coroutine. The result is a drop-in replacement that lets a
capture loop coexist with the rest of an asyncio program.

The pieces
----------

One piece of the :class:`~csi.CSI` API does most of the work
-- :meth:`~csi.CSI.snapshot` in its non-blocking mode.
Calling ``snapshot(blocking=False)`` either returns the next
frame (if one is ready) or :data:`None` (if not). The first
non-blocking call also *starts* the camera's DMA capture if
it wasn't already running, so the wrapper does not have to
do anything special to bootstrap.

The other piece is :func:`asyncio.sleep_ms`. The wrapper
polls non-blocking snapshots in a loop, yielding to the
event loop with ``await asyncio.sleep_ms(0)`` between
checks so every other ready coroutine gets a chance to run
before the next poll.

The wrapper
-----------

::

    import asyncio
    import csi


    class AsyncCSI:
        def __init__(self, *args, **kwargs):
            self._csi = csi.CSI(*args, **kwargs)

        def __getattr__(self, name):
            return getattr(self._csi, name)

        async def snapshot(self):
            while True:
                img = self._csi.snapshot(blocking=False)
                if img is not None:
                    return img
                await asyncio.sleep_ms(0)

The constructor wraps a :class:`~csi.CSI` instance.
``__getattr__`` forwards every attribute the wrapper does
not itself define -- ``reset``, ``pixformat``, ``framesize``,
all the :doc:`sensor knobs
<../../vision/csi/sensor-knobs>` -- to the underlying
:class:`~csi.CSI`, so the wrapper looks identical to the
unwrapped object except for the one method that matters.

``async def snapshot`` is the new piece. It calls
``snapshot(blocking=False)``; if the call returns an image,
the coroutine returns it. Otherwise it yields back to the
event loop with ``await asyncio.sleep_ms(0)`` so other
coroutines get a chance to run, then loops back and tries
again. The first iteration starts the DMA; subsequent
iterations pick up frames as they become available.

A snapshot loop with company
----------------------------

With the wrapper in place, a snapshot loop fits into a
larger asyncio program the same way any other coroutine
does. The example below runs three coroutines concurrently:
the capture loop, an LED blinker, and a heartbeat that
prints ``hello`` once a second::

    import asyncio
    import csi
    from machine import LED


    async def capture_loop(cam):
        while True:
            img = await cam.snapshot()
            # process img here

    async def blinker(led, period_ms):
        while True:
            led.on()
            await asyncio.sleep_ms(period_ms)
            led.off()
            await asyncio.sleep_ms(period_ms)

    async def hello(period_s):
        while True:
            print("hello")
            await asyncio.sleep(period_s)

    async def main():
        cam = AsyncCSI()
        cam.reset()
        cam.pixformat(csi.RGB565)
        cam.framesize(csi.QVGA)

        asyncio.create_task(blinker(LED("LED_BLUE"), 200))
        asyncio.create_task(hello(1))
        await capture_loop(cam)

    asyncio.run(main())

All three coroutines make progress on the same event loop.
While ``capture_loop`` is yielding between non-blocking
snapshot polls, ``blinker`` toggles the LED and ``hello``
prints. While ``blinker`` and ``hello`` are sleeping,
``capture_loop`` polls the camera. The polling interval is
short -- a single event-loop tick -- so it adds negligible
latency to when the application sees a new frame.

The capture loop does *not* block the event loop. Adding
more concurrent work -- a UART client, for instance -- is
just another :func:`~asyncio.create_task` call inside
``main``.

.. note::

   The :doc:`framebuffers <../../vision/csi/framebuffers>`
   setting still matters in this shape. Single-buffer mode
   makes ``snapshot(blocking=False)`` return ``None`` until
   the next frame is captured; double or triple buffering
   smooths that over so that the wrapper usually finds a
   buffered frame waiting on the first poll after the
   previous frame has been processed.
