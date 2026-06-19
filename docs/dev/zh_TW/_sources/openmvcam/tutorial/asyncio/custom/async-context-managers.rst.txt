Async context managers
======================

The :doc:`Python Overview <../../python/classes/context-managers>`
introduced context managers -- the objects ``with`` blocks
drive, with ``__enter__`` running on the way in and
``__exit__`` running on the way out no matter how the block
ends. Async context managers are the same idea moved into
asyncio: ``__aenter__`` and ``__aexit__`` are
*coroutines*, so the setup or the cleanup can ``await``
something. The block that drives them is ``async with``.

We have already used one. :class:`asyncio.Lock` is an async
context manager; the :doc:`locks <../primitives/locks>`
page used it as ``async with bus_lock: ...``. This page is
about writing one for an application's own resource.

When to write one
-----------------

When the application has a resource that needs *paired*
setup and teardown, and at least one of those sides has to
``await`` something. Network connections, sensors that need
a settling delay after configuration, anything that locks
something on entry and unlocks it on exit. The plain
synchronous ``with`` form does not apply because its
``__enter__`` and ``__exit__`` cannot be coroutines.

The two methods
---------------

* ``async def __aenter__(self)`` runs when the block is
  entered. Whatever it returns is what the optional
  ``as name`` clause of ``async with`` binds to. Returning
  ``self`` is the most common shape, but any value works.
* ``async def __aexit__(self, exc_type, exc, tb)`` runs
  when the block is exited. ``exc_type`` is :data:`None`
  on a normal exit; on an exception (or a cancellation) it
  is the exception's class, and ``exc`` is the instance.
  Returning a truthy value tells Python the exception has
  been *handled* and should not propagate. Returning
  :data:`None` (the usual case) lets the exception
  continue up the call chain after the cleanup runs.

A worked example
----------------

A spotlight wrapper that turns an LED on for the body of
the block, with a short settling delay so the
illumination is stable before any captures happen, and
turns the LED off again on the way out::

    import asyncio
    from machine import LED


    class Spotlight:
        def __init__(self, led):
            self._led = led

        async def __aenter__(self):
            self._led.on()
            await asyncio.sleep_ms(50)
            return self

        async def __aexit__(self, exc_type, exc, tb):
            self._led.off()

    async def main():
        led = LED("LED_WHITE")

        async with Spotlight(led):
            # work that benefits from steady illumination
            await asyncio.sleep_ms(200)

    asyncio.run(main())

When the block is entered, ``__aenter__`` runs: the LED
goes on, the 50 ms settle ``await`` yields to the loop so
other coroutines can make progress in the meantime, and
the block body starts once the wait completes. When the
block ends -- on a normal exit, on an exception, or on
cancellation -- ``__aexit__`` runs and the LED goes back
off. The cleanup runs in every case; that is the guarantee
``async with`` provides.

The :doc:`frame capture page <../capstone/snapshot-loop>`
shows how to make :meth:`csi.CSI.snapshot` ``await``\
-friendly; once that wrapper is in hand, the body of an
``async with Spotlight(led):`` block would typically be a
capture loop running under the steady illumination.
