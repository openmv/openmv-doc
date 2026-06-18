Wrap up
=======

You have walked through asyncio's API -- the pieces a
script needs to run several jobs concurrently on a single
CPU:

* **Cooperative scheduling** -- the model the rest of the
  module rests on. The running coroutine has the loop to
  itself until it ``await``\ s; switches happen only at
  those awaits.

* **Coroutines and tasks** -- ``async def`` defines a unit
  of work; :func:`asyncio.create_task` schedules one
  concurrently and returns a :class:`~asyncio.Task` the
  application can later wait on, cancel, or identify.

* **The event loop** -- the engine that runs coroutines and
  tasks. :func:`asyncio.run` is the only entry point most
  scripts need; the :class:`~asyncio.Loop` class exposes the
  rest for the rare cases that need it.

* **Coordination** -- :func:`~asyncio.gather` for fan-out
  and fan-in, :func:`~asyncio.wait_for` for deadlines,
  :meth:`Task.cancel <asyncio.Task.cancel>` and the
  ``finally``-clause cleanup pattern, exception propagation
  through tasks and gather calls, and the loop's exception
  handler hook.

* **Synchronisation primitives** -- :class:`~asyncio.Event`
  for signalling between coroutines, :class:`~asyncio.Lock`
  for serialising access to a shared resource across awaits,
  and :class:`~asyncio.ThreadSafeFlag` for waking an
  asyncio task from an interrupt handler.

* **Custom async objects** -- the language hooks that let
  application classes plug into asyncio idioms.
  ``__await__`` for objects that are themselves the target
  of ``await``, ``__aiter__`` / ``__anext__`` for
  ``async for``, and ``__aenter__`` / ``__aexit__`` for
  ``async with``.

* **Frame capture** -- the wrapper that turns
  :meth:`csi.CSI.snapshot` into an ``await``-friendly
  coroutine, so a capture loop runs alongside other
  asyncio work.

* **Pitfalls** -- forgotten ``await``\ s, tight loops
  without yields, swallowed cancellations, shared state
  mutated across awaits, and the rest of the asyncio-
  specific traps.

That is enough to write programs that mix camera work,
hardware I/O, and concurrent background work on the same
loop.

Using this reference later
--------------------------

Treat the asyncio chapters as reference material; coming
back for the shape of ``async with`` or the exact behaviour
of :func:`~asyncio.gather` on a sibling failure is the
intended use. The :mod:`asyncio` reference page lists every
function and class in one place when the question is just
"what is the exact name of this call".

For richer primitives built on top of the module --
semaphores, queues, barriers, and a substantial collection
of application-shaped helpers -- the
`peterhinch/micropython-async
<https://github.com/peterhinch/micropython-async>`_
repository is the standard community-maintained source.

Where to go from here
---------------------

**Networking** is the next major topic.
:func:`asyncio.open_connection`,
:func:`asyncio.start_server`, and the
:class:`~asyncio.Stream` class are how an asyncio script
talks to the rest of the network from inside a coroutine,
together with the :mod:`network` and :mod:`socket` modules
underneath. Everything you have learned about ``await``,
:class:`~asyncio.Task`, cancellation, and the
synchronisation primitives carries straight forward.
