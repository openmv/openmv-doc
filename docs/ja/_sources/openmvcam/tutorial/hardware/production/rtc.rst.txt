Real-time clock
===============

The microcontroller's millisecond clock -- the one behind
:func:`time.ticks_ms` and the timer subsystem -- counts elapsed
time since boot. The *real-time clock* (RTC) is separate
hardware that tracks *wall-clock* time -- year, month, day,
hour, minute, second -- and keeps running across resets and
firmware updates. On cams with a backup battery wired to the
RTC supply, it survives full power loss as well.

The RTC is what a deployed camera uses to:

* Time-stamp log entries and saved images with a real date.
* Pace long-running tasks that should not drift over weeks or
  months.

The machine.RTC class
---------------------

:class:`machine.RTC` is a singleton -- one RTC per camera, no
id needed:

::

    from machine import RTC

    rtc = RTC()

The current date and time live in
:meth:`~machine.RTC.datetime`. Calling it with no arguments
returns an 8-tuple:

::

    >>> rtc.datetime()
    (2026, 5, 27, 4, 14, 30, 15, 0)

The fields are
``(year, month, day, weekday, hour, minute, second, subseconds)``.
To set the clock, pass an 8-tuple of the same shape back:

::

    rtc.datetime((2026, 1, 21, 2, 10, 32, 36, 0))

The camera keeps counting from that point. On a soft reset the
time continues uninterrupted; on a full power cycle the RTC
falls back to its default time unless a backup battery keeps
it powered.

When to set the RTC
-------------------

The RTC has no built-in way to know what time it is at boot.
Three common patterns set it:

* **From a network time source.** Cams that come up on
  WiFi can fetch the time with :mod:`ntptime` and write it to
  the RTC at startup.
* **From a host over USB.** A companion script on a laptop
  pushes the current time when the cam is plugged in.
* **From a battery-backed external RTC chip.** A dedicated
  RTC IC (often on a shield, with its own coin cell) keeps
  better long-term time than the on-chip RTC and can be read
  at boot to seed :meth:`~machine.RTC.datetime`.

Some applications never need to set the RTC at all. A
duty-cycled "wake every 60 seconds and take a reading" loop
only cares about elapsed intervals, which :func:`time.ticks_ms`
and the timed-sleep patterns in :doc:`low-power` handle without
ever consulting the RTC's wall-clock value.
