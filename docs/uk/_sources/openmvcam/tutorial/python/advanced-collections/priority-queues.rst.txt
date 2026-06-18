Priority queues
===============

A priority queue is a container that always knows which of its items
is the smallest (or the largest) without sorting the whole thing.
:mod:`heapq` implements one in MicroPython using a plain :class:`list`
as the storage and a tree-based algorithm called a *min-heap* to keep
the smallest item at index 0.

The mental model
----------------

A min-heap is a list arranged so that the item at every index is
less-than-or-equal-to the items at indices ``2*i + 1`` and
``2*i + 2``. That arrangement makes three operations cheap:

* Finding the smallest item -- it's at ``heap[0]``. A single index
  lookup, no scan.
* Adding an item -- it bubbles up through the tree, comparing against
  one parent per level. A thousand items is about ten comparisons; a
  million is about twenty.
* Removing the smallest item -- the same walk in reverse, with the
  same handful of comparisons.

The list is *not* sorted. Iterating over it gives the items in
arbitrary order. Only ``heap[0]`` is guaranteed to be the minimum.

The three functions on MicroPython
----------------------------------

MicroPython's :mod:`heapq` exposes exactly three functions:

* :func:`heapq.heappush` -- insert an item, keeping the heap
  invariant intact.
* :func:`heapq.heappop` -- remove and return the smallest item.
* :func:`heapq.heapify` -- rearrange an existing list into a heap
  in place.

That's the full surface. CPython's ``heappushpop``, ``heapreplace``,
``nlargest``, ``nsmallest``, and ``merge`` do *not* exist; the
patterns below show how to build the common ones by hand.

Starting fresh::

    >>> import heapq
    >>> heap = []
    >>> heapq.heappush(heap, 5)
    >>> heapq.heappush(heap, 1)
    >>> heapq.heappush(heap, 3)
    >>> heap
    [1, 5, 3]
    >>> heapq.heappop(heap)
    1
    >>> heapq.heappop(heap)
    3
    >>> heapq.heappop(heap)
    5

Starting from existing data::

    >>> samples = [5, 1, 3, 2, 4]
    >>> heapq.heapify(samples)
    >>> samples
    [1, 2, 3, 5, 4]
    >>> heapq.heappop(samples)
    1

Heapifying touches each item once and is noticeably faster than
pushing the same items one at a time.

Top-N over a stream
-------------------

A natural use of a priority queue: track the *N* largest items in a
stream you can only read once.

The trick is to keep a min-heap of size *N*. Every new value gets
pushed; if the heap grows past *N*, drop the smallest. The smallest
is always at ``heap[0]``, so a single comparison decides whether to
keep or discard each incoming item::

    def top_n_brightest(readings, n):
        heap = []
        for r in readings:
            if len(heap) < n:
                heapq.heappush(heap, r)
            elif r > heap[0]:
                heapq.heappop(heap)
                heapq.heappush(heap, r)
        return sorted(heap, reverse=True)

The heap never grows past *N*, so each incoming value costs the same
handful of comparisons no matter how long the stream is. The final
``sorted`` is the only step whose cost depends on *N* directly.

Scheduled events
----------------

A priority queue of ``(deadline, payload)`` tuples is the standard
form for an event scheduler. Tuples compare lexicographically, so
the tuple with the smallest deadline floats to the top automatically::

    import heapq
    import time

    queue = []
    heapq.heappush(queue, (time.time() + 5, 'check sensors'))
    heapq.heappush(queue, (time.time() + 1, 'blink LED'))
    heapq.heappush(queue, (time.time() + 3, 'send heartbeat'))

    while queue:
        deadline, task = queue[0]
        now = time.time()
        if now < deadline:
            time.sleep(deadline - now)
        heapq.heappop(queue)
        run(task)

If two events share a deadline, the tuple comparison falls through to
the second element. For payloads that aren't naturally comparable,
add a counter as the second element of the tuple to force a stable
ordering::

    counter = 0
    def schedule(deadline, task):
        global counter
        counter += 1
        heapq.heappush(queue, (deadline, counter, task))

Now the smallest-deadline-first behaviour is intact, ties break on
the counter so earlier-scheduled tasks run first, and ``task`` doesn't
have to be comparable.

What ``heapq`` does not give you
--------------------------------

A few patterns that look like they should work, but don't:

* Iterating ``for x in heap`` does *not* give sorted output -- the
  list's underlying order is the heap's tree layout. To consume the
  heap in order, ``heappop`` until empty.
* There's no way to *change* the priority of an item already in the
  heap. The standard workaround is to push the new priority as a
  fresh entry and mark the old one as cancelled (skip it when it
  pops).
* The heap stores references to its items, not copies. Mutating an
  item after it's pushed can break the heap invariant. Use immutable
  values (numbers, tuples) as the comparison key.

A min-heap on a plain list is the right tool for any "what's the
smallest" or "what's the most urgent" question on a small embedded
device. Three functions, one list, and the heap takes care of the
rest.
