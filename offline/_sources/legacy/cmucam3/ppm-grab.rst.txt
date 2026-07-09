ppm-grab
========

PPM-grab can be used to store raw images on the MMC card that can be used with the
:doc:`virtual-cam <virtual-cam>` for testing algorithms.

Setting Up PPM-grab:

* You will need the following:

  * CMUcam3, with power and a serial cable
  * MMC or SD card
  * MMC/SD card reader on your PC

* Format the Memory Card using the FAT filesystem

  * DO NOT USE FAT32 which is the Windows Default

* Flash the ppm-grab.hex firmware file onto the CMUcam

  * Go to the cc3/projects/ppm-grab directory
  * Type "make" to build the application

* Turn off your CMUcam3 and bring it to the area that you want to monitor
* Insert the MMC card and turn the CMUcam3 on

  * After 1 second, press the button on the CMUcam3 to take a picture
  * Make sure the led toggles after each press

    * if the led doesn't toggle, look at the serial output of the camera to see
      if an error is reported
