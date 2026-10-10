Shipping the application
========================

A working script on the bench and a shipped product are not the
same thing. A cam that goes into the field has to run on its own
for as long as the product is installed -- months, years -- with
no operator at the console, no IDE attached, and no Python
expert nearby when something stops working. The pages in this
section cover what changes about the application when the goal
is *shipped product* instead of *desk demo*.

A pre-flight checklist
----------------------

Before a cam leaves the bench, this is the short list of things
that should be true:

* **Application code is in the build, not on the filesystem.**
  Frozen modules and a ROMFS image cover code and assets. Flash
  and SD-card storage are for runtime state and log files only.
  The end user cannot edit, delete, or replace the application
  without reflashing.

* **A watchdog runs continuously.** :class:`machine.WDT` is
  started at the top of ``main.py`` and fed once per main-loop
  iteration. Any hang longer than the configured timeout
  causes a hardware reset and the cam comes back up.

* **The application logs to a recoverable destination.** The
  ``logging`` library writes records with a level, a
  timestamp, and a destination the field can recover from the
  SD card. :func:`print` is dev-time only -- its default
  destination is USB stdout, which no shipped product reads.

* **Flash and SD are treated as can-fail.** Internal flash holds
  small fixed-size records (configuration, last-known
  calibration); SD holds bulky variable files (image captures,
  log files); operations on either are wrapped in error
  handling, and the application has a defined fallback when
  either is unavailable.

Baking the application into the build
-------------------------------------

Two complementary mechanisms put files into the firmware image:

.. toctree::
   :maxdepth: 1

   freezing-scripts
   romfs-image
