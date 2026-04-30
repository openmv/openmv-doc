.. currentmodule:: network
.. _network.LAN:

class LAN -- control an Ethernet module
=======================================

This class allows you to control the Ethernet interface. The PHY hardware type is board-specific.

Example usage, for a board with built-in LAN support::

    import network
    nic = network.LAN(0)
    print(nic.ipconfig("addr4"))

    # now use socket as usual
    ...


Constructors
------------

.. class:: LAN(id: int, *, phy_type: int = ..., phy_addr: int = ..., ref_clk_mode: int = ...) -> None

   Create a LAN driver object, initialise the LAN module using the given
   PHY driver name, and return the LAN object.

   Arguments are:

     - *id* is the number of the Ethernet port, either 0 or 1.
     - *phy_type* is the name of the PHY driver. For most board the on-board PHY has to be used and
       is the default. Suitable values are port specific.
     - *phy_addr* specifies the address of the PHY interface. As with *phy_type*, the hardwired value has
       to be used for most boards and that value is the default.
     - *ref_clk_mode* specifies, whether the data clock is provided by the Ethernet controller or
       the PHY interface.
       The default value is the one that matches the board. If set to ``LAN.OUT`` or ``Pin.OUT``
       or ``True``, the clock is driven by the Ethernet controller, if set to ``LAN.IN``
       or ``Pin.IN`` or ``False``, the clock is driven by the PHY interface.

   .. method:: active(state: Optional[bool] = None) -> bool

      With a parameter, it sets the interface active if *state* is true, otherwise it
      sets it inactive.
      Without a parameter, it returns the state.

   .. method:: isconnected() -> bool

      Returns ``True`` if the physical Ethernet link is connected and up.
      Returns ``False`` otherwise.

   .. method:: status() -> int

      Returns the LAN status.

   .. method:: ifconfig(config: Optional[Tuple[str, str, str, str]] = None) -> Optional[Tuple[str, str, str, str]]

      Get/set IP address, subnet mask, gateway and DNS.

      When called with no arguments, this method returns a 4-tuple with the above information.

      To set the above values, pass a 4-tuple with the required information.  For example::

       nic.ifconfig(('192.168.0.4', '255.255.255.0', '192.168.0.1', '8.8.8.8'))

   .. method:: config(config_parameters: Union[str, Any]) -> Any

      Sets or gets parameters of the LAN interface. The only parameter that can be
      retrieved is the MAC address, using::

         mac = LAN.config("mac")

      The parameters that can be set are:

       - ``trace=n`` sets trace levels; suitable values are:

           - 2: trace TX
           - 4: trace RX
           - 8: full trace

       - ``low_power=bool`` sets or clears low power mode, valid values being ``False``
         or ``True``.


Specific LAN class implementations
----------------------------------

On the mimxrt port, suitable values for the *phy_type* constructor argument are:
``PHY_KSZ8081``, ``PHY_DP83825``, ``PHY_DP83848``, ``PHY_LAN8720``, ``PHY_RTL8211F``.
