async and await
===============

Python has two keywords for writing functions that can pause
and resume: ``async`` and ``await``. They mirror the generator
pattern from the previous page -- a function whose body can be
suspended and resumed, with local state preserved across the
pause -- with one change in who drives the resumes.

async def
---------

A function defined with ``async def`` is a *coroutine function*.
Calling it does not run the body; it returns a *coroutine
object* that has not started yet:

::

    async def greet(name):
        print("hello,", name)

    coro = greet("Alice")        # body NOT run yet

The coroutine object is paused at the very beginning of the
function. Something has to *drive* it to make the body run --
that something is an event loop, a runtime component covered by
its own future super-section. For now, treat the body as "ready
to run, waiting for a driver".

await
-----

Inside an ``async def`` body, the ``await`` keyword suspends
the coroutine until the awaited value is ready:

::

    async def fetch_and_log():
        data = await read_sensor()
        print("got:", data)

When the body reaches ``await read_sensor()``, the coroutine
hands control back to whatever is running it. When
``read_sensor()`` finishes, the driver resumes the coroutine on
the next line, with the result bound to ``data``.

``await`` is only valid inside an ``async def`` body. Using it
in a regular function is a syntax error.

Relationship to generators
--------------------------

Coroutines and generators share the same underlying mechanic.
The split is who pulls each resume:

* A generator yields *values*; the consumer pulls the next one
  with :func:`next` or by iterating.
* A coroutine yields *control*; an event loop schedules the
  resume when the awaited operation is ready.

If the generator-yield handshake from the previous page makes
sense, the ``await`` handshake is the same idea -- just driven
by an event loop instead of a ``for`` loop.

By themselves
-------------

``async`` and ``await`` are inert without a runtime to drive
them. Defining a coroutine is fine; running one needs an event
loop. MicroPython's :mod:`asyncio` module provides that event
loop, and a future super-section covers it in detail. Until
then, treat these two keywords as syntax you can read in other
people's code and understand the shape of -- without yet
needing to write your own concurrent scripts.
