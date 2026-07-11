CMUcam1
=======

.. |c1a| image:: img/cmucam1-a.jpg
   :alt: CMUcam1

.. |c1b| image:: img/cmucam1-b.jpg
   :alt: CMUcam1 board

.. container:: legacy-center

   |c1a| |c1b|

The CMUcam1 is a low-cost, low-power sensor for mobile
robots. You can use the CMUcam1 vision system to do many
different kinds of on-board, real-time vision processing
tasks. Because the CMUcam1 uses a serial port, it can be
directly interfaced to other low-power processors such as
PIC chips. For more information, see the :doc:`wiki <wiki>`.

**At 17 frames per second, the CMUcam1 can do the following:**

* Track the position and size of a colorful or bright object
* Measure the RGB or YUV statistics of an image region
* Automatically acquire and track the first object it sees
* Physically track using a directly connected servo
* Dump a complete image over the serial port
* Dump a bitmap showing the shape of the tracked object

Using the CMUcam1, it is easy to make a robot head that
swivels around to track an object. You can also build a
wheeled robot that chases a ball around, or even chases you
around. In the :doc:`gallery <gallery>`, you can see
pictures and videos of some of the robots we and others have
built with the CMUcam1.

How do I use one?
-----------------

Your first step (after taking a look at the
:doc:`gallery <gallery>`) is to go to
:doc:`downloads <downloads>`, where you can retrieve the
CMUcam1 User's Manual. This contains a complete parts list
and schematic as well as a description of the serial
protocol and capabilities.

Make sure to test your CMUcam1 using our
:doc:`java interface program <downloads>`. Then you're ready
to build your own visual robots!

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
