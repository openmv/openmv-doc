The frame buffer viewer
=======================

The frame buffer viewer shows what the camera sees --
more precisely, whatever the running script last left
in the camera's frame buffer. Every
:meth:`~csi.CSI.snapshot` puts a fresh capture there,
and everything the script draws on the image afterwards
is there too, so the preview shows the frame *after*
the script's processing, annotations included. The IDE
polls the camera for the latest frame over USB and
displays each one as it arrives.

.. figure:: figures/frame-buffer.png
   :class: framed
   :alt: The frame buffer pane showing a live thermal image, its title reading Frame Buffer (JPEG) with the resolution and focus number, the Record and Zoom buttons and the source and streaming-mode selectors in the title bar, and the RGB histogram of the frame below

   The frame buffer showing a thermal camera's output.
   The title reads off the frame format, resolution,
   and focus number; the histogram below plots the
   frame.

The preview costs something: compressing and streaming
each frame takes camera time, so a script generally
runs faster with the IDE disconnected than with the
preview live. The pane's title-bar buttons manage that
trade-off:

* *Zoom* -- scale the image to fit the pane (on by
  default). Off, the image renders at one screen pixel
  per image pixel.
* The *source* selector -- which sensor streams to the
  IDE, or *Off* to stop streaming frames entirely for
  maximum camera-side performance. On a camera with
  one image sensor the choice is simply *On* or *Off*;
  a camera with more than one -- a main sensor and a
  thermal or event sensor, say -- lists each by name,
  and the frame buffer follows whichever you pick,
  independently of which one the script is reading.
  With the source off the script keeps running and the
  preview freezes on the last frame behind a "Frame
  Buffer Off" banner until you turn it back on.
  Use it when benchmarking, since the FPS the script
  achieves with the preview off is the FPS it will
  achieve standalone.
* *JPG Mode / RAW Mode* -- whether frames are JPEG
  compressed for the trip to the IDE or sent
  uncompressed. The mode starts out at whichever the
  connected camera prefers -- JPG for most. JPG mode
  is much faster; RAW mode shows the exact pixel
  values at the cost of frame rate.

The pane's title is also its readout. Once frames are
arriving it reads *Frame Buffer (JPEG)* -- or the pixel
format of a raw stream -- followed by the resolution of
the displayed image and the focus number described
with the :doc:`histogram <histogram>`.

Selecting a region
------------------

Click and drag on the image to select a rectangular
region. While a selection exists, the histogram below
computes its statistics from the selected pixels only,
and the title's readout adds the selection's position,
size, and pixel count -- the
quickest way to read off an ROI tuple for a script, or
to measure the colour statistics of one object instead
of the whole scene. Click without dragging to read off
a single pixel's position; click outside the image to
clear the selection.

Saving what the camera sees
---------------------------

Right-click the image to save the displayed frame to an
image file on your computer. The save respects the
selection: right-click inside a selected region and
just that region is saved (the menu entry reads "Save
Image selection to PC"); right-click anywhere else and
the whole frame is saved. What lands on disk is the
frame shown at the moment you right-click -- to capture
one exact frame from a moving scene, stop the script
first so the preview freezes on it.
