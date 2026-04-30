:mod:`logging` -- event logging
===============================

.. module:: logging
   :synopsis: event logging

This module provides a lightweight subset of the standard Python
``logging`` package adapted for MicroPython. It supports leveled logging
through hierarchically-named `Logger` objects, a small set of handlers
(`StreamHandler`, `FileHandler`), printf-style formatting via `Formatter`,
and module-level convenience functions equivalent to those operating on the
root logger.

The module follows the familiar CPython API closely enough that simple
applications written for the standard library should work unchanged. Filters,
multiple-process locking, the configuration file format, and most handler
classes are not provided.

Level Constants
---------------

.. data:: CRITICAL
   :type: int

   Numeric value ``50``. Used for unrecoverable errors.

.. data:: ERROR
   :type: int

   Numeric value ``40``. Used for serious problems.

.. data:: WARNING
   :type: int

   Numeric value ``30``. Default level for a freshly-configured root logger.

.. data:: INFO
   :type: int

   Numeric value ``20``. Used for confirmation messages.

.. data:: DEBUG
   :type: int

   Numeric value ``10``. Used for fine-grained diagnostic output.

.. data:: NOTSET
   :type: int

   Numeric value ``0``. Indicates a logger with no level configured (the
   effective level is then inherited from the root logger or
   :data:`WARNING`).

Functions
---------

.. function:: getLogger(name: str | None = None) -> Logger

   Return the `Logger` registered under *name*, creating it on first use.
   If *name* is ``None`` the root logger is returned. The first call with
   ``name="root"`` (or with *name* unset) implicitly invokes `basicConfig`
   to attach a default `StreamHandler` writing to ``sys.stderr``.

.. function:: log(level: int, msg: str, *args) -> None

   Log a message at *level* on the root logger. *args* are interpolated
   into *msg* using printf-style ``%`` formatting; a single dict argument
   is used as the mapping.

.. function:: debug(msg: str, *args) -> None

   Equivalent to ``getLogger().debug(msg, *args)``.

.. function:: info(msg: str, *args) -> None

   Equivalent to ``getLogger().info(msg, *args)``.

.. function:: warning(msg: str, *args) -> None

   Equivalent to ``getLogger().warning(msg, *args)``.

.. function:: error(msg: str, *args) -> None

   Equivalent to ``getLogger().error(msg, *args)``.

.. function:: critical(msg: str, *args) -> None

   Equivalent to ``getLogger().critical(msg, *args)``.

.. function:: exception(msg: str, *args, exc_info: bool | BaseException = True) -> None

   Equivalent to ``getLogger().exception(msg, *args, exc_info=exc_info)``.
   Logs the message at :data:`ERROR` and additionally formats the active
   exception's traceback when *exc_info* is truthy. If *exc_info* is itself
   a ``BaseException``, that exception's traceback is used; otherwise
   ``sys.exc_info()`` is consulted when available.

.. function:: shutdown() -> None

   Close every handler attached to every known logger and forget the
   loggers. Registered automatically through ``sys.atexit`` when that hook
   is available.

.. function:: addLevelName(level: int, name: str) -> None

   Associate the textual *name* with the numeric *level* so that
   `Formatter` can render it via ``%(levelname)s``.

.. function:: basicConfig(filename: str | None = None, filemode: str = "a", format: str | None = None, datefmt: str | None = None, level: int = WARNING, stream = None, encoding: str = "UTF-8", force: bool = False) -> None

   Configure the root logger with a single handler.

   If *filename* is supplied a `FileHandler` is created using *filemode*
   and *encoding*; otherwise a `StreamHandler` writing to *stream*
   (defaulting to ``sys.stderr``) is used.

   *format* and *datefmt* are passed through to a new `Formatter`.

   *level* sets both the handler's level and the root logger's level.

   If the root logger already has handlers this function is a no-op unless
   *force* is ``True``, in which case the existing handlers are closed and
   replaced.

Classes
-------

.. class:: Logger(name: str, level: int = NOTSET)

   A named logger. Construct loggers via `getLogger` rather than directly,
   so that `getLogger` can return the same instance for the same name.

   .. attribute:: name
      :type: str

      The logger's dotted name.

   .. attribute:: level
      :type: int

      The configured numeric level. ``0`` (:data:`NOTSET`) means
      "inherit".

   .. attribute:: handlers
      :type: list

      The list of `Handler` instances attached to this logger. When empty,
      messages are dispatched to the root logger's handlers.

   .. method:: setLevel(level: int) -> None

      Set the logger's threshold level.

   .. method:: isEnabledFor(level: int) -> bool

      Return ``True`` if a message of *level* would be processed by this
      logger.

   .. method:: getEffectiveLevel() -> int

      Return the first non-zero of: this logger's level, the root logger's
      level, or :data:`WARNING`.

   .. method:: log(level: int, msg: str, *args) -> None

      Log *msg* at *level*. *args* are interpolated into *msg* with the
      ``%`` operator; if the first positional argument is a dict it is used
      as a mapping.

   .. method:: debug(msg: str, *args) -> None

      Log *msg* at :data:`DEBUG`.

   .. method:: info(msg: str, *args) -> None

      Log *msg* at :data:`INFO`.

   .. method:: warning(msg: str, *args) -> None

      Log *msg* at :data:`WARNING`.

   .. method:: error(msg: str, *args) -> None

      Log *msg* at :data:`ERROR`.

   .. method:: critical(msg: str, *args) -> None

      Log *msg* at :data:`CRITICAL`.

   .. method:: exception(msg: str, *args, exc_info: bool | BaseException = True) -> None

      Log *msg* at :data:`ERROR` and, when *exc_info* is truthy, append the
      formatted traceback. If *exc_info* is a ``BaseException`` instance
      that exception's traceback is rendered; otherwise the active
      exception is consulted via ``sys.exc_info()``.

   .. method:: addHandler(handler: Handler) -> None

      Attach *handler* to this logger.

   .. method:: hasHandlers() -> bool

      Return ``True`` if any handlers are attached to this logger.

.. class:: Handler(level: int = NOTSET)

   Base class for all handlers. Sub-classes implement :meth:`emit`.

   .. attribute:: level
      :type: int

      The handler's threshold level.

   .. attribute:: formatter
      :type: "Formatter | None"

      The active `Formatter`, or ``None``.

   .. method:: setLevel(level: int) -> None

      Set the handler's threshold level.

   .. method:: setFormatter(formatter: Formatter) -> None

      Attach *formatter* to this handler.

   .. method:: format(record: LogRecord) -> str

      Render *record* using the configured formatter.

   .. method:: close() -> None

      Release resources held by the handler. Called by `shutdown` and by
      :class:`FileHandler` when it is closed.

.. class:: StreamHandler(stream = None)

   Handler that writes formatted records, followed by ``self.terminator``
   (``"\n"`` by default), to *stream*. *stream* defaults to ``sys.stderr``.

   .. attribute:: stream

      The destination stream object.

   .. attribute:: terminator
      :type: str

      String appended after every formatted record. Defaults to ``"\n"``.

   .. method:: emit(record: LogRecord) -> None

      Write *record* to :attr:`stream` if its level meets the handler
      threshold.

   .. method:: close() -> None

      Flush the underlying stream when it exposes a ``flush`` method.

.. class:: FileHandler(filename: str, mode: str = "a", encoding: str = "UTF-8")

   `StreamHandler` subclass that opens *filename* with the given *mode*
   and *encoding* and writes formatted records to it. The underlying file
   is closed on :meth:`close`.

.. class:: Formatter(fmt: str | None = None, datefmt: str | None = None)

   Renders `LogRecord` instances to strings.

   *fmt* is a printf-style template. Recognised keys are ``%(name)s``,
   ``%(message)s``, ``%(msecs)d``, ``%(asctime)s``, and ``%(levelname)s``.
   When unset it defaults to ``"%(levelname)s:%(name)s:%(message)s"``.

   *datefmt* is the ``time.strftime`` template used to render
   ``%(asctime)s``. Defaults to ``"%Y-%m-%d %H:%M:%S"``.

   .. method:: usesTime() -> bool

      Return ``True`` if the format template references ``asctime``.

   .. method:: formatTime(datefmt: str, record: LogRecord) -> str | None

      Format ``record.ct`` using ``time.strftime`` and *datefmt*. Returns
      ``None`` on platforms where ``time.strftime`` is not available.

   .. method:: format(record: LogRecord) -> str

      Render *record*. If the template uses ``asctime``,
      :meth:`formatTime` is invoked first to populate ``record.asctime``.

.. class:: LogRecord

   Container for the data passed from a `Logger` to its handlers. Instances
   are populated through :meth:`set`; logger implementations reuse a single
   record per logger to reduce allocations.

   .. attribute:: name
      :type: str

      The originating logger's name.

   .. attribute:: levelno
      :type: int

      Numeric level of this record.

   .. attribute:: levelname
      :type: str

      Textual level name.

   .. attribute:: message
      :type: str

      The fully-formatted log message.

   .. attribute:: ct
      :type: float

      Creation time as returned by ``time.time()``.

   .. attribute:: msecs
      :type: int

      Millisecond component of :attr:`ct`.

   .. attribute:: asctime
      :type: str | None

      Human-readable timestamp; populated lazily by `Formatter`.

   .. method:: set(name: str, level: int, message: str) -> None

      Initialise the record with the given values and capture the current
      time.
