Names and DNS
=============

Every page so far has used numeric IP addresses --
``192.168.1.20`` and the like. Real applications almost
never do that. Servers are named ``example.com`` or
``api.example.com``, and the application looks the
name up at runtime to find an IP to send packets to.
That lookup is the *Domain Name System*, or DNS.

What a name resolves to
-----------------------

A name is just a label. ``example.com`` does not carry
any IP information itself -- it has to be looked up,
the same way a phone number is looked up in a phone
book. The DNS infrastructure is the distributed phone
book of the internet, and the result of a lookup is
one or more IP addresses the camera can connect to.

::

    example.com  ->  93.184.216.34

A single name often resolves to several addresses (for
load balancing, geographic redundancy, IPv4 *and* IPv6
versions of the same service). Any of them works; the
application picks one and tries it, falling back to the
next if that fails.

How the lookup happens
----------------------

When the camera asks for ``example.com``:

#. The camera sends a small UDP datagram (yes, UDP --
   see :doc:`../transport/udp`) to its configured DNS
   server. The DNS server's address came from the same
   DHCP exchange that handed the camera its own IP.
#. The DNS server may already have the answer cached
   (it has been asked recently). If so, it replies
   immediately.
#. If not, the DNS server walks the global DNS
   hierarchy: ask the *root* servers about ``.com``,
   ask those servers about ``example.com``, ask
   *those* servers about the name. The whole tree-walk
   is hidden from the camera; the camera sees one
   query and one reply.
#. The DNS server caches the result for next time and
   sends the reply back to the camera as another UDP
   datagram.

The whole exchange typically takes a few milliseconds
on a warm cache, up to a hundred or so on a cold one.

The Python interface
--------------------

The :func:`~socket.getaddrinfo` function does the
lookup and returns an address ready to hand to a
socket constructor::

    import socket

    addr = socket.getaddrinfo("example.com", 80)[0][-1]
    print(addr)
    # ('93.184.216.34', 80)

The signature is ``getaddrinfo(host, port)``. The
return value is a *list* of 5-tuples (one per resolved
address); the ``[0]`` picks the first one and the
``[-1]`` picks the last field, which is the
``(ip, port)`` tuple a socket can be handed directly::

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.connect(socket.getaddrinfo("example.com", 80)[0][-1])
        s.send(b"GET / HTTP/1.0\r\nHost: example.com\r\n\r\n")
        ...

Most camera code that talks to a remote server starts
with that one line. The :mod:`asyncio` helpers
(:func:`asyncio.open_connection`) do the lookup
internally if a name is passed instead of a numeric IP,
so async code typically does not call
:func:`~socket.getaddrinfo` directly.

What can go wrong
-----------------

* **No DNS server reachable.** If Wi-Fi just came up
  and the link is flaky, the first
  :func:`~socket.getaddrinfo` call may time out.
  :exc:`OSError` is raised; retry once the link is
  stable.
* **Name does not exist.** A typo or a stale name
  raises :exc:`OSError` after the DNS server returns
  "no such name". The error code distinguishes this
  from "DNS server unreachable", but for most camera
  applications the retry/give-up policy is the same.
* **Returned address does not work.** DNS may return an
  address that no longer hosts the service. The fix is
  to fall back to the next entry in
  :func:`~socket.getaddrinfo`'s result list, or look
  the name up again later (the DNS cache will likely
  have updated by then).
* **Captive portals.** Some Wi-Fi networks intercept
  DNS and return the captive-portal page's IP for
  *everything*. The camera will appear to connect but
  the data it gets back will not match what the actual
  service would send. Not common in deployed
  environments, but a thing that happens on conference
  Wi-Fi and similar networks.

The camera's own name
---------------------

The pages so far have looked up *other* devices' names.
The camera also has a name of its own that it
advertises to the local network when it asks for an
address. The default is a generic identifier that
varies by board; :func:`network.hostname` overrides it
with something the rest of the network will recognise::

    import network
    network.hostname("kitchen-cam")
    # ... then bring the link up as usual ...

Set the hostname *before* bringing the interface up,
so the name goes out as part of the camera's initial
address request rather than after.

Two things now happen once the camera has joined the
network. First, most home routers register the
hostnames they hand addresses to into their own local
lookup, so other devices can reach the cam as
``kitchen-cam`` -- without having to know the numeric
address the router happened to assign. (Enterprise
networks may or may not honour this; the behaviour is
up to the router.) Second, the cam *itself* runs an
mDNS responder out of the box, so the same name is also
reachable as ``kitchen-cam.local`` on any network whose
clients understand mDNS -- which most modern desktop
operating systems do.

.. note::

   Pass the *bare* hostname to
   :func:`network.hostname` -- just ``"kitchen-cam"``,
   no ``.local`` suffix. The ``.local`` form is what
   mDNS adds at lookup time; baking it into the
   hostname makes the cam advertise
   ``kitchen-cam.local`` as a plain hostname, which is
   not what either side of the lookup expects.

When names are not enough
-------------------------

A few situations DNS does not help with:

* **Discovery on the local network.** Standard DNS
  answers questions about names registered in the
  global directory; it knows nothing about devices on
  the local segment. *Multicast DNS* (mDNS) is the
  system that fills that gap. Every participating
  device joins a special multicast group on the local
  network and listens for queries; when a device asks
  for a name ending in ``.local``, whichever device
  owns that name answers directly. No central server,
  no DNS configuration. Bonjour on Apple devices,
  Avahi on Linux, and Windows 10+ all speak the same
  protocol -- which is why the ``kitchen-cam.local``
  name the previous section set up resolves on a home
  network with nothing extra configured.

  The cam's side of that exchange is the *responder*,
  and it is already running. What the cam does not
  have is a *resolver* -- the other half, which would
  let a script ask the network "where is
  ``printer.local``?" and get an answer back. The
  bundled mDNS code is responder-only (embedded
  devices are typically the *thing being found*, not
  the thing doing the finding). When discovery has to
  flow the other direction, UDP broadcast (see
  :doc:`../transport/udp`) is the simpler answer for
  the local-segment case, or a pure-Python module
  such as `cbrand/micropython-mdns
  <https://github.com/cbrand/micropython-mdns>`_ adds
  a full resolver.
* **IPv6 names.** :func:`~socket.getaddrinfo` returns
  both IPv4 and IPv6 results if both are available.
  Pick the family the application's socket can use.

For most camera-side code, ``getaddrinfo`` is a
one-liner at the top of any function that opens a
network connection. The examples elsewhere in this
section that ran against ``"192.168.1.20"`` would all
work the same way against a public name like
``"api.example.com"`` -- just resolve first.
