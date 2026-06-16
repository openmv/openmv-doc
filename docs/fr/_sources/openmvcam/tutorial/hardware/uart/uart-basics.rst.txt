UART basics
===========

A UART (Universal Asynchronous Receiver-Transmitter) is the
oldest and simplest way to move bytes between two
microcontrollers, or between a microcontroller and a host PC.
Two wires carry the data -- one for each direction -- and a
shared ground returns the signal. Neither side runs a shared
clock; they agree on a *baud rate* up front and recover bit
timing from the data line itself.

The frame
---------

Each character on the wire is wrapped in a frame: a start
bit, the data bits, an optional parity bit, and one or two
stop bits.

.. figure:: ../figures/uart-frame.svg
   :alt: A UART frame waveform. The signal sits idle high
         on the left, falls low for one bit time (the start
         bit), then carries eight data bits in sequence, then
         returns high for one bit time (the stop bit) before
         returning to idle.

   One UART frame: a start bit, eight data bits, and a stop
   bit, each one bit period (``1 / baudrate`` seconds) wide.

The line idles high. The receiver watches for a falling edge,
which marks the start of a new frame. It then samples the data
line once per bit period -- typically in the middle of each
bit -- and reassembles the bits into a character. The stop bit
returns the line to idle so the next start bit can be detected.

The baud rate
-------------

The bit period -- and the speed of the link -- is set by the
*baud rate*, the number of bits per second. ``9600``, ``19200``,
``38400``, ``57600``, ``115200``, ``230400``, ``460800`` and
``921600``
are the standard values; ``115200`` is the most common default.
Both ends must agree on the baud rate to within a few percent
or the receiver samples the bits at the wrong points and the
data comes back garbled.

Higher baud rates move more data per second but are more
sensitive to cable length, capacitance, and the precision of
the clocks at each end. For short links between two boards on
the same bench, ``115200`` to ``921600`` works comfortably.

Wiring
------

A UART link uses three wires:

.. figure:: ../figures/uart-wiring.svg
   :alt: Two boards labelled A and B, connected by three
         wires. Board A's TX pin connects to board B's RX pin;
         board B's TX pin connects to board A's RX pin; and
         both boards' ground pins are tied together.

   UART wiring: TX on one board goes to RX on the other, and
   both grounds are tied.

* **TX → RX, both ways.** Each board's transmit pin is the
  other board's receive pin. A common newcomer mistake is to
  wire TX → TX -- two outputs fighting each other, with no
  data on either receiver.
* **Shared ground.** The signal levels are referenced to
  ground, so the two boards must have a common ground or the
  receiver sees the wrong voltage on the line.

Voltage levels and physical layers
----------------------------------

The signal levels on the camera's UART pins are 3.3 V CMOS:
ground for a logical zero, 3.3 V for a logical one. Anything
that speaks 3.3 V CMOS UART -- another microcontroller, a
USB-to-serial adapter set to 3.3 V, a 3.3 V GPS module -- can
be wired directly.

.. note::

   5 V CMOS UART devices (older microcontrollers, certain GPS
   modules, some older sensor breakouts) speak the same UART
   framing at 5 V logic levels. Wiring them directly to the
   camera is unsafe: a 5 V TX driving the camera's RX exceeds
   the absolute-maximum input voltage on cams that are not
   5 V-tolerant, and the camera's 3.3 V TX may not reach the
   5 V device's high threshold for a clean logical one.

   Translating between the two voltages needs an *active line
   driver* -- a dedicated bidirectional level-shifter IC with
   its own drive transistors on both sides of each line. The
   passive MOSFET-and-pull-up shifters from
   :doc:`../gpio-output/level-shifting` are not enough here:
   their rising edges rely on charging the line through a
   resistor, which is fine at switch speeds but far too slow
   for UART. At 115200 baud each bit lasts about 8 µs, and
   the passive shifter's RC slew smears one bit into the
   next.

   An active line driver produces clean edges in both
   directions at full UART rates. Pick a part rated for the
   baud rate the link will run at, wire the camera's TX and
   RX to the shifter's 3.3 V side, and wire the 5 V device's
   TX and RX to the shifter's 5 V side.

Three older physical layers use the same framing but different
voltages, and need a level converter between them and a 3.3 V
microcontroller:

* **RS-232.** Used by serial ports on desktop PCs and some
  industrial equipment. The line swings between roughly
  ``±5 V`` and ``±15 V``, with idle at the negative rail.
  Inverted polarity and high voltage compared to CMOS; a chip
  from the MAX232 / MAX3232 family (or similar) handles the
  conversion.
* **RS-422.** A differential signalling standard for
  point-to-point links (one driver, up to ten receivers). The
  driver sends on a balanced pair of wires; the receiver sees
  the *difference* between them and ignores common-mode noise
  along the way. Full-duplex links use two pairs -- one for
  each direction. RS-422 reaches tens of metres to a kilometre
  depending on the baud rate, and an RS-422 transceiver chip
  sits between the camera's TX / RX and the balanced pair.
* **RS-485.** The multi-drop cousin of RS-422 -- the same
  differential signalling, but designed to put up to 32 drivers
  and receivers on one bus. Most links are half-duplex on a
  single pair, with the driver and receiver of each node sharing
  the same wires and software arbitrating who talks. Used in
  industrial automation buses (Modbus, DMX512, Profibus) where
  the wires run far and noise is bad; an RS-485 transceiver chip
  sits between the camera's TX / RX and the differential pair.

Both still send UART frames at the underlying bit level. The
camera's :class:`machine.UART` configuration (baud rate, bits,
parity, stop bits) is the same regardless of which physical
layer carries the signal on the other side of the transceiver.
