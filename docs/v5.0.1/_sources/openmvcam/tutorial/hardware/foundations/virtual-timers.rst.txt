Virtual timers
==============

The :doc:`timing` page covered timestamps and non-blocking
loops driven by :func:`time.ticks_diff`. A *virtual timer* is
the flip side: software asks the runtime to call a function on
a schedule, and the runtime invokes the callback without the
script having to check the clock itself.

The machine.Timer class
-----------------------

:class:`machine.Timer` constructs a virtual timer. Cross-port
behaviour requires the special id ``-1``; everything else --
period, mode, callback -- is set through keyword arguments:

::

    from machine import Timer

    def tick(t):
        print("tick")

    tim = Timer(-1)
    tim.init(period=100, callback=tick)   # 10 Hz

The callback is invoked like any ordinary function call -- it
can allocate objects, :func:`print`, and call other library
code without any special restrictions.

Periodic and one-shot
---------------------

Two modes are available:

* :data:`Timer.PERIODIC <machine.Timer.PERIODIC>` (the
  default). The callback fires every ``period`` milliseconds,
  forever, until :meth:`~machine.Timer.deinit` is called or
  the timer is re-initialised.
* :data:`Timer.ONE_SHOT <machine.Timer.ONE_SHOT>`. The
  callback fires once, ``period`` milliseconds after
  :meth:`~machine.Timer.init`, and the timer then stops.

::

    Timer(-1).init(mode=Timer.ONE_SHOT, period=2000, callback=fire)

:meth:`~machine.Timer.deinit` stops a periodic timer and
cancels any pending callback:

::

    tim.deinit()

When to reach for a timer
-------------------------

Virtual timers and the :func:`~time.ticks_diff` polling pattern
from :doc:`timing` solve the same problem from opposite
directions. A polled loop checks the clock every iteration and
acts when enough time has passed; a timer asks the runtime to
wake the script when enough time has passed.

* **Polled** ``ticks_diff``. Everything stays in one place --
  the loop owns the timing, no extra callbacks to keep track
  of. Best for short, well-defined work that ties together
  several time-driven tasks.
* **Virtual timer.** Moves the schedule out of the loop body.
  Best when the periodic task is independent of the main flow
  (a heartbeat LED, a periodic sensor sample) and lets the
  main loop spend its time on other work.

Both approaches use the same underlying clock and give the
same accuracy at periods of a millisecond or more. Neither is
appropriate for precise pin toggling or sub-millisecond
waveform generation -- the callback latency is on the order
of the scheduler tick, not nanoseconds.
