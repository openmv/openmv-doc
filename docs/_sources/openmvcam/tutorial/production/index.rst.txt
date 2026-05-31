Production
==========

A working script on the bench is the start, not the
end. A camera that ships in a product has to do its job
unattended, on battery, against a network the script
does not control, without the source code being
readable by whoever takes the enclosure apart. The
pages in this section cover the practical work between
*the demo runs* and *the device is out the door*.

The order is roughly the path of a product: pick a
battery that fits the duty cycle, freeze the
application into the firmware so it ships as one
binary, secure the network connections it makes, and --
when the stock firmware needs to change -- build,
flash, and debug the firmware itself.

.. toctree::
   :caption: Power and battery life
   :maxdepth: 1

   battery-life.rst

.. toctree::
   :caption: Shipping the application
   :maxdepth: 1

   freezing-scripts.rst

.. toctree::
   :caption: Working with TLS certificates
   :maxdepth: 1

   tls/index.rst

.. toctree::
   :caption: Custom firmware builds
   :maxdepth: 1

   firmware-development.rst
