.. currentmodule:: network
.. _network.WINC:

class WINC -- WiFi shield driver
================================

The :class:`WINC` class drives the Atmel WINC1500 802.11 b/g/n WiFi
module on the OpenMV WiFi Shield. Available on the OpenMV Cam M4, M7,
H7, H7 Plus and Pure Thermal (the STM32 boards that the WiFi shield
was designed for). For boards with built-in WiFi (OpenMV Cam N6,
OpenMV Cam RT1062, Arduino Giga) use :class:`WLAN` instead.

Example -- connect to an access point and print the address::

    import network

    wlan = network.WINC()
    wlan.connect("SSID", "KEY", security=network.WINC.WPA_PSK)

    print("status:    ", "connected" if wlan.isconnected() else "off")
    print("rssi:      ", wlan.rssi(), "dBm")
    print("interface: ", wlan.ifconfig())
    print("netinfo:   ", wlan.netinfo())

Example -- bring up an open access point and wait for a client::

    import network

    wlan = network.WINC(mode=network.WINC.MODE_AP)
    wlan.start_ap("OpenMV-Cam", security=network.WINC.OPEN, channel=6)

    print("waiting for a station to associate...")
    print(wlan.wait_for_sta(timeout=None))

Constructors
------------

.. class:: WINC(mode: int = WINC.MODE_STA) -> None

   Create a :class:`WINC` driver object and bring up the WiFi shield.

   ``mode`` selects the operating mode the module starts in:

      * :data:`WINC.MODE_STA` -- station / client. Connect to an
        access point with :meth:`connect`. This is the default.
      * :data:`WINC.MODE_AP` -- access point. Configure the AP with
        :meth:`start_ap`, then accept client connections.
      * :data:`WINC.MODE_P2P` -- WiFi Direct.
      * :data:`WINC.MODE_BSP` -- bring up the BSP only (no radio).
      * :data:`WINC.MODE_FIRMWARE` -- firmware-update mode; required
        by :meth:`fw_dump` and :meth:`fw_update`.

   .. note::

      In AP mode the WINC1500 has hardware limits:

      * Only one client can connect at a time.
      * Only :data:`OPEN` or WEP security are supported.
      * A WiFi-module firmware bug causes any bound sockets to stop
        working when the client disconnects. Set a timeout on the
        server socket so it raises an exception that you can use to
        re-open it.

   Methods
   -------

   .. method:: active(is_active: Optional[bool] = None) -> bool

      Bring the WiFi shield up or down.

      With no argument, return the current state -- ``True`` while
      the shield is initialised and the radio is up, ``False``
      otherwise.

      ``active(True)`` performs the WINC1500 firmware handshake over
      SPI and brings the radio up in the configured ``mode``. It is
      a no-op if the interface is already active. :meth:`connect`
      auto-calls this if it has not been called yet; for any other
      method (:meth:`scan`, :meth:`rssi`, :meth:`netinfo`, ...) you
      must call ``active(True)`` first.

      ``active(False)`` shuts the radio back down (the WINC drops to
      BSP-only mode) and releases the SPI pins.

   .. method:: connect(ssid: str, key: Optional[str] = None, *, security: int = WINC.WPA_PSK, channel: int = 1) -> None

      Associate with the WiFi network ``ssid`` using password ``key``,
      security mode ``security`` (one of :data:`OPEN`, :data:`WPA_PSK`
      or the 802.1X constant) on radio ``channel``. ``security`` and
      ``channel`` are keyword-only.

      After connecting use the :mod:`socket` module to open TCP/UDP
      ports.

      This method blocks until the association completes or fails.

   .. method:: config(ssid: str, key: Optional[str] = None, *, security: int = WINC.WPA_PSK, channel: int = 1) -> None

      Alias of :meth:`connect`. Provided for compatibility with code
      that calls ``config`` on other :mod:`network` interfaces.

   .. method:: start_ap(ssid: str, key: Optional[str] = None, *, security: int = WINC.OPEN, channel: int = 1) -> None

      Alias of :meth:`connect` used after constructing the object
      with ``mode=MODE_AP`` to configure and start the access point.
      The AP only supports :data:`OPEN` or WEP security; if WEP is
      used ``key`` is required.

   .. method:: disconnect() -> None

      In STA mode, disassociate from the currently associated access
      point. The shield stays active; call :meth:`connect` to
      re-associate. No-op when not currently associated.

   .. method:: isconnected() -> bool

      In STA mode return ``True`` when associated with an access
      point **and** an IPv4 address has been obtained (via DHCP or
      :meth:`ifconfig`). Returns ``False`` while still in the
      authenticating / associating / DHCP phase.

   .. method:: connected_sta() -> List[str]

      In AP mode, return a list containing the IP address of the
      currently connected client (or an empty list if no client is
      connected).

   .. method:: wait_for_sta(timeout: Optional[int]) -> List[str]

      In AP mode, block until a client connects and return a list
      containing the client's IP address. ``timeout`` is the maximum
      wait in milliseconds; pass ``None`` to wait indefinitely.

   .. method:: ifconfig(config: Optional[Tuple[str, str, str, str]] = None) -> Tuple[str, str, str, str]

      Get or set IPv4 interface parameters. The 4-tuple contains
      ``(ip, subnet, gateway, dns)`` as dotted-quad strings.

      Called with no argument: returns the current configuration.

      Called with a 4-tuple: sets a static IP configuration in place
      of the DHCP-acquired one.

      Example -- pin a static IP before connecting::

         wlan = network.WINC()
         wlan.ifconfig(("192.168.1.100", "255.255.255.0",
                        "192.168.1.1", "192.168.1.1"))
         wlan.connect(SSID, key=KEY, security=network.WINC.WPA_PSK)

      .. note::

         :class:`WINC` does **not** implement the modern
         :meth:`AbstractNIC.ipconfig` API; use :meth:`ifconfig` here.

   .. method:: netinfo() -> Tuple[int, int, str, str, str]

      Return a 5-tuple describing the current association:

         * ``[0]`` RSSI as an int (dBm).
         * ``[1]`` Security mode -- one of the security constants.
         * ``[2]`` SSID string.
         * ``[3]`` BSSID as an ``"XX:XX:XX:XX:XX:XX"`` MAC string.
         * ``[4]`` IPv4 address as a dotted-quad string.

   .. method:: scan() -> List[Tuple[str, str, int, int, int, int]]

      Scan for nearby access points. Returns a list of 6-tuples:

         * ``[0]`` SSID string.
         * ``[1]`` BSSID as an ``"XX:XX:XX:XX:XX:XX"`` MAC string.
         * ``[2]`` Channel number.
         * ``[3]`` RSSI in dBm.
         * ``[4]`` Security mode -- one of the security constants.
         * ``[5]`` Reserved (always ``1``).

      Can be called without first associating with a network.

   .. method:: rssi() -> int

      Return the RSSI in dBm of the currently associated access
      point. Roughly: ``-30`` is excellent, ``-67`` is OK for
      streaming, ``-80`` is marginal, ``-90`` and below is unusable.
      Only meaningful in STA mode while :meth:`isconnected` is
      ``True``.

   .. method:: fw_version() -> Tuple[int, int, int, int, int, int, int]

      Return a 7-tuple describing the WINC1500 firmware and driver
      versions:

         * ``[0]`` Firmware major.
         * ``[1]`` Firmware minor.
         * ``[2]`` Firmware patch.
         * ``[3]`` Driver major.
         * ``[4]`` Driver minor.
         * ``[5]`` Driver patch.
         * ``[6]`` Chip hardware revision.

   .. method:: fw_dump(path: str) -> None

      Read the WINC1500's internal flash and write the resulting
      firmware image to the file at ``path`` on the OpenMV's
      filesystem. Use this to back up the currently-installed image
      before calling :meth:`fw_update`.

      Requires the module to have been constructed with
      ``mode=MODE_FIRMWARE``.

   .. method:: fw_update(path: str) -> None

      Erase the WINC1500's internal flash and program it with the
      binary image at ``path``. The image must match the layout
      expected by the OpenMV firmware (typically supplied by Atmel /
      Microchip with the WINC SDK).

      The call blocks for several seconds while the flash is
      programmed and verified. Power-cycle the OpenMV Cam after the
      call returns so the WINC1500 starts from the new image.

      Requires the module to have been constructed with
      ``mode=MODE_FIRMWARE``.

   Constants
   ---------

   .. data:: OPEN
      :type: int

      Security value for an unencrypted network. Pass to the
      ``security`` argument of :meth:`connect` / :meth:`start_ap`.

   .. data:: WPA_PSK
      :type: int

      Security value for WPA/WPA2 with a pre-shared key. The default
      for :meth:`connect`.

   .. note::

      A WPA/WPA2 **Enterprise** (802.1X) security value also exists.
      The firmware exposes it under the name ``802_1X``, which is not
      a valid Python identifier -- access it via
      ``getattr(network.WINC, "802_1X")``.

   .. data:: MODE_STA
      :type: int

      Station mode -- connect to an access point as a client. The
      default constructor mode.

   .. data:: MODE_AP
      :type: int

      Access-point mode -- the WINC becomes the AP that clients
      associate with.

   .. data:: MODE_P2P
      :type: int

      WiFi-Direct (peer-to-peer) mode.

   .. data:: MODE_BSP
      :type: int

      Initialise the WINC board-support package only -- the radio is
      not brought up. Used by the firmware-update flow.

   .. data:: MODE_FIRMWARE
      :type: int

      Firmware-update mode. Required by :meth:`fw_dump` and
      :meth:`fw_update`.
