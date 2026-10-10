Bluetooth
=========

Networking connected the camera to anything reachable
through an access point and a router. Bluetooth is the
opposite trade. The camera gives up *reach* and gets
*short range, low power, and no infrastructure* in
return -- a couple of metres of direct radio link to a
phone or a sensor in the same room, no Wi-Fi network to
join, no router to route through, power draw small
enough that a coin cell can keep the camera alive for
months.

The Python side of this is the :mod:`aioble` module --
an :mod:`asyncio`-friendly wrapper that turns the BLE
radio's roles, advertising, discovery, and read/write/
notify primitives into coroutines.

.. toctree::
   :caption: Concepts
   :maxdepth: 1

   basics/why-bluetooth.rst
   basics/layered-model.rst

.. toctree::
   :caption: The radio
   :maxdepth: 1

   radio/physical-and-link.rst

.. toctree::
   :caption: Generic Access Profile
   :maxdepth: 1

   gap/advertising-and-scanning.rst
   gap/connections.rst

.. toctree::
   :caption: Generic Attribute Profile
   :maxdepth: 1

   gatt/services-and-characteristics.rst
   gatt/operations.rst

.. toctree::
   :caption: aioble in Python
   :maxdepth: 1

   aioble/overview.rst
   aioble/peripheral.rst
   aioble/central.rst
   aioble/l2cap.rst
   aioble/concurrency.rst

.. toctree::
   :caption: Security
   :maxdepth: 1

   security/pairing-and-bonding.rst

.. toctree::
   :caption: Wrap up
   :maxdepth: 1

   wrap-up.rst
