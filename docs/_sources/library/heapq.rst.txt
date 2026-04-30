:mod:`heapq` -- heap queue algorithm
====================================

.. module:: heapq
   :synopsis: heap queue algorithm

This module implements the
`min heap queue algorithm <https://en.wikipedia.org/wiki/Heap_%28data_structure%29>`_.

A heap queue is essentially a list that has its elements stored in such a way
that the first item of the list is always the smallest.  Insertion and
removal of the minimum value are O(log n) operations, making heaps a
convenient priority-queue implementation built on a plain list.

Functions
---------

.. function:: heappush(heap: list, item: Any) -> None

   Push the ``item`` onto the ``heap``.

.. function:: heappop(heap: list) -> Any

   Pop the first item from the ``heap``, and return it.  Raise ``IndexError`` if
   ``heap`` is empty.

   The returned item will be the smallest item in the ``heap``.

.. function:: heapify(x: list) -> None

   Convert the list ``x`` into a heap.  This is an in-place operation.
