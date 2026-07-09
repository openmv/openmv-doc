Troubleshooting
===============

In Demo Mode the power light, auxiliary light, and TV turn on for a second and then everything stops
----------------------------------------------------------------------------------------------------

When both the CMUcam4 and pan and/or tilt servos are active, the power required
is greater. Try using a battery or voltage source rated at a higher current.

The power LED does not glow or glows dimly
------------------------------------------

The board either has a fault, or your power supply is not generating enough
power. The power supply should be capable of delivering at least 250 mA at
between 4 volts to 9 volts DC. Check the power supply and look over all of the
wire connections. Try unplugging all of the wires except for the power wires and
turn the CMUcam4 on again.

I get garbage output from the camera
------------------------------------

Try turning the camera off and unplugging it for 10 seconds. Then plug it back in
and try again.

I get wavy lines in my image or a distorted black and white image when I call "DF" (Dump Frame)
-----------------------------------------------------------------------------------------------

This is most likely due to power. Make sure that you have a high enough voltage
and that you are getting a clean signal. Running the camera off of fresh
batteries (not an AC adapter) is a good way to test if this is the problem. The
camera module could also possibly be damaged.

My processor can not keep up with the serial data stream
--------------------------------------------------------

Try running the camera in poll mode using the "PM" (Poll Mode) command and
setting a delay mode value using the "DM" (Delay Mode) command.

I don't seem to get any serial data
-----------------------------------

Make sure that the serial cable is attached to the CMUcam4 correctly. If in
doubt, try reversing it.

I see the CMUcam4 startup message, but, then nothing happens
------------------------------------------------------------

Check to make sure the transmit line on your serial cable is connected correctly.

My microSD card doesn't work
----------------------------

MicroSD cards differ based on brand. It is possible that your brand doesn't work
with the CMUcam4. It is also possible that your card has a corrupt file system.
In this case, try reformatting your card and check to make sure the contacts on
your board and card look clean.
