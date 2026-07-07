OpenMV Viewer
=============

OpenMV Viewer is the read-only companion to
:doc:`OpenMV IDE <../ide/index>`. Where the IDE is for
building an application on an OpenMV Cam, the Viewer is
for *showing off* a finished one: it connects to a
camera, runs its script, and streams the live frame
buffer, serial output, and histogram -- but the
development tools are gone. A customer, a colleague, or
a booth visitor can watch what a product does without
the full editor, the machine-vision tuning tools, or
the settings that only matter while building it.

The Viewer installs and runs on its own, separately
from OpenMV IDE, and the two can be installed side by
side.

.. figure:: figures/main-window.png
   :class: framed
   :alt: The OpenMV Viewer main window with a camera connected and a script running: the serial terminal on the left, the live frame buffer top right, the histogram below it, and the status bar reporting the connected camera.

   The OpenMV Viewer main window with a camera connected
   and its script running.

The window keeps the parts of OpenMV IDE that show what
the camera is doing. The *frame buffer viewer* shows
what the camera last captured, the *serial terminal*
below shows everything the script prints, and the
*histogram* plots the pixel statistics of the frame.
The connect and run controls sit on the toolbar, and a
status bar reports what the connected camera is doing.
What is missing is everything you would use to *change*
the application: the script-authoring features, the
machine-vision tuning tools, the AI and model tools,
and the developer settings are all removed.

Keyboard shortcuts in this chapter are written for
Windows and Linux; on macOS substitute ``Cmd`` for
``Ctrl``.

.. toctree::
   :caption: Using the viewer
   :maxdepth: 1

   connecting.rst
   running-scripts.rst

.. toctree::
   :caption: Seeing what the camera sees
   :maxdepth: 1

   frame-buffer.rst
   histogram.rst
   serial-terminal.rst

.. toctree::
   :caption: Maintaining the camera
   :maxdepth: 1

   firmware.rst

.. toctree::
   :caption: Wrap up
   :maxdepth: 1

   wrap-up.rst
