The histogram
=============

Below the frame buffer viewer, the histogram pane plots
the distribution of pixel values in the current frame
-- or, when a region is selected in the frame buffer,
in just that region. It updates live with the preview,
so you can read what the camera sees numerically: what
colour an object is, how much it varies, and how it
separates from the background.

.. figure:: ../ide/figures/histogram.png
   :class: framed
   :alt: The histogram pane in RGB, with one plot per channel, the statistics under each, and the readout line with the resolution and focus number on top

   The histogram in RGB: one plot per channel with its
   statistics underneath. The readout line on top ends
   with the focus number.

The selector in the pane's title bar chooses the colour
space the statistics are computed in: RGB, Grayscale,
LAB, or YUV. Each channel gets its own plot, with the
channel's statistics underneath: mean, median, mode,
standard deviation, minimum, maximum, and the lower and
upper quartiles. Select a region in the frame buffer to
read the values of one object instead of the whole
scene.

The focus number
----------------

The readout line above the histogram ends with a focus
metric -- a sharpness score computed from the image.
Its absolute value means nothing; its *direction* means
everything. While adjusting a lens, watch the number:
it rises as the image gets sharper and peaks at best
focus. Point the camera at a detailed target at the
working distance, turn the lens slowly, and stop at the
maximum.
