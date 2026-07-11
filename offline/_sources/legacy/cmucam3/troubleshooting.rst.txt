Troubleshooting
===============

If the information below does not help, please register and post on our
discussion forum. For software bugs, make sure to check out the
:doc:`software-problems` page to see if the problem is already known and fixed in
the latest source tree. For any hardware issues check the
:doc:`hardware-problems` page.

**My flash download fails after it has started downloading**

* On some older computers we have noticed that you need to lower the baudrate to
  make downloading more reliable.

**Make - Command not found**

* This happens if the program "make" was not installed. When you install Cygwin,
  make sure to install all programs included in the local package.

**GCC - Command not found**

* The virtual-cam hal requires gcc for your local machine (opposed to the
  cmucam). If you installed cygwin, make sure you installed gcc-core. In linux,
  make sure you have a working version of gcc installed.

**My SD/MMC card doesn't work**

* SD/MMC cards differ based on brand. It is possible that your brand doesn't work
  with the CMUcam3. Please check (and update) the :doc:`MMC card <mmc>` page. It
  is also possible that your card has a corrupt filesystem because it was reset
  during a transaction. In this case, try reformating your card and check to make
  sure the contacts on your board and card look clean. Be sure you have the latest
  CC3 code. The early release did not work with as many cards as the current
  version.

**Why does the camera freeze when I change properties while grabbing images in a
loop with the CMUcam3 Frame Grabber?**

* Unfortunately, the CMUcam3 Frame Grabber isn't smart enough to really keep
  track of what you are doing. So if you are looping images and you change the
  resolution to something larger, then it may send the next "Grab Frame" command
  before the high resolution image was done transfering. After this happens a few
  times, the Frame Grabber gets out of sync with the camera and the serial times
  out. Typically if you press "Stop" before changing parameters, and make sure
  that you set the "Refresh Interval" to a larger value for high resolution
  images, then you will not get communication or timeout errors.

**Why can't I grab frames in a loop with high resolution images using the CMUcam3
Frame Grabber?**

* This is the same problem as described by the previous question. If the "Refresh
  Interval" is too small, then the camera will request images faster than it can
  produce them.

**When I compile for the first time I get an error that says:**

::

   error: unwind-arm.c(.text+0x7e4)L: undefined reference to "exidx_start"

* This is due to the updated Code Sourcery compiler having problems with the
  older versions of the CC3 source tree. The latest CC3 source tree should work
  correctly. Make sure to do an "svn update" and install the latest Code Sourcery
  compiler.
