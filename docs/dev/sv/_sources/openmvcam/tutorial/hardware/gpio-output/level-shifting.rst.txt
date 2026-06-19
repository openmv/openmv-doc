Level shifting
==============

A GPIO pin on the camera drives about 3.3 V when high. A
device on the other side may run at 5 V (older
microcontrollers, many sensor boards) or 1.8 V (newer sensors,
some chip-to-chip buses). Connecting the two directly is
sometimes safe and sometimes destructive; *level shifting* is
the circuit that bridges the gap reliably.

Why direct cross-voltage drive can hurt a pin
---------------------------------------------

Every chip's I/O pad has a pair of built-in *protection
diodes*: one from the pin to ground, one from the pin to the
chip's supply rail. They are there to absorb *electrostatic
discharge* (ESD) -- a brief, high-voltage spike from static
electricity that can hit a pin when the board is handled. A
person who has walked across a carpet can carry several
kilovolts of static; touching the wrong pin transfers that
charge to the chip in nanoseconds. The upper protection diode
forward-biases and shunts the pulse safely into the supply
rail before it reaches the transistors inside the chip.

When a 5 V signal is applied *continuously* to a 3.3 V pin
that is not 5 V-tolerant, the upper protection diode conducts
*forever*. The diodes are sized for short ESD pulses, not
steady-state current; the supply rail starts rising above
3.3 V, the diode heats up, and either the pin or the on-chip
voltage regulator fails.

5 V-tolerant pins use a different input stage -- the upper
diode goes to a higher rail or is absent -- so applying 5 V is
harmless. Whether a board's pins are 5 V-tolerant varies by
board; check the :doc:`OpenMV Cam quick reference
</openmvcam/quickref>`.

The other direction has its own problem. A 3.3 V GPIO driving
high produces ~3.3 V on the wire. A 5 V receiver that needs
``0.7 × Vcc`` to recognise *high* sees its threshold at
3.5 V; 3.3 V may read as low or as ambiguous. Even with no
damage, the signal does not work reliably.

A level shifter solves both directions.

The N-MOSFET as a switch
------------------------

The circuits below use a single N-channel MOSFET. It has three
pins -- *gate*, *drain*, and *source* -- and behaves as an
electrically-controlled switch.

The control input is the voltage *between* the gate and the
source, written ``Vgs`` (gate-to-source voltage):

::

    Vgs = (gate voltage) - (source voltage)

The MOSFET cares about this *difference*, not the absolute
voltage on either pin alone. Its behaviour follows from
``Vgs``:

* When ``Vgs`` is above the MOSFET's *threshold voltage*
  (typically around 1 V for a small-signal logic-level part),
  the transistor turns *on* and current flows freely from
  drain to source.
* When ``Vgs`` is at or below 0, the transistor turns *off*
  and almost no current flows from drain to source.

The drain-source path is the switched current path; ``Vgs``
opens or closes that switch.

An N-MOSFET also has a *body diode* between drain and source
that conducts when the drain is pulled below the source by
more than ~0.6 V. The diode is a side-effect of the
manufacturing; the bidirectional shifter below uses it on
purpose.

Wiring rules
~~~~~~~~~~~~

An N-MOSFET is *not* a symmetric three-terminal device. The
body diode points from source (anode) to drain (cathode), and
``Vgs`` is what controls the channel. Two rules follow and
must hold for every N-MOSFET switch circuit:

* **Source goes to the lower voltage; drain goes to the
  higher.** With drain at the higher rail the body diode is
  reverse-biased and does nothing. Swap them and the body
  diode is forward-biased all the time: current flows from
  the now-higher source through the body diode to the
  now-lower drain regardless of what the gate is doing. The
  MOSFET stops being a switch -- it leaks continuously, the
  signal cannot be turned off, and the device often overheats
  and fails.

* **The gate ties to the source's voltage rail.** Holding the
  gate at the rail the source sits on at rest makes
  ``Vgs = 0`` at idle, well below threshold; the MOSFET stays
  firmly off until something either drives the gate above the
  source (the one-way circuit below) or pulls the source
  below the gate (the bidirectional circuit). Float the gate
  somewhere else and the off state stops being defined --
  noise, leakage, or stray capacitance can drift ``Vgs``
  above threshold and switch the MOSFET on at random.

Reversing either rule turns the level shifter into a leaky,
unreliable path. Both shifter circuits below follow these
rules: source on the lower side, drain on the higher, gate
tied or driven from the source's rail.

One-way 3.3 V → 5 V
-------------------

The simplest level shifter pushes a one-direction signal from
the camera's GPIO into a 5 V input. A single N-MOSFET plus two
resistors does the job.

.. figure:: ../figures/nmos-level-shifter.svg
   :alt: An N-channel MOSFET wired as an inverter. The 3.3 V
         GPIO drives the gate; the source goes to ground; the
         drain pulls up to 5 V through 10 kΩ; the drain is
         also tapped as the 5 V output.

   An N-MOSFET level-shifts (and inverts) a 3.3 V signal to a
   5 V output.

When the GPIO drives high (3.3 V at the gate), ``Vgs`` is
above the threshold and the MOSFET turns on; the drain is
pulled down to ~0 V. When the GPIO drives low (0 V at the
gate), the MOSFET is off and the 10 kΩ pull-up brings the
drain to 5 V.

The output is the *inverse* of the input. Software can flip
the signal back (write ``0`` for "5 V output high"), or
cascade two stages to get a non-inverted signal at twice the
component count.

Bidirectional with one N-MOSFET
-------------------------------

For a line that must be driven from *either* side -- a shared
bus where either end can pull the line low -- the standard
circuit is a single N-MOSFET per line, with one pull-up to
each side's supply.

.. figure:: ../figures/mosfet-level-shifter.svg
   :alt: A bidirectional N-MOSFET level shifter. The MOSFET
         bridges a 3.3 V signal line on the left and a 5 V
         signal line on the right; the gate connects to the
         3.3 V supply, the source connects to the 3.3 V
         signal, the drain to the 5 V signal; each signal
         line has its own pull-up resistor to its supply.

   A single N-MOSFET bridges a 3.3 V and a 5 V line; each
   side has its own pull-up.

The gate is tied to the 3.3 V supply, so the MOSFET's
behaviour depends on which side is driving:

* **Both sides idle.** Source sits at 3.3 V via the left
  pull-up; gate is at 3.3 V; ``Vgs = 0``; the MOSFET is off.
  The 5 V side floats to 5 V via the right pull-up. Both
  sides read high.
* **3.3 V side pulls low.** Source drops to 0 V; ``Vgs``
  rises above threshold; the MOSFET turns on and conducts
  source-to-drain. The 5 V side is pulled low through the
  transistor.
* **5 V side pulls low.** Drain drops to 0 V; the MOSFET's
  body diode (drain to source) becomes forward-biased and
  conducts; the source (3.3 V side) is pulled down to about
  0.6 V. ``Vgs`` then exceeds threshold and the MOSFET fully
  turns on, bringing both sides low.

The BSS138 is the standard N-MOSFET for this pattern;
small-signal logic-level N-MOSFETs with similar gate-threshold
voltages all behave the same way here.
