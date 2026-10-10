Debugging
=========

Most scripts that fail on the camera fail in one of three ways:
they raise an exception, they produce the wrong value, or they
hang. Each has a different set of tools.

Reading a traceback
-------------------

When a script raises and nothing handles the exception, the REPL
or the IDE prints a *traceback* -- a record of the call chain
from the outermost script down to the line that raised.

A traceback reads bottom-to-top:

* The bottom line names the exception class and its message
  (``ValueError: invalid literal for int()...``).
* Each ``File "...", line N, in <name>`` block above it is a
  *frame* -- one call deeper as you go up.
* The very top frame is where the script started; the very
  bottom frame is where the error fired.

Read the bottom first to learn *what* went wrong, then walk
upward to see *how* the script got there. The line numbers
point at exact source locations in the script.

Print debugging
---------------

The fastest way to find out what a script is doing is to print
the suspect values. Three built-ins make prints more useful:

* :func:`repr` -- returns the developer-style string for a
  value. ``print(repr(value))`` distinguishes ``"5"`` from ``5``
  and ``None`` from ``"None"``, which a plain :func:`print`
  cannot.
* :func:`type` -- returns the class of a value. ``print(type(value))``
  is how to find out whether the variable that "should be an
  int" is secretly a string.
* :func:`len` -- the length of a sequence or collection. A
  surprisingly large fraction of bugs are off-by-one or
  size-mismatch problems.

::

    print("got:", repr(value), "type:", type(value), "len:", len(value))

Drop a print inside each branch you care about -- both arms of
an ``if``, each ``except`` block, the body of a loop you suspect
of running zero times. The cost is a line of output; the value
is finding out whether the code path you *think* is running is
the one actually running.

Exploring an object
-------------------

Two built-ins answer "what can I do with this thing":

* :func:`dir` -- returns a list of every name defined on an
  object: methods, attributes, dunders, the lot.
* :func:`help` -- prints the docstring (and on CPython, the
  signature) of a function, method, or class.

Use them together: ``dir`` finds the name, ``help`` explains
what it does.

Finding a name with dir
~~~~~~~~~~~~~~~~~~~~~~~

::

    >>> dir([1, 2, 3])
    ['__add__', '__class__', '__contains__', '__delitem__',
     '__eq__', '__ge__', ..., 'append', 'clear', 'copy',
     'count', 'extend', 'index', 'insert', 'pop', 'remove',
     'reverse', 'sort']

The first chunk of the list is dunder methods, inherited from
every object; the names worth scanning for are usually after
them. ``dir`` works on anything -- a class, an instance, a
module, a built-in type:

::

    >>> import json
    >>> dir(json)
    ['__name__', 'dump', 'dumps', 'load', 'loads']

That second form is how to find out which top-level names a
module actually exposes without leaving the REPL.

Looking it up with help
~~~~~~~~~~~~~~~~~~~~~~~

Once ``dir`` has surfaced a candidate, ``help`` describes it:

::

    >>> help(str.split)
    split(sep=None, maxsplit=-1)
        Return a list of the words in the string, ...

On MicroPython, ``help`` is leaner than on CPython -- sometimes
just the signature, sometimes a one-line docstring, sometimes
nothing for built-in C functions. It is still a fast reminder
when the IDE tooltip is not nearby.

When something hangs
--------------------

A script that does not return is harder to diagnose than one
that raises. Common culprits:

* A ``while`` loop whose condition never becomes false. Add a
  print of the loop variable each iteration; if the value is
  not changing, the loop body has a bug.
* A blocking call waiting for input that never arrives -- a
  read from an empty queue, a sleep with no end. Bracket the
  call with prints to see which line the script is stuck on.
* An infinite recursion. The traceback when it eventually fires
  (with :exc:`RecursionError`) usually points right at it.

The most effective recovery for a hung script is the IDE's
**stop** button, which sends a :exc:`KeyboardInterrupt` to the
script over USB. The interrupt surfaces as a traceback at the
line currently running -- often the exact line that is not
returning.

.. note::

   If a hang resists every diagnostic -- the script appears
   correct, the interrupt traceback points into a built-in or
   into firmware code rather than your script, or the same code
   worked on a previous firmware build -- the cause may be a
   firmware bug rather than a script bug. Reduce the script to
   the smallest reproducer that still hangs and open a report on
   the `OpenMV forum <https://forums.openmv.io/>`_. Include the
   firmware version, the board it ran on, and the reduced
   script.

Take the diagnostics out before shipping
----------------------------------------

Strategic prints during development are great; a hundred print
calls left in a production script clutter the output and use
heap that the real work could be using instead. When a bug is
fixed, take the prints out (or guard them behind a debug flag
you can flip off).

For diagnostics that should stay in the code path long-term,
switch from :func:`print` to the :mod:`logging` module. It
attaches a *level* to each message (``debug``, ``info``,
``warning``, ``error``) and lets a single setting silence the
quiet ones in production:

::

    import logging

    log = logging.getLogger("main")
    log.info("starting up")
    log.debug("loaded config: %s", config)
    log.warning("falling back to defaults")

Setting the logger's level to ``logging.WARNING`` makes the
``info`` and ``debug`` calls cost essentially nothing (the
message string is never built), without having to comment lines
out. That makes ``logging`` the right tool for *permanent*
diagnostics; raw ``print`` is fine for *throwaway* ones.
