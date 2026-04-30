:mod:`ssd1306` --- OLED Driver
==============================

.. module:: ssd1306
   :synopsis: SSD1306 OLED driver

This module provides a driver for SSD1306-based OLED displays. Two
transport variants are supported: I2C (:class:`SSD1306_I2C`) and SPI
(:class:`SSD1306_SPI`). Both inherit the drawing API from
:class:`SSD1306`, which wraps a :class:`framebuf.FrameBuffer1`.

Example::

    from machine import I2C, Pin
    import ssd1306

    i2c = I2C(0, scl=Pin(22), sda=Pin(21))
    oled = ssd1306.SSD1306_I2C(128, 64, i2c)
    oled.fill(0)
    oled.text("Hello", 0, 0)
    oled.show()

Classes
-------

.. class:: SSD1306(width: int, height: int, external_vcc: bool)

   Base class for SSD1306 OLED displays. Subclasses must initialize
   ``self.framebuf`` and provide ``write_cmd``, ``write_data``,
   ``write_framebuf`` and ``poweron`` methods.

   Arguments:

   - ``width`` -- Display width in pixels.
   - ``height`` -- Display height in pixels (must be a multiple of 8).
   - ``external_vcc`` -- ``True`` if an external VCC source is used,
     ``False`` to enable the internal charge pump.

   Instance attributes:

   - ``width`` -- Display width in pixels.
   - ``height`` -- Display height in pixels.
   - ``external_vcc`` -- External VCC flag.
   - ``pages`` -- Number of 8-pixel-tall pages (``height // 8``).

   .. method:: init_display() -> None

      Send the initialization command sequence to the display, clear
      the framebuffer, and refresh. Called automatically by
      ``__init__``.

   .. method:: poweroff() -> None

      Turn the display off (sleep mode).

   .. method:: contrast(contrast: int) -> None

      Set the display contrast.

      - ``contrast`` -- Contrast value in the range ``0``--``255``.

   .. method:: invert(invert: int) -> None

      Invert the display colors.

      - ``invert`` -- ``0`` for normal output, ``1`` for inverted
        output. Only the least significant bit is used.

   .. method:: show() -> None

      Flush the internal framebuffer to the display.

   .. method:: fill(col: int) -> None

      Fill the entire framebuffer with a single color.

      - ``col`` -- Color value (``0`` for off, ``1`` for on).

   .. method:: pixel(x: int, y: int, col: int) -> None

      Set the color of a single pixel.

      - ``x`` -- Column coordinate.
      - ``y`` -- Row coordinate.
      - ``col`` -- Color value (``0`` or ``1``).

   .. method:: scroll(dx: int, dy: int) -> None

      Shift the framebuffer contents by the given offsets. Pixels
      shifted out of bounds are lost; vacated pixels are left
      untouched.

      - ``dx`` -- Horizontal shift in pixels.
      - ``dy`` -- Vertical shift in pixels.

   .. method:: text(string: str, x: int, y: int, col: int = 1) -> None

      Draw a string using the built-in 8x8 font.

      - ``string`` -- Text to draw.
      - ``x`` -- Starting column coordinate.
      - ``y`` -- Starting row coordinate.
      - ``col`` -- Foreground color (default ``1``).

.. class:: SSD1306_I2C(width: int, height: int, i2c: machine.I2C, addr: int = 0x3C, external_vcc: bool = False)

   I2C-connected SSD1306 driver. Inherits from :class:`SSD1306`.

   Arguments:

   - ``width`` -- Display width in pixels.
   - ``height`` -- Display height in pixels.
   - ``i2c`` -- An initialized ``machine.I2C`` (or compatible) object.
   - ``addr`` -- 7-bit I2C device address (default ``0x3C``).
   - ``external_vcc`` -- ``True`` for external VCC, ``False`` to use
     the internal charge pump.

   .. method:: write_cmd(cmd: int) -> None

      Send a single command byte to the display over I2C.

   .. method:: write_data(buf: bytes) -> None

      Send a buffer of pixel data to the display over I2C.

.. class:: SSD1306_SPI(width: int, height: int, spi: machine.SPI, dc: machine.Pin, res: machine.Pin, cs: machine.Pin, external_vcc: bool = False)

   SPI-connected SSD1306 driver. Inherits from :class:`SSD1306`.
   Uses a fixed SPI clock rate of 10 MHz.

   Arguments:

   - ``width`` -- Display width in pixels.
   - ``height`` -- Display height in pixels.
   - ``spi`` -- A ``pyb.SPI`` (or compatible) object.
   - ``dc`` -- Data/command select pin.
   - ``res`` -- Reset pin.
   - ``cs`` -- Chip-select pin.
   - ``external_vcc`` -- ``True`` for external VCC, ``False`` to use
     the internal charge pump.

   .. method:: write_cmd(cmd: int) -> None

      Send a single command byte to the display over SPI.

   .. method:: write_framebuf() -> None

      Transmit the entire framebuffer to the display over SPI.

   .. method:: poweron() -> None

      Toggle the reset line to power the display on.

Constants
---------

.. data:: SET_CONTRAST
   :type: int

   Command ``0x81`` -- set display contrast.

.. data:: SET_ENTIRE_ON
   :type: int

   Command ``0xA4`` -- resume display from RAM contents.

.. data:: SET_NORM_INV
   :type: int

   Command ``0xA6`` -- normal/inverse display select.

.. data:: SET_DISP
   :type: int

   Command ``0xAE`` -- display on/off.

.. data:: SET_MEM_ADDR
   :type: int

   Command ``0x20`` -- memory addressing mode.

.. data:: SET_COL_ADDR
   :type: int

   Command ``0x21`` -- column address range.

.. data:: SET_PAGE_ADDR
   :type: int

   Command ``0x22`` -- page address range.

.. data:: SET_DISP_START_LINE
   :type: int

   Command ``0x40`` -- display start line.

.. data:: SET_SEG_REMAP
   :type: int

   Command ``0xA0`` -- segment remap.

.. data:: SET_MUX_RATIO
   :type: int

   Command ``0xA8`` -- multiplex ratio.

.. data:: SET_COM_OUT_DIR
   :type: int

   Command ``0xC0`` -- COM output scan direction.

.. data:: SET_DISP_OFFSET
   :type: int

   Command ``0xD3`` -- display offset.

.. data:: SET_COM_PIN_CFG
   :type: int

   Command ``0xDA`` -- COM pins hardware configuration.

.. data:: SET_DISP_CLK_DIV
   :type: int

   Command ``0xD5`` -- display clock divide ratio / oscillator
   frequency.

.. data:: SET_PRECHARGE
   :type: int

   Command ``0xD9`` -- pre-charge period.

.. data:: SET_VCOM_DESEL
   :type: int

   Command ``0xDB`` -- VCOMH deselect level.

.. data:: SET_CHARGE_PUMP
   :type: int

   Command ``0x8D`` -- charge pump configuration.
