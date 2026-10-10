Defining functions
==================

A *function* packages a block of code under a name so it can be
called from many places. Anywhere a calculation, action, or shaped
piece of work shows up more than once, a function turns it into a
single named thing.

The keyword is ``def``:

::

    def greet(name):
        print("hello,", name)

    greet("Alice")
    greet("Bob")

Output::

    hello, Alice
    hello, Bob

The line starting with ``def`` is the *definition* -- it creates
the function but does not run the body. Calling ``greet("Alice")``
is what runs the indented block.

Parameters and arguments
------------------------

The names in the parentheses on the ``def`` line are *parameters*
-- placeholders for values the caller will supply. The actual
values passed in are *arguments*. A function can take zero or more
parameters:

::

    def square(x):
        return x * x

    def add(a, b):
        return a + b

    def is_even(n):
        return n % 2 == 0

A call with the wrong number of arguments raises :exc:`TypeError`
right away.

return
------

A ``return`` statement ends the function immediately and hands a
value back to the caller:

::

    def absolute(x):
        if x < 0:
            return -x
        return x

A function that never reaches a ``return`` (or has a bare
``return`` with no value) returns :data:`None`:

::

    >>> def shout(text):
    ...     print(text.upper())
    ...
    >>> result = shout("hi")
    HI
    >>> print(result)
    None

A function can have several ``return`` statements; the first one
reached wins, and the rest of the body is skipped.

Returning multiple values
~~~~~~~~~~~~~~~~~~~~~~~~~

Python returns one object per call, but that object can be a
:class:`tuple` -- and the caller can unpack it on the spot:

::

    def minmax(values):
        return (min(values), max(values))

    lo, hi = minmax([3, 1, 4, 1, 5, 9])

The parentheses around the return value are optional;
``return a, b`` and ``return (a, b)`` are the same.

Docstrings
----------

A string literal placed as the first statement of a function body
is a *docstring*. It is stored on the function object and is what
:func:`help` displays:

::

    def scale(value, factor):
        """Multiply ``value`` by ``factor`` and return the result."""
        return value * factor

The IDE shows docstrings in tooltips when the cursor hovers over
the function name, so even a one-line summary pays for itself.
Triple-quoted strings allow the docstring to span multiple lines
when more detail is useful.

Naming conventions
------------------

Function names use ``snake_case`` -- lowercase words separated by
underscores. The name should describe what the function does:

* **Good**: ``read_temperature``, ``parse_header``, ``is_valid``.
* **Avoid**: ``do_stuff``, ``handle1``, ``temp_func``.

A leading underscore (``_helper``) marks a function as internal to
its module. The convention is widely respected but not enforced
by Python.
