Pixy (CMUcam5)
==============

.. image:: pixy-inhand.jpg
   :alt: Pixy (CMUcam5)
   :align: center

.. note::

   The Pixy site has moved to `pixycam.com <https://pixycam.com>`__,
   where Pixy and its successors are still supported. This page
   preserves the original CMUcam5 overview.

Pixy is a small, fast, easy-to-use, low-cost, readily-available
vision system:

* Learns to detect objects that you teach it
* Outputs what it detects 50 times per second
* Connects to Arduino with the included cable, and also works
  with Raspberry Pi, BeagleBone, and similar controllers
* All libraries for Arduino, Raspberry Pi, and so on are
  provided
* C/C++ and Python are supported
* Communicates via one of several interfaces: SPI, I2C, UART,
  USB, or analog/digital output
* Configuration utility runs on Windows, macOS, and Linux
* All software and firmware is open-source, GNU-licensed
* All hardware documentation, including schematics, bill of
  materials, PCB layout, and so on, is provided

How Pixy got started
--------------------

Pixy (CMUcam5) is a partnership between the Carnegie Mellon
Robotics Institute and Charmed Labs. Pixy comes from a long
line of CMUcams, but Pixy got its real start as a Kickstarter
campaign. It first started shipping in March of 2014, and it
quickly became one of the most popular vision systems ever
made. Pixy is funded exclusively through sales.

Vision as a sensor
------------------

If you want your robot to perform a task such as picking up an
object, chasing a ball, or locating a charging station, and
you want a single sensor to help accomplish all of these
tasks, then vision is your sensor. Vision (image) sensors are
useful because they are so flexible: with the right algorithm,
an image sensor can sense or detect practically anything.

But there are two drawbacks with image sensors. First, they
output lots of data -- dozens of megabytes per second -- and
second, processing this amount of data can overwhelm many
processors. And if the processor can keep up with the data,
much of its processing power won't be available for other
tasks.

Pixy addresses these problems by pairing a powerful dedicated
processor with the image sensor. Pixy processes images from
the image sensor and only sends the useful information (for
example, "purple dinosaur detected at x=54, y=103") to your
microcontroller, and it does this at frame rate (50 Hz).

.. image:: pixy-board.jpg
   :alt: Pixy (CMUcam5) board
   :align: center

Pixy is still an active product. Its current documentation,
software, and support live at `pixycam.com <https://pixycam.com>`__.
