Cooperative concurrency
=======================

Asyncio's scheduling model is *cooperative*, not
*preemptive*. The distinction is the single most important
mental model the rest of this section builds on, so it is
worth pinning down before any code appears.

Preemptive vs cooperative
-------------------------

A *preemptive* scheduler -- the kind a desktop operating
system uses to keep many programs running at once -- can
pause whichever piece of code is currently running at *any*
moment and switch to another. The running code does not
have to do anything special; the scheduler interrupts it.
That makes preemptive scheduling very flexible (no one
piece of code can starve the others by being slow), but it
also means any shared variable has to be defended carefully,
because the switch could land anywhere -- even halfway
through writing a value, or partway through reading a list.

A *cooperative* scheduler can only switch between pieces of
code at points the currently running piece *explicitly
hands control back*. On asyncio, those points are every
``await`` and every call to a coroutine that yields
internally (most commonly :func:`asyncio.sleep`). Between
two awaits, the running coroutine has the CPU to itself.

Two consequences fall out of that:

* **A coroutine that never awaits never gets paused.** If a
  coroutine sits in a tight loop with no ``await`` inside,
  it monopolises the scheduler and nothing else makes
  progress. The fix is to ``await asyncio.sleep_ms(0)`` (or
  some other waiting call) at a sensible point in the loop.
* **Shared state is safe between awaits.** Two coroutines
  cannot interleave halfway through an operation that has
  no ``await`` in it. The kind of corruption that arises
  when preemption lands in the middle of a multi-step
  update -- one piece of code reading a value while another
  is partway through changing it -- simply cannot happen
  here. Coordination between coroutines is still needed
  when several of them have to share a resource *across*
  awaits, but the in-the-middle-of-a-line interleaving
  problem does not apply.

The three layers
----------------

Every asyncio script is built from the same three layers.
The next two pages cover them in detail; these are the
labels to keep in mind while reading them.

* **Coroutines** -- functions declared with ``async def``,
  each one a self-contained unit of work that awaits where
  appropriate. The Python Overview introduced the
  ``async``/``await`` keywords; in asyncio they are how a
  coroutine yields back to the scheduler.
* **Tasks** -- a wrapper :func:`asyncio.create_task` puts
  around a coroutine to *schedule it concurrently with the
  current one*. The application typically creates a handful
  of tasks for the long-running jobs (the snapshot loop, the
  network client, the UART reader, ...).
* **The event loop** -- the engine underneath that keeps
  track of which coroutines are waiting and which are ready
  to run, switching between tasks at every ``await``. The
  application doesn't write the loop; it hands a top-level
  coroutine to :func:`asyncio.run` and the loop drives
  everything from there.

When the application is described that way -- as a small set
of coroutines composed by an event loop -- *concurrency
becomes a property of the shape of the program*, not
something the application has to manage step by step.
