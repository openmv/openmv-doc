.. currentmodule:: machine
.. _machine.Encoder:

class Encoder -- quadrature decoder
===================================

The :class:`Encoder` class wraps the i.MX RT QENC hardware block
configured as a quadrature decoder. It tracks a two-phase signal
(``phase_a`` / ``phase_b``) coming from a rotary encoder, increments
or decrements a 32-bit position counter according to the phase
relationship, and can be combined with optional ``index`` / ``reset``
inputs for absolute referencing.

Available on the OpenMV Cam RT1062 (mimxrt port) only. On the
STM32-based OpenMV cams, use :class:`pyb.Timer` configured for
encoder mode (:data:`Timer.ENC_AB <pyb.Timer.ENC_AB>`) instead. Not
exposed on the OpenMV Cam AE3 (alif port).

Example usage::

    from machine import Pin, Encoder

    enc = Encoder(0, Pin("P0", Pin.IN), Pin("P1", Pin.IN), phases=4)
    enc.value(0)
    # ... rotate the encoder ...
    print("position:", enc.value())

Constructors
------------

.. class:: Encoder(id: int, phase_a: Pin | None = None, phase_b: Pin | None = None, *, phases: int = 1, filter_ns: int = 0, max: int | None = None, min: int = 0, index: Pin | None = None, reset: Pin | None = None, match: int | None = None, match_pin: Pin | None = None)

   Construct (or fetch the singleton for) the QENC encoder block
   identified by ``id``. The same arguments are also accepted by
   :meth:`init` to re-configure an existing instance.

   ``phase_a`` / ``phase_b`` are the two quadrature input pins.

   ``phases`` (keyword-only) selects the decoding granularity. The
   QENC supports ``1`` (count one edge per pulse pair), ``2`` (both
   edges of phase A) or ``4`` ("4x decoding" -- every edge of both
   phases is counted). Default ``1``.

   ``filter_ns`` (keyword-only) -- minimum input-stable time in
   nanoseconds. The driver uses the longest hardware filter that is
   less than or equal to this value. ``0`` (the default) disables
   filtering.

   ``max`` / ``min`` (keyword-only) -- modulo range of the position
   counter. When the counter rolls past ``max`` it wraps to ``min``
   and the cycles counter increments (decrements when moving the
   other way). Passing both as ``0`` disables the range.

   ``index`` (keyword-only) -- a :class:`Pin` whose rising edge
   reloads the position counter to ``min`` and updates the cycles
   counter according to direction; typical use is a Z-channel mark
   on a rotary encoder.

   ``reset`` (keyword-only) -- a :class:`Pin` whose rising edge
   reloads the position counter to the start value (without changing
   the cycles counter).

   ``match`` (keyword-only) -- position value at which an
   :data:`IRQ_MATCH` interrupt fires. Pass ``None`` to disable.

   ``match_pin`` (keyword-only) -- a :class:`Pin` driven high while
   the position counter equals ``match`` and low otherwise.

   Methods
   -------

   .. method:: init(phase_a: Pin | None = None, phase_b: Pin | None = None, *, phases: int = 1, filter_ns: int = 0, max: int | None = None, min: int = 0, index: Pin | None = None, reset: Pin | None = None, match: int | None = None, match_pin: Pin | None = None) -> None

      Re-initialise the encoder with the given parameters and reset
      its position and cycles counters. Accepts the same keyword
      arguments as the constructor.

   .. method:: deinit() -> None

      Stop the encoder, disable any pending interrupts and release
      the QENC hardware resources. A soft reset deinitialises all
      :class:`Encoder` instances automatically.

   .. method:: value() -> int
               value(value: int, /) -> int

      Get or set the signed position counter.

      With no argument, return the current position.

      With a single ``value`` argument, atomically set the position
      counter to ``value`` and return the previous count. The common
      idiom ``enc.value(0)`` resets the counter at the start of a
      measurement window.

   .. method:: cycles() -> int
               cycles(value: int, /) -> int

      Get or set the cycles counter, a signed 16-bit integer that
      tracks how many times the position counter has rolled past
      ``max`` / ``min``.

      With no argument, return the current cycles count.

      With a single ``value`` argument, set the cycles counter to
      ``value`` (without touching the position counter) and return
      the previous count.

   .. method:: irq(handler: Callable[[Encoder], None] | None = None, trigger: int = 0, hard: bool = False) -> None

      Register a callback to be invoked when one of the supported
      QENC events fires. The handler receives the :class:`Encoder`
      object as its only argument; the specific event can be
      identified inside the handler via ``irq.flags()``.

      ``trigger`` is a bitmask of one or more :data:`IRQ_*`
      constants:

         * :data:`IRQ_RESET` -- the ``reset`` pin asserted.
         * :data:`IRQ_INDEX` -- the ``index`` pin asserted.
         * :data:`IRQ_MATCH` -- the position counter reached
           ``match``. Match is one-shot and must be re-armed by
           re-installing the IRQ.
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

   .. data:: IRQ_RESET
      :type: int

      :meth:`irq` trigger flag for the ``reset`` pin event.

   .. data:: IRQ_INDEX
      :type: int

      :meth:`irq` trigger flag for the ``index`` pin event.

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
