:mod:`pca9674a` --- I2C Expander Driver
=======================================

.. module:: pca9674a
   :synopsis: I2C Expander Driver

8-bit I/O expander.


class PCA9674A -- 8-bit I/O expander
------------------------------------

.. class:: PCA9674A(bus: machine.I2C, irq_pin: str, address: int = 63, callback: Callable | None = None)

   Creates an interface to the I/O expander.

   - ``bus`` is the :class:`machine.I2C` bus the expander is connected to.
   - ``irq_pin`` is the pin label connected to the expander's IRQ output.
   - ``address`` is the I2C address of the expander.
   - ``callback`` is invoked on the falling edge of ``irq_pin`` when any pin state changes.

   .. method:: write(value: int) -> None

      Writes the 8-bit ``value`` to the I/O expander pins.

   .. method:: read() -> int

      Returns the 8-bit value of the I/O expander pins.

   .. method:: reset() -> None

      Resets and re-initializes the I/O expander, and re-attaches the IRQ ``callback`` if one was provided.
