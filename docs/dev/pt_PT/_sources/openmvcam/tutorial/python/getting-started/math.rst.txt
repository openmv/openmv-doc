Math operations
===============

Python works as a calculator out of the box. This page covers the
operators you will use most often: arithmetic on numbers,
comparisons that produce booleans, logical operators that combine
conditions, and bitwise operators for hardware-level work.

Arithmetic
----------

The standard arithmetic operators on :class:`int` and
:class:`float` values:

* ``+`` -- addition
* ``-`` -- subtraction (or negation, as a prefix: ``-x``)
* ``*`` -- multiplication
* ``/`` -- division. **Always** returns a :class:`float`, even when
  both operands are integers.
* ``//`` -- floor division. Returns the integer quotient rounded
  toward minus-infinity.
* ``%`` -- modulo (remainder).
* ``**`` -- exponentiation (``2 ** 10`` is 1024).

::

    >>> 7 / 2
    3.5
    >>> 7 // 2
    3
    >>> -7 // 2
    -4
    >>> 7 % 2
    1
    >>> 2 ** 16
    65536

Mixed-type arithmetic promotes integers to floats automatically:

::

    >>> 3 + 0.5
    3.5

Augmented assignment combines the operator with ``=`` for a
compact in-place update:

::

    counter = 0
    counter += 1                # equivalent to counter = counter + 1
    counter *= 2                # works for *= /= //= %= **= too

Operator precedence follows the conventional order: ``**`` first,
then unary ``-``, then ``*``, ``/``, ``//``, and ``%``, then
``+`` and ``-``. Use parentheses when you are unsure -- they cost
nothing at runtime.

Comparison
----------

Comparison operators return a :class:`bool` (``True`` or ``False``):

* ``==`` and ``!=`` -- equal / not equal.
* ``<``, ``<=``, ``>``, ``>=`` -- ordering.

::

    >>> 3 == 3
    True
    >>> 3 == 3.0
    True
    >>> 3 < 5 <= 5
    True

The last example is a *chained* comparison and is exactly
equivalent to ``3 < 5 and 5 <= 5``.

.. warning::

   ``=`` assigns; ``==`` compares. The expression
   ``if x = 5:`` is a syntax error precisely because Python
   refuses to silently confuse the two.

Boolean logic
-------------

Three operators combine booleans:

* ``and`` -- ``True`` only when both sides are true.
* ``or`` -- ``True`` when either side is true.
* ``not`` -- inverts a single boolean.

``and`` and ``or`` *short-circuit*: they stop evaluating as soon
as the result is known. ``False and slow_check()`` never calls
``slow_check``.

``and`` and ``or`` also return one of their operands rather than a
literal ``True`` or ``False``, which lets you write defaults
compactly:

::

    name = user_name or "anonymous"   # "" / 0 / None are falsy

Bitwise operators
-----------------

For hardware work -- packing register fields, masking bits,
parsing protocol headers -- you will reach for the bitwise
operators. They act on the binary representation of an
:class:`int`:

* ``&`` -- bitwise AND
* ``|`` -- bitwise OR
* ``^`` -- bitwise XOR
* ``~`` -- bitwise NOT (one's complement)
* ``<<`` -- left shift
* ``>>`` -- right shift

The hex and binary literal forms are convenient when reading and
writing these:

::

    >>> 0b1100 & 0b1010
    8                              # 0b1000
    >>> 0b1100 | 0b1010
    14                             # 0b1110
    >>> 0xFF ^ 0x0F
    240                            # 0xF0
    >>> 1 << 8
    256
    >>> (0xABCD >> 8) & 0xFF
    171                            # extract the high byte

Augmented forms exist for each: ``|=``, ``&=``, ``^=``, ``<<=``,
``>>=``.

.. note::

   ``and`` / ``or`` operate on booleans (or on truthiness); ``&``
   / ``|`` operate on bits. Do not mix them up. ``0b1100 and 0b1010``
   evaluates to ``0b1010`` because both operands are truthy --
   not what you usually want when manipulating bits.

Useful number built-ins
-----------------------

A handful of built-in functions cover common numeric operations
that the operators alone do not:

* :func:`round` -- nearest integer, or nearest ``ndigits``
  decimal places when a second argument is given. Returns an
  :class:`int` for ``round(x)``, a :class:`float` for
  ``round(x, n)``. Ties (``0.5``, ``1.5``, ...) round to the
  nearest even number, not always up.
* :func:`divmod` -- returns ``(quotient, remainder)`` in one
  call. Handy for splitting one quantity into units (seconds
  into minutes-and-seconds, bytes into pages-and-offsets).
* :func:`pow` -- the same as ``**`` in the two-argument form.
  The three-argument form ``pow(base, exp, mod)`` computes
  ``(base ** exp) % mod`` without ever materialising the giant
  intermediate value, which is the only practical way to do
  modular exponentiation for large exponents.

::

    >>> round(3.7)
    4
    >>> round(3.14159, 2)
    3.14
    >>> round(0.5)               # ties go to even, not always up
    0
    >>> round(1.5)
    2

    >>> divmod(125, 60)          # 125 seconds = 2 min, 5 sec
    (2, 5)
    >>> minutes, seconds = divmod(125, 60)

    >>> pow(3, 4)                # same as 3 ** 4
    81
    >>> pow(3, 100, 7)           # (3 ** 100) mod 7, efficient
    4

Integer-to-string base conversions (``bin``, ``oct``, ``hex``)
are covered in :doc:`String methods and formatting
<../text/formatting>`.

The math module
---------------

Common mathematical functions live in the :mod:`math` module. Import
it once and call its functions through a dotted name:

::

    import math

    print(math.sqrt(2))              # 1.4142135
    print(math.sin(math.pi / 2))     # 1.0
    print(math.floor(3.7))           # 3
    print(math.log(100, 10))         # 2.0

The MicroPython :mod:`math` module covers the usual suspects
(``sqrt``, ``exp``, ``log``, ``sin``, ``cos``, ``tan``, ``atan2``,
``floor``, ``ceil``, ``pi``, ``e``, ...). For random numbers, see
the :mod:`random` module; for fixed-point bit twiddling, the
operators above are usually enough.

Complex numbers
---------------

For numerical work that needs imaginary components, Python has
a :class:`complex` type with ``j``-suffix literals (``1 + 2j``).
The :mod:`cmath` module mirrors :mod:`math` for complex inputs.
Both are present on most MicroPython builds but rarely needed
for camera work; mention them mainly so they aren't a surprise
if you port code that uses them.
