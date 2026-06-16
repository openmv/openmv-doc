IP addresses
============

A hardware address picks a device out from the others on
the same local cable or radio cell. It is fine for that
job, but it is useless beyond the local segment: a
switch in the next building cannot route by it, because
the underlying mechanism that lets a switch learn MAC
addresses only works inside one segment.

The *network layer* solves that with a second kind of
address that is independent of which cable a device is
plugged into. The name for this kind of address is the
*Internet Protocol address*, or *IP address*, and the
"Internet Protocol" half names the set of rules every
host on the internet follows when it sends or forwards
one. The current internet uses two versions of the
addressing scheme in parallel -- IPv4 (the older form,
still dominant on small networks) and IPv6 (the newer
form, slowly replacing it).

What an IP address is
---------------------

An IP address is a number large enough to identify any
device on the internet uniquely. It is written in a
human-readable form that the rest of the section uses,
but in the packet header it is just a fixed-size integer.

* **IPv4** addresses are 32 bits long and are written as
  four decimal numbers separated by dots, each number
  being one byte::

      192.168.1.42
      8.8.8.8
      10.0.0.1

  Thirty-two bits gives roughly four billion possible
  addresses, which sounded like plenty when IPv4 was
  designed in the 1970s and was not enough by the early
  2010s.

* **IPv6** addresses are 128 bits long and are written as
  eight groups of four hexadecimal digits separated by
  colons::

      2001:0db8:85a3:0000:0000:8a2e:0370:7334

  Runs of zeros can be shortened to ``::``, and leading
  zeros in a group can be dropped, so the address above
  is normally written ``2001:db8:85a3::8a2e:370:7334``.

The two address families are otherwise different
languages; an IPv4 host cannot directly send a packet to
an IPv6 host without help from a gateway. The camera's
:mod:`network` and :mod:`socket` modules support both.
This tutorial uses IPv4 in examples because most local
networks the camera will join are still IPv4-only, but
everything that follows works exactly the same way for
IPv6 once the addresses are swapped out.

What an IP address is *for*
---------------------------

The IP address says *which host on the internet a
packet is meant for*. A router that does not know how to
reach a destination directly knows that some other
router probably does, and forwards the packet there. The
packet hops between routers, each one a little closer to
the destination, until a router that *is* on the
destination's local segment delivers the final hop.

That hop-by-hop behaviour is what makes the internet
work as one big network instead of many small islands.
The :doc:`next page <packets-and-routing>` covers how
the hops are chosen; this one is just about the address.

How a camera gets one
---------------------

A camera that has just joined a Wi-Fi network needs an
IP address before it can talk to anything. There are
two common ways for that to happen.

The first is *automatic assignment*. The camera asks the
local network for an address; the device that hands one
out is the *router* -- the box that connects the local
network to the wider internet. In most home and
small-office setups, the same physical box also acts as
the switch wired devices plug into and as the Wi-Fi
access point wireless ones associate with, so "the
router", "the switch", and "the access point" may all be
the same piece of hardware. The router runs a small
service called *DHCP* (the Dynamic Host Configuration
Protocol), which keeps a pool of available addresses,
picks one for each newly-arrived device, and *leases*
it for a fixed time. While DHCP is at it, the router also hands the
camera a couple of other useful pieces of configuration:

* the address to send outbound traffic to when the
  destination is off the local network (the *default
  gateway*, which is the router's own address); and
* the addresses of one or more *name servers* that turn
  human-readable names like ``example.com`` into IP
  addresses. The name-lookup service is called *DNS*,
  the Domain Name System, and :doc:`../names/dns`
  covers it in detail.

All of this happens automatically while the link is
coming up. The camera does not have to ask for any of
it explicitly; the moment
:meth:`~network.WLAN.isconnected` returns :data:`True`
in the example on the previous page, the cam already
has its address, its gateway, and its name servers.

The second option is *static configuration*. Some
deployments want a known address for the camera so that
other devices can reach it without first looking it up.
The :meth:`~network.WLAN.ipconfig` method sets the
address, the gateway, and the name server by hand::

    wlan.ipconfig(addr4=("192.168.1.50/24", "192.168.1.1"))
    wlan.ipconfig(dns="192.168.1.1")

Static configuration is fragile (two devices
accidentally given the same address conflict). Reach
for the DHCP default unless a specific reason to
override it shows up.

Once the camera has an IP address, it has *joined* the
internet (or at least the local network's piece of it).
Other devices can now address packets to it by that
address, and it can address packets to them.

The netmask and the ``/24``
---------------------------

The ``/24`` at the end of the address in the static
example above is the *netmask*. An IP address by
itself does not say where the local network ends --
``192.168.1.50`` could be one of a few hundred
addresses on a small home network, or one of thousands
on a larger one. The netmask says how much of the
address names the *network* and how much names the
*host* inside it.

``/24`` means "the first 24 of the 32 bits name the
network; the last 8 name the host". For
``192.168.1.50/24`` that splits the address into
``192.168.1`` for the network and ``.50`` for the host,
leaving room for about 254 devices on the same local
network. ``/16`` would leave more bits for the host
half and fit far more devices on one network; ``/30``
would leave only two host addresses and fit a
point-to-point link.

The netmask is also commonly written as a four-byte
number in the same dotted notation as the address.
``/24`` is equivalent to ``255.255.255.0`` -- read each
byte as "all the bits that belong to the network half".
The two forms are interchangeable; the
:meth:`~network.WLAN.ipconfig` reader in the next
subsection happens to return the four-byte form.

Why the split matters at all -- how a device uses the
netmask to decide whether a destination is on the
local network or needs to go out through the gateway,
and why most home networks land on ``/24`` -- is
covered on :doc:`private-networks`.

Reading the address back
------------------------

The :meth:`~network.WLAN.ipconfig` method without
arguments returns the active configuration. The
``addr4`` view returns the IP address and netmask::

    >>> wlan.ipconfig("addr4")
    ('192.168.1.50', '255.255.255.0')
