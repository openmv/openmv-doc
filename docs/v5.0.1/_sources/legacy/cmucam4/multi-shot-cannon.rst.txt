Multi-Shot Cannon
=================

Article by Wesley Myers.

.. |cannonrender| image:: img/Render_small.jpg
   :target: ../../_images/Render_large.jpg
   :alt: Multi-shot cannon render
.. |cannonreal| image:: img/Real_small.jpg
   :target: ../../_images/Real_large.jpg
   :alt: Multi-shot cannon

.. container:: legacy-center

   |cannonrender| |cannonreal|

.. image:: img/Render_large.jpg
   :class: legacy-collect-only
   :alt: Multi-shot cannon render (full size)
.. image:: img/Real_large.jpg
   :class: legacy-collect-only
   :alt: Multi-shot cannon (full size)

Project Description
-------------------

The goal of the project is to build a mechatronic device capable of shooting
projectiles and striking static and dynamic targets.

We are shooting at targets located 10' away from the cannon, in a 4' wide by 3'
high area. There are three total targets, each 8" in diameter and covered with a
different color of retro-reflective tape (red, green, or blue). The targets are
located at a fixed height, with the bottom target being 1' higher than the base
on which the shooter will be placed. During performance tests (described in
detail in a later section), each of the targets may either be stationary or
moving with a maximum speed of 1 ft/sec. The targets will always be in the
"field of play," meaning they are always visible and able to be hit. Since the
targets will need to stop and change directions periodically on the 4' long
track, the speed will not be constant. However, the motion will be predictable
and simple tests should allow for easy adjustment of machine timing.

Solution with the CMUcam4
-------------------------

The CMUcam4 provides simple vision capabilities to small embedded systems in the
form of an intelligent sensor. We used the CMUcam4 for on-board, real-time vision
processing tasks (Figure 3).

The CMUcam4 is connected to the Arduino Mega via serial over a UART port. With
this, we can send commands to the CMUcam4 and receive tracking data back.
Figure 4 shows the Hardware Layout of our system. Figure 5 shows the state flow
of our system. Figure 6 shows the overall subsystem flow of our system.

The strategy we used for this was very simple. We knew the relative y-coordinate
positions of the targets relative to our position. We also knew the maximum and
minimum x-coordinate positions of the targets relative to our position. So we
constructed a window around the possible positions of each target as shown in
Figure 2. What this did was eliminate any outside noise due to the lighting or
other objects. What this also allowed was the ability to really target the red,
green, and blue models against the black background. We could then accept a wide
range of color values in light and darkness. Figure 1 is the view from the
CMUcam4 of the target board.

The data we got back from the CMUcam4 was the (x,y) positions relative to the
camera's view. We then passed this data to a look up table to find the servo
positions we needed to aim the shooter.

Figures
-------

.. figure:: img/Target_raw.jpg
   :align: center

   Figure 1 - View of Target Board.

.. figure:: img/Target_filtered.jpg
   :align: center

   Figure 2 - View of Target Board with Bounding Box Filtering.

.. figure:: img/System_overview.png
   :align: center
   :class: legacy-unframed

   Figure 3 - System Overview.

.. figure:: img/Hardware_layout.png
   :align: center
   :class: legacy-unframed

   Figure 4 - Hardware Layout.

.. figure:: img/State_machine.png
   :align: center
   :class: legacy-unframed

   Figure 5 - Overall State Machine.

.. figure:: img/System_flow.png
   :align: center
   :class: legacy-unframed

   Figure 6 - Overall Subsystem Flow.

Files
-----

Below are the files related to this project.

* :download:`CMUcamCompetitionCode <dl/CMUcamCompetitionCode.ino>` -- The code
  that we used for our competition.
* :download:`TeamF_FinalReport <dl/TeamF_FinalReport.pdf>` -- Our final report
  for the project. This has a lot of good information about the system.

These are my Individual Lab Reports from the class. These document my progress
with the CMUcam4 and they also have a lot of the code I used in the early
development stages:

* :download:`ILR01 <dl/TeamF_wmyers_ILR01.pdf>`
* :download:`ILR02 <dl/TeamF_wmyers_ILR02.pdf>`
* :download:`ILR03 <dl/TeamF_wmyers_ILR03.pdf>`
* :download:`ILR04 <dl/TeamF_wmyers_ILR04.pdf>`
* :download:`ILR05 <dl/TeamF_wmyers_ILR05.pdf>`
* :download:`ILR06 <dl/TeamF_wmyers_ILR06.pdf>`
* :download:`ILR07 <dl/TeamF_wmyers_ILR07.pdf>`
* :download:`ILR08 <dl/TeamF_wmyers_ILR08.pdf>`
* :download:`ILR09 <dl/TeamF_wmyers_ILR09.pdf>`
* :download:`ILR10 <dl/TeamF_wmyers_ILR10.pdf>`
