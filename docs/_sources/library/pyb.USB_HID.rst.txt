.. currentmodule:: pyb
.. _pyb.USB_HID:

class USB_HID -- USB Human Interface Device (HID)
=================================================

The USB_HID class represents the OpenMV Cam's USB Human Interface
Device interface. It can be used to emulate a peripheral such as a
mouse or keyboard.

Before constructing a ``USB_HID`` object, call :func:`pyb.usb_mode` with
a mode that includes ``HID`` (e.g. ``'VCP+HID'``) -- this enumerates
the USB HID class on the host. The report descriptor passed to
``usb_mode`` selects the device class; pre-built tuples are available
as :data:`pyb.hid_mouse` and :data:`pyb.hid_keyboard`.

Example -- send a mouse left-click then move it 5 pixels right::

    import pyb

    pyb.usb_mode("VCP+HID", hid=pyb.hid_mouse)
    hid = pyb.USB_HID()

    # report layout: (buttons, dx, dy, wheel)
    hid.send((1, 0, 0, 0))   # press left button
    hid.send((0, 0, 0, 0))   # release
    hid.send((0, 5, 0, 0))   # move +5 in X

Constructors
------------

.. class:: USB_HID()

   Create a new USB_HID object. There is only one HID interface, so the
   constructor returns the singleton object.

   Methods
   -------

   .. method:: send(data: Union[Tuple[int, ...], List[int], bytes, bytearray]) -> None

      Send an HID input report to the USB host.

      ``data`` is a tuple/list of integers or a ``bytes``-like buffer
      whose layout depends on the report descriptor in use. For the
      built-in mouse descriptor the report is
      ``(buttons, dx, dy, wheel)``; for the keyboard descriptor it is
      ``(modifiers, 0, key1, key2, key3, key4, key5, key6)``. See
      :data:`pyb.hid_mouse` and :data:`pyb.hid_keyboard`.

   .. method:: recv(data: Union[int, bytearray], *, timeout: int = 5000) -> Union[bytes, int]

      Receive an HID output report from the USB host (e.g. keyboard LED
      state). Returns immediately if a report is already buffered.

      - ``data`` is either an ``int`` (the number of bytes to read into a
        fresh buffer) or a mutable buffer to fill with received bytes.
      - ``timeout`` is the maximum time in milliseconds to wait for a
        report.

      If ``data`` is an integer a fresh ``bytes`` object is returned;
      otherwise the number of bytes written into ``data`` is returned.
