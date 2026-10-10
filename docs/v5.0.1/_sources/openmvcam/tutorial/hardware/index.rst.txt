Hardware Control
================

Every Python value in the primer lived in memory: a number
named ``x``, a string returned by a function, a list
manipulated by a loop. Hardware control replaces in-memory work
with physical effects -- a voltage on a pin, a pulse train on
a wire, a byte clocked into another chip over a bus.

The :mod:`machine` module is the bridge. Its classes
(:class:`~machine.Pin`, :class:`~machine.ADC`,
:class:`~machine.PWM`, :class:`~machine.UART`,
:class:`~machine.SPI`, :class:`~machine.I2C`,
:class:`~machine.CAN`, :class:`~machine.WDT`) each map a piece
of the camera's silicon to Python: configure an instance, call
its methods, see real effects on the board's pins.

.. toctree::
   :caption: Foundations
   :maxdepth: 1

   foundations/microcontrollers.rst
   foundations/timing.rst
   foundations/virtual-timers.rst
   foundations/pins-and-peripherals.rst

.. toctree::
   :caption: GPIO output
   :maxdepth: 1

   gpio-output/led-class.rst
   gpio-output/electronics-basics.rst
   gpio-output/gpio-output.rst
   gpio-output/level-shifting.rst

.. toctree::
   :caption: GPIO input
   :maxdepth: 1

   gpio-input/electronics-input.rst
   gpio-input/gpio-input.rst
   gpio-input/debouncing.rst

.. toctree::
   :caption: Analog signals
   :maxdepth: 1

   analog/adc.rst
   analog/analog-output.rst

.. toctree::
   :caption: PWM applications
   :maxdepth: 1

   pwm/led-dimming.rst
   pwm/dc-motors.rst
   pwm/servos.rst

.. toctree::
   :caption: Pulse-timed I/O
   :maxdepth: 1

   pulse-io/pulse-io.rst

.. toctree::
   :caption: UART
   :maxdepth: 1

   uart/uart-basics.rst
   uart/uart-code.rst
   uart/serial-protocols.rst

.. toctree::
   :caption: SPI
   :maxdepth: 1

   spi/spi-basics.rst
   spi/spi-code.rst

.. toctree::
   :caption: I2C
   :maxdepth: 1

   i2c/i2c-basics.rst
   i2c/i2c-code.rst

.. toctree::
   :caption: CAN bus
   :maxdepth: 1

   can/can-basics.rst
   can/can-code.rst

.. toctree::
   :caption: Production patterns
   :maxdepth: 1

   production/watchdog.rst
   production/rtc.rst
   production/low-power.rst

.. toctree::
   :caption: Wrap up
   :maxdepth: 1

   wrap-up.rst
