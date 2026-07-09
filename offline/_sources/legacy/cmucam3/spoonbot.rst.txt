Building a spoonBot
===================

SpoonBot is a simple table-top robot that you can build with your CMUcam3. It is
one of the cheapest and smallest vision based robots with local processing that
you can build in an afternoon. SpoonBot uses two continuous rotation servos to
move forward, backward and turn left or right. There is a mini-servo under
spoonBot that moves the spoon caster up and down giving spoonBot the ability to
pan and tilt.

This page shows how to assemble your own spoonBot. Once you have spoonBot built,
go to :doc:`spoonBot-demo <spoonbot-demo>` to setup the software. Click on image
thumbnails for higher resolution photos.

The step-by-step assembly photos referenced throughout this page (spoonBot parts,
spoonBot tools, and the numbered step photos step-1 through step-11) were not
preserved in the archive.

**Parts and Tools**

spoonBot requires the following parts:

* 2 Continuous Rotation (hacked) servos

  * `http://www.acroname.com/robotics/parts/R174-CONT-RO-SERVO.html <http://www.acroname.com/robotics/parts/R174-CONT-RO-SERVO.html>`__

    * 2 x $13

* 1 normal micro-servo

  * `http://www.acroname.com/robotics/parts/R281-MX-35.html <http://www.acroname.com/robotics/parts/R281-MX-35.html>`__

    * $25.50

* 1 AA battery pack

  * `http://www.acroname.com/robotics/parts/R122-4XAABATT-PACK.html <http://www.acroname.com/robotics/parts/R122-4XAABATT-PACK.html>`__

    * Includes header for easy power connection
    * $3.50

  * `RadioShack Pack <http://www.radioshack.com/product/index.jsp?productId=2062253&cp=2032058&f=Taxonomy%2FRSK%2F2032058&categoryId=2032058&kwCatId=2032058&kw=aa&parentPage=search>`__

    * Does not include header, but does include power switch
    * $1.89

* 1 plastic spoon
* 1 pair of chopsticks (or similar)
* 2 Wheels

  * `http://www.acroname.com/robotics/parts/R156-YELLOW-ORING-WHEEL.html <http://www.acroname.com/robotics/parts/R156-YELLOW-ORING-WHEEL.html>`__

    * 2 x $4

* 2 servo horns (if wheels need adaptation)
* 2 crimp terminals for batter pack (optional)
* 1 header for battery pack (optional)

We used the following tools:

* Hot Glue Gun
* Philips Screw Driver
* Cutters (for cutting chopsticks)
* Soldering Iron (if battery pack needs header)

**Step 1: Glue the Two Full Sized Servos Together**

In the picture, the servo wires have been shortened. You can do this if you like,
but it is just as easy to tie them up when you are done.

**Step 2: Glue the servos to the battery case**

Radioshack battery pack shown above. For Acroname battery pack, mount such that AA
batteries face up.

**Step 3: Attach Servo Horns as Wheel Base Connection**

This step may not be required if you have wheels that directly connect to servos.

**Step 4: Glue Wheels to Servo Horns**

Again, this may not be required if you have wheels with direct servo connections.

**Step 5: Glue Micro-Servo to Base**

**Step 6: Glue Micro-Servo Horn to Cut Spoon**

In this step, you must glue the micro-servo horn onto the spoon. Make sure you
note the orientation of the servo horn when connected to the spoon. This needs to
be able to connect to the servo with the smooth part of the spoon facing down.

First, tack the horn in place with a small amount of glue. Once it is secure,
liberally apply glue and let dry making a strong connection.

**Step 7: Calibrate Micro-Servo Position and Attach Spoon**

Before connecting the servo horn with the spoon to the micro-servo, it is
important to calibrate the servo position. This can be done by loading the CMUcam2
emulation firmware and then using the CMUcam3 Frame Grabber program. You can also
use the SV servo command from a terminal program. Set the servo to the most
extreme direction that would correspond to the spoon being placed in the lowest
position. For our servo, this was servo value 255. In this position, it should
not be possible for the spoon to push back against the base of the spoonBot.

Note, you may need to connect the external servo power jumper if it is not already
installed.

See :doc:`hardware-power <hardware-power>` for more details on servo power jumper.

See :doc:`hardware-servo <hardware-servo>` for information on connecting servos.
The black wire should connect to the ground pin.

**Step 8: Glue Two Chopstick Posts**

**Step 9: Trim Chopsticks and Glue on Top Crossbar**

**Step 10: Attach CMUcam3**

Liberally glue the CMUcam3 to the top chopstick bar. We used glue on both sides to
make sure it was secure.

**Step 11: Connect Power and Servo Wires**

* Connect the right wheel servo (as viewed from front) to Servo Port 0.
* Connect the left wheel servo to Servo Port 1.
* Connect the spoon actuation servo to Servo Port 2.
* See :doc:`hardware-servo <hardware-servo>` for servo port numbers.

Next step: :doc:`Run the spoonBot Firmware <spoonbot-demo>`

**Note: Unless you have the RadioShack battery pack with the off switch, remember
to unplug spoonBot when it is off. The servos will slowly drain the battery
otherwise.**
