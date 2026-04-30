:mod:`tb6612` --- TB6612 motor driver
=====================================

.. module:: tb6612
   :synopsis: TB6612 DC and stepper motor driver.

The ``tb6612`` module provides a driver for the TB6612 motor driver. It exposes
a :class:`Motor` class for driving a single DC motor on one of two channels and
a :class:`Stepper` class for driving a 4-wire stepper motor.

Both classes use ``pyb.Timer(4)`` at 1 kHz on pins ``P7`` and ``P8`` for PWM
power output. The :class:`Motor` direction pins are ``P3``/``P2`` (channel 1)
and ``P1``/``P0`` (channel 2). The :class:`Stepper` uses all four pins
(``P3``, ``P2``, ``P1``, ``P0``) plus both PWM channels.

Example::

    from tb6612 import Motor, Stepper

    m = Motor(1)
    m.set_speed(50)      # 50% duty forward

    s = Stepper(stepnumber=200, rpms=2, power=50)
    s.step(100)          # advance 100 steps


class Motor
-----------

.. class:: Motor(channel: int)

   Construct a DC motor controller bound to one of the two TB6612 channels.

   - ``channel``: Motor channel number. ``1`` uses direction pins ``P3``/``P2``
     and PWM pin ``P7`` (timer 4, channel 1). ``2`` uses direction pins
     ``P1``/``P0`` and PWM pin ``P8`` (timer 4, channel 2).

   .. method:: set_speed(pwm: int) -> None

      Set the motor speed and direction.

      - ``pwm``: Signed duty cycle in the range ``-100`` to ``100``. Positive
        values drive the motor forward, negative values drive it in reverse.
        The absolute value is applied as the PWM duty cycle percentage to the
        power pin.


class Stepper
-------------

.. class:: Stepper(stepnumber: int = 200, rpms: int = 2, power: int = 50)

   Construct a 4-wire stepper motor controller. Initializes direction pins
   ``P3``, ``P2``, ``P1``, ``P0`` and the two PWM power channels on ``P7`` and
   ``P8``, then applies the requested speed and power.

   - ``stepnumber``: Number of full steps per revolution of the connected
     stepper motor. Used together with ``rpms`` to compute the inter-step
     delay.
   - ``rpms``: Target rotation speed in revolutions per minute. Forwarded to
     :meth:`set_speed`.
   - ``power``: PWM duty cycle percentage (0-100) applied to both power
     channels. Forwarded to :meth:`set_power`.

   .. method:: phase_list() -> Generator[tuple[int, int, int, int], None, None]

      Generator that endlessly yields the four-phase drive pattern
      ``(1, 0, 0, 0)``, ``(0, 0, 1, 0)``, ``(0, 1, 0, 0)``, ``(0, 0, 0, 1)``
      used by :meth:`step`. Each tuple element is the value to write to
      ``pin1``, ``pin2``, ``pin3``, ``pin4`` respectively.

   .. method:: set_speed(rpms: int) -> None

      Update the stepping speed.

      - ``rpms``: Target rotation speed in revolutions per minute. The
        per-half-step delay (in microseconds) is recomputed as
        ``1000000 / (rpms * stepnumber) / 2``.

   .. method:: set_power(power: int) -> None

      Set the PWM duty cycle applied to both power channels.

      - ``power``: Duty cycle percentage in the range ``0`` to ``100``.

   .. method:: step(num: int) -> None

      Advance the stepper by ``num`` phase transitions, applying the next
      phase from :meth:`phase_list` and waiting the configured inter-step
      delay (via ``pyb.udelay``) between transitions.

      - ``num``: Number of phase steps to advance. Each call to ``step``
        advances exactly this many phases; direction is fixed (the underlying
        phase generator only iterates forward).
