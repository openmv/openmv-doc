The radio and the link layer
============================

The bottom two layers of the BLE stack are almost
entirely automatic from Python's perspective -- the
radio silicon and the layers MicroPython runs on top of
it handle everything from picking a channel to
retransmitting a lost packet. Three of the choices they
make still show through into the user-facing API: power,
range, and throughput.

The radio
---------

BLE uses the same 2.4 GHz Industrial-Scientific-Medical
(ISM) band as Wi-Fi, microwave ovens, and most other
short-range wireless. The band is split into 40 channels
2 MHz wide.

* **Three** of the 40 channels are reserved for
  *advertising* -- short broadcasts that announce a
  device's presence to anyone listening. They are spaced
  out across the band so a listener can sweep all three
  quickly and so interference on any one is unlikely to
  knock the device off the air entirely.
* **Thirty-seven** are *data* channels. Once two devices
  connect, they exchange packets on these, hopping
  between them on a pseudo-random sequence the two sides
  agree on at connection time. *Adaptive frequency
  hopping* lets either side mark a channel as bad (heavy
  Wi-Fi interference, microwave, neighbouring BLE
  network) so the sequence skips it.

.. figure:: ../figures/advertising-channels.svg
   :alt: A horizontal frequency axis from 2400 MHz to
         2480 MHz with 40 narrow channel slots drawn on
         it. Three of the slots, at the bottom edge,
         middle, and upper edge of the band, are
         highlighted as "advertising channels". The
         remaining 37 are labelled "data channels".

   The 40 BLE channels on the 2.4 GHz band. Three are
   for advertising, the rest carry traffic on an open
   connection.

The radio transmits brief packets -- at most a couple of
milliseconds long -- and sleeps in between. That sleep
is what makes the technology *low energy*. A typical BLE
peripheral spends well under one percent of its time
actually transmitting; the rest is the radio powered
down between scheduled events.

The link layer
--------------

The link layer is the smallest unit of BLE that talks to
its counterpart on another device. It handles four jobs.

* **Packet framing.** Each packet carries a short
  header (channel access address, packet length, control
  bits), a payload, and a CRC. The receiver checks the
  CRC and drops anything corrupted.
* **Addressing.** Every BLE device has a 48-bit
  *device address* that identifies it on the radio. Some
  are *public* -- a hardware identifier the manufacturer
  has assigned, traceable forever. Some are *random* --
  generated on the device, rotated periodically, and
  optionally encrypted so that an eavesdropper cannot
  link two transmissions to the same physical hardware.
  Addresses come up again in
  :doc:`/openmvcam/tutorial/bluetooth/gap/advertising-and-scanning`.
* **Connection scheduling.** Once two devices connect,
  the link layer schedules periodic radio events on the
  hopping sequence -- a fixed *connection interval*
  apart -- and packs whatever data is queued from the
  GATT layer above into each one. Both sides go back to
  sleep between events. The connection interval is a
  knob the application can request (see
  :doc:`/openmvcam/tutorial/bluetooth/gap/connections`).
* **Reliability.** Each packet on a connection is
  acknowledged by the other side. The link layer
  retransmits anything that did not get a response, so
  the layers above see an ordered, lossless byte stream.
  Unlike :doc:`/openmvcam/tutorial/networking/transport/udp`
  on the networking side, BLE does not have a separate
  unreliable mode in normal use -- every packet on an
  open connection is retried until it arrives or the
  link is declared lost.

The link layer is also where *encryption* runs once a
pair of devices has agreed on a key during pairing
(see
:doc:`/openmvcam/tutorial/bluetooth/security/pairing-and-bonding`).
Every packet on an encrypted link is decrypted at the
receiver before the layers above ever see it.

What the camera and a peer share
--------------------------------

The radios on both ends agree at connection time on a
handful of parameters that govern the conversation:

* The *connection interval* -- how often the two sides
  wake up to exchange packets, anywhere from 7.5 ms to
  4 s.
* The *peripheral latency* -- how many consecutive
  intervals the peripheral may skip if it has nothing
  to say, to save power.
* The *supervision timeout* -- how long either side
  waits before declaring the link lost when the other
  goes quiet.
* The *MTU* -- the largest single packet either side
  will deliver to GATT (defaults to 23 bytes, can be
  negotiated up).

The radio and the link layer together are responsible
for getting reliable, ordered packets from one device
to another while keeping both radios off as much as
possible. Every layer above is free to behave as if a
clean, private byte channel exists between the two
endpoints.

What Python sees of all this
----------------------------

Almost nothing. The :mod:`bluetooth` and :mod:`aioble`
APIs do not expose channels, hopping sequences, packet
CRCs, or retransmission timers; those are all handled
inside the BLE port and the radio. The pieces that *do*
show through are the ones the connection-time
negotiation exposes -- connection interval, MTU,
address type.
