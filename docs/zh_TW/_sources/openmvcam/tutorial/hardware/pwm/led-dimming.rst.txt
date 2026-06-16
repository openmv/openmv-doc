LED dimming with PWM
====================

The :doc:`../analog/analog-output` page used an RC low-pass
filter to extract a DC voltage from a PWM signal. For an LED,
the filter is not needed -- the human eye itself does the
averaging.

When an LED is switched on and off faster than about 60 Hz,
the visual system stops resolving individual pulses and
perceives a steady brightness equal to the average light
output. A 50 % duty cycle reads as roughly half brightness;
25 % as a quarter; 10 % as dim.

The wiring is the same as for a static external LED on
:doc:`../gpio-output/gpio-output` -- a current-limiting
resistor in series with the LED, sized using the rules from
:doc:`../gpio-output/electronics-basics`. The change is only in
software: the pin runs as a :class:`~machine.PWM` output
instead of a plain :data:`Pin.OUT <machine.Pin.OUT>`.

Picking the frequency
---------------------

For LED dimming the PWM frequency only has to clear the eye's
flicker threshold:

* Below ~60 Hz the eye sees the pulses outright.
* Below ~200 Hz peripheral vision and rapid eye motion can
  still reveal flicker.
* 1 kHz is comfortably above all of that and is a typical
  default.

There is no upper bound that matters for a small LED on a GPIO;
anything from 1 kHz to 10 kHz behaves the same to the eye.

Fading
------

A fade-in / fade-out loop sweeps the duty cycle from off to
fully on and back, dwelling briefly at each step:

::

    import time
    from machine import PWM, Pin

    led = PWM(Pin("P7"), freq=1000, duty_u16=0)

    while True:
        for d in range(0, 65535, 256):
            led.duty_u16(d)
            time.sleep_ms(5)
        for d in range(65535, 0, -256):
            led.duty_u16(d)
            time.sleep_ms(5)

At 1 kHz PWM and 5 ms steps the eye sees a smooth fade in both
directions, with the apparent brightness tracking the duty
value.

Perceived brightness is not strictly linear in duty cycle --
the eye's response follows roughly a square or cube law -- so
a linear sweep of ``duty_u16`` does not look like a linear
sweep of brightness. For a perceptually smoother fade, step
the duty on a curve.

A convenient integer-only trick is to step an 8-bit counter
and use its square as the duty cycle. ``255 × 255 = 65025`` is
within rounding of full scale, so the sweep covers the whole
range:

::

    import time
    from machine import PWM, Pin

    led = PWM(Pin("P7"), freq=1000, duty_u16=0)

    while True:
        for step in range(256):
            led.duty_u16(step * step)   # 0..65025, roughly quadratic
            time.sleep_ms(5)
        for step in range(255, -1, -1):
            led.duty_u16(step * step)
            time.sleep_ms(5)

The fade now feels roughly even in apparent brightness from off
to full.
