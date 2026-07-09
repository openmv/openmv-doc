Wiki
====

.. image:: img/CMUcam2_C.JPG
   :alt: CMUcam2 Picture C
   :align: center

Quick Links
-----------

* :doc:`faq`
* :doc:`downloads`
* :doc:`people`
* :doc:`CMUcam1 wiki <../cmucam1/wiki>`
* `Toy Robots Initiative <http://www.cs.cmu.edu/~illah/EDUTOY/>`__
* :doc:`legal`

Typical Uses
------------

One of the primary uses of the CMUcam2 is to track or monitor colors. The best
performance can be achieved when there are highly contrasting and intense
colors. For instance, it can easily track a red ball on a white background, but
it would be hard to differentiate between different shades of brown in changing
light. Tracking colorful objects can be used to localize landmarks, follow
lines, or chase moving beacons. Using color statistics, it is possible for the
CMUcam2 to monitor a scene, detect a specific color, or do primitive motion
detection. If the CMUcam2 detects a drastic color change, then chances are
something in the scene changed. Using "line mode," the CMUcam2 can generate low
resolution binary images of colorful objects. This can be used to do more
sophisticated image processing that includes branch detection, or even simple
shape recognition. These more advanced operations require custom algorithms to
post process the binary images sent from the CMUcam2. As is the case with a
normal digital camera, this type of processing might require a computer or at
least a fast microcontroller.

Typical Configuration
---------------------

The most common configuration for the CMUcam2 is to have it communicate to a
master processor via a standard RS232 serial port. This "master processor" could
be a computer, PIC, Basic Stamp, Handy Board, Brainstem or similar
microcontroller. The CMUcam2 is small enough to add simple vision to embedded
systems that cannot afford the size or power of a standard computer based vision
system. Its communication protocol is designed to accommodate even the slowest
of processors. If your device does not have a fully level shifted serial port,
you can also communicate to the CMUcam2 over its TTL serial port. This is the
same as a normal serial port except that the data is transmitted using
non-inverted 0 to 5 volt logic. The CMUcam2 supports various baud rates to
accommodate slower processors. For even slower processors, the CMUcam2 can
operate in "poll mode". In this mode, the host processor can ask the CMUcam2 for
just a single packet of data. This gives slower processors the ability to more
easily stay synchronized with the data. It is also possible to add a delay
between individual serial data characters using the "delay mode" command. Due to
communication delays, both poll mode and delay mode will lower the total number
of frames that can be processed in one second. Frame resolutions are not
affected by serial delays or the baud rate as they were in the original CMUcam1.
