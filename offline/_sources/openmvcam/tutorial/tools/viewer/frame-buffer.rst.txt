The frame buffer viewer
=======================

The frame buffer viewer shows what the camera sees --
more precisely, whatever the running script last left
in the camera's frame buffer. Everything the script
draws on the image is there too, so the preview shows
the frame *after* the script's processing, annotations
included. The Viewer polls the camera for the latest
frame over USB and displays each one as it arrives.

.. figure:: ../ide/figures/frame-buffer.png
   :class: framed
   :alt: The frame buffer pane showing a live thermal image, its title reading Frame Buffer (JPEG) with the resolution and focus number, the Zoom button and the source and streaming-mode selectors in the title bar, and the RGB histogram of the frame below

   The frame buffer showing a thermal camera's output,
   with the histogram of the frame below it.

The pane's title-bar buttons manage the preview:

* *Zoom* -- scale the image to fit the pane (on by
  default). Off, the image renders at one screen pixel
  per image pixel.
* The *source* selector -- which sensor streams to the
  Viewer, or *Off* to stop streaming frames entirely
  for maximum camera-side performance. A camera with
  one image sensor offers *On* or *Off*; a camera with
  more than one lists each by name. With the source off
  the script keeps running and the preview freezes on
  the last frame behind a "Frame Buffer Off" banner
  until you turn it back on.
* *JPG Mode / RAW Mode* -- whether frames are JPEG
  compressed for the trip to the Viewer or sent
  uncompressed. JPG mode is much faster; RAW mode shows
  the exact pixel values at the cost of frame rate. The
  pane's title names the format the current frame
  arrived in.

Selecting a region
------------------

Click and drag on the image to select a rectangular
region. While a selection exists, the histogram below
computes its statistics from the selected pixels only,
and the pane's title adds the selection's position,
size, and pixel count. Click
without dragging to read off a single pixel's position;
click outside the image to clear the selection.

Saving what the camera sees
---------------------------

Right-click the image to save the displayed frame to an
image file on your computer. The save respects the
selection: right-click inside a selected region and
just that region is saved; right-click anywhere else
and the whole frame is saved. What lands on disk is the
frame shown at the moment you right-click -- to capture
one exact frame from a moving scene, stop the script
first so the preview freezes on it.
