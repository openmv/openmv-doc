Watchdog timer
==============

A *watchdog timer* is a piece of hardware that resets the
microcontroller if the running script ever stops periodically
poking it. The script "feeds" the watchdog from somewhere it
knows is running healthy code; if a bug, a hang, or an
unexpected exception ever keeps the camera from feeding the
watchdog within a configured timeout, the chip resets itself
and the script starts fresh.

On a deployed device with no human nearby to power-cycle it,
this is the difference between a transient bug that recovers
in seconds and a brick that needs a service call.

.. figure:: ../figures/watchdog-countdown.svg
   :alt: A graph of a watchdog counter over time. The counter
         starts at the timeout value, drops linearly toward
         zero, and is reloaded to the timeout each time the
         script calls feed(). After three successful feed()
         calls, a fourth interval has no feed() and the counter
         reaches zero, triggering an MCU reset.

   The watchdog counter ticks down from its timeout. Each
   ``feed()`` reloads it; if it reaches zero, the chip resets.

The machine.WDT class
---------------------

:class:`machine.WDT` enables the watchdog and exposes a single
method, :meth:`~machine.WDT.feed`. Once started, the watchdog
cannot be stopped -- the only ways out are feeding it on
schedule or letting it reset the chip:

::

    from machine import WDT

    wdt = WDT(timeout=2000)    # reset if not fed within 2 seconds

    while True:
        do_work()
        wdt.feed()

The ``timeout`` is in milliseconds. The right value depends on
how long the longest legitimate iteration of the main loop
takes, with comfortable headroom -- a 100-ms loop with a 2-s
timeout has plenty of margin for a slow iteration without
nuisance resets.

Where to call feed()
--------------------

Where ``feed()`` lives is the critical design decision; the
watchdog only catches bugs in the parts of the code that do
*not* run between feeds.

* **Call from the main loop, at the top or bottom.** The most
  common pattern. The watchdog catches anything that hangs the
  main loop -- a deadlock, an infinite ``while``, a peripheral
  that never returns -- and resets the chip back into the loop.
* **Do not call from an interrupt handler.** The point of the
  watchdog is to catch hangs in the *normal* code path. An ISR
  that fires regardless of whether the main loop is stuck
  would keep feeding a watchdog that *should* be triggering.
* **Do not call from inside a long blocking operation.** A
  network request or sensor read that takes ten seconds is
  exactly the kind of hang the watchdog should catch.
  Putting ``feed()`` inside it defeats the protection.

A guideline that works for most programs: feed once per main
loop iteration, with the timeout set to several times the
expected loop duration. If a single iteration legitimately
needs longer than the timeout -- a deliberate calibration
phase, say -- structure that phase as a series of smaller
chunks with ``feed()`` between them, or change the timeout
with :meth:`~machine.WDT.timeout_ms` (where supported) before
entering it.

Availability
------------

The watchdog is exposed on most OpenMV cams but not all -- the
hardware is present on every part, but the Python API is not
yet wired up everywhere. Check the :doc:`/openmvcam/quickref`
or attempt to construct a :class:`~machine.WDT` and catch the
``AttributeError`` if it is not supported.

Even on cams where :class:`~machine.WDT` is not exposed, a
field-deployed device can use a soft equivalent -- a separate
task or main-loop step that monitors progress and triggers
:func:`machine.reset` if anything looks wedged. It is less
robust than a hardware watchdog (a wedged interrupt handler
can take down the soft monitor too) but it covers the same
cases at the application level.
