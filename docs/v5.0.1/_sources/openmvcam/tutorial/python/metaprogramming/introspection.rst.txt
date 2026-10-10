Introspection
=============

A handful of built-ins let a running program inspect itself --
the values it is working with, the namespaces those values live
in, and the relationships between classes. Reach for them when
you need to make decisions based on what an object *actually
is*, rather than what its caller claims it is.

Identity and hashing
--------------------

* :func:`id` -- a unique integer that identifies an object for
  as long as it is alive. Two names that bind the same object
  return the same id; two equal-but-distinct objects do not.

::

    >>> a = [1, 2, 3]
    >>> b = a
    >>> c = [1, 2, 3]
    >>> id(a) == id(b)        # same list
    True
    >>> id(a) == id(c)        # equal but distinct
    False

The id is not portable across runs and not meaningful beyond
"same object or different object."

* :func:`hash` -- the hash value of an object, the same number
  :class:`dict` and :class:`set` use to look it up. Two equal
  objects hash to the same value; only hashable types
  (immutable values, mostly) work at all.

::

    >>> hash("abc")           # some integer, build-dependent
    -1600925533
    >>> hash([1, 2])
    TypeError: unhashable type: 'list'

Querying types and callability
------------------------------

* :func:`type` -- the exact class of a value. ``type(x) is int``
  asks "is x exactly an int" (no subclasses); :func:`isinstance`
  is usually what you want instead.
* :func:`isinstance` -- "is x an instance of this class, or a
  subclass of it?" The standard tool for type-based dispatch
  inside functions.
* :func:`issubclass` -- the class-level counterpart. Takes two
  classes rather than an instance.
* :func:`callable` -- :data:`True` if the argument can be
  called with ``()``. Useful when you receive an argument that
  may be a function or may be a plain value.

::

    >>> isinstance(3, int)
    True
    >>> isinstance(True, int)        # bool is a subclass of int
    True
    >>> issubclass(bool, int)
    True
    >>> callable(len)
    True
    >>> callable(10)
    False

A pattern that uses callable:

::

    def call_or_return(x):
        return x() if callable(x) else x

Looking at scopes
-----------------

* :func:`globals` -- the module's global namespace as a
  :class:`dict`. Reading from it works; writing to it is real,
  but doing so outside of REPL exploration makes a program
  difficult to follow.
* :func:`locals` -- the local namespace at the call site.
  Inside a function it reflects the local variables;
  *modifying* the returned dict is not guaranteed to write back
  into the actual locals (implementation-defined behaviour).

::

    name = "OpenMV"

    def f():
        x = 10
        print(globals()["name"])    # OpenMV
        print(locals())             # {'x': 10}

These two are useful for debugging and for tools that need to
discover what is defined. Reach for them sparingly in regular
code -- a function that mutates ``globals()`` is one of the
hardest things to reason about in Python.

See also
--------

:func:`dir` and :func:`help`, covered in :doc:`debugging
<../micropython/debugging>`, are the everyday introspection
tools for exploring an unknown object's surface.
