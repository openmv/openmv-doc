The serial terminal
===================

The pane along the bottom of the main window is the
serial terminal: everything the running script writes
to standard output -- every ``print()``, every warning,
every traceback -- streams into it live. It is the
script's voice during development, and reading it is
half of debugging. Open and close it from its button in
the bottom status bar; like the other panes, you can
drag it larger or collapse it entirely.

.. figure:: figures/serial-terminal.png
   :class: framed
   :alt: The serial terminal showing a script's FPS prints, the traceback that ended it, and the camera's banner

   The serial terminal: the script's prints, the
   traceback that ended the script, and the camera's
   banner after the stop.

The terminal keeps a deep scrollback (100,000 lines),
and its toolbar offers a filter box that narrows the
view to lines matching a search, a save button that
writes the whole buffer to a text file, and a wrap
toggle for long lines. The text zooms with
``Ctrl+scroll`` like the editor. Scroll up and the
auto-scroll pauses so you can read earlier output while
the script keeps printing; scroll back to the bottom
and it resumes.

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
script -- opens that file at the failing line. You go
straight from "it crashed" to the line that crashed.
