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
   :alt: The frame buffer pane showing a live image with a selection rectangle over one object, the Zoom, Disable, and JPG Mode buttons in the title bar, and the histogram below computing from the selection

   The frame buffer with a region selected: the readout
   line and the histogram below it compute from the
   selected pixels only.

The pane's title-bar buttons manage the preview:

* *Zoom* -- scale the image to fit the pane (on by
  default). Off, the image renders at one screen pixel
  per image pixel.
* *Disable* -- stop streaming frames entirely, for
  maximum camera-side performance. The script keeps
  running; the preview freezes on the last frame behind
  a "Frame Buffer Disabled" banner until you re-enable
  it.
* *JPG Mode / RAW Mode* -- whether frames are JPEG
  compressed for the trip to the Viewer or sent
  uncompressed. JPG mode is much faster; RAW mode shows
  the exact pixel values at the cost of frame rate. On
  newer cameras a greyed label beside the button names
  the format the current frame arrived in.

Selecting a region
------------------

Click and drag on the image to select a rectangular
region. While a selection exists, the histogram below
computes its statistics from the selected pixels only,
and the readout line above the histogram reports the
selection's position, size, and pixel count. Click
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
