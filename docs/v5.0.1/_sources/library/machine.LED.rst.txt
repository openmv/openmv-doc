.. currentmodule:: machine
.. _machine.LED:

class LED -- portable on-board LED control
==========================================

The :class:`LED` class is a thin portable wrapper around
:class:`machine.Pin` that drives a named board LED, hiding the
active-low / active-high wiring difference between boards. It is
shipped as a frozen Python module by the OpenMV firmware (see
``scripts/libraries/machine.py``) and is therefore available on
every OpenMV-supported board, regardless of port.

The LED is driven as a simple on/off GPIO; there is no PWM intensity
control. For LEDs wired to PWM-capable pins drive them via
:class:`PWM` directly instead.

Example usage::

    from machine import LED

    red = LED("LED_RED")
    red.on()
    red.toggle()
    red.off()

Constructors
------------

.. class:: LED(pin_name: str | Pin) -> LED

   Construct an :class:`LED` object bound to the LED identified by
   ``pin_name``. ``pin_name`` is either an OpenMV-board LED string
   (``"LED_RED"``, ``"LED_GREEN"``, ``"LED_BLUE"``, ``"LED_IR"`` --
   the exact set depends on the cam) or a :class:`Pin` object.

   The constructor records whether the LED is wired active-low or
   active-high (using :meth:`boardname` to look up the active-level
   convention for the current board) so callers always pass logical
   on/off levels without worrying about polarity.

   Methods
   -------

   .. method:: on() -> None

      Drive the LED to its on state.

   .. method:: off() -> None

      Drive the LED to its off state.

   .. method:: toggle() -> None

      Flip the LED's current state.

   .. method:: value(v: int | None = None, /) -> int | None

      Get or set the LED state.

      With no argument, return the current logical state (``0`` =
      off, ``1`` = on).

      With a single ``v`` argument, set the LED to that state. The
      driver XORs ``v`` with the board's active-level convention so
      ``1`` is always "on" regardless of polarity.

   .. method:: boardname() -> str

      Return the board name string (the prefix of
      ``os.uname().machine`` before ``" with "``). Used internally to
      pick the right active-level convention for the LED.
