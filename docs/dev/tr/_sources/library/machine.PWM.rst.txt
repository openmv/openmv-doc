.. currentmodule:: machine
.. _machine.PWM:

class PWM -- pulse-width modulation
===================================

The :class:`PWM` class outputs a pulse-width-modulated signal on a
:class:`Pin`. It is the modern, cross-port API for PWM; on STM32
OpenMV cams it wraps the underlying :class:`pyb.Timer` channel
machinery, so each :class:`PWM` instance ties up one timer channel.

Example usage::

    from machine import PWM, Pin

    # 50 Hz PWM on a header pin with a 12.5 % duty.
    pwm = PWM(Pin("P7"), freq=50, duty_u16=8192)

    pwm.duty_u16(32768)            # change duty to 50 %
    pwm.init(freq=5000, duty_ns=5000)  # re-init at 5 kHz, 5 us pulse
    pwm.duty_ns(3000)              # 3 us pulse

    pwm.deinit()

Constructors
------------

.. class:: PWM(dest: Pin | int, *, freq: int | None = None, duty_u16: int | None = None, duty_ns: int | None = None, invert: bool = False)

   Construct a :class:`PWM` object driving ``dest`` (a :class:`Pin`
   on OpenMV cams). The keyword arguments are equivalent to calling
   :meth:`init` immediately after construction:

      - ``freq`` -- PWM frequency in Hz.
      - ``duty_u16`` -- duty cycle as a ratio ``duty_u16 / 65535``.
      - ``duty_ns`` -- pulse width in nanoseconds.
      - ``invert`` -- if ``True``, invert the output polarity.

   At most one of ``duty_u16`` / ``duty_ns`` may be passed at a
   time. Setting ``freq`` may affect other :class:`PWM` instances
   that share the same underlying timer (true on STM32 -- every
   channel of a given TIM runs at the same frequency).

   Methods
   -------

   .. method:: init(*, freq: int | None = None, duty_u16: int | None = None, duty_ns: int | None = None) -> None

      Reconfigure the PWM output. Only arguments supplied are
      updated; the others retain their previous values. See the
      constructor for the meaning of each argument.

   .. method:: deinit() -> None

      Disable the PWM output and release the timer channel it
      occupied.

   .. method:: freq() -> int
               freq(value: int, /) -> None

      Get or set the PWM frequency.

      With no argument, return the current frequency in Hz.

      With a single ``value`` argument, set the frequency to that
      value in Hz. May raise ``ValueError`` if the frequency is
      outside the range achievable by the underlying timer.

   .. method:: duty_u16() -> int
               duty_u16(value: int, /) -> None

      Get or set the duty cycle as an unsigned 16-bit value in the
      range ``0`` -- ``65535``.

      With no argument, return the current duty.

      With a single ``value`` argument, set the duty cycle to
      ``value / 65535`` of the period. ``0`` is always low,
      ``65535`` is always high.

   .. method:: duty_ns() -> int
               duty_ns(value: int, /) -> None

      Get or set the pulse width directly in nanoseconds.

      With no argument, return the current pulse width.

      With a single ``value`` argument, set the high-time of each
      cycle to ``value`` nanoseconds. Useful for servo-style outputs
      where the pulse width is the meaningful quantity rather than
      the duty ratio.

Limitations
-----------

* PWM frequency and duty resolution are interdependent on every
  hardware timer: at high frequencies, fewer counter steps fit in a
  period and so fewer low bits of ``duty_u16`` are meaningful.

* The achievable PWM frequency depends on the timer's clock source
  and prescaler. STM32 TIM2 / TIM5 are 32-bit on most parts (and
  TIM3 / TIM4 as well on the STM32N6), giving wider frequency and
  duty ranges; the remaining timers are 16-bit. See the relevant
  MCU reference manual for the exact ranges.

* On STM32 multiple :class:`PWM` channels on the same TIM share a
  frequency. Setting :meth:`freq` on one instance changes the
  output of every other channel attached to that TIM.
