Bit streams and pulse measurement
=================================

Some devices need precisely-timed pulse patterns rather than
a constant-frequency PWM signal. A WS2812 RGB LED encodes each
bit as a pulse of a specific width; an HC-SR04 ultrasonic
ranger answers with an echo pulse whose width is the
round-trip flight time; an IR remote sends a header followed
by data bits as on-off sequences.

The :mod:`machine` module has two functions for this kind of
timing-precise GPIO:

* :func:`~machine.bitstream` sends a pulse train with a
  separate timing for ``0`` and ``1`` bits.
* :func:`~machine.time_pulse_us` measures the width of an
  incoming pulse in microseconds.

Sending a bit stream
--------------------

:func:`machine.bitstream` takes a pin, an encoding, a timing
specification, and the bytes to send. The most common
encoding (``0``) is *high-low* pulse-duration modulation:
each bit is a high pulse of one width followed by a low pulse
of another, with ``0`` and ``1`` bits having distinct timings.

.. figure:: ../figures/bitstream-encoding.svg
   :alt: Two stacked waveforms. The top one shows a 0 bit: a
         brief high pulse (high_0) followed by a longer low
         period (low_0). The bottom one shows a 1 bit: a longer
         high pulse (high_1) followed by a shorter low period
         (low_1).

   The high-low pulse-duration encoding: a ``0`` and a ``1``
   each consist of a high phase followed by a low phase, with
   distinct widths.

The canonical example is the WS2812 (NeoPixel) RGB LED, which
expects bits at 800 kHz with these timings:

* ``0``: 400 ns high, then 850 ns low.
* ``1``: 800 ns high, then 450 ns low.

::

    from machine import Pin, bitstream

    pin = Pin("P7", Pin.OUT)

    # (high_0, low_0, high_1, low_1) in nanoseconds
    timing = (400, 850, 800, 450)

    # one LED: GRB order, three bytes per LED (red shown here)
    bitstream(pin, 0, timing, b"\x00\xff\x00")

The MCU bit-bangs the pulses at the requested widths; on cams
fast enough for it the timing is accurate to within tens of
nanoseconds.

.. warning::

   :func:`~machine.bitstream` disables all interrupts for the
   entire transmission so it can keep precise control over the
   pulse timing. The call duration scales linearly with the
   number of bytes -- at WS2812 timing (about 10 µs per byte),
   sending 100 bytes pauses the CPU for around 1 ms, 1000
   bytes for 10 ms, and 10000 bytes for a full 100 ms.
   Anything beyond a few hundred bytes per call risks
   noticeable lock-ups -- break long updates into smaller
   chunks, with the call returning between each chunk so the
   rest of the script can run.

.. note::

   For driving WS2812 / NeoPixel strips in particular, the
   :mod:`neopixel` module wraps :func:`~machine.bitstream` in
   a higher-level interface that handles colour-order
   shuffling and bulk strip updates. Reach for
   :func:`~machine.bitstream` directly when the protocol is
   *not* WS2812 but still fits a high-low PDM shape.

Measuring an incoming pulse
---------------------------

:func:`machine.time_pulse_us` measures the width of a single
pulse on a pin. It waits for the line to reach the specified
level (the start of the pulse), then measures how long the
line stays at that level (the end of the pulse), and returns
the duration in microseconds.

The classic use is an HC-SR04 ultrasonic distance sensor. The
camera sends a 10 µs trigger pulse, then waits for the echo
pin to return a pulse whose width is the round-trip time of
the sound:

::

    import time
    from machine import Pin, time_pulse_us

    trigger = Pin("P7", Pin.OUT, value=0)
    echo    = Pin("P8", Pin.IN)

    while True:
        trigger.value(1)
        time.sleep_us(10)
        trigger.value(0)

        width = time_pulse_us(echo, 1, timeout_us=30_000)
        if width > 0:
            # sound at ~343 m/s; round trip / 2 / 343 = distance (m)
            distance_cm = (width * 343) / 2 / 10_000
            print(distance_cm, "cm")

        time.sleep_ms(100)

The third argument is the timeout in microseconds, applied
separately to "wait for the pulse to start" and "wait for the
pulse to end". On timeout the function returns a negative
value identifying which phase failed: ``-2`` if the pulse
never started, ``-1`` if it started but never ended within
the window.

Both halves of the timeout matter for real sensors. An HC-SR04
can take one to two milliseconds to start its echo, and the
echo itself can be tens of milliseconds long for far objects.
Sizing ``timeout_us`` to the maximum range needed keeps the
measurement bounded.
