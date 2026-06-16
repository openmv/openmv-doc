Rolling and global shutter
==========================

The sensor reads out its two-dimensional pixel grid one
cell at a time. Two things about that read-out shape the
recorded image: the order in which the pixels are scanned,
and how each row's exposure window lines up with that scan
in time. The first is fixed by the silicon; the second
comes in two established flavours that matter a lot for
scenes that move.

Read-out order
--------------

Typical sensors start at the bottom-left pixel and scan
rightward along that row, then advance up to the next row
and scan rightward again, and so on until they finish at
the top-right.

.. figure:: ../figures/sensor-grid.svg
   :alt: A grid of 6 columns by 4 rows of pixel cells. The
         bottom-left cell is marked "read first". A
         rightward arrow runs along each row showing the
         scan direction. To the right of the grid, an
         upward arrow labelled "rows advance" indicates
         that the scan moves up to the next row after each
         row finishes. The top-right cell is marked "read
         last".

   The pixel array is read out starting at the bottom-left
   pixel, scanning rightward along each row, and advancing
   up to the next row between rows.

The order is no accident. The lens horizontally mirrors
and vertically flips the scene as it projects it onto the
sensor -- scene-top lands at sensor-bottom and scene-left
at sensor-right -- and the bottom-left-then-up read-out
walks the sensor in the order that undoes both flips,
putting the pixels into memory right-side up.

Rolling shutter
---------------

In a *rolling-shutter* sensor, each row is exposed and
read out in turn. While one row is being read, the next is
still finishing its exposure, the row after that has just
started, and so on -- each row's exposure window is offset
slightly in time from the next. The sensor's integration
window rolls across the frame in scan order, and a full
scan takes the full frame period.

For stationary scenes this is invisible. For scenes with
fast motion the offset shows up as a *skew* -- an object
that moves between the time the first row is captured and
the time the last row is captured appears in different
positions in different rows of the same frame.

.. figure:: ../figures/rolling-vs-global.svg
   :alt: Three panels showing a vertical bar moving to the
         right. The first panel shows the bar at one
         instant, vertical. The second panel shows the same
         bar captured by rolling shutter: it appears as a
         slanted parallelogram, leaning to the right at the
         bottom, because the top rows were captured when
         the bar was at its earlier position and the bottom
         rows when it had moved to the right. The third
         panel shows the bar captured by global shutter:
         vertical and at one position.

   A vertical bar moving rightward, captured by each
   shutter type. Rolling shutter slants the bar because the
   top of the frame is read at a different time from the
   bottom; global shutter freezes the bar at one instant.

Rolling shutter is the cheaper design. Because each row is
read promptly after it finishes exposing, the pixel circuit
needs no per-pixel shielded storage to hold its value
through a sensor-wide read-out. The transistors saved leave
the photodiode a larger fraction of the pixel area, which
translates directly into higher sensitivity and lower noise
at the same physical pixel size. Most consumer image
sensors are rolling-shutter for this reason.

Global shutter
--------------

In a *global-shutter* sensor, every pixel begins its
exposure at the same instant and ends it at the same
instant. The captured charge is then transferred into a
shielded storage area on the pixel, and the row-by-row
read-out happens from there. The captured frame represents
one moment in time, no matter how fast the scene moves.

Global shutter costs more silicon, and the cost lands on
the photodiode. Holding every row's value through a
sensor-wide read-out needs an extra shielded storage cell
on each pixel plus the transistors that gate it off from
the photodiode -- area that would otherwise belong to the
photodiode itself. A smaller photodiode catches fewer
photons per unit time, so a global-shutter pixel is less
sensitive than an equivalent-size rolling-shutter pixel.
The same scene needs a longer exposure or higher gain to
record at the same brightness, and the extra circuitry
raises read-noise slightly on top of that.

The other tax is on exposure budget. In a rolling-shutter
sensor each row's exposure overlaps with neighbouring rows'
read-out, so every row can integrate light for very nearly
the full frame period. In a global shutter the read-out
cannot start until every row has finished exposing, so at
a given frame rate the maximum exposure time is the frame
period minus the full read-out time. For the same frame
rate, the rolling-shutter pixel ends up with more light per
frame.

These costs compound: global-shutter sensors are smaller
in pixel count, noisier, less sensitive, and more expensive
per pixel than their rolling-shutter counterparts. The
trade is only worthwhile when fast motion has to be
captured cleanly.

When to use which
-----------------

The shutter type is a hardware property of the sensor, not
a software setting. The choice is made when the camera is
designed.

Rolling shutter is fine when:

* the scene is stationary or moves slowly;
* the application can tolerate some skew (most
  photography and most user-interface work);
* cost and resolution per dollar are the priorities.

Global shutter is the right choice when:

* the scene contains fast motion that has to be captured
  cleanly (robotics, drones, conveyor-belt inspection);
* the camera itself is vibrating or moving relative to a
  static scene;
* the image is fed into a vision algorithm that assumes
  each frame is a single time instant (most pose-estimation
  and structure-from-motion pipelines).

.. note::

   The OpenMV Cam line defaults to global-shutter sensors
   for machine-vision use, where motion blur on a moving
   subject (or a moving camera) breaks downstream detection
   and tracking. Rolling-shutter sensor modules are also
   offered for applications where image quality of a slow
   or static scene matters more than freezing fast motion --
   classic photography-style capture.
