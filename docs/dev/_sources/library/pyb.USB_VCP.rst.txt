.. currentmodule:: pyb
.. _pyb.USB_VCP:

class USB_VCP -- USB virtual comm port
======================================

The USB_VCP class allows creation of a :std:term:`stream`-like object representing the USB
virtual comm port.  It can be used to read and write data over USB to
the connected host.


Constructors
------------

.. class:: USB_VCP(id: int = 0)

   Create a new USB_VCP object.  The *id* argument specifies which USB VCP port to
   use.

   Create a new USB_VCP object.

   Methods
   -------

   .. method:: init(*, flow: int = -1) -> None

      Configure the USB VCP port.  If the *flow* argument is not -1 then the value sets
      the flow control, which can be a bitwise-or of ``USB_VCP.RTS`` and ``USB_VCP.CTS``.
      RTS is used to control read behaviour and CTS, to control write behaviour.

   .. method:: setinterrupt(chr: int) -> None

      Set the character which interrupts running Python code.  This is set
      to 3 (CTRL-C) by default, and when a CTRL-C character is received over
      the USB VCP port, a KeyboardInterrupt exception is raised.

      Set to -1 to disable this interrupt feature.  This is useful when you
      want to send raw bytes over the USB VCP port.

   .. method:: isconnected() -> bool

      Return ``True`` if USB is connected as a serial device, else ``False``.

   .. method:: debug_mode_enabled() -> bool

      Return ``True`` if OpenMV IDE is connected to the OpenMV Cam.

   .. method:: any() -> bool

      Return ``True`` if any characters waiting, else ``False``.

   .. method:: close() -> None

      This method does nothing.  It exists so the USB_VCP object can act as
      a file.

   .. method:: read(nbytes: Optional[int] = None) -> Optional[bytes]

      Read at most ``nbytes`` from the serial device and return them as a
      bytes object.  If ``nbytes`` is not specified then the method reads
      all available bytes from the serial device.
      USB_VCP :std:term:`stream` implicitly works in non-blocking mode,
      so if no pending data available, this method will return immediately
      with ``None`` value.

   .. method:: readinto(buf: bytearray, maxlen: Optional[int] = None) -> Optional[int]

      Read bytes from the serial device and store them into ``buf``, which
      should be a buffer-like object.  At most ``len(buf)`` bytes are read.
      If ``maxlen`` is given and then at most ``min(maxlen, len(buf))`` bytes
      are read.

      Returns the number of bytes read and stored into ``buf`` or ``None``
      if no pending data available.

   .. method:: readline() -> Optional[bytes]

      Read a whole line from the serial device.

      Returns a bytes object containing the data, including the trailing
      newline character or ``None`` if no pending data available.

   .. method:: readlines() -> List[bytes]

      Read as much data as possible from the serial device, breaking it into
      lines.

      Returns a list of bytes objects, each object being one of the lines.
      Each line will include the newline character.

   .. method:: write(buf: Union[bytes, bytearray, str]) -> int

      Write the bytes from ``buf`` to the serial device.

      Returns the number of bytes written.

   .. method:: recv(data: Union[int, bytearray], *, timeout: int = 5000) -> Union[bytes, int]

      Receive data on the bus:

        - ``data`` can be an integer, which is the number of bytes to receive,
          or a mutable buffer, which will be filled with received bytes.
        - ``timeout`` is the timeout in milliseconds to wait for the receive.

      Return value: if ``data`` is an integer then a new buffer of the bytes received,
      otherwise the number of bytes read into ``data`` is returned.

   .. method:: send(data: Union[int, bytes, bytearray], *, timeout: int = 5000) -> int

      Send data over the USB VCP:

        - ``data`` is the data to send (an integer to send, or a buffer object).
        - ``timeout`` is the timeout in milliseconds to wait for the send.

      Return value: number of bytes sent.

   .. method:: irq(handler: Optional[Callable[[USB_VCP], None]] = None, trigger: int = IRQ_RX, hard: bool = False) -> None

      Register *handler* to be called whenever an event specified by *trigger*
      occurs.  The *handler* function must take exactly one argument, which will
      be the USB VCP object.  Pass in ``None`` to disable the callback.

      Valid values for *trigger* are:

        - ``USB_VCP.IRQ_RX``: new data is available for reading from the USB VCP object.


   Constants
   ---------

   .. data:: RTS
             CTS
      :type: int

      to select the flow control type.

   .. data:: IRQ_RX
      :type: int

      IRQ trigger values for :meth:`USB_VCP.irq`.
