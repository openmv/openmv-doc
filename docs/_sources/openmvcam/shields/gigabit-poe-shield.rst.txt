Gigabit PoE Shield
==================

The Gigabit PoE Shield gives OpenMV Cams with on-board Ethernet a single-cable power-and-network connection over 802.3af PoE, while sustaining gigabit link speeds for high-bitrate streaming.

.. image:: ../gigabit-poe-shield-hero.jpg
    :alt: Gigabit PoE Shield
    :width: 400px
    :align: center

For full datasheet, photos, and ordering see the
`Gigabit PoE Shield product page <https://openmv.io/products/gigabit-poe-shield>`_.

Highlights
----------

* 10/100/1000 Mb/s Gigabit Ethernet
* IEEE 802.3af PoE delivering up to ~6 W to the camera
* 1500 V isolated design
* Peak UDP transmit performance over 500 Mb/s
* Ideal-OR'ing diode for stacking with dual-header shields
* Compatible with the OpenMV N6 and RT1062

Pinout
------

.. image:: ../pinout-gigabit-poe-shield.png
    :alt: Gigabit PoE Shield Pinout
    :width: 700px

Pin reference
-------------

10/100 Mb/s only uses the MDI TX and MDI RX pairs (Pairs A and B).
Gigabit (1000BASE-T) is bidirectional on all four pairs A/B/C/D, so
the MDI TX ± and MDI RX ± lines double as Pair A and Pair B at gigabit
speeds, and Pairs C and D carry the additional gigabit-only pairs.

.. csv-table::
   :header: "Pin", "Function"
   :widths: 22, 78

   "MDI LED",          "PHY link / activity LED line"
   "MDI TX P / DA P",  "Pair A positive — MDI TX+ at 10/100, BI_DA+ at gigabit"
   "MDI TX N / DA N",  "Pair A negative — MDI TX− at 10/100, BI_DA− at gigabit"
   "MDI RX P / DB P",  "Pair B positive — MDI RX+ at 10/100, BI_DB+ at gigabit"
   "MDI RX N / DB N",  "Pair B negative — MDI RX− at 10/100, BI_DB− at gigabit"
   "DC P",             "Pair C positive (BI_DC+) — gigabit only"
   "DC N",             "Pair C negative (BI_DC−) — gigabit only"
   "DD P",             "Pair D positive (BI_DD+) — gigabit only"
   "DD N",             "Pair D negative (BI_DD−) — gigabit only"
   "VIN out",          "5.6 V at up to ~1 A from the on-board PoE regulator (powers the camera)"
   "3.3V rail",        "Powers the shield's on-board electronics"
   "GND rail",         "Common ground"

Usage
-----

When the shield is connected to a PoE switch, the camera's gigabit
PHY appears as a :class:`network.LAN` interface. DHCP runs
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
