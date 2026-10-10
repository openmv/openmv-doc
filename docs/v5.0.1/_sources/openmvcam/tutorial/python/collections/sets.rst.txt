Sets
====

A *set* is an unordered collection of unique items. Adding a
value that is already present has no effect; iteration yields
each value exactly once. Sets are the right tool when membership
and de-duplication matter, and ordering does not.

Creating a set
--------------

Use curly braces for a non-empty set, or :func:`set` for an
empty one:

::

    colours = {"red", "green", "blue"}
    empty = set()

The braces look like a :class:`dict` literal; ``{}`` on its own
is an empty *dict*, not an empty set -- one of Python's
historical accidents. Use ``set()`` for the empty case.

:func:`set` also builds a set from any iterable, which is the
standard way to drop duplicates from a sequence:

::

    nums = [1, 2, 2, 3, 1, 4]
    unique = set(nums)
    print(unique)

Output::

    {1, 2, 3, 4}

The print order may vary -- sets do not promise to iterate in
any particular order.

Set vs dict
-----------

Sets and dicts both store unique items in a hash table. What
each item carries with it is the difference:

* A :class:`dict` stores **key-value pairs**. Looking up a key
  returns its value.
* A :class:`set` stores **just the items**. Looking up an item
  tells you whether it is there.

The choice between the two is about whether the *value
alongside each item* means anything:

* Reach for a **set** when no value belongs next to each item
  -- you only care whether the item is present, or you are
  combining groups of unique items with union / intersection.
* Reach for a **dict** when each item is paired with data the
  lookup is meant to retrieve -- a config map, a cache, a
  counter keyed by name.

The two types share a lot of surface syntax, which is where
most of the confusion comes from. The differences in one block:

+----------------------+-----------------------------+-----------------------------+
|                      | set                         | dict                        |
+======================+=============================+=============================+
| holds                | unique items                | unique keys, each with a    |
|                      |                             | value                       |
+----------------------+-----------------------------+-----------------------------+
| populated literal    | ``{1, 2, 3}``               | ``{"a": 1, "b": 2}``        |
+----------------------+-----------------------------+-----------------------------+
| empty literal        | ``set()``                   | ``{}``                      |
+----------------------+-----------------------------+-----------------------------+
| membership test      | ``x in s``                  | ``k in d`` (keys only)      |
+----------------------+-----------------------------+-----------------------------+
| fetch a value        | n/a                         | ``d[k]``                    |
+----------------------+-----------------------------+-----------------------------+
| add an item          | ``s.add(x)``                | ``d[k] = v``                |
+----------------------+-----------------------------+-----------------------------+
| iterate              | yields items                | yields keys (use            |
|                      |                             | ``d.items()`` for pairs)    |
+----------------------+-----------------------------+-----------------------------+

The asymmetry between the populated and empty literals is the
gotcha worth calling out:

* Braces with **items in them** -- ``{1, 2, 3}`` -- are a
  set literal; braces with **key-value pairs** -- ``{"a": 1}``
  -- are a dict literal. The parser tells them apart by what
  is inside.
* Braces with **nothing inside** -- ``{}`` -- are an empty
  dict, not an empty set. Dicts came first; the empty literal
  belongs to them. An empty set has no braces literal at all
  and must be written ``set()``.

A common pattern when only the keys of a dict are ever read is
to switch to a set -- it makes the intent obvious and trims the
unused values out of memory.

Adding and removing
-------------------

* :meth:`set.add` -- insert one item.
* :meth:`set.discard` -- remove an item if it is present, do
  nothing if it is not.
* :meth:`set.remove` -- remove an item; raise :exc:`KeyError`
  if it is missing.
* :meth:`set.clear` -- empty the set.

::

    s = {1, 2, 3}
    s.add(4)
    s.discard(99)            # silent: 99 not in s
    s.remove(2)
    print(s)

Output::

    {1, 3, 4}

Membership
----------

The ``in`` operator tests for membership. On a set it is
roughly constant time regardless of size -- which is the main
reason to choose a set over a :class:`list` when you only need
to ask "is this value in there":

::

    if "red" in colours:
        print("colour is allowed")

A :class:`list` with the same contents would scan from the
start each time, which is fine for ten items but slow for ten
thousand.

Set operations
--------------

Two sets can be combined with the usual mathematical operations.
Each has both an operator form and a method form:

* ``a | b`` or ``a.union(b)`` -- everything in either set.
* ``a & b`` or ``a.intersection(b)`` -- only what appears in
  both.
* ``a - b`` or ``a.difference(b)`` -- in ``a`` but not in ``b``.
* ``a ^ b`` or ``a.symmetric_difference(b)`` -- in one but not
  both.

::

    a = {1, 2, 3, 4}
    b = {3, 4, 5, 6}
    print(a | b)
    print(a & b)
    print(a - b)
    print(a ^ b)

Output::

    {1, 2, 3, 4, 5, 6}
    {3, 4}
    {1, 2}
    {1, 2, 5, 6}

The operator forms are read-only; the method forms accept any
iterable on the right, not just another set
(``a.union([5, 6])``). Pick whichever reads better in context.

What can go in a set
--------------------

Set elements must be *hashable* -- the same constraint as
:class:`dict` keys. :class:`int`, :class:`float`, :class:`str`,
:class:`bool`, :class:`bytes`, and :class:`tuple` (when its
contents are themselves hashable) all work. :class:`list` and
:class:`dict` do not; trying to add one raises
:exc:`TypeError`.

frozenset
---------

A regular :class:`set` is mutable: every call to ``add`` /
``remove`` / ``discard`` changes the object in place. That
mutability disqualifies it from being hashable, so a set
*cannot* be used as a :class:`dict` key or as a member of
another set.

:class:`frozenset` is the immutable counterpart. It has the
same lookups and operators (``in``, ``|``, ``&``, ``-``, ``^``)
as :class:`set`, but no ``add`` / ``remove`` and no methods
that mutate. Because nothing can ever change its contents, the
hash of a :class:`frozenset` is well-defined -- so it *is*
hashable:

::

    primary = frozenset({"red", "green", "blue"})
    secondary = frozenset({"yellow", "purple", "orange"})

    palettes = {
        primary: "RGB",
        secondary: "mixed",
    }

    print(palettes[primary])

Output::

    RGB

Construct a frozenset from any iterable -- ``frozenset()`` for
the empty case, ``frozenset(some_set)`` to take an immutable
snapshot of an existing set:

::

    snapshot = frozenset(s)         # immutable copy of s
    s.add("new")                    # snapshot does not change

Two common reasons to reach for it:

* **Use as a dict key or set member.** Anywhere a single value
  cannot capture what you need, a :class:`frozenset` of values
  can -- "the set of features supported by this driver", "the
  set of pins this profile uses".
* **Lock down a constant.** A module-level :class:`frozenset`
  of allowed names cannot be accidentally mutated by a caller;
  a regular :class:`set` can. Prefer :class:`frozenset` for
  anything that is meant to be read-only after construction.
