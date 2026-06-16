Timeouts and cancellation
=========================

Cancellation is asyncio's name for "stop running this
coroutine, raise an exception inside it so it has a chance
to clean up, and remove it from the scheduler". Timeouts are
the most common reason to cancel something; manual
``task.cancel()`` is the other.

Cancelling a task
-----------------

Calling :meth:`Task.cancel <asyncio.Task.cancel>` schedules
:exc:`asyncio.CancelledError` to be raised inside the
running coroutine at its next ``await``. The coroutine is
free to ignore the cancellation (catch the exception and
keep running) or to honour it -- the usual choice is to
honour it after running cleanup code::

    async def network_worker(stream):
        try:
            while True:
                data = await stream.read(64)
                # ...
        finally:
            stream.close()

A bare ``finally`` clause is the cleanest pattern: the
cleanup runs whether the coroutine exited normally, raised
an unrelated exception, or was cancelled. The
:exc:`~asyncio.CancelledError` propagates back up through
the ``finally``, the loop sees the task is done, and the
caller of ``await task`` sees the cancellation.

Catching :exc:`~asyncio.CancelledError` explicitly is also
fine when the application wants to do something specific
with it -- log it, hand the resource off cleanly, etc. The
rule is: *re-raise it after the cleanup runs*. Swallowing
:exc:`~asyncio.CancelledError` keeps the coroutine alive
when its caller has asked it to stop, which is almost
always a bug::

    async def worker():
        try:
            await long_running_thing()
        except asyncio.CancelledError:
            log("worker cancelled, cleaning up")
            close_resources()
            raise          # << this line is the important one

Timeouts with ``wait_for``
--------------------------

:func:`asyncio.wait_for` wraps an awaitable in a deadline.
If the awaitable finishes within the timeout, its result is
returned. If it does not, the awaitable is cancelled and the
caller gets :exc:`asyncio.TimeoutError`::

    try:
        frame = await asyncio.wait_for(grab_frame(), timeout=2)
    except asyncio.TimeoutError:
        print("camera took too long")

The seconds argument accepts a float. For millisecond-shaped
deadlines :func:`asyncio.wait_for_ms` takes an integer
millisecond count -- a MicroPython extension that lines up
with the firmware's millisecond-grained timing knobs.

Internally, ``wait_for`` does exactly what manual
cancellation would do: when the deadline expires it calls
:meth:`~asyncio.Task.cancel` on the wrapped task,
:exc:`~asyncio.CancelledError` is raised inside the
coroutine, ``finally`` clauses run, and once the cleanup is
done the exception is translated into a
:exc:`~asyncio.TimeoutError` for the caller.

That means a coroutine that catches and ignores
:exc:`~asyncio.CancelledError` will *defeat* the timeout --
the deadline expired, but the coroutine refused to stop, and
``wait_for`` cannot force it. The earlier rule applies here
too: catch :exc:`~asyncio.CancelledError` only to run
cleanup, then re-raise.

Cancellation through gather
---------------------------

Cancellation propagates downward through
:func:`~asyncio.gather`. If the task that is awaiting a
gather call is cancelled, every awaitable still running
inside the gather is cancelled too -- each one gets a chance
to clean up through its own ``finally`` clauses before the
cancellation rolls up to the caller.

Combined with timeouts, this is the standard way to put a
deadline on a *group* of operations::

    await asyncio.wait_for(
        asyncio.gather(a(), b(), c()),
        timeout=5,
    )

Either every sub-operation finishes within five seconds, or
all of them get cancelled together.

Shutting an application down
----------------------------

Cancellation is also how a real application stops cleanly.
The pattern is consistent across scripts: ``main`` captures
the handles for the long-lived background tasks it started,
runs its top-level work, then cancels each handle and
awaits it in a ``finally`` block::

    async def main():
        sender = asyncio.create_task(uplink())
        watcher = asyncio.create_task(button_watcher())
        try:
            await snapshot_loop()
        finally:
            sender.cancel()
            watcher.cancel()
            await asyncio.gather(sender, watcher,
                                 return_exceptions=True)

The ``return_exceptions=True`` is the trick that keeps the
gather from re-raising the :exc:`~asyncio.CancelledError`
each child task is about to deliver, so the application's
own exit reason -- whatever ``snapshot_loop`` did or did not
raise -- is what bubbles out of ``main``.
