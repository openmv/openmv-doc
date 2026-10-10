Handshake and capability negotiation
====================================

The cam and host both arrive at the transport with their own ideas
about how the protocol should run: which CRC modes, whether ACKs
are required, what the largest payload they can buffer is. Before
real traffic starts they exchange a handshake that fixes those
parameters for the rest of the session.

The host opens the connection
-----------------------------

The cam side starts the protocol stack at boot (or the application
restarts it with :func:`protocol.init` to change parameters), then
sits quietly waiting for a host. From the cam's point of view there
is nothing to do until a packet arrives.

The host side opens the transport -- USB port or UART -- and
immediately sends a ``PROTO_SYNC`` packet
(opcode ``0x00``). This packet has a magic payload that lets the cam
recognise it even if both sides got out of sync, and it's the only
packet the cam ever responds to before capabilities are negotiated.

If the cam doesn't reply within the retransmit timeout the host
sends ``PROTO_SYNC`` again, up to ``rtx_retries`` times. After that
it gives up and reports a connection failure. The retry is what
makes "unplug, replug, restart the host script" work without the
cam needing to know the host went away.

Capability exchange
-------------------

Once the cam acknowledges the sync, the host sends
``PROTO_GET_CAPS`` (opcode ``0x01``) to ask what the cam supports.
The reply payload reports:

* CRC validation enabled or disabled
* Sequence-number tracking enabled or disabled
* ACKs enabled or disabled
* Event notifications enabled or disabled
* The cam's maximum payload size in bytes
* The current retransmit retry count, timeout, and polling
  parameters

The host compares those against its own configuration. If the host
needs to *change* any of them -- for example, to negotiate a smaller
max payload because its receive buffer is smaller than the cam's --
it sends ``PROTO_SET_CAPS`` (opcode ``0x02``) with the new values.
The cam reconfigures its stack and acknowledges. From here on, every
packet that crosses the wire follows that shared contract.

If the host doesn't override anything, the defaults are all on:
CRC validation, sequence-number tracking, ACKs, and event
notifications. The default max payload is the cam's per-board
buffer minus 14 bytes of framing overhead (the 10-byte header plus
the 4-byte trailing payload CRC). For most cam-to-laptop work the
defaults are the right starting point; the reliability page covers
when and why an application opts pieces of them off.

Channel discovery
-----------------

After capabilities, the host sends ``CHANNEL_LIST`` (opcode
``0x20``). The cam replies with a list of registered channels --
the four built-in ones (``stdin``, ``stdout``, ``stream``,
``profile``) plus any the application registered with
:func:`protocol.register`. Each entry carries the channel's ID, its
name, and its capability flags (read-only, write-only, lockable).

The host stashes the list and uses it later when application code
asks for ``channel_read("frame")`` or ``channel_write("config",
...)`` -- the name is looked up to a channel ID once, then every
subsequent packet on that channel uses the ID directly.

If the cam registers a new channel after the initial list -- common
when an application starts running after the handshake -- the cam
emits a ``CHANNEL_REGISTERED`` event packet. The host listens for
those and refreshes its internal channel list, so a host script that
attached early sees newly-registered channels appear without
restarting.

The handshake takes a few round-trips on connection setup and then
never repeats. Steady-state traffic is just packets: framed bytes
in, framed bytes out, the channel IDs already known on both sides.
