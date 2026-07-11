Serial Port
===========

The CMUcam3 has a standard level shifted serial port to talk to a computer as
well as a TTL serial port for talking to a microcontroller. The level shifted
serial port only uses 3 of the 10 pins. It is in a 2x5 pin configuration that
fits a standard 9 pin ribbon cable clip-on serial sockets and 10 pin female clip
on serial headers that can both attach to a 10 wire ribbon cable. If this
initially does not work, try flipping the direction that the ribbon cable
connects to the CMUcam2 board. Make sure the serial jumper is in place when you
use this mode. The TTL connector can be used to talk to a microcontroller
without the use of a level shifting chip. The TTL pins output between 0 and 3.3
volts, but are 5 volt tolerant for input. Remove the Serial Jumper when you use
this mode.
