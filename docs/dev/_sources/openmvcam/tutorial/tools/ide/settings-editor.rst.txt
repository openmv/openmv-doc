The settings editor
===================

Many camera applications need a handful of settings a
non-programmer can change -- a threshold, a mode, a
Wi-Fi password -- without touching the script. The
OpenMV Cam Settings Editor is the IDE's tool for that:
a JSON file describes the controls, the editor turns
that description into a form, and your script reads the
saved values back with :func:`json.load`. The file is
both the configuration and the definition of its own
editor, so the same config that stores the values also
lays out the GUI for editing them.

The Tools → OpenMV Cam Settings Editor submenu holds
its three actions.

* *Open OpenMV Cam Settings Config File* reads the
  config from the connected camera's drive and opens it
  in the editor; saving writes it back to the camera.
* *Open Config File* does the same for a ``.json`` file
  on your computer, for preparing a configuration
  offline.
* *Create Default Config* writes a starter
  configuration to disk and opens it -- a worked
  example that exercises every control type, ready to
  strip down to the settings your own application needs.

.. figure:: figures/settings-editor.png
   :class: framed
   :alt: The OpenMV Cam Settings Editor showing the default demo configuration -- Camera, Processing, Network, and System tabs, with the Camera tab's exposure and gain sliders, resolution and pixel-format dropdowns, mirror and flip checkboxes, and a digital-zoom slider, above the Save and Cancel buttons

   The settings editor with the default configuration open --
   the JSON file's controls laid out as a form (tabs, sliders,
   dropdowns, checkboxes), with Save and Cancel at the bottom.

How it works
------------

The config file is a JSON object with a ``title`` and a
``controls`` array. Each entry in the array is one
control -- a text field, number, checkbox, dropdown,
slider, a group of tabs, a static label, and so on --
and the editor builds the matching widget for each. A
control carries the value it edits, so saving the form
writes the edited values straight back into the same
JSON. The editor validates input as you go and refuses
to save while a field holds invalid or incomplete input,
naming the fields to fix.

In your script, the settings are just JSON:
:func:`json.load` the file from the camera's drive and
read the values by name. Nothing in the script depends
on the editor -- the editor only writes the file the
script already reads -- so a device can carry its
configuration and a friendly way to change it while the
script stays a plain reader of values.

Start from *Create Default Config* to see the shape of a
config file and every control type it can contain, then
replace the demo controls with your application's own.
