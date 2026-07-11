Wiki
====

.. |c1w1| image:: img/camfrontright.jpg
   :alt: Camera Front Right
.. |c1w2| image:: img/camfront.jpg
   :alt: Camera Front
.. |c1w3| image:: img/camboard.jpg
   :alt: Camera Board
.. |c1w4| image:: img/botfrontright.jpg
   :alt: Robot Front Right

.. container:: legacy-center

   |c1w1| |c1w2| |c1w3| |c1w4|

Quick Links
-----------

* :doc:`gallery`
* :doc:`downloads`
* :doc:`faq`
* :doc:`publications`
* :doc:`people`
* :doc:`issues`
* `Toy Robots Initiative <http://www.cs.cmu.edu/~illah/EDUTOY/>`__
* :doc:`legal`

Typical Uses
------------

The CMUcam1 can be used to track or monitor colors. The best performance can be
achieved when there are highly contrasting and intense colors. For instance, it
can easily track a red ball on a white background, but it would be hard to
differentiate between different shades of brown in changing light. Tracking
colorful objects can be used to localize landmarks, follow lines, or chase
moving beacons. Using color statistics, it is possible for the CMUcam1 to
monitor a scene, detect a specific color, or do primitive motion detection. If
the CMUcam1 detects a drastic color change, then chances are something in the
scene changed. Using "line mode", the CMUcam1 can generate low resolution binary
images of colorful objects. This can be used to do more sophisticated image
processing that includes branch detection, or even simple shape recognition.
These more advanced operations require custom algorithms to post process the
binary images sent from the CMUcam1. As is the case with a normal digital
camera, this type of processing might require a computer or at least a fast
microcontroller.

Typical Configuration
---------------------

The most common configuration for the CMUcam1 is to have it communicate to a
master processor via a standard RS232 serial port. This "master processor" could
be a computer, PIC, Basic Stamp, Handy Board, Brainstem or similar
microcontroller. The CMUcam1 is small enough to add simple vision to embedded
systems that can not afford the size or power of a standard computer based
vision system. Its communication protocol is designed to accommodate even the
slowest of processors. If your device does not have a fully level shifted serial
port, you can also communicate to the CMUcam1 over its TTL serial port. This is
the same as a normal serial port except that the data is transmitted using
non-inverted 0 to 5 volt logic. The CMUcam1 supports various baud rates to
accommodate slower processors. For even slower processors, the CMUcam1 can
operate in "poll mode". In this mode, the host processor can ask the CMUcam1 for
just a single packet of data. This gives slower processors the ability to more
easily stay synchronized with the data. It is also possible to add a delay
between individual serial data characters using the "delay mode" command. Due to
communication delays, both poll mode and delay mode will lower the total number
of frames that can be processed in one second. Frame resolutions are affected by
serial delays and the baud rate.

.. toctree::
   :hidden:

   gallery
   downloads
   faq
   publications
   people
   issues
   legal
