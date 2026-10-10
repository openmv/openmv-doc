Field of view
=============

A camera sees a cone of the world in front of it; everything
outside that cone falls off the side of the sensor. The
angular width of that cone is the *field of view* (FOV), and
it is determined by two numbers -- the sensor size and the
lens focal length.

The FOV formula
---------------

.. figure:: ../figures/fov-from-focal-length.svg
   :alt: A vertical lens with a sensor of width S behind it
         at distance f. Two rays leave the top and bottom
         edges of the sensor, pass through the centre of the
         lens, and diverge into the scene on the far side,
         defining a cone whose full angle is labelled FOV.

   A sensor of width :math:`S` at distance :math:`f` behind
   the lens defines a cone of incoming rays. The full angle
   of that cone is the field of view.

A sensor of width :math:`S` sits at distance :math:`f`
behind the lens, perpendicular to the optical axis. The
thin-lens model says a ray through the centre of the lens
continues undeflected, so trace one such ray from each edge
of the sensor: each one heads straight through the lens
centre and out into the scene on the far side. Together
they bound the cone of light the sensor can collect, and
the angle between them at the lens is the field of view.

Half of that cone is a right triangle. One leg is the
optical axis from the lens centre to the centre of the
sensor -- length :math:`f`. The other leg is the
half-sensor from the sensor centre out to one edge --
length :math:`S / 2`. The hypotenuse is the ray itself,
running from the lens centre to the sensor edge.

The Pythagorean theorem ties the three side lengths
together, but Pythagoras does not give angles, and the
angle at the lens vertex is what we are after.
*Trigonometry* is the bridge from side ratios to angles. In
any right triangle, the *tangent* of an angle is defined as
its opposite side over its adjacent side. For the half-FOV
angle, the opposite side is the half-sensor :math:`S / 2`
and the adjacent side is the optical-axis leg :math:`f`,
so

.. math::

   \tan(\text{half-FOV}) = \frac{S / 2}{f} = \frac{S}{2f}

The angle itself comes out by applying the inverse of the
tangent -- the *arctangent* function -- to both sides:

.. math::

   \text{half-FOV} = \arctan \! \left( \frac{S}{2f} \right)

The cone is symmetric about the axis, so the full FOV is
twice the half-angle:

.. math::

   \text{FOV} = 2 \cdot \arctan \! \left( \frac{S}{2f} \right)

Two consequences fall out of the formula:

* **The lens focal length sets the angle, not the absolute
  size.** A "wide-angle" lens is wide because its focal
  length is *short* -- the smaller :math:`f` is, the larger
  the ratio :math:`S / 2f` becomes, and the wider the cone.
  A long focal length narrows the cone (a "telephoto" lens).
* **The sensor size matters too.** Mounting the same lens in
  front of a smaller sensor crops the cone -- the same lens
  has a narrower field of view on a smaller sensor than on a
  larger one. This is why focal length numbers on different
  cameras are not directly comparable; the FOV depends on
  both :math:`f` and :math:`S`.

Three lens choices
------------------

Take a 4.8 mm × 3.6 mm sensor (a common small-format size
roughly matching what OpenMV Cam sensors deliver) and three
lens choices.

==============   =============   ==============   ============   ============
focal length     diagonal FOV    horizontal FOV   vertical FOV   description
==============   =============   ==============   ============   ============
2.8 mm           ~94°            ~81°             ~66°           wide angle
4 mm             ~74°            ~62°             ~48°           normal
8 mm             ~41°            ~33°             ~25°           narrow / tele
==============   =============   ==============   ============   ============

All three columns go through the same formula. The diagonal
FOV uses :math:`S` equal to the sensor diagonal
:math:`\sqrt{W^2 + H^2}` (6 mm for this sensor); the
horizontal FOV uses :math:`S = W = 4.8` mm; the vertical
FOV uses :math:`S = H = 3.6` mm. Halving the focal length
nearly doubles each cone; doubling it nearly halves them.

Lens datasheets usually publish the *diagonal* FOV as the
single headline number, since it spans the sensor corner to
corner. The horizontal and vertical FOVs are more directly
useful when planning what will fit in the frame, because
the frame is rectangular and a rectangular working area is
bounded along the horizontal and vertical, not the
diagonal.

Choosing a focal length
-----------------------

The FOV the application needs is set by how big a region the
camera has to see and how far away the camera will be. If
the camera sits 1 m above a 0.6 m × 0.6 m work area, the
angular FOV needed to cover one edge is
:math:`2 \cdot \arctan(0.3 / 1) \approx 33°`, and the 8 mm
lens above comes close.

Going wider than the application needs makes objects smaller
in the frame, wastes pixels on background, and increases
lens distortion. Going narrower drops parts of the scene off
the side of the sensor. The right lens is the longest focal
length that still covers the working area at the camera's
intended distance.

