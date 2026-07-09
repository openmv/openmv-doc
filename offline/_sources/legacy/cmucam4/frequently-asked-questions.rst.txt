Frequently Asked Questions
==========================

What is unique about the CMUcam4?
---------------------------------

Traditionally fast computers are needed to capture and process camera images. It
is also necessary to write the software to perform this processing. Because of
this it is difficult to use vision as a sensor in simple systems.

The CMUcam4 vision system uses a fast low cost microcontroller to handle all of
the high speed processing of the camera data and contains software to perform
simple vision tasks. Because the user can choose to output only low bandwidth
high level information from the vision system, like the red object is at position
X-Y, it is possible for a simple processor like a Arduino or BASIC Stamp 2
microcontroller to read this data and direct a small robot in tasks like chasing
a colored ball. The CMUcam4 vision system makes it possible to ignore the
complexity of camera interfacing and use vision just like any other sensor (i.e.
sonar) often used in robotic systems.

Additionally, with new TV output functionality, you can see what the CMUcam4 sees
on the TV to verify that everything is working!

What is the CMUcam4's frame rate?
---------------------------------

The frame rate is 30 frames per second. This means CMUcam4 can tell you the
position of an object 30 times per second. Using the serial software protocol you
can slow this down if desired.

What are the dimensions of the CMUcam4?
---------------------------------------

The CMUcam4 is about 52.25 mm (about 2.05 inches) in length from the left side of
the board where the RCA jack connector is to the right side of the board where
the microSD card connector is, 53.50 mm (about 2.10 inches) in width from the top
of the board where the Arduino pins are to the bottom of the board where the
Arduino pins are, and about 13 mm (about 0.51 inches) in height from the bottom
of the PCB to the top of the RCA jack (the tallest component on the board).

How much does the CMUcam4 weigh?
--------------------------------

The CMUcam4 weighs about 20 grams (about 0.7 ounces).

What baud rates does the CMUcam4 support?
-----------------------------------------

The CMUcam4 can communicate at any baud rate selected via the serial software
protocol. The default baud rate after the CMUcam4 resets is 19,200 bits per
second.

How do I upgrade my CMUcam4 firmware?
-------------------------------------

Please see the :doc:`firmware <firmware-source-code-and-binaries>` wiki page.

Does the CMUcam4 work outside?
------------------------------

The CMUcam4 has an IR filter. Depending on how bright it is outside you may wish
to supply the CMUcam4 with an additional IR filter (like a lens from a pair of
sunglasses) for your outdoor application.

Can I write custom code for the CMUcam4?
----------------------------------------

Please see the :doc:`firmware <firmware-source-code-and-binaries>` wiki page.

How much power does the CMUcam4 consume?
----------------------------------------

The complete system consumes about 100 milliamperes.

What is the CMUcam4's field of view?
------------------------------------

About a 25 degree field of view, which is relatively narrow.

What processor does the CMUcam4 use?
------------------------------------

Please see the :doc:`firmware <firmware-source-code-and-binaries>` wiki page.

What CMOS camera does the CMUcam4 use?
--------------------------------------

Please see the :doc:`firmware <firmware-source-code-and-binaries>` wiki page.

Does the CMUcam4 work with other CMOS cameras?
----------------------------------------------

No. Currently the hardware and software system have been designed to work
specifically with the `OmniVision <http://www.ovt.com/>`__ OV9665 CMOS camera.
The system would need to be completely redesigned to work with another camera.

Where can I find out more about computer vision in general?
-----------------------------------------------------------

The CMUcam4 performs the simple computer vision task it was designed to perform
in a small, inexpensive package. However, the general computer vision problem of
trying to recognize arbitrary objects under arbitrary conditions is still a very
active research topic and very far from being anywhere near a solved problem.

If you want to learn more about computer vision, you might want to try these
links:

* `The On-Line Compendium of Computer Vision <http://www.dai.ed.ac.uk/CVonline/>`__
* `The Computer Vision Home Page at CMU <http://www.cs.cmu.edu/~cil/vision.html>`__

What is the exact sequence of steps performed on power up by demo mode?
-----------------------------------------------------------------------

This is the exact sequence that demo mode performs on power up:

1. Reset the camera.
2. Wait 5 seconds for the camera parameters auto adjustment to stabilize.
3. Select YCbCr mode and turn off auto gain and white balance.
4. Execute the "TW" (Track Window) command.

After which, the camera will begin to drive servos towards the centroid of the
color detected by the "TW" (Track Window) command.

What is the exact sequence of steps performed by the "TW" (Track Window) command?
---------------------------------------------------------------------------------

This is the exact sequence of steps that the "TW" (Track Window) command
performs:

1. Shrink the window to 1/4 the size (in each dimension) of the current window to
   a new window centered at the current window center.
2. Get all the channel means.
3. Restore the window to the full image size.
4. Set the max and min value for each color channel to be the mean for that
   channel +/- the user supplied threshold for each channel.

After which, the camera will begin to stream Type F, S, and/or T packets.
