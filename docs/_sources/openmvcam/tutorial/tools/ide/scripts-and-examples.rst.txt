Scripts, examples, and the documents folder
===========================================

New files
---------

Creating a new file opens an ``untitled_N.py`` buffer
preloaded with a minimal capture loop -- reset the
sensor, configure the pixel format and frame size, then
snapshot and print the frame rate forever. The starter
script is adapted to the connected board, so it runs as
created. The buffer lives in memory only: it can be
edited and run repeatedly without ever being saved,
which makes new files the cheapest way to test an idea.
Saving it to disk turns it into an ordinary script.

The examples menu
-----------------

File → Examples holds a categorized library of example
scripts covering essentially every feature the camera
has -- one folder per topic, from basic snapshots
through colour tracking, machine learning, and board
peripherals. Opening an example loads it into a memory
buffer like a new file, so it can be modified and run
freely without touching the installed copy.

By default the menu is filtered to the connected board
and its sensor: examples that need hardware the
connected camera does not have are hidden, and the menu
asks for a connection before showing anything at all.
Tools → Filter examples by board and sensor type turns
the filter off to browse the full set.

Examples are also adapted on open. Scripts are written
against a typical colour sensor, so when the connected
camera differs -- a thermal or event sensor, a board
with a different native resolution -- the IDE adjusts
the pixel format and frame size lines to values the
hardware supports as it loads the example. The example
that opens is the one that runs.

Working through the examples menu is the fastest way to
learn what the camera can do; most applications start
as an example that grew.

The documents folder
--------------------

For personal scripts, the IDE watches an ``OpenMV``
directory inside the platform's documents folder
(``Documents/OpenMV``). Everything stored there appears
under File → Documents Folder, including
subdirectories, so a private script collection is one
menu away. The menu is built from the directory live --
files added outside the IDE show up the next time the
menu opens.

The IDE runs as a single instance: opening a ``.py``
file from the platform's file manager, or dropping one
onto the IDE window, opens it in the running window
rather than launching a second copy.

Cross-compiling a script
------------------------

Tools → MicroPython Tools → Copy/Convert Python File
copies a ``.py`` file to a destination -- the camera's
drive, when one is connected -- with a choice of what
happens on the way: copy it unchanged, strip
whitespace and/or comments to shrink it, or compile it
to a ``.mpy`` bytecode file with the mpy-cross
compiler matched to the target board. A ``.mpy`` file
imports exactly like the ``.py`` it came from, loads
faster, and does not ship its source -- the form to
use when distributing a library module to the camera's
filesystem. With a camera connected the target board
is taken from it automatically; otherwise the dialog
asks.

.. seealso::

   :doc:`../micropython-tools` for mpy-cross and
   mpremote as standalone command-line tools, and
   :doc:`/reference/mpyfiles` for the ``.mpy`` file
   format itself.
