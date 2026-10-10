Pins and peripherals
====================

A pin is the simplest peripheral on the MCU: a single wire that
connects the chip to the outside world. Every interaction with
real hardware -- driving an LED, reading a switch, measuring a
voltage, sending bytes over a serial line -- ultimately routes
through one or more pins.

Pin modes
---------

A pin is configured into one of a few *modes* before it does
anything useful:

* :data:`Pin.IN <machine.Pin.IN>` -- input. The pin observes
  the voltage applied to it from outside and reports it as
  ``0`` (low) or ``1`` (high).
* :data:`Pin.OUT <machine.Pin.OUT>` -- output. The pin drives
  itself either to the supply voltage (``1``) or to ground
  (``0``), so external components see that voltage.
* :data:`Pin.OPEN_DRAIN <machine.Pin.OPEN_DRAIN>` -- output
  that can only pull the line low. To go high, the pin
  releases (floats) and an external pull-up resistor lifts the
  line. Used for shared buses where multiple devices may drive
  the same line.

Inputs can optionally enable an internal *pull resistor* that
guarantees a defined level when nothing external is driving
the pin:

* :data:`Pin.PULL_UP <machine.Pin.PULL_UP>` -- weak pull to
  the supply rail.
* :data:`Pin.PULL_DOWN <machine.Pin.PULL_DOWN>` -- weak pull
  to ground.

The constructor takes id, mode, and pull as positional
arguments:

::

    from machine import Pin

    led    = Pin("P0", Pin.OUT)
    button = Pin("P1", Pin.IN, Pin.PULL_UP)

Alternate functions
-------------------

Most pins have an *alternate function* in addition to their
GPIO role. A single physical pad on the chip can be:

* A digital input or output (:class:`machine.Pin`).
* An ADC input that measures voltage
  (:class:`machine.ADC`).
* A PWM output that emits a square wave
  (:class:`machine.PWM`).
* The TX or RX line of a UART
  (:class:`machine.UART`).

Other peripherals (further serial buses, timers, and so on)
also claim specific pins; the chip designer wires each hardware
block to a fixed set of pads. The ADC samples only pins routed
to its multiplexer; a UART transmits on the one pin its TX
signal is wired to.

.. note::

   OpenMV cams label the external connector pins ``P0`` to
   ``P9`` (varies slightly by board). Which pin carries which
   alternate function is board-specific; see the :doc:`OpenMV
   Cam quick reference </openmvcam/quickref>` for the table.

Board variations
----------------

A few details vary by board and should always be checked
against the quickref rather than assumed from another board:

* **Voltage tolerance.** Some cams have 5 V-tolerant I/O pins
  (a 5 V signal can be applied directly without damage);
  others run their I/O at 3.3 V or 1.8 V and require a level
  shifter for any signal above that. Connecting a 5 V source
  to a non-tolerant pin can damage the chip.
* **ADC reference.** The voltage the ADC treats as full-scale
  depends on the board's I/O supply.
  :meth:`~machine.ADC.read_u16` always returns ``0..65535``,
  but the voltage that ``65535`` represents is whatever the
  board's reference is.
* **Drive strength.** A GPIO pin can source or sink a limited
  current -- typically tens of milliamps. Enough for a small
  LED through a resistor; not enough for a motor, a buzzer,
  or any inductive load. Reach for an external driver
  (transistor, MOSFET, H-bridge) for anything heavier.

The :doc:`OpenMV Cam quick reference </openmvcam/quickref>`
gives the exact numbers per board.
