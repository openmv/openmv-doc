The Channels view
=================

A product's script can publish named values and
controls over the debug protocol -- a reading, a
detection count, a microphone waveform, a depth map, a
switch or a threshold the operator may change -- and
the *Channels* view, selected from the pane below the
frame buffer, shows them live. Readouts and controls
appear as labels, toggles, sliders, spin boxes, radio
buttons, selectors, text fields, and buttons; changing
a control sends the new value to the script. Waveforms
appear as scrolling graphs, with a spectrum mode and
triggers; depth maps appear as false-colour images
with a choice of palette, scaling, and tone mapping.
Any graph or map can be recorded to a CSV, WAV, NumPy,
or Edge Impulse file, and the last values stay on
screen when the script stops.

.. figure:: ../ide/figures/channels-controls.png
   :class: framed
   :alt: The Channels view showing a thermal camera script's controls channel: FPA and AUX temperature readouts with their unit, Measurement and High Temp toggles, Temp Min and Temp Max sliders, and H-Mirror and V-Flip toggles

   A thermal camera script's controls as the Channels
   view renders them.

The view is the same one OpenMV IDE has; its
:doc:`Channels view <../ide/channels>` page covers
every control, the graph and map tools, and recording
in detail.
