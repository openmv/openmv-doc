Networking
==========

Hardware control connected the camera to a wire and a
known partner on the other end. Networking is what
happens when the partner is not on that wire -- a laptop
on the same Wi-Fi, a sensor in another room, a server in
another country -- and when the path between the two
endpoints passes through hardware nobody on either side
controls.

Two modules cover Python's side of this. The
:mod:`network` module brings the camera onto a network
in the first place: joining a Wi-Fi network or plugging
into Ethernet, picking up an address, getting the cam
ready to participate. The :mod:`socket` module is what
Python code opens to actually send and receive bytes
once the link is up. The pages ahead walk through what
sits between, layer by layer, so "open a socket and
write bytes" feels inevitable instead of magic.

.. toctree::
   :caption: Concepts
   :maxdepth: 1

   basics/why-networks.rst
   basics/layered-protocols.rst

.. toctree::
   :caption: The bottom layers
   :maxdepth: 1

   lower-layers/physical-and-link.rst
   lower-layers/bringing-the-link-up.rst

.. toctree::
   :caption: The network layer
   :maxdepth: 1

   network/ip-addresses.rst
   network/packets-and-routing.rst
   network/private-networks.rst

.. toctree::
   :caption: The transport layer
   :maxdepth: 1

   transport/ports.rst
   transport/udp.rst
   transport/tcp.rst

.. toctree::
   :caption: Sockets in Python
   :maxdepth: 1

   sockets/socket-objects.rst
   sockets/udp-sockets.rst
   sockets/tcp-sockets.rst
   sockets/async-sockets.rst

.. toctree::
   :caption: Names
   :maxdepth: 1

   names/dns.rst
   names/ntp.rst

.. toctree::
   :caption: Security
   :maxdepth: 1

   encrypted-sockets.rst

.. toctree::
   :caption: A real protocol: MQTT
   :maxdepth: 1

   mqtt/protocol-on-the-wire.rst
   mqtt/mqtt-in-python.rst

.. toctree::
   :caption: Wrap up
   :maxdepth: 1

   wrap-up.rst
