:mod:`pid` --- Proportional-Integral-Derivative controller
==========================================================

.. module:: pid
   :synopsis: PID controller

The :mod:`pid` module provides a simple Proportional-Integral-Derivative
(PID) controller class with derivative low-pass filtering and integrator
windup clamping.

Example::

    from pid import PID

    pid1 = PID(p=0.07, i=0, imax=90)
    while True:
        error = 50  # error should be calculated as: target - measure
        output = pid1.get_pid(error, 1)
        # control value with output



class PID
---------

.. class:: PID(p: float = 0, i: float = 0, d: float = 0, imax: float = 0)

   Construct a PID controller.

   - ``p`` is the proportional gain (``Kp``).
   - ``i`` is the integral gain (``Ki``).
   - ``d`` is the derivative gain (``Kd``).
   - ``imax`` is the absolute maximum value the integrator term is
     clamped to (anti-windup limit). The integrator output is bounded
     to the range ``[-abs(imax), +abs(imax)]``.

   The derivative term is filtered by a fixed first-order low-pass
   filter with a cutoff frequency of 20 Hz.

   .. method:: get_pid(error: float, scaler: float) -> float

      Compute and return the PID controller output for the given ``error``.

      - ``error`` is the current error (typically ``target - measurement``).
      - ``scaler`` is a multiplicative scale factor applied to the
        proportional + derivative sum and to the integrator increment.

      The time delta between successive calls is measured internally using
      ``time.ticks_ms()``. If more than 1000 ms elapse between calls (or on
      the first call), the integrator is reset via :meth:`PID.reset_I` and
      the time delta is treated as zero for that step.

      Returns the PID output as a ``float``.

   .. method:: reset_I() -> None

      Reset the integrator state. Clears the accumulated integral term to
      zero and clears the cached derivative value (set to ``NaN``) so that
      the next call to :meth:`PID.get_pid` re-initialises the derivative
      filter.
