OpenMV IDE
==========

OpenMV IDE is the desktop application built around one
workflow: edit a MicroPython script, run it on a
connected camera, and watch the frame buffer and serial
output stream back live while it executes. It is built
on the Qt Creator editor core, with everything that is
not that workflow stripped away -- no project wizards,
no build configurations, no compiler setup. A script
and a camera are the whole model.

The main window has four working regions. The *editor*
fills the left side and holds the open scripts, with
the *serial terminal* below it carrying everything the
script prints. The *frame buffer viewer* sits at the
top right and shows what the camera last captured, and
the *histogram* below it plots the pixel statistics of
whatever the frame buffer shows. A column of toolbar
buttons down the far left edge holds the file, edit,
connect, and run controls, and a status bar along the
bottom edge reports the connected camera's vital
signs. Every pane can be collapsed when the script
needs the room.

.. admonition:: Screenshot needed

   ``figures/main-window.png`` -- the full main window
   with a camera connected and a script running: editor
   with a script visible, frame buffer showing a live
   image, histogram populated, serial terminal showing
   FPS prints, status bar populated at bottom right.
   Default theme, default pane layout.

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
