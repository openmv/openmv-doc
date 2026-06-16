Pitfalls
========

The same patterns that make asyncio nice -- no preemption,
explicit ``await``\ s -- give it its own set of shapes that
bite. This page is the catalogue of the ones that come up
often enough to be worth knowing about.

Forgetting to ``await``
-----------------------

Calling an ``async def`` function returns a *coroutine
object*. It does not run the body of the function. To
actually execute it, the coroutine has to be ``await``\ ed
or wrapped in a task::

    async def main():
        send_request()              # bug: returns the coroutine, does nothing
        await send_request()        # right: run it to completion
        asyncio.create_task(send_request())  # right: run it concurrently

The bug is silent -- the coroutine object is created,
discarded, and never executed. The application proceeds as
if everything worked. MicroPython will sometimes log a
warning that a coroutine was *never awaited*; sometimes it
will not. Audit for missing ``await``\ s at every call site
that looks like a function call.

Tight loops without ``await``
-----------------------------

A coroutine that runs in a loop and never ``await``\ s
monopolises the event loop. No other task makes progress
until the loop exits or yields::

    async def counter():
        n = 0
        while True:
            n += 1               # bug: starves the loop

The fix is a yield inside the loop -- usually
``await asyncio.sleep_ms(0)`` -- so other ready tasks get a
chance to run. Computation-heavy work belongs inside that
shape too: an image-processing loop that runs for hundreds
of milliseconds per iteration should yield at least once
per iteration so the rest of the program does not stall.

Swallowing ``CancelledError``
-----------------------------

The :doc:`cancellation page
<coordination/timeouts-and-cancellation>` already covered
this in detail. Repeating it here because it is the most
common cause of "my application will not shut down": a
coroutine catches :exc:`asyncio.CancelledError` for cleanup
purposes and forgets to re-raise it. The task continues to
run; the caller that asked for the cancellation hangs
forever waiting for it to finish. Always re-raise after
cleanup, or use a ``try``/``finally`` block instead of an
explicit ``except``.

Mutating shared state across awaits
-----------------------------------

Cooperative scheduling guarantees that a coroutine has the
CPU to itself *between* awaits, but as soon as it
``await``\ s, another coroutine can run. If two coroutines
modify the same data structure in steps that include
``await``, their operations can interleave in ways that
corrupt the structure::

    # bug: two tasks running do_work simultaneously can
    # interleave around the await and corrupt items
    async def do_work():
        n = len(items)
        await asyncio.sleep_ms(0)
        items.append(some_work(n))

For state that is *only* mutated between awaits inside one
coroutine, no synchronisation is needed. For state mutated
across awaits and accessed from more than one coroutine,
wrap the critical section in an :class:`~asyncio.Lock`.

Module-level ``await``
----------------------

``await`` is only valid inside an ``async def`` body.
Writing it at module level -- outside any coroutine -- is a
syntax error::

    # bug: not inside an async def
    result = await fetch()

The fix is to put the work in a coroutine and call it from
the program's :func:`asyncio.run` entry point.

Multiple ``asyncio.run`` calls
------------------------------

MicroPython has *one* event loop. Calling
:func:`asyncio.run` twice in a row -- once for setup, once
for the main work -- still uses the same loop. Calling it
*from inside* a running coroutine is an error: the loop is
already running. Both cases come up most often when a
script grows organically and the author tries to extend it
by adding more :func:`~asyncio.run` calls instead of
folding the new work into the existing ``main``.

Use of :class:`~asyncio.Event` from an interrupt
------------------------------------------------

:meth:`asyncio.Event.set` is only safe to call from inside
the event loop. Calling it from a GPIO interrupt handler is
a corruption hazard. For waking a task from an interrupt,
use :class:`~asyncio.ThreadSafeFlag` instead -- the
:doc:`page on it <primitives/threadsafe-flag>` covers the
shape.

Long synchronous calls
----------------------

A coroutine can await asyncio's own waiting primitives;
anything else it calls runs synchronously and blocks the
loop until it returns. A 200 ms blocking
:func:`time.sleep`, an SD-card write that takes 80 ms to
flush, a large JPEG compression, a :meth:`csi.CSI.snapshot`
call -- each of those holds the event loop for its full
duration. The fix depends on the call:

* For ``time.sleep``: replace it with ``await
  asyncio.sleep`` or ``await asyncio.sleep_ms``.
* For ``csi.CSI.snapshot``: use the
  :doc:`async snapshot wrapper <capstone/snapshot-loop>`
  the capture page builds.
* For long compute (image processing, JPEG encode):
  accept the cost or break the work into chunks that
  ``await`` between iterations.

Asyncio cannot make a synchronous call non-blocking. It can
only let other coroutines run *while* something else is
awaiting.
