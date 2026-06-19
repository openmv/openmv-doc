Pattern basics
==============

A regular expression is a small language for describing strings by
form rather than by their exact contents. Use it when a string
matches if-and-only-if it follows a *pattern* you can describe but
can't enumerate -- "a sequence of digits followed by a unit", "a line
that starts with ``ERROR`` and ends with a number", "any of these
file extensions, in any order, with optional ``v`` prefixes".

Reach for :mod:`re` *only* when a plain string method won't do.

* :meth:`str.startswith`, :meth:`str.endswith` -- testing for a
  fixed prefix or suffix.
* ``in`` -- testing whether a fixed substring is present.
* :meth:`str.split`, :meth:`str.find`, :meth:`str.replace` -- working
  with fixed delimiters.

Each of those is faster, easier to read, and harder to get wrong than
the equivalent regex. Use regex when the *form* of the string matters
and the exact substring does not.

The four things you'll use
--------------------------

The MicroPython :mod:`re` module surfaces four things:

* :func:`re.compile` -- turn a pattern string into a compiled pattern
  object you can reuse.
* :func:`re.match` -- try the pattern at the *start* of a string. The
  pattern is anchored at position 0.
* :func:`re.search` -- try the pattern *anywhere* in a string. Returns
  the first match.
* :func:`re.sub` -- find every match and replace it.

Notable omissions vs CPython: no ``re.findall``, no ``re.finditer``,
no ``re.split`` at module level (compiled patterns have a ``split``
method instead), no ``re.fullmatch``, no flag constants like
``re.IGNORECASE``. Where you'd reach for one of those on CPython,
build the equivalent from :func:`re.search` in a loop.

A first pattern
---------------

The pattern ``r'\d+'`` matches one or more digits::

    >>> import re
    >>> m = re.search(r'\d+', 'sensor reading 42 ok')
    >>> m.group(0)
    '42'

A few things to notice:

* The pattern is written as a *raw string* (``r'...'``) so the
  backslash in ``\d`` reaches :mod:`re` instead of being processed
  as a Python string escape. Always use raw strings for regex
  patterns.
* :func:`re.search` returns a *match object* on success and
  :data:`None` on failure. Always check before calling
  :meth:`match.group`.
* ``m.group(0)`` is the full text the pattern matched. Group 1, 2,
  ... appear later, once the pattern contains capturing parentheses.

The same pattern with :func:`re.match` returns :data:`None` because
the string doesn't *start* with a digit::

    >>> re.match(r'\d+', 'sensor reading 42 ok') is None
    True
    >>> re.match(r'\d+', '42 readings')
    <match num=1>

The pieces of a pattern
-----------------------

Most useful patterns are built from a small set of pieces. The ones
that work in MicroPython:

**Literal characters** -- any character that isn't special matches
itself. ``hello`` matches ``hello``.

**Special characters** -- ``. ^ $ * + ? { } [ ] \ | ( )`` all have
meanings below. To match one of them literally, escape it with a
backslash: ``\.`` matches a literal dot.

**Character classes** -- shorthands for common character sets:

* ``\d`` -- any digit ``0``-``9``
* ``\D`` -- any non-digit
* ``\s`` -- any whitespace character (space, tab, newline)
* ``\S`` -- any non-whitespace
* ``\w`` -- any "word" character: letters, digits, underscore
* ``\W`` -- any non-word character
* ``.`` -- any character except newline

**Quantifiers** -- how many times the previous piece must match:

* ``*`` -- zero or more (greedy)
* ``+`` -- one or more (greedy)
* ``?`` -- zero or one
* ``{n}`` -- exactly *n*
* ``{m,n}`` -- between *m* and *n* (inclusive)

Combining: ``\d{3}-\d{4}`` matches three digits, a dash, four digits.
``\s+`` matches one or more whitespace characters. ``hello.*world``
matches ``hello``, anything (including nothing), then ``world``.

.. note::

   *Greedy* means the quantifier consumes as much of the input as it
   can while still letting the rest of the pattern match. Against
   ``hello x world y world``, the ``.*`` in ``hello.*world`` matches
   the longest run that still leaves a ``world`` at the end -- it
   captures ``x world y``, not the shorter ``x``. The same is true of
   ``+`` and the ``{m,n}`` range form: the engine takes the longest
   match it can, then backs off only if the rest of the pattern
   fails.

Substitution
------------

:func:`re.sub` finds every match and replaces it with a string. The
replacement can reference captured groups via ``\1``, ``\2``, ...
(covered with the rest of the group syntax later). Without groups,
``re.sub`` is a straight find-and-replace on a regex::

    >>> re.sub(r'\s+', ' ', 'too    many   spaces')
    'too many spaces'

    >>> re.sub(r'\d+', 'N', 'log 12, log 345, log 6')
    'log N, log N, log N'

The third argument is the string to operate on; the result is a new
string with every match replaced.

Splitting -- on a compiled pattern only
---------------------------------------

There is no ``re.split`` at module level. To split on a regex, compile
the pattern first and call its ``split`` method::

    >>> sep = re.compile(r'\s*,\s*')
    >>> sep.split('a , b,c ,  d')
    ['a', 'b', 'c', 'd']

The optional second argument caps the number of splits::

    >>> sep.split('a, b, c, d', 2)
    ['a', 'b', 'c, d']

Compiling for reuse
-------------------

If the same pattern runs many times -- inside a loop or in a hot
function -- compile it once and reuse the compiled object::

    digit_run = re.compile(r'\d+')

    def first_number(line):
        m = digit_run.search(line)
        return int(m.group(0)) if m else None

Calling :meth:`pattern.match` and :meth:`pattern.search` on a compiled
object is the same as the module-level functions but skips the
recompile cost on every call.

Patterns that don't match anything
----------------------------------

Three patterns in particular catch developers out:

* ``.*`` matches the empty string. ``re.search(r'.*', s).group(0)``
  returns ``''`` on any input.
* A pattern with an unescaped special character is a syntax error.
  ``re.compile(r'cost: $5')`` raises ``ValueError`` because ``$``
  means "end of string". Use ``r'cost: \$5'``.
* The dot ``.`` does *not* match a newline. To match across
  newlines, write the pattern to handle them explicitly with
  ``[\s\S]`` or feed one line at a time.

With these pieces a pattern can match almost any *fixed-form* slice
of text. Pulling structured *data* back out of the match requires
capturing groups.
