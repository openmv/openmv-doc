Events
======

:class:`asyncio.Event` is the simplest signalling primitive
the module provides. One coroutine *sets* an event when
something has happened; any number of other coroutines
*wait* for the event to be set before continuing. There is
no payload -- an event is a boolean that flips on and stays
on until something clears it.

The basic shape
---------------

::

    import asyncio

    async def waiter(evt):
        print("waiting")
        await evt.wait()
        print("got signal")

    async def main():
        evt = asyncio.Event()
        asyncio.create_task(waiter(evt))
        await asyncio.sleep(1)
        evt.set()
        await asyncio.sleep(0)

    asyncio.run(main())

The waiter task runs, hits ``await evt.wait()``, and is
suspended -- the event starts in the cleared state, so the
``wait`` call yields back to the loop. A second later
``main`` calls ``evt.set()`` and the waiter is scheduled to
resume. The trailing ``await asyncio.sleep(0)`` is just a
yield so the loop gets a chance to run the waiter before
``main`` returns.

The four methods
----------------

* :meth:`~asyncio.Event.set` -- flip the event to set, and
  schedule every coroutine currently blocked on
  :meth:`~asyncio.Event.wait` to resume. The event stays
  set until cleared.
* :meth:`~asyncio.Event.clear` -- flip the event back to
  cleared. Coroutines that ``await wait()`` afterwards will
  block again.
* :meth:`~asyncio.Event.wait` -- a coroutine. If the event
  is already set, returns immediately. Otherwise blocks
  until something sets it.
* :meth:`~asyncio.Event.is_set` -- returns the current
  state without blocking. Useful when a coroutine wants to
  *check* the event without waiting on it.

Multiple waiters
----------------

Several coroutines can ``await`` the same event. When
something calls ``set()`` they are *all* scheduled to
resume. The event is one-to-many by default; there is no
need for several events to fan out to several waiters.

Reusing an event
----------------

A common pattern is to use an event repeatedly -- a coroutine
that runs once per signal -- by clearing it after each pass::

    async def worker(go):
        while True:
            await go.wait()
            do_one_unit_of_work()
            go.clear()

The producer sets the event whenever there is work; the
worker clears it once it has picked up the signal. If the
producer might set the event again before the worker has
woken up, the worker may want to handle that case
(``while go.is_set(): ...``) before clearing.

Safe contexts
-------------

:class:`~asyncio.Event` is *not* safe to call ``set()`` on
from inside an interrupt handler. The mechanism it uses to
schedule waiters assumes it is running inside the event
loop's own context, which interrupts are not. For waking an
asyncio task from an interrupt handler,
:class:`~asyncio.ThreadSafeFlag` (covered shortly) is the
right primitive.
