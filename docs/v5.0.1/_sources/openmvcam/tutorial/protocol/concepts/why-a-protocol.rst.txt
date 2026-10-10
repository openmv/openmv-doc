Why a protocol library
======================

A pair of cables and a baud rate is enough to move bytes from a cam
to a host PC. USB-CDC and UART both give the cam program a stream
where ``write`` puts bytes in one end and ``read`` takes them out
the other. So what does a *protocol library* add on top of that?

Three things you would have to write yourself, every time, if you
tried to build a serious cam-to-host channel directly on raw bytes:

**Framing.**
A byte stream has no inherent structure. The cam writes
``temp=42`` and the host reads ``temp=`` plus an interrupt arriving
later, then ``42`` plus the next message starting with ``humid=...``
already running into it. Bytes don't have boundaries. Every
non-trivial host link ends up inventing some marker -- ``\n``
between messages, length-prefix headers, escape sequences for
binary payloads -- so the receiver knows where one message ends and
the next begins. The protocol library gives you a uniform packet
format with a sync word and a length field, and the receiver never
has to guess.

**Reliability.**
USB-CDC doesn't drop bytes silently in normal operation, but UART
does (when the host stops servicing the port quickly enough), and a
serial cable unplugged and reseated can leave one side with a
partial packet. The right thing to do is to detect the corruption,
ask the other side to retransmit, and only ever hand application
code messages that arrived intact. The protocol library does that
for every packet with a CRC and per-packet acknowledgements -- on
by default; the application doesn't see the retries.

**Multiplexing.**
There's exactly one USB-CDC port between the cam and the host. If
the cam is streaming an image *and* the host is sending it
configuration *and* the IDE is reading ``stdout`` for ``print``
output, all three exchanges have to share that single byte stream.
The protocol library gives each independent stream a *channel*
number, lets the cam register a Python class for each one, and
keeps the host's reads on each channel from interfering with the
others. From application code, each channel looks like its own
private link.

Why not write that yourself
---------------------------

You can. It's a few weeks of work to get all three correct on a
serial line and another few weeks to make the framing handle
hot-plug recovery cleanly, the retransmits work without burning
energy on round-trips, and the multiplexer survive partial reads
without corrupting one channel's bytes into another's.

The protocol library has already done that work, has been validated
on every supported cam, and has matching libraries on the host side
that speak the same wire format. Using it means the cam-side code
is one small class per channel and the host-side code is a
:class:`~openmv.camera.Camera` object with ``channel_read`` and
``channel_write`` methods. The mental space saved goes to whatever
the application actually does.

This chapter teaches the protocol from the ground up: the wire
format, the framing rules, the reliability machinery, the channel
model, and finally the Python classes on both ends. By the end the
reader can build a host GUI that talks to the cam, a script that
streams sensor data from cam to laptop, and the kind of interactive
calibration tool that ships in `openmv-projects/tools/
<https://github.com/openmv/openmv-projects/tree/master/tools>`_.
