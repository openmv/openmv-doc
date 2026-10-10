Power Connector
===============

The input power to the board goes through a 5 volt regulator. It is ideal to
supply the board with between 6 and 15 volts of DC power that is capable of
supplying at least 150 milliamperes of current.

The servos can either be powered by internal power, or by the external servo
power connector. To run them off of external power, remove the internal servo
power jumper. Then connect a second power supply to the "External Servo Power
Connector". To run off of internal power, connect the "Internal Servo Power"
jumper and disconnect any external servo power.

**Warning:** powering the servos from internal power means that if the servos
require more current than is available to power both servos and the processor,
then the processor may reset or fail to operate at all. Running three or more
servos off of internal power will likely not succeed. Be careful what voltage
you supply to the External Servo Power input since it will not go through a
regulator. Most servos require 5 volts, but some standard servos can still work
at up to 7 or 8 volts.
