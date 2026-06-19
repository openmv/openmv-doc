String methods and formatting
=============================

Strings come with a built-in toolbox of methods for inspection
and reshaping. Because strings are immutable, every method returns
a *new* string -- the original is unchanged.

Inspecting strings
------------------

* :meth:`str.startswith` / :meth:`str.endswith` -- prefix or suffix
  test; returns :class:`bool`.
* :meth:`str.find` -- position of the first occurrence of a
  substring, or ``-1`` if absent. :meth:`str.index` does the same
  thing but raises :exc:`ValueError` on absence.
* :meth:`str.count` -- number of non-overlapping occurrences.
* ``in`` keyword -- ``"MV" in name`` returns ``True`` if the
  substring is anywhere in the string.

::

    >>> name = "OpenMV Cam"
    >>> name.startswith("Open")
    True
    >>> name.find("MV")
    4
    >>> name.count("m")
    1
    >>> "Cam" in name
    True

Cleaning and case
-----------------

* :meth:`str.strip` -- remove leading and trailing whitespace.
  Pass a string of characters to strip a custom set
  (``s.strip("/")``).
* :meth:`str.lower` / :meth:`str.upper` -- case conversion.
* :meth:`str.replace` -- substring substitution.

::

    >>> "  hello  ".strip()
    'hello'
    >>> "abc-123".replace("-", "_")
    'abc_123'
    >>> "OpenMV".lower()
    'openmv'

Splitting and joining
---------------------

* :meth:`str.split` -- break a string into a list at every
  occurrence of a separator (default: any whitespace run).
* :meth:`str.join` -- the inverse: glue a sequence of strings
  together with the receiver as the separator. This is the
  efficient way to build a long string from pieces.

::

    >>> "1,2,3".split(",")
    ['1', '2', '3']
    >>> "hello world".split()
    ['hello', 'world']
    >>> ", ".join(["a", "b", "c"])
    'a, b, c'

f-strings
---------

The simplest way to interpolate values into a string is the
*f-string* -- a string literal prefixed with ``f``. Any expression
inside ``{}`` is evaluated and inserted:

::

    >>> name = "OpenMV"
    >>> count = 42
    >>> f"{name} saw {count} blobs"
    'OpenMV saw 42 blobs'

A colon inside the braces introduces a *format spec* that
controls how the value is rendered:

* ``{x:.2f}`` -- float with 2 digits after the decimal point.
* ``{x:>10}`` -- right-align in a 10-character field.
* ``{x:<10}`` -- left-align.
* ``{x:0>4}`` -- pad with leading zeros to width 4.
* ``{x:#x}`` -- hexadecimal with a ``0x`` prefix.
* ``{x:b}`` -- binary representation.

::

    >>> f"pi is roughly {3.14159:.3f}"
    'pi is roughly 3.142'
    >>> f"reg = {0xAB:#x}"
    'reg = 0xab'
    >>> for i in range(3):
    ...     print(f"line {i:0>3}")
    line 000
    line 001
    line 002

A single ``=`` after the expression name prints both the name and
the value -- handy for quick debug prints:

::

    >>> v = 3.14
    >>> print(f"{v=}")
    v=3.14

Integer base conversions
~~~~~~~~~~~~~~~~~~~~~~~~

Three built-ins do the same job as the ``:b`` / ``:o`` / ``:x``
format specs but return the converted string directly:

* :func:`bin` -- base 2, with a ``"0b"`` prefix.
* :func:`oct` -- base 8, with a ``"0o"`` prefix.
* :func:`hex` -- base 16, with a ``"0x"`` prefix.

::

    >>> hex(255)
    '0xff'
    >>> bin(10)
    '0b1010'
    >>> oct(8)
    '0o10'

The inverse direction -- turning a base-N string back into an
integer -- uses the :class:`int` constructor with an explicit
base:

::

    >>> int("ff", 16)
    255
    >>> int("0b1010", 2)         # the "0b" prefix is allowed
    10

Reach for these when you want the raw string for an int (for a
log line, a config file, a register dump). Reach for the format
spec when you want padding, width, or to mix the value with
other text in the same f-string.

Older formatting styles
-----------------------

f-strings are the recommended style, but two older approaches
still work and turn up in existing code:

:meth:`str.format` -- braces with positional or keyword arguments
passed to the ``.format()`` method on a template string:

::

    >>> "Hello, {}".format(name)
    'Hello, OpenMV'
    >>> "{0} + {0} = {1}".format(2, 4)
    '2 + 2 = 4'
    >>> "{name}: {value}".format(name="frames", value=42)
    'frames: 42'

Format specs (``{:.2f}``, ``{:>10}``, ...) work the same as in
f-strings; the only difference is *where* the value is supplied.

``%`` formatting (printf-style) -- a single ``%`` operator
substitutes values into format codes, one value per code. Pass
multiple values as a tuple:

::

    >>> "Hello, %s" % name
    'Hello, OpenMV'
    >>> "%d + %d = %d" % (2, 2, 4)
    '2 + 2 = 4'
    >>> "%.2f" % 3.14159
    '3.14'

The most common type codes are ``%s`` (string), ``%d`` (integer),
``%f`` (float), and ``%x`` (hex).

Each ``%`` code can carry modifiers between the ``%`` and the
type letter. The full shape is ``%[flags][width][.precision]type``:

* **width** -- minimum number of characters the field must take.
  Shorter values are padded with spaces; longer values overflow.
  ``%10d`` reserves 10 characters and right-aligns the number.
* **precision** -- meaning depends on the type. For floats, the
  number of digits after the decimal point. ``%.2f`` gives two
  decimal places. For strings, the maximum number of characters
  to take (``%.5s`` truncates to five).
* **Left-align** -- the ``-`` flag puts the field on the left.
  ``%-10d`` puts the digits on the left side with trailing spaces.
* **Zero pad** -- the ``0`` flag pads with leading zeros instead
  of spaces (for numeric types). ``%05d`` zero-pads to five digits.
* **Sign** -- the ``+`` flag always shows the sign on numbers,
  including a ``+`` for positives.
* **Alternate form** -- the ``#`` flag. For ``%x`` this prefixes
  the output with ``0x``; for ``%o`` it prefixes ``0o``.

Flags, width, and precision can be combined:

::

    >>> "%10d" % 42
    '        42'                 # width 10, space-padded, right-aligned
    >>> "%-10d|" % 42
    '42        |'                # width 10, left-aligned
    >>> "%05d" % 42
    '00042'                      # width 5, zero-padded
    >>> "%8.2f" % 3.14159
    '    3.14'                   # width 8, 2 decimal places
    >>> "%08.2f" % 3.14159
    '00003.14'                   # width 8, zero-padded
    >>> "%+d" % 42
    '+42'                        # explicit sign
    >>> "%#06x" % 0xAB
    '0x00ab'                     # 0x prefix, zero-pad to 6 chars total

Both older styles are slower to read and more error-prone than
f-strings -- reach for f-strings in new code, and recognise the
older forms when reading existing code.
