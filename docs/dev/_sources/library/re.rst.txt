:mod:`re` -- simple regular expressions
=======================================

.. module:: re
   :synopsis: regular expressions

This module implements regular expression operations. Regular expression
syntax supported is a subset of CPython ``re`` module (and actually is
a subset of POSIX extended regular expressions).

Supported operators and special sequences are:

``.``
   Match any character.

``[...]``
   Match set of characters. Individual characters and ranges are supported,
   including negated sets (e.g. ``[^a-c]``).

``^``
   Match the start of the string.

``$``
   Match the end of the string.

``?``
   Match zero or one of the previous sub-pattern.

``*``
   Match zero or more of the previous sub-pattern.

``+``
   Match one or more of the previous sub-pattern.

``??``
   Non-greedy version of ``?``, match zero or one, with the preference
   for zero.

``*?``
   Non-greedy version of ``*``, match zero or more, with the preference
   for the shortest match.

``+?``
   Non-greedy version of ``+``, match one or more, with the preference
   for the shortest match.

``|``
   Match either the left-hand side or the right-hand side sub-patterns of
   this operator.

``(...)``
   Grouping. Each group is capturing (a substring it captures can be accessed
   with `match.group()` method).

``(?:...)``
   Non-capturing grouping. Each group is matched using the same rules as
   regular grouping, but will not be part of the match object.

``\d``
   Matches digit. Equivalent to ``[0-9]``.

``\D``
   Matches non-digit. Equivalent to ``[^0-9]``.

``\s``
   Matches whitespace. Equivalent to ``[ \t-\r]``.

``\S``
   Matches non-whitespace. Equivalent to ``[^ \t-\r]``.

``\w``
   Matches "word characters" (ASCII only). Equivalent to ``[A-Za-z0-9_]``.

``\W``
   Matches non "word characters" (ASCII only). Equivalent to ``[^A-Za-z0-9_]``.

``\``
   Escape character. Any other character following the backslash, except
   for those listed above, is taken literally. For example, ``\*`` is
   equivalent to literal ``*`` (not treated as the ``*`` operator).
   Note that ``\r``, ``\n``, etc. are not handled specially, and will be
   equivalent to literal letters ``r``, ``n``, etc. Due to this, it's
   not recommended to use raw Python strings (``r""``) for regular
   expressions. For example, ``r"\r\n"`` when used as the regular
   expression is equivalent to ``"rn"``. To match CR character followed
   by LF, use ``"\r\n"``.

**NOT SUPPORTED**:

* counted repetitions (``{m,n}``)
* named groups (``(?P<name>...)``)
* more advanced assertions (``\b``, ``\B``)
* special character escapes like ``\r``, ``\n`` - use Python's own escaping
  instead
* etc.

Example::

    import re

    # As re doesn't support escapes itself, use of r"" strings is not
    # recommended.
    regex = re.compile("[\r\n]")

    regex.split("line1\rline2\nline3\r\n")

    # Result:
    # ['line1', 'line2', 'line3', '', '']

Functions
---------

.. function:: compile(regex_str: str, flags: int = 0) -> "regex"

   Compile regular expression, return `regex <regex>` object.

.. function:: match(regex_str: str, string: str) -> "match | None"

   Compile *regex_str* and match against *string*. Match always happens
   from starting position in a string.

.. function:: search(regex_str: str, string: str) -> "match | None"

   Compile *regex_str* and search it in a *string*. Unlike `match`, this will search
   string for first position which matches regex (which still may be
   0 if regex is anchored).

.. function:: sub(regex_str: str, replace: Union[str, Callable], string: str, count: int = 0, flags: int = 0, /) -> str

   Compile *regex_str* and search for it in *string*, replacing all matches
   with *replace*, and returning the new string.

   *replace* can be a string or a function.  If it is a string then escape
   sequences of the form ``\<number>`` and ``\g<number>`` can be used to
   expand to the corresponding group (or an empty string for unmatched groups).
   If *replace* is a function then it must take a single argument (the match)
   and should return a replacement string.

   If *count* is specified and non-zero then substitution will stop after
   this many substitutions are made.  The *flags* argument is ignored.

   Note: availability of this function depends on :term:`MicroPython port`.

.. data:: DEBUG
   :type: int

   Flag value, display debug information about compiled expression.
   (Availability depends on :term:`MicroPython port`.)


.. _regex:

Regex objects
-------------

Compiled regular expression. Instances of this class are created using
`re.compile()`.

.. class:: regex
   :no-index:

   Compiled regular expression object returned by `re.compile()`.

   .. method:: match(string: str, pos: int = 0, endpos: int = ...) -> "match | None"
               search(string: str, pos: int = 0, endpos: int = ...) -> "match | None"
               sub(replace: Union[str, Callable], string: str, count: int = 0, flags: int = 0, /) -> str

      Similar to the module-level functions :meth:`match`, :meth:`search`
      and :meth:`sub`.
      Using methods is (much) more efficient if the same regex is applied to
      multiple strings.

      The optional second parameter *pos* gives an index in the string where the
      search is to start; it defaults to ``0``. This is not completely equivalent
      to slicing the string; the ``'^'`` pattern character matches at the real
      beginning of the string and at positions just after a newline, but not
      necessarily at the index where the search is to start.

      The optional parameter *endpos* limits how far the string will be searched;
      it will be as if the string is *endpos* characters long, so only the
      characters from *pos* to ``endpos - 1`` will be searched for a match.

   .. method:: split(string: str, max_split: int = -1, /) -> List[str]

      Split a *string* using regex. If *max_split* is given, it specifies
      maximum number of splits to perform. Returns list of strings (there
      may be up to *max_split+1* elements if it's specified).

Match objects
-------------

Match objects as returned by `match()` and `search()` methods, and passed
to the replacement function in `sub()`.

.. class:: match
   :no-index:

   Match object returned by `regex.match()`, `regex.search()`, and the
   module-level `match()` and `search()` functions.

   .. method:: group(index: int) -> str

      Return matching (sub)string. *index* is 0 for entire match,
      1 and above for each capturing group. Only numeric groups are supported.

   .. method:: groups() -> Tuple[str, ...]

      Return a tuple containing all the substrings of the groups of the match.

      Note: availability of this method depends on :term:`MicroPython port`.

   .. method:: start(index: int = 0) -> int
               end(index: int = 0) -> int

      Return the index in the original string of the start or end of the
      substring group that was matched.  *index* defaults to the entire
      group, otherwise it will select a group.

      Note: availability of these methods depends on :term:`MicroPython port`.

   .. method:: span(index: int = 0) -> Tuple[int, int]

      Returns the 2-tuple ``(match.start(index), match.end(index))``.

      Note: availability of this method depends on :term:`MicroPython port`.
