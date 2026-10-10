The cable and the frame
=======================

The two lowest layers of the stack are the easiest to
take for granted on the camera, because everything they
do happens inside the chip and the camera handles them
without any Python code being involved. They are still
worth a brief tour, because they explain what "local
network" means and where the boundary to the rest of
the infrastructure starts.

The physical layer
------------------

The bottom layer is the actual signalling -- the wires,
optical fibres, or radio waves that carry bits between
two devices. Ethernet over twisted-pair cables encodes
each bit as a voltage transition at a fixed rate.
Wi-Fi modulates the same bits onto a radio carrier in
the 2.4 GHz or 5 GHz band. Both produce a stream of
binary digits between two pieces of hardware; both are
the kind of detail the camera's silicon handles without
software having to think about it.

From a Python script's perspective the physical layer is
"the link is up" or "the link is down". The :mod:`network`
module reports that state through its
:meth:`~network.WLAN.isconnected` method on the Wi-Fi
interface and through the link status on a wired
Ethernet interface. Beyond that, everything else this
layer does is hidden.

The link layer
--------------

One step up sits the *link layer* -- the rules for
sending a chunk of bytes (a *frame*) between two devices
that share the same physical segment. The link layer
adds two things on top of raw signalling:

* **Hardware addressing.** Every network interface comes
  with a unique 48-bit identifier called a *MAC address*
  (Media Access Control). On Ethernet it is burned into
  the chip; on Wi-Fi it is the same kind of identifier
  burned into the wireless module. MAC addresses are
  what a *switch* -- the box with multiple Ethernet
  ports that nearby devices plug into -- uses to decide
  which port a given frame should go out on. A Wi-Fi
  access point plays the same role for wireless devices
  on its channel.

* **Framing.** The bytes a higher layer hands down are
  packaged into a frame with a small header, the
  payload, and a checksum at the end. The header
  carries the source and destination MAC addresses; the
  checksum lets the receiver detect a frame whose
  bytes were corrupted in transit. Frames that fail the
  check are discarded silently -- whoever cares about
  reliability has to put it back at a higher layer.

A *local segment* is whatever group of devices can see
each other's frames directly -- the wired ports on one
switch, all the devices associated with one Wi-Fi access
point, or a small mesh of interconnected switches. The
link layer cannot reach beyond that segment. As soon as
the destination sits on a different segment, the message
has to be handed off to the layer above.

What the camera exposes
-----------------------

The camera has a MAC address for each network interface
it has -- a Wi-Fi one if the cam has wireless support,
an Ethernet one if the board has the corresponding
port. The :mod:`network` module gives
access to it through ``network_interface.config("mac")``
on whichever interface object the application is using,
when it needs to read the address. Some applications need to, for instance to register
the device with a fleet management system. Otherwise,
this is the only knob the link layer turns over to
Python.

Everything else -- framing, the actual MAC traffic on
the wire or the air, the negotiation between the camera
and the access point about which channel and rate to
use -- happens entirely inside the wireless or Ethernet
hardware. The :doc:`next page <bringing-the-link-up>`
covers the one place a Python script does have a say in
the link layer: telling the camera which network to
join.
