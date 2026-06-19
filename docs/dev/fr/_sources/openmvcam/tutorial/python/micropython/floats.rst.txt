Working with floats
===================

Floating-point numbers look like ordinary decimals, but a few
of their behaviours surprise readers who haven't run into them
before -- and one of those behaviours is more pronounced on
MicroPython than on desktop Python. This page covers what to
expect and how to write float code that does not silently
misbehave.

Precision
---------

Python's :class:`float` is an IEEE 754 binary floating-point
number. On most MicroPython builds it is *single precision*
(32-bit), where desktop CPython uses *double precision*
(64-bit). Single precision carries about seven decimal digits
of accuracy; double carries about fifteen.

::

    >>> 0.1 + 0.2
    0.3000000

    >>> 1.0 / 3.0
    0.3333333

    >>> 1e30 * 1e30
    inf

The representable range is also narrower at both ends: numbers
larger than about ``3.4e38`` in magnitude overflow to ``inf``,
and numbers smaller than about ``1.2e-38`` round to zero.

Comparing floats
----------------

The most common gotcha is testing for equality with ``==``:

::

    >>> 0.1 + 0.2 == 0.3
    False

Both expressions look like they should be equal, but the result
of ``0.1 + 0.2`` is the closest representable value, which is
not exactly ``0.3``. Use a *tolerance check* instead -- ask
whether two floats are close enough rather than identical:

::

    if abs(a - b) < 1e-6:
        # close enough
        ...

The choice of tolerance depends on the scale of the values. A
fixed ``1e-6`` works well when the numbers are around order
of 1; a *relative* tolerance is better when the values vary by
orders of magnitude.

:func:`math.isclose` handles both at once:

::

    from math import isclose

    isclose(0.1 + 0.2, 0.3)         # True
    isclose(1.0e6 + 1, 1.0e6)       # True (within default tolerance)

The two keyword arguments control which kind of "close" counts:

* ``rel_tol`` -- *relative* tolerance, default ``1e-9``. Two
  values match if their difference is within this fraction of
  the larger one. Good for general comparisons across any
  scale.
* ``abs_tol`` -- *absolute* tolerance, default ``0``. Two
  values match if their difference is within this fixed amount.

:func:`math.isclose` returns :data:`True` if either tolerance
is met. The defaults are fine for most pairs of nonzero
numbers; the trap is when one of the values can be exactly
zero. The relative-tolerance check works out to "difference ≤
``rel_tol`` × biggest value", and the biggest value is zero, so
the check always fails:

::

    >>> isclose(0.0, 1e-12)
    False

The absolute-tolerance check has no such problem -- pass an
``abs_tol`` whenever zero is a value you might be comparing
against:

::

    >>> isclose(0.0, 1e-12, abs_tol=1e-9)
    True

Accumulation drift
------------------

Long sums of floats lose precision faster on MicroPython than
on CPython, because every intermediate result is rounded back
to 32-bit precision:

::

    total = 0.0
    for _ in range(1000000):
        total += 0.1

    print(total)        # noticeably off from 100000.0

For repeated additions where accuracy matters, two patterns
help:

* **Accumulate into an integer** whenever the values can be
  scaled to integers -- work in milliseconds instead of
  seconds, or millivolts instead of volts, then convert once at
  the end.
* **Compute in smaller batches** and sum the batch results, so
  each addition is between values of similar magnitude.

The integer side has no such limit -- MicroPython integers are
arbitrary precision, just like CPython's. Where you have the
choice, prefer integer arithmetic for anything where the
precision loss would compound.
