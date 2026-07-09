Security-Cam
============

Security-cam continuously compares the previous image and the current image. If
an images changes by more than a preset threshold, the image is saved as a jpeg
to the :doc:`MMC card <mmc>`. This is a great project to leave somewhere for a
long time in hopes of finding an interesting surprise.

The release version of security-cam had a :doc:`bug <software-problems>` that has
since been fixed. Attached below is an updated firmware image and a replacement
main.c file with the fix. The fix was committed into subversion at r503.

**Setting Up Security Cam**

* You will need the following:

  * CMUcam3, with power and a serial cable
  * :doc:`MMC or SD card <mmc>`
  * MMC/SD card reader on your PC

* Format the Memory Card using the **FAT filesystem**

  * DO NOT USE FAT32 which is the Windows Default

* Flash the security-cam.hex firmware file onto the CMUcam
* Turn off your CMUcam3 and bring it to the area that you want to monitor
* Insert the MMC card and turn the CMUcam3 on

  * Make sure you see the red led blink if there is motion in front of the camera

The updated ``security-cam_lpc2106-cmucam3.hex`` firmware image and the updated
``main.c`` source file with the rev 503 bug fix were attached to this page but
were not preserved in the archive.
