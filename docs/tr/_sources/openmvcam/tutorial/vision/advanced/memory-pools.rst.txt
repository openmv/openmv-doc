Memory pools
============

A camera that holds three full-resolution frames in a
framebuffer pool, runs a separate preview buffer alongside,
and still has room for a Python script and its objects is
juggling more memory than a single block of RAM on the MCU
could provide. MicroPython fits everything in by spreading
it across the **several distinct kinds of memory** the MCU
provides, and by routing each kind of allocation to the
kind of memory it actually needs.

Kinds of memory
---------------

A modern OpenMV Cam MCU exposes four distinct kinds of
memory. The first is invisible to the application; the other
three are pools that allocations can come from.

* **The CPU's data cache** -- a small, very fast region of
  memory that sits between the CPU and the rest of RAM.
  When the CPU reads or writes a value from main memory the
  cache automatically keeps a copy, so repeated accesses to
  the same data stay in the cache and never pay the cost of
  going out to slower memory. The cache is *not* a pool
  allocations come from. It is transparent to the
  application -- it just makes the rest of RAM feel faster
  in practice than its raw latency would suggest, up to the
  point where a working set stops fitting in it.
* **Tightly-coupled processor memory** -- a small block of
  RAM wired directly to the CPU with no bus in between.
  Single-cycle access, never misses, never waits.
  Allocations that genuinely need the fastest possible
  memory -- where every cycle of latency matters -- come
  out of this pool.
* **Fast on-chip memory** -- a few hundred kilobytes up to
  about a megabyte of RAM, built into the MCU package. Low
  latency, high bandwidth, but limited in size. The
  MicroPython heap lives here so Python object accesses stay
  quick; smaller working buffers that the CPU touches a lot
  share the pool.
* **Slower bulk memory** -- on boards that pair the MCU with
  an external memory die, tens of megabytes of off-chip
  RAM reached over the external bus. Much larger, but each
  access takes longer than on-chip memory; the data cache
  hides much of that cost for working sets it can hold, and
  the gap shows up on operations that sweep across data
  too big to cache. Used for allocations that have to be
  large and that the CPU can tolerate at slower speed --
  most importantly, the framebuffer pool.

Boards in the family fall on a spectrum: some have only
on-chip RAM; some pair on-chip RAM with a much larger
external block. Each of the three allocatable kinds is
treated as a **memory pool** -- a chunk that allocations
come out of -- and labelled so each request can ask for the
kind of memory it actually needs.

The primary framebuffer
-----------------------

The framebuffer that backs :meth:`~csi.CSI.snapshot` does
not ask for fast memory. It asks for *enough* memory --
nothing more. That puts it in whichever pool is largest, so
on a board with both on-chip and external memory the
framebuffer lands in the external block.

A full-resolution, triple-buffered framebuffer is far too
big to fit in the fast on-chip pool on most parts; the
larger pool is the only one that can hold it at all. The
CPU's data cache hides much of the per-access cost when the
application processes the image, and the DMA engine that
fills the framebuffer from the sensor keeps up with the
sensor's data rate either way.

The exact size the framebuffer takes is picked from the
current :meth:`~csi.CSI.pixformat`,
:meth:`~csi.CSI.framesize`, and
:meth:`~csi.CSI.framebuffers` count; it grows or shrinks
each time any of those changes.

Secondary sensor framebuffers
-----------------------------

A second :class:`~csi.CSI` instance gets its own
framebuffer, allocated from the same pool the primary uses.
The pool is shared; the buffers are independent. The
secondary's footprint is normally much smaller than the
primary's, because secondary sensors run at lower
resolutions, so the extra memory the second framebuffer
takes is a small fraction of the primary's.

The stream framebuffer
----------------------

The :doc:`image preview <../csi/ide-preview>` buffer is the
exception. It is not allocated from any of the pools at
runtime; it is a *fixed region* reserved at build time,
with a known address and a known size. That keeps the
preview path out of the way of every other allocation --
the region exists from boot and never moves.

The MicroPython heap
--------------------

Python objects -- variables, lists, dictionaries, class
instances, the :class:`~image.Image` wrapper an
:meth:`~csi.CSI.snapshot` call returns, every string and
tuple the application creates -- live on the **MicroPython
garbage-collected heap**, which is *separate* from the
camera's memory pools. The garbage-collected (GC) heap is
a region of memory MicroPython manages itself: Python code
allocates from it implicitly every time an object is
created, and MicroPython periodically scans the heap and
reclaims the space taken by objects the application is no
longer referencing, so the application never has to free
anything by hand.

A dedicated region is set aside for the GC heap at boot,
typically placed in fast on-chip memory so Python access
stays quick, with an optional overflow into the larger
external block on boards that need more headroom for big
data structures.

The :class:`~image.Image` returned by
:meth:`~csi.CSI.snapshot` is a small wrapper object on the
GC heap; the underlying pixel data lives in the framebuffer
in one of the camera's pools. The two never compete for the
same memory.

Putting it together
-------------------

Steering each kind of allocation to the right pool -- big
buffers to the larger pool where they fit, latency-sensitive
data to the faster pools, the Python heap to its own region,
the preview to its reserved slot -- is what makes it
possible to run a full-resolution capture pipeline, a
preview channel, and a non-trivial Python script alongside
each other on parts that have only a few megabytes of fast
memory total.
