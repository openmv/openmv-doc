:mod:`neopixel` --- control of WS2812 / NeoPixel LEDs
=====================================================

.. module:: neopixel
   :synopsis: control of WS2812 / NeoPixel LEDs

This module provides a driver for WS2812 / NeoPixel LED strips. The driver
relies on `machine.bitstream()` to generate the precisely timed signal the LEDs
expect, so it works on any port whose ``machine`` module implements
``bitstream``. On the OpenMV-supported Arduino Giga and Nano boards the module
is included by default; on other ports it can be installed with :term:`mip`
or copied from :term:`micropython-lib`.

The application sets pixel data via item assignment or `NeoPixel.fill()` and
then calls `NeoPixel.write()` to update the strip. Each pixel is exposed as an
RGB or RGBW tuple in the order accepted by the user; the driver handles the
GRB(W) wire order internally.

Example::

    import machine
    import neopixel

    # 32 LED strip connected to pin X8.
    p = machine.Pin.board.X8
    n = neopixel.NeoPixel(p, 32)

    # Draw a red gradient.
    for i in range(32):
        n[i] = (i * 8, 0, 0)

    # Update the strip.
    n.write()

class NeoPixel
--------------

.. class:: NeoPixel(pin: "machine.Pin", n: int, bpp: int = 3, timing: int | tuple[int, int, int, int] = 1)

    Construct a ``NeoPixel`` object for a strip of LEDs connected to *pin*.

        - *pin* is a :py:class:`machine.Pin` instance; it will be
          reconfigured as an output by the constructor.
        - *n* is the number of LEDs in the strip.
        - *bpp* is the number of bytes per pixel: ``3`` for RGB LEDs (such as
          WS2812) and ``4`` for RGBW LEDs (such as SK6812-RGBW).
        - *timing* selects the bit timing. ``0`` selects the slow 400 kHz
          timing, ``1`` selects the standard 800 kHz timing used by most
          modern strips. A 4-tuple ``(high_0, low_0, high_1, low_1)`` of
          nanosecond durations may be passed instead, in the form accepted by
          `machine.bitstream()`.

    .. data:: ORDER
       :type: tuple[int, int, int, int]

       Class attribute that maps the user-facing channel order to the wire
       order. Defaults to ``(1, 0, 2, 3)``, i.e. user-supplied ``(R, G, B[, W])``
       tuples are transmitted as ``G R B [W]``. Subclasses may override
       ``ORDER`` to support strips with a different wire order.

    .. method:: fill(pixel: tuple[int, ...]) -> None

       Set every pixel in the strip to *pixel*, an RGB or RGBW tuple of
       integers in the range ``0``-``255``.

    .. method:: __len__() -> int

       Return the number of LEDs in the strip.

    .. method:: __setitem__(index: int, val: tuple[int, ...]) -> None

       Set the pixel at *index* to *val*, an RGB or RGBW tuple. The data is
       only buffered; call `write()` to push it to the strip.

    .. method:: __getitem__(index: int) -> tuple[int, ...]

       Return the pixel at *index* from the local buffer as an RGB or RGBW
       tuple in the user-facing channel order.

    .. method:: write() -> None

       Transmit the buffered pixel data to the strip using
       `machine.bitstream()`.
