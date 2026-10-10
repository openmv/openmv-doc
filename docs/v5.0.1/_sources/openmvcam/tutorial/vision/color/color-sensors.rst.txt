Colour sensors
==============

The photodiode in each cell is colour-blind. It counts
photons of every wavelength the silicon absorbs without
distinguishing red from green from blue. To get a colour
image out of a colour-blind sensor, the manufacturer covers
the pixel grid with a *colour filter array* (CFA): a thin
film of dye that lets each cell see only one of the three
primary colours.

The Bayer pattern
-----------------

The dominant CFA layout is the *Bayer pattern*, named for
its inventor at Kodak. The film alternates two row types:
even rows are a repeating red-green pattern (red, green,
red, green) and odd rows are a repeating green-blue pattern
(green, blue, green, blue). In the smallest repeating
tile -- two rows by two columns -- one cell sees red, one
sees blue, and two see green.

.. figure:: ../figures/bayer-pattern.svg
   :alt: A 6 column by 4 row grid of small squares
         coloured according to the Bayer pattern. Even rows
         alternate red and green; odd rows alternate green
         and blue. Letters R, G, and B mark the colour of
         each cell. The top-left two-by-two block is
         outlined to indicate the smallest repeating tile,
         which contains one red cell, one blue cell, and
         two green cells.

   The Bayer colour filter array. Each cell of the sensor
   sees only one of the three primary colours; green
   appears in two of every four cells.

Green is doubled on purpose. Human vision is much more
sensitive to green than to red or blue, and the perceived
luminance of a scene is mostly carried by the green
channel. Sampling green at twice the density of red and
blue puts the resolution budget where the eye notices it
most, and hides the chrominance softness that follows.

What each pixel records
-----------------------

A colour sensor still stores only one number per pixel --
the count of photons that made it through that pixel's
colour filter. A red-filter cell records its red-channel
value; the green and blue values at the same location are
simply missing from the data. The same is true for green
and blue cells.

The data that leaves the sensor in raw *Bayer* format is
therefore one channel per pixel, laid out in the Bayer
pattern, rather than the three channels per pixel of a
finished colour image. Reconstructing the missing two
channels at every cell position is called *debayering*.

Microlenses and the chief ray angle
-----------------------------------

The colour filter is not the only thing on top of the
photodiode. Above it sits a tiny *microlens* that focuses
the incoming light cone onto the photodiode's active area,
and the microlens is designed assuming the light comes in
close to perpendicular to the sensor surface. When light
arrives at a steep angle instead -- the
:doc:`chief ray angle <../optics/real-lens-effects>` that
grows toward the corners of every real lens -- some of it
can land on the neighbouring pixel's filter instead,
picking up the wrong colour and producing *colour
crosstalk*. Corner pixels lose saturation as well, because
part of the cone misses the photodiode entirely.

Sensors compensate by shifting each pixel's microlens
radially outward from the centre of the sensor, in
concentric rings that expand from the middle out to the
corners. The shift is zero at the centre and grows to a
few microns at the outermost ring, tuned to a specific
CRA profile baked into the sensor's design. Pairing a
sensor with a lens whose CRA profile differs substantially
from the design target leaves visible colour and
sensitivity errors in the corners, which is why image
sensors and lenses are usually chosen together.
