Tips and Tricks
===============

Demo Mode
---------

Demo mode allows you to demo the CMUcam4 without a master processor. In demo
mode, the CMUcam4 executes the "TW" (Track Window) command and then drives two
standard hobby servos towards the object being tracked while at the same time
displaying the tracked object on a standard TV. Once the CMUcam4 enters demo mode
it will not exit demo mode until it is reset. Follow the steps below to enter
demo mode:

1. Press and hold the **reset button** on the CMUcam4
2. Press and hold the **user button** on the CMUcam4
3. Release the **reset button** (do not release the **user button**)
4. Wait until the red auxiliary LED turns on (**2 seconds**)
5. Wait until the red auxiliary LED starts blinking at **10 Hz** and then release
   the **user button**

   * The TV should turn on (you should see a splash screen displayed on the TV)
     if the CMUcam4 is connected to a TV

6. The CMUcam4 will now adjust to the lighting conditions for the next
   **5 seconds**

   * Do not place the object you want to track in front of the CMUcam4 for the
     next **5 seconds**

7. Wait until the red auxiliary LED stops blinking at **10 Hz**

   * The CMUcam4 is now done adjusting to lighting conditions
   * The pan and tilt servo pins should output **1500 μs** pulses at **50 Hz**

8. Place the object you want to track in front of the CMUcam4 and press the
   **user button**

   * If the red auxiliary LED begins blinking at **10 Hz** examine the
     **OV9665** camera module connection

     * The **OV9665** camera module may be damaged and most likely needs to be
       replaced

9. You should now see the tracked object (or similar) displayed on the TV if the
   CMUcam4 is connected to a TV

   * The pan and tilt servos, if connected, will also try to drive the camera
     towards the tracked object

10. Please try this procedure with different objects in different environments to
    see what works the best
11. The CMUcam4 is now running in demo mode

Press the **reset button** to exit demo mode.

For non-reversed operation of the pan servo, pulse lengths lower than 1500 µs
must move the camera module's X position to the right (from the camera module's
point-of-view) and pulse lengths higher than 1500 µs must move the camera
module's X position to the left (from the camera module's point-of-view).

For non-reversed operation of the tilt servo, pulse lengths lower than 1500 µs
must move the camera module's Y position down (from the camera module's
point-of-view) and pulse lengths higher than 1500 µs must move the camera
module's Y position up (from the camera module's point-of-view).

Halt Mode
---------

Halt mode allows you to halt the CMUcam4 while still connected to an Arduino. In
halt mode, the CMUcam4 draws very little power and does not prevent an Arduino
from being programmed by blocking the Arduino's serial port. Halt mode is only
necessary if the CMUcam4 interferes with the Arduino programming process. If it
does not then halt mode is unnecessary - this is usually the case. Once the
CMUcam4 enters halt mode it will not exit halt mode until it is reset. Follow the
steps below to enter halt mode:

1. Press and hold the **reset button** on the CMUcam4
2. Press and hold the **user button** on the CMUcam4
3. Release the **reset button** (do not release the **user button**)
4. Wait until the red auxiliary LED turns on (**2 seconds**)
5. Release the **user button**
6. The CMUcam4 is now halted indefinitely

Press the **reset button** to exit halt mode.

Notes on Better Tracking
------------------------

Better Tracking with Auto-gain and White Balance
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Auto-gain is an internal control that adjusts the brightness level of the image
to best suit the environment. It attempts to normalize the lights and darks in
the image so that they approximate the overall brightness of a hand adjusted
image. This process iterates over many frames as the camera automatically adjusts
its brightness levels. If for example a light is turned on and the environment
gets brighter, the camera will try and adjust the brightness to dim the overall
image.

White balance on the other hand attempts to correct the camera's color gains. The
ambient light in your image may not be pure white. In this case, the camera will
see colors differently. The camera begins with an initial guess of how much gain
to give each color channel. If active, white balance will adjust these gains on a
frame-by-frame basis so that the average color in the image approaches a gray
color. Empirically, this "gray world" method has been found to work relatively
well. The problem with gray world white balance is that if a solid color fills
the camera's view, the white balance will slowly set the gains so that the color
appears to be gray and not its true color. Then when the solid color is removed,
the image will have undesirable color gains until it re-establishes its gray
average.

When tracking colors, like in demo mode, you may wish to allow auto-gain and
white balance to run for a short period and then shut them off. While on for a
period of about 5 seconds, the camera can set its brightness gain and color gains
to what it sees as fit. Then turning them off will stop the camera from
unnecessarily changing its settings due to an object being held close to the
lens, shadows, or etc. If auto-gain and white balance were not disabled and the
camera changed its settings for the RGB or YCbCr values, then the new measured
values may fall outside the originally selected color tracking thresholds.

*The camera module requires auto-gain to be enabled to utilize white balance.*

YUV (YCbCr) Color Space
~~~~~~~~~~~~~~~~~~~~~~~~

YCbCr is a different color space definition from the more commonly known RGB
space. In YCbCr the illumination data is stored in a separate channel. Because of
this property, in YCbCr mode the camera may be more resistant to changes in
illumination. Because it is a different color space, images in YCbCr do not look
like standard RGB images when directly mapped by a frame dump program. The RGB
channels map to CrYCb. So in YCbCr mode, the value returned as the red parameter
is actually Cr, the green parameter is Y, and the blue parameter is Cb. So if you
wish to track a red object, you need to look at a dumped frame to see what that
object's colors map to in YCbCr. It should then be possible to find the Cb and Cr
bounds while giving a very relaxed Y bound showing that illumination is not very
important. When using YCbCr, make sure you take into account that in terms of all
CMUcam4 I/O, Red maps to Cr, Green to Y, and Blue to Cb.

*Notice that the RGB channels map to give you CrYCb, not YCbCr.*

About the Camera Module
-----------------------

From power up, the camera can take up to 5 seconds to automatically adjust to the
light. Drastic changes in the environment, such as lights being turned on and
off, can induce a similar readjustment time. When using the camera outside, due
to the sun's powerful IR emissions, even on relatively cloudy days, it will
probably be necessary to use either an IR filter or a neutral density camera
filter to decrease the ambient light level.

The functions provided by the camera board are meant to give the user a toolbox
of color vision functions. Actual applications may greatly vary and are left up
to the imagination of the user. The ability to change the viewable window, grab
color and light statistics, and track colors can be interwoven by the host
processor to create higher level functionality.
