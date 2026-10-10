Command-line options
====================

The ``openmvide`` executable takes command-line options
that automate what the GUI normally does interactively
-- the basis for kiosk installations, demo machines,
production test stations, and any setup where the IDE
should come up connected and running with nobody at the
keyboard.

Automated startup
-----------------

The automation flags compose into a launch that needs
no clicks:

* ``-auto_connect`` -- connect to the camera on
  startup, and keep reconnecting whenever one appears
  -- the same behavior as Tools → Auto Reconnect to
  OpenMV Cam, forced on.
* ``-auto_update <release|development|path>`` -- on
  connect, install the bundled release firmware, the
  latest development firmware, or a specific firmware
  file, without prompting.
* ``-auto_erase`` -- erase the internal flash
  filesystem during the automatic update.
* ``-auto_run`` -- start the open script as soon as the
  connection is up.
* ``-disable_stop`` -- force the Stop Script on
  Connect/Disconnect option off and lock it, so the
  IDE attaching or detaching never halts the script
  already running on the camera.
* ``-full_screen`` -- start with the main window full
  screen.
* ``-serial_number_filter <serial>`` -- only connect to
  the camera with the given USB serial number, so with
  several cameras attached you can pin each IDE
  instance to one unit.

So ``openmvide -auto_connect -auto_run -full_screen``
turns a PC and a camera into an appliance: power on,
IDE appears full screen, camera connects, script runs,
preview streams.

Viewer mode
-----------

``-viewer_mode`` starts the application as *OpenMV
Viewer*: the editor and the run controls are gone, and
what remains is the frame buffer, the histogram, and
the serial output of whatever the camera is already
running. It is the mode for the person who should see
the camera but not change it -- a monitoring station on
a line, a demo the audience cannot edit.

Terminal-only windows
---------------------

The terminal flags skip the main window entirely and
open a standalone :doc:`terminal window <open-terminal>`
straight from the command line:

* ``-open_serial_terminal <port:baud>``
* ``-open_tcp_client_terminal <host:port>`` /
  ``-open_tcp_server_terminal <port>``
* ``-open_udp_client_terminal <host:port>`` /
  ``-open_udp_server_terminal <port>``

In a standalone terminal the run button executes the
camera's stored ``/main.py``.

Utility flags
-------------

``-list_ports`` prints one line of key/value fields
per camera serial port (name, description, vendor and
product IDs, serial number) to standard output and
exits -- the hook for scripts that need to discover
cameras before launching something else.
``-update_resources`` forces the IDE to rebuild its
bundled resources (examples, firmware, documentation)
as it starts, and ``-language <locale>`` overrides the
user-interface language.
