.. currentmodule:: pyb
.. _pyb.RTC:

class RTC -- real time clock
============================

The RTC is an independent clock that keeps track of the date
and time.

Example usage::

    rtc = pyb.RTC()
    rtc.datetime((2014, 5, 1, 4, 13, 0, 0, 0))
    print(rtc.datetime())


Constructors
------------

.. class:: RTC()

   Create an RTC object.


   Methods
   -------

   .. method:: datetime(datetimetuple: Optional[Tuple[int, int, int, int, int, int, int, int]] = None) -> Optional[Tuple[int, int, int, int, int, int, int, int]]

      Get or set the date and time of the RTC.

      With no arguments, this method returns an 8-tuple with the current
      date and time.  With 1 argument (being an 8-tuple) it sets the date
      and time (and ``subseconds`` is reset to 255).

      The 8-tuple has the following format:

          (year, month, day, weekday, hours, minutes, seconds, subseconds)

      ``weekday`` is 1-7 for Monday through Sunday.

      ``subseconds`` counts down from 255 to 0

   .. method:: wakeup(timeout: Optional[int], callback: Optional[Callable[[RTC], None]] = None) -> None

      Set the RTC wakeup timer to trigger repeatedly every ``timeout``
      milliseconds. This trigger can wake the board from both sleep
      states: :meth:`pyb.stop` and :meth:`pyb.standby`.

      If ``timeout`` is ``None`` then the wakeup timer is disabled.

      If ``callback`` is given then it is executed at every trigger of the
      wakeup timer.  ``callback`` must take exactly one argument.

   .. method:: info() -> int

      Get information about the startup time and reset source. The returned
      32-bit integer is a bit-packed value:

      .. list-table::
         :header-rows: 1
         :widths: 30 70

         * - Bits
           - Meaning
         * - ``0x0000FFFF``
           - Number of milliseconds the RTC took to start up.
         * - ``0x00010000``
           - Set if a power-on reset occurred.
         * - ``0x00020000``
           - Set if an external reset occurred.

   .. method:: calibration(cal: Optional[int] = None) -> Optional[int]

      Get or set the RTC smooth-calibration value.

      With no arguments, ``calibration()`` returns the current calibration
      value, an integer in the range ``[-511, 512]``. With one argument it
      sets the calibration.

      The smooth-calibration mechanism adjusts the RTC clock rate by adding
      or subtracting the given number of ticks from the 32768 Hz clock over
      a 32-second period (2^20 clock ticks). Each positive tick speeds the
      clock up by 1 part in 2^20 (≈0.954 ppm); negative values slow the
      clock by the same amount per tick. The usable calibration range is
      therefore approximately ``-487.5 ppm`` to ``+488.5 ppm``.
