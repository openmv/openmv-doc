The event loop
==============

The event loop is the engine asyncio runs underneath. It
keeps a list of every task in the program, asks each one to
run until that task's next ``await``, and moves on to the
next ready task. When there are no ready tasks it waits --
the actual wait is what makes the CPU available for
firmware to run other things and for power-saving sleeps to
kick in -- until something a task was awaiting becomes
available, then resumes that task. Repeat forever.

Most applications never interact with the loop directly. The
loop is a consequence of calling :func:`asyncio.run`; the
application writes coroutines, schedules them as tasks, and
the loop does the rest.

What :func:`asyncio.run` actually does
--------------------------------------

A single call::

    asyncio.run(main())

is shorthand for a longer sequence the loop manages on the
application's behalf:

1. Create the event loop if it does not already exist.
2. Wrap the supplied coroutine in a task and schedule it as
   the loop's top-level entry point.
3. Run the loop -- step through ready tasks, wait when none
   are ready, resume tasks when their awaits complete --
   until the top-level task returns or raises.
4. Cancel any tasks the application created that are still
   running.
5. Return whatever the top-level coroutine returned (or
   re-raise whatever it raised).

Single loop per program
-----------------------

MicroPython's asyncio has *one* event loop, full stop. There
is no creating a fresh loop, and there is no nesting one
loop inside another. Calling :func:`asyncio.run` from inside
a coroutine that is already running on the loop is an error;
the loop is already there, and the coroutine just needs to
await whatever it wanted to start.

In practice the rule is the same as the closing line of the
previous page: there is exactly one :func:`asyncio.run` call
per program, at the top, with a single ``async def main()``
behind it. Everything else lives inside ``main``.

Direct loop access
------------------

For the rare cases an application needs to touch the loop
itself -- mostly diagnostics and exception handlers --
:func:`asyncio.get_event_loop` returns the
:class:`~asyncio.Loop` object. From there the application
can install a custom exception handler, inspect what the
loop is doing, or (very occasionally) call
:meth:`~asyncio.Loop.create_task` directly instead of
:func:`asyncio.create_task` (they are the same operation).

The full set of methods :class:`~asyncio.Loop` exposes --
:meth:`~asyncio.Loop.run_forever`,
:meth:`~asyncio.Loop.stop`,
:meth:`~asyncio.Loop.set_exception_handler`, and the rest --
is covered in the :doc:`loop control
<../loop/loop-control>` page later in this section. Until
then, ``asyncio.run(main())`` is all an application needs.
