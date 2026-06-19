OpenMV Arduino RPC Library
==========================

The `openmv-arduino-rpc
<https://github.com/openmv/openmv-arduino-rpc>`__
library is the Arduino-side counterpart to the cam's
:mod:`rpc` module. The cam registers Python callables;
the Arduino calls them as if they were local functions,
over UART, SPI, I2C, or CAN. No PC sits in the middle.

.. image:: figures/transports.svg
   :alt: An Arduino board on the left and an OpenMV cam
         on the right, connected by four labelled
         transport lines -- UART (two wires), SPI (four
         wires), I2C (two wires), and CAN (two wires) --
         showing the wire-level pairings the Arduino
         RPC library can drive.
   :align: center

The pattern is symmetric. The Arduino sketch picks the
transport class that matches the wire, calls a function
on the cam by name, and gets the return value back. The
cam side mirrors it: register Python callables, run the
library's polling loop. Framing, fragmentation, and
retries on a noisy bus are handled by both sides
underneath, so application code sees just "call a
function on the other board, get a result back."

The repo's `examples
<https://github.com/openmv/openmv-arduino-rpc/tree/master/examples>`__
cover the two shapes most projects need: short
remote-control calls (read a sensor, drive a pin, run a
detector and read the result back) and JPEG image
streaming from the cam to the Arduino for forwarding
onward. Paired cam-side scripts ship in the openmv
tree under
`08-RPC-Library/
<https://github.com/openmv/openmv/tree/master/scripts/examples/08-RPC-Library>`__.

The repo README covers per-transport wiring; the
:doc:`/library/omv.rpc` reference covers the cam-side
API in full.
