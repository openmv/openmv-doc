Frequently Asked Questions
==========================

What are the differences between the CMUcam1 and the CMUcam2?
-------------------------------------------------------------

Introduction
~~~~~~~~~~~~

The CMUcam2 includes all of the functionality of the CMUcam1 in an enhanced form
and a lot more. Below we briefly describe the new functionality and the
differences. You may also want to look at the answer to the question of how to
decide whether to purchase a CMUcam1 or CMUcam2.

Hardware Overview
~~~~~~~~~~~~~~~~~

There are two main hardware differences which are important, the CMUcam2 uses a
different processor than the CMUcam1 and the CMUcam2 incorporates a frame buffer
chip while the CMUcam1 does not.

The CMUcam2 uses the SX52 processor and the CMUcam1 uses the
:download:`SX28 processor <dl/SX-DDS-SX2028AC-16.pdf>`, both are from the SX
processor series from `Ubicom <http://www.ubicom.com/>`__. In both cases the
processor runs at 75 MHz so there is no difference in processor speed or
computational power. The advantages of the SX52 processor are that it has more
RAM (262 vs. 136 bytes), more ROM (4096 vs. 2048 words), and more I/O pins. More
RAM and ROM meant that we could write more complex code which allowed us to
incorporate more functionality in the CMUcam2. The larger number of I/O pins
meant that we had more pins left over for other functions -- like more servos,
more configuration jumpers, etc.

The big difference between the two systems is that the CMUcam2 includes the
:download:`AL422B <dl/AL422B.pdf>` frame buffer chip from
AverLogic while the CMUcam1 does not.
This allows the CMUcam2 hardware to quickly capture a single complete frame and
store it the frame buffer memory. This has a number of advantages:

* **More Complex Processing.** The CMUcam1 the processor had to process the
  pixel data stream on the fly as it is output by the camera module. This design
  helped reduce the complexity and cost of the system hardware. However, it
  limited the complexity of the processing because it had to be performed in
  real time between pixels or between image rows. Because the processor on the
  CMUcam2 accesses pixel data from the frame buffer at its own pace, it can
  perform more complex processing per pixel.

* **Faster Processing.** The flip side of not having to stay synchronized with
  the camera module pixel stream is that the processor does not have wait for
  the camera module when it needs pixel data. Eliminating this waiting time
  means that the CMUcam2 processor can actually process a frame faster than the
  CMUcam1 can even though the processor is not any more powerful.

* **Multiple Operations Per Frame.** Because the image stored in the frame
  buffer does not change, the CMUcam2 can perform multiple operations on a single
  frame. So for example, motion could be detected, region statistics could be
  computed, and multiple colors could be tracked all on a single frame.

* **Better Frame Dumps.** Because the CMUcam1 had to synchronize the transmitted
  frame dump data with the camera module data stream, it could only send one
  column of data per camera frame. This meant that different parts of the image
  were captured at different times, so quickly moving objects would be smeared
  across CMUcam1 frame dumps. Since the CMUcam2 transmits the image from the
  fixed data in the frame buffer this is no longer an issue.

* **Better Handling of Lower Baud Rates.** Having a frame buffer also means that
  the timing of the data transmitted by the CMUcam2 can be completely decoupled
  from the timing of the data read from the camera module. This means that
  CMUcam2 data from frame dumps and bitmap line modes do not change when the
  communications baud rate changes, the CMUcam2 will communicate the same frame
  or bitmap data to the host processor no matter the baud rate. However the
  number of frames processed per second may still change with slower baud rates
  because it still needs to eventually complete sending all the data from one
  frame before the following ones can be processed.

* **Better Camera Module Operation.** So that the processor in the CMUcam1 could
  remain synchronized with the data stream from the camera module, the camera
  module frame rate had to be slowed down to 17 fps. The frame buffer that the
  CMUcam2 uses allows us to operate the camera module at the full frame speed.
  One advantage of this is that the automatic exposure and white balance
  adjustment of the camera can operate more quickly because it can only make a
  single adjustment per frame and now there are more frames per second. The
  second advantage is that the black and white analog video output (which only
  works when the module is operating at the full frame rate) can be used while
  the CMUcam2 is processing image data which was not the case with the CMUcam1.

Functionality Overview
~~~~~~~~~~~~~~~~~~~~~~~

The CMUcam2 implements all of the functionality of the CMUcam1 and also adds a
lot of new functionality. The following is a summary.

* **Color Tracking.** The CMUcam2 implements color tracking just as the CMUcam1
  did. As in the CMUcam1, an optional bitmap line mode is implemented which
  transmits a bitmap of the tracked pixels. There are also some enhancements.
  There is a new optional line mode which provides statistics of tracked pixels
  for each row, including the mean, minimum and maximum positions of the tracked
  pixels. This is very useful for line following. There is also a new optional
  mode where the interpretation of tracking bounds can be inverted. In this mode
  pixels outside the tracking bounds are considered "good". This is useful for
  tracking an object against a homogeneous background -- think blue screen
  special effects. It is also useful for detecting edges when pixel differencing
  (described below) is enabled. The noise filtering option has also been enhanced
  to allow adjustment of the amount of filtering for noisy situations.

* **Image Statistics.** The CMUcam2 implements the computation of the mean and
  variation statistics of image regions just as the CMUcam1 did. As in the
  CMUcam1, an optional line mode is implemented which transmits the mean of each
  line of the image. There is a also a new enhanced line mode which optionally
  includes variation information on a line by line basis.

* **Motion Detection.** Completely new in the CMUcam2 are motion detection
  (frame differencing) commands. These commands can be used to instruct the
  CMUam2 to capture a low resolution version of the current image and
  continuously compare this to new incoming images. Packets from the CMUcam2
  report if any part of the image changes more than a specified amount, which
  would potentially indicate motion. These packets can describe the centroid and
  extent of the changed image blocks or provide a bitmap of which image blocks
  have changed. This mode can also be combined with pixel differencing
  (described below) to make motion detection more robust to changes in
  illumination.

* **Histogramming.** Completely new in the CMUcam2 are histogram computation
  commands. These commands can be used to capture a one dimensional histogram of
  a single color channel at a resolution of up to 28 bins. Histograms provide
  useful information which summarizes the appearance of an image. With additional
  programming on the host processor this information can be used to help in
  detecting obstacles, specific objects, or locations.

* **Image Windowing.** The CMUcam2 implements the ability to restrict processing
  to a small region (subwindow) of the full image just as the CMUcam1 did. In
  the CMUcam2 this function is even more useful because it can be used to closely
  examine sub-windows of a single image stored in the frame buffer. Also,
  reducing the vertical window size can be used to greatly increase the frames
  processed per second by greatly reducing the number of pixels which need to be
  processed by the CMUcam2.

* **Output Packet Customization.** The CMUcam2 implements much more flexible
  packet customization than the CMUcam1. There are commands that allow the user
  to customize each packet generated by each command to only return the values
  needed for a particular application. This can greatly decrease the amount of
  data transmitted to and processed by the host processor in many situations.

* **Pixel Differencing.** Completely new in the CMUcam2 is an optional pixel
  differencing mode. In pixel differencing mode pixels are pre-processed before
  they are passed on to the rest of the CMUcam2 code. This pre-processing step
  sends new pixel values to the rest of the code which are the difference between
  the current pixel value and the previous one. Basically what this does is
  filter out everything except for vertical edges in the image. This is a very
  powerful operation and with additional programming on the host processor, can
  be used to aid in obstacle detection and line following.

* **Down Sampling.** Completely new in the CMUcam2 is an optional down sampling
  mode. In down sampling mode the CMUcam2 software reduces the resolution of the
  camera image before processing it. The advantage of this is that there are
  many fewer pixels to process and transmit. Because it is done in software, down
  sampling results in only a very small increase in processing speed. The big
  benefit is in reducing the amount of transmitted data. In the case of a dumped
  image frame down sampling can easily reduce the data size and hence reduce the
  transmission time of by a factor of 2 or 4 or more. Similarly when bitmap line
  modes are used the size of the bitmap image can be greatly reduced, decreasing
  the amount of data that a host processor has to receive and process.

* **Servo Control.** The original CMUcam1 supported only a single servo and that
  servo would only operate properly at specific baud rates and when the CMUcam1
  was in streaming mode. The CMUcam2 supports up to five servos. The servo
  controller code in the CMUcam2 is implemented as a background process so the
  servo outputs always remain stable and it can be used as any other servo
  controller would be used. Additionally, the CMUcam2 can be configured to
  automatically control pan and tilt servos. In this mode the CMUcam2 will update
  the servo positions each time it is commanded to compute color tracking data.

* **Power Saving.** Completely new in the CMUcam2 are power saving modes. In some
  applications the CMUcam2 is not required to continuously process image data. In
  these cases the CMUcam2 can be commanded to go into a variety of power down (or
  sleep) modes. No tracking commands or servo control will happen when the
  CMUcam2 is in one of these modes. Sending a simple serial command wakes the
  camera back up in a few milliseconds.

What is the difference between using the OV6620 and the OV7620 module with the CMUcam2?
---------------------------------------------------------------------------------------

Introduction
~~~~~~~~~~~~

In terms of capabilities, the OV7620 sensor is a higher resolution sensor
(664x492 raw sensor locations) than the OV6620 sensor (356x292 raw sensor
locations). But this fact has very little to do with the issues which arise when
considering which of these sensors best matches your application of the CMUcam2.
Following are a list of considerations.

Resolution
~~~~~~~~~~

While it is true that the OV7620 sensor is a higher resolution sensor than the
OV6620, because of the fixed memory size of the frame buffer of the CMUcam2, the
CMUcam2 only supports a single resolution of 160x239 for the OV7620 sensor. The
CMUcam2 supports a low resolution mode of 88x143 and a high resolution mode of
176x255 for the OV6620 sensor. So using the OV6620 in high resolution mode one
can actually achieve higher resolution operation that the single resolution mode
available for the OV7620 sensor.

Frame Rate
~~~~~~~~~~

Another resolution related issue is maximum frame rate when continuously
processing a stream of images. The lower the resolution, the fewer the pixels
which need to be processed and the higher the achievable frame rate. Although an
increase in frame rate can be achieved by changing the down sampling rate and
the virtual window size, the actual number of pixels output by the sensor has a
much larger effect. Because of this, the CMUcam2 can achieve a much higher frame
rate when the OV6620 is operated in its low resolution mode than the single
resolution mode available for the OV7620.

Analog Video Output
~~~~~~~~~~~~~~~~~~~

Another difference between the two sensors is the format of the analog video
output of the two sensors. The OV6620 sensor outputs in analog PAL format and
the OV7620 sensor outputs in analog NTSC format. In both cases the output is in
black and white.

It is important to note that in most uses of the CMUcam2 the analog output will
not be used. In a typical application the results of processing the image or the
raw pixels are transmitted digitally via the serial port to the host computer or
microcontroller so this is not an issue. However, if live black and white video
is important, then you may want to take the format of the analog video output
into account.

Summary
~~~~~~~

Our recommendation is that the OV6620 module is the best choice for almost all
applications, especially considering its lower cost and the faster processing
time achievable with this module. In the rare applications where NTSC monochrome
analog video output is required you may want to consider the OV7620.

Are there any known issues with the current CMUcam2 firmware releases?
----------------------------------------------------------------------

Yes. In the 1.00 release the "RM" (Raw Mode) command did not work correctly. The
1.01 release fixes that issue.

The firmware in the CMUcam2 is upgradeable, but an SX-Key (or compatible)
programmer is needed to do so. The "hex" files for the ROM images are available
on the :doc:`downloads` page.
