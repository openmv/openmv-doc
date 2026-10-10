Connecting a camera
===================

Every session starts at the connect button -- the plug
icon at the bottom of the left toolbar, or ``Ctrl+E``.
Click it and the Viewer scans the USB serial ports for
cameras and connects to the one it finds. With more than
one camera attached, a dialog asks which serial port to
use, preselecting your previous pick; with none, the
Viewer says so and offers a recovery path for a camera
that no longer enumerates (see :doc:`firmware`).

On connect the Viewer identifies the board and reads its
firmware version. A camera attached in bootloader (DFU)
mode rather than as a normal serial device gets its own
dialog with recovery options. On Windows the Viewer
reports any USB driver problems it finds; on Linux, a
permission error opening the serial port almost always
means your user is not in the ``dialout`` group, and the
error names the exact command that fixes it.

The status bar
--------------

Once connected, the status bar along the bottom right of
the window becomes the camera's dashboard:

* *Board* -- the board type reported by the camera.
* *Firmware Version* -- the running firmware version.
* *Serial Port* -- the port the connection is using.
* *Drive* -- the flash-drive mount point associated with
  the camera, when one is available.
* *FPS* -- the rate at which frames are arriving at the
  Viewer. This is the preview rate, not necessarily the
  camera's capture rate; newer cameras report both.

Disconnecting is forgiving. Clicking disconnect is the
tidy way out, but unplugging the cable works too -- the
Viewer notices the camera is gone and disconnects on its
own.

Auto reconnect
--------------

Tools → Auto Reconnect to OpenMV Cam makes connection
fully automatic: whenever a camera appears on USB the
Viewer connects to it. With one camera and one Viewer
this is the convenient mode -- plug the camera in and it
is connected, running, and on screen.
