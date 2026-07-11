Firmware updates and recovery
=============================

The Viewer keeps the camera's firmware manager, so a
device can be recovered or re-provisioned in the field
without the full IDE. It bundles the matching firmware
release for every board and the loaders for every board
family's bootloader, and it detects the board and speaks
the right protocol without being told.

Unlike the IDE, the Viewer does not nag to update: so a
demonstration is never interrupted by an out-of-date
prompt, whatever firmware the product ships stays in
place. The firmware operations are available on demand
from the Tools menu when you do want them.

Third-party boards and fleet updates
------------------------------------

The Viewer supports :doc:`third-party repositories
<../ide/third-party-repositories>`, so a company shipping
its own board in its own Viewer can keep a fleet of those
cameras current in the field. This is the one exception to
the no-nagging rule: a third-party board *does* get the
out-of-date prompt and updates through the Viewer, because
the update is the vendor's own -- served from the URL in
the repository's manifest, not from OpenMV. OpenMV's own
boards still never prompt. The Viewer checks a
repository's firmware channel at launch and offers newer
firmware when the vendor publishes it; it does not pull
down the examples, models, or stubs a repository may also
carry, since the Viewer has no interface for them.

Loading firmware
----------------

Tools → Load Custom Firmware flashes a firmware binary
-- or a board's build-output ``.zip`` bundle -- from
disk, the way to put a product's own firmware onto a
replacement camera. The dialog offers the same options
as the IDE's: erase the internal flash filesystem, and
reset the ROM file system.

Loading a ROM file system
-------------------------

Tools → Load ROMFS onto OpenMV Cam writes a ``.img`` ROM
file system image -- a product's models and assets -- to
the camera, so the Viewer can restore a device's data as
well as its firmware.

Recovering a bricked camera
---------------------------

A camera whose firmware is broken enough that it no
longer shows up as a serial port can still be saved,
because the bootloader sits below the firmware and
survives anything short of hardware damage. When connect
finds no camera, the Viewer asks whether a bricked
camera is attached and walks you through recovery: you
select the board type, the Viewer drives the board's
bootloader interface, and the bundled release firmware
goes on. Tools → Force enter OpenMV Cam bootloader does
the reboot-into-bootloader step explicitly for a camera
that still connects.
