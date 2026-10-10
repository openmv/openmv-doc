Lenses and focus
================

A pinhole works but is dim. A lens replaces the pinhole with
a wider aperture and refocuses every ray entering it back to
a single point on the image plane, so the image is both
bright and sharp -- the trade-off the pinhole forced disappears.

Refraction
----------

Light slows down when it enters a denser medium (glass)
from a lighter one (air), and the change of speed at the
interface bends the ray. A lens is a piece of glass shaped
so that every ray from a given scene point bends by exactly
the amount needed to converge again at the same point on the
back wall. Rays from a different scene point converge at a
different point, and so on; the image is built up one scene
point at a time, exactly like the pinhole's, but with vastly
more light per point.

The thin-lens model
-------------------

Real lens design accounts for glass shape, multiple elements,
and the wavelength of light passing through them. The geometry
the rest of this section needs comes from a simpler
idealisation -- the *thin-lens model* -- which treats the
lens as a vertical plane on the optical axis where rays
change direction instantaneously, ignoring the lens's actual
thickness.

The model is anchored by one starting observation: rays
arriving at the lens *parallel* to the optical axis all
refract to pass through the same point behind the lens. That
point is the *focal point*, and its distance from the lens
is the lens's *focal length*, conventionally written
:math:`f`. A "50 mm lens" is one whose focal length is
50 mm. Every lens has *two* focal points, one on each side,
at equal distance :math:`f` -- the one on the image side and
one symmetrically on the object side.

From that single fact, two ray-tracing rules drop out and
let the model locate any image point:

* A ray entering the lens parallel to the axis refracts to
  pass through the *far* focal point on the image side.
* A ray passing through the *centre* of the lens continues
  straight, undeflected -- because at the centre the lens is
  thin enough that there is effectively no glass to bend the
  ray.

Those rules might look like the description of a single
ray-trace, but they describe what the lens does at every
scene point at the same time. Each visible point scatters
light in every direction; whichever of its rays enter the
lens converge again at that point's image on the far side.
The complete picture is the union of millions of those
per-point convergences, all happening in parallel.

.. figure:: ../figures/thin-lens-multipoint.svg
   :alt: A vertical object arrow on the left of a lens, with
         three sample points marked along its length. From
         each sample point, a horizontal ray enters the lens,
         refracts to pass through the same far focal point on
         the optical axis, and continues to a distinct image
         point on the right, where three image points trace
         the inverted image arrow.

   The same parallel-to-focal-point rule applies at every
   point of the object. Each scene point produces its own
   image point on the far side; together they trace out a
   complete inverted image.

Zooming in on a single scene point makes the construction
explicit. Two rays leaving that scene point -- one parallel
to the axis (refracted through the far focal point) and one
through the centre of the lens (undeflected) -- cross again
on the far side of the lens, and where they cross is the
image of that point.

.. figure:: ../figures/thin-lens.svg
   :alt: Two diagrams stacked. The top diagram shows three
         parallel rays entering a vertical lens from the left
         and refracting to converge at a focal point on the
         optical axis at distance f behind the lens. The
         bottom diagram shows the thin-lens construction: an
         upright arrow on the left at distance u in front of
         the lens, with the near and far focal points marked
         on the axis. A parallel-then-through-focal-point ray
         and a straight-through-centre ray leave the arrow's
         tip, refract at the lens, and meet on the right at
         distance v behind the lens, where an inverted image
         arrow ends.

   Top: parallel rays converge at the focal point. Bottom:
   the two construction rays from a scene point locate its
   image on the far side of the lens.

The same geometry expressed algebraically is the *thin-lens
equation*. It relates object distance :math:`u`, image
distance :math:`v`, and focal length :math:`f`:

.. math::

   \frac{1}{u} + \frac{1}{v} = \frac{1}{f}

Given any two of the three, the equation gives the third.

For a very distant scene (:math:`u` large), the term
:math:`1/u` becomes negligible and :math:`v` approaches
:math:`f` -- distant scenes focus at the focal point. Closer
scenes need :math:`v` larger than :math:`f`, meaning the
lens has to sit *farther* from the sensor to stay in focus.
That is what every focusing mechanism -- manual barrel,
autofocus motor, fixed-focus shim -- is physically doing:
shifting the lens back and forth so :math:`v` matches the
:math:`u` of the scene the camera is asked to image sharply.

Depth of field
--------------

A lens focused at one object distance only forms a perfectly
sharp image of points at *exactly* that distance. Points
nearer or farther focus to spots in front of or behind the
sensor and arrive at the sensor as small blur circles. The
range of object distances over which those blur circles are
small enough to look sharp is the *depth of field* (DOF).

.. figure:: ../figures/depth-of-field.svg
   :alt: Three object points at three different distances --
         near, focused, far -- each projecting through the
         lens to a small region on the image plane. The middle
         object's image is a point; the near and far objects'
         images are small blur circles. A band labelled
         "in focus" marks the range of distances whose blur
         circles fall under an acceptable size.

   Only points at the focused distance project to true points
   on the image plane; nearer and farther points arrive as
   blur circles. The range of acceptable blur is the depth of
   field.

Depth of field grows when the lens is *stopped down* -- a
smaller hole admits a narrower bundle of rays from each scene
point, and those narrower bundles produce smaller blur
circles for off-focus points. So a smaller aperture gives
more DOF but admits less light, and a larger aperture admits
more light but cuts DOF. Aperture is the second knob the lens
hands the photographer, and like the pinhole/lens choice
before it, it is a sharpness-vs-brightness trade.

Aperture and F-number
---------------------

Lens apertures are expressed as *F-numbers*, the ratio of the
focal length to the aperture diameter:

.. math::

   N = \frac{f}{D}

where :math:`D` is the diameter of the opening. A 50 mm lens
with a 25 mm-wide opening has :math:`N = 2`, written ``f/2``.
Smaller F-numbers mean a wider opening (more light, less DOF);
larger F-numbers mean a narrower opening (less light, more
DOF). The ratio rather than absolute diameter is what matters
because the same :math:`f / D` ratio gives the same image
brightness for the same scene, regardless of focal length.

The OpenMV Cam's stock lenses come with fixed apertures
chosen for general-purpose use; the F-number is one of the
specs given in the lens datasheet. Aperture matters less
day-to-day than focal length on these cameras, but the
concept matters to read a datasheet.
