.. currentmodule:: machine
.. _machine.Counter:

class Counter -- pulse counter
==============================

The :class:`Counter` class wraps the i.MX RT QENC (quadrature
encoder / counter) hardware block configured as a single-input
pulse counter. Each rising edge on the source pin increments (or
decrements) a hardware position counter; software callbacks can be
attached to ROLL_OVER / ROLL_UNDER / RESET / INDEX / MATCH events.

Available on the OpenMV Cam RT1062 (mimxrt port) only. On the
STM32-based OpenMV cams, use :class:`pyb.Timer` configured for
input-capture instead. Not exposed on the OpenMV Cam AE3 (alif
port).

Example usage::

    from machine import Pin, Counter

    counter = Counter(0, Pin("P0", Pin.IN))
    counter.value(0)
    # ... wait some time ...
    print("pulses:", counter.value())

Constructors
------------

.. class:: Counter(id: int, src: Pin | None = None, *, direction: int | Pin = UP, filter_ns: int = 0, max: int | None = None, min: int = 0, reset: Pin | None = None, match: int | None = None, match_pin: Pin | None = None)

   Construct (or fetch the singleton for) the QENC counter block
   identified by ``id``. RT1062 has multiple QENC blocks (``id``
   selects one); the same arguments are also accepted by
   :meth:`init` to re-configure an existing instance.

   ``src`` -- the input pin whose rising edges are counted.

   ``direction`` (keyword-only) -- either :data:`UP` / :data:`DOWN`
   to set a fixed direction, or a :class:`Pin` whose logic level
   selects the direction at runtime (low = count up, high = count
   down).

   ``filter_ns`` (keyword-only) -- minimum input-stable time in
   nanoseconds for a pulse to be counted. The driver uses the
   longest hardware filter that is less than or equal to this value.
   ``0`` (the default) disables filtering.

   ``max`` / ``min`` (keyword-only) -- modulo range of the position
   counter. When the counter rolls past ``max`` it wraps to ``min``
   and the cycles counter increments (decrements when counting
   down). Passing both ``max`` and ``min`` as ``0`` disables the
   range.

   ``reset`` (keyword-only) -- a :class:`Pin` whose rising edge
   reloads the position counter to the start value (without changing
   the cycles counter).

   ``match`` (keyword-only) -- counter value at which an
   :data:`IRQ_MATCH` interrupt fires. Pass ``None`` to disable.

   ``match_pin`` (keyword-only) -- a :class:`Pin` driven high while
   the position counter equals ``match`` and low otherwise.

   Methods
   -------

   .. method:: init(src: Pin | None = None, *, direction: int | Pin = UP, filter_ns: int = 0, max: int | None = None, min: int = 0, reset: Pin | None = None, match: int | None = None, match_pin: Pin | None = None) -> None

      Re-initialise the counter with the given parameters and reset
      its position and cycles counters. Accepts the same keyword
      arguments as the constructor.

   .. method:: deinit() -> None

      Stop the counter, disable any pending interrupts and release
      the QENC hardware resources. A soft reset deinitialises all
      :class:`Counter` instances automatically.

   .. method:: value() -> int
               value(value: int, /) -> int

      Get or set the signed position counter.

      With no argument, return the current count.

      With a single ``value`` argument, atomically set the position
      counter to ``value`` and return the previous count. The common
      idiom ``counter.value(0)`` resets the counter at the start of
      a measurement window.

   .. method:: cycles() -> int
               cycles(value: int, /) -> int

      Get or set the cycles counter, a signed 16-bit integer that
      tracks how many times the position counter has rolled past
      ``max`` / ``min``.

      With no argument, return the current cycles count.

      With a single ``value`` argument, set the cycles counter to
      ``value`` (without touching the position counter) and return
      the previous count.

   .. method:: irq(handler: Callable[[Counter], None] | None = None, trigger: int = 0, hard: bool = False) -> None

      Register a callback to be invoked when one of the supported
      QENC events fires. The handler receives the :class:`Counter`
      object as its only argument; the specific event can be
      identified inside the handler via ``irq.flags()``.

      ``trigger`` is a bitmask of one or more :data:`IRQ_*`
      constants:

         * :data:`IRQ_RESET` -- the ``reset`` pin asserted.
         * :data:`IRQ_INDEX` -- a transition on the ``index`` line.
         * :data:`IRQ_MATCH` -- the position counter reached
           ``match``. Match is auto-disabled after firing and must
           be re-armed by re-installing the IRQ.
         * :data:`IRQ_ROLL_OVER` -- the position counter wrapped
           from ``max`` to ``min``.
         * :data:`IRQ_ROLL_UNDER` -- the position counter wrapped
           from ``min`` to ``max``.

      ``hard=True`` registers a hard interrupt handler (lower
      latency, but the handler must not allocate). The default is a
      scheduled callback. Pass ``handler=None`` to disable the
      interrupt.

   Constants
   ---------

   .. data:: UP
      :type: int

      Pass to ``direction`` to count rising edges as positive.

   .. data:: DOWN
      :type: int

      Pass to ``direction`` to count rising edges as negative.

   .. data:: IRQ_RESET
      :type: int

      :meth:`irq` trigger flag for the ``reset`` pin event.

   .. data:: IRQ_INDEX
      :type: int

      :meth:`irq` trigger flag for the index-input event.

   .. data:: IRQ_MATCH
      :type: int

      :meth:`irq` trigger flag for the position-match event.

   .. data:: IRQ_ROLL_OVER
      :type: int

      :meth:`irq` trigger flag for a counter roll-over (``max`` ->
      ``min``).

   .. data:: IRQ_ROLL_UNDER
      :type: int

      :meth:`irq` trigger flag for a counter roll-under (``min`` ->
      ``max``).
