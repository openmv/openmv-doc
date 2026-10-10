Asyncio
=======

So far every script in the tutorial has been *sequential* --
one line runs at a time, and a call that has to wait (a
sensor read, a network round-trip, a snapshot) blocks the
script until it finishes. That works while there is only one
thing to do. The moment an application needs to do several
things at once -- run a snapshot loop *and* answer a serial
command, *and* upload frames over the network -- a sequential
script breaks down. The first slow call stops everything
else from making progress.

The :mod:`asyncio` module is MicroPython's answer. It lets
the application describe several jobs as separate
*coroutines* and runs them concurrently on a single thread,
*cooperatively* -- whichever coroutine is currently running
yields control back to the scheduler whenever it has to
wait. A snapshot loop, a UART reader, and a network client
can all live in the same script and the slow parts of one no
longer freeze the others.

The pages ahead cover the ``async``/``await`` keywords and
the :class:`~asyncio.Task` lifecycle, coordination through
:func:`~asyncio.gather` and :func:`~asyncio.wait_for`,
cancellation and exception propagation, the three built-in
synchronisation primitives (:class:`~asyncio.Event`,
:class:`~asyncio.Lock`, :class:`~asyncio.ThreadSafeFlag`),
the language hooks for plugging application classes into
asyncio idioms, a small :class:`~csi.CSI` wrapper that lets
:meth:`~csi.CSI.snapshot` run as a coroutine, and the common
pitfalls that come with cooperative scheduling.

.. toctree::
   :caption: Concepts
   :maxdepth: 1

   basics/cooperative-concurrency.rst
   basics/coroutines-and-tasks.rst
   basics/the-event-loop.rst

.. toctree::
   :caption: Coordination
   :maxdepth: 1

   coordination/gather.rst
   coordination/timeouts-and-cancellation.rst
   coordination/exceptions.rst

.. toctree::
   :caption: Synchronisation primitives
   :maxdepth: 1

   primitives/events.rst
   primitives/locks.rst
   primitives/threadsafe-flag.rst

.. toctree::
   :caption: Custom async objects
   :maxdepth: 1

   custom/awaitable-classes.rst
   custom/async-iterators.rst
   custom/async-context-managers.rst

.. toctree::
   :caption: Loop control
   :maxdepth: 1

   loop/loop-control.rst

.. toctree::
   :caption: Frame capture
   :maxdepth: 1

   capstone/snapshot-loop.rst

.. toctree::
   :caption: Pitfalls
   :maxdepth: 1

   pitfalls.rst

.. toctree::
   :caption: Wrap up
   :maxdepth: 1

   wrap-up.rst
