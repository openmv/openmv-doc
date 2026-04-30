:mod:`lora` --- LoRa modem driver
=================================

.. module:: lora
   :synopsis: LoRa modem driver for the Arduino Portenta Vision Shield.

The ``lora`` module provides a driver for the Murata CMWX1ZZABZ LoRa modem on
the Arduino Portenta Vision Shield. It exposes a high-level :class:`Lora` class
that wraps the AT command set used by the modem firmware (including the Arduino
MKRWAN ``ARD-078`` firmware) so an application can join a LoRaWAN network and
send/receive packets.

Example::

    import lora

    modem = lora.Lora(band=lora.BAND_EU868, debug=True)
    print("Device EUI:", modem.get_device_eui())
    if modem.join_OTAA("0000000000000000", "00000000000000000000000000000000"):
        modem.send_data(b"hello", confirmed=True)


Constants
---------

Activation modes
~~~~~~~~~~~~~~~~

.. data:: MODE_ABP
   :type: int

   Activation By Personalization mode.

.. data:: MODE_OTAA
   :type: int

   Over-The-Air Activation mode.

RF output modes
~~~~~~~~~~~~~~~

.. data:: RF_MODE_RFO
   :type: int

   Use the modem's RFO (low-power) RF output.

.. data:: RF_MODE_PABOOST
   :type: int

   Use the modem's PA_BOOST (high-power) RF output.

Bands
~~~~~

.. data:: BAND_AS923
   :type: int

   AS923 (Asia 923 MHz) regional band.

.. data:: BAND_AU915
   :type: int

   AU915 (Australia 915 MHz) regional band.

.. data:: BAND_EU868
   :type: int

   EU868 (Europe 868 MHz) regional band.

.. data:: BAND_KR920
   :type: int

   KR920 (Korea 920 MHz) regional band.

.. data:: BAND_IN865
   :type: int

   IN865 (India 865 MHz) regional band.

.. data:: BAND_US915
   :type: int

   US915 (United States 915 MHz) regional band.

.. data:: BAND_US915_HYBRID
   :type: int

   US915 hybrid (sub-band) regional plan.

Device classes
~~~~~~~~~~~~~~

.. data:: CLASS_A
   :type: str

   LoRaWAN end-device Class A.

.. data:: CLASS_B
   :type: str

   LoRaWAN end-device Class B.

.. data:: CLASS_C
   :type: str

   LoRaWAN end-device Class C.


Exceptions
----------

.. exception:: LoraError

   Base exception raised for any error returned by the modem or the driver.

.. exception:: LoraErrorTimeout

   Raised when the modem does not respond within the configured timeout
   (the receive buffer is empty).

.. exception:: LoraErrorParam

   Raised on a ``+ERR_PARAM`` response when an AT command was issued with an
   invalid parameter.

.. exception:: LoraErrorBusy

   Raised on a ``+ERR_BUSY`` response when the modem is busy processing a
   previous command.

.. exception:: LoraErrorOverflow

   Raised on a ``+ERR_PARAM_OVERFLOW`` response when a parameter exceeds the
   maximum allowed length.

.. exception:: LoraErrorNoNetwork

   Raised on a ``+ERR_NO_NETWORK`` response when the modem has not joined a
   network.

.. exception:: LoraErrorRX

   Raised on a ``+ERR_RX`` response when an error occurs while receiving a
   downlink.

.. exception:: LoraErrorUnknown

   Raised on a ``+ERR_UNKNOWN`` response or when the modem reports an
   undocumented error.


Classes
-------

.. class:: Lora(uart: pyb.UART = None, rst_pin: pyb.Pin = None, boot_pin: pyb.Pin = None, band: int = BAND_EU868, poll_ms: int = 300000, debug: bool = False)

   Construct a new modem driver. The constructor initializes (or auto-creates)
   the UART and reset/boot pins, hardware-resets the module, performs autobaud
   synchronization, reboots the module, queries its firmware version, and
   configures the requested regional ``band``.

   :param uart: Pre-configured :class:`pyb.UART` instance used to talk to the
       modem. If ``None``, the driver opens ``UART(8, 19200)`` with 8N2 framing
       (the Portenta Vision Shield default).
   :param rst_pin: :class:`pyb.Pin` driving the modem's reset line. If ``None``,
       ``PC6`` is configured as a push-pull output.
   :param boot_pin: :class:`pyb.Pin` driving the modem's boot-select line. If
       ``None``, ``PG7`` is configured as a push-pull output pulled low.
   :param band: Regional band to configure. One of the ``BAND_*`` constants.
   :param poll_ms: Interval in milliseconds between automatic empty uplinks
       triggered by :meth:`poll` to keep the downlink window open.
   :param debug: When ``True``, all UART traffic is printed via ``print()``.

   .. data:: LoraErrors
      :type: dict

      Mapping from modem error response strings (e.g. ``"+ERR_BUSY"``) to the
      corresponding exception class. Used internally by :meth:`handle_error`.

   .. method:: init_modem() -> None

      Lazy-initialize ``self.uart``, ``self.rst_pin`` and ``self.boot_pin`` to
      their Portenta Vision Shield defaults if they are not already set. Called
      from the constructor; not normally invoked by user code.

   .. method:: debug_print(data: str) -> None

      Print ``data`` if ``debug`` was enabled at construction time, otherwise
      do nothing.

   .. method:: is_arduino_firmware() -> bool

      Return ``True`` if the modem is running the Arduino MKRWAN ``ARD-078``
      firmware (detected from the cached ``fw_version`` string).

   .. method:: configure_class(_class: str) -> None

      Configure the LoRaWAN device class.

      :param _class: One of :data:`CLASS_A`, :data:`CLASS_B`, :data:`CLASS_C`.

   .. method:: configure_band(band: int) -> bool

      Configure the regional band and, on Arduino firmware with
      :data:`BAND_EU868`, enable the ETSI duty-cycle limiter. Returns ``True``
      on success.

      :param band: One of the ``BAND_*`` constants.

   .. method:: set_baudrate(baudrate: int) -> None

      Change the modem's UART baud rate (``AT+UART``).

      :param baudrate: New baud rate, in bits per second.

   .. method:: set_autobaud(timeout: int = 10000) -> bool

      Send empty ``AT`` commands until the modem responds with ``+OK`` or until
      ``timeout`` milliseconds elapse. Returns ``True`` if synchronization
      succeeded.

      :param timeout: Maximum time to spend trying, in milliseconds.

   .. method:: get_fw_version() -> str

      Query the modem device string (``AT+DEV?``) and firmware version
      (``AT+VER?``) and return them as a single space-separated string.

   .. method:: get_device_eui() -> str

      Return the modem's 64-bit Device EUI as a hex string.

   .. method:: factory_default() -> None

      Restore factory defaults via ``AT+FACNEW``.

   .. method:: restart() -> None

      Re-synchronize the baud rate, reboot the modem, re-read the firmware
      version, and re-apply the configured regional band. Raises
      :exc:`LoraError` on failure.

   .. method:: set_rf_power(mode: int, power: int) -> None

      Configure the modem RF output stage (``AT+RFPOWER``).

      :param mode: One of :data:`RF_MODE_RFO`, :data:`RF_MODE_PABOOST`.
      :param power: Output power index, in firmware-specific units.

   .. method:: set_port(port: int) -> None

      Configure the LoRaWAN application port (1..223) used by subsequent
      :meth:`send_data` calls.

      :param port: LoRaWAN FPort.

   .. method:: set_public_network(enable: bool) -> None

      Enable or disable the public-network sync word.

      :param enable: ``True`` for the public LoRaWAN sync word, ``False`` for
          the private one.

   .. method:: sleep(enable: bool) -> None

      Put the modem into low-power sleep (``True``) or wake it up (``False``).

   .. method:: format(hexMode: bool) -> None

      Select the data format used over the UART for payload bytes.

      :param hexMode: ``True`` for ASCII-hex payload format, ``False`` for raw
          binary.

   .. method:: set_datarate(dr: int) -> None

      Set the LoRaWAN data rate index (``AT+DR``).

      :param dr: Region-specific data rate index.

   .. method:: get_datarate() -> int

      Return the current LoRaWAN data rate index.

   .. method:: set_adr(adr: bool) -> None

      Enable or disable Adaptive Data Rate.

      :param adr: ``True`` to enable ADR, ``False`` to disable it.

   .. method:: get_adr() -> int

      Return the current ADR setting (``1`` if enabled, ``0`` otherwise).

   .. method:: get_devaddr() -> str

      Return the current 32-bit DevAddr as a hex string.

   .. method:: get_nwk_skey() -> str

      Return the current Network Session Key as a hex string.

   .. method:: get_appskey() -> str

      Return the current Application Session Key as a hex string.

   .. method:: get_rx2dr() -> int

      Return the data rate index used for the RX2 receive window.

   .. method:: set_rx2dr(dr: int) -> None

      Set the data rate index used for the RX2 receive window.

      :param dr: Region-specific data rate index.

   .. method:: get_ex2freq() -> int

      Return the frequency, in Hz, used for the RX2 receive window.

   .. method:: set_rx2freq(freq: int) -> None

      Set the frequency used for the RX2 receive window.

      :param freq: Frequency in Hz.

   .. method:: set_fcu(fcu: int) -> None

      Set the uplink frame counter (``AT+FCU``).

      :param fcu: New uplink frame counter value.

   .. method:: get_fcu() -> int

      Return the current uplink frame counter.

   .. method:: set_fcd(fcd: int) -> None

      Set the downlink frame counter (``AT+FCD``).

      :param fcd: New downlink frame counter value.

   .. method:: get_fcd() -> int

      Return the current downlink frame counter.

   .. method:: change_mode(mode: int) -> None

      Switch the activation mode.

      :param mode: One of :data:`MODE_ABP`, :data:`MODE_OTAA`.

   .. method:: join(timeout_ms: int) -> bool

      Issue an ``AT+JOIN`` and wait for the join-accept event. Returns ``True``
      if the modem reports ``+EVENT=1,1`` (join succeeded) within
      ``timeout_ms``.

      :param timeout_ms: Maximum time to wait for both the ``+ACK`` and the
          subsequent join event, in milliseconds.

   .. method:: get_join_status() -> bool

      Return ``True`` if the modem is currently joined to a network.

   .. method:: get_max_size() -> int

      Return the maximum LoRaWAN payload size, in bytes, for the current data
      rate. On Arduino firmware this is fixed at ``64``.

   .. method:: poll() -> None

      If more than ``poll_ms`` milliseconds have passed since the last call,
      send an empty confirmed uplink to flush pending downlinks. Intended to be
      called frequently from the application's main loop.

   .. method:: send_data(buff: bytes, confirmed: bool = True) -> bool

      Transmit a LoRaWAN uplink. Raises :exc:`LoraError` if ``buff`` is larger
      than :meth:`get_max_size`.

      :param buff: Payload bytes to transmit.
      :param confirmed: When ``True``, send a confirmed uplink (``+CTX``) and
          wait for a network-server ``+ACK``. When ``False``, send an
          unconfirmed uplink (``+UTX``).
      :return: ``True`` if the modem accepted the packet (and, for confirmed
          uplinks, the network acknowledged it), ``False`` otherwise.

   .. method:: receive_data(timeout: int = 1000) -> dict | None

      Wait for a downlink. Returns ``None`` if no ``+RECV`` event was received
      within ``timeout`` milliseconds, otherwise a dict ``{"port": str,
      "data": str}`` containing the FPort and the payload bytes.

      :param timeout: Maximum time to wait, in milliseconds.

   .. method:: receive(delimiter: str | list | None = None, max_bytes: int | None = None, timeout: int = 1000) -> str

      Low-level UART read. Reads characters from the modem until a delimiter
      is matched, ``max_bytes`` characters have been read, or ``timeout``
      milliseconds elapse, then returns the accumulated string with any
      trailing ``\r`` stripped.

      :param delimiter: Either a single character to match at the end of the
          buffer, a multi-character string to match against the full trimmed
          buffer, or a list of such strings.
      :param max_bytes: If set, return as soon as exactly this many bytes have
          been read.
      :param timeout: Overall read timeout, in milliseconds.

   .. method:: available() -> int

      Return the number of bytes currently available in the modem's UART
      receive buffer.

   .. method:: join_OTAA(appEui: str, appKey: str, devEui: str = None, timeout: int = 60000) -> bool

      Switch the modem to OTAA mode, program the supplied keys and EUIs, then
      attempt to join the network. Returns ``True`` if the join succeeded.

      :param appEui: 64-bit Application/Join EUI as a hex string.
      :param appKey: 128-bit Application Key as a hex string.
      :param devEui: Optional 64-bit Device EUI as a hex string. If ``None``,
          the factory-programmed Device EUI is used.
      :param timeout: Join timeout, in milliseconds.

   .. method:: join_ABP(nwkId: int, devAddr: str, nwkSKey: str, appSKey: str, timeout: int = 60000) -> bool

      Switch the modem to ABP mode, program the supplied addresses and keys,
      then attempt to join. Returns the result of :meth:`get_join_status`.

      :param nwkId: Network identifier (currently ignored by the firmware).
      :param devAddr: 32-bit Device Address as a hex string.
      :param nwkSKey: 128-bit Network Session Key as a hex string.
      :param appSKey: 128-bit Application Session Key as a hex string.
      :param timeout: Join timeout, in milliseconds.

   .. method:: handle_error(command: str, data: str) -> None

      Inspect a modem response and raise the matching :exc:`LoraError`
      subclass if it represents an error. Does nothing for non-error
      responses.

      :param command: The AT command (without the ``AT`` prefix) that produced
          ``data``.
      :param data: The response string returned by the modem.

   .. method:: send_command(cmd: str, *args, delimiter: str = "\\r", data: bytes = None, timeout: int = 1000, raise_error: bool = True) -> str

      Build an AT command from ``cmd`` and ``args``, optionally append a raw
      ``data`` payload, transmit it, and return the modem's response. For
      query commands ending in ``?``, only the value portion (the substring
      after ``=``) is returned.

      :param cmd: AT command suffix (e.g. ``"+JOIN"``, ``"+DR="``); the
          ``"AT"`` prefix and trailing ``\r`` are added automatically.
      :param args: Additional arguments concatenated to ``cmd`` after string
          conversion.
      :param delimiter: Delimiter forwarded to :meth:`receive`.
      :param data: Optional raw bytes written immediately after the AT
          command (used for binary uplink payloads).
      :param timeout: Response timeout, in milliseconds.
      :param raise_error: When ``True``, error responses are converted into
          :exc:`LoraError` exceptions; when ``False``, the raw response is
          returned to the caller.
