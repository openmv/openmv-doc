OV9665 Color CMOS SXGA Sensor
=============================

Camera Interfacing
------------------

The camera module has 24 pins on its flat pack connector (FPC). Shown below is
the pin out for the camera module. Pin 1 is the right most pin on the FPC with
the camera module facing right-side up.

.. list-table::
   :header-rows: 1

   * - Pin
     - Signal
     - Pin
     - Signal
   * - 1
     - NC
     - 13
     - XCLK
   * - 2
     - AGND
     - 14
     - Y8
   * - 3
     - SIO_D
     - 15
     - DGND
   * - 4
     - AVDD
     - 16
     - Y7
   * - 5
     - SIO_C
     - 17
     - PCLK
   * - 6
     - RESET
     - 18
     - Y6
   * - 7
     - VSYNC
     - 19
     - Y2
   * - 8
     - PWDN
     - 20
     - Y5
   * - 9
     - HREF
     - 21
     - Y3
   * - 10
     - NC
     - 22
     - Y4
   * - 11
     - DVDD
     - 23
     - Y1
   * - 12
     - Y9
     - 24
     - Y0

Power Control
-------------

You need to supply 2.8V to 3.0V to the AVDD pin and 1.8V to 3.0V to the DVDD pin.
You should power the AVDD and DVDD pins using separate low-noise power supplies.
Additionally, the AGND and DGND pins should be separate for as long as possible
in your setup for good picture quality.

Pull the RESET pin low to reset the camera module.

Pull the PWDN pin high to power down the camera module while in power down mode.

Control Bus
-----------

The SIO_D and SIO_C pins are used to control the camera module. The SIO_D pin is
the control bus's data pin and the SIO_C pin is the control bus's clock pin. See
the `initialization`_ section for more details.

Data Bus
--------

The Y0 through Y9 pins on the camera module form a 10-bit data bus. For RGB565
and YUV422 mode Y0 and Y1 are unused. Y2 through Y9 are used to send an 8-bit
byte where Y2 is the LSB and Y9 is the MSB.

While the HREF pin is high, Y2 through Y9 are valid. On the rising edge of the
PCLK pin Y2 through Y9 should be sampled. Each pixel is transfered in 2 PCLK
pulses. In SXGA mode the PCLK pin will go high 2,560 times while the HREF pin is
high and the HREF pin will go high 1024 times. In VGA mode the PCLK pin will go
high 1,280 times while the HREF pin is high and the HREF pin will go high 480
times. The SXGA resolution is 1280x1024 pixels and the VGA resolution is 640x480
pixels.

The VSYNC pin will go high and then low to mark the beginning of each frame.

In RGB565 mode, the camera module will send [MSB {R4, R3, R2, R1, R0, G5, G4,
G3} LSB] every odd clock and [MSB {G2, G1, G0, B4, B3, B2, B1, B0} LSB] every
even clock for each pixel.

In YUV422 mode, the camera module will send 8-bit YUV data where U and V are
sent at half the bandwidth. The camera module sends Y0 on the first clock,
followed by U on the second clock, followed Y1 on the third clock, followed by V
on the fourth clock and then repeats the pattern. Y0, U, and V form pixel0 and
Y1, U, and V, form pixel1. Two pixels are sent every four clocks.

.. _initialization:

Camera Initialization
---------------------

To control the OV9665 camera module you must communicate with it using the
:download:`SCCB <dl/sccb.pdf>` protocol -- which is exactly the same as the I2C
protocol. The device slave
addresses are 0x60 for write and 0x61 for read. To initialize the camera you
need to write 0x80 to register 0x12 to reset the camera and then delay for a
second. After which you must send initialization register settings. Please note
that the camera module requires a 10 MHz to 24 MHz (typically 24 MHz) clock
input into its XCLK pin to operate.

SXGA Initialization
-------------------

To initialize the camera for SXGA mode send the following
:download:`register settings <dl/SXGA_Init.txt>`. To set the frame rate in SXGA
mode write the following values to register address 0x11: 0x80 for 15 FPS, 0x81
for 7.5 FPS, 0x82 for 5 FPS, 0x83 for 3.75 FPS, 0x84 for 3 FPS and etc. when
XCLK is driven at 24 MHz. *NOTE: The FPS value cannot be too low or the camera
will fail to operate correctly.*

.. math::

   \text{FPS} = \frac{15 \cdot (\text{XCLK}_\text{MHz} / 24)}{(\text{value} - \text{0x80}) + 1}

.. math::

   \text{PCLK Frequency} = \frac{\text{XCLK}_\text{MHz}}{(\text{value} - \text{0x80}) + 1}

VGA Initialization
------------------

To initialize the camera for VGA mode send the following
:download:`register settings <dl/VGA_Init.txt>`. To set the frame rate in VGA
mode write the following values to register address 0x11: 0x80 for 30 FPS, 0x81
for 15 FPS, 0x82 for 10 FPS, 0x83 for 7.5 FPS, 0x84 for 6 FPS, and etc. when
XCLK is driven at 24 MHz. *NOTE: The FPS value cannot be too low or the camera
will fail to operate correctly.*

.. math::

   \text{FPS} = \frac{30 \cdot (\text{XCLK}_\text{MHz} / 24)}{(\text{value} - \text{0x80}) + 1}

.. math::

   \text{PCLK Frequency} = \frac{\text{XCLK}_\text{MHz}}{(\text{value} - \text{0x80}) + 1}

Color Mode
----------

Once the camera is initialized to either SXGA or VGA mode, at a particular frame
rate, you must then setup the camera's color output format. You can use either
RGB565 or YUV422. Send :download:`these register settings <dl/RGB565_Init.txt>`
to enter RGB565 mode and :download:`these register settings <dl/YUV422_Init.txt>`
to enter YUV422 mode.
