Generating analog with PWM and an RC filter
===========================================

The ADC reads voltages on a pin. The opposite -- producing an
intermediate voltage between 0 V and Vcc on a pin -- is harder,
because a GPIO output only knows how to drive its two rails.
The standard substitute is to switch the pin between the rails
fast enough that the *average* voltage is what you care about.

Pulse-width modulation
----------------------

A pulse-width-modulated (PWM) signal is a square wave at a
fixed frequency whose high-time -- the fraction of each cycle
spent at Vcc instead of ground -- is set in software. That
fraction is the *duty cycle*. The average voltage of the
waveform is the duty cycle times Vcc:

::

    V_avg = duty × Vcc

A 25 % duty cycle averages to ``Vcc / 4``; a 50 % duty cycle to
``Vcc / 2``; a 75 % duty cycle to ``3 × Vcc / 4``.

.. figure:: ../figures/pwm-duty-cycle.svg
   :alt: Three square-wave traces stacked vertically, each at
         the same frequency. The top wave is high for 25 % of
         each period and low for 75 %. The middle wave is high
         and low for half the period each. The bottom wave is
         high for 75 % and low for 25 %.

   PWM at 25 %, 50 %, and 75 % duty cycle. The average voltage
   tracks the duty cycle.

The frequency is set when the PWM is configured; the duty cycle
is what software changes on the fly. The :class:`machine.PWM`
class wraps a hardware timer channel that generates the
waveform without CPU help -- once configured, the signal
continues at the chosen frequency and duty cycle until changed.

The machine.PWM class
---------------------

Construct a :class:`~machine.PWM` instance with the pin and an
initial frequency and duty:

::

    from machine import PWM, Pin

    pwm = PWM(Pin("P7"), freq=20_000, duty_u16=32768)

That starts a 20 kHz square wave at 50 % duty on ``P7``. Two
methods change the output on the fly:

::

    pwm.duty_u16(16384)   # change to 25 % (16384 / 65535)
    pwm.freq(5_000)       # change to 5 kHz

:meth:`~machine.PWM.duty_u16` takes an unsigned 16-bit integer
mapping ``0`` to "always low" and ``65535`` to "always high".
:meth:`~machine.PWM.freq` sets the carrier frequency in hertz.

.. note::

   Every PWM channel on the same hardware timer shares its
   frequency. Calling :meth:`~machine.PWM.freq` on one channel
   changes every other channel attached to that timer. Use
   channels of different timers when outputs must run at
   different frequencies.

Call :meth:`~machine.PWM.deinit` to release the timer channel
when the output is no longer needed.

Averaging with an RC low-pass filter
------------------------------------

Raw PWM is not a smooth voltage; it is a square wave whose
average is what we want. To extract that average, pass the
PWM through a low-pass filter -- the same resistor-and-capacitor
combination used for switch debouncing in
:doc:`../gpio-input/debouncing`.

.. figure:: ../figures/rc-lowpass-pwm.svg
   :alt: A PWM pin connects through a series resistor R to an
         output node. A capacitor C from that node to ground
         completes the low-pass filter; the smoothed voltage
         appears at V_out.

   PWM through an RC low-pass filter: the capacitor averages
   the square wave into a DC voltage proportional to the duty
   cycle.

The filter's *cutoff frequency* -- the boundary between
frequencies it passes and those it blocks -- is set by the same
``RC`` product that gave the time constant for the debounce
circuit:

::

    f_c = 1 / (2π × R × C)

For the filter to extract a clean DC voltage from a PWM input,
the cutoff frequency must be much lower than the PWM frequency
itself. The DC component (frequency 0) passes through
unchanged; the PWM's fundamental harmonic (at the PWM
frequency) is attenuated by roughly ``f_c / f_PWM``. A ratio of
``1 / 200`` cuts the residual ripple at the output to about
``0.5 %`` of the input swing.

A reasonable starting point for a slow-changing setpoint:

* PWM frequency ``f_PWM = 20 kHz`` -- well above audio, and
  easy for the timer to generate cleanly.
* Filter values ``R = 1.6 kΩ``, ``C = 1 µF`` -- giving
  ``f_c = 1 / (2π × 1.6 kΩ × 1 µF) ≈ 100 Hz``.

The 200× suppression at the carrier reduces the PWM's full
swing down to roughly ``Vcc / 200`` of residual ripple at
``V_out`` -- about 16 mV at 3.3 V.

Two practical notes:

* The filter's output impedance is roughly ``R``. Any
  downstream load that draws current turns ``R`` and the load
  into a divider that pulls ``V_out`` below the ideal average,
  exactly like the divider on the
  :doc:`adc` page. Feed an ADC pin or a high-impedance buffer,
  not a load that sinks milliamps.
* The cap takes about ``5 × R × C ≈ 8 ms`` to settle when the
  duty cycle changes; ``V_out`` lags the duty setting by that
  much. For a setpoint that needs to update faster, raise the
  cutoff (smaller ``R`` or ``C``) and accept more ripple.
