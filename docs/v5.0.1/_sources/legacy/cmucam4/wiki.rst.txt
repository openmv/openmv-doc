Wiki
====

.. |ri1| image:: cmucam4-a.jpg
   :alt: CMUcam4 A
.. |ri2| image:: cmucam4-b.jpg
   :alt: CMUcam4 B
.. |ri3| image:: img/CMUcam4-Arduino-Shield-B-Little---Rev-A.jpg
   :alt: CMUcam4 Arduino Shield B
.. |ri4| image:: img/CMUcam4-Arduino-Shield-A-Little---Rev-A.jpg
   :alt: CMUcam4 Arduino Shield A

.. container:: legacy-center

   |ri1| |ri2| |ri3| |ri4|

Quick Links
-----------

* :doc:`quick-start`

* :download:`Arduino Interface Library <dl/CMUcam4-Arduino-Interface-Library-101.zip>`
* :doc:`cmucam4-graphical-user-interface`

* :doc:`Documents <documents>`

* :doc:`Black Lextronic Camera Documentation <lextronic-camera>`
* :doc:`Red SparkFun Camera Documentation <sparkfun-camera>`
* :doc:`Blue Parallax Camera Documentation <parallax-camera>`

* :doc:`firmware-source-code-and-binaries`

* :doc:`how-to-use-the-cmucam4-properly`

* :doc:`color-tracking-explanation`
* :doc:`tips-and-tricks`

* :doc:`frequently-asked-questions`
* :doc:`troubleshooting`

* :doc:`gallery`
* :doc:`people`

* :doc:`CMUcam1 <../cmucam1/wiki>`
* :doc:`CMUcam2 <../cmucam2/wiki>`
* :doc:`CMUcam3 <../cmucam3/wiki>`

* :doc:`legal-information`

Cool Videos
-----------

CMU Mechatronics 2012: Team Fun

.. raw:: html

   <div class="legacy-yt"><iframe src="https://www.youtube.com/embed/oLCOUdFDnUc"
     title="CMU Mechatronics 2012: Team Fun" frameborder="0"
     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
     allowfullscreen></iframe></div>

Demo Mode Object Tracking

.. raw:: html

   <div class="legacy-yt"><iframe src="https://www.youtube.com/embed/ByGZRh62glw"
     title="Demo Mode Object Tracking" frameborder="0"
     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
     allowfullscreen></iframe></div>

CMUcam4 Video

.. raw:: html

   <div class="legacy-yt"><iframe src="https://www.youtube.com/embed/0UklfX38tfY"
     title="CMUcam4 Video" frameborder="0"
     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
     allowfullscreen></iframe></div>

`CMUcam4 Object Tracking <http://www.youtube.com/watch?v=XjI2kwcpDAQ>`__ (watch on YouTube)

`CMUcam4 Skin Tracking <http://www.youtube.com/watch?v=zgVv-cEwN4U>`__ (watch on YouTube)

Cool Projects
-------------

* :doc:`multi-shot-cannon` -- By: Wesley Myers
* :doc:`autonomous-vehicle-control` -- By: Haim Baruh, Joshua Metersky, Richard Quan, and David Wu
* :doc:`low-power-motion-detection` -- By: Kwabena Agyeman
* :doc:`mobot` -- By: Cosku Acay, Edwin Cho, Kenneth Li, Nishant Pol

Typical Uses
------------

The CMUcam4 can be used to track colors or collect basic image statistics. The
best performance can be achieved when there are highly contrasting and intense
colors. For instance, it can easily track a red ball on a white background, but
it would be hard to differentiate between different shades of brown in changing
light. Tracking colorful objects can be used to localize landmarks, follow
lines, or chase moving beacons. Using color statistics, it is possible for the
CMUcam4 to monitor a scene, detect a specific color, or do primitive motion
detection. If the CMUcam4 detects a drastic color change, then chances are
something in the scene changed. Using "line mode", the CMUcam4 can generate low
resolution binary images of colorful objects. This can be used to do more
sophisticated image processing that includes line following with branch
detection, or even simple shape recognition. These more advanced operations
require custom algorithms to post process the binary images sent from the
CMUcam4. As is the case with a normal digital camera, this type of processing
might require a computer or at least a fast microcontroller.

Typical Configuration
---------------------

The most common configuration for the CMUcam4 is to have it communicate to a
master processor via a standard TTL serial port. This "master processor" could
be a computer (through USB or RS232), Arduino, Basic Stamp, PIC, or similar
microcontroller. The CMUcam4 is small enough to add simple vision to embedded
systems that can not afford the size or power of a standard computer based
vision system. Its communication protocol is designed to accommodate even the
slowest of processors. The CMUcam4 supports various baud rates to accommodate
slower processors. For even slower processors, the CMUcam4 can operate in "poll
mode". In this mode, the host processor can ask the CMUcam4 for just a single
packet of data. This gives slower processors the ability to more easily stay
synchronized with the data. It is also possible to add a delay between
individual serial data characters using the "delay mode" command. Due to
communication delays, both poll mode and delay mode will lower the total number
of frames that can be processed in one second.

.. toctree::
   :hidden:

   quick-start
   cmucam4-graphical-user-interface
   lextronic-camera
   sparkfun-camera
   parallax-camera
   firmware-source-code-and-binaries
   ov9665-color-cmos-sxga-sensor
   how-to-use-the-cmucam4-properly
   color-tracking-explanation
   tips-and-tricks
   frequently-asked-questions
   troubleshooting
   gallery
   people
   legal-information
   multi-shot-cannon
   autonomous-vehicle-control
   low-power-motion-detection
   mobot
