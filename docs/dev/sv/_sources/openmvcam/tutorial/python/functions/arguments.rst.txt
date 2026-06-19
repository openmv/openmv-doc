Arguments
=========

A function can be called in several ways, and its parameters can
be declared in several shapes. The combinations look intimidating
at first; three or four patterns cover almost everything in
practice.

Positional and keyword arguments
--------------------------------

The simplest call passes arguments by *position* -- the first
value goes to the first parameter, the second to the second, and
so on:

::

    def rect(x, y, w, h):
        return (x, y, w, h)

    rect(10, 20, 100, 50)

The same call can pass arguments by *keyword*, naming each
parameter explicitly:

::

    rect(x=10, y=20, w=100, h=50)

Keyword arguments are order-independent and make calls
self-documenting at the cost of typing more. Positional and
keyword arguments can mix in a single call, but every positional
must appear before any keyword:

::

    rect(10, 20, w=100, h=50)         # OK
    rect(x=10, 20, 100, 50)           # SyntaxError

Default values
--------------

A parameter can declare a default value to use when the caller
does not supply one:

::

    def greet(name, greeting="hello"):
        print(greeting, name)

    greet("Alice")                    # hello Alice
    greet("Alice", "hi")              # hi Alice
    greet("Alice", greeting="hey")    # hey Alice

Parameters with defaults must come *after* parameters without
defaults in the ``def`` line.

.. warning::

   Default values are evaluated once, when the ``def`` runs --
   not on every call. Using a mutable default (``[]``, ``{}``)
   causes the *same* object to be shared across every call that
   takes the default. Use :data:`None` as a sentinel instead:

   ::

       def append_to(item, target=None):
           if target is None:
               target = []
           target.append(item)
           return target

Variable-length: ``*args`` and ``**kwargs``
-------------------------------------------

A parameter prefixed with ``*`` collects any leftover positional
arguments into a :class:`tuple`. A parameter prefixed with ``**``
collects any leftover keyword arguments into a :class:`dict`. The
conventional names are ``args`` and ``kwargs``, but any identifier
works:

::

    def report(label, *values, **options):
        print(label, values, options)

    report("temps", 21, 22, 23, unit="C", precision=1)

Output::

    temps (21, 22, 23) {'unit': 'C', 'precision': 1}

A function rarely needs both. The most common use is forwarding
arguments from a wrapper to an inner call:

::

    def log_and_call(func, *args, **kwargs):
        print("calling", func.__name__)
        return func(*args, **kwargs)

The mirror-image syntax at the *call* site unpacks an iterable
into positional arguments (``*``) or a :class:`dict` into keyword
arguments (``**``):

::

    point = (10, 20, 100, 50)
    rect(*point)                      # same as rect(10, 20, 100, 50)

    kwargs = {"x": 10, "y": 20, "w": 100, "h": 50}
    rect(**kwargs)                    # same as rect(x=10, y=20, ...)

Keyword-only parameters
-----------------------

A ``*`` on its own in the parameter list (not attached to a name)
marks every parameter that follows as *keyword-only* -- the caller
must use the name:

::

    def crop(buffer, *, x, y, w, h):
        ...

    crop(buffer, x=0, y=0, w=100, h=100)   # OK
    crop(buffer, 0, 0, 100, 100)           # TypeError

Use this for boolean flags and other arguments where a bare value
at the call site would not be self-explanatory.
