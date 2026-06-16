Serial protocols, framing, and CRCs
===================================

:doc:`uart-code` moved bytes between two ends. By itself,
that is not enough to build a reliable link. Three problems
show up the moment a real device is at the other end of the
wire:

* **Where does a message start and end?** Bytes arrive in
  a stream with no built-in delimiter. If the receiver misses
  the first byte (powered up after the sender; brief
  electrical glitch on the line), every byte after it is
  off-by-one until the receiver finds a fresh resync point.
* **How long is each message?** A 32-byte sensor reading
  and a 4-byte status reply look identical at the byte level.
  The receiver needs a way to know how many bytes belong to
  the current message.
* **Did the bytes arrive intact?** Noise can flip individual
  bits. Without a check, the receiver happily acts on
  corrupted data.

The standard answer to all three is to wrap the data in a
packet frame: a known byte sequence at the start, a length
field, the payload itself, and a checksum at the end.

Packet framing
--------------

A typical framing format:

.. figure:: ../figures/packet-frame.svg
   :alt: Six fields drawn in sequence: a two-byte HEADER
         labelled 0xAA 0x55, a one-byte CMD field selecting
         which command this packet carries, a two-byte LEN
         field giving the payload size, a one-byte HCRC field
         covering HEADER plus CMD plus LEN, a variable-length
         PAYLOAD of LEN bytes whose format depends on the CMD,
         and a four-byte DCRC field covering the payload.

   A framed packet with separate header and data CRCs: header
   (magic bytes), command, length, header CRC, payload, data
   CRC.

Each field does one job:

* **Header (magic bytes).** A fixed, unusual byte sequence
  -- often two bytes like ``0xAA 0x55`` -- that the receiver
  scans for in the incoming stream. When it finds the
  sequence, it knows a new packet is starting and can throw
  away any garbage that came before.
* **Command.** A single byte that says *what* the packet is.
  Different command values use different payload formats --
  one command might mean "set servo angle" with two payload
  bytes, another might mean "read sensor" with no payload,
  another might be "log message" with a string. The receiver
  dispatches on the command byte to know how to interpret
  the rest of the packet.
* **Length.** Two bytes giving the size of the payload in
  bytes (little-endian here), allowing payloads up to about
  64 KiB. The receiver reads exactly this many bytes once the
  header CRC has been verified.
* **Header CRC.** A one-byte checksum over the HEADER, CMD,
  and LEN fields. The receiver checks it before reading any
  payload, so a corrupted LEN is caught after just a handful
  of bytes (see the CRC section below for why this matters).
* **Payload.** Command-specific application data, exactly LEN
  bytes long. The format is determined by the command byte: a
  :mod:`struct`-packed record of fixed-width fields, a string,
  raw memory -- whatever both sides agree on for that command.
* **Data CRC.** A four-byte CRC over the payload bytes. The
  receiver re-computes it from the bytes it just read and
  drops the packet if it does not match.

CRCs
----

The simplest "checksum" is the sum of all the bytes, modulo
256 or 65536. It catches most single-bit flips but misses a
lot of multi-bit errors and ignores byte ordering.

A *cyclic redundancy check* (CRC) is the standard upgrade. It
treats the input as one long binary number and divides it (in
a special way) by a fixed *polynomial*; the remainder of the
division is the CRC. Different polynomials catch different
classes of errors; the common 8-, 16- and 32-bit polynomials
each catch every burst of errors shorter than their width
plus a large fraction of longer bursts.

Why two CRCs
~~~~~~~~~~~~

The packet diagram above carries *two* separate CRCs -- one
over the header (HEADER, CMD, LEN) and one over the payload.
This is what a robust framing actually needs, because of how
a single trailing CRC fails when the LEN field itself gets
corrupted in transit:

* The receiver acts on the corrupt LEN and reads that many
  bytes from the wire -- possibly far more than the sender
  intended.
* Only the trailing CRC eventually tells the receiver
  something went wrong, and only after all those bytes have
  been consumed.
* While the parser is stuck waiting for the wrong number of
  bytes, real packets arriving behind the corrupt one get
  swallowed as payload, and the receiver loses several packets
  rather than just the one.

Splitting the CRC fixes this:

* The **header CRC** covers HEADER, CMD, and LEN. The
  receiver checks it before reading any payload, so a
  corrupt LEN is caught after a handful of bytes and the
  parser resyncs immediately, taking down only the one
  bad packet.
* The **data CRC** covers the payload. Once the header CRC
  has passed, the receiver knows it can trust LEN, reads
  exactly that many payload bytes, and verifies them against
  the data CRC.

A common sizing -- and what this page uses -- is one byte
for the header CRC (a CRC-8 is plenty for a five-byte header)
and four bytes for the data CRC (a CRC-32 covers many
kilobytes of payload with a vanishingly low collision rate).

Helpers
~~~~~~~

MicroPython ships :func:`binascii.crc32` for the four-byte CRC
directly. For the one-byte header CRC, a small helper using
the polynomial Maxim's 1-wire devices use (``0x8C`` in
reflected form) is short enough to write inline:

::

    def crc8(data: bytes) -> int:
        crc = 0
        for byte in data:
            crc ^= byte
            for _ in range(8):
                crc = (crc >> 1) ^ 0x8C if crc & 1 else crc >> 1
        return crc & 0xFF

A complete encoder combines the two CRCs in one function:

::

    import binascii
    import struct

    def encode_packet(cmd: int, payload: bytes) -> bytes:
        header = b"\xAA\x55" + bytes([cmd]) + struct.pack("<H", len(payload))
        hcrc   = crc8(header)
        dcrc   = binascii.crc32(payload)
        return header + bytes([hcrc]) + payload + struct.pack("<I", dcrc)

The inverse function recovers the command and payload from a
complete packet, or returns ``None`` if either CRC check
fails:

::

    def decode_packet(packet: bytes):
        # Layout: HEADER(2) + CMD(1) + LEN(2) + HCRC(1) + PAYLOAD(LEN) + DCRC(4)
        if len(packet) < 10 or packet[0:2] != b"\xAA\x55":
            return None

        header = packet[0:5]
        if crc8(header) != packet[5]:
            return None                       # header CRC mismatch

        cmd    = packet[2]
        length = struct.unpack("<H", packet[3:5])[0]
        if len(packet) != 6 + length + 4:
            return None                       # truncated or oversized

        payload       = packet[6:6 + length]
        received_dcrc = struct.unpack("<I", packet[6 + length:])[0]
        if binascii.crc32(payload) != received_dcrc:
            return None                       # data CRC mismatch

        return cmd, bytes(payload)

In practice the receiver does not get a whole packet handed to
it -- bytes arrive one at a time over the UART, and a sender
that pauses mid-packet (or a noisy line that loses a byte)
cannot just be ``read()``-ed into a buffer of the right size.
The next section runs the same decode logic byte by byte as a
state machine.

A state-machine receiver
------------------------

The receiver cannot just call ``uart.read(N)`` for some fixed
``N`` -- it does not know how many bytes the next packet will
be, and any junk on the line throws the alignment off. The
solution is a small state machine that consumes the bytes one
at a time and reacts based on where it is in the packet. The
main loop polls :meth:`~machine.UART.any` to see how many
bytes are buffered, drains them in one :meth:`~machine.UART.read`
call, and feeds each byte through the state machine:

::

    import time
    import binascii
    import struct
    from machine import UART

    HEADER = b"\xAA\x55"
    HEADER_LEN = len(HEADER)

    # States, in the order the receiver walks through them per packet.
    HUNT_FOR_HEADER = 0
    READ_COMMAND    = 1
    READ_LENGTH     = 2
    READ_HEADER_CRC = 3
    READ_PAYLOAD    = 4
    READ_DATA_CRC   = 5

    uart = UART(3, baudrate=115200)

    # Receiver state plus partial-field buffers.
    state        = HUNT_FOR_HEADER
    matched      = 0              # bytes of HEADER matched so far
    cmd          = 0              # CMD captured in READ_COMMAND
    length_bytes = bytearray()    # raw LEN bytes (kept for the header CRC)
    length       = 0              # unpacked LEN
    payload      = bytearray()    # payload bytes accumulated in READ_PAYLOAD
    crc_bytes    = bytearray()    # DCRC bytes accumulated in READ_DATA_CRC

    def handle_packet(cmd: int, payload: bytes) -> None:
        print("cmd", cmd, "payload", payload)

    while True:
        # Drain whatever bytes have arrived since the last poll. Idle
        # briefly when the line is quiet so the loop is not a busy spin.
        n = uart.any()
        if not n:
            time.sleep_ms(1)
            continue

        for b in uart.read(n):
            if state == HUNT_FOR_HEADER:
                # Walk the magic bytes. On a mismatch, back off by one
                # so a stray HEADER[0] in the noise still counts as a
                # possible start.
                if b == HEADER[matched]:
                    matched += 1
                    if matched == HEADER_LEN:
                        state = READ_COMMAND
                        matched = 0
                else:
                    matched = 1 if b == HEADER[0] else 0

            elif state == READ_COMMAND:
                cmd = b
                length_bytes = bytearray()
                state = READ_LENGTH

            elif state == READ_LENGTH:
                # LEN is two bytes little-endian.
                length_bytes.append(b)
                if len(length_bytes) == 2:
                    length = struct.unpack("<H", length_bytes)[0]
                    state = READ_HEADER_CRC

            elif state == READ_HEADER_CRC:
                # Verify the CRC over HEADER + CMD + LEN before
                # committing to read LEN payload bytes. A mismatch
                # aborts here, after just five header bytes -- the
                # next valid header re-syncs quickly.
                expected = crc8(HEADER + bytes([cmd]) + length_bytes)
                if b == expected:
                    payload = bytearray()
                    state = READ_PAYLOAD
                else:
                    state = HUNT_FOR_HEADER

            elif state == READ_PAYLOAD:
                payload.append(b)
                if len(payload) == length:
                    crc_bytes = bytearray()
                    state = READ_DATA_CRC

            elif state == READ_DATA_CRC:
                # Verify the CRC over the payload and either deliver
                # the packet or drop it. Either way, go back to
                # looking for the next header.
                crc_bytes.append(b)
                if len(crc_bytes) == 4:
                    expected = binascii.crc32(payload)
                    received = struct.unpack("<I", crc_bytes)[0]
                    if expected == received:
                        handle_packet(cmd, bytes(payload))
                    state = HUNT_FOR_HEADER

Each byte advances the state machine by one step, or falls
back to ``HUNT_FOR_HEADER`` after a complete packet, a bad
header CRC, or a bad data CRC. Junk on the line that does not
match the header is silently discarded; the next valid header
re-syncs the receiver. The key safety property comes from the
header CRC: if the LEN field is corrupted, the parser catches
it after the header-CRC check (a handful of bytes), not after
committing to read a wildly wrong number of payload bytes.

Beyond the baseline
-------------------

The framing above is the *minimum* a serial link needs to
recover from line noise: header magic, length, command, and
two CRCs. It detects corruption and resyncs after garbled
bytes, but it gives up on damaged packets rather than getting
them through, and it leaves the sender with no idea what the
receiver actually heard.

Real-world serial protocols layer features on top of that
baseline. Not every embedded link needs all of them -- pick
what the application actually requires:

* **Sequence numbers.** A small counter that increments on
  every send. The receiver detects gaps (a packet was lost),
  duplicates (the sender retransmitted but the receiver had
  already accepted the first copy), and -- where the channel
  can reorder -- out-of-order arrivals.

* **Acknowledgements.** A dedicated ACK packet (or piggyback
  bit in a reply) the receiver sends back to confirm each
  packet. Without ACKs the sender has no way of knowing its
  data arrived.

* **Negative acknowledgements.** A NACK sent when the receiver
  sees a CRC failure or a sequence gap. The sender
  retransmits immediately, instead of waiting for an ACK
  timeout to fire.

* **Retransmission.** The sender keeps each unacked packet in
  a small queue and re-sends it after a timeout (or on a
  NACK). A retry limit and some backoff between retries stops
  a permanently broken link from looping forever.

* **Sliding windows.** Allowing several packets in flight
  before requiring an ACK keeps throughput up on links where
  the round-trip is long compared to the per-packet send time.
  The cost is more sender-side state -- one slot per in-flight
  packet.

* **Flow control.** A signal from the receiver telling the
  sender to slow down or pause when its buffer is filling up.
  Implementations vary -- explicit XON / XOFF bytes,
  credit-based grants where the receiver licences N more
  packets at a time, or the RTS / CTS hardware lines on the
  wire itself. Without flow control a fast sender eventually
  overruns a slow receiver and packets get dropped.

* **Protocol version.** A version field early in the packet
  lets the format evolve. Each side can negotiate the highest
  version both support at startup, or reject packets from
  incompatible peers.

* **Fragmentation and reassembly.** A two-byte LEN caps the
  packet at 64 KiB; messages larger than that get split into
  multiple packets and reassembled on the other side. The
  fragmentation metadata (fragment index, total count, or a
  "more fragments" flag) lives inside the payload.

* **Heartbeats.** A small periodic packet that says "I'm
  still here". The other side notices when the heartbeats
  stop and reconnects (or fails loudly) instead of hanging
  silently.

* **Channels.** A channel or stream ID in the header so one
  physical link carries several logical streams -- a control
  channel, a telemetry channel, a log channel --
  distinguished only by that field.

* **Authentication.** A short tag computed from the payload
  and a secret value that only the legitimate sender and
  receiver know. The receiver computes the tag again from
  the bytes it received and rejects the packet if the two do
  not match. This catches both tampering (an attacker
  modified the bytes) and -- if a sequence number or
  timestamp is part of what the tag covers -- replay, where
  an attacker records a real packet off the wire and
  re-sends it later to make the receiver act on it twice.

* **Encryption.** Scrambling the payload bytes with a shared
  secret key so anyone reading the line without that key
  sees only noise. Usually combined with the authentication
  tag above -- without it, an attacker can feed garbage that
  happens to pass the CRC and the receiver wastes cycles
  trying to decrypt nonsense.

A typical "good" protocol for industrial gear ends up with
framing, dual CRC, sequence numbers, ACK / NACK with
retransmit, and heartbeats. Real-world examples worth a look:
*MAVLink* (drone telemetry, with sequence numbers, system /
component IDs, and optional packet signatures), *Modbus*
(industrial PLCs, with function codes and CRC), and
*NMEA 0183* (the ASCII protocol every consumer GPS receiver
speaks -- line-based messages with a checksum after a star
delimiter).

