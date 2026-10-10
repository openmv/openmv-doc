Wrap up
=======

You have walked through the parts of the :mod:`machine`
module that come up the moment a script talks to the
physical world:

* **GPIO output and input** -- driving an LED or a
  transistor, reading a button or a limit switch. The
  building blocks every hardware project rests on, with pull
  resistors and software debouncing for reads that have to
  be reliable.

* **Analog signals** -- reading a sensor, a potentiometer, or
  any other continuously-varying voltage with the ADC; and,
  when no DAC is available, producing a controlled voltage
  with PWM and a low-pass RC filter.

* **PWM applications** -- dimming an LED, varying the speed
  of a DC motor through an H-bridge, positioning a servo.
  One waveform, different physical averagers (the eye, the
  motor's inductance) and different framings (duty cycle
  versus absolute pulse width).

* **Serial buses** -- :mod:`UART` for asynchronous
  point-to-point links; :mod:`SPI` for fast on-board
  peripherals with one chip-select per device; :mod:`I2C`
  for slow multi-device sensor buses on just two wires;
  :mod:`CAN` for robust multi-master field buses between
  modules.

* **Production patterns** -- a watchdog timer to recover
  from hangs, sleep modes to stretch a battery. Both become
  essential the first time a camera leaves the bench.

That is enough to build the *sense -- plan -- act* loop of
an embedded device: read sensors over I2C / SPI / ADC, make
decisions in Python, drive actuators through PWM / GPIO,
report status over UART / CAN, sleep between events.

Using this reference later
--------------------------

Treat the hardware chapters as reference material, not a
one-pass read. The :mod:`machine` module reference page
lists every class and method in one place when the question
is just "what is the exact name of this call". The
per-chapter pages here are where to come back for the
"which knob does what, and why" view that the reference
material does not give on its own.

Where to go from here
---------------------

**Vision sensors** is the next major topic. Where this
section taught the generic peripherals -- Pin, ADC, PWM,
UART, SPI, I2C, CAN -- that show up on almost any MCU, the
next section teaches the camera's *defining* peripheral
very deeply: the image sensor, and the long chain of
optics, silicon, and signal processing between photons
hitting glass and a buffer of pixels in RAM. The toolkit
shifts to the :mod:`csi` and :mod:`image` modules, but
everything you have learned about driving GPIOs, talking
over I2C, and using PWM carries forward unchanged --
strobes, triggers, and sensor shields all use the same
buses you have just covered.
