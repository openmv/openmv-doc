ThreadSafeFlag
==============

:class:`asyncio.ThreadSafeFlag` is the signalling primitive
asyncio provides for the case :class:`~asyncio.Event` does
*not* support: *an interrupt handler needs to wake an
asyncio task up*. The interrupt fires outside the event
loop's normal scheduling, so the bookkeeping
:meth:`asyncio.Event.set` does cannot be done safely from
inside it.

Why a separate primitive
------------------------

:meth:`asyncio.Event.set` runs the bookkeeping that wakes
waiting coroutines under the assumption that *it is being
called from inside a task the loop is currently running*. An
interrupt handler does not satisfy that assumption -- it can
fire between any two instructions and corrupt whatever the
loop was halfway through doing.

:meth:`asyncio.ThreadSafeFlag.set` is written to be safe in
those contexts. The trade-off for that safety is a smaller
feature set than :class:`~asyncio.Event`: a
:class:`~asyncio.ThreadSafeFlag` can only be waited on by
*one* task at a time, and the flag auto-resets when the
waiting task wakes up.

The basic shape
---------------

A typical use is a GPIO interrupt handing off a button-press
event to an asyncio task::

    import asyncio
    from machine import Pin

    flag = asyncio.ThreadSafeFlag()

    def on_press(pin):
        flag.set()

    async def watcher():
        button = Pin("P1", Pin.IN, Pin.PULL_UP)
        button.irq(handler=on_press, trigger=Pin.IRQ_FALLING)
        while True:
            await flag.wait()
            print("button pressed")

    asyncio.run(watcher())

``on_press`` runs in interrupt context whenever the GPIO
fires; all it does is call ``flag.set()``. The asyncio task
``watcher`` ``await``\ s ``flag.wait()`` in a loop; each time
the flag is set, the task resumes, runs whatever work the
button press requires, then loops back to wait again.

The three methods
-----------------

* :meth:`~asyncio.ThreadSafeFlag.set` -- mark the flag as
  set. If a task is currently waiting in
  :meth:`~asyncio.ThreadSafeFlag.wait`, schedule it to
  resume. Safe to call from an interrupt handler.
* :meth:`~asyncio.ThreadSafeFlag.wait` -- a coroutine.
  Block until the flag is set, then return. The flag is
  *automatically cleared* on return -- the next call to
  ``wait`` will block again until the next
  :meth:`~asyncio.ThreadSafeFlag.set`.
* :meth:`~asyncio.ThreadSafeFlag.clear` -- explicitly clear
  the flag without waiting on it. Useful before a first
  ``wait`` to discard any spurious early
  :meth:`~asyncio.ThreadSafeFlag.set` that fired before the
  task was ready.

One waiter only
---------------

Only one task may be in :meth:`~asyncio.ThreadSafeFlag.wait`
at a time. The shape an application wants is a single
*owner* task for the flag -- usually the same task that
installed the interrupt handler -- with other tasks
communicating with it through :class:`~asyncio.Event`,
:class:`~asyncio.Lock`, or shared data structures protected
by those primitives.

When a button has to wake several tasks, the owner task is
the place to fan out: the watcher above could call
``some_event.set()`` after each press, and all the tasks
waiting on ``some_event`` would resume.
