Real-lens effects
=================

The thin-lens model and the FOV formula match real lenses
well near the centre of the frame. Off-centre, three
physical effects show up that the sensor pipeline has to
account for: straight lines in the scene curve on the
sensor, corner pixels record the scene dimmer than centre
pixels, and the rays converging onto each pixel arrive at
an angle that depends on where the pixel sits.

Barrel and pincushion distortion
--------------------------------

The thin-lens model says straight lines in the scene
project to straight lines on the sensor. Real lenses bend
off-axis rays slightly differently from what the model
predicts, and the result is that straight lines in the
scene curve gently on the sensor. The bending is *radial*
-- lines passing through the centre of the frame stay
straight, but lines offset from the centre bow outward or
inward.

.. figure:: ../figures/barrel-pincushion.svg
   :alt: Three panels showing the same square outline. The
         left panel is an ideal undistorted square. The
         middle panel shows barrel distortion: the square's
         sides bulge outward. The right panel shows
         pincushion distortion: the square's sides bow
         inward toward the centre. In all three panels a
         horizontal and a vertical line through the centre
         stay straight.

   Left: an ideal frame. Middle: barrel distortion bulges
   the edges outward. Right: pincushion distortion bows
   them inward.

Two flavours of distortion show up in practice:

* *Barrel* distortion bows lines outward from the centre,
  like the staves of a barrel. Short focal lengths
  (wide-angle lenses) are the usual culprit, and a fish-eye
  lens at the extreme is just severe barrel distortion.
* *Pincushion* distortion pinches lines inward toward the
  centre, like the laces of a pincushion. Long focal
  lengths (telephoto lenses) tend to produce it, usually
  more subtly than wide-angle barrel.

Software can correct distortion after the fact, given a
calibrated description of how a particular lens deviates
from the ideal. The fix is a per-pixel coordinate remap
from the distorted image back to where each ray would have
landed without the bending.

Light falloff at the corners
----------------------------

A uniformly bright scene comes out brighter at the centre
of the recorded image than at the corners. Three geometric
effects compound multiplicatively. For a scene point at
angle :math:`\theta` from the optical axis:

**1. The corner is farther from the lens than the centre.**
A point at angle :math:`\theta` on the same scene plane
sits at distance :math:`D / \cos\theta` from the lens,
against distance :math:`D` for the on-axis point. The
inverse-square law says intensity falls as the square of
distance, so on its own this effect contributes

.. math::

   \frac{1}{(D / \cos\theta)^2} \div \frac{1}{D^2}
   = \cos^2\theta

-- two factors of :math:`\cos\theta`.

**2. The lens aperture is foreshortened from the corner.**
Seen from the off-axis point, the aperture surface is
tilted by angle :math:`\theta` relative to the line of
sight. Its projected area, and so the amount of light it
collects, is reduced by :math:`\cos\theta`.

**3. The sensor receives the light at an angle.** Rays
converging onto a corner pixel hit the sensor at angle
:math:`\theta` from the normal. The same light bundle
spreads across a patch larger by :math:`1 / \cos\theta`,
so per-area intensity drops by :math:`\cos\theta`.

The three effects multiply:

.. math::

   \cos^2\theta \;\cdot\; \cos\theta \;\cdot\; \cos\theta
   = \cos^4\theta

This is the *cos⁴ falloff*. For a wide-angle lens whose
corner ray makes a 60° angle with the optical axis,
:math:`\cos^4 60° = 0.0625` -- the corner records at about
6% of the brightness of the centre.

.. figure:: ../figures/light-falloff.svg
   :alt: A rectangular frame filled with a radial gradient
         that is bright in the centre and dim toward the
         corners.

   A uniformly lit scene comes out bright in the centre and
   dim at the corners, falling off as
   :math:`\cos^4(\theta)` of the corner angle.

Mechanical *vignetting* from the lens housing -- light
clipped by the rim of the lens barrel or by the mount --
adds to the geometric falloff and looks the same: darker
corners. A common mitigation on the lens side is to pick a
lens whose image circle is substantially larger than the
sensor diagonal: the sensor then captures only the inner,
better-corrected portion of the lens's image, where the
corner angle :math:`\theta` is smaller and the
:math:`\cos^4` term is correspondingly less severe. The
same choice helps with barrel distortion and chief ray
angle at the corners, since all three effects worsen
toward the edge of the image circle. Whatever falloff
remains is handled by the on-sensor *lens-shading
correction* (LSC), covered in :doc:`on-sensor calibration
<../sensor/calibration>`.

Chief ray angle
---------------

A bundle of rays from a single scene point converges
through the lens and lands on a single sensor pixel. The
central ray of that bundle -- the one passing through the
centre of the lens aperture -- is the *chief ray*. At the
centre of the sensor (the optical axis), the chief ray
arrives perpendicular to the sensor surface. At pixels
away from the centre, the chief ray arrives at an angle.

.. figure:: ../figures/chief-ray-angle.svg
   :alt: A side view of a lens and a sensor with three
         chief rays drawn from the centre of the lens to
         three pixels on the sensor -- top, centre, and
         bottom. The chief ray to the centre pixel is along
         the optical axis and is perpendicular to the
         sensor surface. The chief rays to the top and
         bottom pixels arrive at the sensor at a slant. The
         angle between the chief ray and the sensor normal
         at the top pixel is labelled CRA.

   The chief ray for each pixel converges through the lens
   centre. The angle it makes with the sensor normal is the
   chief ray angle (CRA), zero on the optical axis and
   growing toward the corners.

The angle between the chief ray and the sensor normal at a
given pixel is the *chief ray angle*, or CRA. CRA is zero
at the centre of the sensor and grows toward the corners.
The maximum value depends on the lens design -- common
values for small fixed-lens cameras range from about 15° to
30° at the corners.

CRA matters because sensor pixels respond best to light
arriving close to perpendicular to the sensor surface. At
steep angles the response drops off, and some of the light
can leak between neighbouring pixels. Sensor designs
accommodate a specific CRA profile -- pairing a sensor
with a lens whose profile differs substantially shows up
as visible sensitivity and colour errors in the corners,
which is why image sensors and lenses are usually chosen
together.
