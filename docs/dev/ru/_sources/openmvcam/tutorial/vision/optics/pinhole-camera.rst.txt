The pinhole camera
==================

Before there is a sensor there is an image to form, and the
geometry of that image is set by whatever optical element
sits in front of the sensor. The simplest such element is a
pinhole -- a single small opening in an otherwise opaque
wall, and the conceptual ancestor of every camera lens.

Image formation
---------------

A scene has to be lit for there to be anything to image. Light
from the sun, a lamp, or any other source hits the objects in
the scene; each point on each object absorbs some of that
light and scatters the rest in every direction. Those
scattered rays are what the camera collects.

Most of the rays leaving any one scene point hit the wall of
the box and stop; the handful that pass through the pinhole
each travel in a straight line and strike the back of the
box at a single point determined by the pinhole's geometry.

.. figure:: ../figures/pinhole-projection.svg
   :alt: A vertical arrow on the left represents an object in
         the scene. Two rays leave its tip and base, pass
         through a pinhole in a wall, and continue in straight
         lines to land on a back wall on the right, where they
         form a smaller inverted arrow. The object distance D
         is labelled between the scene and the pinhole; the
         focal length f is labelled between the pinhole and
         the back wall.

   Each scene point projects through the pinhole onto a unique
   point on the back wall. Because the rays cross at the
   pinhole, the image is inverted.

Top and bottom swap, and left and right swap with them.
Cameras un-swap both further down the pipeline so the final
image looks right side up.

Projection geometry
-------------------

Let :math:`f` be the distance from the pinhole to the back
wall and :math:`D` the distance from the pinhole to a scene
point of real height :math:`H`. A straight ray from the top
of the scene point through the pinhole lands on the back
wall at an image height

.. math::

   h = H \cdot \frac{f}{D}

A 1 m-tall object 5 m away, viewed by a pinhole 25 mm from
the back wall, projects to an image :math:`25 / 5000 = 1/200`
of its real size -- a 5 mm-tall inverted arrow on the wall.

The distance :math:`f` here is the camera's *focal length*.
It helps to meet the term in a setting where it is literally
a length -- the depth between the imaging plane and the
element that focuses light onto it. Every lens that replaces
this pinhole later will have a focal length too, and the
same :math:`f / D` projection scale will apply.

The aperture trade-off
----------------------

A pinhole that is mathematically a point makes a perfectly
sharp image of every scene point, but a point gathers no
light -- the image is invisibly dim. Drilling out the hole
lets more light through, so the image is brighter, but each
scene point now projects through to a *spot* the size of the
hole rather than to a single point. The image gets brighter
and blurrier at the same time, and there is no hole size
that gives both a sharp and a bright image.

A lens removes the trade-off. It is a wider opening that
*also* refocuses every ray entering it back to a single point
on the wall, so the image is both bright (because the opening
is wide) and sharp (because the rays still meet at one
point). The next page introduces it in those terms.
