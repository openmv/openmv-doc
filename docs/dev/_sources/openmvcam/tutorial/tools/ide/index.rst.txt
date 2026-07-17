OpenMV IDE
==========

OpenMV IDE is the desktop application for working with
your OpenMV Cam. Everything in it serves one loop: edit
a MicroPython script, run it on the camera, and watch
the frame buffer and serial output stream back live
while it executes. The IDE is built on the Qt Creator
editor core, and the whole application is shaped
around that loop -- a script needs no project files,
build configurations, or compiler setup. You write a
script and run it on a camera; that is the whole
model.

The main window has four working regions. The *editor*
fills the left side and holds your open scripts, with
the *serial terminal* below it showing everything the
script prints. The *frame buffer viewer* sits at the
top right and shows what the camera last captured, and
the *histogram* below it plots the pixel statistics of
whatever the frame buffer shows. A column of toolbar
buttons down the far left edge holds the file, edit,
connect, and run controls, and a status bar along the
bottom edge reports what the connected camera is doing.
You can collapse any pane when the script needs the
room.

.. video:: figures/main-window.mp4
   :width: 100%
   :class: framed
   :autoplay:
   :loop:
   :muted:
   :playsinline:
   :nocontrols:
   :alt: The OpenMV IDE main window with a camera connected and a script running: the script in the editor on the left, the frame buffer on the right tracking the joints of a hand in live video
   :caption: The main window with a script running: edit on the left, watch on the right.

Keyboard shortcuts in this chapter are written for
Windows and Linux; on macOS substitute ``Cmd`` for
``Ctrl``.

.. toctree::
   :caption: The main window
   :maxdepth: 1

   editor.rst
   scripts-and-examples.rst
   connecting.rst
   running-scripts.rst
   preferences.rst

.. toctree::
   :caption: Seeing what the camera sees
   :maxdepth: 1

   frame-buffer.rst
   histogram.rst
   recording.rst

.. toctree::
   :caption: Terminals
   :maxdepth: 1

   serial-terminal.rst
   open-terminal.rst

.. toctree::
   :caption: Maintaining the camera
   :maxdepth: 1

   firmware.rst
   romfs.rst
   settings-editor/index.rst
   third-party-repositories.rst

.. toctree::
   :caption: Machine vision tools
   :maxdepth: 1

   threshold-editor.rst
   keypoints-editor.rst
   tag-generators.rst
   model-zoo.rst
   dataset-editor.rst

.. toctree::
   :caption: Power tools
   :maxdepth: 1

   profiler.rst
   command-line.rst

.. toctree::
   :caption: Wrap up
   :maxdepth: 1

   wrap-up.rst
