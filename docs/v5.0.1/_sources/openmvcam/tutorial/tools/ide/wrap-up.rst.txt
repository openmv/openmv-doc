Wrap up
=======

The IDE in one paragraph: scripts are edited in a
professional editor that knows the camera's API, run
on the camera with one button, and observed through
three live instruments -- the frame buffer viewer for
what the camera sees, the histogram for the numbers
behind it, and the serial terminal for what the script
says. Around that loop sit the maintenance tools that
keep a camera's firmware, filesystem, and ROMFS in
order; the machine-vision tools that produce the
artifacts scripts consume -- threshold tuples, cleaned
descriptors, printed tags, converted models, labelled
datasets; and the power tools that look under the hood
when performance matters.

Where to go from here:

* The :doc:`examples menu <scripts-and-examples>` is
  the standing answer to "how do I do X on the camera"
  -- nearly every library feature has a runnable
  example.
* The :doc:`library reference </library/index>`
  documents every module the completion popup offers.
* The :doc:`openmv Python package <../openmv-py/index>`
  drives a camera from host-side Python scripts -- the
  IDE's debug protocol without the IDE -- for test
  rigs, automation, and custom desktop frontends.
* The :doc:`production chapter
  <../../production/index>` picks up where the IDE's
  deploy step leaves off: baking scripts into the
  firmware, shipping assets in ROMFS, and hardening a
  camera for the field.
