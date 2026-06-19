Dynamic code
============

Three built-ins take a string of Python source and run it:
:func:`eval`, :func:`exec`, and :func:`compile`. Together they
let code construct and execute *more* code at runtime -- which
is occasionally exactly the right tool, and far more often a
source of bugs and security holes.

.. warning::

   These functions execute arbitrary Python. Passing user input
   to ``eval`` or ``exec`` -- a string from a file the user can
   edit, a payload received over the network, a value typed at
   a REPL prompt -- lets that input do anything the calling
   script could do, up to and including deleting every file on
   the device. Use them deliberately, never inside code that
   runs automatically, and never on data you do not control.

eval
----

:func:`eval` runs a single *expression* and returns its value:

::

    >>> eval("3 * 7")
    21
    >>> name = "OpenMV"
    >>> eval("name.lower()")
    'openmv'

The expression sees the caller's globals and locals by default,
which is why ``name`` resolves in the second example. Passing
explicit dictionaries lets you sandbox the evaluation:

::

    eval("a + b", {"__builtins__": None}, {"a": 1, "b": 2})

Even sandboxed, ``eval`` is dangerous. There are well-known
techniques to escape such sandboxes; do not rely on the empty
``__builtins__`` trick alone for untrusted input.

exec
----

:func:`exec` runs a *block* of code rather than a single
expression -- statements, function definitions, loops -- and
returns :data:`None`:

::

    exec("for i in range(3): print(i)")

Output::

    0
    1
    2

The block can define names that become available afterwards,
with some caveats about local vs global scope. ``exec`` inside
a function rarely behaves the way the writer expects; if you
need it, run it at module level.

compile
-------

:func:`compile` turns a source string into a *code object* that
can be passed to :func:`eval` or :func:`exec` later. Use it when
the same source will run many times -- the parsing happens
once, the execution is faster:

::

    expr = compile("x * x", "<expr>", "eval")
    for x in range(5):
        print(eval(expr))

Output::

    0
    1
    4
    9
    16

The middle argument is a label that appears in tracebacks if
the code raises. The third argument is ``"eval"`` for a single
expression, ``"exec"`` for a block, or ``"single"`` for an
interactive-style statement that prints its result.

When to reach for these
-----------------------

Almost never. Most use cases beginners imagine have safer
alternatives:

* **Reading a config file.** Use :mod:`json` -- structured
  data, no execution.
* **Evaluating a numeric value typed by the user.** Use
  :func:`int` / :func:`float` to parse, then arithmetic. If the
  user really needs to enter a formula, use a small expression
  parser, not ``eval``.

When you do need ``eval`` / ``exec`` / ``compile``, isolate the
call site, log the exact string that is about to be executed,
and treat the source as the most suspicious thing in your code.
