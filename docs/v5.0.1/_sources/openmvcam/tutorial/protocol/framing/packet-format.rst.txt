The packet format
=================

Every byte that crosses the wire between the cam and the host is
part of a packet. A packet starts with a 10-byte header, runs a
variable-length payload, and ends with a 4-byte trailing CRC. No
other bytes appear on the wire -- once the host has seen the
2-byte sync word, the next bytes are a header in this exact
sequence.

.. image:: ../figures/packet-format.svg
   :alt: A horizontal layout of a protocol packet showing the
         10-byte header (sync word, sequence number, channel ID,
         flags, opcode, payload length, header CRC) followed by the
         variable-length payload and a 4-byte payload CRC.
   :align: center

The header
----------

Ten bytes, packed without padding. Each field:

* ``sync`` -- the 16-bit word ``0xD5AA`` in little-endian order.
  Byte 0 on the wire is ``0xAA``, byte 1 is ``0xD5``. A receiver
  scanning bytes can find the start of a packet by searching for
  the pair ``AA D5``; anything before it is treated as garbage.
  The choice of value is deliberate: ``0xAA`` and ``0xD5`` rarely
  appear in printable text, and the pair is unlikely to occur by
  accident in the middle of a payload.
* ``seq`` -- one byte. A counter that increments by one for each
  packet sent on a given direction. The receiver checks that the
  next packet's sequence number is the expected one; if not, the
  reliability layer asks for a retransmit.
* ``chan`` -- one byte. The channel ID this packet belongs to.
  Channels 0..31 are usable; the built-in ``stdin``, ``stdout``,
  ``stream``, and (optionally) ``profile`` channels take fixed IDs
  the cam reserves.
* ``flags`` -- one byte. A bit-field telling the receiver how to
  interpret the packet:

  - bit 0 ``ACK`` -- this packet is an acknowledgement of a
    previous one.
  - bit 1 ``NAK`` -- this packet rejects a previous one.
  - bit 2 ``RTX`` -- this packet is a retransmit.
  - bit 3 ``ACK_REQ`` -- the sender wants this packet
    acknowledged.
  - bit 4 ``FRAGMENT`` -- more fragments follow this one in a
    larger message.
  - bit 5 ``EVENT`` -- this packet carries a channel event
    rather than data.
  - bits 6 and 7 are reserved.

* ``opcode`` -- one byte. The command or response code. The
  protocol library reserves opcode ranges by purpose:

  - ``0x00..0x0F`` -- protocol commands (SYNC, GET_CAPS, SET_CAPS,
    STATS, VERSION).
  - ``0x10..0x1F`` -- system commands (RESET, BOOT, INFO, EVENT,
    MEMORY).
  - ``0x20..0x2F`` -- channel commands (LIST, POLL, LOCK, UNLOCK,
    SHAPE, SIZE, READ, WRITE, IOCTL, EVENT).

* ``len`` -- two bytes, little-endian. The number of payload bytes
  that follow the header. A length of zero is legal -- many
  acknowledgements and small commands carry no payload.
* ``crc`` -- two bytes. A CRC-16 over the previous eight header
  bytes. A receiver that gets a header with a bad CRC drops the
  whole packet without even looking at the payload.

The payload
-----------

Zero or more bytes, treated as opaque by the framing layer. What's
in the payload depends on the opcode: for a ``CHANNEL_READ`` reply
it's the actual channel data; for a ``GET_CAPS`` reply it's a
small fixed structure; for a channel write it's whatever the host
sent.

The maximum payload size depends on the cam's protocol buffer size
(refer to the per-board table in :func:`protocol.init`). Messages
longer than the cap are split into fragments with the ``FRAGMENT``
flag set on all but the last.

The trailing CRC
----------------

Four bytes, a CRC-32 over the payload. Catches corruption that the
header CRC can't see, particularly on long payloads where a
single-bit error mid-frame would otherwise slip through.

Splitting the integrity check across two CRCs is deliberate. The
header CRC protects the framing fields themselves -- particularly
the payload length. Without a separate header CRC, a single bit
flip in the length byte would cause the receiver to read the wrong
number of bytes for the payload and desync from the byte stream
entirely; with one, a damaged header is rejected outright and the
receiver re-scans for the next sync word. The payload CRC then
protects the message body as a separate concern, so a bit flip in
the data is reported as a corrupt payload rather than mistaken for
a framing error.

The format is small enough to walk through byte by byte, and the
fact that every packet has the same layout -- sync, then header,
then payload, then CRC -- means a hand-rolled parser fits in a
screen of code. That's why a tiny host implementation in C, Python,
or Rust is a weekend project; the protocol library is the
maintained Python version on each side.
