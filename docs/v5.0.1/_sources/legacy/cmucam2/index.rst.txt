CMUcam2
=======

.. |c2a| image:: cmucam2-a.jpg
   :alt: CMUcam2
.. |c2b| image:: cmucam2-b.jpg
   :alt: CMUcam2 board

.. container:: legacy-center

   |c2b| |c2a|

Check out the :doc:`downloads <downloads>` page for links to a
CMUcam2 demo video as well as the manual and graphical user
interface. For more information see the :doc:`wiki <wiki>`.

The CMUcam2 has the following capabilities:

* Track user defined color blobs at up to 50 frames per second
  (the frame rate depends on resolution and window size
  settings)
* Track motion using frame differencing at 26 frames per second
* Find the centroid of any tracking data
* Gather mean color and variance data
* Gather a 28 bin histogram of each color channel
* Process horizontally edge filtered images
* Transfer a real-time binary bitmap of the tracked pixels in
  an image
* Arbitrary image windowing
* Image down sampling
* Adjust the camera's image properties
* Dump a raw image (single or multiple channels)
* Up to 176 x 255 resolution
* Supports baud rates of: 115,200 57,600 38,400 19,200 9,600
  4,800 2,400 1,200
* Control 5 servo outputs
* Slave parallel image processing mode off of a single camera
  bus
* Automatically use servos to do two axis color tracking
* B/W analog video output (NTSC or PAL, depending on camera
  module used)
* Flexible output packet customization
* Power down mode
* Multiple pass image processing on a buffered image
* Works with the newer OV7620 camera module
* Backward compatible with the OV6620 camera module

Acknowledgments
---------------

This project was supported through the generosity of the
NASA Ames Intelligent Systems Program and
`The Robotics Institute <http://www.ri.cmu.edu/>`__
(established in 1979 to conduct basic and applied research in
robotic technologies), part of the
`School of Computer Science <http://www.cs.cmu.edu/>`__, at
`Carnegie Mellon University <http://www.cmu.edu/>`__.

.. toctree::
   :hidden:

   wiki
   files
