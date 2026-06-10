Standalone terminal windows
===========================

Tools → Open Terminal opens independent terminal
windows -- each one a miniature OpenMV IDE session in
its own window, with a frame buffer viewer, a
histogram, and an interactive terminal, connected over
a transport of its choosing. The main window's
connection is unaffected, so a standalone terminal is
how a second camera gets watched while the first stays
connected, and how a camera on the far side of a
network gets debugged at all.

.. admonition:: Screenshot needed

   ``figures/open-terminal.png`` -- a standalone
   terminal window connected to a cam: frame buffer
   showing an image at top, histogram below it,
   terminal text area at the bottom with a REPL prompt
   visible. Capture the whole window.

New Terminal asks for one of three transports:

* *Serial port* -- any serial port at any baud rate
  (default 115,200). This covers a second camera's USB
  port, a camera wired up over a USB-to-UART bridge, a
  Bluetooth serial link (which shows up as an ordinary
  serial port), or any non-OpenMV serial device that
  needs a terminal.
* *TCP* -- connect to a server at a chosen host and
  port, or listen as one on a chosen port.
* *UDP* -- the same pair of roles, over UDP.

The last ten configurations are remembered and listed
in the Open Terminal submenu for one-click reopening
later; Clear Menu forgets them.

Unlike the main window's output-only pane, a standalone
terminal is fully interactive: it is a REPL. Typing at
the prompt executes Python on the connected camera
line by line, with history and tab completion provided
by MicroPython itself. The toolbar adds one-click
equivalents of the common control sequences -- run the
current editor script, stop the running script, and
soft reset -- and the same clear, save, and wrap
controls as the main terminal pane.

The frame buffer above the terminal is live too. When
the connected camera streams compressed frames in-band
-- which is what a camera script does when it prints
frames through the IDE's debug protocol over a network
socket -- the terminal decodes and displays them, and
the Record and Zoom buttons work exactly as they do in
the main window. That combination is the IDE's
network-debugging story: a camera that exposes its
REPL over Wi-Fi gets a full editor-run-preview loop
with no USB cable involved.
