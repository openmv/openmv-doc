Firmware updates and recovery
=============================

The IDE is also the camera's firmware manager. Every
IDE release bundles the matching firmware release for
every board, the version check runs automatically on
connect, and the loaders for every board family's
bootloader are built in -- the IDE detects the board
and speaks the right protocol without being told.
Keeping a camera's firmware current therefore takes no
tooling beyond connecting it and accepting the prompt.

Updating
--------

When connect finds a camera running firmware older
than the bundled release, it finishes connecting and
then offers the update (the prompt can be permanently
dismissed for that version). Accepting reboots the
camera into its bootloader, programs the new firmware,
and reconnects. The update dialog's two checkboxes --
erase the internal flash filesystem, and reset the ROM
file system -- start unchecked and remember the last
choice made; with both off an update preserves
everything stored on the camera. The exception is
updating from very old firmware, where the dialog
forces the erase on and says so with a warning. The
same check runs on demand from the firmware version
entry in the status bar.

Between releases, Tools → Install the Latest
Development Release fetches and installs the current
development build for the connected board -- the way to
pick up a fix or a new feature that has merged but not
yet shipped. Development builds are exactly that;
production cameras should track releases.

Independently of firmware, the IDE checks at launch
whether updated resources -- examples, bundled
firmware, documentation -- are available for the IDE
itself, and offers to install them. It also reports
when a newer version of the IDE itself is available,
with a link to the download page.

Loading custom firmware
-----------------------

Tools → Load Custom Firmware (``Ctrl+Shift+L``) flashes
a firmware binary from disk instead of the bundled
release -- the deployment path for firmware built from
source, with frozen scripts or a custom configuration
baked in. The dialog takes the firmware file and the
same erase-filesystem and reset-ROMFS checkboxes as the
update prompt.

.. seealso::

   :doc:`../../production/firmware/building` for
   building that binary in the first place.

Erasing the filesystem
----------------------

Tools → Erase Internal FAT File System
(``Ctrl+Shift+E``) reformats the camera's internal
flash filesystem, removing every stored file --
``main.py``, libraries, assets, logs -- and recreating
the default contents. It is the factory-reset for the
camera's storage: the fix for a corrupted filesystem,
and the clean slate before handing a camera to someone
else. The firmware itself and the ROM file system are
untouched.

Recovering a bricked camera
---------------------------

A camera whose firmware is broken enough that it no
longer shows up as a serial port can still be saved,
because the bootloader sits below the firmware and
survives anything short of hardware damage. When
connect finds no camera, the IDE asks whether a bricked
camera is attached and walks through recovery: select
the board type, the IDE puts the board's bootloader
interface to work, and the bundled release firmware
goes on. Tools → Force enter OpenMV Cam bootloader does
the reboot-into-bootloader step explicitly for a camera
that still connects. Boards also have a hardware way to
force the bootloader at power-up for the worst case;
each board's quick reference page covers its specific
procedure.
