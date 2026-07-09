CMUcam3 Frame Grabber
=====================

The CMUcam3 Frame Grabber is a simple utility that can be used to test your
CMUcam3. Its primary purpose is to act as a terminal program similar to
HyperTerminal or Minicom. It also allows you to view jpeg images returned from
the camera. You need run the :doc:`CMUcam2 Emulation <cmucam2-emulation>`
firmware on the camera to use this program. The Frame Grabber requires that you
install .NET version 2.0 or later which can be found on our :doc:`software
<software>` page. Unfortunately, the CMUcam3 Frame Grabber only works in Windows.
The source can be found in the tools directory (called cc3_image_viewer). For
Linux or Mac, please try using the :doc:`CMUcam2GUI <../cmucam2/wiki>`.

To start the application:

* Double click on CMUcam3 Frame Grabber
* Select the correct COM port from the "Available COM Ports" drop down menu
* Click the "Connect" button
* Power on your CMUcam3 running the CMUcam2 Emulation Firmware (reboot if it is
  already on)
* You should see text appear in the "Terminal Console" window
* Press "Grab Image" to take a picture
* You should see something like what is show below

The main Frame Grabber screenshot (``frame-grab.png``) was not preserved in the
archive.

Here is a description of the fields on the "Main" tab of the interface:

* **Available COM Ports**

  * This shows a list of serial ports that Windows recognizes

* **Baud Rate**

  * This allows you to change the baud rate if you want to use this program as a
    terminal client

* **Timeout**

  * This sets the timeout for any serial replies that the program might be
    waiting on

    * This usually does not need to be changed

* **Connect**

  * Opens a serial connection

* **Disconnect**

  * Closes the serial connection

* **Send**

  * This button will transmit any text that you typed in the text box located to
    the left of the button
  * The text box automatically adds a return character, so just clicking "Send"
    should get you an ACK response from the CMUcam2
  * By default the focus is on the input text box, so you can just type and press
    return to send data

* **CIF / QCIF**

  * These buttons set the resolution of the image being displayed
  * By default the CMUcam3 will send a low-res image that is scaled to fill the
    full window

* **Grab Image**

  * This sends the "SJ" (Send JPEG) command to the CMUcam3 and displays the result

* **Loop**

  * This check box causes the client to automatically press "Grab Frame" every
    "Refresh Interval" milliseconds
  * If the CMUcam3 can not produce an image in the time specified, the program
    will timeout with an error

    * If this happens, increase the Refresh Interval, or decrease the image
      resolution

* **Refresh Interval**

  * This parameter sets how often the "Grab Image" command is sent when "Loop" is
    checked

* **Stop**

  * This stops the looped images from being grabbed

The options screenshot (``options.png``) was not preserved in the archive.

The "Settings" tab allows you to set a few common CMUcam3 features. Each button
that you press is simply transmitting the corresponding CMUcam2 commands over the
serial port.

Here is a description of the fields on the "Setting" tab of the interface:

* **Low Resolution / High Resolution**

  * These buttons switch between High Resolution CIF (352x288) or Low Resolution
    QCIF (176x144)
  * This corresponds to the "HR 1" and "HR 0" serial commands

* **RGB / YCrCb**

  * This selects the camera's native pixel mode to be either RGB or YCrCb
  * This corresponds to the "CR 18 44" or "CR 18 36" CMUcam2 commands

* **Down Sample**

  * This sets the firmware based down sampling amount
  * This corresponds to "DS X Y" where X and Y are the values set in each
    selection box

* **Window**

  * This set the virtual window parameters for the camera
  * This corresponds to the "VW x0 y0 x1 y1" CMUcam2 command

* **Servo Controller**

  * This allows you to set the servo position of the 4 CMUcam3 servo ports
  * This will cause any servos connected to the CMUcam3 to move
  * This corresponds to the "SV" CMUcam2 command

The Get Mean sample screenshot (``gm.png``) was not preserved in the archive.

You can send any CMUcam2 command using the "Send" button and the text input box.
For example, in the above image we sent "GM" (Get Mean) which returns the mean
color of the image. To stop the streaming, simply click "Send" or press return.
This program does not visualize most of the CMUcam2 commands. For visualization
try using the :doc:`CMUcam2GUI <../cmucam2/wiki>` java program.

Troubleshooting
===============

**Why does the camera freeze when I change properties while grabbing images in a
loop?**

* Unfortunately, the CMUcam3 Frame Grabber isn't smart enough to really keep
  track of what you are doing. So if you are looping images and you change the
  resolution to something larger, then it may send the next "Grab Frame" command
  before the high resolution image was done transferring. After this happens a
  few times, the Frame Grabber gets out of sync with the camera and the serial
  times out. Typically if you press "Stop" before changing parameters, and make
  sure that you set the "Refresh Interval" to a larger value for high resolution
  images, then you will not get communication or timeout errors.

**Why can't I loop with high resolution images?**

* This is the same problem as described by the previous question. If the "Refresh
  Interval" is too small, then the camera will request images faster than it can
  produce them.
