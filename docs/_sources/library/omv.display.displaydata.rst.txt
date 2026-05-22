.. currentmodule:: display

class DisplayData -- Display Data
=================================

The :class:`DisplayData` class provides access to the side-channel
links of an attached HDMI / DisplayPort display:

- **DDC** (Display Data Channel) is an I2C bus that carries the
  display's EDID -- a structured block describing the panel
  capabilities (manufacturer, supported resolutions and refresh
  rates, colour and audio formats, ...). Source devices query it
  once at startup to discover what the sink supports.
- **CEC** (Consumer Electronics Control) is a single-wire
  bidirectional bus that lets connected HDMI / DisplayPort devices
  exchange short control packets -- power on/off, input switching,
  volume, remote-control forwarding, etc.

Either or both channels can be enabled at construction. The raw EDID
is read with :meth:`display_id`; CEC frames can be sent with
:meth:`send_frame`, polled synchronously via :meth:`receive_frame`,
or routed to a callback with :meth:`frame_callback`.

Example -- query the connected display's EDID and listen for CEC
frames addressed to logical address 0::

    import display

    data = display.DisplayData(cec=True, ddc=True)

    # Read the EDID once at startup.
    edid = data.display_id()
    print("EDID:", edid)

    def on_frame(src, payload):
        print("CEC from {:#x}: {}".format(src, payload))

    data.frame_callback(on_frame, 0)

Constructors
------------

.. class:: DisplayData(*, cec: bool = False, ddc: bool = False, ddc_addr: int = 0x50)

    ``cec`` set to ``True`` to enable CEC communication with an external display.

    ``ddc`` set to ``True`` to enable DDC communication with an external display.

    ``ddc_addr`` I2C address of the external display EEPROM.

   .. method:: display_id() -> bytes

       Returns the external display EDID data as a ``bytes`` object. EDID headers and
       checksums are verified and all sections are concatenated into a single ``bytes``
       object. Raises ``OSError`` on failure.

   .. method:: send_frame(dst_addr: int, src_addr: int, data: bytes) -> None

       Sends a CEC frame to ``dst_addr`` from ``src_addr`` containing ``data``. Raises
       ``OSError`` on failure.

   .. method:: receive_frame(dst_addr: int, *, timeout: int = 1000) -> tuple[int, bytes]

       Waits up to ``timeout`` milliseconds for a CEC frame addressed to ``dst_addr``.
       Returns a tuple of ``(src_addr, data)``. Raises ``OSError`` on timeout or failure.

   .. method:: frame_callback(callback: Callable[[int, bytes], None] | None, dst_addr: int) -> None

       Registers ``callback`` to be called when a CEC frame addressed to ``dst_addr``
       is received. The callback is invoked with two arguments: the source address as
       an ``int`` and the frame payload as a ``bytes`` object.

       Pass ``None`` as ``callback`` to disable reception. While a callback is
       registered, do not call `DisplayData.receive_frame()`.
