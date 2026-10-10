Testing a spoonBot
==================

spoonBot is a simple differential drive robot with a spoon connected to a servo
that allows it to pan and tilt. See the
:doc:`spoonBot-Construction <spoonbot>` page for information about building
spoonBot. The sample program that comes with the latest cc3 distribution contains
sample code demonstrating how to move spoonBot as well as run spoonBot Demo mode.
spoonBot Demo mode is similar to the CMUcam2 demo mode only it uses spoonBot to
pan and tilt.

Calibrating spoonBot
--------------------

Before using spoonBot, you need to calibrate your servo settings. This is done by
setting the following data structure at the top of main:

.. code-block:: c

    // SpoonBot Calibration Points
     //   Assume Left = Servo 0
     //   Assume Right = Servo 1
     //   Assume Spoon = Servo 2
     my_cal.left_mid = 71;
     my_cal.right_mid = 77;
     my_cal.spoon_down = 100;
     my_cal.spoon_mid = 202;
     my_cal.spoon_up = 255;
     my_cal.left_dir = 1;
     my_cal.right_dir = -1;
     my_cal.spoon_dir = 1;
     // Set the calibration points
     spoonBot_calibrate (my_cal);

* Flash the cmucam2 emulation firmware onto the camera
* Open either the CMUcam3 Frame Grabber or a Terminal Program

  * Using the Frame Grabber, go to the "Settings" panel and drag the servo bars
    to change values
  * In a terminal, type "sv <servo-id> <servo-value>" to set the servos for
    example:

    .. code-block:: text

        :sv 0 77
        ACK

* Find the middle position of Servo's 0 and 1 by adjusting them until the wheels
  stop

  * *my_cal.left_mid* = <value from servo 0>
  * *my_cal.righ_mid* = <value from servo 1>

* Now you need to find the sign of the directions

  * Looking at spoonBot from the back (spoon towards you) try lowering the servo 0
    number which should be the left wheel

    * if the servo spins clockwise / backwards (toward you) then *left_dir* should
      be set to 1
    * if the servo spins counter clockwise, *left_dir* should be set to -1

  * Repeat for servo 1 (which should be the right wheel from spoonBot's point of
    view)

    * if the servo spins clockwise / backwards (toward you) then *right_dir*
      should be set to 1
    * if the servo spins counter clockwise, *right_dir* should be set to -1

  * Usually, one servo should be set to negative!

* Now find the Min, Middle and Max spoon positions by adjusting Servo 2

  * Min should be the smallest value that pushes the spoon down and hence tilts
    spoonBot forward

    * Set *spoon_down* accordingly

  * Max is usually 255 and should position spoonBot looking as far up as possible

    * Set *spoon_up* accordingly

  * Middle is the value that makes the servo level

    * Set *spoon_mid* accordingly

  * If Min and Max appear to be reversed, change *spoon_dir* to -1

Once the calibration is done, recompile the project and FLASH the CMUcam3.
spoonBot will first go through a sequence of scripted motions to make sure the
servos are setup correctly. Then spoonBot will wait for a button press to begin
tracking a color. Text is displayed over the serial port notifying you of the
various stages of operation.

The scripted motion should be as follows:

* Sit Still
* Look Down
* Look Up
* Back to Middle Position
* Rotate Clockwise (looking from above)
* Rotate Counter-Clockwise
* Red-Led off while camera gets ready
* Red-Led turns on when ready to track

If this looks correct, then try holding a brightly colored object a few inches in
front of the camera and then press the button. As you pull the object away,
spoonBot should rotate towards it. Use brightly colored objects that are as
uniform in color as possible. An object like a bright red cloth would work well
since it reflects very little light (other than the pure red). Make sure there is
enough lighting in the room. Try grabbing a frame to see what the conditions look
like.

**Note: If you wish to disable servos without unplugging them, disconnect the
servo-power-jumper.**
