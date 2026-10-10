The watchdog
============

The hardware watchdog is the floor every other hardening
choice sits on. It is a tiny independent timer that resets the
processor when it has not been told otherwise for too long. A
script that wedges on a flaky sensor, a network call that
blocks past its timeout, a memory allocator stuck in a corner
of the heap, an exception that escaped the loop -- none of
them stop the watchdog. The timer counts down regardless, and
the cam reboots.

For a shipped product, a watchdog is not optional. Without it,
any of the failure modes above leaves the cam dead until
someone notices and power-cycles it. With it, the cam comes
back up by itself and the only evidence of the failure is one
line in the log.

.. seealso::

   The hardware chapter's :doc:`watchdog timer
   </openmvcam/tutorial/hardware/production/watchdog>` page
   covers what a watchdog is at the hardware level and the
   basics of the :class:`machine.WDT` API. This page covers
   what changes for a production deployment.

Starting the watchdog
---------------------

:class:`machine.WDT` is the API. It is hardware-backed: once
constructed, the timer runs until the next reset. There is no
``stop()``, no ``deinit()``, no Ctrl-C escape. That is the
point.

A typical setup at the top of ``main.py``, immediately before
the loop it protects::

    from machine import WDT

    wdt = WDT(timeout=10_000)              # milliseconds

``main.py`` is the right home for the watchdog because that
is where the loop lives. A watchdog reset is a hardware
reset, so the cold-boot path re-runs and ``main.py`` re-enters
the loop on its own -- recovery works without any wiring in
``boot.py``. Starting the watchdog in ``boot.py`` instead
means every soft reset (a developer's Ctrl-D, for instance)
hands the application a hardware timer it has no way to
stop, which is an annoyance at the bench and a trap in
production setup code that runs before the loop is ready.

Pick the timeout to be 2 to 3 times longer than the worst
observed iteration time of the main loop. Frame-rate jitter, a
slow sensor read on a cold sensor, a brief Wi-Fi hiccup --
none of those should trip the watchdog. A real hang (an
infinite loop, a blocked I/O call) should. Too-short timeouts
turn the watchdog into a source of false resets; too-long
timeouts let the cam sit unresponsive for minutes before
recovery fires.

Feeding it
----------

``wdt.feed()`` resets the countdown. Call it once per
iteration of the main loop, at the **top** of the loop body so
the feed happens unconditionally before any work that might
hang::

    while True:
        wdt.feed()
        frame = csi0.snapshot()
        process(frame)

Surviving exceptions
--------------------

The watchdog handles hangs. Exceptions are a different
failure mode. An unhandled exception bubbles up to the
script's top level, ``main.py`` exits, and the cam drops to
the REPL. The watchdog then trips after its timeout because
nothing is feeding it from the REPL, the cam resets, and
``main.py`` runs again -- so recovery does work, but the
field pays a full timeout-plus-reboot for every crash, the
traceback goes to USB stdout that nothing reads, and any
in-memory state the application was keeping is gone.

Wrapping the main loop in a top-level ``try`` / ``except``
turns a crash into a logged event the application continues
through, without paying for a reset::

    import logging

    log = logging.getLogger(__name__)

    while True:
        wdt.feed()
        try:
            frame = csi0.snapshot()
            process(frame)
        except Exception:
            log.exception("frame loop iteration failed")

Catching ``Exception`` (not ``BaseException``) keeps
``KeyboardInterrupt`` and :class:`SystemExit` working, which
is what a developer attached over USB wants.

This pattern is the software half of liveness: the watchdog
catches the hangs, the wrapper catches the crashes, and the
log records what either of them caught.

Knowing why a boot happened
---------------------------

Every soft reset and every watchdog reset eventually shows up
as a fresh boot. The boot-time diagnostics helper logs
:func:`machine.reset_cause` on every cold start; the ``reset
cause`` line is what tells the field whether recovery
actually fired versus the cam just power-cycling normally.

The reset-cause line is what makes the watchdog's work
visible in the log. A log full of ``watchdog timeout``
resets says the application has been hanging and the
watchdog has been recovering it. A log without them says the
watchdog has not had to fire -- which usually means the
application is healthy, but can also mean the timeout is set
too long to catch the hangs that are actually happening.

A complete starter
------------------

A ``main.py`` that pulls watchdog, logging setup, boot-time
diagnostics, and the wrapper together looks like::

    import logging
    from machine import WDT

    from app.logging_setup import setup_logging, log_boot_diagnostics

    setup_logging('/sdcard/logs/app.log')
    log_boot_diagnostics()

    log = logging.getLogger(__name__)

    wdt = WDT(timeout=10_000)

    while True:
        wdt.feed()
        try:
            step()
        except Exception:
            log.exception("loop iteration failed")

``step()`` is the application's per-iteration work; the rest
of this scaffold does not change between products. Hardening
is one watchdog, one wrapper, and a logged boot every cold
start -- not much code, and the difference between a cam that
recovers on its own and one that needs a service call.
