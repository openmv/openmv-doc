Wrap up
=======

The :mod:`machine` module is now a familiar surface. The
camera can talk to the physical world along several paths:

* **GPIO output and input.** Drive an LED, switch a transistor,
  read a button -- the building blocks of every hardware
  project. Pull resistors and debouncing make those reads
  reliable.
* **Analog signals.** Read a sensor or a potentiometer with
  the ADC; produce a controlled voltage with PWM and an RC
  filter when no DAC is available.
* **PWM applications.** Dim an LED, vary the speed of a DC
  motor through an H-bridge, position a servo. Same waveform,
  different averagers (the eye, the motor's inductance) and
  different framing (duty cycle vs absolute pulse width).
* **Serial buses.** UART for asynchronous point-to-point
  links; SPI for fast on-board peripherals with one CS per
  device; I2C for slow multi-device sensor buses on just two
  wires; CAN for robust multi-master field buses between
  modules.
* **Production patterns.** A watchdog timer to recover from
  hangs; sleep modes to stretch a battery; both essential the
  first time a camera leaves the bench.

That coverage is enough to build the "sense, plan, act" loop
of an embedded device: read sensors over I2C / SPI / ADC,
make decisions in Python, drive actuators through PWM / GPIO,
report status over UART / CAN, sleep between events.

What is *not* in this section is the camera's other half --
its imaging pipeline. That is the subject of the next
super-section, which picks up where the :mod:`machine` module
leaves off and shows how the same Python loop drives an
image sensor, runs computer-vision algorithms over the frames,
and feeds the results back into the same actuators and buses
covered here.
