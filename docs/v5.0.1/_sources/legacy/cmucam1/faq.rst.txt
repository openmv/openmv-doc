Frequently Asked Questions
==========================

General Questions
-----------------

What is unique about the CMUcam1?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Traditionally fast computers are needed to capture and process camera images. It
is also necessary to write the software to perform this processing. Because of
this it is difficult to use vision as a sensor in simple systems.

The CMUcam1 vision system uses a fast low cost microcontroller to handle all of
the high speed processing of the camera data and contains software to perform
simple vision tasks. Because the user can choose to output only low bandwidth
high level information from the vision system, like the red object is at position
X-Y, it is possible for a simple processor like a PIC microcontroller to read
this data and direct a small robot in tasks like chasing a colored ball. The
CMUcam1 vision system makes it possible to ignore the complexity of camera
interfacing and use vision just like any other sensor (i.e. sonar) often used in
robotic systems.

What is the CMUcam1's frame rate?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The fastest frame rate is 16.7 frames per second. This means CMUcam1 can tell
you the position of an object about 17 times per second. Using the serial
software protocol you can slow this down if desired.

What baud rates does the CMUcam1 support?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

As of the latest version of the firmware (v1.12) the CMUcam1 can communicate at
baud rates of 9600, 19200, 38400 or 115200. The baud rate is selected via jumper
settings on the board.

How do I upgrade my CMUcam1 firmware?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

If you are currently using firmware v1.11 there is no reason to upgrade unless
you need support for the lower baud rates. Version 1.11 supports 38400 and
115200 baud. Version 1.12 supports those baud rates and adds support for 9600
and 19200 baud. To upgrade your firmware you will need to reprogram the flash
memory in your processor chip. If you have a programmer you can download the
current version from our :doc:`downloads` page and re-flash the processor
yourself.

Does the CMUcam1 work outside?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The CMUcam1 works outside but not in direct sunshine. The CMOS camera we are
using does not have a high-quality IR filter, and so sunlight saturates the red
pixels and the image becomes, essentially, monochrome in direct sunlight. It is
possible to add an external filter to improve outdoor operation. We have a short
write up that shows you how illumination conditions affect the CMUcam1 that you
can download :download:`here <dl/lighting.pdf>`.

Can I write custom code for the CMUcam1?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Certainly. To do this, ask us for the firmware source code, order yourself a C
programming environment for the `Ubicom <http://www.ubicom.com>`__ chip and go
for it. When we send you the firmware source code we will also send you a summary
of how the code is structured and information about the programming environment
we use.

How much power does the CMUcam1 consume?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The complete system consumes about 200 milliamperes.

What is the CMUcam1's field of view?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

This depends on the lens that you fit to the CMOS camera. If you order the CMOS
camera as it is sold standard, you will end up with about a 25 degree field of
view, which is relatively narrow. You can custom-order wider angle lenses when
you order your CMOS camera, however.

What processor does the CMUcam1 use?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Our image processing code resides on a microcontroller chip from
`Ubicom <http://www.ubicom.com>`__ running at 75 MHz, the
:download:`SX28AC <dl/SX-DDS-SX2028AC-16.pdf>`. This chip reads all the pixels
from the CMOS camera via a parallel interface and does all the processing in
real time. It then communicates the results to your microcontroller or computer
via a serial port interface.

What CMOS camera does the CMUcam1 use?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

We use a CMOS camera which utilizes the `OmniVision <http://www.ovt.com>`__
:download:`OV6620 <dl/ov6620DSLF.pdf>` CMOS camera on a chip. We use a model
number C3088 CMOS camera board on which is mounted the sensor, a connector and a
lens.

Does the CMUcam1 work with other CMOS cameras?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

No. Currently the hardware and software system have been designed to work
specifically with the `OmniVision <http://www.ovt.com>`__
:download:`OV6620 <dl/ov6620DSLF.pdf>` CMOS camera. The system would need to be
completely redesigned to work with another camera.

Is there some place I can find answers to additional questions I have?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Yes. We have some info about more technical questions on this page.

Where can I find out more about computer vision in general?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The CMUcam1 performs the simple computer vision task it was designed to perform
in a small, inexpensive package. However, the general computer vision problem of
trying to recognize arbitrary objects under arbitrary conditions is still a very
active research topic and very far from being anywhere near a solved problem.

If you want to learn more about computer vision, you might want to try these
links:

* `The On-Line Compendium of Computer Vision <http://www.dai.ed.ac.uk/CVonline/>`__
* `The Computer Vision Home Page at CMU <http://www.cs.cmu.edu/~cil/vision.html>`__

Technical Questions
-------------------

What is the exact sequence of steps performed on power up by demo mode?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Here is the exact sequence that demo mode performs on power up:

1. Reset the camera.
2. Wait 5 seconds for the camera parameters auto adjustment to stabilize.
3. Send the camera register string: ``CR 18 32 19 32`` which selects YCrCb mode
   and turns off auto gain.
4. Execute the ``TW`` command.

After which, the camera will begin to drive a servo towards the middle mass of
the color detected by the ``TW`` command.

What is the exact sequence of steps performed by the "TW" command?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Here is the exact sequence that the ``TW`` command performs:

1. Shrink the window to 1/4 the size (in each dimension) of the current window
   to a new window centered at the current window center.
2. Call get mean.
3. Restore the window to the full image size.
4. Set the max and min value for each color channel to be the mean for that
   channel +/- 30.

After which, the camera will begin to stream Type C, M, or N packets.

Under what conditions does the tracking LED light up when auto mode is enabled?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The LED will light when the returned ``pixel_count >= 2``. The returned
``pixel_count = (actual_pixel_count + 4) / 8``.

If the CMOS camera has a resolution of 352 x 288 pixels, why is the CMUcam1 resolution only 80 x 143?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The issue here is how color digital cameras work. In all digital color cameras
(even the very expensive ones - except for some based on some
`very advanced technology <http://www.foveon.com>`__) you only get one color
channel measurement per pixel location, this is called mosaic filtering. Here is
a nice diagram which helps explain this:

.. image:: img/mosaic.png
   :alt: Mosaic
   :align: center

(Diagram courtesy of `Foveon, Inc. <http://www.foveon.com>`__)

So what you can see is that pixels can be thought of being arranged in groups of
fours, where there are two G measurements and one R and one B measurement per
group. If you discard one of the G measurements (which we do) you see that the
real resolution of a 352x288 camera is closer to 176x144. We run the camera in
half resolution mode which skips over every other 2x2 block horizontally which
gives you 88x144. Because of memory limitations in the processor we discard 8
columns horizontally and one row vertically, that contains a test pattern, which
gives you 80x143 as the final resolution.

Just FYI standard digital cameras use complex interpolation techniques to try to
fill in the missing color values at each pixel and give you something a little
closer to the full resolution of the sensor.

How can I focus the CMUcam1 accurately?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Of course, the best way to proceed with focusing is to take frame dumps using
the GUI. You may not have a computer handy, or you may be using a BotBall
CMUcam1, which doesn't have sufficient resolution at its hard-wired 9600 baud
rate for this to work well.

In that case, there are two alternatives. First, you can try counting threads.
The lens is not screwed fully in at peak focus. Rather, there is about a 1
millimeter gap of thread showing. In terms of number of threads, that is about 2
threads showing in the gap between the lens and the lens mount.

The second alternative relies on the idea that when an image is sharp, the darks
are darkest and the brights are brightest. In other words, when the contrast is
greatest. When the image becomes defocussed, then the extrema fade away to a more
uniform distribution of intensities. So, if you fire up streaming mode using, and
then call GM (Get Mean), you can focus in real time. Look at the red deviation.
As you focus sharply on a high-contrast object (such as a piece of paper with
lots of writing on it) at the desired distance, there will be a noticeable peak
in red deviation when most sharply focused. Note that this approach to focusing
requires you to have the camera and the target quite firmly planted as you turn
the lens.
