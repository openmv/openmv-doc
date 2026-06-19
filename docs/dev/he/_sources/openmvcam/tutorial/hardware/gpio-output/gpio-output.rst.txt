GPIO output
===========

:class:`machine.LED` abstracts away the wiring of the camera's
built-in indicators. Driving any *external* piece of hardware
starts with :class:`machine.Pin` in output mode -- the raw
peripheral underneath every other GPIO interaction.

Driving a pin
-------------

Construct a pin with :data:`Pin.OUT <machine.Pin.OUT>` to make
it an output, then set its value:

::

    from machine import Pin

    led = Pin("P0", Pin.OUT)
    led.on()           # drive high (about 3.3 V)
    led.off()          # drive low (about 0 V)

Three equivalent ways to set the state, all on
:class:`machine.Pin`:

* :meth:`~machine.Pin.on` / :meth:`~machine.Pin.off` -- the
  common shortcuts.
* :meth:`pin.value(1) <machine.Pin.value>` /
  :meth:`pin.value(0) <machine.Pin.value>` -- the explicit
  form.

Calling :meth:`~machine.Pin.value` with no arguments reads back
the current state of the pin -- which works for both inputs
and outputs.

Driving an external LED
-----------------------

A red LED at 10 mA from 3.3 V needs about 130 Ω in series (the
electronics page works out the math). Wire pin ``P0`` through
that resistor to the LED's anode, the LED's cathode to ground.
A blinker:

::

    import time
    from machine import Pin

    led = Pin("P0", Pin.OUT)

    while True:
        led.on()
        time.sleep_ms(500)
        led.off()
        time.sleep_ms(500)

The LED toggles on and off once per second. The current through
the LED (and so its brightness) is set by the resistor; the
on / off duty controls only how often it lights up, not how
bright it appears while it is on.

.. tip::

   The constructor accepts an initial value as a keyword
   argument: ``Pin("P0", Pin.OUT, value=0)`` configures the
   pin as an output that starts low. Without it, the pin
   briefly takes whatever its default state was before the
   first :meth:`~machine.Pin.value` call.

Open-drain mode
---------------

The default :data:`Pin.OUT <machine.Pin.OUT>` mode is
push-pull: the pin actively drives both high (to the supply)
and low (to ground). Sometimes that is wrong. Reach for
:data:`Pin.OPEN_DRAIN <machine.Pin.OPEN_DRAIN>` when the pin
should either pull the line low or release it (float):

::

    pin = Pin("P0", Pin.OPEN_DRAIN)
    pin.off()       # actively drive low
    pin.on()        # release; an external pull-up brings the line high

The main use is sharing a wire. Multiple open-drain outputs
can share a single line because none of them actively drive
it high. Any one of them can pull the line low; if all of them
release, an external pull-up brings the line high. This is the
wiring convention behind shared communication buses.

.. warning::

   Open-drain is *not* a general solution for driving a
   higher-voltage device. Connecting an open-drain pin to a
   pull-up at 5 V is safe on a 5 V-tolerant pin but damages
   a non-tolerant one through its on-chip protection diodes
   as soon as the pin releases and the line floats up to 5 V.
   Cross-voltage signalling needs a proper level shifter; see
   :doc:`level-shifting` for the circuit.
