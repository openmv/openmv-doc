I2C basics
==========

I2C (*Inter-Integrated Circuit*, pronounced "I-squared-C" or
"I-two-C") is a two-wire serial bus designed for short-range
links between chips on the same board. It sits between SPI and
UART in priorities: slower than SPI but more pin-thrifty, and
addressed (multiple devices on the same two wires) where SPI
needs a dedicated CS line per device.

I2C is the bus of choice for low-rate sensors -- accelerometers,
temperature sensors, humidity sensors, magnetometers, real-time
clocks, EEPROMs -- where shaving pins and bus complexity
matters more than raw throughput.

Two wires, both open-drain
--------------------------

An I2C bus has just two signals:

* **SCL** (serial clock). Driven by the controller (most of
  the time).
* **SDA** (serial data). Driven by whichever device is
  speaking right now -- controller during the address and
  outgoing data, peripheral during reads and ACK bits.

Both lines are open-drain: every device on the bus can pull
the line down to ground but never drives it high. Two pull-up
resistors on the bus (typically ``2.2 kΩ`` to ``10 kΩ`` to the
supply rail) pull the lines high when nobody is pulling them
low. The wired-OR behaviour falls out of this -- any device
that pulls the line low wins, and the high state is just "no
one is talking".

The MCU's internal pull-ups on its SCL and SDA pins are usually
*not* strong enough to act as the bus pull-ups on their own;
external resistors on the bus are normally needed. Many sensor
breakout boards include them already; check the data sheet
before adding more.

The transaction
---------------

Every I2C transaction follows the same shape:

.. figure:: ../figures/i2c-transaction.svg
   :alt: SCL and SDA traces. SDA falls while SCL is high
         (START), then SCL clocks bytes on SDA -- a 7-bit
         address byte with a read/write bit and an ACK,
         then a register byte and an ACK, then a data byte
         and a NACK, then SDA rises while SCL is high (STOP).

   An I2C transaction: START, 7-bit address + R/W, ACK,
   register, ACK, data, NACK, STOP.

The exchange unfolds bit by bit:

* **START.** The controller pulls SDA low while SCL is still
  high. This unusual edge tells every device on the bus that
  a transaction is about to begin.
* **Address + R/W.** The controller clocks out a 7-bit
  peripheral address followed by one read/write bit (``0`` for
  write, ``1`` for read).
* **ACK / NACK.** After every byte, the *receiver* drives SDA
  for one clock to ACK (low) or NACK (high). On the address
  byte the peripheral acks if it recognises its own address;
  if no device acks, the controller sees a NACK and knows the
  address is not on the bus.
* **Data bytes.** Each one followed by an ACK from the
  receiver. On a write, the peripheral acks each byte; on a
  read, the controller acks each byte it wants more of and
  NACKs the last byte to tell the peripheral to stop.
* **STOP.** The controller releases SDA high while SCL is
  high, ending the transaction.

A *repeated start* is a second START issued without a STOP in
between -- the controller switches direction (write address,
then read address) on the same peripheral without giving up
the bus.

Addressing
----------

The 7-bit address space covers ``0x08`` -- ``0x77``; the values
at the ends are reserved for special purposes. Each device's
address is set by the chip designer; many parts allow a few
of the low bits to be changed at the board level (by tying a
pin high or low) so two of the same sensor can sit on the same
bus.

If two devices share an address there is no way to talk to one
of them without the other interfering, so check the data sheet
before pairing parts. ``i2c.scan()`` (covered on
:doc:`i2c-code`) walks the address space and reports which
addresses respond, which is the standard way to find out what
is on the bus.

Strengths and weaknesses
------------------------

The bus's strengths and weaknesses set its niche:

* **Two pins for many devices.** A single SCL/SDA pair can
  carry a dozen sensors. SPI would need an extra CS pin per
  device.
* **Standard speeds.** ``100 kHz`` ("standard mode") and
  ``400 kHz`` ("fast mode") cover almost every sensor.
  ``1 MHz`` is reachable but starts asking more of the bus
  capacitance and pull-up sizing.
* **Slow relative to SPI.** Anything moving more than a few
  hundred kilobits per second wants SPI instead.
* **Address conflicts.** Two devices with the same address on
  one bus is a hardware mistake the protocol cannot work
  around.
