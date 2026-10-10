.. currentmodule:: network
.. _network.WLAN:

class WLAN -- control built-in WiFi interfaces
==============================================

The :class:`WLAN` class drives the on-board WiFi radios on modern
OpenMV Cams. The same class wraps two different underlying drivers
depending on the board's WiFi MCU:

- **CYW43** (Infineon CYW43xxx Murata WiFi module). Used by the
  OpenMV Cam N6, OpenMV Cam RT1062, Arduino Portenta H7, Arduino
  Nicla Vision and Arduino Giga R1 WiFi.
- **NINA W10** (u-blox NINA-W10 / ESP32-WROOM). Used by the Arduino
  Nano RP2040 Connect.

The two drivers expose the same method names but differ in a few
arguments and the set of accepted :meth:`config` keys. Differences
are flagged below.

The OpenMV cameras with a legacy WINC1500 WiFi shield (M4 / M7 / H7 /
H7 Plus / Pure Thermal) use :class:`WINC` instead.

Example usage::

    import network

    # Enable the station interface and connect to a WiFi AP.
    nic = network.WLAN(network.WLAN.IF_STA)
    nic.active(True)
    nic.connect("your-ssid", "your-key")
    while not nic.isconnected():
        pass

    print(nic.ipconfig("addr4"))

Constructors
------------

.. class:: WLAN(interface_id: int = WLAN.IF_STA) -> None

   Create a :class:`WLAN` interface object.

   ``interface_id`` selects which interface to operate on:

      * :data:`WLAN.IF_STA` -- station / client mode. Connect to an
        upstream access point with :meth:`connect`. This is the
        default.
      * :data:`WLAN.IF_AP` -- access-point mode. Configure the AP
        with :meth:`config` and accept client connections.

   The same physical radio backs both interfaces; constructing one
   does not preclude the other.

   Methods
   -------

   .. method:: active(is_active: Optional[bool] = None) -> bool

      Bring the WiFi radio up or down.

      With no argument, return the current state -- ``True`` while
      the radio is up, ``False`` otherwise.

      ``active(True)`` powers the WiFi MCU, loads its firmware
      (CYW43 fetches the firmware blob from flash; NINA validates the
      currently flashed firmware version) and brings up the lwIP
      netif for this interface. All other methods --
      :meth:`connect`, :meth:`scan`, :meth:`ipconfig` and friends --
      require the interface to be active.

      ``active(False)`` powers the radio back down. On the STA
      interface this also disassociates from the current AP and
      releases the netif.

   .. method:: connect(ssid: str, key: Optional[str] = None, *, security: int = -1, bssid: Optional[bytes] = None, channel: int = -1) -> None

      Associate the STA interface with the given access point.

      ``ssid`` -- the network SSID (string or bytes).

      ``key`` -- password / pre-shared key. Pass ``None`` for an
      open network.

      ``security`` (keyword-only) -- one of the :data:`SEC_*`
      constants. ``-1`` (the default) auto-selects: :data:`SEC_OPEN`
      when ``key`` is empty, :data:`SEC_WPA_WPA2` otherwise.

      ``bssid`` (keyword-only, CYW43 only) -- restrict the
      association to the AP with this 6-byte MAC address. Ignored by
      the NINA driver.

      ``channel`` (keyword-only) -- preferred radio channel. Default
      is "let the driver choose".

   .. method:: disconnect() -> None

      In STA mode, disassociate from the currently associated access
      point. The interface stays active; call :meth:`connect` again
      to re-associate, or :meth:`active` ``(False)`` to power the
      radio down completely. No-op when not currently associated.

   .. method:: isconnected() -> bool

      In STA mode return ``True`` when associated with an access
      point **and** an IPv4 address has been obtained from DHCP (or
      assigned statically through :meth:`ipconfig`). Returns
      ``False`` while the link is still in the
      authenticating/associating/DHCP phase.

      In AP mode return ``True`` when at least one station has
      joined.

   .. method:: scan(*, passive: bool = False, ssid: Optional[bytes] = None, bssid: Optional[bytes] = None) -> List[Tuple[bytes, bytes, int, int, int, int]]

      Scan for nearby access points and return a list of 6-tuples:

         * ``[0]`` SSID (bytes; empty for hidden networks).
         * ``[1]`` BSSID (6-byte MAC, ``bytes``). Convert with
           :func:`binascii.hexlify`.
         * ``[2]`` Channel number.
         * ``[3]`` RSSI in dBm.
         * ``[4]`` Security mode (one of the :data:`SEC_*`
           constants).
         * ``[5]`` Reserved (always ``1``).

      All keyword arguments are CYW43-only:

         * ``passive`` -- if ``True``, use a passive scan instead of
           the default active probe-request scan.
         * ``ssid`` -- restrict the scan to one SSID.
         * ``bssid`` -- restrict the scan to one BSSID.

      Scanning is only meaningful on a STA interface.

   .. method:: status() -> int
               status(param: str) -> Any

      Query connection status.

      With no argument, return the link status as a small integer
      (driver-specific encoding -- truthy means "associated").

      With a string argument:

         * ``"rssi"`` -- in STA mode, return the current RSSI in dBm.
         * ``"stations"`` -- in AP mode, return a list of connected
           stations. CYW43 returns ``[(mac_bytes,), ...]``; NINA
           returns ``[ip_string, ...]``.

   .. method:: ifconfig(config: Optional[Tuple[str, str, str, str]] = None) -> Optional[Tuple[str, str, str, str]]

      Get or set IPv4 interface parameters as a 4-tuple of
      ``(ip, subnet, gateway, dns)`` dotted-quad strings.

      .. note::

         Prefer :meth:`ipconfig` for new code::

            nic.ipconfig(addr4="192.168.0.4/24", gw4="192.168.0.1")
            network.ipconfig(dns="8.8.8.8")

   .. method:: ipconfig(param: str) -> Any
               ipconfig(**kwargs: Any) -> None

      Get or set IPv4 / IPv6 interface parameters. The CYW43 driver
      delegates to the standard lwIP implementation and supports the
      full set of keys documented on :meth:`AbstractNIC.ipconfig`.
      The NINA driver implements a smaller per-interface subset --
      ``dhcp4`` and ``has_dhcp4`` (read-only), plus ``addr4`` and
      ``gw4`` for get / set.

   .. method:: config(param: str) -> Any
               config(**kwargs: Any) -> None

      Get or set WiFi-specific interface parameters.

      With a single positional string argument, return the value of
      that parameter. With keyword arguments, set one or more
      parameters at once -- changes that affect a running AP cause
      the AP to be cycled down and back up automatically.

      Example::

         # Set up the access-point name and channel.
         ap.config(ssid="My AP", channel=11)
         # Query params one at a time.
         print(ap.config("ssid"))
         print(ap.config("mac"))

      **CYW43 driver -- gettable parameters:**

         * ``"antenna"`` -- antenna selector (int).
         * ``"channel"`` -- current channel.
         * ``"ssid"`` / ``"essid"`` -- the current SSID (string).
         * ``"security"`` -- the AP's auth mode (one of
           :data:`SEC_*`).
         * ``"mac"`` -- interface MAC address (6 ``bytes``).
         * ``"pm"`` -- power-management value.
         * ``"txpower"`` -- transmit power in dBm.
         * ``"hostname"`` -- DHCP/mDNS hostname.
           **Deprecated**; use :func:`network.hostname` instead.

      **CYW43 driver -- settable parameters:**

         * ``antenna=<int>`` -- antenna selector.
         * ``channel=<int>`` -- AP channel.
         * ``ssid=<str>`` / ``essid=<str>`` -- AP SSID.
         * ``key=<str>`` / ``password=<str>`` -- AP pre-shared key.
         * ``security=<int>`` -- AP auth mode (one of :data:`SEC_*`).
         * ``pm=<int>`` -- power management mode (one of
           :data:`PM_NONE`, :data:`PM_PERFORMANCE`,
           :data:`PM_POWERSAVE`).
         * ``monitor=<int>`` -- enable monitor / all-multicast mode.
         * ``txpower=<int>`` -- transmit power in dBm.
         * ``trace=<int>`` -- internal driver trace bitmask.
         * ``hostname=<str>`` -- DHCP/mDNS hostname.
           **Deprecated**; use :func:`network.hostname` instead.

      **NINA driver -- gettable parameters:**

         * ``"ssid"`` -- the current SSID (string).
         * ``"security"`` -- the AP's auth mode.
         * ``"mac"`` / ``"bssid"`` -- interface MAC address
           (6 ``bytes``).
         * ``"fw_version"`` -- a 3-tuple ``(major, minor, patch)``.

      **NINA driver -- settable parameters:** the call forwards to
      :meth:`connect` and accepts the same keyword arguments
      (``ssid``, ``key``, ``security``, ``channel``). Only valid on
      the AP interface.

   .. method:: deinit() -> None

      Power-cycle the WiFi MCU and release every resource the driver
      holds (firmware buffers, lwIP netif, SPI/SDIO bus). After
      calling this the :class:`WLAN` object must be reconstructed
      before use. Use this rather than :meth:`active` ``(False)``
      when you need a full reset (for example, before re-flashing
      the radio's firmware or to recover from a wedged driver
      state). CYW43 only.

   .. method:: send_ethernet(buf: bytes) -> None

      Inject the raw Ethernet frame ``buf`` directly into the
      driver's transmit path, bypassing the IP stack. Intended for
      L2-only consumers -- bridging, custom EtherType protocols, and
      similar. The frame must include destination/source MAC and
      EtherType (no FCS -- the hardware appends it). CYW43 only.

   .. method:: ioctl(cmd: int, buf: bytearray) -> None

      Issue a driver-specific control command. ``cmd`` is the
      numeric ioctl code defined by the underlying radio firmware
      and ``buf`` is a mutable buffer used for both the command
      payload and the response. The set of valid ``cmd`` values is
      driver-specific and not portable between CYW43 and NINA. Used
      mostly by low-level test scripts and chip-bring-up code.

   Constants
   ---------

   .. data:: IF_STA
      :type: int

      Station / client interface identifier. Pass to the constructor
      to select STA mode.

   .. data:: IF_AP
      :type: int

      Access-point interface identifier. Pass to the constructor to
      select AP mode.

   .. data:: SEC_OPEN
      :type: int

      Security value for an unencrypted network. Available on both
      drivers.

   .. data:: SEC_WPA_WPA2
      :type: int

      Security value for WPA / WPA2 with a pre-shared key. The
      default when a key is supplied to :meth:`connect`. Available on
      both drivers.

   .. data:: SEC_WPA3
      :type: int

      Security value for WPA3 (SAE) with a pre-shared key.
      CYW43-only.

   .. data:: SEC_WPA2_WPA3
      :type: int

      Security value for the WPA2 / WPA3 transition mode.
      CYW43-only.

   .. data:: SEC_WEP
      :type: int

      Security value for WEP (Wired Equivalent Privacy). Provided
      for compatibility with legacy access points -- WEP is
      cryptographically broken and should not be used on new
      deployments. NINA-only.

   .. data:: OPEN
      :type: int

      Back-compat alias for :data:`SEC_OPEN`. New code should use
      :data:`SEC_OPEN`. NINA-only.

   .. data:: WEP
      :type: int

      Back-compat alias for :data:`SEC_WEP`. New code should use
      :data:`SEC_WEP`. NINA-only.

   .. data:: WPA_PSK
      :type: int

      Back-compat alias for :data:`SEC_WPA_WPA2`. New code should
      use :data:`SEC_WPA_WPA2`. NINA-only.

   .. data:: PM_NONE
      :type: int

      Pass to ``config(pm=...)`` to disable WiFi power management.
      CYW43-only.

   .. data:: PM_PERFORMANCE
      :type: int

      Pass to ``config(pm=...)`` to enable WiFi power management
      tuned for performance. CYW43-only.

   .. data:: PM_POWERSAVE
      :type: int

      Pass to ``config(pm=...)`` to enable WiFi power management
      tuned for maximum battery life. CYW43-only.
