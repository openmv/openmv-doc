Time and NTP
============

A freshly powered-up camera has no idea what time it
is. The on-board clock starts at some arbitrary moment
(``1970-01-01`` on most boards) and counts forward
from there until something tells it otherwise. *NTP*
-- the Network Time Protocol -- is how the cam asks
the network for the real-world wall-clock time and
sets its own clock from the answer.

Why the cam needs to know the time
----------------------------------

For a lot of scripts the cam's clock does not matter
-- a frame-capture loop does not care what day it is.
For a few common things it matters a lot:

* **Timestamps in logs or uploaded data.** Entries
  that all say ``1970-01-01`` are hard to make sense
  of after the fact.
* **Scheduled tasks.** "Run at 03:00" needs the
  camera to know what 03:00 is.

What NTP does
-------------

NTP is a small public service: a network of servers
that answer "what time is it?" over a single UDP
exchange. The camera sends a short request to a known
NTP server; the server replies with a precise
timestamp (accurate to a few milliseconds for any
common public server); the camera uses that to set
its own clock. The default server the cam uses is
``pool.ntp.org``, a globally load-balanced pool
designed for exactly this kind of client.

The Python API: :mod:`ntptime`
------------------------------

MicroPython wraps the protocol in one call. The
common pattern is to bring the link up first, then
ask NTP for the time::

    import network
    import ntptime
    import time

    wlan = network.WLAN(network.WLAN.IF_STA)
    wlan.active(True)
    wlan.connect("my-network", "my-password")

    while not wlan.isconnected():
        time.sleep_ms(100)

    ntptime.settime()                 # cam's clock is now UTC
    print(time.localtime())

After :func:`ntptime.settime` returns, the on-board
real-time clock and :func:`time.localtime` reflect
the current UTC time. Two knobs adjust the defaults:

* :data:`ntptime.host` is the server name to query.
  Override it (``ntptime.host = "time.google.com"``)
  before calling :func:`~ntptime.settime` to point
  at a different server.
* :data:`ntptime.timeout` is the number of seconds
  to wait for a reply before giving up; the default
  is short.

When to call it
---------------

* **After the network link is up.** NTP rides on UDP,
  which rides on an established IP setup. Wait for
  :meth:`~network.WLAN.isconnected` to return
  :data:`True` first.
* **Periodically on long-running cams.** The
  on-board clock drifts over hours and days. A daily
  or weekly :func:`~ntptime.settime` keeps it
  honest.

Time zones
----------

NTP returns UTC. MicroPython does not ship a
time-zone database, so converting UTC to local time
is the script's job. A fixed offset for the
deployment's zone is the usual approach::

    import time

    offset = -5 * 3600                  # hours -> seconds, US Eastern
    local = time.localtime(time.time() + offset)
    print(local)

Daylight Saving Time, leap seconds, and historical
zone changes are not handled by this approach. For
most camera deployments a fixed offset is enough; if
a script genuinely needs civil time with Daylight
Saving Time, do the conversion server-side.

What can go wrong
-----------------

* **No network yet.** :func:`ntptime.settime` raises
  :exc:`OSError` if it cannot reach the server.
  Either the link is not up, the name lookup
  failed, the server is unreachable, or no reply
  arrived inside :data:`ntptime.timeout`. Retry
  once the link is stable.
* **Captive portals.** A Wi-Fi network that
  intercepts DNS may answer the NTP server name with
  the portal's own IP, and NTP requests to that
  return nonsense. The cam will think the network is
  up but the time set will fail or be wildly wrong.
  Move to a clean network or hard-code an IP.
* **Hammering public pools.** Public NTP pools rate-
  limit abusive clients. Once an hour is plenty;
  once per minute will get the cam banned.

For the full :mod:`ntptime` reference, see
:doc:`/library/ntptime`.
