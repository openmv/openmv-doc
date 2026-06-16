Groups and anchors
==================

A pattern can do more than say "this string matches" -- it can pull
the matched pieces apart and hand each one to the application by
name. Parentheses around part of a pattern make it a *capturing
group*; the match object then exposes each group as a separate
substring.

Capturing groups
----------------

Wrap any part of a pattern in ``(...)`` to capture what it matched::

    >>> import re
    >>> m = re.search(r'temp (\d+) at (\d+)s', 'temp 42 at 137s ok')
    >>> m.group(0)
    'temp 42 at 137s'
    >>> m.group(1)
    '42'
    >>> m.group(2)
    '137'

* Group 0 is always the entire match.
* Groups 1, 2, ... are the captured substrings, numbered left to
  right by their *opening* parenthesis.
* Calling :meth:`match.group` with an index past the last group
  raises ``IndexError``.

A common pattern is "match a known structure, capture the variable
parts as ints"::

    def parse_temp(line):
        m = re.search(r'temp (\d+) at (\d+)s', line)
        if not m:
            return None
        return int(m.group(1)), int(m.group(2))

Non-capturing groups
--------------------

Parentheses also *group* a sub-expression so a quantifier can apply
to the whole group. That's the only purpose of grouping in
``r'(ab)+'`` -- "one or more of ``ab``". The fact that ``ab`` shows
up as group 1 is a side effect.

To group without capturing, use ``(?:...)``::

    >>> re.search(r'(?:ab)+', 'xababy').group(0)
    'abab'

Non-capturing groups keep the group numbers tidy when a pattern uses
grouping for structure but doesn't care about pulling each piece
out.

Anchors
-------

Anchors don't match a character -- they match a *position*.

* ``^`` -- start of the string.
* ``$`` -- end of the string.

Anchors are what make :func:`re.match` and :func:`re.search` behave
differently. ``re.match(p, s)`` is the same as
``re.search('^' + p, s)``: it forces the pattern to start at
position 0. Adding ``$`` to the end of a pattern then makes the
pattern match the *entire* string and nothing else::

    >>> re.search(r'^\d+$', '12345')
    <match num=1>
    >>> re.search(r'^\d+$', '12345 ok') is None
    True

``^`` and ``$`` in MicroPython :mod:`re` always mean the start and
end of the *whole* string passed to :func:`re.search`. There is no
``re.MULTILINE`` flag to make them match at every embedded newline,
and ``$`` does not match the position before a trailing ``\n`` either
-- it has to be the absolute end of the input. To get per-line
behaviour, split the input on newlines first and run the pattern on
each line.

Character sets
--------------

Square brackets define an explicit set of characters. The match
consumes exactly one character from the set.

* ``[abc]`` -- one of ``a``, ``b``, ``c``.
* ``[a-z]`` -- one character in the range ``a``-``z`` (inclusive).
* ``[a-zA-Z0-9]`` -- letters or digits. Three ranges combined.
* ``[^abc]`` -- *not* one of ``a``, ``b``, ``c``. The ``^`` only
  negates when it's the first character inside the brackets.

Examples::

    >>> re.search(r'[A-F0-9]{6}', 'colour #1a2b3c rest').group(0)
    '1A2B3C'
    >>> re.search(r'[A-F0-9]{6}', 'colour #1a2b3c rest') is None
    True

The first call returns :data:`None` in practice because the literal
text is lowercase. MicroPython :mod:`re` has no ``re.IGNORECASE``
flag -- to match case-insensitively, write both cases into the set::

    >>> re.search(r'[A-Fa-f0-9]{6}', 'colour #1a2b3c rest').group(0)
    '1a2b3c'

The class shortcuts (``\d``, ``\s``, ``\w``, and their negated
forms) can be used inside ``[...]`` too: ``[\w-]`` is "word
characters or a literal dash."

Greedy vs lazy quantifiers
--------------------------

The quantifiers ``*``, ``+``, ``?``, and ``{m,n}`` are *greedy* by
default -- they match as many characters as the rest of the pattern
will still allow. Often that's exactly what's wanted; sometimes it
isn't::

    >>> re.search(r'<(.+)>', 'a <b> <c> d').group(1)
    'b> <c'

The greedy ``.+`` grabbed all the way to the last ``>``. Appending
``?`` makes the quantifier *lazy* -- it matches as little as
possible::

    >>> re.search(r'<(.+?)>', 'a <b> <c> d').group(1)
    'b'

The lazy form stops at the first ``>``. Lazy quantifiers come up
constantly when extracting balanced delimiters from a string.

Backreferences in substitution
------------------------------

:func:`re.sub` can refer back to captured groups in the replacement
string via ``\1``, ``\2``, ... The substitution rewrites every match
using the captured pieces::

    >>> re.sub(r'(\d+)\.(\d+)', r'\2.\1', 'swap 12.34 and 5.6')
    'swap 34.12 and 6.5'

Each match captures two numbers, and the replacement swaps them.
``\g<1>`` is an alternative syntax for the same thing -- useful when
the next character in the replacement is a digit (``r'\g<1>0'`` to
append a literal zero to group 1 rather than reading "group 10").

What's not available
--------------------

A reminder of what the MicroPython :mod:`re` does *not* support, in
case a pattern from CPython lands here and surprises you:

* Lookahead ``(?=...)`` and lookbehind ``(?<=...)`` -- not
  implemented.
* Named groups ``(?P<name>...)`` and named backreferences
  ``(?P=name)`` -- not implemented.
* Flag constants like ``re.IGNORECASE``, ``re.MULTILINE``,
  ``re.DOTALL`` -- not honored. Build the case-insensitive set or
  pre-split the input yourself.
* The :meth:`match.groups`, :meth:`match.span`, :meth:`match.start`,
  and :meth:`match.end` methods are gated on a ROM level that no
  shipped OpenMV board enables. Code that relies on them won't run on
  the cam.

With patterns, groups, and anchors, the regex toolset on the cam is
small enough to learn in one sitting and rich enough to do everything
short of context-sensitive parsing.
