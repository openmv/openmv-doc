Frequently Asked Questions
==========================

Is the CMUcam3 completely open source and programmable?
-------------------------------------------------------

Yes, that's the point! You can use GCC to compile code and the board can be
flashed over any serial port. No need to buy a jtag dongle or any other
programming device. This web page provides all of the code, libraries,
schematics etc. for the CMUcam3. Click on the Browse Source button at the top of
this page to take a look at the source.

Can you develop on Windows, Linux and the Mac?
----------------------------------------------

Yes! Using Cygwin under Windows and your standard environment for Linux and Mac.
The serial command line downloader should work on the Mac once you find the name
of your serial port in the ``/dev/`` directory. For the Mac you need to compile
arm-gcc from source. Soon we will provide executables.

Is the CMUcam2 firmware for the CMUcam3 exactly the same?
---------------------------------------------------------

Not quite, but maybe in the future. We think we have implemented the most
commonly used features. You have the source so you can add any missing features
yourself.

Should I get a CMUcam, CMUcam2 or a CMUcam3?
--------------------------------------------

That depends. The CMUcam and CMUcam2 are designed as fully integrated sensor
sub-systems that you use as a black-box. The CMUcam3 can eventually be used in
the same way, however you may need to design your own functionality for it. The
easiest way to do this is to tailor existing CMUcam3 projects for your
application. The CMUcam3's major advantage is that it is open source and
programmable. So you can easily modify or write your own firmware to run on it.
As a black-box system, the CMUcam3 supports most but not all of the CMUcam2
functionality. We ported over the features that we saw people using most often.
Some of the CMUcam3's other functionality (like the face detector) requires
flashing the CMUcam with different firmware images. That being said, even the
CMUcam2 firmware emulation on the CMUcam3 has some extra features like jpeg
making it more powerful than the original CMUcam2. The CMUcam3 has a more
powerful processor and an SD slot for FLASH storage. The original CMUcam is your
best bet if cost is your main concern. See this
`webpage <http://www.cs.cmu.edu/~cmucam2/faq.html>`__ for a description of the
differences between the CMUcam2 and the original CMUcam.
