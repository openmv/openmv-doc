Methods and attributes
======================

A *method* is a function defined inside a class. The first
parameter is the instance the method is called on; the convention
is to name it ``self``.

Instance methods
----------------

::

    class Point:
        def __init__(self, x, y):
            self.x = x
            self.y = y

        def magnitude(self):
            return (self.x ** 2 + self.y ** 2) ** 0.5

    p = Point(3, 4)
    print(p.magnitude())

Output::

    5.0

The call ``p.magnitude()`` passes ``p`` as ``self`` automatically.
Method bodies read and update attributes through ``self`` the
same way functions read and update names through parameters.

Instance vs class attributes
----------------------------

Attributes assigned to ``self`` -- typically inside ``__init__``
-- belong to that one instance:

::

    a = Point(1, 2)
    b = Point(10, 20)
    a.x = 99
    print(a.x, b.x)           # 99 10

``a.x`` and ``b.x`` are different storage; mutating one does not
affect the other.

Names assigned in the class body, *outside* any method, are
shared by every instance of the class:

::

    class Counter:
        kind = "tally"        # class attribute -- shared

        def __init__(self):
            self.value = 0    # instance attribute -- per instance

    a = Counter()
    b = Counter()
    print(a.kind, b.kind)     # tally tally

.. figure:: ../figures/instance-vs-class.svg
   :alt: A class block at the top holding shared methods and the
         class attribute "kind"; below it, two instance boxes
         each holding their own "value" attribute, with arrows
         from each instance up to the class.

   Class attributes live on the class itself and are shared.
   Instance attributes live on each instance.

A class attribute is reached the same way as an instance one
(``a.kind``); Python looks first on the instance, then on the
class. Assigning to ``a.kind`` would create a new *instance*
attribute that shadows the class one, leaving ``b.kind``
untouched.

Use class attributes for constants and defaults every instance
should see the same way. Use instance attributes for state each
object should own its own copy of.

__str__ and __repr__
--------------------

Two special methods control how an instance prints. ``__str__``
returns the "friendly" string used by :func:`print`; ``__repr__``
returns the "developer" string used at the REPL and inside
container displays:

::

    class Point:
        def __init__(self, x, y):
            self.x = x
            self.y = y

        def __str__(self):
            return "(" + str(self.x) + ", " + str(self.y) + ")"

        def __repr__(self):
            return "Point(" + str(self.x) + ", " + str(self.y) + ")"

    p = Point(3, 4)
    print(p)            # uses __str__
    print([p, p])       # uses __repr__ inside the list

Output::

    (3, 4)
    [Point(3, 4), Point(3, 4)]

If only ``__repr__`` is defined, :func:`print` falls back to it
-- so a single well-written ``__repr__`` is usually enough.
Define ``__str__`` as well only when the friendly form should
look different from the developer form. Aim for a ``__repr__``
that looks like the call that would recreate the object;
debugging gets dramatically easier when printed values are
unambiguous.
