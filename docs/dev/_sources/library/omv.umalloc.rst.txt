:mod:`umalloc` --- Micro Allocator
==================================

.. module:: umalloc
   :synopsis: Micro Allocator

The ``umalloc`` module provides access to the OpenMV Micro Allocator (UMA),
allowing scripts to initialize, collect, and inspect statistics for the
underlying memory pool.

Example::

    import umalloc
    umalloc.print_stats()

Functions
---------

.. function:: init() -> None

   Initializes the Micro Allocator.

.. function:: collect() -> None

   Runs a collection cycle on the Micro Allocator, releasing memory that is
   no longer in use.

.. function:: stats(index: int = -1) -> tuple[int, int, int, int, int, int, int]

   Returns a 7-tuple of statistics for the allocator pool selected by
   ``index``. When ``index`` is ``-1`` (the default), aggregated statistics
   across all pools are returned.

   The tuple contains:

   * ``used_count`` --- number of currently allocated blocks.
   * ``free_count`` --- number of free blocks.
   * ``persist_count`` --- number of persistent blocks.
   * ``used_bytes`` --- total bytes currently allocated.
   * ``free_bytes`` --- total bytes free.
   * ``persist_bytes`` --- total bytes held by persistent allocations.
   * ``peak_bytes`` --- peak bytes ever allocated.

.. function:: print_stats(index: int = -1) -> None

   Prints allocator statistics for the pool selected by ``index`` to the
   serial terminal. When ``index`` is ``-1`` (the default), statistics for
   all pools are printed.
