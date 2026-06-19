Async iterators
===============

An *async iterator* is the asyncio version of an iterator.
The :doc:`Python Overview
<../../python/iteration/iterators-and-generators>`
introduced the synchronous iterator protocol --
``__iter__`` and ``__next__`` -- and the ``for`` loop that
drives it. Async iterators add an ``await`` to each step,
so the iterator can *wait* between values without blocking
the event loop.

The protocol
------------

A class is an async iterator when it implements

* ``__aiter__(self)`` -- returns the iterator object,
  usually ``self``.
* ``async def __anext__(self)`` -- returns the next value,
  or raises :exc:`StopAsyncIteration` when there are no
  more.

The corresponding loop construct is ``async for``::

    import asyncio


    class FrameCounter:
        """Yield N integers, one per frame period."""

        def __init__(self, n, period_ms):
            self._n = n
            self._period_ms = period_ms
            self._i = 0

        def __aiter__(self):
            return self

        async def __anext__(self):
            if self._i >= self._n:
                raise StopAsyncIteration
            await asyncio.sleep_ms(self._period_ms)
            self._i += 1
            return self._i

    async def main():
        async for n in FrameCounter(5, 200):
            print(n)

The ``async for`` loop awaits each call to ``__anext__``,
so the coroutine running the loop yields to the event loop
between values just like any other ``await``.

When to reach for it
--------------------

Whenever the application has a source of data that arrives
*over time* and the consumer should iterate it lazily. A
sensor that produces a sample per period, a network socket
that delivers messages, a frame generator -- anywhere the
shape ``while True: x = await source.next(); process(x)``
fits, ``async for x in source`` is the cleaner spelling.

For sources that emit until a finite end condition, the
iterator raises :exc:`StopAsyncIteration` and ``async for``
exits normally. For sources that never end -- a continuous
sensor stream, a long-running subscription -- the loop runs
until the coroutine it lives in is cancelled or its task is
torn down.
