.. currentmodule:: pyb
.. _pyb.SPI:

class SPI -- a controller-driven serial protocol
================================================

SPI is a synchronous serial protocol driven by a controller. At the
physical level it uses three lines (``SCK``, ``MOSI``, ``MISO``) plus a
per-peripheral chip-select line.

Usage is similar to :class:`I2C`; the main difference is the parameters
passed when initialising the bus::

    from pyb import SPI
    spi = SPI(2, SPI.CONTROLLER, baudrate=600000, polarity=1, phase=0, crc=0x7)

The only required parameter is *mode* (``SPI.CONTROLLER`` or
``SPI.PERIPHERAL``). ``polarity`` is the idle level of ``SCK`` (``0`` or
``1``). ``phase`` selects whether data is sampled on the first (``0``) or
second (``1``) clock edge. ``crc`` is either ``None`` (no CRC) or a CRC
polynomial.

Transferring data::

    data = spi.send_recv(b"1234")        # send 4 bytes and receive 4 bytes
    buf = bytearray(4)
    spi.send_recv(b"1234", buf)          # send 4 bytes and receive 4 into buf
    spi.send_recv(buf, buf)              # send/receive 4 bytes through buf

Constructors
------------

.. class:: SPI(bus: Union[int, str], *args, **kwargs)

   Construct an SPI object on the given ``bus`` (an integer SPI peripheral
   index, e.g. ``2`` for ``SPI2``). With no additional parameters the
   object is created but not initialised (it retains the previous bus
   settings, if any); if extra arguments are given the bus is initialised
   with them. See :meth:`init` for the available parameters.

   ``SPI(2)`` is wired to the same header pins on every STM32 OpenMV Cam:

   .. list-table::
      :header-rows: 1
      :widths: 28 28 44

      * - Signal
        - Header pin
        - Notes
      * - ``NSS``
        - ``P3``
        - Not driven by the SPI peripheral; free to use as a normal GPIO chip-select.
      * - ``SCK``
        - ``P2``
        -
      * - ``MISO``
        - ``P1``
        -
      * - ``MOSI``
        - ``P0``
        -

   On the OpenMV Cam N6 ``SPI(4)`` is additionally available on header
   pins ``P15`` (``NSS``), ``P16`` (``SCK``), ``P17`` (``MISO``) and
   ``P18`` (``MOSI``).

   Methods
   -------

   .. method:: deinit() -> None

      Turn off the SPI bus.

   .. method:: init(mode: int, baudrate: int = 328125, *, prescaler: int = -1, polarity: int = 1, phase: int = 0, bits: int = 8, firstbit: int = SPI.MSB, ti: bool = False, crc: Optional[int] = None) -> None

      Initialise the SPI bus with the given parameters:

        - ``mode`` must be either ``SPI.CONTROLLER`` or ``SPI.PERIPHERAL``.
        - ``baudrate`` is the SCK clock rate (only sensible for a controller).
        - ``prescaler`` is the prescaler to use to derive SCK from the APB bus frequency;
          use of ``prescaler`` overrides ``baudrate``.
        - ``polarity`` can be 0 or 1, and is the level the idle clock line sits at.
        - ``phase`` can be 0 or 1 to sample data on the first or second clock edge
          respectively.
        - ``bits`` can be 8 or 16, and is the number of bits in each transferred word.
        - ``firstbit`` can be ``SPI.MSB`` or ``SPI.LSB``.
        - ``ti`` True indicates Texas Instruments, as opposed to Motorola, signal conventions.
        - ``crc`` can be None for no CRC, or a polynomial specifier.

      The SPI clock frequency may not match ``baudrate`` exactly. The
      hardware only supports clocks that are the parent APB bus frequency
      divided by a power-of-two prescaler (``2, 4, 8, 16, 32, 64, 128`` or
      ``256``); the driver picks the highest one that does not exceed the
      requested ``baudrate``. ``SPI(2)`` is on APB1. For precise control
      over the clock, set ``prescaler`` directly instead of ``baudrate``.

      Printing the SPI object shows the computed baud rate and chosen
      prescaler.

   .. method:: recv(recv: Union[int, bytearray], *, timeout: int = 5000) -> bytes

      Receive data on the bus:

        - ``recv`` can be an integer, which is the number of bytes to receive,
          or a mutable buffer, which will be filled with received bytes.
        - ``timeout`` is the timeout in milliseconds to wait for the receive.

      Return value: if ``recv`` is an integer then a new buffer of the bytes received,
      otherwise the same buffer that was passed in to ``recv``.

   .. method:: send(send: Union[int, bytes, bytearray], *, timeout: int = 5000) -> None

      Send data on the bus:

        - ``send`` is the data to send (an integer to send, or a buffer object).
        - ``timeout`` is the timeout in milliseconds to wait for the send.

      Return value: ``None``.

   .. method:: send_recv(send: Union[int, bytes, bytearray], recv: Optional[bytearray] = None, *, timeout: int = 5000) -> bytes

      Send and receive data on the bus at the same time:

        - ``send`` is the data to send (an integer to send, or a buffer object).
        - ``recv`` is a mutable buffer which will be filled with received bytes.
          It can be the same as ``send``, or omitted.  If omitted, a new buffer will
          be created.
        - ``timeout`` is the timeout in milliseconds to wait for the receive.

      Return value: the buffer with the received bytes.

   Constants
   ---------

   .. data:: CONTROLLER
             PERIPHERAL
      :type: int

      for initialising the SPI bus to controller or peripheral mode

   .. data:: LSB
             MSB
      :type: int

      set the first bit to be the least or most significant bit
