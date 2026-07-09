CMUcam2 Emulation
=================

The CMUcam2 has the following capabilities:

* Track user defined color blobs at up to 50 frames per second (frame rate
  depends on resolution and window size settings)
* Track motion using frame differencing at 26 frames per second
* Find the centroid of any tracking data
* Gather mean color and variance data
* Gather a 28 bin histogram of each color channel
* Process horizontally edge filtered images (not supported)
* Transfer a real-time binary bitmap of the tracked pixels in an image
* Arbitrary image windowing
* Image down sampling
* Adjust the camera's image properties
* Dump a raw image (single or multiple channels)
* Up to 176 x 255 resolution
* Supports baud rates of: 115,200 57,600 38,400 19,200 9,600 4,800 2,400 1,200
  BPS
* Control 5 servo outputs
* Slave parallel image processing mode off of a single camera bus (not supported)
* Automatically use servos to do two axis color tracking
* B/W analog video output (PAL or NTSC, depending on camera module used)
* Flexible output packet customization
* Power down mode
* Multiple pass image processing on a buffered image

Pre-compiled CMUcam2 Emulation Images
-------------------------------------

A pre-compiled CMUcam2 emulation image is available:
:download:`cmucam2_lpc2106-cmucam3.hex <dl/cmucam2_lpc2106-cmucam3.hex>` (CMUcam2
already compiled hex file).

The per-baud-rate firmware images (115,200 / 57,600 / 38,400 / 19,200 / 9,600 /
4,800 / 2,400 / 1,200 / 300 8N1), the servo-reverse and servo-normal images, and
the ``cmucam2.c`` emulation source file were attached to this page but were not
preserved in the archive.

There are several differences between the CMUcam2 emulation and the actual
CMUcam2. Below is a list of all CMUcam2 functionality with non-supported features
crossed off. Many crossed off features will be supported in the near future.

| BM Buffer Mode
| CR Camera Register
| CP Camera Power
| DC Difference Channel
| DS Down Sample
| FD Frame Difference
| FS Frame Stream (added r553)
| GB Get Button
| GH Get Histogram
| GI Get Aux IO inputs
| GM Get Mean
| GS Get Servo Positions
| GT Get Tracking Parameters
| GV Get Version
| GW Get Window
| HC Historgram Configure
| HD High Resolution Difference
| HR Hi-Res Mode
| HT Set Histogram Track (not supported)
| L0 Led Control
| LF Load Frame to Difference
| *LM Line Mode*
| MD Mask Difference (not supported)
| NF Noise Filter
| OM Output Packet Mask
| PD Pixel Difference (not supported)
| PF Packet Filter
| PM Poll Mode
| RF Read Frame into Buffer
| RM Raw Mode
| RS Reset
| SF Send Frame
| SM Servo Mask
| SO Servo Output
| SP Servo Parameters
| ST Set Track Command
| SV Servo Position
| TC Track Color
| TI Track Inverted
| TW Track Window
| UD Upload Difference buffer (not supported)
| VW Virtual Window

**The following commands will not be supported in the near future:**

| CT Set Camera Type
| DM Delay Mode
| L1 Led Control (look at SO instead)
| PS Packet Skip
| SD Sleep Deeply
| SL Sleep Command

CMUcam2 Emulation Differences
-----------------------------

* **Servo Input Range**

  * Servos are now 0-255 8-bit values

* **Jumpers**

  * Due to the lack of jumpers on the CMUcam3, baud rate and servo direction
    changes need to be done at compile time - these are controlled by #defines at
    the top of the cmucam.c source code

* **Set Input (SI** *pin* **) Command**

  * Sets the *pin* to be an input

* **Software Color Space (CS** *value* **) Command**

  * CS 0 sets the color space to the hardware default (RGB or YCrCb)
  * CS 1 does a software conversion to the HSV color space

    * Conversion assumes hardware is set to RGB for correct results
    * HSV space is an integer space where all values are scaled between 16 and 240

  * Note: This is only available in r504 and higher

* **Set Output can control the Blue and Orange LEDs**

  * Servos 2 and 3 will stop working
  * SO 2 1 -> Blue on
  * SO 2 0 -> Blue off
  * SO 3 1 -> Orange on
  * SO 3 0 -> Orange off

* **No Slave Mode**

  * It is possible, but we currently don't support it

* **Output Mask (OM)**

  * Only supports T and S packets (type 0 and 1)

* **Line Mode (LM)**

  * Only supports track color mode (LM 0 1)
  * Track color statistics added in r523 (LM 0 2)

* **Send JPEG (SJ)**

  * Sends a jpeg compressed frame, header and all

* **Demo Mode**

  * Since holding down the programming button puts the CMUcam3 into programming
    mode, you need to press the button half a second after startup to enter demo
    mode

* **Hi-Res Frame Difference**

  * This now works the same as low-res frame differencing, just at a higher
    resolution
