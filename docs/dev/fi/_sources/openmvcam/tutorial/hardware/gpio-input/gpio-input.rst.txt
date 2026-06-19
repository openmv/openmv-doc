GPIO input
==========

Reading a switch (or any digital signal) from a GPIO pin goes
through :class:`machine.Pin` again, this time configured as an
input. The interface is symmetric with output: configure the
mode, then either poll the pin's value in the main loop or
register an interrupt handler that fires when the value
changes.

Configuring an input
--------------------

Pass :data:`Pin.IN <machine.Pin.IN>` to the constructor, and
optionally a pull resistor:

::

    from machine import Pin

    button = Pin("P0", Pin.IN, Pin.PULL_UP)

That configures ``P0`` as an input with the MCU's internal
pull-up resistor enabled. With nothing connected to the pin,
the pull-up holds it high; closing a switch from the pin to
ground pulls it low.

Reading the value
-----------------

:meth:`~machine.Pin.value` with no arguments returns the
current state -- ``0`` for low, ``1`` for high:

::

    if button.value() == 0:
        print("button pressed")
    else:
        print("button released")

In the main-loop pattern, polling looks like this:

::

    while True:
        if button.value() == 0:
            do_action()
        time.sleep_ms(50)

The 50 ms sleep keeps the loop from running at full CPU.

Interrupt-driven input
----------------------

Polling works, but every iteration of the main loop costs CPU
time. For inputs that change rarely -- a button press once a
minute, an alarm signal -- :meth:`~machine.Pin.irq` registers
a handler that runs *only* when the pin changes.

The handler runs in *interrupt context*, which constrains
what it can do:

* **No memory allocation.** Creating new objects -- lists,
  strings, exceptions, formatted strings -- can fail inside
  an ISR because the heap is locked. Pre-allocate any buffers
  the handler needs at module scope.
* **No long-running work.** The handler should hand off and
  return. Spending real time inside an ISR delays everything
  else (other interrupts, the main loop, USB traffic).
* **No printing in a tight ISR.** :func:`print` allocates,
  blocks on the UART, and is one of the most expensive things
  a handler can do.

The standard pattern is for the ISR to *schedule* the real
work via :func:`micropython.schedule`, which queues a function
to run back in main context at the next safe point:

::

    import micropython

    def handle_press(pin):
        print("button pressed")

    def on_press(pin):
        micropython.schedule(handle_press, pin)

    button.irq(handler=on_press, trigger=Pin.IRQ_FALLING)

The ISR is one line: queue the callback and return.
``handle_press`` then runs in normal context, where
allocation, :func:`print`, and slow I/O are all safe again.

The ``trigger`` argument selects which edge fires:

* :data:`Pin.IRQ_FALLING <machine.Pin.IRQ_FALLING>` -- 1 to 0.
* :data:`Pin.IRQ_RISING <machine.Pin.IRQ_RISING>` -- 0 to 1.
* :data:`Pin.IRQ_FALLING <machine.Pin.IRQ_FALLING>` |
  :data:`Pin.IRQ_RISING <machine.Pin.IRQ_RISING>` -- both
  edges.
