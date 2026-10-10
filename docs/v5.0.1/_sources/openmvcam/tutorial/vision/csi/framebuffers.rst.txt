Framebuffers
============

Once the camera sensor is initialised it emits frames
continuously at its frame rate -- one new frame every
frame period whether or not the application is ready for
it. Each frame needs somewhere in RAM to land or it is
lost. The framebuffer pool is where those frames live
between leaving the DMA and being processed by user code,
and how many framebuffers the camera keeps in that pool
controls how the DMA and the application share them. The
choice is exposed through :meth:`~csi.CSI.framebuffers`,
and four modes are available, selected by the buffer
count.

Single buffer (count = 1)
-------------------------

One framebuffer in RAM. The DMA fills it; the application
reads from it; the next call to :meth:`~csi.CSI.snapshot`
cannot start until the application has released the
buffer, because the same buffer is needed for both.

The camera and the application run in lock-step. The DMA
has to wait for the application to finish, and the
application has to wait for the DMA to finish, which
means the achievable frame rate is *half* the sensor's
frame rate at best -- every other frame the sensor
emits arrives while the buffer is busy and is lost.

This mode is the smallest in RAM and the slowest in
throughput. Use it only when RAM is too tight to allocate
a second buffer.

Double buffer (count = 2)
-------------------------

Two framebuffers in RAM: one *back* buffer that the DMA
fills, and one *front* buffer that the application reads
from. When the application finishes the front buffer the
two roles swap, and the DMA starts filling the freshly
released buffer while the application reads from the
just-filled one.

As long as the application processes each frame in less
than one camera frame period, the application sees the
sensor's full frame rate -- the DMA's next frame is
already waiting in the back buffer when the application
calls :meth:`~csi.CSI.snapshot` again. The moment the
processing time exceeds one frame period, however, the
rate halves: the camera will produce two frames in the
time the application takes to process one, and only the
second of those two will be delivered.

Past that point the rate degrades smoothly with the
processing time. Every time the DMA finishes a new
back-buffer frame while the application is still working
on the front buffer, the new frame overwrites the
previous capture in place rather than being discarded.
The application always gets the most recent frame the
camera produced on its next :meth:`~csi.CSI.snapshot`,
and the achievable application rate becomes the inverse
of its processing time.

Triple buffer (count = 3)
-------------------------

Three framebuffers in RAM: two *back* buffers that the
DMA cycles through and one *front* buffer the application
is currently working on. This is the default mode the
OpenMV Cam picks when there is enough RAM to spare, with
automatic fall-back to double or single buffer when there
is not.

The third buffer fully decouples the camera frame rate
from the application frame rate. The DMA always has a
buffer to write into; the application always has a buffer
to read from; on each :meth:`~csi.CSI.snapshot` the most
recent ready back buffer becomes the new front buffer and
the previous front buffer is freed for the DMA. The
application's frame rate matches the time it actually
takes to process each frame -- without the 1/2-step that
double buffer falls into when the processing time slips
just past one frame period.

Video FIFO (count = 4 or more)
------------------------------

Four or more framebuffers in RAM, arranged as a ring of
frames captured back-to-back. Every frame the camera
delivers is queued into the FIFO, and
:meth:`~csi.CSI.snapshot` returns the *oldest* queued
frame rather than the most recent one. The application
walks through the captured frames in capture order, in
the time it actually has to spend on each.

This mode is the right choice when every frame matters
and brief processing stalls are expected: writing video
to an SD card whose storage stack can block for tens of
milliseconds during an erase, streaming over USB to a
host that briefly stops reading, or buffering a short
burst of a fast event for inspection in code.

Two policies handle the case where the FIFO fills before
the application has drained it.

* **Drop old frames (default).** When the FIFO fills, all
  queued frames except the active one are discarded so
  the next :meth:`~csi.CSI.snapshot` returns a recent
  frame rather than a stale one. The DMA keeps capturing
  throughout, so the application always sees fresh data
  after a stall. This is the right policy when the goal
  is keeping the captured stream current -- video
  recording, live streaming.
* **Stop capturing on overflow.** Pass ``fflush=False``
  to the :class:`~csi.CSI` constructor and the DMA stops
  filling the FIFO when it is full, leaving the queued
  frames intact. :meth:`~csi.CSI.snapshot` continues to
  return frames in capture order until the application
  has drained them, after which the DMA resumes. This is
  the right policy when the goal is preserving every
  frame of a short burst -- capturing fast motion to
  inspect frame by frame in code afterwards.

See :meth:`csi.CSI.framebuffers` for the full API.

Triggered mode
--------------

An alternative to the always-running modes above is
*triggered* capture, where the sensor emits a frame only
when :meth:`~csi.CSI.snapshot` asks for one. The camera
sits idle between snapshots and starts a fresh exposure
each time the application calls in.

The cost is throughput: a triggered capture cannot
overlap with the previous one, so the maximum achievable
frame rate is half the sensor's normal rate. The benefit
is exposure timing. Snapshot controls exactly when the
exposure begins, which is what an application wants when
the exposure has to line up with an external event -- a
strobe flash, a conveyor-position sensor, a pulse on a
GPIO line -- rather than landing wherever the
free-running sensor's rolling frame happens to be when
the application is ready to read it.

Triggered mode is sensor-specific. On supported sensors
it is enabled by calling
``csi0.ioctl(csi.IOCTL_SET_TRIGGERED_MODE, True)`` and
disabled by passing ``False``.
