Services and characteristics
============================

Once GAP has gotten two devices into an open connection,
the layer above it -- the *Generic Attribute Profile*,
GATT -- has to give the bytes flowing through that
connection meaning. BLE's choice here is unusual. Where
TCP exposes a raw byte stream and leaves it to the
application to invent its own framing, GATT exposes a
*small key/value database* that one side hosts and the
other reads, writes, or subscribes to.

That database is what application designers spend most
of their BLE time thinking about. What the camera
publishes to a phone, what it watches on a remote
sensor, how a Bluetooth keyboard tells its host which
key was pressed -- all are characteristic values in
some GATT database somewhere.

Two role axes, not one
----------------------

A frequent source of confusion: *peripheral* /
*central* and *server* / *client* are **two
independent axes**, not synonyms.

* **Peripheral** and **central** are GAP roles, set
  during connection. The peripheral advertises and is
  connected to; the central scans and initiates the
  connection. This is settled the moment the link
  comes up and does not change.
* **Server** and **client** are GATT roles, set per
  characteristic operation. The server hosts the
  characteristic; the client reads, writes, or
  subscribes to it.

The two axes are decoupled by the spec. A peripheral
is *usually* the server (a heart-rate strap publishes
its readings) and a central is *usually* the client
(a phone reads them), but BLE allows any combination
-- a peripheral may discover a characteristic on the
central it just got connected to, or a single
connection can host services on both sides at once.

Most camera applications stick to the conventional
pairing (peripheral + server, or central + client), so
the rest of this section treats them as one axis when
the conventional case is what's being described. When
the distinction matters, both terms are spelled out
explicitly.

Inside the database
-------------------

A GATT database is a tree. The leaves carry the actual
bytes. The branches group related leaves into
human-meaningful units.

.. figure:: ../figures/gatt-tree.svg
   :alt: A tree with a top node labelled "GATT
         database". Below it, three Service nodes
         labelled "Generic Access (0x1800)", "Battery
         (0x180F)", and "Environmental Sensing
         (0x181A)". Each Service has child
         Characteristic nodes; the Battery service has
         "Battery Level (0x2A19)" with a child Descriptor
         "CCCD". The Environmental Sensing service has
         "Temperature (0x2A6E)" and "Humidity (0x2A6F)".

   A GATT database. Services group characteristics;
   characteristics carry the application's bytes;
   descriptors carry metadata about the characteristic.

There are three kinds of node:

* A **service** is a logical group of related values.
  The Bluetooth SIG publishes standard service
  definitions for common use cases -- *Battery Service*
  for battery level, *Environmental Sensing* for
  temperature / humidity / pressure, *Heart Rate* for
  heart-rate monitors -- so a generic app on a phone
  can recognise a service it has never seen before. An
  application is also free to define its own services
  for things the SIG has not standardised.
* A **characteristic** is one named value inside a
  service. Battery service has a single characteristic
  -- *Battery Level*, a one-byte percentage.
  Environmental Sensing has separate characteristics for
  temperature, humidity, pressure, and so on. A
  characteristic is the unit of GATT operations -- you
  read a characteristic, you write a characteristic,
  you subscribe to a characteristic.
* A **descriptor** is metadata attached to a
  characteristic. Some descriptors are standardised --
  the *Client Characteristic Configuration Descriptor*
  (CCCD) is the famous one, because writing to it is how
  a client tells the server "send me notifications on
  this characteristic". Others are user-defined and
  carry things like presentation format or extended
  properties.

A GATT server (typically the peripheral) declares its
database once at startup and the database does not
change while running. A GATT client (typically the
central) *discovers* what is in the database after
connecting -- walking the tree, reading the UUIDs of the
services it finds, then the characteristics inside each.

UUIDs
-----

Every service, characteristic, and descriptor has a
*UUID* (Universally Unique IDentifier) that identifies
*what kind of thing it is*. UUIDs come in three widths:

* **16-bit.** Reserved for standards defined by the
  Bluetooth SIG. Battery Service is ``0x180F``. Battery
  Level (a characteristic) is ``0x2A19``. The full list
  is published on the Bluetooth SIG's assigned-numbers
  site at https://www.bluetooth.com/specifications/assigned-numbers/.
* **32-bit.** A rarely-used middle ground.
* **128-bit.** What everyone else uses -- a vendor or
  application generates one at random and uses it for
  their custom service or characteristic. Cameras
  defining their own protocol live here.

The :class:`bluetooth.UUID` class accepts any of the
three widths::

    import bluetooth

    BATTERY_SERVICE = bluetooth.UUID(0x180F)
    CUSTOM_SERVICE = bluetooth.UUID("12345678-1234-5678-9abc-def012345678")

A 16-bit UUID encodes into a small advertising payload,
which is one reason standard services are preferable
when one exists -- a heart-rate strap that advertises
``0x180D`` (Heart Rate) costs two bytes; a custom UUID
costs sixteen. For applications that do not need
standard interoperability, a generated 128-bit UUID is
the right answer.

What the SIG-standardised services buy you
------------------------------------------

The case for using a standard service is straightforward:
*existing apps already know how to talk to it*. A device
that advertises the Heart Rate service (``0x180D``) and
exposes the Heart Rate Measurement characteristic
(``0x2A37``) works with every fitness app on the planet
without anyone writing new code. A device that
re-implements the same data with custom UUIDs needs its
own companion app and its own protocol document.

The standards do come at a cost. The byte layouts inside
each characteristic are specified -- the SIG decided
that Heart Rate Measurement is a single-byte flags field
followed by either an 8-bit or 16-bit heart rate value,
optionally followed by R-R intervals -- and a
conformant device has to follow those layouts. Custom
services are free of that constraint.

The pragmatic answer for cameras: use the standard
service when one exists for the kind of data you have
(Battery Service, Environmental Sensing), and define a
custom one with a 128-bit UUID for anything specific to
your application.

Server-side and client-side objects
-----------------------------------

For the same conceptual building blocks (service,
characteristic, descriptor), every GATT library exposes
two parallel sets of objects:

* *Server-side* objects -- what the peripheral declares
  it hosts. In :mod:`aioble`: :class:`aioble.Service`,
  :class:`aioble.Characteristic`,
  :class:`aioble.Descriptor`. These are constructed
  before advertising starts and registered with
  :func:`aioble.register_services`.
* *Client-side* objects -- what the central discovers
  on the peer after connecting. In :mod:`aioble`:
  :class:`aioble.ClientService`,
  :class:`aioble.ClientCharacteristic`,
  :class:`aioble.ClientDescriptor`. These are walked
  through :meth:`aioble.DeviceConnection.service` /
  :meth:`~aioble.DeviceConnection.services` after
  connecting.
