Reliability -- sequences, ACKs, retransmits
===========================================

The framing layer detects corruption with its CRCs. The reliability
layer turns "detected corruption" into "the application never sees
broken data" by negotiating retransmits whenever a packet doesn't
arrive intact.

Sequence numbers
----------------

Each packet header carries a one-byte sequence number, separate
for each direction of travel. The sender increments the counter
before transmit; the receiver checks that each received packet's
sequence is the previous one plus one (modulo 256).

Three things can show up at the receiver instead of a clean
in-order packet:

* The expected sequence number, with a valid CRC. The packet is
  delivered up to the next layer.
* The expected sequence number, with a bad CRC. The receiver drops
  the packet and (if ACKs are negotiated) sends a NAK asking for a
  retransmit.
* A sequence number that's one higher than expected, with a valid
  CRC. The receiver knows the previous packet went missing; it
  sends a NAK referencing the missed sequence and stashes the new
  one.

The duplicate case (a retransmit arriving after the original
finally made it through) is handled by checking against the
expected counter: if the sequence is *behind* the expected one,
the packet is a duplicate and the receiver discards it after
sending the ACK the sender clearly didn't get the first time.

ACK and NAK
-----------

Two flag bits in the packet header carry the reliability traffic
itself:

* ``ACK_REQ`` set on an outgoing packet means "I want an
  acknowledgement back." Data packets normally set this; status
  pings and one-off events may not.
* ``ACK`` set on a packet means "this packet is the acknowledgement
  for the sequence number in the header." It carries no payload of
  its own.
* ``NAK`` set means "this packet rejects a previous one" -- usually
  because of a bad CRC or a sequence-number gap. The header points
  the sender at which sequence to retransmit.

The sender runs a stop-and-wait loop: it transmits one packet that
requires acknowledgement, then waits for the matching ACK (or NAK)
before sending the next. The single-in-flight model keeps the
sender state bounded -- a few hundred bytes on the smallest cams --
and matches the protocol's role as a control channel between two
endpoints rather than a throughput-optimised pipe. On NAK the
sender retransmits the same packet with the ``RTX`` flag set so the
receiver knows it's a retry.

Retransmit timing
-----------------

If neither ACK nor NAK arrives within the *retransmit timeout*, the
sender retransmits the in-flight packet on its own. The timeout
defaults to ``500 ms`` and doubles on each consecutive retry (1 s,
2 s, ...). After the configured number of retries -- default three
-- the sender gives up and reports a transport error to the
application.

Doubling the timeout is the standard *exponential backoff* pattern.
A short first timeout catches lost packets quickly; the doubling
means a host that's busy for a few hundred milliseconds doesn't
trigger a storm of duplicates that compound the load.

Configuring reliability
-----------------------

Both ends can turn pieces of the reliability layer off, by
agreement, when the application can afford to lose data:

* ``protocol.init(ack=False)`` disables per-packet ACKs. The sender
  fires and forgets; the receiver delivers whatever arrives. Good
  for streaming sensor data where a stale sample is acceptable.
* ``protocol.init(seq=False)`` turns sequence-number tracking off,
  which implies ACKs off too. Useful only on perfectly reliable
  transports.
* ``protocol.init(crc=False)`` turns the CRC validation off but
  leaves the rest of the framing intact. Worth doing only when the
  transport itself is robust enough that CRC errors don't happen.

The defaults -- everything on -- are the right starting point for
any host-to-cam debugging session. Once the application is in
production the trade-offs become specific to its data and its
transport.

The status codes
----------------

When a transport error does propagate up to application code it
arrives as a status code. The protocol library defines ten:

* ``SUCCESS`` -- operation completed.
* ``FAILED`` -- command failed for an unspecified reason.
* ``INVALID`` -- the receiver rejected the command or one of its
  arguments.
* ``TIMEOUT`` -- a retry timer ran out.
* ``BUSY`` -- the cam is busy (typically a locked channel).
* ``CHECKSUM`` -- the header or payload CRC didn't match.
* ``SEQUENCE`` -- the sequence number was out of order beyond what
  the layer can recover from.
* ``OVERFLOW`` -- a payload exceeded the negotiated maximum.
* ``FRAGMENT`` -- a multi-fragment message arrived with missing
  pieces.
* ``UNKNOWN`` -- a defensive catch-all for genuinely unexpected
  conditions.

Host code calling :meth:`~openmv.camera.Camera.channel_read` sees
these as Python exceptions; cam-side application code that has
opted into custom error handling sees them as return values from
the backend callbacks. Most cam apps don't need to look at the
status codes at all -- the library handles the retry, and only
genuinely unrecoverable failures (e.g. the transport itself is
gone) reach the application.

With framing in place to detect corruption and reliability in place
to recover from it, the wire-level work is done. Application code
sees framed, ordered, intact packets; the bytes inside them are
free to mean whatever the channel above wants them to.
