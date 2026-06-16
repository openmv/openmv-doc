Exceptions
==========

Exceptions inside an asyncio script behave almost the same
as in regular Python -- they propagate up the call chain
until something catches them. *Almost* because tasks are
running in parallel, so the path "up" is not the path that
created the task. This page covers where exceptions go in
each of the common shapes.

Inside one coroutine
--------------------

A ``try``/``except`` inside a coroutine catches exceptions
raised by anything it ``await``\ s, in the usual way::

    async def fetch_with_retry(url):
        for attempt in range(3):
            try:
                return await fetch(url)
            except OSError as e:
                last_error = e
        raise last_error

Nothing asyncio-specific here -- the ``except`` clause sees
exceptions raised inside ``fetch`` as if it had been a
regular function call.

In a task the application is awaiting
-------------------------------------

When a coroutine running as a :class:`~asyncio.Task` raises,
the exception is stored on the task. The next time something
``await``\ s that task, the exception is re-raised at the
``await``::

    task = asyncio.create_task(may_fail())
    try:
        result = await task
    except OSError:
        log("may_fail failed")

The same applies to :func:`asyncio.gather`. The default
behaviour -- one child raises, others get cancelled, the
exception propagates out of the gather -- comes from this
mechanism.

In a task nobody awaits
-----------------------

A task that nobody ever ``await``\ s is the case that needs
attention. The exception still happens; the loop notices the
task finished with an unhandled exception; but there is no
``await`` for it to surface at. The default behaviour is to
print a traceback through ``sys.stderr`` and continue
running -- which is fine for an unattended diagnostic, but a
poor fit for an application that wanted to know.

The right fix is usually to *await the task*. Either
directly, by remembering the handle and awaiting it during
shutdown, or implicitly through :func:`~asyncio.gather` or
:func:`~asyncio.wait_for`. The
:doc:`timeouts-and-cancellation` page's "shutting an
application down" pattern catches this case for the
long-lived background tasks a typical script spawns.

Custom exception handler
------------------------

When silent traceback-and-continue is not enough, the loop
exposes a hook -- :meth:`Loop.set_exception_handler
<asyncio.Loop.set_exception_handler>` -- the application can
override to do something else::

    def handler(loop, context):
        print("asyncio:", context.get("message"))
        if "exception" in context:
            sys.print_exception(context["exception"])

    loop = asyncio.get_event_loop()
    loop.set_exception_handler(handler)

The ``context`` argument is a dict with keys
``'message'``, ``'exception'``, and ``'future'``. The
exception may be missing on certain warning-style events,
which is why the example uses ``.get()``.

Typical uses are to log the failure to flash, blink an error
LED, or escalate to a watchdog reboot. The
:doc:`loop control <../loop/loop-control>` page covers the
full surface of loop hooks.

KeyboardInterrupt
-----------------

When a script is stopped from the outside -- usually by the
IDE asking it to halt -- the request arrives inside the
script as a :exc:`KeyboardInterrupt`. Inside
:func:`asyncio.run` it propagates the way any other
unhandled exception would: ``main`` is cancelled, every task
the loop is tracking gets cancelled too, and the
:exc:`KeyboardInterrupt` is re-raised out of
:func:`asyncio.run`. ``finally`` clauses run on the way out,
so the same cleanup pattern from the cancellation page is
what handles it.
