Coroutines
==========

A *coroutine* is a function that can pause partway through and
later resume from where it left off, with all its local
variables intact. It mirrors the generator pattern -- a function
body that can be suspended and resumed -- with one change in who
drives each resume.

Python's syntax for writing a coroutine is the ``async`` /
``await`` keyword pair. ``async`` marks the function as a
coroutine; ``await`` marks the points inside it where pausing
is allowed.

Defining a coroutine
--------------------

A function defined with ``async def`` is a *coroutine function*.
Calling it does not run the body; it returns a *coroutine
object* that has not started yet:

::

    async def greet(name):
        print("hello,", name)

    coro = greet("Alice")        # body NOT run yet

The coroutine object is paused at the very beginning of the
function. Something has to *drive* it to make the body run --
that something is an event loop, a runtime component.
MicroPython ships one in the :mod:`asyncio` module. For now,
treat the coroutine as "ready to run, waiting for a driver".

Pausing inside a coroutine
--------------------------

Inside a coroutine, an ``await`` expression suspends execution
until the awaited value is ready:

::

    async def fetch_and_log():
        data = await read_sensor()
        print("got:", data)

When the body reaches ``await read_sensor()``, the coroutine
hands control back to whatever is running it. When
``read_sensor()`` finishes, the driver resumes the coroutine on
the next line, with the result bound to ``data``.

``await`` is only valid inside a coroutine. Using it in a
regular function is a syntax error.

Relationship to generators
--------------------------

Coroutines and generators share the same underlying mechanic.
The split is who pulls each resume:

* A generator yields *values*; the consumer pulls the next one
  with :func:`next` or by iterating.
* A coroutine yields *control*; an event loop schedules the
  resume when the awaited operation is ready.

If the generator-yield handshake makes sense, the coroutine
handshake is the same idea -- just driven by an event loop
instead of a ``for`` loop.

An *event loop* is a small dispatcher that keeps a list of
coroutines waiting on something (a timer, a network event,
another coroutine finishing). Each iteration it picks a
coroutine whose wait has been satisfied, resumes it until the
next ``await``, then records what that coroutine is now
waiting for and moves on to another ready one. The result is
many tasks making progress concurrently on a single thread --
each coroutine voluntarily yields control at its ``await``
points, and the loop fills those moments with whatever other
coroutines are ready to make progress.

Under the hood, ``await`` and ``yield`` use the same Python
runtime feature for suspending and resuming a function. The
keywords differ because the convention around them does:
``yield`` hands a value back to a consumer pulling with
:func:`next`; ``await`` hands control to an event loop that
schedules the resume when the awaited operation is ready.
``async`` / ``await`` is essentially newer syntax for the
coroutine pattern -- older libraries built coroutines on top
of the generator machinery directly, using ``yield from``
(introduced on :doc:`iterators-and-generators`) to delegate
suspension between coroutines.

Coroutines need a driver
------------------------

A coroutine is inert without a runtime to drive it. Defining
one is fine; running one needs an event loop. MicroPython's
:mod:`asyncio` module provides that event loop. The
:doc:`Asyncio </openmvcam/tutorial/asyncio/index>` section
covers how to start the loop, schedule coroutines on it, share
state between them with locks and events, handle cancellation
and timeouts, and shape a real application around the
``async`` / ``await`` keywords introduced here.
