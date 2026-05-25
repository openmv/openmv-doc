.. currentmodule:: network
.. _network.LAN:

class LAN -- control an Ethernet interface
==========================================

The :class:`LAN` class drives the MCU's on-chip Ethernet MAC against
an external RMII PHY. The PHY type, MDIO address and pinout are all
board-specific; sensible defaults are baked into each OpenMV board so
the constructor normally takes no arguments.

Available on:

- OpenMV Cam N6 (STM32 port) -- default PHY :data:`PHY_LAN8742`.
- Arduino Portenta H7 (STM32 port) -- default PHY
  :data:`PHY_LAN8742`.
- OpenMV Cam RT1062 (mimxrt port) -- default PHY :data:`PHY_KSZ8081`.

Example usage::

    import network

    nic = network.LAN()
    nic.active(True)

    while not nic.isconnected():
        pass

    print(nic.ipconfig("addr4"))

Constructors
------------

.. class:: LAN(id: int = 0, *, phy_type: int | None = None, phy_addr: int | None = None, ref_clk_mode: int | None = None) -> None

   Construct a :class:`LAN` interface object. All arguments after
   ``id`` are keyword-only.

   ``id`` selects the Ethernet port on boards that expose more than
   one (mimxrt port: ``0`` = ENET, ``1`` = ENET_1). Ignored on STM32
   boards, which only have a single MAC.

   ``phy_type`` selects the PHY driver (one of the ``PHY_*``
   constants below). Pass ``None`` (the default) to use the PHY
   wired to the OpenMV board.

   ``phy_addr`` is the MDIO address of the PHY on the management
   bus. Pass ``None`` (the default) to use the board's wired value.

   ``ref_clk_mode`` (mimxrt only) selects whether the RMII reference
   clock is driven by the MAC (:data:`OUT`) or by the PHY
   (:data:`IN`). Ignored on STM32 boards.

   Methods
   -------

   .. method:: active(is_active: Optional[bool] = None) -> bool

      Bring the Ethernet MAC up or down.

      With no argument, return the current PHY link status as a
      truthy/falsy integer -- see :meth:`status` for the full set of
      encoded values.

      ``active(True)`` starts the MAC and PHY, kicks off
      auto-negotiation, and brings the lwIP netif up. Link-up itself
      may take a moment to complete -- poll :meth:`isconnected` if
      you need to block until the link is fully ready. All other
      methods (:meth:`ipconfig`, :meth:`config`, ...) require the
      interface to be active.

      ``active(False)`` stops the MAC and tears down the netif.

   .. method:: isconnected() -> bool

      Return ``True`` when the PHY has negotiated link-up *and* the
      interface is in the fully-up state (link status value ``3``).

   .. method:: status() -> int

      Return the raw PHY link status as an integer:

         * ``0`` -- link down.
         * ``1`` -- link up (PHY only, IP stack not yet ready).
         * ``2`` -- transitioning.
         * ``3`` -- link up and the IP stack has finished bringing
           the interface up.

   .. method:: ifconfig(config: Optional[Tuple[str, str, str, str]] = None) -> Optional[Tuple[str, str, str, str]]

      Get or set IPv4 interface parameters as a 4-tuple of
      ``(ip, subnet, gateway, dns)`` dotted-quad strings.

      .. note::

         Prefer :meth:`ipconfig` for new code::

            nic.ipconfig(addr4="192.168.0.4/24", gw4="192.168.0.1")
            network.ipconfig(dns="8.8.8.8")

   .. method:: ipconfig(param: str) -> Any
               ipconfig(**kwargs: Any) -> None

      Get or set IPv4 / IPv6 interface parameters. Behaves the same
      as :meth:`AbstractNIC.ipconfig` -- see that method for the full
      list of supported parameter names (``dhcp4``, ``addr4``,
      ``gw4``, ``autoconf6``, ``addr6``, ...).

   .. method:: config(param: str) -> Any
               config(**kwargs: Any) -> None

      Get or set Ethernet-specific interface parameters.

      With a single positional string argument, return the value of
      that parameter:

         * ``"mac"`` -- the interface MAC address as a 6-byte
           ``bytes`` object.

      With keyword arguments, set one or more parameters:

         * ``trace=<int>`` -- enable lwIP tracing. Bit-field:
           ``2`` traces TX, ``4`` traces RX, ``8`` enables full
           tracing.
         * ``low_power=<bool>`` -- enable or disable the PHY's
           IEEE 802.3az (Energy Efficient Ethernet) low-power mode.

   Constants
   ---------

   .. data:: PHY_LAN8742
      :type: int

      Microchip LAN8742A 10/100 Ethernet PHY. STM32 port only;
      default on the OpenMV Cam N6 and Arduino Portenta H7.

   .. data:: PHY_LAN8720
      :type: int

      Microchip LAN8720 10/100 Ethernet PHY. Available on both
      STM32 and mimxrt ports.

   .. data:: PHY_DP83848
      :type: int

      Texas Instruments DP83848 10/100 Ethernet PHY. Available on
      both STM32 and mimxrt ports.

   .. data:: PHY_DP83825
      :type: int

      Texas Instruments DP83825 10/100 Ethernet PHY. Available on
      both STM32 and mimxrt ports.

   .. data:: PHY_KSZ8081
      :type: int

      Microchip KSZ8081 10/100 Ethernet PHY. mimxrt port only;
      default on the OpenMV Cam RT1062.

   .. data:: PHY_DP83867
      :type: int

      Texas Instruments DP83867 gigabit Ethernet PHY. mimxrt port
      only.

   .. data:: PHY_RTL8211F
      :type: int

      Realtek RTL8211F gigabit Ethernet PHY. mimxrt port only.

   .. data:: IN
      :type: int

      Pass to ``ref_clk_mode`` so the RMII reference clock is driven
      by the PHY. mimxrt port only.

   .. data:: OUT
      :type: int

      Pass to ``ref_clk_mode`` so the RMII reference clock is driven
      by the MAC. mimxrt port only.
