Sensor buses
============

A camera sensor and the MCU it talks to exchange two
different kinds of data on two different buses.

Control bus
-----------

Every sensor setting lives in a register on the chip --
pixel format, frame size, exposure time, gain,
white-balance gains, auto-control targets, and so on. The
MCU reads and writes those registers across an
:doc:`I2C bus <../../hardware/i2c/i2c-basics>` (some
sensors use SPI instead). Two wires (SCL and SDA) connect
the MCU's I2C peripheral to the sensor's I2C interface,
and every configuration the user picks is translated by
the driver into one or more register writes on this bus.

The control bus runs at a relaxed speed -- 100 kHz or
400 kHz typically. Setting one register takes tens of
microseconds; reconfiguring the whole sensor (a reset, a
fresh frame size, a fresh pixel format) takes tens to
hundreds of milliseconds, mostly because the chip needs a
moment to bring the new mode up to a clean state after
each register write. None of that has to keep up with the
pixel stream.

Pixel data bus
--------------

The pixel data leaves the sensor on a separate, wider,
much faster bus. Two families dominate.

**Parallel** is the older of the two. It carries eight or
ten data lines for the pixel bits, plus a pixel clock
(PCLK), a line-valid signal (HSYNC), and a frame-valid
signal (VSYNC). On each clock edge one pixel byte appears
on the data lines; HSYNC and VSYNC tell the receiver
where each row and each frame start and stop. Parallel
buses are simple, but throughput is limited by how fast
the MCU's pin matrix can clock data in -- typically a 50
to 100 MHz pixel clock at the high end.

**MIPI CSI-2** -- the Mobile Industry Processor Interface
Camera Serial Interface, version 2 -- has largely replaced
parallel on new image sensors. It carries the pixels on
one or more differential lane pairs at hundreds of
megabits per second per pair, with a smaller pin count,
much higher bandwidth, and lower EMI. Parallel persists
mostly on legacy designs and on smaller, lower-rate parts
where its simplicity still pays off.

.. figure:: ../figures/sensor-buses.svg
   :alt: A diagram showing a sensor block on the left and
         an MCU block on the right. A bidirectional arrow
         between them is labelled "I2C (SCL, SDA)". A
         thicker arrow pointing from the sensor to the MCU
         is labelled "parallel or MIPI".

   The sensor and the MCU exchange control on a slow
   bidirectional I2C bus and pixel data on a wider, faster,
   one-way parallel or MIPI bus.

Whichever family the sensor uses, the MCU side has a
fixed-function peripheral that catches the incoming
pixels and writes them into a framebuffer in memory. The
Python code never drives this bus directly; it only reads
the framebuffer once that hardware has finished filling
it.
