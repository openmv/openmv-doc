:mod:`aioble` --- Async BLE
===========================

.. module:: aioble
   :synopsis: Async BLE library

aioble is a high-level asyncio-friendly wrapper around the
:mod:`bluetooth` module. It provides clean coroutines for scanning,
connecting, advertising, GATT services, and L2CAP channels.

All remote operations (connect, disconnect, client read/write, server
indicate, l2cap recv/send, pair) are awaitable and support timeouts.

**Supported roles:**

* **Broadcaster (advertiser)** — generate advertising and scan-response
  payloads for common fields, automatically split payload across
  advertising and scan response, advertise indefinitely or for a fixed
  duration.
* **Peripheral** — wait for connection from a central, wait for MTU
  exchange.
* **Observer (scanner)** — passive and active scanning, combine
  advertising and scan-response payloads for the same device, parse
  common fields from advertising payloads.
* **Central** — connect to a peripheral, initiate MTU exchange.
* **GATT Client** — discover services / characteristics / descriptors
  (optionally by UUID); read / write / write-with-response on
  characteristics and descriptors; subscribe to notifications and
  indications (via the CCCD); wait for notifications and indications.
* **GATT Server** — register services / characteristics / descriptors;
  wait for writes on characteristics and descriptors; intercept read
  requests; send notifications and indications (and wait on response).
* **L2CAP** — accept and connect L2CAP connection-oriented channels,
  manage channel flow control.
* **Security** — JSON-backed key/secret management, initiate pairing,
  query encryption / authentication state.

The package is delivered as a meta-package built from several optional
sub-packages, any combination of which may be installed:

* ``aioble-core`` — core BLE functionality required by every aioble user.
* ``aioble-central`` — Central (and Observer) role: scanning and
  connecting.
* ``aioble-client`` — GATT client (typically used by central-role
  devices, but can also be used on peripherals).
* ``aioble-peripheral`` — Peripheral (and Broadcaster) role: advertising.
* ``aioble-server`` — GATT server (typically used by peripheral-role
  devices, but can also be used on centrals).
* ``aioble-l2cap`` — L2CAP connection-oriented-channel support.
* ``aioble-security`` — pairing and bonding support.

Installing the meta-package ``aioble`` pulls all of them in.

Requires MicroPython v1.17 or higher.

Module-level functions
----------------------

.. function:: config(*args, **kwargs) -> Any

    Forwards to :meth:`bluetooth.BLE.config`, ensuring the BLE radio is
    active first.

    *args*
        Optional single parameter name to query.

    *kwargs*
        Keyword arguments to set configuration values.

.. function:: stop() -> None

    Deactivate the underlying BLE radio and run any registered
    sub-module shutdown handlers. After calling this, scanners,
    advertisers, connections and L2CAP channels are all torn down.

.. function:: scan(duration_ms: int, interval_us: int | None = None, window_us: int | None = None, active: bool = False) -> scan

    Returns a `scan` async context-manager / async-iterator that yields
    `ScanResult` instances for each unique device discovered (or for
    each new piece of advertising data from a known device).

    *duration_ms*
        How long to scan, in milliseconds. Pass ``0`` to scan
        indefinitely until the context manager exits.

    *interval_us*
        Scan interval in microseconds. Defaults to 1,280,000.

    *window_us*
        Scan window in microseconds (must be less than or equal to
        *interval_us*). Defaults to 11,250.

    *active*
        If ``True``, perform an active scan (request scan response
        data). Defaults to ``False``.

.. function:: advertise(interval_us: int, adv_data: bytes | None = None, resp_data: bytes | None = None, connectable: bool = True, limited_disc: bool = False, br_edr: bool = False, name: str | None = None, services: list | None = None, appearance: int = 0, manufacturer: tuple | None = None, timeout_ms: int | None = None) -> DeviceConnection

    Async coroutine that begins advertising and waits for an incoming
    central connection. Returns a `DeviceConnection` representing the
    connected central, or raises :class:`asyncio.TimeoutError` on
    timeout.

    *interval_us*
        Advertising interval, in microseconds.

    *adv_data*
        Raw advertising payload. If unset, *adv_data* is built from the
        remaining keyword arguments.

    *resp_data*
        Raw scan response payload. Auto-populated to overflow from
        *adv_data* if needed.

    *connectable*
        If ``True``, this is a connectable advertisement.

    *limited_disc*
        Use the limited-discoverable flag instead of general.

    *br_edr*
        Set the BR/EDR-supported flag.

    *name*
        Optional complete local name to embed.

    *services*
        Iterable of :class:`bluetooth.UUID` to advertise.

    *appearance*
        16-bit appearance value (see Bluetooth assigned numbers).

    *manufacturer*
        Tuple of ``(company_id, data_bytes)`` to advertise as
        manufacturer specific data.

    *timeout_ms*
        Stop advertising after this many milliseconds without a
        connection. ``None`` means advertise until connected.

.. function:: register_services(*services: Service) -> None

    Register one or more `Service` objects (and their characteristics
    and descriptors) with the GATT server. Must be called once before
    starting `advertise`. Subsequent calls replace the previous
    registration.

    *services*
        One or more `Service` instances.

Module-level constants
----------------------

.. data:: ADDR_PUBLIC

    Public BLE device address type (``0``).

.. data:: ADDR_RANDOM

    Random BLE device address type (``1``).

Exceptions
----------

.. exception:: GattError

    Raised when a remote GATT operation (read / write / indicate)
    completes with a non-zero status. The status code is available on
    the ``_status`` attribute.

.. exception:: DeviceDisconnectedError

    Raised inside an async operation (e.g. read, write, notified) when
    the underlying connection drops while waiting.

.. exception:: L2CAPDisconnectedError

    Raised when an L2CAP channel send/recv/flush operation is
    attempted on (or interrupted by) a disconnected channel.

.. exception:: L2CAPConnectionError

    Raised by `DeviceConnection.l2cap_connect` when establishing the
    channel fails. The Bluetooth status code is the first argument.

Classes
-------

.. class:: Device(addr_type: int, addr: bytes | str)

    Represents a remote BLE device by address. Two `Device` instances
    compare equal if both *addr_type* and *addr* match. Used as the
    handle for initiating connections.

    *addr_type*
        Either `ADDR_PUBLIC` or `ADDR_RANDOM`.

    *addr*
        Six-byte address as ``bytes``, or a colon-separated hex string
        (e.g. ``"aa:bb:cc:dd:ee:ff"``).

    .. attribute:: addr_type

        The address type the device was constructed with.

    .. attribute:: addr

        The raw six-byte device address.

    .. method:: addr_hex() -> str

        Return the address formatted as a colon-separated hex string.

    .. method:: connect(timeout_ms: int = 10000, scan_duration_ms: int | None = None, min_conn_interval_us: int | None = None, max_conn_interval_us: int | None = None) -> Awaitable[DeviceConnection]

        Async. Initiate a GAP connection to this device and return the
        resulting `DeviceConnection`. Cancels any in-progress scan.

        *timeout_ms*
            How long to wait for the connection to complete.

        *scan_duration_ms*
            Initial scan duration before connecting (controller
            specific).

        *min_conn_interval_us* / *max_conn_interval_us*
            Optional connection interval bounds, in microseconds.

.. class:: DeviceConnection

    An active GAP connection to a `Device`. Returned by
    :meth:`Device.connect` or `advertise`. Supports use as an
    ``async with`` context manager that auto-disconnects on exit.

    Do not construct directly.

    .. attribute:: device

        The underlying `Device`.

    .. attribute:: encrypted

        ``True`` once the link is encrypted (e.g. after pairing).

    .. attribute:: authenticated

        ``True`` if the link was authenticated (MITM-protected pair).

    .. attribute:: bonded

        ``True`` if pairing produced bonding keys.

    .. attribute:: key_size

        Negotiated encryption key size in bytes, or ``False`` if not
        encrypted.

    .. attribute:: mtu

        Negotiated ATT MTU after `exchange_mtu`, or ``None`` until set.

    .. method:: is_connected() -> bool

        Return whether the connection is still active.

    .. method:: disconnect(timeout_ms: int = 2000) -> Awaitable[None]

        Async. Disconnect and wait for the disconnection IRQ.

        *timeout_ms*
            Maximum time to wait for the disconnection.

    .. method:: disconnected(timeout_ms: int | None = None, disconnect: bool = False) -> Awaitable[None]

        Async. Wait for the connection to be terminated by either
        side. If *disconnect* is ``True`` it actively disconnects
        first.

        *timeout_ms*
            Maximum time to wait. ``None`` means wait forever.

        *disconnect*
            If ``True``, initiate disconnection.

    .. method:: timeout(timeout_ms: int | None) -> DeviceTimeout

        Return a context manager that cancels its body if either the
        timeout elapses (raising :class:`asyncio.TimeoutError`) or the
        device disconnects (raising `DeviceDisconnectedError`).

        *timeout_ms*
            Timeout in milliseconds, or ``None`` for no timeout.

    .. method:: exchange_mtu(mtu: int | None = None, timeout_ms: int = 1000) -> Awaitable[int]

        Async. Initiate an ATT MTU exchange and return the negotiated
        MTU.

        *mtu*
            Optional preferred MTU to set on the underlying BLE
            interface before the exchange.

        *timeout_ms*
            Timeout for the exchange.

    .. method:: service(uuid: bluetooth.UUID, timeout_ms: int = 2000) -> Awaitable[ClientService | None]

        Async. Discover a single remote service matching *uuid*, or
        ``None`` if not found.

    .. method:: services(uuid: bluetooth.UUID | None = None, timeout_ms: int = 2000) -> ClientDiscover

        Return an async iterator of remote `ClientService` objects.
        Use with ``async for`` and run the loop to completion.

        *uuid*
            Optional UUID filter. ``None`` returns every service.

        *timeout_ms*
            Per-discovery timeout.

    .. method:: pair(bond: bool = True, le_secure: bool = True, mitm: bool = False, io: int = 3, timeout_ms: int = 20000) -> Awaitable[None]

        Async. Initiate pairing on this connection. Updates the
        ``encrypted`` / ``authenticated`` / ``bonded`` / ``key_size``
        attributes when complete.

        *bond*
            Persist pairing keys.

        *le_secure*
            Use LE Secure Connections.

        *mitm*
            Require man-in-the-middle protection.

        *io*
            IO capability constant (e.g. ``3`` for no input/output).

        *timeout_ms*
            Pairing timeout.

    .. method:: l2cap_accept(psm: int, mtu: int, timeout_ms: int | None = None) -> Awaitable[L2CAPChannel]

        Async. Listen on the given PSM and return an `L2CAPChannel`
        once the remote opens it.

        *psm*
            Protocol/Service Multiplexer to listen on.

        *mtu*
            Maximum receive size, in bytes.

        *timeout_ms*
            Maximum time to wait for the remote to connect.

    .. method:: l2cap_connect(psm: int, mtu: int, timeout_ms: int = 1000) -> Awaitable[L2CAPChannel]

        Async. Open an L2CAP channel to the remote on the given PSM.

        *psm*
            Protocol/Service Multiplexer to connect to.

        *mtu*
            Maximum receive size, in bytes.

        *timeout_ms*
            Connection timeout.

.. class:: ScanResult

    A single device discovered during `scan`. The same instance is
    re-yielded as new advertising data arrives.

    Do not construct directly.

    .. attribute:: device

        The underlying `Device`.

    .. attribute:: rssi

        Last reported RSSI, in dBm.

    .. attribute:: adv_data

        Raw advertising payload (``bytes`` or ``None``).

    .. attribute:: resp_data

        Raw scan response payload (``bytes`` or ``None``), if active
        scanning is enabled.

    .. attribute:: connectable

        ``True`` if the most recent advertisement was connectable.

    .. method:: name() -> str | None

        Decode the complete (or shortened) advertised local name from
        the payload, or ``None`` if not present.

    .. method:: services() -> Iterator[bluetooth.UUID]

        Generator yielding each :class:`bluetooth.UUID` advertised in
        the 16/32/128-bit service-list fields.

    .. method:: manufacturer(filter: int | None = None) -> Iterator[tuple[int, bytes]]

        Generator yielding ``(company_id, data)`` tuples from
        manufacturer-specific advertising fields.

        *filter*
            If given, only yield entries whose company ID matches.

.. class:: Service(uuid: bluetooth.UUID)

    A local GATT service. Build a service with one or more
    `Characteristic` instances, then pass it to `register_services`.

    *uuid*
        The service UUID.

    .. attribute:: uuid

        The service UUID.

    .. attribute:: characteristics

        List of `Characteristic` objects bound to this service.

.. class:: Characteristic(service: Service, uuid: bluetooth.UUID, read: bool = False, write: bool = False, write_no_response: bool = False, notify: bool = False, indicate: bool = False, initial: bytes | None = None, capture: bool = False)

    A local GATT characteristic. Constructing one automatically
    appends it to *service*.

    *service*
        The owning `Service`.

    *uuid*
        The characteristic UUID.

    *read*, *write*, *write_no_response*, *notify*, *indicate*
        Booleans selecting the supported GATT operations.

    *initial*
        Optional initial value (``bytes``).

    *capture*
        If ``True``, written values are queued (up to 10 deep) so that
        rapid back-to-back writes are not lost. Each `written` call
        then returns a ``(connection, data)`` tuple.

    .. attribute:: uuid

        The characteristic UUID.

    .. attribute:: flags

        Bitmask of the GATT property flags built from the constructor.

    .. attribute:: descriptors

        List of `Descriptor` objects bound to this characteristic.

    .. method:: read() -> bytes

        Read the current value from the local GATT database.

    .. method:: write(data: bytes, send_update: bool = False) -> None

        Update the value in the local GATT database.

        *data*
            New value bytes.

        *send_update*
            If ``True``, also notify/indicate every subscribed
            connection.

    .. method:: notify(connection: DeviceConnection, data: bytes | None = None) -> None

        Send a GATT Notify to *connection*.

        *connection*
            The target client connection.

        *data*
            Payload to send. If ``None``, the current local value is
            sent.

    .. method:: indicate(connection: DeviceConnection, data: bytes | None = None, timeout_ms: int = 1000) -> Awaitable[None]

        Async. Send a GATT Indicate to *connection* and wait for the
        client confirmation. Raises `GattError` on a non-zero status.

        *connection*
            The target client connection.

        *data*
            Payload to indicate, or ``None`` to send the local value.

        *timeout_ms*
            Maximum time to wait for confirmation.

    .. method:: written(timeout_ms: int | None = None) -> Awaitable[DeviceConnection | tuple[DeviceConnection, bytes]]

        Async. Wait for a remote write. Returns the writing
        `DeviceConnection`, or ``(connection, data)`` if the
        characteristic was created with ``capture=True``.

        *timeout_ms*
            Maximum time to wait. ``None`` waits forever.

    .. method:: on_read(connection: DeviceConnection) -> int

        Override hook invoked synchronously when a remote read is
        received. Return ``0`` to allow the read or a non-zero ATT
        error code to reject it. Default implementation returns ``0``.

.. class:: BufferedCharacteristic(service: Service, uuid: bluetooth.UUID, max_len: int = 20, append: bool = False, **kwargs)

    A `Characteristic` whose backing GATT buffer can be configured.
    Useful for receiving values larger than the default attribute
    size, or for queuing back-to-back writes.

    *max_len*
        Buffer size, in bytes.

    *append*
        If ``True``, sequential writes append into the buffer instead
        of overwriting.

    Other arguments forward to `Characteristic`.

.. class:: Descriptor(characteristic: Characteristic, uuid: bluetooth.UUID, read: bool = False, write: bool = False, initial: bytes | None = None)

    A local GATT descriptor. Constructing one automatically appends it
    to *characteristic*. Inherits :meth:`read <Characteristic.read>`,
    :meth:`write <Characteristic.write>` and :meth:`written
    <Characteristic.written>` from `Characteristic`.

    *characteristic*
        The owning `Characteristic`.

    *uuid*
        The descriptor UUID.

    *read*, *write*
        Booleans selecting the supported GATT operations.

    *initial*
        Optional initial value (``bytes``).

.. class:: ClientService

    A remote GATT service discovered on a peer. Returned by
    :meth:`DeviceConnection.service` or iterated from
    :meth:`DeviceConnection.services`.

    Do not construct directly.

    .. attribute:: connection

        The owning `DeviceConnection`.

    .. attribute:: uuid

        The remote service UUID.

    .. method:: characteristic(uuid: bluetooth.UUID, timeout_ms: int = 2000) -> Awaitable[ClientCharacteristic | None]

        Async. Discover a single characteristic by UUID, or ``None``
        if not found.

    .. method:: characteristics(uuid: bluetooth.UUID | None = None, timeout_ms: int = 2000) -> ClientDiscover

        Return an async iterator of `ClientCharacteristic` objects.
        Use with ``async for`` and run the loop to completion.

        *uuid*
            Optional UUID filter.

        *timeout_ms*
            Per-discovery timeout.

.. class:: ClientCharacteristic

    A remote GATT characteristic discovered on a peer. Returned by
    :meth:`ClientService.characteristic` or iterated from
    :meth:`ClientService.characteristics`.

    Do not construct directly.

    .. attribute:: service

        The owning `ClientService`.

    .. attribute:: uuid

        The characteristic UUID.

    .. attribute:: properties

        Bitmask of supported GATT operations as reported by the peer.

    .. method:: read(timeout_ms: int = 1000) -> Awaitable[bytes]

        Async. Issue a GATT Read and return the value. Raises
        `GattError` on a non-zero status.

        *timeout_ms*
            Read timeout.

    .. method:: write(data: bytes, response: bool | None = None, timeout_ms: int = 1000) -> Awaitable[None]

        Async. Issue a GATT Write.

        *data*
            Value to write.

        *response*
            ``True`` to require a write-response (and raise
            `GattError` on failure). ``False`` for write-without-
            response. ``None`` (default) auto-selects based on what
            the peer advertises.

        *timeout_ms*
            Write timeout (only relevant if *response* is ``True``).

    .. method:: notified(timeout_ms: int | None = None) -> Awaitable[bytes]

        Async. Wait for the next notification on this characteristic
        and return its payload. Returns immediately if a notification
        is already queued.

        *timeout_ms*
            Maximum time to wait. ``None`` waits forever.

    .. method:: indicated(timeout_ms: int | None = None) -> Awaitable[bytes]

        Async. Wait for the next indication on this characteristic and
        return its payload.

        *timeout_ms*
            Maximum time to wait.

    .. method:: subscribe(notify: bool = True, indicate: bool = False) -> Awaitable[None]

        Async. Write the Client Characteristic Configuration
        Descriptor (CCCD) to subscribe (or unsubscribe) for
        notifications and/or indications.

        *notify*
            Enable notifications.

        *indicate*
            Enable indications.

    .. method:: descriptor(uuid: bluetooth.UUID, timeout_ms: int = 2000) -> Awaitable[ClientDescriptor | None]

        Async. Discover a single descriptor by UUID, or ``None`` if
        not found.

    .. method:: descriptors(timeout_ms: int = 2000) -> ClientDiscover

        Return an async iterator of `ClientDescriptor` objects. Use
        with ``async for`` and run the loop to completion.

.. class:: ClientDescriptor

    A remote GATT descriptor discovered on a peer. Inherits
    :meth:`read <ClientCharacteristic.read>` and :meth:`write
    <ClientCharacteristic.write>` from `ClientCharacteristic`.

    Do not construct directly.

    .. attribute:: characteristic

        The owning `ClientCharacteristic`.

    .. attribute:: uuid

        The descriptor UUID.

.. class:: L2CAPChannel

    An active L2CAP connection-oriented channel. Returned by
    :meth:`DeviceConnection.l2cap_accept` or
    :meth:`DeviceConnection.l2cap_connect`. Supports use as an
    ``async with`` context manager that auto-disconnects on exit.

    Do not construct directly.

    .. attribute:: our_mtu

        Maximum size, in bytes, that the peer may send to us in a
        single SDU.

    .. attribute:: peer_mtu

        Maximum size, in bytes, that we may send to the peer in a
        single SDU.

    .. method:: available() -> bool

        Synchronously return ``True`` if buffered receive data is
        ready (i.e. `recvinto` will not block).

    .. method:: recvinto(buf: bytearray, timeout_ms: int | None = None) -> Awaitable[int]

        Async. Receive into *buf*, returning the number of bytes
        read. Awaits new data if the channel is empty.

        *buf*
            Pre-allocated buffer to fill.

        *timeout_ms*
            Maximum time to wait. ``None`` waits forever.

    .. method:: send(buf: bytes, timeout_ms: int | None = None, chunk_size: int | None = None) -> Awaitable[None]

        Async. Send *buf* on the channel, fragmenting larger payloads
        into MTU-sized chunks. Awaits flow-control credits as needed.

        *buf*
            Bytes-like object to send.

        *timeout_ms*
            Maximum time to wait per chunk.

        *chunk_size*
            Optional override for the per-call chunk size. Capped to
            ``min(our_mtu * 2, peer_mtu)``.

    .. method:: flush(timeout_ms: int | None = None) -> Awaitable[None]

        Async. Wait until any stalled `send` has been drained by the
        controller.

        *timeout_ms*
            Maximum time to wait.

    .. method:: disconnect(timeout_ms: int = 1000) -> Awaitable[None]

        Async. Disconnect the channel and wait for the disconnection
        IRQ.

        *timeout_ms*
            Maximum time to wait.

    .. method:: disconnected(timeout_ms: int = 1000) -> Awaitable[None]

        Async. Wait until the channel is disconnected by either side.

        *timeout_ms*
            Maximum time to wait.
