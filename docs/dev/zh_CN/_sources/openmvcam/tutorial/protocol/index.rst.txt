Host Protocol
=============

Every OpenMV cam ships with a protocol stack that exposes the camera
as a set of named data channels to a host program. The host program
might be a Python script on the developer's laptop, a desktop GUI,
another cam on the other end of a UART, or a service running on a
workstation watching a fleet of cameras.
The cam doesn't care which -- the same framing, the same reliability
machinery, the same channel abstraction works for all of them.

This is the answer to two questions that come up constantly once a
cam project leaves the IDE:

* *"How do I get a live view of what the cam sees into a custom GUI
  on my laptop?"*
* *"How do I let an operator change a threshold or pick a region of
  interest at runtime, without reflashing?"*

The :mod:`protocol` module on the cam side and the `openmv-python
<https://github.com/openmv/openmv-python>`_ package on the host side
answer both questions, by letting a Python class on the cam expose a
*channel* that a Python class on the host can read from, write to,
and react to events on, all over a single USB or serial connection.

.. image:: figures/system-overview.svg
   :alt: A host PC connects to a cam over USB; the cam exposes three
         channels -- a frame channel for image data, a config
         channel for control values, and the built-in stdout
         channel for prints -- and the host script reads or writes
         each.
   :align: center

The chapter teaches both sides. The cam-side code shows how to
register channels and feed them; the host-side code shows how to
connect, list the channels, pull data, and push commands back. Real
tools that ship in the `openmv-projects/tools/
<https://github.com/openmv/openmv-projects/tree/master/tools>`_
directory use exactly the patterns shown here.

.. toctree::
   :caption: Concepts
   :maxdepth: 1

   concepts/why-a-protocol.rst
   concepts/the-four-layers.rst

.. toctree::
   :caption: Framing
   :maxdepth: 1

   framing/packet-format.rst
   framing/handshake.rst
   framing/reliability.rst

.. toctree::
   :caption: Channels
   :maxdepth: 1

   channels/named-channels.rst
   channels/channel-callbacks.rst

.. toctree::
   :caption: Streaming
   :maxdepth: 1

   streaming/streaming-frames.rst
   streaming/bidirectional.rst

.. toctree::
   :caption: Wrap up
   :maxdepth: 1

   wrap-up.rst
