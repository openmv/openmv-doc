Issues
======

Some CMOS camera boards seem to have a lens horizontal alignment issue. The
sample images below show the difference in lens alignment between CMOS camera
boards -- a regular CMOS camera board (left) and a problem one (right):

.. |c1iss1| image:: img/before.jpg
   :alt: Regular CMOS Camera Board
.. |c1iss2| image:: img/after.jpg
   :alt: Problem CMOS Camera Board

.. container:: legacy-center

   |c1iss1| |c1iss2|

Adjusting Image Alignment
-------------------------

In some camera modules for the CMUcam kit, the lens housings may not be
centered properly. The result can be a large offset in the image. The image
the camera should see and the image actually captured by the camera may be
shifted by many pixels. The following procedure may be used to correct this
offset. A small offset of a few pixels is normal. This procedure is only
recommended for extreme offset problems.

.. figure:: img/CMUadj5.jpg
   :align: center

   Front of camera board.

It is possible to change the horizontal alignment of the image by replacing the
lens housing screws with smaller machine screws. The new smaller screws make it
possible to adjust the lens housing position.

This procedure uses some very tiny screws and nuts. Use care when handling
them. It is easy to drop them and lose them on a carpet, down a crack in a
floor, etc.

Remove one of the lens housing screws with a small Philips head screwdriver.
Removing just one of the screws at this time will make the next step easier.

.. figure:: img/CMUadj2.jpg
   :align: center

   Removing the screws.

Insert a 0-80 3/8 inch screw up through the empty screw hole in the camera
board, through the empty hole in the lens housing, and secure loosely with a
matching nut. (Any screws roughly 1mm or smaller in diameter and at least 12mm
long should work. The thread does not matter since the new screws will be small
enough to pass through the lens housing mounting holes.)

.. figure:: img/CMUadj4.jpg
   :align: center

   Red line pointing to placement of the new screw.

Repeat the screw replacement for the other side of the lens housing.

Find the "J2" label on the lens side of the board. Slide the lens housing
towards the side of the board farthest from the J2 label until the screws
prevent any further motion. Secure the screws. You should be able to see a tiny
hole right next to the lens housing, as shown in the photo below.

.. figure:: img/CMUadj3.jpg
   :align: center

   New lens position. Red line pointing to tiny hole in PCB.

If additional adjustment of the lens housing is desired, the screw holes may be
filed or drilled to make them larger. This increases the risk of damaging the
board so it is not recommended.

This describes a remedy for horizontal image alignment problems in some CMUcam
camera modules. A variation on this technique could also be used to add an
arbitrary vertical offset.
