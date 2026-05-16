:mod:`ubluepy` --- Bluetooth LE peripheral and central
======================================================

.. module:: ubluepy
   :synopsis: Nordic-specific Bluetooth LE peripheral and central API

The ``ubluepy`` module is the legacy Bluetooth LE API shipped with the
MicroPython **nRF port**. It is loosely modelled on the Linux
`bluepy <https://github.com/IanHarvey/bluepy>`_ Python library and
sits directly on top of the Nordic SoftDevice — there is no portable
back-end, so the module is only available on Nordic targets (the
Arduino Nano 33 BLE Sense in OpenMV's lineup). The newer
:mod:`bluetooth` / :doc:`aioble </library/aioble>` APIs are **not**
enabled in this build, so ``ubluepy`` is the only way to drive the
on-die radio.

The available feature set depends on the SoftDevice flashed by the
firmware:

* **s140** (Nano 33 BLE Sense) — both peripheral *and* central
  (scanner) roles. This is what the OpenMV firmware ships.
* **s132** — both peripheral and central.
* **s110** — peripheral only; scanner / connect methods are
  compiled out.

Peripheral example
------------------

Advertise as a Bluetooth LE peripheral with a single environmental
sensing service and notify a temperature characteristic on every
write to its Client Characteristic Configuration Descriptor
(CCCD)::

    from ubluepy import Service, Characteristic, UUID, Peripheral, constants
    from machine import LED

    notif_enabled = False

    def event_handler(event_id, handle, data):
        global notif_enabled
        if event_id == constants.EVT_GAP_CONNECTED:
            LED("LED_GREEN").on()
        elif event_id == constants.EVT_GAP_DISCONNECTED:
            LED("LED_GREEN").off()
            periph.advertise(device_name="Nano 33", services=[svc])
        elif event_id == constants.EVT_GATTS_WRITE:
            notif_enabled = bool(data[0])

    svc = Service(UUID("181A"))            # Environmental Sensing
    char = Characteristic(UUID("2A6E"),
                          props=Characteristic.PROP_NOTIFY | Characteristic.PROP_READ,
                          attrs=Characteristic.ATTR_CCCD)
    svc.addCharacteristic(char)

    periph = Peripheral()
    periph.addService(svc)
    periph.setConnectionHandler(event_handler)
    periph.advertise(device_name="Nano 33", services=[svc])

Central example
---------------

Scan for nearby advertising devices for 100 ms and decode each
``ScanEntry``'s advertisement data::

    from ubluepy import Scanner, constants

    s = Scanner()
    for entry in s.scan(100):
        print(entry.addr(), entry.rssi(), "dBm")
        for ad_type, name, value in entry.getScanData():
            print(" ", ad_type, name, bytes(value))

Module contents
---------------

Classes
~~~~~~~

.. class:: UUID(value)

   Construct a 16- or 128-bit Bluetooth UUID.

   ``value``
      One of:

      * ``int`` — a 16-bit numeric UUID (``UUID(0x180A)``).
      * 6-character ``"0xXXXX"`` string — a 16-bit UUID, e.g.
        ``UUID("0x181A")``.
      * 36-character ``"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"``
        string — a full 128-bit UUID. The vendor-specific portion
        is registered with the SoftDevice on construction.
      * Another :class:`UUID` instance — performs a copy.

      Any other length raises ``ValueError("Invalid UUID string
      length")``.

   .. method:: binVal() -> int

      Return the low 16 bits of the UUID as an ``int``. For
      128-bit UUIDs only the 16-bit field embedded inside the
      vendor-specific UUID is returned (the full 128-bit value is
      accessible only via the SoftDevice's vendor-specific index).

.. class:: Service(uuid: UUID, type: int = Service.PRIMARY)

   Define a GATT service that will be registered with the
   SoftDevice when added to a :class:`Peripheral`.

   ``uuid``
      A :class:`UUID` instance. Passing a non-UUID object raises
      ``ValueError``.

   ``type``
      Either :data:`Service.PRIMARY` (default) or
      :data:`Service.SECONDARY`. Other values raise
      ``ValueError``.

   .. method:: uuid() -> UUID

      Return the service's :class:`UUID` instance.

   .. method:: addCharacteristic(characteristic: Characteristic) -> None

      Register a :class:`Characteristic` with the service. The
      characteristic's GATT handle is assigned during this call.

   .. method:: getCharacteristic(uuid: UUID) -> Characteristic | None

      Look up a previously added :class:`Characteristic` by UUID.
      Returns the characteristic instance, or ``None`` if no
      match is found.

   .. method:: getCharacteristics() -> list

      Return the list of every characteristic added to the service.

   .. data:: PRIMARY
      :type: int

      Service-type constant for primary services (``1``).

   .. data:: SECONDARY
      :type: int

      Service-type constant for secondary services (``2``).

.. class:: Characteristic(uuid: UUID, *, props: int = PROP_READ | PROP_WRITE, attrs: int = 0)

   Define a GATT characteristic. Add it to a :class:`Service` with
   :meth:`Service.addCharacteristic` before the parent
   :class:`Peripheral` starts advertising.

   ``uuid``
      A :class:`UUID` instance.

   ``props`` (keyword-only)
      Bitmask of one or more ``Characteristic.PROP_*`` values
      describing what operations the characteristic supports.

   ``attrs`` (keyword-only)
      Bitmask of additional GATT attributes. Use
      :data:`Characteristic.ATTR_CCCD` to attach a Client
      Characteristic Configuration Descriptor — required to make
      ``PROP_NOTIFY`` / ``PROP_INDICATE`` characteristics work.

   .. method:: uuid() -> UUID

      Return the characteristic's :class:`UUID` instance.

   .. method:: properties() -> int

      Return the ``props`` bitmask set at construction time.

   .. method:: read() -> bytearray

      **Central role only.** Read the characteristic's value from
      the connected peer. Returns a ``bytearray`` with the latest
      value. On a peripheral this is a no-op and returns ``None``.

   .. method:: write(data, *, with_response: bool = False) -> None

      Write to the characteristic.

      * On a **peripheral**, if ``PROP_NOTIFY`` is set in the
        characteristic's properties the value is sent as a GATT
        notification to the connected central; otherwise the
        local attribute value is updated.
      * On a **central**, the value is written to the remote
        peer. Set ``with_response=True`` to issue a write request
        and wait for the peer's acknowledgement instead of a
        write command.

      ``data`` is any buffer-protocol object (``bytes``,
      ``bytearray``, ``memoryview``).

   .. data:: PROP_BROADCAST
      :type: int

      Characteristic can broadcast its value (``0x01``).

   .. data:: PROP_READ
      :type: int

      Characteristic supports reads (``0x02``).

   .. data:: PROP_WRITE_WO_RESP
      :type: int

      Characteristic supports writes without response (``0x04``).

   .. data:: PROP_WRITE
      :type: int

      Characteristic supports writes with response (``0x08``).

   .. data:: PROP_NOTIFY
      :type: int

      Characteristic can push notifications to a subscribed
      central (``0x10``).

   .. data:: PROP_INDICATE
      :type: int

      Characteristic can push indications (acknowledged
      notifications) to a subscribed central (``0x20``).

   .. data:: PROP_AUTH_SIGNED_WR
      :type: int

      Characteristic supports authenticated signed writes
      (``0x40``).

   .. data:: ATTR_CCCD
      :type: int

      Add a Client Characteristic Configuration Descriptor to the
      characteristic (``0x01``). Required for clients to be able
      to subscribe to notifications/indications.

.. class:: Descriptor(uuid: UUID)

   Stub class for representing GATT descriptors. The current
   implementation only stores the UUID and exposes no methods —
   it is provided for forward compatibility with future revisions
   of the module.

.. class:: Peripheral()

   The local Bluetooth LE device. The same class is used for both
   peripheral and central roles; the role is selected by which
   methods you call (:meth:`advertise` selects peripheral,
   :meth:`connect` selects central).

   .. method:: addService(service: Service) -> None

      Register a :class:`Service` (and all its previously added
      characteristics) with the local GATT server.

   .. method:: getServices() -> list

      Return the list of services currently registered with this
      :class:`Peripheral`.

   .. method:: advertise(*, device_name: str | None = None, services: list | None = None, data: bytes | None = None, connectable: bool = True) -> None

      Start advertising in peripheral role.

      ``device_name``
         Complete local name advertised in the GAP payload.

      ``services``
         List of :class:`Service` instances to advertise. Each
         service's UUID is included in the advertisement.

      ``data``
         Optional raw advertisement payload (``bytes`` /
         ``bytearray``) appended to the auto-generated header.
         Use this for vendor-specific or beacon payloads such as
         Eddystone.

      ``connectable``
         When ``True`` (default), advertise as a connectable
         device and register GAP / GATTS event handlers so the
         configured :meth:`setConnectionHandler` callback fires
         on connect, disconnect, and CCCD writes. When
         ``False``, advertise as a beacon — no handlers are
         attached and the device cannot be connected to.

   .. method:: advertise_stop() -> None

      Stop any in-progress advertisement.

   .. method:: setConnectionHandler(func) -> None

      Register a callback invoked on GAP and GATTS events. The
      callback is called as ``func(event_id, conn_handle, data)``
      where ``event_id`` is one of the
      :data:`constants.EVT_GAP_CONNECTED`,
      :data:`constants.EVT_GAP_DISCONNECTED`, or
      :data:`constants.EVT_GATTS_WRITE` values, ``conn_handle``
      is the SoftDevice connection handle (or attribute handle
      for GATTS writes), and ``data`` is the raw event payload
      as a ``bytearray`` (or ``None`` for connect / disconnect).

   .. method:: setNotificationHandler(func) -> None

      Register a callback for notification events received in
      central role.

   .. method:: withDelegate(delegate: DefaultDelegate) -> None

      Attach a :class:`DefaultDelegate` instance to receive
      decoded GATT events.

   .. method:: disconnect() -> None

      Drop the active connection (currently a no-op stub in this
      build).

   .. method:: connect(addr, *, addr_type: int = constants.ADDR_TYPE_PUBLIC) -> None

      **Central role only.** Connect to the peer with the given
      address and synchronously discover its primary services
      and characteristics. Blocks until the connection is
      established and discovery completes; the discovered
      services are then available via :meth:`getServices`.

      ``addr``
         Peer address as a 17-character ``"xx:xx:xx:xx:xx:xx"``
         string (e.g. taken from
         :meth:`ScanEntry.addr`).

      ``addr_type`` (keyword-only)
         Either :data:`constants.ADDR_TYPE_PUBLIC` (default) or
         :data:`constants.ADDR_TYPE_RANDOM_STATIC`.

.. class:: Scanner()

   GAP observer for discovering nearby advertising devices.
   Available only when the firmware is built against a
   SoftDevice with central support (s132 / s140).

   .. method:: scan(timeout: int) -> list

      Run a passive scan for ``timeout`` milliseconds and return
      a list of :class:`ScanEntry` instances — one per
      advertisement report received during the window.

.. class:: ScanEntry()

   A single advertisement report captured by
   :meth:`Scanner.scan`. Instances are returned from the scanner
   — there is no public constructor.

   .. method:: addr() -> str

      Return the peer address as a 17-character
      ``"xx:xx:xx:xx:xx:xx"`` string.

   .. method:: addr_type() -> int

      Return the peer address type
      (:data:`constants.ADDR_TYPE_PUBLIC` or
      :data:`constants.ADDR_TYPE_RANDOM_STATIC`).

   .. method:: rssi() -> int

      Return the signal-strength indicator in dBm.

   .. method:: getScanData() -> list

      Decode the advertisement payload into a list of
      ``(ad_type, description, value)`` tuples. ``ad_type`` is
      the numeric AD type byte
      (see :data:`constants.ad_types`), ``description`` is the
      matching constant's name as a string (or ``None`` if the
      type is unknown), and ``value`` is the AD record body as a
      ``bytearray``.

.. class:: DefaultDelegate()

   Base class for objects passed to :meth:`Peripheral.withDelegate`.
   Subclass it and override :meth:`handleConnection` /
   :meth:`handleNotification` to react to GATT events.

   .. method:: handleConnection() -> None

      Called on GAP connect / disconnect events. The default
      implementation is empty.

   .. method:: handleNotification() -> None

      Called on incoming GATT notifications. The default
      implementation is empty.

Constants
---------

The :data:`constants` attribute of the module is a namespace
containing GAP/GATT event identifiers, address-type values, and
the nested :data:`ad_types` namespace.

.. data:: constants
   :type: type

   Container exposing the constants below.

.. data:: constants.EVT_GAP_CONNECTED
   :type: int

   ``Peripheral`` connection handler ``event_id`` value for GAP
   connect (``16``).

.. data:: constants.EVT_GAP_DISCONNECTED
   :type: int

   ``Peripheral`` connection handler ``event_id`` value for GAP
   disconnect (``17``).

.. data:: constants.EVT_GATTS_WRITE
   :type: int

   ``Peripheral`` connection handler ``event_id`` value for a
   write to a local GATT attribute, including writes to a CCCD
   that enable/disable notifications (``80``).

.. data:: constants.UUID_CCCD
   :type: int

   Standard Bluetooth UUID for the Client Characteristic
   Configuration Descriptor (``0x2902``).

.. data:: constants.ADDR_TYPE_PUBLIC
   :type: int

   Public Bluetooth Device Address (``0``).

.. data:: constants.ADDR_TYPE_RANDOM_STATIC
   :type: int

   Static random Bluetooth Device Address (``1``).

.. data:: constants.ad_types
   :type: type

   Namespace of advertising-data AD-type constants from the
   `Bluetooth Core Specification Supplement
   <https://www.bluetooth.com/specifications/specs/core-specification-supplement-12/>`_.
   Each name maps to the corresponding 1-byte AD type:

   .. csv-table::
      :header: "Name", "Value"
      :widths: 70, 30

      "``AD_TYPE_FLAGS``",                              "``0x01``"
      "``AD_TYPE_16BIT_SERVICE_UUID_MORE_AVAILABLE``",  "``0x02``"
      "``AD_TYPE_16BIT_SERVICE_UUID_COMPLETE``",        "``0x03``"
      "``AD_TYPE_32BIT_SERVICE_UUID_MORE_AVAILABLE``",  "``0x04``"
      "``AD_TYPE_32BIT_SERVICE_UUID_COMPLETE``",        "``0x05``"
      "``AD_TYPE_128BIT_SERVICE_UUID_MORE_AVAILABLE``", "``0x06``"
      "``AD_TYPE_128BIT_SERVICE_UUID_COMPLETE``",       "``0x07``"
      "``AD_TYPE_SHORT_LOCAL_NAME``",                   "``0x08``"
      "``AD_TYPE_COMPLETE_LOCAL_NAME``",                "``0x09``"
      "``AD_TYPE_TX_POWER_LEVEL``",                     "``0x0A``"
      "``AD_TYPE_CLASS_OF_DEVICE``",                    "``0x0D``"
      "``AD_TYPE_SIMPLE_PAIRING_HASH_C``",              "``0x0E``"
      "``AD_TYPE_SIMPLE_PAIRING_RANDOMIZER_R``",        "``0x0F``"
      "``AD_TYPE_SECURITY_MANAGER_TK_VALUE``",          "``0x10``"
      "``AD_TYPE_SECURITY_MANAGER_OOB_FLAGS``",         "``0x11``"
      "``AD_TYPE_SLAVE_CONNECTION_INTERVAL_RANGE``",    "``0x12``"
      "``AD_TYPE_SOLICITED_SERVICE_UUIDS_16BIT``",      "``0x14``"
      "``AD_TYPE_SOLICITED_SERVICE_UUIDS_128BIT``",     "``0x15``"
      "``AD_TYPE_SERVICE_DATA``",                       "``0x16``"
      "``AD_TYPE_PUBLIC_TARGET_ADDRESS``",              "``0x17``"
      "``AD_TYPE_RANDOM_TARGET_ADDRESS``",              "``0x18``"
      "``AD_TYPE_APPEARANCE``",                         "``0x19``"
      "``AD_TYPE_ADVERTISING_INTERVAL``",               "``0x1A``"
      "``AD_TYPE_LE_BLUETOOTH_DEVICE_ADDRESS``",        "``0x1B``"
      "``AD_TYPE_LE_ROLE``",                            "``0x1C``"
      "``AD_TYPE_SIMPLE_PAIRING_HASH_C256``",           "``0x1D``"
      "``AD_TYPE_SIMPLE_PAIRING_RANDOMIZER_R256``",     "``0x1E``"
      "``AD_TYPE_SERVICE_DATA_32BIT_UUID``",            "``0x20``"
      "``AD_TYPE_SERVICE_DATA_128BIT_UUID``",           "``0x21``"
      "``AD_TYPE_URI``",                                "``0x24``"
      "``AD_TYPE_3D_INFORMATION_DATA``",                "``0x3D``"
      "``AD_TYPE_MANUFACTURER_SPECIFIC_DATA``",         "``0xFF``"
