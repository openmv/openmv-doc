The ``openmv`` CLI
==================

Installing the package adds an ``openmv`` executable
that opens a pygame viewer connected to a cam over USB.
With no arguments past the serial port it runs a small
built-in test script, streams the resulting frame
buffer back, and displays it scaled and annotated with
the current frame rate::

    openmv --port /dev/ttyACM0

The port path depends on the host platform. On Linux,
``/dev/ttyACMx`` for USB CDC and ``/dev/ttyUSBx`` for a
USB-to-UART bridge. On macOS, ``/dev/tty.usbmodem...``
or ``/dev/cu.usbmodem...``. On Windows, ``COMx``.

The viewer is the quickest way to confirm the package
is installed, the cam is reachable, and the protocol is
working. It is also a useful demo harness during script
development -- swap the built-in test script for any
MicroPython file with ``--script`` and watch the result
without leaving the terminal.

``Esc``, ``Ctrl+C`` in the terminal, or closing the
viewer window all exit cleanly.

Running a custom script
-----------------------

``--script`` points the CLI at a MicroPython source
file on disk. The file is uploaded to the cam, executed
in place of the built-in test script, and any frames it
produces stream back to the viewer::

    openmv --port /dev/ttyACM0 --script my_script.py

Anything the script prints to ``stdout`` is mirrored to
the host terminal in real time. Pass ``--quiet`` to
suppress that, or ``--debug`` for verbose protocol
logging.

Previewing a custom channel
---------------------------

``--channel NAME`` polls a custom data channel
registered by the running cam-side script and prints
the first ten bytes of each update to the terminal::

    openmv --port /dev/ttyACM0 --channel ticks

The built-in test script that runs when no
``--script`` is given registers a ``ticks`` channel
that returns the cam's millisecond uptime, so
``--channel ticks`` demonstrates the bidirectional
channel surface :doc:`custom-channels` covers in
detail -- without writing any code on the host or
cam yourself.

Benchmark mode
--------------

``--bench`` swaps the standard test script for a
JPEG-compression throughput benchmark::

    openmv --port /dev/ttyACM0 --bench

The cam captures one RGB565 QVGA frame, compresses it
to JPEG, and then flushes the same compressed buffer
in a tight loop. The viewer reports the raw USB data
rate rather than a live decoded frame, so the number
on screen is the upper bound the link can sustain to
that host. Useful for comparing cams or hosts without
the variability of changing what is actually being
captured.

Profiling
---------

The CLI can overlay live profiler data on the streamed
frames. The overlay is only useful when the cam is
running a ``PROFILE_ENABLE=1`` firmware build with the
``profile`` channel registered; on stock firmware the
profiling controls have no effect.

* ``--firmware PATH`` -- loads the firmware ELF the
  cam is running so the overlay can resolve function
  addresses in the profile records to human-readable
  names. Without it the overlay shows raw addresses.

Three keyboard shortcuts in the viewer drive the
profiler:

============  ====================================================
Key           Action
============  ====================================================
``P``         Cycle the profiler overlay: off, performance, events.
``M``         Toggle the profiler mode between *inclusive* and
              *exclusive*. Inclusive timing charges callee time to
              the caller; exclusive timing does not.
``R``         Reset the profiler counters.
============  ====================================================

Protocol-tuning flags
---------------------

The flags below mirror the constructor parameters on
:class:`openmv.Camera`. The defaults work on every
shipped cam; override them only when debugging a
custom firmware build or simulating adverse link
conditions.

* ``--baudrate N`` -- defaults to ``921600`` (the
  magic value that switches USB to the OpenMV
  protocol). Override only on UART links.
* ``--timeout SEC`` -- per-operation timeout in
  seconds (default ``1.0``).
* ``--max-retry N`` -- retries before the link is
  declared broken (default ``3``).
* ``--max-payload N`` -- maximum payload size in
  bytes (default ``4096``). The cam negotiates down if
  it cannot handle that much.
* ``--crc BOOL`` -- enable CRC validation on every
  packet (default ``true``).
* ``--seq BOOL`` -- enable sequence-number validation
  (default ``true``).
* ``--ack BOOL`` -- enable per-packet acknowledgement
  (default ``true``).
* ``--events BOOL`` -- enable event notifications from
  the cam (default ``true``).
* ``--drop-rate FLOAT`` -- packet-drop simulation rate
  in ``[0.0, 1.0]`` (default ``0.0``). For testing
  only.

One CLI-specific tuning knob:

* ``--poll MS`` -- poll rate for the viewer's main
  loop, in milliseconds (default ``4``).

Miscellaneous flags
-------------------

Two flags adjust how the viewer presents the stream
without changing the cam-side behaviour:

* ``--scale N`` -- display zoom factor (default ``4``).
  Useful when QVGA frames are too small to read on a
  4K display.
* ``--raw`` -- requests the cam send pixel buffers
  uncompressed instead of JPEG-compressed. Useful on
  cams without hardware JPEG support;
  :doc:`streaming-frames` covers the trade-offs.

What the viewer is doing
------------------------

The CLI is itself a :class:`openmv.Camera` program. It
connects, calls :meth:`~openmv.Camera.stop` to clear
any running script, uploads the script with
:meth:`~openmv.Camera.exec`, enables streaming with
:meth:`~openmv.Camera.streaming`, then loops calling
:meth:`~openmv.Camera.read_frame` (to update the
display), :meth:`~openmv.Camera.read_stdout` (to mirror
the script's prints), and :meth:`~openmv.Camera.read_status`
(to watch every other registered channel for activity).
The source is at `cli.py
<https://github.com/openmv/openmv-python/blob/master/src/openmv/cli.py>`__
and is a working reference for an application driving
a cam end-to-end.
