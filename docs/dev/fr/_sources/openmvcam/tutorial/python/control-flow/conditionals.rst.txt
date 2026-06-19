Conditionals
============

A *conditional* runs a block of code only when some test
evaluates to true. The keyword is ``if``, optionally followed by
one or more ``elif`` ("else if") branches and a final ``else``.

::

    n = 42

    if n > 0:
        print("positive")
    elif n < 0:
        print("negative")
    else:
        print("zero")

The body of each branch is everything indented under it (four
spaces by convention). Python walks the branches in order, runs
the first one whose test is true, and skips the rest. The
``else`` block runs only if every preceding test was false; it
is always optional.

.. figure:: ../figures/if-elif-else.svg
   :alt: A flowchart showing if/elif/else: two diamond decision
         tests with their bodies, falling through to a final else
         body when both tests are false.

   Only one branch ever runs. Tests are evaluated top to bottom
   until one succeeds; the rest are skipped.

Truthiness
----------

A test in an ``if`` does not have to return :data:`True` or
:data:`False` -- any value counts as either *truthy* or *falsy*.
The falsy values are:

* :data:`False` and :data:`None`
* The number zero: ``0``, ``0.0``
* Empty sequences and collections: ``""``, ``[]``, ``()``,
  ``{}``, ``b""``

Everything else is truthy. This lets you write compact tests:

::

    if name:                     # false on empty string
        print("hello", name)

    if items:                    # false on empty list, dict, etc.
        process(items)

Be aware that truthiness changes the meaning. ``if value:`` is
*not* the same as ``if value is not None:`` -- the first one is
also false when ``value`` is ``0`` or ``""``. When you really
mean "is this exactly :data:`None`", use ``is None`` /
``is not None`` explicitly.

Ternary expressions
-------------------

A conditional can appear inside an expression:

::

    label = "even" if n % 2 == 0 else "odd"

Read as "``label`` is ``"even"`` *if* ``n % 2 == 0`` *else*
``"odd"``." Handy for one-liners; for anything more than one
line, a full ``if`` statement is easier to read.

Nesting and early returns
-------------------------

Conditionals can nest arbitrarily deep, but every extra layer of
indentation makes a function harder to read. The example below
checks four conditions before doing the real work and leaves the
useful line buried four indents in:

::

    def process(item):
        if item is not None:
            if item.is_valid():
                if item.size() > 0:
                    if item.owner == "me":
                        return do_the_work(item)
        return None

Two patterns flatten this kind of code.

Early returns for guards
~~~~~~~~~~~~~~~~~~~~~~~~

Handle every "bail out" case first, each with its own ``return``,
so the main logic stays at the outer indent. Each guard reads as
"this is not a case we handle; leave":

::

    def process(item):
        if item is None:
            return None
        if not item.is_valid():
            return None
        if item.size() == 0:
            return None
        if item.owner != "me":
            return None
        return do_the_work(item)

The "main path" is now one line at the bottom of the function,
not buried inside four layers. This style is sometimes called the
*guard clause* pattern.

Combining tests with and / or
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

When several conditions all have to hold for the same branch,
combine them with ``and`` rather than nesting. Conditions that
each independently trigger the branch combine with ``or``:

::

    # all must hold -- use `and`
    if user.is_admin() and user.has_permission("write") and not locked:
        save()

    # any one of them is enough -- use `or`
    if c == " " or c == "\t" or c == "\n":
        whitespace_count += 1

Both forms short-circuit, so an expensive check on the right side
only runs when the cheaper checks on the left have not already
settled the question.
