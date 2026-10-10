The pixel cell
==============

A camera sensor is a two-dimensional grid of light-sensitive
cells, one per pixel. Each cell is a small electrical
circuit built around a *photodiode* that turns light into a
voltage, which at the end of each frame is digitised into a
single numerical pixel value.

The circuit
-----------

The active element in each cell is a *photodiode* -- a
small light-sensitive p-n junction in silicon. Under
reverse bias the photodiode stores a small reservoir of
charge that incoming photons can release, one little bit
at a time.

.. figure:: ../figures/pixel-circuit.svg
   :alt: A schematic of one CMOS pixel cell. A reset switch
         labelled RST connects the supply rail (VDD) at the
         top of the figure to a node labelled A. A
         photodiode connects node A downward to ground,
         with arrows representing incoming light pointing
         at the photodiode. A transfer switch labelled TX
         connects node A horizontally to a second node
         labelled B. A storage capacitor labelled C connects
         node B downward to ground. A wire from node B leads
         off to the right, labelled "to read-out".

   The pixel circuit: a photodiode with a reset switch that
   pre-charges it, a transfer switch that hands the exposed
   voltage to a small holding capacitor, and an output to
   the read-out amplifier.

The exposure cycle
------------------

Every cell follows the same four-step cycle each frame.

**Precharge.** The cycle begins with a brief reset pulse
that closes the reset switch ``RST``, connecting the
photodiode to the supply rail and lifting its stored
voltage up to a known reference. The switch then opens,
leaving the photodiode isolated at the reset voltage with
its charge reservoir full.

**Exposure.** During the exposure window the photodiode is
left to collect light. Each photon absorbed costs the
photodiode a small amount of its stored charge. Light makes
the stored charge *disappear* -- the brighter the scene,
the faster the photodiode discharges and the lower its
voltage by the end of the window. The total drop is the
pixel's signal.

**Sample.** The exposure window ends with a brief pulse on
the transfer switch ``TX``. While ``TX`` is closed the
photodiode's remaining charge is dumped onto the small
holding capacitor ``C`` wired to node ``B``. The voltage on
``C`` now records the pixel's measurement. ``TX`` then
opens again, locking the value on ``C`` and freeing the
photodiode to be reset for the next frame while ``C`` waits
for its turn at the read-out amplifier.

**Read-out.** The read-out amplifier feeds the voltage on
``C`` to an ADC, which converts it to an integer count --
typically 10 to 12 bits of raw precision per pixel
(sometimes 14 in higher-end sensors). That count is the
*raw pixel value*. Everything else the pipeline does to the
image -- corrections, debayering, colour grading, format
conversion -- starts from this number, one per cell.

Saturation
----------

The photodiode has a maximum amount of charge it can give
up before its reservoir is fully drained. Past that point
the pixel is *saturated* -- additional light has no effect
on the recorded voltage, and the cell reads its maximum
value no matter how much brighter the scene gets.

The maximum amount the photodiode can lose before
saturating is its *full-well capacity*. Larger physical
pixels hold more stored charge and so have a higher
full-well capacity, which is why sensors with smaller, more
numerous pixels generally have a lower dynamic range than
their lower-resolution counterparts.
