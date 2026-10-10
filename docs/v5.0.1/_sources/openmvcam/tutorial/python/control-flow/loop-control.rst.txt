Loop control
============

Two keywords change how a loop runs:

* ``break`` -- exit the loop immediately.
* ``continue`` -- skip the rest of the current iteration and
  start the next.

Both apply to the *innermost* loop they appear inside.

break
-----

Use ``break`` to stop a loop as soon as a condition is met. The
classic "search and stop" pattern:

::

    found = None
    for item in items:
        if matches(item):
            found = item
            break

    if found is not None:
        print("found:", found)

In a ``while True:`` loop, ``break`` is how the loop ends:

::

    while True:
        line = next_line()
        if line == "quit":
            break
        process(line)

continue
--------

Use ``continue`` to skip the rest of the body and jump to the
next iteration. Handy for filtering items inside a loop:

::

    for n in numbers:
        if n < 0:
            continue            # skip negatives
        print(n)

The same effect can be written as an ``if`` block around the
rest of the body. ``continue`` is sometimes clearer when the
skip condition is easier to state up front than the keep
condition is.

Inside a loop, ``continue`` plays the same role as an early
``return`` in a function: skip past the cases you do not handle
and keep the main work flat at the outer indent. The
filter-and-process loop is the canonical shape:

::

    for item in items:
        if item is None:
            continue
        if not item.is_valid():
            continue
        process(item)

The indented ``process(item)`` line is the actual work; each
guard above spells out exactly which items get skipped.

else on a loop
--------------

Both ``for`` and ``while`` accept an optional ``else`` block. It
runs when the loop completes *without* hitting a ``break``. The
most common use is a search loop that wants a fallback if
nothing was found:

::

    for item in items:
        if matches(item):
            print("found:", item)
            break
    else:
        print("no match")

If a ``break`` fires, the ``else`` block is skipped. Read the
construct as "for X in Y: ...; or-else, if we never broke out, do
Z."

Common loop patterns
--------------------

A few patterns turn up often in real scripts:

* **Polling** -- wait for some condition to become true before
  moving on. The body uses ``pass``, Python's no-op statement;
  every indented block must contain at least one statement, and
  ``pass`` is how to say "do nothing here":

  ::

      while not ready():
          pass
      proceed()

* **State machine** -- a single ``while True:`` loop that picks
  what to do based on a state variable. Useful when the work
  splits cleanly into a few named phases:

  ::

      state = "header"
      for line in lines:
          if state == "header":
              if line.startswith("---"):
                  state = "body"
          elif state == "body":
              print(line)

* **Accumulating** -- build up a result while walking a sequence:

  ::

      total = 0
      for x in samples:
          total += x
      mean = total / len(samples)

  Many accumulation loops have a one-line equivalent using a
  built-in. Reach for the built-in when one applies:

  - :func:`sum` -- adds every item in an iterable.
  - :func:`max` / :func:`min` -- the largest or smallest item.
  - :func:`any` -- ``True`` if at least one item is truthy.
  - :func:`all` -- ``True`` only when every item is truthy.
  - :func:`sorted` -- a new list with the items in order.
  - :func:`len` -- the number of items (where the iterable knows
    its length).

  ::

      >>> samples = [3, 1, 4, 1, 5, 9, 2, 6]
      >>> sum(samples)
      31
      >>> sum(samples) / len(samples)        # mean
      3.875
      >>> max(samples)
      9
      >>> min(samples)
      1
      >>> sorted(samples)
      [1, 1, 2, 3, 4, 5, 6, 9]
      >>> any([False, False, True])
      True
      >>> all([True, True, False])
      False

  The built-in version is shorter, clearer, and usually faster
  than rolling the same loop by hand.
