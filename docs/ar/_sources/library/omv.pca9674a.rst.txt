:mod:`pca9674a` --- I2C Expander Driver
=======================================

.. module:: pca9674a
   :synopsis: I2C Expander Driver

The :mod:`pca9674a` module provides a driver for the NXP PCA9674A 8-bit
quasi-bidirectional I/O expander. The chip exposes an 8-bit I/O port
over I2C and an active-low ``INT`` line that pulses whenever any input
pin changes state.

Each pin is *quasi-bidirectional*: writing ``1`` releases the pin to a
weak internal pull-up so it acts as an input that an external driver
can pull low; writing ``0`` actively drives the pin low. There is no
separate direction register -- :meth:`PCA9674A.read` returns the
current external level of every pin regardless of what was last
written.

The 7-bit I2C address is ``0x38`` -- ``0x3F`` depending on the
``A0``/``A1``/``A2`` strap pins; ``0x3F`` (``63``) is the default
(all-high straps).

class PCA9674A -- 8-bit I/O expander
------------------------------------

.. class:: PCA9674A(bus: machine.I2C, irq_pin: str, address: int = 63, callback: Callable | None = None)

   Create an interface to a PCA9674A I/O expander.

   - ``bus`` is the :class:`machine.I2C` bus the expander is connected to.
   - ``irq_pin`` is the pin label on the host MCU connected to the
     expander's ``INT`` output. The driver configures it as an input
     with a pull-up and watches for its falling edge.
   - ``address`` is the 7-bit I2C address of the expander
     (``0x38`` -- ``0x3F``). Defaults to ``0x3F``.
   - ``callback`` is invoked on the falling edge of ``irq_pin`` when any
     pin state changes. It receives the :class:`PCA9674A` instance as
     its only argument; the new pin state can be read with
     :meth:`read`. Pass ``None`` (the default) for polled use.

   .. method:: write(value: int) -> None

      Writes the 8-bit ``value`` to the I/O expander pins.

   .. method:: read() -> int

      Returns the 8-bit value of the I/O expander pins.

   .. method:: reset() -> None

      Resets and re-initializes the I/O expander, and re-attaches the IRQ ``callback`` if one was provided.
