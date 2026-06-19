Loop control
============

Most asyncio scripts never touch the event loop directly --
:func:`asyncio.run` is enough. This page covers the
:class:`~asyncio.Loop` surface for the cases where it is
not: installing an exception handler, running the loop with
a different lifecycle than ``run``, or holding on to the
loop object for instrumentation.

Getting the loop
----------------

* :func:`asyncio.get_event_loop` -- returns the
  :class:`~asyncio.Loop` object. Safe to call from inside
  or outside a coroutine.
* :func:`asyncio.new_event_loop` -- on MicroPython, *resets
  the existing loop's state* rather than creating a new
  one. The note bears repeating: there is exactly one event
  loop per program.

There is no API for *running* the loop other than the
methods on :class:`~asyncio.Loop` and :func:`asyncio.run`.

Running the loop directly
-------------------------

:func:`asyncio.run` is the right entry point for almost
every application. Two :class:`~asyncio.Loop` methods exist
for the cases where it is not.

* :meth:`~asyncio.Loop.run_until_complete` -- given an
  awaitable, run the loop until that awaitable finishes,
  then return its result. Equivalent to a single
  :func:`asyncio.run` call, with the loop teardown left out.
* :meth:`~asyncio.Loop.run_forever` -- run the loop until
  :meth:`~asyncio.Loop.stop` is called from inside a task.
  No top-level awaitable; the application is expected to
  schedule whatever it needs via
  :func:`asyncio.create_task` before calling
  ``run_forever``.

The companion methods are
:meth:`~asyncio.Loop.stop` (request the loop to stop after
the current task finishes) and
:meth:`~asyncio.Loop.close` (free the loop's resources).

Loop-side task creation
-----------------------

* :meth:`~asyncio.Loop.create_task` -- same operation as
  :func:`asyncio.create_task`. The free function exists so
  application code does not need a loop reference for the
  common case; the method exists for instrumentation that
  already has one.

Exception handlers
------------------

The loop calls a handler when a task raises an exception
that nothing in the coroutine call chain has caught -- a
typical case being a task the application created with
:func:`asyncio.create_task` and never awaited. The default
handler prints a traceback through ``sys.stderr``; the
:doc:`exceptions <../coordination/exceptions>` page showed
how to swap it for something custom.

* :meth:`~asyncio.Loop.set_exception_handler` -- install a
  custom handler. The handler is a callable
  ``handler(loop, context)`` where ``context`` is a dict
  with at least ``'message'`` and usually ``'exception'``
  and ``'future'``.
* :meth:`~asyncio.Loop.get_exception_handler` -- return the
  currently installed handler, or ``None`` if the default
  is in use.
* :meth:`~asyncio.Loop.default_exception_handler` -- the
  built-in handler. Useful inside a custom handler that
  wants to *also* run the default behaviour (log to flash
  *and* print a traceback, for instance).
* :meth:`~asyncio.Loop.call_exception_handler` -- run the
  currently installed handler with a hand-built context
  dict. Mostly used by the loop itself; an application
  rarely needs it.
