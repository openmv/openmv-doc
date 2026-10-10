Running the script
==================

The Viewer runs a product's script rather than one you
are editing. The start button -- the green arrow below
the connect button, or ``Ctrl+R`` -- runs the script;
while it runs, the start button becomes a stop button
that halts it. A script can be handed to the Viewer on
the command line so it starts running the moment a
camera connects, which is the usual way to point the
Viewer at a finished application.

While a script runs, its ``print()`` output streams into
the :doc:`serial terminal <serial-terminal>` and every
frame it captures appears in the :doc:`frame buffer
viewer <frame-buffer>`. That is the whole point of the
Viewer: connect a camera, run the product's script, and
watch it work.

The related Tools → Stop Script on Connect/Disconnect
option (on by default) halts the running script when the
Viewer attaches or detaches, so a camera is always left
in a known state. A camera also keeps running whatever
script is stored on it as ``main.py`` when it has power,
with or without the Viewer attached -- connecting simply
lets you watch it.
