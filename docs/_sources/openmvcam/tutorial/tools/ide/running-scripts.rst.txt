Running scripts
===============

The start button -- the green arrow below the connect
button, or ``Ctrl+R`` -- sends the script in the
current editor tab to the connected camera and runs it.
While a script runs, the start button becomes a stop
button that halts it. Those two buttons are the core
loop of all development on the camera: edit, start,
watch, stop, edit again.

Two details of that loop matter. First, the script is
sent to the camera's RAM and executed there -- starting
a script writes nothing to the camera's storage, and
the script is gone after a reset. Second, what runs is
the *current editor tab*, exactly as shown, saved or
not. There is no separate upload step and no stale copy
on the camera to fall out of sync with your editor.

While a script runs, its ``print()`` output streams
into the serial terminal and every frame it captures
appears in the frame buffer viewer. When a script
raises an unhandled exception, the traceback prints to
the serial terminal and the IDE jumps the editor to the
offending line -- for a multi-file application it first
opens the named file from the camera's drive.

Making a script permanent
-------------------------

To make the camera run a script without the IDE -- on
power-up, standalone, in the field -- store the script
on the camera as ``main.py``. Tools → Save open script
to OpenMV Cam (as main.py) writes the current editor
tab to the camera's drive under that name, offering on
the way to strip comments and compress whitespace --
which shrinks the file but ships an unreadable copy --
and Tools → Reset OpenMV Cam restarts the camera so it
boots into the stored script. Together they are the
deploy step: from then on the camera runs your script
whenever it has power, IDE or not.

While a reset camera is running its stored ``main.py``,
the IDE can still connect to it -- with Stop Script on
Connect/Disconnect on (the default), connecting halts
the stored script and hands control back to the editor.

.. seealso::

   :doc:`../../production/shipping/freezing-scripts`
   for what ``main.py`` means in the camera's boot
   sequence, and for moving a finished application out
   of editable storage entirely.

The camera's drive
------------------

The camera's flash filesystem (and SD card, when one is
inserted) mounts on the host as a USB flash drive.
Tools → Open OpenMV Cam Drive folder opens it in your
file manager. This is where you copy library modules,
model files, and assets the script imports or loads,
and where you retrieve the images and logs it saved.
The drive path also appears in the status bar.

Files a script creates do not show up on the host right
away: the host caches the filesystem from the moment
the drive mounts, so a snapshot saved by the running
script stays invisible until the drive remounts. Tools
→ Reset OpenMV Cam remounts it -- the quick way to get
at what the script just wrote.

One caution: the camera and the host share that
filesystem, and simultaneous writes from both sides can
corrupt it. Copy files while no script is writing to
storage, and eject cleanly before pulling the card.
