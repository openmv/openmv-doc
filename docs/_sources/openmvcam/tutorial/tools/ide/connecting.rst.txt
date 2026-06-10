Connecting a camera
===================

The connect button -- the plug icon at the bottom of
the left toolbar, or ``Ctrl+E`` -- is how every session
starts. Clicking it scans the USB serial ports for
cameras and connects to the one it finds. With more
than one camera attached, a dialog asks which serial
port to use, preselecting the previous pick; with
none, the IDE says so and offers a recovery path for a
camera that no longer enumerates (see
:doc:`firmware`).

What happens on connect
-----------------------

Connecting is more than opening a serial port. The IDE
identifies the board, reads its firmware version, and
compares it against the release bundled with the IDE.
If the camera's firmware is older, a prompt offers to
update it -- the normal way cameras get firmware
updates is exactly this prompt. The update dialog
includes checkboxes to also erase the internal flash
filesystem and to reset the ROM file system; they
start off, remember the last choice made, and neither
is normally needed for an update. After the first
successful connect the IDE also shows a one-time
dialog explaining what the camera's LED blink colours
mean.

A camera that is attached in bootloader (DFU) mode
rather than as a normal serial device gets its own
dialog on connect, with options to install the latest
release firmware, load a specific firmware file, erase
the internal flash filesystem, or edit or reset the ROM
file system.

Two platform notes. On Windows, the IDE checks the
system device list during connect and reports USB
driver problems it finds, with the device names
involved. On Linux, a permission error opening the
serial port almost always means the user is not in the
``dialout`` group; the error dialog shows the exact
``adduser`` command to fix it.

The status bar
--------------

Once connected, the status bar along the bottom right
of the window becomes the camera's dashboard:

* *Board* -- the board type reported by the camera.
* *Sensor* -- the attached camera sensor module.
* *Firmware Version* -- the running firmware version.
  Clicking it re-checks the version against the bundled
  release and offers an update if one is available.
* *Serial Port* -- the port the connection is using.
* *Drive* -- the flash-drive mount point associated
  with the camera. Clicking it opens the drive in the
  platform's file manager, or -- when several
  candidate drives are attached -- asks which one
  belongs to the camera, remembering the answer per
  serial port. A camera connects and runs scripts fine
  without a drive association; only the drive-dependent
  actions, like opening the drive folder and saving a
  script as ``main.py``, stay disabled until one is
  set.
* *FPS* -- the rate at which frames are arriving at the
  IDE. This is the preview rate, not necessarily the
  camera's capture rate -- a script can run faster than
  the USB link can stream its frames.

.. admonition:: Screenshot needed

   ``figures/status-bar.png`` -- the bottom edge of the
   main window with a camera connected, showing the
   board, sensor, firmware version, serial port, drive,
   and FPS entries populated. Crop to the status bar.

An *Unregistered* button also appears in the status
bar for boards that require a one-time product
registration, and the IDE offers the registration
automatically on connect; once the camera is
registered the button goes away.

Disconnecting is forgiving. Clicking disconnect is the
tidy way out, but unplugging the cable works too -- the
IDE notices the camera is gone (or has stopped
responding) and disconnects on its own.

Auto reconnect
--------------

Tools → Auto Reconnect to OpenMV Cam makes connection
fully automatic: whenever a camera is detected on USB
the IDE connects to it, and the manual connect and
disconnect buttons are disabled while the option is
active. With one camera and one IDE this is the
convenient mode -- plug the camera in and it is
connected. Turn it off when juggling several cameras or
sharing the port with another program.

The related Tools → Stop Script on Connect/Disconnect
option (on by default) halts any running script when
the IDE attaches or detaches, so a freshly connected
camera is always in a known idle state. Turning it off
lets a camera keep executing its stored script while
the IDE connects to observe it.
