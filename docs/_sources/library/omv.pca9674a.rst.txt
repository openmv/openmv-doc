:mod:`pca9674a` --- I2C Expander Driver
=======================================

.. module:: pca9674a
   :synopsis: I2C Expander Driver

8-bit I/O expander.

class PCA9674A -- 8-bit I/O expander
====================================

The `PCA9674A` class is used to initialize the I/O expander.

Constructors
------------

.. class:: pca9674a.PCA9674A(bus:int, irq_pin:str, address:int=63, callback=None)

   Creates an interface to talk to the I/O expander on I2C bus number ``bus`` using IRQ pin ``irq_pin``. The address
   to use can be set with ``address``. ``callback`` is called on any pin state changing.

Methods
-------

.. method:: PCA9674A.write(value:int) -> None

   Writes the 8-bit ``value`` to the I/O expander pins. 

.. method:: PCA9674A.read() -> int

   Returns an 8-bit value representing the pins of the I/O expander.

.. method:: PCA9674A.reset() -> None

   Resets and initializes the I/O expander.
