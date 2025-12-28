.. currentmodule:: display
.. _display.SSD1351:

class SSD1351 -- Display Controller
===================================

The `SSD1351` class is used to initialize the LCD screen controller.

Constructors
------------

.. class:: display.SSD1351()

   Creates a controller object to initialize the SSD1351 display controller which typically powers
   SPI displays. This class should be passed as the ``controller`` argument to the `SPIDisplay()`
   class constructor which will take care of calling the `SSD1351.init()` method for you.

Methods
-------

.. method:: SSD1351.init(display_controller) -> None

   Initializes the display using the display controller which must provide `display.SPIDisplay.bus_write()` method.

.. method:: SSD1351.ram_write(display_controller) -> None

   Returns the command to write to display ram. Called by display controller.

.. method:: SSD1351.display_on(display_controller) -> None

   Returns the command to turn the display on. Called by display controller.

.. method:: SSD1351.display_off(display_controller) -> None

   Returns the command to turn the display off. Called by display controller.
