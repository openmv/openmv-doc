Why networks
============

Hardware control gave the camera ways to talk to a
specific other device on a specific other wire. UART
between the camera and a single companion board. I2C
between the camera and the sensors hanging off the same
short bus. CAN between a small set of modules sharing
one robust bus. Each case follows the same shape: two
parties (or a small known group), one shared medium, an
agreement between them about what the bytes on that
medium mean.

That shape stops scaling
------------------------

The point-to-point pattern works as long as both ends are
nearby, both ends are known in advance, and the script
gets to pick which wire it talks down. Once any of those
constraints break, the wiring stops being enough.

* **Many counterparts.** A network of fifty cameras
  reporting to one server cannot be wired one-to-one;
  there are not enough UARTs on the server, and the
  cable runs would be impossible.
* **Counterparts not on the same wire.** A camera in a
  factory and a dashboard in an office across town cannot
  share a serial cable. Some path has to exist between
  them through whatever infrastructure already runs
  between the two buildings.
* **Counterparts not known in advance.** A camera that
  publishes its results to the cloud does not pick which
  server it talks to in the wiring diagram; the cloud's
  address is something the script looks up at runtime
  and routes data to.
* **Many programs on one cable.** A laptop today is
  running a browser, a chat app, a video call, and a
  backup, all talking through the same network interface
  at the same time. The wire cannot be "owned" by one
  conversation the way a UART is.

Each of those failures is a different *kind* of
addressing problem. Solving them all together requires
more than a wire and a baud rate.

What a network is
-----------------

A *network* is the infrastructure that lets any of a
large number of computers exchange messages with any
other, without each pair needing its own dedicated link.
Three properties make a network something more than a
big serial cable:

* **Shared medium.** Many devices attach to the same
  cable, switch, or radio channel. They take turns or
  multiplex so that more than one conversation can fit
  on the same physical link.
* **Logical addresses.** Each device has a number that
  identifies it independently of which cable it is
  plugged into. Sending a message means writing that
  number on the message, not connecting a specific wire.
* **Routing.** When the sender and the receiver are not
  on the same local segment, the infrastructure
  *between* them carries the message hop by hop. The
  endpoints do not know the route; they just know each
  other's address.

A laptop on the office Wi-Fi reaching a server in a
distant data centre uses all three. The Wi-Fi link is a
shared radio medium; the laptop and server each have
their own logical address; the message threads through
whatever infrastructure sits between the two,
forwarded one hop at a time. The user clicks a link,
the laptop sends a packet, and the network handles the
rest.

What about the cam?
-------------------

The camera plays exactly the same role on a network as
the laptop. It picks up a logical address when it joins
the network, addresses outgoing messages to other
devices' logical addresses, and lets the infrastructure
route them.

What changes from the hardware-control chapters is the
*interface*. Instead of opening a UART instance and
writing bytes to it, the script opens a *socket* and
writes bytes to that. The socket is an endpoint into the
network, the same way a UART instance is an endpoint
into a wire. The pieces between the socket and the wire
-- frames, packets, routing tables, switches, radios --
all sit underneath and are mostly invisible to the
Python code.

The pages ahead spell out those pieces, layer by layer,
so the abstraction "open a socket and send bytes" feels
inevitable instead of magic.
