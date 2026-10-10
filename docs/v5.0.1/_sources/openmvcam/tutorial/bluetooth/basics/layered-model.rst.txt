The BLE stack
=============

Like networking, Bluetooth Low Energy is built as a
stack of layers, each one solving a single problem and
exposing a clean abstraction to the layer above. The
names below come straight from the Bluetooth Core
specification and show up in the :mod:`aioble` and
:mod:`bluetooth` APIs.

.. figure:: ../figures/ble-stack.svg
   :alt: A vertical stack of five labelled boxes. From
         bottom to top: Physical (radio), Link Layer,
         GAP, GATT, Application. An arrow on the right
         points up the stack labelled "what we build". An
         arrow on the left points down the stack labelled
         "what is provided".

   The Bluetooth Low Energy stack. Each layer hands a
   cleaner abstraction up to the next, the same pattern
   the networking stack uses.

**Physical layer.** Move *bits* between two devices over
the 2.4 GHz radio. Channel selection, modulation, transmit
power. The camera's job is to be powered up; the silicon
does the rest.

**Link layer.** Move *packets* between two devices that
agree to talk to each other. Adds device addresses so
each packet can be aimed at one neighbour, schedules
the periodic radio events that make up a connection, and
handles retransmission of any packet the receiver did
not acknowledge.

**Generic Access Profile (GAP).** The discovery and
connection layer. Defines four *roles* -- broadcaster,
observer, peripheral, central -- and the *advertising* /
*scanning* protocol that lets two devices find each
other in the first place, plus the procedure for opening
and closing a connection between them. This is where
addresses, advertising payloads, connection parameters,
and pairing live.

**Generic Attribute Profile (GATT).** The data layer.
Sits on top of an open GAP connection and exposes a
small key/value database: one side hosts a tree of named
values called *characteristics*, the other side reads,
writes, or subscribes to them. This is where the actual
application bytes flow.

**Application.** Whatever the camera and the peer agree
the bytes mean. The Bluetooth SIG publishes standard
*profiles* -- heart rate, battery level, environmental
sensing -- that define commonly-used characteristics so
unrelated devices can interoperate, but any application
is free to define its own.

How the layers stack at run time
--------------------------------

The pattern matches the networking stack:

* The application's bytes go into a *characteristic
  value*.
* GATT wraps that with a header identifying which
  characteristic the bytes belong to.
* GAP keeps an open connection running so GATT has
  somewhere to send.
* The link layer wraps the lot in a packet, addressed
  to the peer's device address, and schedules a radio
  event to transmit it.
* The physical layer turns the packet into a brief
  burst of 2.4 GHz radio.

The physical layer and the link layer are almost
invisible from Python -- the silicon and the radio
firmware handle them. From GAP upward, the camera's
Python code gets more to say.

Two layers that the user-facing API quietly skips
-------------------------------------------------

The Bluetooth specification names two more layers that
sit between the link layer and GAP/GATT: the *Host
Controller Interface* (HCI) -- the protocol the host CPU
uses to drive a separate radio chip -- and *L2CAP* --
the multiplexer that splits one link-layer connection
into several logical channels.

Neither is visible in the :mod:`aioble` API, but neither
disappears. HCI sits inside the BLE port and is invisible
unless a custom build of MicroPython is in play, and
L2CAP is the carrier that GATT runs on top of. An
application that wants raw byte streams can claim its
own L2CAP channel
(:doc:`/openmvcam/tutorial/bluetooth/aioble/l2cap`).
