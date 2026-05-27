:orphan:

Time and timing
===============

The :mod:`time` module groups together functions for sleeping
(pausing the script for a known duration) and for measuring how
long something takes. MicroPython adds millisecond and microsecond
variants of both kinds of function for cases where the
desktop-Python defaults are too coarse.

Sleeping
--------

Three sleep functions block the script for the requested
duration:

* :func:`time.sleep(s) <time.sleep>` -- pause for ``s`` seconds.
  Accepts a float, so ``time.sleep(0.5)`` waits half a second.
* :func:`time.sleep_ms(ms) <time.sleep_ms>` -- pause for ``ms``
  milliseconds. Argument must be an integer.
* :func:`time.sleep_us(us) <time.sleep_us>` -- pause for ``us``
  microseconds.

::

    import time

    print("now")
    time.sleep_ms(500)
    print("half a second later")

Use :func:`time.sleep_ms` for typical "wait a bit" needs and
:func:`time.sleep_us` only when the timing must be tight. Plain
:func:`time.sleep` is also fine, but the integer-argument variants
avoid floating-point conversion and read more naturally for short
intervals.

Reading the clock
-----------------

To measure how long a piece of code takes, read the clock before
and after:

* :func:`time.ticks_ms` -- the current tick value in milliseconds.
* :func:`time.ticks_us` -- the same in microseconds.

::

    import time

    start = time.ticks_ms()
    do_work()
    elapsed = time.ticks_ms() - start
    print("took", elapsed, "ms")

This works *most* of the time. The tick counter rolls over (wraps
back to zero) after a large but finite number of ticks, and naive
subtraction across that wrap produces a wildly wrong negative or
positive number.

.. figure:: ../figures/ticks-wraparound.svg
   :alt: Number line from 0 to MAX with a start tick near MAX and
         an end tick near 0; a dashed wrap-around arrow shows that
         after MAX the counter returns to 0.

   The tick counter wraps back to zero when it reaches the
   integer limit. A plain subtraction across that wrap is wrong.

ticks_diff
----------

To get the elapsed ticks correctly, even across a wrap, use
:func:`time.ticks_diff`:

::

    import time

    start = time.ticks_ms()
    do_work()
    elapsed = time.ticks_diff(time.ticks_ms(), start)
    print("took", elapsed, "ms")

The argument order is ``ticks_diff(later, earlier)`` -- the
expression reads "how far is *later* after *earlier*". The result
is a signed integer; positive means ``later`` is in fact later,
negative means it is in the past. The function handles the wrap
internally.

.. tip::

   Always pair :func:`time.ticks_ms` / :func:`time.ticks_us` with
   :func:`time.ticks_diff`. The raw subtraction is correct *most*
   of the time, and the time it is wrong is when a script has
   been running for a long time -- usually the worst time to
   debug a timing glitch.
