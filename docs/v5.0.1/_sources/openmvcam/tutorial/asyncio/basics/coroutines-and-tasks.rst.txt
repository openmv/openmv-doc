Coroutines and tasks
====================

Coroutines are the unit of work an asyncio program is built
from; tasks are how an application runs several coroutines
concurrently.

Coroutines
----------

A *coroutine* is a function declared with ``async def``::

    import asyncio

    async def heartbeat(interval_ms):
        while True:
            print("tick")
            await asyncio.sleep_ms(interval_ms)

The body looks like an ordinary function, with one extra
ingredient: ``await``. Wherever the coroutine has to wait
for something -- a sleep, a network read, an event being set
-- it ``await``\ s an expression that knows how to suspend
the coroutine until the thing it is waiting for is ready.
At each ``await`` the coroutine hands control back to
asyncio; asyncio resumes it from the same point once the
awaited operation has completed.

The asyncio module ships two sleeps:

* :func:`asyncio.sleep` -- argument in seconds, accepts a
  float.
* :func:`asyncio.sleep_ms` -- argument in milliseconds, takes
  an int. A MicroPython extension; usually the right choice
  on the camera because timing knobs in firmware are
  millisecond-shaped.

A bare ``async def`` does *nothing* on its own. Calling
``heartbeat(500)`` does not execute the body; it returns a
coroutine *object* that asyncio has to schedule. The
simplest way to schedule one is :func:`asyncio.run`::

    asyncio.run(heartbeat(500))

:func:`asyncio.run` starts the event loop, schedules the
coroutine it was handed as the top-level entry point, drives
the loop until that coroutine returns, then tears the loop
down. For a single coroutine that's the whole program. For
several coroutines the application reaches for tasks.

Tasks
-----

A *task* is asyncio's wrapper around a coroutine that says
*schedule this concurrently with the current one and let me
keep going*. :func:`asyncio.create_task` makes one and
*returns* a :class:`~asyncio.Task` object representing the
scheduled work::

    task = asyncio.create_task(heartbeat("fast", 100))

The coroutine is now on the loop's schedule; the caller has
not waited for it. The returned :class:`~asyncio.Task` is
the handle the caller uses afterwards to interact with that
running work.

Once the application has the handle it can do three things
with it:

* **Wait for the task to finish.** A :class:`~asyncio.Task`
  is itself awaitable. ``result = await task`` suspends the
  current coroutine until ``task``'s coroutine returns, then
  resumes with whatever that coroutine returned (or
  re-raises whatever it raised).
* **Cancel the task.** ``task.cancel()`` schedules
  :exc:`asyncio.CancelledError` to be raised inside the
  task's coroutine at its next ``await``, giving it a chance
  to run cleanup code in a ``finally`` block. The page on
  :doc:`timeouts and cancellation
  <../coordination/timeouts-and-cancellation>` covers the
  details.
* **Identify it later.** :func:`asyncio.current_task` returns
  the :class:`~asyncio.Task` for the coroutine that is
  currently running. Most scripts never call it; it shows
  up in instrumentation and in exception handlers.

The script does not have to capture the handle every time.
Throwaway background tasks the application starts and
leaves running can drop the return value -- the loop still
schedules them::

    import asyncio

    async def heartbeat(name, interval_ms):
        while True:
            print(name)
            await asyncio.sleep_ms(interval_ms)

    async def main():
        asyncio.create_task(heartbeat("fast", 100))
        asyncio.create_task(heartbeat("slow", 500))
        await asyncio.sleep(5)

    asyncio.run(main())

The two ``create_task`` calls schedule both heartbeats
without waiting for either of them. Control returns
immediately to ``main``, which then ``await``\ s a five-second
sleep. While it sleeps the two heartbeat tasks make
progress; the loop cycles through whichever task is ready
to run. After five seconds ``main`` returns, the loop tears
down whatever tasks are still alive, and :func:`asyncio.run`
returns to the caller.

Capture the handle whenever the application actually needs
one of the three operations above. In practice that means
*almost always*, because cleanly shutting an application
down means cancelling the background tasks it spawned --
the cancellation page covers the pattern.

The two-line rule
-----------------

The minimal asyncio program is *the two lines* the examples
above end with::

    async def main():
        ...

    asyncio.run(main())

Everything else -- the tasks the application creates, the
primitives it coordinates them with, the streams it opens
-- happens *inside* ``main`` (and inside the coroutines
``main`` spawns). When a script outgrows the camera's
classic ``while True: csi0.snapshot()`` loop, the answer is
not to call :func:`asyncio.run` in several places; it is to
fold the new work into ``main`` as more tasks.
