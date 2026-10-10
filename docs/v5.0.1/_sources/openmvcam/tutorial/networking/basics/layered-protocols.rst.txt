Layered protocols
=================

Sending a frame from the camera to a server in another
city means solving several problems at once. The
electrical signal has to make it across the first wire.
The bytes on that wire have to find their way through a
local switch. The local network has to hand the message
off to whatever sits between it and the rest of the
internet. The packets that survive the trip have to be
re-assembled in order. The receiver has to know which of
its programs to give them to. And the bytes themselves
have to mean something both ends agree on.

Trying to solve all of that in one block of code would
be unmanageable. The standard answer is to split the job
into *layers*. Each layer solves one well-defined
problem and exposes a simple service to the layer above.
A program only ever talks to the layer directly under
it; the layers beneath that one are invisible.

.. figure:: ../figures/layered-stack.svg
   :alt: A vertical stack of five boxes labelled from
         bottom to top: physical, link, network,
         transport, application. An arrow on the right
         points up the stack labelled "what we build".
         An arrow on the left points down the stack
         labelled "what is provided".

   Each layer of a network stack solves one problem and
   hands a clean abstraction up to the next.

The five layers
---------------

The names below are the ones the rest of this section
uses. They come from the standard model networks were
designed around. The exact boundaries between layers are
sometimes fuzzy, but the role each one plays is stable.

**Physical layer.** Move *bits* between two devices on
the same wire or radio. Voltage levels, light pulses, RF
modulation. The camera's job here is mostly to plug in
the right cable or join the right wireless network; the
silicon does the rest.

**Link layer.** Move *frames* (small chunks of bytes)
between two devices that share a local segment. Adds
hardware addresses so each frame can be directed at one
specific neighbour. Ethernet and Wi-Fi are the two link
technologies the camera meets in practice.

**Network layer.** Move *packets* between any two
devices on the *internet*, not just on the same local
segment. Adds a software-level address that identifies a
host independently of which cable it is on, and a
*routing* mechanism that hops a packet from one local
segment to the next until it arrives. This is the first
layer where the camera's Python code starts having
something to say.

**Transport layer.** Sit on top of packets and offer
delivery between *programs* on two hosts, not just the
hosts themselves. Two flavours are common: one delivers
a connected, ordered stream of bytes (the workhorse for
most traffic), the other delivers self-contained
messages that travel independently of each other (used
when low overhead matters more than guarantees). Adds
*port numbers* so multiple programs on the same host
can hold conversations in parallel.

**Application layer.** Everything above transport: the
protocols that give the bytes meaning. The ones a web
browser speaks to load pages -- and the ones behind
almost every other internet service the reader already
uses every day -- live here. The tutorial covers
transport in depth; this layer gets a follow-on section
of its own.

How the layers stack at run time
--------------------------------

When the camera sends bytes over the network, every
layer adds its own header in front of the data, like
nesting an envelope inside another envelope:

* The application's bytes go in first.
* The transport layer wraps them with a small header
  saying which program they belong to (the port number).
* The network layer wraps *that* with a header saying
  which host they are destined for (the software-level
  address).
* The link layer wraps *that* with a header saying which
  device on the local segment to hand them to next (the
  hardware address).
* The physical layer turns the whole bundle into bits on
  a wire.

At the other end, each layer peels off its own header
and hands the rest up. The receiving application gets
its bytes back unaware that the network, link, and
physical layers ever existed.

This nesting is why the tutorial walks bottom-up.
Understanding what the layer beneath does makes the
layer above feel inevitable. The bottom two layers are
covered in a single page each because there is almost
nothing to configure from Python. From the network layer
upward, the pace slows down as Python's role gets
bigger.
