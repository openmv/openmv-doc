Gather
======

The previous chapter showed how :func:`asyncio.create_task`
schedules a coroutine and *does not* wait for it. The
companion operation -- *run several awaitables concurrently
and wait for all of them* -- is :func:`asyncio.gather`.

The basic shape
---------------

::

    import asyncio

    async def fetch(name, delay_ms):
        await asyncio.sleep_ms(delay_ms)
        return name

    async def main():
        results = await asyncio.gather(
            fetch("a", 100),
            fetch("b", 200),
            fetch("c", 50),
        )
        print(results)

    asyncio.run(main())

Output::

    ['a', 'b', 'c']

Two things to notice. First, the result list is in the order
of the *arguments to gather*, not the order in which the
coroutines finished -- ``"c"`` returned first but is still
the third entry. Second, the call took ``200 ms`` total, not
``350 ms``: the three sleeps ran concurrently, and
:func:`~asyncio.gather` returns as soon as the slowest one
completes.

Both facts come from the same source. :func:`~asyncio.gather`
wraps each argument that isn't already a task (the
coroutines in the example), schedules them on the loop,
suspends the calling coroutine until *all* of them finish,
then returns their results in the original order.

When to reach for it
--------------------

Anywhere the application has *N* awaitable operations and
wants the results of all of them before continuing. Typical
examples:

* Issuing several network requests in parallel and waiting
  for all responses.
* Reading from several sensors concurrently before processing
  the combined result.
* Joining several short-lived helper tasks at the end of an
  application phase.

It is *not* the right tool for long-running background tasks
the application starts and leaves running for the lifetime
of the program -- those are still :func:`~asyncio.create_task`
work. :func:`~asyncio.gather` is for the *fan-out / fan-in*
pattern: split work, do it concurrently, rejoin.

Exceptions in the group
-----------------------

If any of the gathered awaitables raises, the default
behaviour is to *re-raise the exception out of the gather
call*. The siblings that have not finished yet are cancelled
in the background.

That is usually what an application wants -- one of *N*
parallel jobs failed, so the combined operation has failed,
so stop spending time on the rest. Sometimes the application
wants the opposite: let each awaitable finish (or fail)
independently, and inspect the results afterwards. Pass
``return_exceptions=True`` for that::

    results = await asyncio.gather(
        fetch_or_fail("ok"),
        fetch_or_fail("bad"),
        return_exceptions=True,
    )
    # results == ["ok-value", OSError(...)]

Each entry in the returned list is now either a normal
return value *or* the exception the corresponding awaitable
raised. The caller checks ``isinstance(r, Exception)`` to
tell them apart.

Cancellation
------------

Cancelling the gather itself -- by cancelling whatever task
was awaiting it -- cancels every awaitable still running
inside it. The :doc:`timeouts and cancellation
<timeouts-and-cancellation>` page covers how cancellation
propagates through the call chain in detail.
