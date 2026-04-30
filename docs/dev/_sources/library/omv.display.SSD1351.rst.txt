.. currentmodule:: display

class SSD1351 -- Display Controller
===================================

The `SSD1351` class is used to initialize the SSD1351 OLED display controller. Pass an instance
of this class as the ``controller`` argument to the `SPIDisplay()` class constructor.

Constructors
------------

.. class:: SSD1351()

   Creates an SSD1351 display controller object.

   .. method:: init(display_controller: display.SPIDisplay) -> None

      Initializes the display controller. ``display_controller`` must provide a
      `display.SPIDisplay.bus_write()` method. Called by the parent display driver.

   .. method:: ram_write(display_controller: display.SPIDisplay) -> None

      Issues the write-to-RAM command (`SSD1351.WRITE_RAM`) on the display controller bus.
      ``display_controller`` must provide a `display.SPIDisplay.bus_write()` method.

   .. method:: display_on(display_controller: display.SPIDisplay) -> None

      Issues the display-on command (`SSD1351.DISPLAY_ON`) on the display controller bus.
      ``display_controller`` must provide a `display.SPIDisplay.bus_write()` method.

   .. method:: display_off(display_controller: display.SPIDisplay) -> None

      Issues the display-off command (`SSD1351.DISPLAY_OFF`) on the display controller bus.
      ``display_controller`` must provide a `display.SPIDisplay.bus_write()` method.

   .. attribute:: SSD1351.WRITE_RAM
      :type: int

      Write to display RAM command (``0x5C``).

   .. attribute:: SSD1351.SET_REMAP
      :type: int

      Set re-map / dual COM line mode command (``0xA0``).

   .. attribute:: SSD1351.DISPLAY_OFFSET
      :type: int

      Set display offset command (``0xA2``).

   .. attribute:: SSD1351.DISPLAY_OFF
      :type: int

      Set sleep mode on / display off command (``0xAE``).

   .. attribute:: SSD1351.DISPLAY_ON
      :type: int

      Set sleep mode off / display on command (``0xAF``).

   .. attribute:: SSD1351.PRECHARGE
      :type: int

      Set phase length / precharge command (``0xB1``).

   .. attribute:: SSD1351.DISPLAY_ENHANCEMENT
      :type: int

      Display enhancement command (``0xB2``).

   .. attribute:: SSD1351.CLOCK_DIV
      :type: int

      Set front clock divider / oscillator frequency command (``0xB3``).

   .. attribute:: SSD1351.PRECHARGE2
      :type: int

      Set second precharge period command (``0xB6``).

   .. attribute:: SSD1351.PRECHARGE_LEVEL
      :type: int

      Set precharge voltage level command (``0xBB``).

   .. attribute:: SSD1351.CONTRAST_ABC
      :type: int

      Set contrast for color A, B, C command (``0xC1``).

   .. attribute:: SSD1351.CONTRAST_MASTER
      :type: int

      Master contrast current control command (``0xC7``).

   .. attribute:: SSD1351.MUX_RATIO
      :type: int

      Set MUX ratio command (``0xCA``).

   .. attribute:: SSD1351.COMMAND_LOCK
      :type: int

      Set command lock command (``0xFD``).
