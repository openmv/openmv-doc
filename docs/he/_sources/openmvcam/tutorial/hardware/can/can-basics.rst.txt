CAN bus basics
==============

CAN (*Controller Area Network*) was originally designed by
Bosch in the 1980s to wire all the electronic control units in
a car onto one short shared bus. It still owns the car
wire-harness, but the same robustness, real-time behaviour and
multi-master design make it the default field bus in
automation, robotics, agricultural and industrial equipment of
every kind.

CAN does not have a single "controller" and a set of
"peripherals" the way SPI and I2C do. Every node on the bus is
a peer, and any node can transmit whenever the bus is idle.
What lets that scale is the bus's broadcast-with-arbitration
design.

Broadcast with priority arbitration
-----------------------------------

Every message on a CAN bus carries an *identifier* -- 11 bits
for the classic standard frame, 29 bits for the extended
variant. The identifier is not an address; it labels what the
message is *about* (engine RPM, brake pedal position, battery
voltage, etc.). When a node wants to send a value it broadcasts
it tagged with the appropriate identifier, and every node on
the bus sees the broadcast. Each receiver filters the bus
in hardware to pick out only the IDs it cares about.

If two nodes try to transmit at the same time, the bus's
electrical design lets the message with the *lower* numeric
identifier win without losing any bits.

The trick is the bus's two electrical states: *dominant*
(logically 0) and *recessive* (logically 1). The CAN wires are
held high (recessive) by termination resistors when no node is
talking; any node can pull the wires down (dominant) by
sourcing current through its transceiver. The result is a
wired-AND: if any single node drives the bus dominant, the
line reads dominant, and it reads recessive only when every
node has released it. Dominant always wins. (Some references
call the same arrangement a *wired-OR*, treating "dominant" as
the asserted signal rather than the AND of recessive bits --
the physical behaviour is identical either way.)

.. figure:: ../figures/can-wired-and.svg
   :alt: A single bus line held high by a termination
         resistor to Vcc. Three nodes (A, B, C) hang off the
         bus. Each node's output stage is a diode in series
         with a switch to ground -- the diode points from the
         bus down to the switch, so closing the switch pulls
         the bus low through the diode but no node can drive
         the bus high.

   The wired-AND in concept form. Real CAN runs the same
   logic over a differential pair (CAN_H / CAN_L) with the
   transceivers and termination resistors split across both
   wires, but the rule on the bus is the same: any node can
   pull dominant, only when every node has released does it
   read recessive.

Arbitration uses this asymmetry directly. Every transmitting
node sends its ID one bit at a time, MSB first, and watches
the bus *while* it transmits. A node that puts a recessive bit
on the wire but reads back dominant knows another node with a
lower ID is transmitting at the same moment and has won that
bit position. It stops driving the bus immediately and
listens. The winning node, meanwhile, sees its own bits go out
unchanged -- from its point of view nothing unusual happened.
The lower-numbered ID wins because its dominant bits override
the recessive bits the higher-numbered IDs would otherwise
have sent at the same positions.

The loser then waits for the bus to go idle and retries
automatically. There are no collisions, no lost messages --
only deterministic priority ordering.

This is the *publish/subscribe* style that makes CAN work at
scale: anyone can talk, anyone can listen, and the IDs make
the dispatch implicit.

The physical bus
----------------

The MCU's CAN controller does not drive the bus directly. It
exposes only two 3.3 V CMOS pins -- TX (the bit it wants to
send) and RX (the bit it sees on the bus) -- and those pins go
to a separate chip called the CAN *transceiver* or *PHY*. The
transceiver sits between the controller and the actual CAN
wires; it is what knows how to speak to the bus.

The bus itself is a 5 V differential pair:

* **CAN_H** -- the "high" wire of the pair.
* **CAN_L** -- the "low" wire.

In the recessive state both wires sit at roughly 2.5 V (the
midpoint of the bus's 5 V supply). In the dominant state the
transceiver pulls CAN_H up to about 3.5 V and CAN_L down to
about 1.5 V, producing a differential of around 2 V across
the pair. Receivers sample the *difference* between the two
wires, which makes the signal immune to common-mode noise
picked up over long cable runs.

The transceiver's two-way job:

* On the TX side, it reads the controller's 3.3 V
  single-ended TX pin and either drives CAN_H and CAN_L
  apart for dominant or releases both for recessive.
* On the RX side, it reads the differential CAN_H / CAN_L
  pair and reports a single-ended 3.3 V level on its RX pin
  back to the controller.

Two 120-ohm termination resistors, one at each physical end
of the cable, hold the bus at the recessive midpoint when no
node is driving and damp reflections that would otherwise
corrupt the differential signal on long runs.

The data frame
--------------

A standard CAN data frame looks like this on the wire:

.. figure:: ../figures/can-frame.svg
   :alt: Eight fields drawn in sequence: SOF (1 bit), ID
         (11 bits), RTR (1 bit), control (6 bits), data
         (0 -- 8 bytes), CRC (16 bits), ACK (2 bits), and
         EOF (7 bits).

   A standard CAN data frame: SOF, ID, RTR, control, data,
   CRC, ACK, and EOF fields.

Each field has a specific job:

* **SOF** (start of frame). One dominant bit that says a new
  frame is starting and synchronises every node's bit clock.
* **ID** (identifier). The 11-bit identifier the bus arbitrates
  on. Lower number = higher priority.
* **RTR** (remote transmission request). Set on a *request*
  for data rather than a *delivery* of data; receivers with
  a matching ID respond by sending the data themselves.
* **Control.** A 6-bit field encoding the data length
  (``DLC``) and a few housekeeping bits.
* **Data.** 0 to 8 bytes of payload (CAN Classic; CAN FD
  extends this to 64 bytes).
* **CRC.** 16 bits total: a 15-bit CRC over the preceding
  fields plus a 1-bit CRC delimiter.
* **ACK.** 2 bits total. In the first bit -- the ACK slot --
  the transmitter releases the line and any node that
  received the frame correctly pulls it low; the second bit
  is a recessive delimiter. Lack of an ACK tells the
  transmitter no node heard the frame and it should try
  again.
* **EOF** (end of frame). Seven recessive bits closing the
  frame.

All of that is generated and decoded by the CAN controller in
hardware; software sees only the ID, the data, and a few
flags.

Where CAN sits
--------------

CAN's design choices set its niche:

* **Robust.** Differential signalling on a twisted pair,
  built-in error detection, deterministic priority arbitration,
  and automatic retries make CAN survive electrically noisy
  environments where UART and SPI would corrupt data.
* **Multi-master.** Any node can talk at any time. No central
  controller is required and no node is a single point of
  failure.
* **Bandwidth limited.** Classic CAN tops out around
  ``1 Mbit/s``; CAN FD extends this. CAN is the right answer
  when the link is *between* boards or modules, often over
  metres of cable, with reliability as the priority.
* **Higher-layer protocols.** The bare CAN bus does not say
  what an ID means or how to split a long message into
  fragments. Application-layer protocols -- CANopen, J1939,
  ISO-TP/UDS, NMEA 2000 -- layer those rules on top. A
  separate item worth knowing is the *DBC* file: a
  vendor-specific text format that records which IDs carry
  which bit-level signals on a particular vehicle or system.
  DBC files are a metadata format describing one bus's
  message layout, not a protocol of their own.

The driver in :doc:`can-code` handles the wire-level CAN
frame; mapping IDs to meanings is the application's job.
