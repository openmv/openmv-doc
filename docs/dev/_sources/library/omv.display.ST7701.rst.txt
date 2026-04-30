.. currentmodule:: display

class ST7701 -- Display Controller
==================================

The `ST7701` class initializes the ST7701 LCD controller used by MIPI DSI panels.

Constructors
------------

.. class:: ST7701()

   Creates a controller object. Pass it as the ``controller`` argument to
   `DSIDisplay()` which will invoke `ST7701.init()` automatically.

   .. method:: init(dc: display.DSIDisplay, dt: Any) -> None

      Initializes the display.

      - ``dc`` is the display controller object that must provide ``bus_write()``
        and ``bus_read()`` methods (typically a `display.DSIDisplay` instance).
      - ``dt`` is the display timing/configuration argument forwarded by the
        display controller.

   .. method:: read_id() -> bytes

      Returns the 3-byte display id read from register ``0x04``.

   .. attribute:: ST7701.DSI_CMD2_BKX_SEL
      :type: int

      Command 2 bank select register (``0xFF``).

   .. attribute:: ST7701.DSI_CMD2_BK0_SEL
      :type: int

      Bank 0 select value (``0x10``).

   .. attribute:: ST7701.DSI_CMD2_BK1_SEL
      :type: int

      Bank 1 select value (``0x11``).

   .. attribute:: ST7701.DSI_CMD2_BKX_SEL_NONE
      :type: int

      Bank disable value (``0x00``).

   .. attribute:: ST7701.DSI_CMD2_BK0_PVGAMCTRL
      :type: int

      Positive voltage gamma control (``0xB0``).

   .. attribute:: ST7701.DSI_CMD2_BK0_NVGAMCTRL
      :type: int

      Negative voltage gamma control (``0xB1``).

   .. attribute:: ST7701.DSI_CMD2_BK0_LNESET
      :type: int

      Display line setting (``0xC0``).

   .. attribute:: ST7701.DSI_CMD2_BK0_PORCTRL
      :type: int

      Porch control (``0xC1``).

   .. attribute:: ST7701.DSI_CMD2_BK0_INVSEL
      :type: int

      Inversion select (``0xC2``).

   .. attribute:: ST7701.DSI_CMD2_BK1_SECTRL
      :type: int

      Setting control (``0xE0``).

   .. attribute:: ST7701.DSI_CMD2_BK1_NRCTRL
      :type: int

      Noise reduction control (``0xE1``).

   .. attribute:: ST7701.DSI_CMD2_BK1_SRPCTRL
      :type: int

      Source pre-charge control (``0xE2``).

   .. attribute:: ST7701.DSI_CMD2_BK1_CCCTRL
      :type: int

      Charge control (``0xE3``).

   .. attribute:: ST7701.DSI_CMD2_BK1_SKCTRL
      :type: int

      Skew control (``0xE4``).

   .. attribute:: ST7701.DSI_CMD2_BK1_VRHS
      :type: int

      VRH set (``0xB0``).

   .. attribute:: ST7701.DSI_CMD2_BK1_VCOM
      :type: int

      VCOM set (``0xB1``).

   .. attribute:: ST7701.DSI_CMD2_BK1_VGHSS
      :type: int

      VGH set (``0xB2``).

   .. attribute:: ST7701.DSI_CMD2_BK1_TESTCMD
      :type: int

      Test command (``0xB3``).

   .. attribute:: ST7701.DSI_CMD2_BK1_VGLS
      :type: int

      VGL set (``0xB5``).

   .. attribute:: ST7701.DSI_CMD2_BK1_PWCTLR1
      :type: int

      Power control 1 (``0xB7``).

   .. attribute:: ST7701.DSI_CMD2_BK1_PWCTLR2
      :type: int

      Power control 2 (``0xB8``).

   .. attribute:: ST7701.DSI_CMD2_BK1_DGMLUTR
      :type: int

      Digital gamma LUT (``0xB9``).

   .. attribute:: ST7701.DSI_CMD2_BK1_SPD1
      :type: int

      Source pre-drive 1 (``0xC1``).

   .. attribute:: ST7701.DSI_CMD2_BK1_SPD2
      :type: int

      Source pre-drive 2 (``0xC2``).

   .. attribute:: ST7701.DSI_CMD2_BK1_MIPISET1
      :type: int

      MIPI setting 1 (``0xD0``).

   .. attribute:: ST7701.DCS_SOFT_RESET
      :type: int

      Soft reset (``0x01``).

   .. attribute:: ST7701.DCS_EXIT_SLEEP_MODE
      :type: int

      Exit sleep mode (``0x11``).

   .. attribute:: ST7701.DCS_SET_DISPLAY_ON
      :type: int

      Set display on (``0x29``).
