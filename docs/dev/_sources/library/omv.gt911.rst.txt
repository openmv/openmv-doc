:mod:`gt911` --- GT911 5-Point Capacitive Touch Controller
==========================================================

.. module:: gt911
   :synopsis: GT911 5-Point Capacitive Touch Controller driver.


class GT911 -- 5-Point Capacitive Touch Controller
--------------------------------------------------

.. class:: GT911(bus: machine.I2C, reset_pin: int | str, irq_pin: int | str, address: int = _DEFAULT_ADDR, width: int = 800, height: int = 480, touch_points: int = 1, reverse_x: bool = False, reverse_y: bool = False, reverse_axis: bool = True, sito: bool = True, refresh_rate: int = 240, touch_callback: Callable | None = None)

   Creates a GT911 touch screen controller object.

   ``bus`` is the ``machine.I2C`` bus object the GT911 is attached to.

   ``reset_pin`` is the pin number or name (not a ``Pin`` object) connected
   to the GT911 reset line. The driver needs to change pin direction during
   reset.

   ``irq_pin`` is the pin number or name (not a ``Pin`` object) connected to
   the GT911 interrupt line. The driver needs to change pin direction during
   reset.

   ``address`` is the I2C address of the controller. Defaults to
   `gt911._DEFAULT_ADDR`.

   ``width`` is the touch panel resolution along the X axis in pixels.

   ``height`` is the touch panel resolution along the Y axis in pixels.

   ``touch_points`` is the maximum number of simultaneous touch points to
   report (1 to 5).

   ``reverse_x`` if True flips the X axis.

   ``reverse_y`` if True flips the Y axis.

   ``reverse_axis`` if True swaps the X and Y axes.

   ``sito`` enables the controller's Single-Input-Touch-Output mode when True.

   ``refresh_rate`` is the touch report rate in Hz.

   ``touch_callback`` is an optional callable invoked on the falling edge of
   the IRQ pin when a touch event occurs. Pass ``None`` to use polling mode.

   .. method:: read_id() -> bytes

      Returns 4 bytes containing the GT911 product ID.

   .. method:: read_points() -> tuple

      Returns a tuple ``(n, points)`` where ``n`` is the number of active touch
      points and ``points`` is a list of 5 ``array("H", ...)`` entries. Each
      entry contains ``[x, y, size, id]``: ``x`` and ``y`` are the screen
      coordinates, ``size`` is the touch pressure, and ``id`` is a unique
      tracking ID that remains stable for a given finger across reads.

      Only the first ``n`` entries of ``points`` contain valid data.

   .. method:: reset() -> None

      Resets the GT911 controller and re-arms the IRQ handler if a
      ``touch_callback`` was supplied.

Constants
---------

.. data:: gt911._DEFAULT_ADDR
   :type: int

   Default I2C address (``0x5D``) of the GT911 controller.
