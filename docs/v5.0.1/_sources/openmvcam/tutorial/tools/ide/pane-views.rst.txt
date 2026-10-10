The pane views
==============

The pane below the frame buffer viewer shows more than
the histogram. A selector at the left of its title bar
switches it between five views, each a different
instrument pointed at the connected camera:

* *Histogram* -- the pixel statistics of the current
  frame, covered on :doc:`its own page <histogram>`.
* *Board Info* -- what the connected camera is.
* *Memory* -- how much of its RAM the script is using,
  live.
* *Channels* -- the values and controls the script
  publishes, covered on :doc:`its own page <channels>`.
* *Statistics* -- what the link between the IDE and
  the camera is doing.

The selection is remembered across sessions. Only the
view that is showing does any work: switch away from
the histogram and its computation stops until you
switch back, so leaving the pane on Memory or Channels
costs the preview nothing. Each view explains itself
when it cannot show anything -- no camera connected, or
a camera whose firmware does not report the data -- and
the Board Info, Memory, and Statistics views need a
camera running the v2 debug protocol (firmware 5.0.0 or
newer).

Board Info
----------

Board Info is the camera's identity card: the board
type and attached sensor, the serial port, the firmware,
protocol, and bootloader versions, the CPU and device
ids, the USB vendor and product ids, the sizes of the
stream buffer, frame buffer, flash, and RAM, and a row
of yes / no capabilities -- GPU, NPU, ISP, video
encoder, JPEG codec, DRAM, CRC, performance counters,
profiler support, Wi-Fi, Bluetooth, SD card, Ethernet,
high-speed USB, and multiple cores. It is the first
place to look when a support question starts with
"which board is this exactly", and the text is
selectable, so you can copy the lot into a bug report.

.. figure:: figures/pane-board-info.png
   :class: framed
   :alt: The Board Info view listing an OpenMV N6 with a Lepton sensor: board, sensor, port, firmware, protocol and bootloader versions, CPU and device ids, USB id, buffer sizes, and the yes / no capability rows

   Board Info for an OpenMV N6 with a thermal sensor.

Memory
------

Memory plots the camera's memory use while a script
runs: one graph for the MicroPython garbage-collected
heap and one for each of the firmware's memory pools,
each with its used / total, free, and peak figures
underneath and a line marking the highest use seen
since connect. The graphs scroll with time, so the
heap's normal sawtooth -- allocations climbing until
the garbage collector runs -- is obvious at a glance, a
slow leak shows up as a staircase, and a frame-sized
allocation as a spike on every loop. The pools also
report *Persist*, the memory held by long-lived
allocations such as frame buffers, as distinct from
what the script churns through.

.. figure:: figures/pane-memory.png
   :class: framed
   :alt: The Memory view with the GC heap graph showing a sawtooth of allocations and collections, and a memory pool graph below, each with used / total, free, persist, and peak figures

   The Memory view: the heap's sawtooth and a memory
   pool, with their figures.

Statistics
----------

Statistics is the dashboard for the debug protocol
itself. The *Device* and *Host* sections count the
packets sent and received on each side, checksum and
sequence errors, retransmits, and transport errors,
and the *Channels* table between them lists every
channel the camera has registered with its event count
and event rate. It is the diagnostic view for a
connection that misbehaves: a stream that stalls, a
camera that drops frames over a long cable, or a
script publishing so fast the link cannot keep up --
the counters show which side is losing and how badly.

.. figure:: figures/pane-statistics.png
   :class: framed
   :alt: The Statistics view with the device counters, the per-channel event table, and the host counters stacked in the pane

   The Statistics view: protocol counters for each side
   and per-channel event rates.
