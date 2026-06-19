.. currentmodule:: machine
.. _machine.UART:

class UART -- duplex serial communication bus
=============================================

UART implements the standard UART/USART duplex serial communications protocol.  At
the physical level it consists of 2 lines: RX and TX.  The unit of communication
is a character (not to be confused with a string character) which can be 8 or 9
bits wide.

UART objects can be created and initialised using::

    from machine import UART

    uart = UART(3, 9600)                         # init with given baudrate
    uart.init(9600, bits=8, parity=None, stop=1) # init with given parameters

Bits can be 7, 8 or 9. Stop can be 1 or 2. With *parity=None*,
only 8 and 9 bits are supported.  With parity enabled, only 7 and 8 bits
are supported.

A UART object acts like a :std:term:`stream` object and reading and writing is done
using the standard stream methods::

    uart.read(10)       # read 10 characters, returns a bytes object
    uart.read()         # read all available characters
    uart.readline()     # read a line
    uart.readinto(buf)  # read and store into the given buffer
    uart.write('abc')   # write the 3 characters

Constructors
------------

.. class:: UART(id: int, baudrate: int = 9600, bits: int = 8, parity: int | None = None, stop: int = 1, *, tx: Pin | None = None, rx: Pin | None = None, rts: Pin | None = None, cts: Pin | None = None, txbuf: int | None = None, rxbuf: int | None = None, timeout: int | None = None, timeout_char: int | None = None, invert: int = 0, flow: int = 0)

   Construct a UART object of the given id.

   Methods
   -------

   .. method:: init(baudrate: int = 9600, bits: int = 8, parity: int | None = None, stop: int = 1, *, tx: Pin | None = None, rx: Pin | None = None, rts: Pin | None = None, cts: Pin | None = None, txbuf: int | None = None, rxbuf: int | None = None, timeout: int | None = None, timeout_char: int | None = None, invert: int = 0, flow: int = 0) -> None

      Initialise the UART bus with the given parameters:

        - *baudrate* is the clock rate.
        - *bits* is the number of bits per character, 7, 8 or 9.
        - *parity* is the parity, ``None``, 0 (even) or 1 (odd).
        - *stop* is the number of stop bits, 1 or 2.

      Additional keyword-only parameters that may be supported by a port are:

        - *tx* specifies the TX pin to use.
        - *rx* specifies the RX pin to use.
        - *rts* specifies the RTS (output) pin to use for hardware receive flow control.
        - *cts* specifies the CTS (input) pin to use for hardware transmit flow control.
        - *txbuf* specifies the length in characters of the TX buffer.
        - *rxbuf* specifies the length in characters of the RX buffer.
        - *timeout* specifies the time to wait for the first character (in ms).
        - *timeout_char* specifies the time to wait between characters (in ms).
        - *invert* specifies which lines to invert.

            - ``0`` will not invert lines (idle state of both lines is logic high).
            - ``UART.INV_TX`` will invert TX line (idle state of TX line now logic low).
            - ``UART.INV_RX`` will invert RX line (idle state of RX line now logic low).
            - ``UART.INV_TX | UART.INV_RX`` will invert both lines (idle state at logic low).

        - *flow* specifies which hardware flow control signals to use. The value
          is a bitmask.

            - ``0`` will ignore hardware flow control signals.
            - ``UART.RTS`` will enable receive flow control by using the RTS output pin to
              signal if the receive FIFO has sufficient space to accept more data.
            - ``UART.CTS`` will enable transmit flow control by pausing transmission when the
              CTS input pin signals that the receiver is running low on buffer space.
            - ``UART.RTS | UART.CTS`` will enable both, for full hardware flow control.

      .. note::
        It is possible to call ``init()`` multiple times on the same object in
        order to reconfigure  UART on the fly. That allows using single UART
        peripheral to serve different devices attached to different GPIO pins.
        Only one device can be served at a time in that case.
        Also do not call ``deinit()`` as it will prevent calling ``init()``
        again.

   .. method:: deinit() -> None

      Turn off the UART bus.

      .. note::
        You will not be able to call ``init()`` on the object after ``deinit()``.
        A new instance needs to be created in that case.

   .. method:: any() -> int

      Returns an integer counting the number of characters that can be read without
      blocking.  It will return 0 if there are no characters available and a positive
      number if there are characters.  The method may return 1 even if there is more
      than one character available for reading.

      For more sophisticated querying of available characters use select.poll::

       poll = select.poll()
       poll.register(uart, select.POLLIN)
       poll.poll(timeout)

   .. method:: read(nbytes: int | None = None, /) -> bytes | None

      Read characters.  If ``nbytes`` is specified then read at most that many bytes,
      otherwise read as much data as possible. It may return sooner if a timeout
      is reached. The timeout is configurable in the constructor.

      Return value: a bytes object containing the bytes read in.  Returns ``None``
      on timeout.

   .. method:: readinto(buf: bytearray, nbytes: int | None = None, /) -> int | None

      Read bytes into the ``buf``.  If ``nbytes`` is specified then read at most
      that many bytes.  Otherwise, read at most ``len(buf)`` bytes. It may return
      sooner if a timeout is reached. The timeout is configurable in the constructor.

      Return value: number of bytes read and stored into ``buf`` or ``None`` on
      timeout.

   .. method:: readline() -> bytes | None

      Read a line, ending in a newline character. It may return sooner if a timeout
      is reached. The timeout is configurable in the constructor.

      Return value: the line read or ``None`` on timeout.

   .. method:: write(buf: bytes) -> int | None

      Write the buffer of bytes to the bus.

      Return value: number of bytes written or ``None`` on timeout.

   .. method:: sendbreak() -> None

      Send a break condition on the bus -- drive TX low for longer
      than one character time. Available on STM32 and mimxrt;
      not exposed on alif.

   .. method:: readchar() -> int

      Read a single character from the UART and return it as an
      integer (or ``-1`` on timeout). Lower overhead than
      :meth:`read(1) <read>` since no ``bytes`` object is allocated.
      STM32 only.

   .. method:: writechar(char: int) -> None

      Write the single character ``char`` (an integer in the range
      ``0`` -- ``255``) to the UART. Lower overhead than
      :meth:`write` for single-byte sends. STM32 only.

   .. method:: flush() -> None

      Block until every byte currently in the transmit buffer has
      been clocked out on TX. Raises ``OSError`` on timeout; the
      timeout is derived from the TX buffer size and the configured
      baudrate, so unless flow control is enabled and the receiver
      stalls, the call returns well before the timeout.

   .. method:: txdone() -> bool

      Return ``True`` when no transmission is in flight (the TX
      buffer is empty and the shift register has drained), ``False``
      otherwise. Useful as a non-blocking alternative to
      :meth:`flush`.

   .. method:: irq(handler: Callable[[UART], None] | None = None, trigger: int = 0, hard: bool = False) -> None

      Install a callback to fire on UART events.

      ``handler`` is the function to invoke. It receives the
      :class:`UART` instance as its only argument. Pass ``None`` to
      remove a previously-installed handler.

      ``trigger`` is a bitmask of one or more :data:`IRQ_*` constants
      (see Constants below) selecting which events fire the callback.

      ``hard=True`` registers a hard-interrupt handler (lower
      latency, but the handler must not allocate). The default is a
      scheduled callback.

      Returns an irq object.

      Not every IRQ source is available on every port -- see the
      individual :data:`IRQ_*` constants for per-port availability.

   Constants
   ---------

   .. data:: RTS
      :type: int

      Pass to ``flow`` to enable RTS hardware flow control on the
      receive side. Combine with :data:`CTS` via OR to enable both.

   .. data:: CTS
      :type: int

      Pass to ``flow`` to enable CTS hardware flow control on the
      transmit side.

   .. data:: IRQ_RXIDLE
      :type: int

      :meth:`irq` trigger flag: fires once after one or more
      characters have been received and the RX line then goes idle.
      Available on all OpenMV ports.

   .. data:: IRQ_RX
      :type: int

      :meth:`irq` trigger flag: fires after every received
      character. Available on STM32 and alif.

   .. data:: IRQ_TXIDLE
      :type: int

      :meth:`irq` trigger flag: fires when the last character of a
      transmit has been clocked out. Available on mimxrt and alif.

   .. data:: IRQ_BREAK
      :type: int

      :meth:`irq` trigger flag: fires when a break condition is
      detected on RX. Not available on any OpenMV port.
