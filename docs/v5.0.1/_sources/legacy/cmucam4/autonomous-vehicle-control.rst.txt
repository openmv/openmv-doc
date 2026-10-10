Autonomous Vehicle Control
==========================

Article by Haim Baruh, Joshua Metersky, Richard Quan, and David Wu.

Abstract
--------

An autonomous vehicle is one that is able to operate independently of human
control through feedback returned by various sensors. These vehicles are often
used to reduce problems, risks and costs that arise from human involvement. The
goal of this project is to design and program a convoy in which autonomous
vehicles follows a human controlled lead car. In order to develop this system of
vehicles, multiple sensors have to be used to keep the convoy together. Standard
radio controlled cars are used as the vehicles in the system and were equipped
with Arduino microcontrollers, the CMUcam4 camera for color tracking as well as
the Parallax Ping))) ultrasonic sensor. Servos are also mounted on the vehicles
in order to allow the camera and ping to turn according to the lead car. Using
these sensors, the distance between the vehicles is used to determine the motor
speed, while the input from the CMUcam4 allows the vehicles to follow the ones
ahead when they turn. These sensors continuously return data, allowing for the
following cars to adjust to any changes in the system.

Click :download:`here <dl/12-Rutgers-Metersky,-Quan,-Wu.ppt>` to download the
poster.

Poster
------

.. image:: img/12-Rutgers-Metersky,-Quan,-Wu---small.PNG
   :target: ../../_images/12-Rutgers-Metersky,-Quan,-Wu---large.PNG
   :alt: Autonomous Vehicle Control poster
   :align: center

.. image:: img/12-Rutgers-Metersky,-Quan,-Wu---large.PNG
   :class: legacy-collect-only
   :alt: Autonomous Vehicle Control poster (full size)
