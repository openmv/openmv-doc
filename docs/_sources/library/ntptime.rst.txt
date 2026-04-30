:mod:`ntptime` -- simple NTP client
===================================

.. module:: ntptime
   :synopsis: simple NTP client

This module provides a small client for the Network Time Protocol (NTP),
useful for retrieving the current UTC time from an internet time server and
optionally setting the on-board real-time clock. It performs a single UDP
request to an NTP server and decodes the returned 64-bit timestamp.

This module relies on a working network connection. Its 32-bit on-the-wire
timestamp is automatically corrected for the 2036 NTP rollover, allowing the
implementation to remain valid until February 2160.

Functions
---------

.. function:: time() -> int

   Query the configured NTP server (`host`) and return the current UTC time
   as an integer number of seconds since the MicroPython epoch.

   The MicroPython epoch is detected at runtime using `time.gmtime()`. Both
   the 1970 (Unix) and 2000 epochs are supported; any other epoch raises
   ``Exception``.

   Network errors propagate to the caller; the underlying socket is always
   closed before returning.

.. function:: settime() -> None

   Fetch the current time using :func:`time` and set the on-board RTC
   accordingly via :py:class:`machine.RTC`.

   Note that MicroPython has no time-zone support: the RTC is always set in
   UTC.

Constants
---------

.. data:: host
   :type: str

   The hostname of the NTP server to query. Defaults to ``"pool.ntp.org"``.
   Re-assign at runtime to override, e.g. ``ntptime.host = "time.google.com"``.

.. data:: timeout
   :type: int

   Socket timeout in seconds applied to the NTP UDP request. Defaults to
   ``1``. Increase on slow or high-latency networks.
