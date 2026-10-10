Low-power and sleep modes
=========================

Battery-powered cameras and intermittently-active sensors do
not need the CPU running at full speed all the time. The
:mod:`machine` module exposes four progressively-deeper
power-saving states -- ``active``, :func:`~machine.idle`,
:func:`~machine.lightsleep`, and :func:`~machine.deepsleep`.
Each step deeper turns more of the chip off and saves more
power, at the cost of a longer wake-up. Picking the right one
is a trade between how much power the camera saves and how
fast it can react when something happens.

Active
------

The default state. The CPU is running Python, every peripheral
is clocked, and current draw is at its highest -- tens of
milliamps on the camera's logic rail, plus whatever any
attached accessories pull through it.

idle()
------

:func:`machine.idle` gates the CPU clock until *any* interrupt
fires (a peripheral, a timer, a pin IRQ). RAM is live,
peripherals stay on, the clocks keep running -- only the CPU
itself is paused, and it wakes in microseconds when there is
work to do.

Use it inside any tight polling loop that is waiting for
something external to happen:

::

    import machine

    while not button_pressed():
        machine.idle()

The CPU stops burning cycles on the ``while`` check itself and
wakes naturally when the next event arrives -- a small saving
that adds up over a loop that runs millions of times.

lightsleep()
------------

:func:`machine.lightsleep` is the next step down. The CPU is
stopped completely and most of the chip's internal clocks are
switched off, but RAM and peripheral state are preserved. When the wake source
fires, the script resumes from exactly where it called
``lightsleep`` -- variables, open handles, and pending data
all intact -- on the order of milliseconds later.

::

    import machine
    from machine import Pin

    wake_pin = Pin("P0", Pin.IN, Pin.PULL_UP)
    wake_pin.irq(lambda _: None, trigger=Pin.IRQ_FALLING, wake=machine.SLEEP)

    while True:
        do_work()
        machine.lightsleep()   # wakes on a falling edge on P0

The wake source -- a pin IRQ here -- must be configured
*before* the sleep call. Power draw drops significantly
relative to active mode; the exact number depends on the
board and what peripherals are still configured.

deepsleep()
-----------

:func:`machine.deepsleep` is the deepest state. The CPU stops,
peripherals are powered down, and RAM contents may be lost.
The only things still drawing power are the wake circuit and a
small bit of always-on logic.

When the wake source fires, the chip *boots from the start of
the main script* -- ``deepsleep`` does not return. The script
distinguishes a deepsleep wake from a fresh power-on or hard
reset using :func:`machine.reset_cause`:

::

    import machine

    if machine.reset_cause() == machine.DEEPSLEEP_RESET:
        # Woke from deepsleep -- restore state from non-volatile storage,
        # take a measurement, etc.
        pass
    else:
        # Fresh boot
        pass

    do_work()
    machine.deepsleep(60_000)    # arm RTC wake for 60 s, sleep, then restart

The millisecond argument to :func:`~machine.deepsleep` arms
the on-chip RTC alarm internally -- the RTC is what carries
the wake-up timing through the sleep, since most other timers
are powered down. Calling :func:`~machine.deepsleep` with no
argument leaves the wake-up to whatever source you configured
separately (a pin IRQ, an externally-armed RTC alarm).

Because the script restarts, anything the next iteration needs
has to either be reconstructed at the top of ``main.py`` or
persisted to flash (or to the RTC's backup registers, on parts
that have them). Deepsleep gives the largest power saving but
imposes the most program restructuring -- the application has
to behave as a series of short "measurement bursts" separated
by sleeps, rather than a long-running loop with state in RAM.

Choosing a state
----------------

The right state depends on what the camera is waiting for:

* **Tight polling loop, waiting milliseconds.** Use
  :func:`~machine.idle`. The savings are small per cycle but
  large in aggregate, and the wake is invisible.
* **Idle for seconds or minutes between events.** Use
  :func:`~machine.lightsleep`. State is preserved, wake is
  fast, and power draw is a fraction of active mode.
* **Idle for minutes or longer between brief bursts of work.**
  Use :func:`~machine.deepsleep`. The chip is effectively off
  between events, and the script structure shifts to a wake,
  measure, sleep loop.

Whatever the state, the *wake source* matters as much as the
state itself -- a deepsleep that wakes only on a timer is a
duty-cycled measurement loop; a lightsleep that wakes on a pin
IRQ is an event-driven sensor. The :mod:`machine` module's
sleep functions, :class:`~machine.RTC` alarms, and
:meth:`~machine.Pin.irq` together give the building blocks.
