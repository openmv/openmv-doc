Building a ROMFS image
======================

A *ROMFS image* is a flash-resident, read-only
filesystem the firmware mounts at ``/rom/``. It is the
right place to ship assets that are too large or too
many to freeze as Python modules: machine-learning model
files, label tables, JSON configuration, image
templates, anything the application opens and reads but
never writes.

This page covers building a ROMFS partition image
offline and laying it down alongside the firmware so the
shipped device reads from it directly at boot.

(Page in progress -- content to come.)
