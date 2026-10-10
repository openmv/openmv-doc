Comprehensions
==============

A *comprehension* builds a new list, set, dict, or generator
from an existing iterable, in a single expression. It is a
replacement for the common pattern of starting with an empty
container and appending in a loop.

List comprehensions
-------------------

::

    squares = [x * x for x in range(5)]
    print(squares)

Output::

    [0, 1, 4, 9, 16]

The same loop spelled out:

::

    squares = []
    for x in range(5):
        squares.append(x * x)

The comprehension form is one expression that builds the list
in place. There is no ``squares = []`` and no ``.append`` --
the result is the value of the comprehension.

.. figure:: ../figures/comprehension-anatomy.svg
   :alt: The expression "[f(x) for x in xs if cond]" annotated:
         the leading expression is the result, the for clause
         names the loop variable, the if clause filters which
         items are kept.

   The leading expression produces each item; the ``for`` clause
   names the loop variable; an optional ``if`` filters items
   out.

Filtering with if
-----------------

An optional ``if`` clause keeps only the items that match:

::

    evens = [x for x in range(10) if x % 2 == 0]
    print(evens)

Output::

    [0, 2, 4, 6, 8]

The filter runs before the leading expression -- ``x % 2 == 0``
is checked first; only matching values reach ``x`` for the
output.

Dict and set comprehensions
---------------------------

The same shape works with dict and set literals.

A *dict comprehension* has a ``key: value`` pair before the
``for``:

::

    squares = {x: x * x for x in range(5)}
    print(squares)

Output::

    {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}

A *set comprehension* uses braces and a single expression:

::

    unique_lengths = {len(w) for w in ["a", "bb", "c", "bb"]}
    print(unique_lengths)

Output::

    {1, 2}

Generator expressions
---------------------

Round brackets produce a *generator expression* instead of a
list. The values are computed one at a time, on demand:

::

    total = sum(x * x for x in range(1000))

No million-item list is ever built. The values flow one by one
into :func:`sum`, which adds them and discards each as it goes.

Generator expressions are the right choice when feeding values
into a reducing function (:func:`sum`, :func:`max`, :func:`any`,
:func:`all`) or any other iterator-consuming code -- they save
the memory the equivalent list would have used.

When *not* to use a comprehension
---------------------------------

Comprehensions are concise but not always clearer. Reach for a
plain ``for`` loop when:

* The body needs more than one statement (a comprehension fits
  exactly one expression).
* The body has side effects (printing, writing to a file) --
  comprehensions are for *building* a collection, not for
  running actions.
* The filter or transformation has so many parts that the
  comprehension no longer reads left-to-right.
