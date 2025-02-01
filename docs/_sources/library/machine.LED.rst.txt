.. currentmodule:: machine
.. _machine.LED:

class LED -- LED Control
========================

The LED class provides an interface to control the on-board LED.

Example usage::

   from machine import LED

   r = LED("LED_RED")
   g = LED("LED_GREEN")
   b = LED("LED_BLUE")

   r.on()
   g.off()
   b.toggle()

Constructors
------------

.. class:: LED(pin_name) -> LED

   Access the LED associated with a source identified by *pin_name*. This
   ``pin_name`` may be a string (usually specifying a color), a
   :ref:`Pin <machine.Pin>` object, or other value supported by the
   underlying machine.

Methods
-------

.. method:: LED.boardname() -> str

   Returns the name of the board.

.. method:: LED.on() -> None

   Turns the LED on.

.. method:: LED.() -> None

   Turns the LED off.

.. method:: LED.toggle() -> None

   Toggles the LED state.

.. method:: LED.value(v=None) -> int

   If ``v`` is given, sets the LED to the given value. If ``v`` is not given,
   returns the current LED value.
