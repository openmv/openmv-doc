Minicom
=======

The first time you open minicom, open it as root, set your port settings and
save as setup default.

* ``minicom -s``
* type A and set the path (for example: ``/dev/ttyUSB0`` or ``/dev/ttyS0``)
* next, set the baudrate to 115200 8N1 with no Hardware / Software Flow Control
* "save setup as dfl" to save as default

In the future, start minicom using

.. code-block:: text

   minicom -m

Now you can type:

* alt-q to quit
* alt-o for options (change the port etc)
* alt-e for local echo
* alt-a to append line feed
