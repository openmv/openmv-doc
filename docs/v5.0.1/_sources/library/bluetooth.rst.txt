:mod:`bluetooth` --- low-level Bluetooth
========================================

.. module:: bluetooth
   :synopsis: Low-level Bluetooth radio functionality

This module provides an interface to the on-board Bluetooth controller.
It supports Bluetooth Low Energy (BLE) in Central, Peripheral, Broadcaster
and Observer roles, as well as GATT Server and Client and L2CAP
connection-oriented channels. A device may operate in multiple roles
concurrently. Pairing and bonding are also supported.

This API is intended to match the low-level Bluetooth protocol and provide
building-blocks for higher-level abstractions such as specific device types.

.. tip:: For most applications, prefer the higher-level :mod:`aioble`
   library, which provides an asyncio-based wrapper around this module.
   See :doc:`aioble`.

class BLE
---------

.. class:: BLE()

    Returns the singleton BLE object.

    .. rubric:: Configuration

    .. method:: active(active: Optional[bool] = None, /) -> bool

        Optionally changes the active state of the BLE radio, and returns the
        current state.

        The radio must be made active before using any other methods on this class.

    .. method:: config(param: str, /) -> Any
                config(*, **kwargs: Any) -> None

        Get or set configuration values of the BLE interface. To get a value the
        parameter name should be quoted as a string, and just one parameter is
        queried at a time. To set values use the keyword syntax, and one or more
        parameters can be set at a time.

        Currently supported values are:

        - ``'mac'``: The current address in use, depending on the current address mode.
          This returns a tuple of ``(addr_type, addr)``.

          See :meth:`gap_scan <BLE.gap_scan>` for details about address type.

          This may only be queried while the interface is currently active.

        - ``'addr_mode'``: Sets the address mode. Values are:

          .. list-table::
             :header-rows: 1
             :widths: 16 18 66

             * - Value
               - Name
               - Behaviour
             * - ``0x00``
               - PUBLIC
               - Use the controller's public address.
             * - ``0x01``
               - RANDOM
               - Use a generated static address.
             * - ``0x02``
               - RPA
               - Use resolvable private addresses.
             * - ``0x03``
               - NRPA
               - Use non-resolvable private addresses.

          By default the interface will use a PUBLIC address if available, otherwise
          it will use a RANDOM address.

        - ``'gap_name'``: Get/set the GAP device name used by the
          Generic Access service (UUID ``0x1800``), Device Name
          characteristic (UUID ``0x2a00``). This can be set at any time
          and changed multiple times.

        - ``'rxbuf'``: Get/set the size in bytes of the internal buffer used to store
          incoming events. This buffer is global to the entire BLE driver and so
          handles incoming data for all events, including all characteristics.
          Increasing this allows better handling of bursty incoming data (for
          example scan results) and the ability to receive larger characteristic values.

        - ``'mtu'``: Get/set the MTU that will be used during an ATT MTU exchange. The
          resulting MTU will be the minimum of this and the remote device's MTU.
          ATT MTU exchange will not happen automatically (unless the remote device initiates
          it), and must be manually initiated with
          :meth:`gattc_exchange_mtu <BLE.gattc_exchange_mtu>`.
          Use the ``_IRQ_MTU_EXCHANGED`` event to discover the MTU for a given connection.

        - ``'bond'``: Sets whether bonding will be enabled during pairing. When
          enabled, pairing requests will set the "bond" flag and the keys will be stored
          by both devices.

        - ``'mitm'``: Sets whether MITM-protection is required for pairing.

        - ``'io'``: Sets the I/O capabilities of this device.

          Available options are:

          .. list-table::
             :header-rows: 1
             :widths: 56 14 30

             * - Constant
               - Value
               - Capability
             * - ``_IO_CAPABILITY_DISPLAY_ONLY``
               - 0
               - Display only
             * - ``_IO_CAPABILITY_DISPLAY_YESNO``
               - 1
               - Display with yes/no input
             * - ``_IO_CAPABILITY_KEYBOARD_ONLY``
               - 2
               - Keyboard only
             * - ``_IO_CAPABILITY_NO_INPUT_OUTPUT``
               - 3
               - No input or output
             * - ``_IO_CAPABILITY_KEYBOARD_DISPLAY``
               - 4
               - Keyboard and display

        - ``'le_secure'``: Sets whether "LE Secure" pairing is required. Default is
          false (i.e. allow "Legacy Pairing").

    .. rubric:: Event Handling

    .. method:: irq(handler: Callable[[int, Tuple], Optional[Any]], /) -> None

        Registers a callback for events from the BLE stack. The *handler* takes two
        arguments, ``event`` (which will be one of the codes below) and ``data``
        (which is an event-specific tuple of values).

        **Note:** As an optimisation to prevent unnecessary allocations, the ``addr``,
        ``adv_data``, ``char_data``, ``notify_data``, and ``uuid`` entries in the
        tuples are read-only memoryview instances pointing to :mod:`bluetooth`'s internal
        ringbuffer, and are only valid during the invocation of the IRQ handler
        function. If your program needs to save one of these values to access after
        the IRQ handler has returned (e.g. by saving it in a class instance or global
        variable), then it needs to take a copy of the data, either by using ``bytes()``
        or ``bluetooth.UUID()``, like this::

            connected_addr = bytes(addr)  # equivalently: adv_data, char_data, or notify_data
            matched_uuid = bluetooth.UUID(uuid)

        For example, the IRQ handler for a scan result might inspect the ``adv_data``
        to decide if it's the correct device, and only then copy the address data to be
        used elsewhere in the program. And to print data from within the IRQ handler,
        ``print(bytes(addr))`` will be needed.

        A handler typically dispatches on the event code and unpacks the
        event-specific payload tuple::

            def bt_irq(event, data):
                if event == _IRQ_CENTRAL_CONNECT:
                    conn_handle, addr_type, addr = data
                    ...
                elif event == _IRQ_SCAN_RESULT:
                    addr_type, addr, adv_type, rssi, adv_data = data
                    ...

        Every event code, the payload it delivers, and a short
        description are listed below. For events whose ``status`` field
        is mentioned, ``status`` is ``0`` on success and an
        implementation-specific non-zero value on failure.

        .. list-table::
           :header-rows: 1
           :widths: 28 6 32 34

           * - Constant
             - Value
             - Event
             - Payload tuple
           * - ``_IRQ_CENTRAL_CONNECT``
             - 1
             - A central has connected to this peripheral.
             - ``(conn_handle, addr_type, addr)``
           * - ``_IRQ_CENTRAL_DISCONNECT``
             - 2
             - A central has disconnected from this peripheral.
             - ``(conn_handle, addr_type, addr)``
           * - ``_IRQ_GATTS_WRITE``
             - 3
             - A connected client has written to a local characteristic or
               descriptor. Use :meth:`gatts_read <BLE.gatts_read>` to fetch
               the new value.
             - ``(conn_handle, attr_handle)``
           * - ``_IRQ_GATTS_READ_REQUEST``
             - 4
             - A connected client has issued a read. Return a non-zero
               error code from the table below to deny the read, or
               ``0`` / ``None`` to accept it.
             - ``(conn_handle, attr_handle)``
           * - ``_IRQ_SCAN_RESULT``
             - 5
             - A single advertising packet was received during an active
               scan.
             - ``(addr_type, addr, adv_type, rssi, adv_data)``
           * - ``_IRQ_SCAN_DONE``
             - 6
             - The current scan has ended, either because the configured
               duration elapsed or because :meth:`gap_scan(None)
               <BLE.gap_scan>` was called.
             - ``()``
           * - ``_IRQ_PERIPHERAL_CONNECT``
             - 7
             - A previously-issued :meth:`gap_connect <BLE.gap_connect>`
               has succeeded.
             - ``(conn_handle, addr_type, addr)``
           * - ``_IRQ_PERIPHERAL_DISCONNECT``
             - 8
             - A connected peripheral has disconnected.
             - ``(conn_handle, addr_type, addr)``
           * - ``_IRQ_GATTC_SERVICE_RESULT``
             - 9
             - One service was found by
               :meth:`gattc_discover_services <BLE.gattc_discover_services>`.
             - ``(conn_handle, start_handle, end_handle, uuid)``
           * - ``_IRQ_GATTC_SERVICE_DONE``
             - 10
             - Service discovery has finished.
             - ``(conn_handle, status)``
           * - ``_IRQ_GATTC_CHARACTERISTIC_RESULT``
             - 11
             - One characteristic was found by
               :meth:`gattc_discover_characteristics
               <BLE.gattc_discover_characteristics>`.
             - ``(conn_handle, end_handle, value_handle, properties, uuid)``
           * - ``_IRQ_GATTC_CHARACTERISTIC_DONE``
             - 12
             - Characteristic discovery has finished.
             - ``(conn_handle, status)``
           * - ``_IRQ_GATTC_DESCRIPTOR_RESULT``
             - 13
             - One descriptor was found by
               :meth:`gattc_discover_descriptors
               <BLE.gattc_discover_descriptors>`.
             - ``(conn_handle, dsc_handle, uuid)``
           * - ``_IRQ_GATTC_DESCRIPTOR_DONE``
             - 14
             - Descriptor discovery has finished.
             - ``(conn_handle, status)``
           * - ``_IRQ_GATTC_READ_RESULT``
             - 15
             - A previously-issued :meth:`gattc_read <BLE.gattc_read>` has
               returned data.
             - ``(conn_handle, value_handle, char_data)``
           * - ``_IRQ_GATTC_READ_DONE``
             - 16
             - A previously-issued :meth:`gattc_read <BLE.gattc_read>` has
               finished.
             - ``(conn_handle, value_handle, status)``
           * - ``_IRQ_GATTC_WRITE_DONE``
             - 17
             - A previously-issued :meth:`gattc_write <BLE.gattc_write>`
               has been acknowledged.
             - ``(conn_handle, value_handle, status)``
           * - ``_IRQ_GATTC_NOTIFY``
             - 18
             - A remote server has sent an (unacknowledged) notification.
             - ``(conn_handle, value_handle, notify_data)``
           * - ``_IRQ_GATTC_INDICATE``
             - 19
             - A remote server has sent an (acknowledged) indication.
             - ``(conn_handle, value_handle, notify_data)``
           * - ``_IRQ_GATTS_INDICATE_DONE``
             - 20
             - A previously-sent indication has been acknowledged by the
               client (or has timed out).
             - ``(conn_handle, value_handle, status)``
           * - ``_IRQ_MTU_EXCHANGED``
             - 21
             - An ATT MTU exchange has completed (initiated by either
               side).
             - ``(conn_handle, mtu)``
           * - ``_IRQ_L2CAP_ACCEPT``
             - 22
             - A remote device has requested an L2CAP connection on a
               PSM this device is listening on. Return a non-zero integer
               to reject, or ``0`` / ``None`` to accept.
             - ``(conn_handle, cid, psm, our_mtu, peer_mtu)``
           * - ``_IRQ_L2CAP_CONNECT``
             - 23
             - An L2CAP channel is now established, either by accepting
               an incoming request or by completing an outgoing
               :meth:`l2cap_connect <BLE.l2cap_connect>`.
             - ``(conn_handle, cid, psm, our_mtu, peer_mtu)``
           * - ``_IRQ_L2CAP_DISCONNECT``
             - 24
             - An L2CAP channel has been disconnected. ``status`` is
               ``0`` for a clean disconnect, or non-zero if an outgoing
               connection attempt failed.
             - ``(conn_handle, cid, psm, status)``
           * - ``_IRQ_L2CAP_RECV``
             - 25
             - Data has arrived on an L2CAP channel. Call
               :meth:`l2cap_recvinto <BLE.l2cap_recvinto>` to read it.
             - ``(conn_handle, cid)``
           * - ``_IRQ_L2CAP_SEND_READY``
             - 26
             - A previous :meth:`l2cap_send <BLE.l2cap_send>` that
               returned ``False`` has drained and the channel is ready
               again. A non-zero ``status`` means the transmit buffer
               overflowed and the application must re-send the data.
             - ``(conn_handle, cid, status)``
           * - ``_IRQ_CONNECTION_UPDATE``
             - 27
             - The remote device has updated the connection parameters
               (interval, latency, supervision timeout).
             - ``(conn_handle, conn_interval, conn_latency, supervision_timeout, status)``
           * - ``_IRQ_ENCRYPTION_UPDATE``
             - 28
             - The encryption state of a connection has changed,
               typically after pairing or bonding completes.
             - ``(conn_handle, encrypted, authenticated, bonded, key_size)``
           * - ``_IRQ_GET_SECRET``
             - 29
             - The stack is requesting a stored bonding secret. If
               ``key`` is ``None``, return the ``index``\ th stored value
               of ``sec_type``; otherwise return the value associated
               with the given ``(sec_type, key)``. Return ``None`` if
               nothing is stored.
             - ``(sec_type, index, key)``
           * - ``_IRQ_SET_SECRET``
             - 30
             - The stack is asking the application to persist a bonding
               secret. Return ``True`` once stored.
             - ``(sec_type, key, value)``
           * - ``_IRQ_PASSKEY_ACTION``
             - 31
             - A passkey action is required as part of pairing. Respond
               using :meth:`gap_passkey <BLE.gap_passkey>`; see the
               passkey-action table below for the possible actions.
             - ``(conn_handle, action, passkey)``

        For the ``_IRQ_GATTS_READ_REQUEST`` event, the available return codes
        are:

        .. list-table::
           :header-rows: 1
           :widths: 60 18 22

           * - Constant
             - Value
             - Meaning
           * - ``_GATTS_NO_ERROR``
             - ``0x00``
             - Accept the read.
           * - ``_GATTS_ERROR_READ_NOT_PERMITTED``
             - ``0x02``
             - Read not permitted.
           * - ``_GATTS_ERROR_WRITE_NOT_PERMITTED``
             - ``0x03``
             - Write not permitted.
           * - ``_GATTS_ERROR_INSUFFICIENT_AUTHENTICATION``
             - ``0x05``
             - Client is not authenticated.
           * - ``_GATTS_ERROR_INSUFFICIENT_AUTHORIZATION``
             - ``0x08``
             - Client is not authorised.
           * - ``_GATTS_ERROR_INSUFFICIENT_ENCRYPTION``
             - ``0x0f``
             - Link is not encrypted.

        For the ``_IRQ_PASSKEY_ACTION`` event, the available actions are:

        .. list-table::
           :header-rows: 1
           :widths: 52 14 34

           * - Constant
             - Value
             - Meaning
           * - ``_PASSKEY_ACTION_NONE``
             - 0
             - No action required.
           * - ``_PASSKEY_ACTION_INPUT``
             - 2
             - Prompt the user to enter the passkey shown on the remote device.
           * - ``_PASSKEY_ACTION_DISPLAY``
             - 3
             - Display a 6-digit passkey for the remote device to enter.
           * - ``_PASSKEY_ACTION_NUMERIC_COMPARISON``
             - 4
             - Confirm that the passkey matches the one shown on the remote device.

        In order to save space in the firmware, these constants are not
        included on the :mod:`bluetooth` module. Add the ones that you need
        from the lists above to your program.

    .. rubric:: Broadcaster Role (Advertiser)

    .. method:: gap_advertise(interval_us: Optional[int], adv_data: Optional[bytes] = None, *, resp_data: Optional[bytes] = None, connectable: bool = True) -> None

        Starts advertising at the specified interval (in microseconds). This
        interval will be rounded down to the nearest 625us. To stop advertising, set
        *interval_us* to ``None``.

        *adv_data* and *resp_data* can be any type that implements the buffer
        protocol (e.g. ``bytes``, ``bytearray``, ``str``). *adv_data* is included
        in all broadcasts, and *resp_data* is sent in reply to an active scan.

        **Note:** if *adv_data* (or *resp_data*) is ``None``, then the data passed
        to the previous call to ``gap_advertise`` will be reused. This allows a
        broadcaster to resume advertising with just ``gap_advertise(interval_us)``.
        To clear the advertising payload pass an empty ``bytes``, i.e. ``b''``.

    .. rubric:: Observer Role (Scanner)

    .. method:: gap_scan(duration_ms: Optional[int], interval_us: int = 1280000, window_us: int = 11250, active: bool = False, /) -> None

        Run a scan operation lasting for the specified duration (in milliseconds).

        To scan indefinitely, set *duration_ms* to ``0``.

        To stop scanning, set *duration_ms* to ``None``.

        Use *interval_us* and *window_us* to optionally configure the duty cycle.
        The scanner will run for *window_us* microseconds every *interval_us*
        microseconds for a total of *duration_ms* milliseconds. The default
        interval and window are 1.28 seconds and 11.25 milliseconds respectively
        (background scanning).

        For each scan result the ``_IRQ_SCAN_RESULT`` event will be raised, with event
        data ``(addr_type, addr, adv_type, rssi, adv_data)``.

        ``addr_type`` values indicate public or random addresses:

        .. list-table::
           :header-rows: 1
           :widths: 16 16 68

           * - Value
             - Name
             - Meaning
           * - ``0x00``
             - PUBLIC
             - Public device address.
           * - ``0x01``
             - RANDOM
             - Random address (either static, RPA, or NRPA; the type is
               encoded in the address itself).

        ``adv_type`` values correspond to the Bluetooth Specification:

        .. list-table::
           :header-rows: 1
           :widths: 14 26 60

           * - Value
             - Name
             - Meaning
           * - ``0x00``
             - ADV_IND
             - Connectable and scannable undirected advertising.
           * - ``0x01``
             - ADV_DIRECT_IND
             - Connectable directed advertising.
           * - ``0x02``
             - ADV_SCAN_IND
             - Scannable undirected advertising.
           * - ``0x03``
             - ADV_NONCONN_IND
             - Non-connectable undirected advertising.
           * - ``0x04``
             - SCAN_RSP
             - Scan response.

        ``active`` can be set ``True`` if you want to receive scan responses in the results.

        When scanning is stopped (either due to the duration finishing or when
        explicitly stopped), the ``_IRQ_SCAN_DONE`` event will be raised.

    .. rubric:: Central Role

    A central device can connect to peripherals that it has discovered using the observer role (see :meth:`gap_scan <BLE.gap_scan>`) or with a known address.

    .. method:: gap_connect(addr_type: Optional[int], addr: Optional[bytes] = None, scan_duration_ms: int = 2000, min_conn_interval_us: Optional[int] = None, max_conn_interval_us: Optional[int] = None, /) -> None

        Connect to a peripheral.

        See :meth:`gap_scan <BLE.gap_scan>` for details about address types.

        To cancel an outstanding connection attempt early, call
        ``gap_connect(None)``.

        On success, the ``_IRQ_PERIPHERAL_CONNECT`` event will be raised. If
        cancelling a connection attempt, the ``_IRQ_PERIPHERAL_DISCONNECT`` event
        will be raised.

        The device will wait up to *scan_duration_ms* to receive an advertising
        payload from the device.

        The connection interval can be configured in microseconds using either
        or both of *min_conn_interval_us* and *max_conn_interval_us*. Otherwise a
        default interval will be chosen, typically between 30000 and 50000
        microseconds. A shorter interval will increase throughput, at the expense
        of power usage.

    .. rubric:: Peripheral Role

    A peripheral device is expected to send connectable advertisements (see
    :meth:`gap_advertise <BLE.gap_advertise>`). It will usually be acting as a GATT
    server, having first registered services and characteristics using
    :meth:`gatts_register_services <BLE.gatts_register_services>`.

    When a central connects, the ``_IRQ_CENTRAL_CONNECT`` event will be raised.

    .. rubric:: Central & Peripheral Roles

    .. method:: gap_disconnect(conn_handle: int, /) -> bool

        Disconnect the specified connection handle. This can either be a
        central that has connected to this device (if acting as a peripheral)
        or a peripheral that was previously connected to by this device (if acting
        as a central).

        On success, the ``_IRQ_PERIPHERAL_DISCONNECT`` or ``_IRQ_CENTRAL_DISCONNECT``
        event will be raised.

        Returns ``False`` if the connection handle wasn't connected, and ``True``
        otherwise.

    .. rubric:: GATT Server

    A GATT server has a set of registered services. Each service may contain
    characteristics, which each have a value. Characteristics can also contain
    descriptors, which themselves have values.

    These values are stored locally, and are accessed by their "value handle" which
    is generated during service registration. They can also be read from or written
    to by a remote client device. Additionally, a server can "notify" a
    characteristic to a connected client via a connection handle.

    A device in either central or peripheral roles may function as a GATT server,
    however in most cases it will be more common for a peripheral device to act
    as the server.

    Characteristics and descriptors have a default maximum size of 20 bytes
    (the default ATT MTU of 23 bytes minus a 3-byte ATT header; a larger
    negotiated MTU does not by itself raise this limit). Anything written
    to them by a client will be truncated to this length. However, any
    local write will increase the maximum size, so if you want to allow
    larger writes from a client to a given characteristic, use
    :meth:`gatts_write <BLE.gatts_write>` after registration. e.g.
    ``gatts_write(char_handle, bytes(100))``.

    .. method:: gatts_register_services(services_definition: Sequence[Sequence], /) -> Sequence[Sequence[int]]

        Configures the server with the specified services, replacing any
        existing services.

        *services_definition* is a list of **services**, where each **service** is a
        two-element tuple containing a UUID and a list of **characteristics**.

        Each **characteristic** is a two-or-three-element tuple containing a UUID, a
        **flags** value, and optionally a list of *descriptors*.

        Each **descriptor** is a two-element tuple containing a UUID and a **flags**
        value.

        The **flags** are a bitwise-OR combination of the flags defined below. These
        set both the behaviour of the characteristic (or descriptor) as well as the
        security and privacy requirements.

        The return value is a list (one element per service) of tuples (each element
        is a value handle). Characteristics and descriptor handles are flattened
        into the same tuple, in the order that they are defined.

        The following example registers two services (Heart Rate, and
        Nordic UART)::

            bt = bluetooth.BLE()
            bt.active(True)

            # Heart Rate service: one Heart Rate Measurement characteristic.
            HR_SERVICE = (
                bluetooth.UUID(0x180D),
                (
                    (bluetooth.UUID(0x2A37),
                     bluetooth.FLAG_READ | bluetooth.FLAG_NOTIFY),
                ),
            )

            # Nordic UART service: a TX characteristic the client subscribes
            # to for notifications, and an RX characteristic it writes to.
            UART_SERVICE = (
                bluetooth.UUID('6E400001-B5A3-F393-E0A9-E50E24DCCA9E'),
                (
                    (bluetooth.UUID('6E400003-B5A3-F393-E0A9-E50E24DCCA9E'),
                     bluetooth.FLAG_READ | bluetooth.FLAG_NOTIFY),
                    (bluetooth.UUID('6E400002-B5A3-F393-E0A9-E50E24DCCA9E'),
                     bluetooth.FLAG_WRITE),
                ),
            )

            ((hr,), (tx, rx)) = bt.gatts_register_services(
                (HR_SERVICE, UART_SERVICE),
            )

        The three value handles (``hr``, ``tx``, ``rx``) can be used with
        :meth:`gatts_read <BLE.gatts_read>`, :meth:`gatts_write <BLE.gatts_write>`, :meth:`gatts_notify <BLE.gatts_notify>`, and
        :meth:`gatts_indicate <BLE.gatts_indicate>`.

        **Note:** Advertising must be stopped before registering services.

        Available flags for characteristics and descriptors are:

        .. list-table::
           :header-rows: 1
           :widths: 44 14 42

           * - Constant
             - Value
             - Meaning
           * - ``_FLAG_BROADCAST``
             - ``0x0001``
             - Characteristic may be broadcast.
           * - ``_FLAG_READ``
             - ``0x0002``
             - Client may read the value.
           * - ``_FLAG_WRITE_NO_RESPONSE``
             - ``0x0004``
             - Client may write without expecting a response.
           * - ``_FLAG_WRITE``
             - ``0x0008``
             - Client may write with an acknowledged response.
           * - ``_FLAG_NOTIFY``
             - ``0x0010``
             - Server may send notifications (unacknowledged).
           * - ``_FLAG_INDICATE``
             - ``0x0020``
             - Server may send indications (acknowledged).
           * - ``_FLAG_AUTHENTICATED_SIGNED_WRITE``
             - ``0x0040``
             - Client may issue signed writes.
           * - ``_FLAG_AUX_WRITE``
             - ``0x0100``
             - Extended properties: queued/reliable writes are allowed.
           * - ``_FLAG_READ_ENCRYPTED``
             - ``0x0200``
             - Read requires an encrypted link.
           * - ``_FLAG_READ_AUTHENTICATED``
             - ``0x0400``
             - Read requires an authenticated (MITM-protected) link.
           * - ``_FLAG_READ_AUTHORIZED``
             - ``0x0800``
             - Read requires application-level authorisation.
           * - ``_FLAG_WRITE_ENCRYPTED``
             - ``0x1000``
             - Write requires an encrypted link.
           * - ``_FLAG_WRITE_AUTHENTICATED``
             - ``0x2000``
             - Write requires an authenticated (MITM-protected) link.
           * - ``_FLAG_WRITE_AUTHORIZED``
             - ``0x4000``
             - Write requires application-level authorisation.

        As with the event constants above, these flags are not provided by
        the :mod:`bluetooth` module; copy the ones you need into your
        program.

    .. method:: gatts_read(value_handle: int, /) -> bytes

        Reads the local value for this handle (which has either been written by
        :meth:`gatts_write <BLE.gatts_write>` or by a remote client).

    .. method:: gatts_write(value_handle: int, data: bytes, send_update: bool = False, /) -> None

        Writes the local value for this handle, which can be read by a client.

        If *send_update* is ``True``, then any subscribed clients will be notified
        (or indicated, depending on what they're subscribed to and which operations
        the characteristic supports) about this write.

    .. method:: gatts_notify(conn_handle: int, value_handle: int, data: Optional[bytes] = None, /) -> None

        Sends a notification request to a connected client.

        If *data* is ``None`` (the default), then the current local value (as set
        with :meth:`gatts_write <BLE.gatts_write>`) will be sent.

        Otherwise, if *data* is not ``None``, then that value is sent to the client
        as part of the notification. The local value will not be modified.

        **Note:** The notification will be sent regardless of the subscription
        status of the client to this characteristic.

    .. method:: gatts_indicate(conn_handle: int, value_handle: int, data: Optional[bytes] = None, /) -> None

        Sends an indication request to a connected client.

        If *data* is ``None`` (the default), then the current local value (as set
        with :meth:`gatts_write <BLE.gatts_write>`) will be sent.

        Otherwise, if *data* is not ``None``, then that value is sent to the client
        as part of the indication. The local value will not be modified.

        On acknowledgment (or failure, e.g. timeout), the
        ``_IRQ_GATTS_INDICATE_DONE`` event will be raised.

        **Note:** The indication will be sent regardless of the subscription
        status of the client to this characteristic.

    .. method:: gatts_set_buffer(value_handle: int, len: int, append: bool = False, /) -> None

        Sets the internal buffer size for a value in bytes. This will limit
        the largest possible write that can be received. The default is 20
        bytes (default ATT MTU of 23 minus the 3-byte ATT header).

        Setting *append* to ``True`` will make all remote writes append to, rather
        than replace, the current value. At most *len* bytes can be buffered in
        this way. When you use :meth:`gatts_read <BLE.gatts_read>`, the value will
        be cleared after reading. This feature is useful when implementing something
        like the Nordic UART Service.

    .. rubric:: GATT Client

    A GATT client can discover and read/write characteristics on a remote GATT server.

    It is more common for a central role device to act as the GATT client, however
    it's also possible for a peripheral to act as a client in order to discover
    information about the central that has connected to it (e.g. to read the
    device name from the device information service).

    .. method:: gattc_discover_services(conn_handle: int, uuid: Optional[UUID] = None, /) -> None

        Query a connected server for its services.

        Optionally specify a service *uuid* to query for that service only.

        For each service discovered, the ``_IRQ_GATTC_SERVICE_RESULT`` event will
        be raised, followed by ``_IRQ_GATTC_SERVICE_DONE`` on completion.

    .. method:: gattc_discover_characteristics(conn_handle: int, start_handle: int, end_handle: int, uuid: Optional[UUID] = None, /) -> None

        Query a connected server for characteristics in the specified range.

        Optionally specify a characteristic *uuid* to query for that
        characteristic only.

        Passing ``start_handle=1`` and ``end_handle=0xffff`` covers the
        full GATT attribute-handle range, so this combination effectively
        searches every service on the remote device.

        For each characteristic discovered, the ``_IRQ_GATTC_CHARACTERISTIC_RESULT``
        event will be raised, followed by ``_IRQ_GATTC_CHARACTERISTIC_DONE`` on completion.

    .. method:: gattc_discover_descriptors(conn_handle: int, start_handle: int, end_handle: int, /) -> None

        Query a connected server for descriptors in the specified range.

        For each descriptor discovered, the ``_IRQ_GATTC_DESCRIPTOR_RESULT`` event
        will be raised, followed by ``_IRQ_GATTC_DESCRIPTOR_DONE`` on completion.

    .. method:: gattc_read(conn_handle: int, value_handle: int, /) -> None

        Issue a remote read to a connected server for the specified
        characteristic or descriptor handle.

        When a value is available, the ``_IRQ_GATTC_READ_RESULT`` event will
        be raised, followed by ``_IRQ_GATTC_READ_DONE`` on completion.

    .. method:: gattc_write(conn_handle: int, value_handle: int, data: bytes, mode: int = 0, /) -> None

        Issue a remote write to a connected server for the specified
        characteristic or descriptor handle.

        The argument *mode* specifies the write behaviour, with the currently
        supported values being:

            * ``mode=0`` (default) is a write-without-response: the write will
              be sent to the remote server but no confirmation will be
              returned, and no event will be raised.
            * ``mode=1`` is a write-with-response: the remote server is
              requested to send a response/acknowledgement that it received the
              data.

        If a response is received from the remote server the
        ``_IRQ_GATTC_WRITE_DONE`` event will be raised.

    .. method:: gattc_exchange_mtu(conn_handle: int, /) -> None

        Initiate MTU exchange with a connected server, using the preferred MTU
        set using ``BLE.config(mtu=value)``.

        The ``_IRQ_MTU_EXCHANGED`` event will be raised when MTU exchange
        completes.

        MTU exchange is typically initiated by the central; NimBLE
        supports both roles.

    .. rubric:: L2CAP Connection-Oriented Channels

    This feature allows for socket-like data exchange between two BLE devices.
    Once the devices are connected via GAP, either device can listen for the
    other to connect on a numeric PSM (Protocol/Service Multiplexer).

    Only one L2CAP channel may be active at a given time (i.e. you cannot
    connect while listening).

    Active L2CAP channels are identified by the connection handle that they were
    established on and a CID (channel ID).

    Connection-oriented channels have built-in credit-based flow control. Unlike
    ATT, where devices negotiate a shared MTU, both the listening and connecting
    devices each set an independent MTU which limits the maximum amount of
    outstanding data that the remote device can send before it is fully consumed
    in :meth:`l2cap_recvinto <BLE.l2cap_recvinto>`.

    .. method:: l2cap_listen(psm: int, mtu: int, /) -> None

        Start listening for incoming L2CAP channel requests on the specified *psm*
        with the local MTU set to *mtu*.

        When a remote device initiates a connection, the ``_IRQ_L2CAP_ACCEPT``
        event will be raised, which gives the listening server a chance to reject
        the incoming connection (by returning a non-zero integer).

        Once the connection is accepted, the ``_IRQ_L2CAP_CONNECT`` event will be
        raised, allowing the server to obtain the channel ID (CID) and the local and
        remote MTU.

        **Note:** It is not currently possible to stop listening.

    .. method:: l2cap_connect(conn_handle: int, psm: int, mtu: int, /) -> None

        Connect to a listening peer on the specified *psm* with local MTU set to *mtu*.

        On successful connection, the ``_IRQ_L2CAP_CONNECT`` event will be
        raised, allowing the client to obtain the CID and the local and remote (peer) MTU.

        An unsuccessful connection will raise the ``_IRQ_L2CAP_DISCONNECT`` event
        with a non-zero status.

    .. method:: l2cap_disconnect(conn_handle: int, cid: int, /) -> None

        Disconnect an active L2CAP channel with the specified *conn_handle* and
        *cid*.

    .. method:: l2cap_send(conn_handle: int, cid: int, buf: bytes, /) -> bool

        Send the specified *buf* (which must support the buffer protocol) on the
        L2CAP channel identified by *conn_handle* and *cid*.

        The buffer must satisfy both limits: it must not exceed the remote
        (peer) MTU, and it must not exceed twice the local MTU.

        This will return ``False`` if the channel is now "stalled", which means that
        :meth:`l2cap_send <BLE.l2cap_send>` must not be called again until the
        ``_IRQ_L2CAP_SEND_READY`` event is received (which will happen when the
        remote device grants more credits, typically after it has received and
        processed the data).

    .. method:: l2cap_recvinto(conn_handle: int, cid: int, buf: Optional[Any], /) -> int

        Receive data from the specified *conn_handle* and *cid* into the provided
        *buf* (which must support the buffer protocol, e.g. bytearray or
        memoryview).

        Returns the number of bytes read from the channel.

        If *buf* is ``None``, then returns the number of bytes available.

        **Note:** After receiving the ``_IRQ_L2CAP_RECV`` event, the application should
        continue calling :meth:`l2cap_recvinto <BLE.l2cap_recvinto>` until no more
        bytes are available in the receive buffer (typically up to the size of the
        remote (peer) MTU).

        Until the receive buffer is empty, the remote device will not be granted
        more channel credits and will be unable to send any more data.

    .. rubric:: Pairing and Bonding

    Pairing allows a connection to be encrypted and authenticated via exchange
    of secrets (with optional MITM protection via passkey authentication).

    Bonding is the process of storing those secrets into non-volatile storage.
    When bonded, a device is able to resolve a resolvable private address (RPA)
    from another device based on the stored identity resolving key (IRK).
    To support bonding, an application must implement the ``_IRQ_GET_SECRET``
    and ``_IRQ_SET_SECRET`` events.

    .. method:: gap_pair(conn_handle: int, /) -> None

        Initiate pairing with the remote device.

        Before calling this, ensure that the ``io``, ``mitm``, ``le_secure``, and
        ``bond`` configuration options are set (via :meth:`config <BLE.config>`).

        On successful pairing, the ``_IRQ_ENCRYPTION_UPDATE`` event will be raised.

    .. method:: gap_passkey(conn_handle: int, action: int, passkey: int, /) -> None

        Respond to a ``_IRQ_PASSKEY_ACTION`` event for the specified *conn_handle*
        and *action*. The meaning of *passkey* depends on *action* (which in turn
        depends on the configured I/O capability):

        .. list-table::
           :header-rows: 1
           :widths: 38 62

           * - Action
             - Required *passkey* response
           * - ``_PASSKEY_ACTION_INPUT``
             - The passkey the user reads from the remote device.
           * - ``_PASSKEY_ACTION_DISPLAY``
             - A locally-generated random 6-digit passkey shown to the user.
           * - ``_PASSKEY_ACTION_NUMERIC_COMPARISON``
             - ``1`` to accept the passkey shown in the
               ``_IRQ_PASSKEY_ACTION`` event, or ``0`` to cancel pairing.


class UUID
----------

.. class:: UUID(value: Union[int, bytes, str], /)

    Creates a UUID instance with the specified ``value``. Bluetooth uses
    three UUID widths; ``UUID`` accepts any of them:

    .. list-table::
       :header-rows: 1
       :widths: 22 22 56

       * - UUID width
         - Accepted ``value`` types
         - Example
       * - 16-bit
         - ``int`` or a 2-byte buffer (little-endian)
         - ``UUID(0x2908)`` or ``UUID(b'\x08\x29')``
       * - 32-bit
         - 4-byte buffer (little-endian)
         - ``UUID(b'\x08\x29\x00\x00')``
       * - 128-bit
         - 16-byte buffer or a hyphenated string
         - ``UUID('6E400001-B5A3-F393-E0A9-E50E24DCCA9E')``

    16- and 32-bit UUIDs are typically SIG-allocated identifiers (see the
    `Bluetooth assigned numbers
    <https://www.bluetooth.com/specifications/assigned-numbers/>`__);
    128-bit UUIDs are normally vendor-defined.
