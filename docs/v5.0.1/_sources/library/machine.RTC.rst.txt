.. currentmodule:: machine
.. _machine.RTC:

class RTC -- real-time clock
============================

The :class:`RTC` class controls the MCU's on-chip real-time clock
peripheral, which keeps wall-clock time across resets.

On STM32 OpenMV Cams :class:`machine.RTC` and :class:`pyb.RTC` refer
to the same underlying object.

Example usage::

    import machine

    rtc = machine.RTC()
    rtc.datetime((2026, 1, 21, 2, 10, 32, 36, 0))
    print(rtc.datetime())

Constructors
------------

.. class:: RTC(id: int = 0)

   Return the :class:`RTC` singleton. ``id`` is accepted for cross-
   port compatibility but only ``0`` is valid on the OpenMV-supported
   ports (each cam has one RTC).

   The methods below are grouped by which OpenMV ports expose them.

   Methods available on all OpenMV ports
   `````````````````````````````````````

   .. method:: datetime(datetimetuple: tuple | None = None, /) -> tuple | None

      Get or set the current date and time.

      With no argument, return the current value as an 8-tuple
      ``(year, month, day, weekday, hour, minute, second, subseconds)``.

      With a single 8-tuple argument, set the RTC to that value.

      ``weekday`` is 1 = Monday through 7 = Sunday on STM32, and 0 =
      Monday through 6 = Sunday on mimxrt. ``subseconds`` is the
      fractional part of the second in units of 1/256 of a second on
      STM32; on mimxrt and alif it is always ``0``.

   STM32 + mimxrt only
   ```````````````````

   .. method:: init(datetime: tuple) -> None

      Initialise the RTC.

      On the mimxrt port (OpenMV Cam RT1062) ``datetime`` is required
      and uses the 8-tuple ``(year, month, day, weekday, hour, minute,
      second, subseconds)``.

      On STM32 OpenMV cams :meth:`init` takes no argument: it
      (re-)starts the RTC peripheral, leaving the current date / time
      untouched.

   .. method:: calibration(value: int | None = None, /) -> int | None

      Get or set the RTC's calibration offset (used to compensate
      for crystal frequency error).

      The accepted range and the units of ``value`` are
      hardware-specific -- the value is written directly into the
      MCU's RTC trim register. See the relevant STM32 / i.MX RT
      reference manual for the exact encoding.

   STM32 only
   ``````````

   .. method:: info() -> int

      Return packed RTC startup status as a 32-bit integer.

      The low 16 bits give the number of milliseconds the RTC took
      to start up at the most recent boot. Bit 0x10000 is set when
      the LSE (low-speed external) oscillator failed and the RTC
      fell back to the LSI (internal RC). Bit 0x20000 is set when
      the RTC was newly initialised at boot (rather than continuing
      from the previous power-on).

   .. method:: wakeup(timeout_ms: int | None, callback: Callable[[RTC], None] | None = None, /) -> None

      Schedule a periodic wakeup interrupt.

      ``timeout_ms`` is the period in milliseconds. The RTC fires
      every ``timeout_ms`` and can wake the MCU from
      :func:`machine.lightsleep` / :func:`machine.deepsleep`. Pass
      ``None`` to disable the wakeup timer.

      ``callback`` is invoked from the wakeup IRQ; pass ``None`` to
      install no callback (the wakeup will still fire and wake the
      MCU).

   mimxrt + alif only
   ``````````````````

   .. method:: alarm(id: int, time: int | tuple, *, repeat: bool = False) -> None

      Arm the RTC alarm. ``id`` selects the alarm channel (use
      :data:`ALARM0`). ``time`` is either an integer number of
      milliseconds in the future, or a datetime tuple. Pass
      ``repeat=True`` to re-arm automatically after each fire (only
      valid when ``time`` is a millisecond count).

      On alif only the millisecond-count form is supported.

   mimxrt only
   ```````````

   .. method:: alarm_left(alarm_id: int = 0, /) -> int

      Return the number of milliseconds remaining before the alarm
      identified by ``alarm_id`` fires.

   .. method:: alarm_cancel(alarm_id: int = 0, /) -> None

      Cancel a previously-armed alarm.

   .. method:: cancel(alarm_id: int = 0, /) -> None

      Deprecated alias for :meth:`alarm_cancel`, kept for backwards
      compatibility. Scheduled for removal in MicroPython 2.0.

   .. method:: irq(*, trigger: int = ALARM0, handler: Callable[[RTC], None] | None = None, wake: int = 0, hard: bool = False) -> None

      Register a callback for the RTC alarm.

      ``trigger`` must be :data:`ALARM0` -- the only supported IRQ
      source. ``handler`` is invoked with the :class:`RTC` instance
      when the alarm fires. ``hard=True`` registers a hard-interrupt
      handler (no heap allocation in the callback). ``wake`` is
      accepted for cross-port compatibility but has no effect.

   Constants
   ---------

   .. data:: ALARM0
      :type: int

      Identifier for the RTC's single alarm channel. Pass to
      :meth:`alarm`, :meth:`alarm_left`, :meth:`alarm_cancel` and
      the :meth:`irq` ``trigger`` argument. mimxrt port only.
