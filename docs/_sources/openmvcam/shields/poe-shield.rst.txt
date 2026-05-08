PoE Shield
==========

The PoE Shield gives OpenMV Cams with on-board Ethernet a single-cable IP-camera deployment by delivering both power and network over 802.3af PoE. Use it when 100 Mb/s is enough; reach for the Gigabit PoE Shield when you need more bandwidth.

.. image:: ../poe-shield-hero.jpg
    :alt: PoE Shield
    :width: 400px
    :align: center

For full datasheet, photos, and ordering see the
`PoE Shield product page <https://openmv.io/products/poe-shield>`_.

Highlights
----------

* 10/100 Mb/s Ethernet with IEEE 802.3af PoE
* Up to 5.67 W to the camera via 5.4 V VIN
* 1500 V isolated design — stacks with dual-header shields
* Peak UDP transmit over 90 Mb/s
* Compatible with the OpenMV N6 and RT1062

Pinout
------

.. image:: ../pinout-poe-shield.png
    :alt: PoE Shield Pinout
    :width: 700px

Pin reference
-------------

.. csv-table::
   :header: "Pin", "Function"
   :widths: 22, 78

   "MDI LED",   "PHY link / activity LED line"
   "MDI TX P",  "MDI TX+ — transmit pair positive"
   "MDI TX N",  "MDI TX− — transmit pair negative"
   "MDI RX P",  "MDI RX+ — receive pair positive"
   "MDI RX N",  "MDI RX− — receive pair negative"
   "VIN out",   "5.4 V at up to ~1 A from the on-board PoE regulator (powers the camera)"
   "3.3V rail", "Powers the shield's on-board electronics"
   "GND rail",  "Common ground"

Usage
-----

When the shield is connected to a PoE switch, the camera's 10/100
Ethernet PHY appears as a :class:`network.LAN` interface. DHCP runs
automatically once the link comes up::

    import network
    import time

    lan = network.LAN()
    lan.active(True)
    while not lan.isconnected():
        time.sleep(1)
    print("Ethernet IP:", lan.ipconfig("addr4")[0])

.. warning::

   This page is under construction.
