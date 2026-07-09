CMUcam2
=======

The CMUcam2 is the successor to the popular :doc:`CMUcam1 <../cmucam1/wiki>`. It
was developed by `Anthony Rowe <http://www.ece.cmu.edu/~agr/>`__,
`Chuck Rosenberg <http://www.charlesrosenberg.com/>`__, and
`Illah Nourbakhsh <http://www.cs.cmu.edu/~illah/>`__.

Some capabilities (from the :doc:`CMUcam2 Website <../cmucam2/wiki>`):

* Track user defined color blobs at up to 50 frames per second (frame rate
  depends on resolution and window size settings)
* Track motion using frame differencing at 26 frames per second
* Find the centroid of any tracking data
* Gather mean color and variance data
* Gather a 28 bin histogram of each color channel
* Process horizontally edge filtered images
* Transfer a real-time binary bitmap of the tracked pixels in an image
* Arbitrary image windowing
* Image down sampling
* Adjust the camera's image properties
* Dump a raw image (single or multiple channels)
* Up to 176 x 255 resolution
* Supports baud rates of: 115,200 57,600 38,400 19,200 9,600 4,800 2,400 1,200
  BPS
* Control 5 servo outputs
* Slave parallel image processing mode off of a single camera bus
* Automatically use servos to do two axis color tracking
* B/W analog video output (PAL or NTSC, depending on camera module used)
* Flexible output packet customization
* Power down mode
* Multiple pass image processing on a buffered image
* Works with the newer OV7620 camera module
* Yes, it is backward compatible with your current OV6620 camera module!

The CMUcam2 is succeeded by the :doc:`CMUcam3 <wiki>`.

The CMUcam3 can emulate the CMUcam2. For more information about CMUcam2 emulation
see the :doc:`CMUcam2 Emulation <cmucam2-emulation>` page.
