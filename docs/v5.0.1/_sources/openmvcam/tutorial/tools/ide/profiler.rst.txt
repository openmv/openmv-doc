The code profiler
=================

Window → Show Code Profiler opens a function-level
profiler for the firmware running on the connected
camera: which C functions ran, how often, and where the
microseconds went, streamed live while a script
executes. It answers the question the FPS counter
raises -- *why* is this pipeline slow -- at the level
of the camera's own code.

Profiling support is compiled into the firmware, not
always present: the camera must be running a firmware
built with ``PROFILE_ENABLE=1``, and the menu entry
stays disabled otherwise. Building such a firmware is
part of the custom-build workflow covered in
:doc:`../../production/firmware/building`.

.. figure:: figures/profiler.png
   :class: framed
   :alt: The Code Profiler window: the function table populated with call counts, timing columns, percentages, and two hardware event counter columns, with the Flat/Tree and Inclusive/Exclusive controls on top and the totals line at the bottom

   The profiler watching a script run: per-function
   calls, timing, and percentage of total time, with
   two hardware event counters in the rightmost
   columns and the totals line underneath.

The window is a sortable table of functions with their
call counts, minimum, maximum, total, and average
microseconds, average cycles, and percentage of total
time, with a totals line underneath and a filter box
for finding functions by name. Function names come from
the firmware's ELF file -- point the window's firmware
path field at the ``.elf`` produced by the build, and
addresses resolve to names.

Two view controls organize the data. *Flat* ranks every
function independently -- the view for "what is the
single most expensive function." *Tree* nests callees
under callers, showing how time decomposes down the
call chain. Independently, *Inclusive* charges a
function for the time spent in everything it called,
while *Exclusive* counts only the function's own body
-- inclusive finds the expensive subsystem, exclusive
finds the expensive loop. *Reset* zeroes the counters,
which is how you measure one stage of a pipeline in
isolation: reset, let it run, read.

The profiler can also display hardware event counters
-- cache misses, branch mispredictions, and the other
events the processor can count -- alongside the timing
columns; select them in the same window on firmware
built with the support.

.. seealso::

   The ``openmv`` package's CLI can overlay the same
   profiling data on a live stream from the command
   line -- see :doc:`../openmv-py/cli`.
