The LED class
=============

The simplest piece of hardware on the camera is its on-board
LEDs. Most boards have an RGB LED (red, green, blue).
:class:`machine.LED` is the dedicated class for controlling
them; no pin number, no resistor, no circuit -- the lookup,
current limiting, and wiring are handled by the camera itself.

::

    import time
    from machine import LED

    red = LED("LED_RED")
    red.on()
    time.sleep(5)
    red.off()

A complete hardware "hello world": import the class, construct
an instance with the colour's name, turn it on, wait, turn it
off. The LED is visibly lit during the five-second sleep.

The closing ``red.off()`` is symmetric to the opening
``red.on()`` and makes the cleanup explicit. The on-board LEDs
also reset automatically when the script exits. As scripts
grow, relying on script-exit cleanup gets fragile; making each
``.on()`` pair with an explicit ``.off()`` is the habit that
keeps long scripts predictable.

Constructor and methods
-----------------------

The constructor takes one of ``"LED_RED"``, ``"LED_GREEN"``,
or ``"LED_BLUE"``. Each instance exposes four methods:

* :meth:`~machine.LED.on` -- turn it on.
* :meth:`~machine.LED.off` -- turn it off.
* :meth:`~machine.LED.toggle` -- flip the current state.
* :meth:`~machine.LED.value` -- with no arguments, return the
  current state (``0`` or ``1``); with one argument, set it.

A blinker, using the main-loop pattern:

::

    import time
    from machine import LED

    led = LED("LED_RED")

    while True:
        led.toggle()
        time.sleep_ms(500)

Use the on-board LEDs for indicator and status purposes: a
heartbeat that blinks every second, a red flash on error, a
green pulse when a sensor reading is in range.
