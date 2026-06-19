Named tuples and deques
=======================

Lists, tuples, dictionaries, and sets cover most data needs. Three
other containers in the :mod:`collections` module fit specific
problems that the built-ins handle clumsily.

namedtuple -- typed records without a class
-------------------------------------------

A plain tuple stores values by position. That's fine for a small,
short-lived 2- or 3-tuple, but past that ``point[0]`` and
``point[1]`` start to lie about what they hold. :func:`collections.namedtuple`
returns a new tuple subclass whose fields have names::

    >>> from collections import namedtuple
    >>> Reading = namedtuple('Reading', ('temp', 'humidity', 'ts'))
    >>> r = Reading(22.5, 41.0, 137204)
    >>> r.temp
    22.5
    >>> r.humidity
    41.0
    >>> r[0]
    22.5

The fields argument is a sequence of name strings (or one whitespace-
separated string in CPython; MicroPython is stricter -- pass a tuple
or list).

Why use a ``namedtuple`` instead of a class?

* It's a tuple. Iteration, unpacking, equality, hashing, and use as
  a dict key all work for free.
* It's immutable. Reassigning ``r.temp = ...`` raises ``AttributeError``,
  which is exactly what you want for a record type.
* It costs less RAM than a class instance with the same fields --
  the tuple's storage is contiguous, with no ``__dict__``.

Compared with the equivalent class, a ``namedtuple`` declaration is
one line. The trade-off is that fields are read-only -- to "change"
a reading you make a new one.

deque -- a bounded ring buffer
------------------------------

A list is fast at the *end* (``append`` / ``pop``) and slow at the
*start* (``insert(0, ...)`` / ``pop(0)`` both shift every other
element). A :class:`collections.deque` is fast at both ends -- it's
a ring buffer indexed by head and tail pointers, so append and pop
on either side run in the same fixed amount of work regardless of
how many items the deque holds.

Construction in MicroPython requires both an initial iterable *and*
a max length, in that order::

    >>> from collections import deque
    >>> events = deque((), 5)
    >>> for i in range(8):
    ...     events.append(i)
    >>> list(events)
    [3, 4, 5, 6, 7]

When a bounded deque is full, every ``append`` drops the oldest item.
That makes the deque ideal for "the last N samples", "the last N log
lines", or any rolling window that doesn't need to grow forever.

The methods exposed on MicroPython's deque are deliberately minimal:

* ``append(x)`` -- add to the right.
* ``appendleft(x)`` -- add to the left.
* ``extend(iterable)`` -- append each item from the iterable.
* ``pop()`` -- remove and return the right end. Raises ``IndexError``
  on empty.
* ``popleft()`` -- remove and return the left end.

Notable omissions from CPython's deque: no ``clear``, ``count``,
``index``, ``remove``, ``reverse``, ``rotate``, ``maxlen`` attribute,
or ``__contains__``. Iteration and subscript indexing work::

    >>> events[0]
    3
    >>> for e in events:
    ...     print(e)

A typical use: keeping the last few sensor readings to detect trend
changes::

    history = deque((), 10)

    def push(reading):
        history.append(reading)
        if len(history) == 10 and history[-1] > 2 * history[0]:
            print('reading is climbing')

OrderedDict -- when order is part of equality
---------------------------------------------

Regular :class:`dict` has preserved insertion order since
MicroPython 1.13 and CPython 3.7. That covers the most common reason
people used to reach for :class:`collections.OrderedDict`.

What :class:`OrderedDict` still gives you that a plain dict does
not:

* ``OrderedDict`` equality considers order. Two regular dicts
  compare equal whenever they have the same key/value pairs,
  regardless of insertion order. Two ``OrderedDict`` instances are
  equal only if their pairs are in the same order::

    >>> from collections import OrderedDict
    >>> OrderedDict([('a', 1), ('b', 2)]) == OrderedDict([('b', 2), ('a', 1)])
    False
    >>> {'a': 1, 'b': 2} == {'b': 2, 'a': 1}
    True

* ``OrderedDict`` is useful when you're serialising config to a
  format that *does* care about key order (TOML, some YAML
  consumers), or when you want a clear documentation hint that
  order matters for the readers of your code.

For everyday code, prefer the built-in :class:`dict`. Reach for
``OrderedDict`` only when the order-is-part-of-equality semantics or
the documentary value actually buys something.

The three containers each have one narrow fit. Named tuples replace
hand-rolled record classes; deques replace lists for bounded
queues; ordered dicts make insertion order part of the contract.
