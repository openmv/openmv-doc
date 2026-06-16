Inheritance
===========

Inheritance lets a class *extend* another class -- start with all
of its methods and attributes, then add or override what is
different. The original is called the *base* (or *parent*); the
extension is called the *subclass*.

.. figure:: ../figures/inheritance-tree.svg
   :alt: A base class Shape pointing down to a subclass Square;
         Square overrides one method (area) and inherits the
         rest.

   ``Square`` reuses every method on ``Shape`` and overrides
   the ones it needs to specialise.

Defining a subclass
-------------------

The base class goes in the parentheses on the ``class`` line:

::

    class Shape:
        def __init__(self, name):
            self.name = name

        def describe(self):
            return self.name + " with area " + str(self.area())

        def area(self):
            return 0

    class Square(Shape):
        def __init__(self, side):
            super().__init__("square")
            self.side = side

        def area(self):
            return self.side * self.side

    s = Square(4)
    print(s.describe())

Output::

    square with area 16

``Square`` inherits ``describe`` from ``Shape`` unchanged and
overrides ``area`` to return a real value. The base's
``describe`` still works because it calls ``self.area()`` --
which resolves to the override at run time.

super()
-------

:func:`super` returns a proxy that lets a method call the
base-class version of a method. The most common use is calling
the base ``__init__`` from a subclass ``__init__`` so the base
gets to initialise its own attributes:

::

    class Square(Shape):
        def __init__(self, side):
            super().__init__("square")    # run Shape.__init__
            self.side = side

Forgetting ``super().__init__`` is a common source of bugs:
attributes the base would have set never get set, and the
inherited methods that rely on them crash later.

The implicit base class
~~~~~~~~~~~~~~~~~~~~~~~

Every class implicitly inherits from :class:`object`, the root
of Python's type hierarchy. Methods like :meth:`__repr__
<object.__repr__>`, :meth:`__eq__ <object.__eq__>`, and the
machinery behind attribute access all come from there even when
a class declares no base. Writing ``class Foo(object):``
explicitly and writing ``class Foo:`` are equivalent in modern
Python; the latter is the conventional form.

When inheritance helps -- and when it does not
----------------------------------------------

Use inheritance when one class is genuinely a *more specific
kind* of another, sharing most of the behaviour. The classic
test is the "is-a" check: a ``Square`` is a ``Shape``.

When two classes just happen to share a few helpers, inheritance
is overkill. Reach for *composition* instead: have one class
hold an instance of the other as an attribute and use it through
that attribute. The shape is "has-a", not "is-a":

::

    class Logger:
        def log(self, msg):
            print("[log]", msg)

    # inheritance: Worker IS-A Logger
    class WorkerInherits(Logger):
        def run(self):
            self.log("starting")

    # composition: Worker HAS-A Logger
    class WorkerComposes:
        def __init__(self):
            self.logger = Logger()

        def run(self):
            self.logger.log("starting")

Both work. The composing version is usually better because it:

* **Keeps interfaces small.** ``WorkerComposes`` exposes only
  ``run`` and ``logger``. ``WorkerInherits`` also exposes
  ``log`` -- callers can write ``worker.log(...)`` directly,
  whether or not that was intended.
* **Decouples lifetimes.** The logger can be swapped, shared
  between workers, or constructed differently per worker, all
  without touching the ``Worker`` class. A subclass is bolted
  to its base.
* **Avoids method-name collisions.** Two bases that both define
  ``run`` clash when a class tries to inherit from both;
  two attributes never clash.

A practical rule of thumb:

* Use inheritance when the subclass really *is* a kind of the
  base and every method on the base makes sense on it too --
  ``Square`` is a ``Shape``; ``MemoryError`` is an
  ``Exception``.
* Use composition for everything else -- when you just want
  the *behaviour* of another class, not its identity. Most real
  code uses composition far more than it uses inheritance.
