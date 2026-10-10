Awaitable classes
=================

What an awaitable is
--------------------

When a coroutine writes ``await x``, the language asks
``x`` how to wait for it. Any object that knows how to
answer is *awaitable*. There are two kinds:

* The coroutine objects that ``async def`` functions
  return. Calling ``send_request()`` produces one of these
  every time -- the coroutine *object*, not the result of
  the function. Writing ``await send_request()`` is what
  actually runs the body.
* Objects of a class that defines an ``__await__`` method.
  ``async def`` is the shorthand for the first kind;
  ``__await__`` is the manual way to make the second kind.

Application code uses the first kind by default. The
second kind exists for the rare case where the *object
itself* needs to be the thing the caller ``await``\ s, not
the result of calling a method on it.

The two forms side by side
--------------------------

The same logic written as a coroutine and as an awaitable
class::

    import asyncio

    # async def -- almost always the right choice
    async def yield_then_return(value):
        await asyncio.sleep_ms(0)
        return value

    # awaitable class -- equivalent, rarely written
    class YieldThenReturn:
        def __init__(self, value):
            self._value = value

        def __await__(self):
            yield                       # let the loop run once
            return self._value          # value of the ``await`` expression

Both can be ``await``\ ed the same way::

    async def main():
        a = await yield_then_return(1)
        b = await YieldThenReturn(2)
        print(a, b)                     # prints: 1 2

The ``async def`` form is shorter, reads like normal Python,
and lets the language manage all the suspend-and-resume
bookkeeping. The class form gets nothing extra in this
example.

When the class form earns its place
-----------------------------------

When the object has to *be* something the application
hands around -- not a function the caller invokes to get a
coroutine -- the class form is the only option:

* A *future-like* value the application creates, hands to a
  producer, and ``await``\ s later to retrieve the
  produced result.
* A custom primitive built on top of an existing one where
  the natural API is ``await my_thing`` rather than
  ``await my_thing.wait()``. The :class:`asyncio.Task`
  class itself is a built-in example -- writing
  ``await task`` works because :class:`~asyncio.Task`
  defines ``__await__``.

For anything that fits the shape *call a function, get a
coroutine, await it*, ``async def`` wins.

The protocol details
--------------------

``__await__`` is a regular method (not ``async def``) that
returns an iterator. Writing it as a generator -- including
at least one ``yield`` in the body -- makes it one
automatically. Each ``yield`` suspends the coroutine that
``await``\ s the object and hands control back to the event
loop; the generator resumes the next time the loop
schedules the task. A bare ``return`` (or falling off the
end) finishes the wait; whatever the ``return`` produces
becomes the value of the ``await`` expression.

In practice the rare class that does this hands the
yielding off to an existing awaitable rather than driving
the loop itself::

    class WaitForEvent:
        def __init__(self, event):
            self._event = event

        def __await__(self):
            yield from self._event.wait().__await__()
            return self._event

The ``yield from`` re-uses the underlying event's
``__await__`` for the actual suspending. Most asyncio
applications never need to write either form.
