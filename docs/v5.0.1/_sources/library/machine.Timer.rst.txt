.. currentmodule:: machine
.. _machine.Timer:

class Timer -- virtual periodic / one-shot timer
================================================

The :class:`Timer` class implements a software-managed virtual
timer that schedules a Python callback either once (one-shot) or
repeatedly (periodic) at a given period. Use it when you want a
lightweight cross-port way to run a callback on a schedule -- for
hardware-level features (PWM channels, input capture, encoder mode,
dead-time, break input, etc.) use :class:`pyb.Timer` instead.

Available on every OpenMV port.

Example -- periodic 10 Hz callback::

    from machine import Timer

    def tick(t):
        print("tick")

    tim = Timer(-1)
    tim.init(period=100, callback=tick)   # 100 ms = 10 Hz

Example -- run a callback once after 2 seconds::

    from machine import Timer

    def fire(t):
        print("once")

    Timer(-1).init(mode=Timer.ONE_SHOT, period=2000, callback=fire)

Constructors
------------

.. class:: Timer(id: int = -1, /, *, mode: int = PERIODIC, period: int = -1, callback: Callable[[Timer], None] | None = None)

   Construct a virtual :class:`Timer`. ``id`` must be ``-1`` (the
   only supported value). Any keyword arguments are forwarded to
   :meth:`init` so the timer can be configured in a single call.

   Methods
   -------

   .. method:: init(*, mode: int = PERIODIC, period: int = -1, callback: Callable[[Timer], None] | None = None) -> None

      Initialise / re-initialise the timer.

         * ``mode`` selects :data:`ONE_SHOT` (fire once and stop) or
           :data:`PERIODIC` (fire repeatedly).
         * ``period`` is the period in milliseconds.
         * ``callback`` is invoked when the timer fires. It receives
           the :class:`Timer` instance as its only argument.

   .. method:: deinit() -> None

      Stop the timer and cancel any pending callback.

   Constants
   ---------

   .. data:: ONE_SHOT
      :type: int

      Pass to ``mode`` so the timer fires once and then stops.

   .. data:: PERIODIC
      :type: int

      Pass to ``mode`` so the timer fires repeatedly at ``period``
      intervals.
