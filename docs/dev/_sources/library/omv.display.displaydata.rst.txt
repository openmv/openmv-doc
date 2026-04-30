.. currentmodule:: display

class DisplayData -- Display Data
=================================

The `DisplayData` class provides access to display data channels (CEC/DDC) for an
attached DisplayPort/HDMI display.

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
