The serial terminal
===================

The pane along the bottom of the main window is the
serial terminal: everything the running script writes
to standard output -- every ``print()``, every warning,
every traceback -- streams into it live. It is the
script's voice during development, and reading it is
half of debugging. The pane opens and closes from its
button in the bottom status bar, and like the other
panes it can be dragged larger or collapsed entirely.

.. admonition:: Screenshot needed

   ``figures/serial-terminal.png`` -- the serial
   terminal pane with a script's print output scrolling
   in it, including one traceback, with the pane's
   filter box and Save / Wrap buttons visible. Crop to
   the terminal pane.

The terminal keeps a deep scrollback (100,000 lines),
and its toolbar offers a filter box that narrows the
view to lines matching a search, a save button that
writes the whole buffer to a text file, and a wrap
toggle for long lines. The text zooms with
``Ctrl+scroll`` like the editor. Scrolling up pauses
the auto-scroll so earlier output can be read while
the script keeps printing; scrolling back to the
bottom resumes it.

The pane is output-only -- it displays what the camera
prints but does not accept typed input. For an
interactive REPL prompt on the camera, open a
:doc:`standalone terminal window <open-terminal>`
instead.

Tracebacks are wired into the editor. When a script
dies with an unhandled exception, the IDE parses the
traceback as it prints, jumps the editor to the
offending line, and -- when the failing file is a
module on the camera's drive rather than the open
script -- opens that file at the failing line. The
distance from "it crashed" to "this line crashed" is
one print.
