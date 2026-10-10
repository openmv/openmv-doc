First class
===========

A *class* groups data and the functions that act on that data
under a single name. Reaching for one is worthwhile when several
pieces of state belong together and most of the functions in a
script take that same set of values as arguments.

The class keyword
-----------------

The keyword is ``class``. The body holds an ``__init__`` method
that runs every time a new instance is created:

::

    class Point:
        def __init__(self, x, y):
            self.x = x
            self.y = y

    p = Point(3, 4)
    print(p.x, p.y)

Output::

    3 4

``Point`` is the class; ``p`` is an *instance* of it. The
parentheses on the call ``Point(3, 4)`` invoke ``__init__``,
which assigns the arguments to attributes on the new instance.
``self`` is the conventional name for the instance; ``self.x``
sets an attribute that the rest of the instance's methods will
read.

When to use a class
-------------------

Reach for a class when these are true at the same time:

* A handful of related values travel together everywhere (a
  point's ``x`` and ``y``; a sensor reading's value, unit, and
  timestamp).
* Several functions take that same set of values and operate on
  them.
* It is useful to keep more than one of these bundles alive at
  a time, distinct from each other.

If the data is one-off, a plain :class:`dict` or :class:`tuple`
is usually enough. If you only need a single bundle of constants,
module-level variables are fine. Classes are not the default
container -- they earn their place when state and behaviour want
to stick together.

What __init__ does
------------------

``__init__`` is just a regular method. Anything assigned to
``self`` inside it becomes an attribute on the new instance:

::

    class Sensor:
        def __init__(self, name, unit):
            self.name = name
            self.unit = unit
            self.readings = []

    temp = Sensor("temperature", "C")
    print(temp.name, temp.unit, temp.readings)

Output::

    temperature C []

``readings`` is initialised to an empty list -- each new instance
gets its own list, not a shared one. Anything not assigned to
``self`` is local to ``__init__`` and disappears when it returns.
