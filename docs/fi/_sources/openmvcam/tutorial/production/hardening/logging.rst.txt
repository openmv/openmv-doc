Logging
=======

A shipped product cannot phone home with :func:`print`.
``print()`` writes to USB stdout, which only exists when the
cam is on a developer's bench with a terminal open. In the
field nothing reads it; every line is dropped on the floor.
The :mod:`logging` library is the replacement -- a level
filter, a destination of the application's choice, and a
format that says what happened and when.

The :mod:`logging` module on the cam is a slimmed port of
CPython's -- same mental model, smaller surface, a few
differences that matter for production setup.

The mental model
----------------

Logging is built out of four pieces. Each piece has one job;
the separation is what lets one logger fan out to multiple
destinations, each with its own format and level:

* A **Logger** is what the application calls. Code says
  ``log.info("frame %d", n)``; the logger is the object that
  call lands on. Loggers are looked up by name with
  :func:`logging.getLogger`.

* A **Handler** decides *where* a record goes. A
  :class:`~logging.StreamHandler` writes to a stream
  (:data:`sys.stderr` by default); a
  :class:`~logging.FileHandler` appends to a file on disk. A
  logger can have any number of handlers.

  .. note::

     On the cam, ``sys.stdout`` and ``sys.stderr`` are wired
     to the same USB CDC pipe -- writes to either show up on
     the same terminal a developer has open over USB. A
     handler that writes to ``sys.stderr`` is, in practice,
     a handler that writes to the same place ``print()``
     writes to. The handler abstraction still gives you
     per-destination filtering and formatting; it just does
     not give you a physically separate channel.

* A **Formatter** decides *how* a record renders to text. It
  takes a record and returns the line that gets written. One
  format string per formatter; one formatter per handler.

* A **level filter** sits on every logger and every handler.
  Records carry a level (``DEBUG`` / ``INFO`` / ``WARNING`` /
  ``ERROR`` / ``CRITICAL``). Only records at or above the
  filter level pass through.

That separation matters because a typical production setup
has more than one destination: a file on the SD card that
holds everything down to ``DEBUG`` for post-mortem analysis,
and a stream to USB that surfaces only ``WARNING`` and worse
so a developer attached to the cam sees the highlights without
drowning in detail. Same code, two destinations, two filters.

Levels and what each one means
------------------------------

The five levels are an ordered scale. Records carry a level so
that the filter on each handler can drop the ones it does not
care about.

* ``DEBUG`` -- tracing, per-frame counters, internal state
  dumps. The lowest level; volume is high.
* ``INFO`` -- normal operational events. Wi-Fi connected, a
  model loaded, the watchdog started, a new log file rotated
  in.
* ``WARNING`` -- something unexpected but the application
  handled it. A dropped frame, a retried network request.
* ``ERROR`` -- an operation failed and the application could
  not complete it. A model file missing, an SD-card write
  refused.
* ``CRITICAL`` -- the application cannot continue at all. Out
  of memory, mandatory mount missing.

One important default to remember: the cam's :mod:`logging`
module starts every logger at ``WARNING``. Records at
``DEBUG`` and ``INFO`` are silently dropped unless
:meth:`Logger.setLevel` is called -- usually as part of the
:func:`basicConfig` call below. A common first symptom of a
logging setup that "is not working" is that the application
emitted at ``INFO`` and the default filter ate the record.

.. note::

   Level is the only filter the cam's :mod:`logging` offers.
   There are no :class:`Filter` objects for richer
   per-record rules; if a record's level passes, it is
   emitted.

basicConfig: the quickstart
---------------------------

:func:`logging.basicConfig` configures the root logger in one
call. Two shapes show up most:

A development setup, everything to USB stderr at ``INFO``::

    import logging

    logging.basicConfig(level=logging.INFO)

A production setup, everything to a file on the SD card with a
timestamped format::

    import logging

    logging.basicConfig(
        filename='/sdcard/logs/app.log',
        level=logging.INFO,
        format='%(asctime)s %(levelname)s %(name)s: %(message)s',
    )

Pass either ``filename=`` for a :class:`FileHandler` or
``stream=`` for a :class:`StreamHandler`; the two are
mutually exclusive in :func:`basicConfig`.

The format string is a ``%(field)s``-style template. The
fields the cam's formatter supports:

* ``%(asctime)s`` -- timestamp formatted from
  :func:`time.localtime`. Default format is ``%Y-%m-%d
  %H:%M:%S``; pass ``datefmt=`` to override.
* ``%(levelname)s`` -- ``DEBUG`` / ``INFO`` / ``WARNING`` /
  ``ERROR`` / ``CRITICAL``.
* ``%(name)s`` -- the logger's name (see the next section).
* ``%(message)s`` -- the record's formatted message.
* ``%(msecs)d`` -- the millisecond fraction of the record's
  timestamp.

The default format if none is given is
``%(levelname)s:%(name)s:%(message)s`` -- which is fine for
the development setup and inadequate for a field log, where
the timestamp is what makes the file useful weeks later.

:func:`basicConfig` is a no-op on subsequent calls unless
``force=True`` is passed. Configure once at startup; do not
call it again to "switch destinations" mid-run.

.. note::

   The cam's :mod:`logging` has no :func:`dictConfig` or
   :func:`fileConfig`. Configuration is always programmatic
   -- one ``setup_logging()`` helper called once from
   ``main.py`` is the convention.

Named loggers per module
------------------------

Application code should not call the module-level shortcuts
(:func:`logging.info`, :func:`logging.warning`, and so on).
Those all funnel through the root logger, and the resulting
log records carry the name ``root`` -- useless for telling
*where* the record came from.

The convention is one logger per module, named after the
module::

    # in app/detector.py
    import logging

    log = logging.getLogger(__name__)

    def detect(frame):
        log.info("detect on %dx%d frame", frame.width(), frame.height())

Every record then carries ``app.detector`` in ``%(name)s`` and
the log line says who emitted it.

The cam's :mod:`logging` differs from CPython in one important
way: the logger namespace is **flat**. ``getLogger('app')``
and ``getLogger('app.detector')`` are independent loggers
with no parent / child relationship -- setting a level on
``app`` does *not* propagate to ``app.detector``. The
mechanism that does work: a named logger with no handlers of
its own borrows the root logger's handlers and level. That is
how a single :func:`basicConfig` call on root sets up every
:func:`getLogger` call elsewhere in the application.

Lazy %-arg formatting
---------------------

Write::

    log.info("processed %d frames in %d ms", count, dt)

Not::

    log.info(f"processed {count} frames in {dt} ms")

The ``%``-arg form lets the logger interpolate the arguments
*after* the level filter has decided whether to emit the
record. A filtered-out ``DEBUG`` call in a hot loop pays
nothing for its format string. An f-string evaluates first,
every time, before the call even reaches the logger.

CPython's ``extra=`` keyword for structured fields is not
supported on the cam; pass the values as message arguments
instead.

Logging exceptions
------------------

Inside an :keyword:`except` block,
:meth:`Logger.exception` logs the message at ``ERROR`` level
*and* appends the current exception's traceback to the
record::

    try:
        frame = csi0.snapshot()
        process(frame)
    except Exception:
        log.exception("frame loop iteration failed")

The traceback is captured via :func:`sys.print_exception`,
which is what gives an exception log its multi-line
``Traceback (most recent call last):`` block. This is the
right tool for top-level exception handling -- catch, log,
and carry on.

Multiple handlers
-----------------

The production split mentioned at the top -- everything to a
file at ``DEBUG``, highlights to stderr at ``WARNING`` -- is
two handlers attached to the same logger, each with its own
level and formatter::

    import logging

    fmt = '%(asctime)s %(levelname)s %(name)s: %(message)s'

    file_handler = logging.FileHandler('/sdcard/logs/app.log')
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(logging.Formatter(fmt))

    stream_handler = logging.StreamHandler()
    stream_handler.setLevel(logging.WARNING)
    stream_handler.setFormatter(logging.Formatter(fmt))

    root = logging.getLogger()
    root.setLevel(logging.DEBUG)          # admit everything to the filters
    root.addHandler(file_handler)
    root.addHandler(stream_handler)

The root logger's level is the *first* filter every record
hits. Set it to the lowest level any handler wants to see --
``DEBUG`` here -- so neither handler is starved by the logger
itself. The per-handler levels then decide which records
actually get emitted to which destination.

Rotating log files
------------------

The cam's :mod:`logging` does not have
:class:`RotatingFileHandler` or
:class:`TimedRotatingFileHandler`. Rotation is the
application's job.

The pattern is to keep the current :class:`FileHandler` in a
known place, swap it for a new one when the rollover
criterion fires, and let a dated path provide the natural
file boundary. For an hourly rollover into
``/sdcard/logs/<year>/<month>/<day>/<hour>.log``::

    import logging
    import time

    _LOG_FMT = '%(asctime)s %(levelname)s %(name)s: %(message)s'
    _current_path = None
    _current_handler = None

    def _hourly_path(now):
        return '/sdcard/logs/{:04d}/{:02d}/{:02d}/{:02d}.log'.format(
            now[0], now[1], now[2], now[3])

    def rotate_if_needed():
        global _current_path, _current_handler

        path = _hourly_path(time.localtime())
        if path == _current_path:
            return

        root = logging.getLogger()
        if _current_handler is not None:
            root.removeHandler(_current_handler)
            _current_handler.close()

        _current_handler = logging.FileHandler(path)
        _current_handler.setFormatter(logging.Formatter(_LOG_FMT))
        root.addHandler(_current_handler)
        _current_path = path

Call ``rotate_if_needed()`` once per main-loop iteration; the
path check is cheap and the swap only happens at the hour
boundary. The directory tree must exist before
:class:`FileHandler` can open the file.

Flushing on power-sensitive deployments
---------------------------------------

:class:`FileHandler` writes go through the underlying file
object's Python buffering. A power loss between a write and a
flush loses the trailing records. For battery-powered or
pull-the-plug deployments, call ``flush()`` on the handler's
stream after critical records, or on a timer.

A small helper that flushes every handler attached to the
root logger::

    import logging

    def flush_handlers():
        for handler in logging.getLogger().handlers:
            if hasattr(handler, 'stream'):
                handler.stream.flush()

Call ``flush_handlers()`` right after a record the
application cannot afford to lose::

    log.critical("memory low: restarting")
    flush_handlers()

For background safety, call it from the main loop on whatever
cadence balances log freshness against flash wear -- once a
second is usually plenty. :meth:`Logger.critical` does *not*
trigger a flush by itself.

Boot-time diagnostics
---------------------

A field log without context is nearly useless. The first
records on every cold boot should identify *which* cam, *what
build* is running, and *how* the cam got to this boot. Three
on-device sources between them cover all of that:

* :mod:`omv` -- the OpenMV firmware version.
* :func:`os.uname` -- MicroPython version, board name + MCU,
  and the git tag and build date of the source the firmware
  was built from.
* :mod:`machine` -- the MCU's unique silicon ID and the
  reset cause that triggered this boot.
* :func:`os.listdir` against each mount point -- the
  filesystems that actually came up.

A helper that pulls every one of those into the first records
of the log::

    import binascii
    import logging
    import machine
    import omv
    import os

    log = logging.getLogger(__name__)

    _RESET_NAMES = {
        machine.PWRON_RESET: "power-on",
        machine.HARD_RESET: "hard reset",
        machine.WDT_RESET: "watchdog timeout",
        machine.DEEPSLEEP_RESET: "wake from deep sleep",
        machine.SOFT_RESET: "soft reset",
    }

    def log_boot_diagnostics():
        uname = os.uname()

        log.info("machine: %s", uname.machine)
        log.info("unique id: %s",
                 binascii.hexlify(machine.unique_id()).decode())
        log.info("firmware: openmv %s, micropython %s",
                 omv.version_string(), uname.release)
        log.info("build: %s", uname.version)
        log.info("reset cause: %s",
                 _RESET_NAMES.get(machine.reset_cause(), "unknown"))

        for mount in ('/flash', '/sdcard', '/rom'):
            try:
                os.listdir(mount)
                log.info("mount %s: ok", mount)
            except OSError as e:
                log.warning("mount %s: %s", mount, e)

A typical log opens with something like::

    INFO machine: OPENMV4 with STM32H743
    INFO unique id: 002C00543235501020373835
    INFO firmware: openmv 5.0.0, micropython 1.28.0
    INFO build: v1.28.0-101-gabc1234 on 2026-06-09
    INFO reset cause: watchdog timeout
    INFO mount /flash: ok
    INFO mount /sdcard: ok
    INFO mount /rom: ok

Eight lines into every log file, the operator knows the
physical unit, the firmware lineage, why the cam booted, and
which storage came up. ``unique id`` is the MCU's
factory-programmed silicon serial number; it is the same
across reflashes and across SD-card swaps. ``build`` is the
git tag and date of the firmware tree the image was built
from -- the single field that says "this is exactly the
binary that shipped to this unit at this point in time."

Putting it together
-------------------

A complete production logging setup, factored into a helper
that ``main.py`` calls once at startup::

    import logging

    _LOG_FMT = '%(asctime)s %(levelname)s %(name)s: %(message)s'

    def setup_logging(log_path):
        fh = logging.FileHandler(log_path)
        fh.setLevel(logging.DEBUG)
        fh.setFormatter(logging.Formatter(_LOG_FMT))

        sh = logging.StreamHandler()
        sh.setLevel(logging.WARNING)
        sh.setFormatter(logging.Formatter(_LOG_FMT))

        root = logging.getLogger()
        root.setLevel(logging.DEBUG)
        root.addHandler(fh)
        root.addHandler(sh)

Then at the top of ``main.py``::

    from app.logging_setup import setup_logging, log_boot_diagnostics

    setup_logging('/sdcard/logs/app.log')
    log_boot_diagnostics()

Every module elsewhere in the application just does::

    import logging

    log = logging.getLogger(__name__)

and gets the configured output for free -- file with full
detail, stream with warnings, named records, timestamped
formatter, and a documented boot every cold start.
