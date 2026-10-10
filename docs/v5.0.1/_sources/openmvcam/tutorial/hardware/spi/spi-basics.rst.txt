SPI basics
==========

SPI (*Serial Peripheral Interface*) is a synchronous serial
bus designed for short-range, high-speed links between one
controller and one or more peripheral devices on the same
board. It is the standard interface for SD cards, displays,
flash memory, ADCs and DACs, and a wide range of sensors.

Where UART had no shared clock and recovered timing from the
data line itself, SPI runs a clock wire alongside the data
wires. The controller drives the clock at whatever rate it
likes, and every other device on the bus samples the data
in sync with that clock. There is no baud-rate guessing and no
framing overhead -- just clock edges and bits.

The four wires
--------------

A full-duplex SPI bus has four wires:

* **SCK** (serial clock). Driven by the controller. Every bit
  is clocked in or out on an edge of this signal.
* **MOSI** (controller out, peripheral in). The controller's
  output line; the peripheral samples bits off it.
* **MISO** (controller in, peripheral out). The peripheral's
  output line; the controller samples bits off it.
* **CS** (chip select), sometimes called SS (peripheral
  select). A separate line per peripheral. The controller pulls
  CS low to start a transaction and high again to end it;
  any peripheral with its CS deasserted ignores the bus
  entirely and stops driving its MISO output.

.. figure:: ../figures/spi-transaction.svg
   :alt: Four signal traces stacked: CS at top, SCK below it,
         then MOSI and MISO. CS starts high (idle), drops low
         to begin the transaction, then SCK clocks out eight
         pulses while MOSI and MISO carry one byte of data
         each, then CS returns high.

   One SPI byte: CS goes low to select the peripheral, SCK
   clocks eight bits, and MOSI and MISO transfer one byte
   each in opposite directions.

Every clock edge moves one bit in each direction at the same
time. A single SCK pulse simultaneously sends one bit on MOSI
and receives one bit on MISO -- SPI is *full-duplex* at the
wire level. Software does not have to use both directions:
write-only and read-only transactions are common, with the
unused line either ignored or kept high.

Clock polarity and phase
------------------------

Two configuration bits decide exactly which clock edge moves
data:

* **Clock polarity** (``polarity``, sometimes ``CPOL``) -- the
  idle state of SCK. ``0`` means the clock idles low and
  pulses high; ``1`` means the clock idles high and pulses
  low.
* **Clock phase** (``phase``, sometimes ``CPHA``) -- which
  edge samples the data. ``0`` samples on the first edge of
  each clock pulse (leading edge); ``1`` samples on the
  second edge (trailing edge).

Together these give four *modes*, conventionally called Mode
0 through Mode 3. Mode 0 (``polarity=0, phase=0``) is the most
common and a safe default for unknown devices.

The crucial rule is that both ends must agree on the mode.
Mismatched modes give garbage data even though the clock and
data lines are wired correctly; if a device returns nonsense
on the first transaction, the mode is the first thing to
check.

Multiple peripherals
--------------------

Several peripherals can share the same SCK, MOSI and MISO
lines as long as each one has its own CS line driven by the
controller:

* All peripherals see the same clock and data, but each one
  watches its own CS. With CS deasserted (high), a peripheral
  ignores SCK and MOSI entirely and leaves MISO in a
  high-impedance state so it does not fight other devices for
  the line.
* The controller asserts exactly one CS at a time, runs the
  transaction, and deasserts CS to release the bus.

A microcontroller with a single hardware SPI block can talk
to as many peripherals as it has free GPIO pins to spare for
CS lines -- there is no addressing on the bus itself.

Strengths and weaknesses
------------------------

SPI's strengths and weaknesses both flow from its design:

* **Fast.** Tens of megahertz is achievable on short traces
  with simple level translation. SD-card readers and SPI
  displays use this.
* **Simple at the wire level.** No addressing, no
  acknowledgements, no special start/stop conditions -- just
  bits on the wires synchronised to a clock.
* **Pin-hungry.** Three shared lines plus one CS per
  peripheral. A board with five SPI devices uses eight pins
  (three + five).
* **Short-range.** SPI assumes clean, fast edges, which means
  short traces on the same board. For longer links, I2C or
  one of the framed buses is a better fit.
