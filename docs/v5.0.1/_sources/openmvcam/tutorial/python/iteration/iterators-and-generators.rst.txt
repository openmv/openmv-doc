Iterators and generators
========================

The ``for`` loop has been doing more work than it looks like.
This page covers the *iterator protocol* it runs on, and the
``yield`` keyword that lets you build your own iterators.

The iterator protocol
---------------------

Every object that can be looped over implements two methods:

* ``__iter__()`` -- return an *iterator* over the object's
  items.
* ``__next__()`` -- on the iterator, return the next item or
  raise :exc:`StopIteration` when there are no more.

The :func:`iter` built-in calls ``__iter__``; :func:`next` calls
``__next__``. Step through a list by hand:

::

    it = iter([10, 20, 30])
    print(next(it))    # 10
    print(next(it))    # 20
    print(next(it))    # 30
    print(next(it))    # raises StopIteration

.. figure:: ../figures/iterator-protocol.svg
   :alt: A for loop calls __iter__ once to get an iterator, then
         calls __next__ repeatedly until StopIteration ends the
         loop.

   ``for`` is sugar for "call ``__iter__`` once, then loop on
   ``__next__`` until ``StopIteration``."

What ``for x in items:`` actually does:

::

    _it = iter(items)
    while True:
        try:
            x = next(_it)
        except StopIteration:
            break
        # ... loop body ...

Every list, tuple, string, dict, set, file object, and generator
already implements ``__iter__`` and ``__next__`` -- which is why
they all work with ``for``.

yield and generator functions
-----------------------------

A function that contains a ``yield`` statement is a *generator
function*. Calling it does not run the body; it returns a
*generator object* (an iterator) that runs the body one
``yield`` at a time:

::

    def count_up_to(n):
        i = 0
        while i < n:
            yield i
            i += 1

    for value in count_up_to(3):
        print(value)

Output::

    0
    1
    2

Each call to :func:`next` resumes the function until the next
``yield``, hands that value to the caller, and pauses there. The
local state (``i`` in this case) is preserved between resumes.

.. figure:: ../figures/generator-yield.svg
   :alt: Sequence diagram with two lifelines (caller and
         generator body). The caller calls count_up_to(3),
         which creates a generator without running the body.
         Each subsequent next() runs the body until the next
         yield, returns the yielded value, and pauses. The
         fourth next() falls off the end and raises
         StopIteration. The variable i is preserved across
         pauses.

   ``next()`` runs the body up to the next ``yield``, hands the
   value back, and pauses. Local state survives the pause.

Generators are the easiest way to produce a sequence lazily --
no list is built, items are computed only when the consumer asks
for them, and the function can yield items forever if it wants.

Lazy pipelines
--------------

Generators compose well. One generator's output can feed
another:

::

    def numbers():
        i = 0
        while True:
            yield i
            i += 1

    def squares(source):
        for x in source:
            yield x * x

    pipeline = squares(numbers())

    for v in pipeline:
        if v > 100:
            break
        print(v)

The values flow through the pipeline one at a time -- no
intermediate list, no upper bound built in to ``numbers``, and
the consumer (``for v in pipeline``) decides when to stop.

.. figure:: ../figures/lazy-pipeline.svg
   :alt: Three boxes left-to-right: numbers(), squares(source),
         and the for-v-in-pipeline consumer. Three cycles are
         drawn beneath. In each cycle, the consumer sends a
         pull request leftward to squares, which sends a pull
         leftward to numbers; numbers yields a value rightward
         to squares, which yields its squared value rightward
         to the consumer.

   Each ``next()`` on the consumer triggers one pull through
   the chain; values exist only when something asks for them.

``yield from``
~~~~~~~~~~~~~~

A loop that pulls items from another iterable and yields each
one is common enough that Python provides a shortcut. The
expression ``yield from iter`` yields each value the iterable
produces, in order -- as if the generator had a
``for x in iter: yield x`` loop inline:

::

    def chain(*sources):
        for source in sources:
            yield from source

    for v in chain([1, 2, 3], (4, 5), "abc"):
        print(v)

Output::

    1
    2
    3
    4
    5
    a
    b
    c

``yield from`` is exactly equivalent to the explicit ``for``
loop, just shorter, and it propagates :exc:`StopIteration`
from the inner iterable up to the outer generator cleanly --
useful when chaining several generators end-to-end.

When ``yield`` runs out
~~~~~~~~~~~~~~~~~~~~~~~

Falling off the end of a generator function (or hitting an
explicit ``return``) raises :exc:`StopIteration` automatically.
There is no need to raise it by hand; the surrounding ``for``
loop sees it and ends.

Use generators when the producing code is naturally written as
a loop with a few yield points; use a plain list comprehension
when you genuinely need the whole sequence in memory.
