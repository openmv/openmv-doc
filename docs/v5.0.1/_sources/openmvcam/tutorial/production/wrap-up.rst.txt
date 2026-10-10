Wrap up
=======

You have walked through the lifecycle of a cam going from
working bench script to shipped product:

* **Custom firmware builds** -- the dev environment, building
  the firmware image from source, flashing it onto a cam, and
  the debugging path from VS Code Cortex-Debug to command-line
  ``gdbrunner`` when something is wrong on the firmware side.

* **Shipping the application** -- baking the application code
  into the firmware via frozen modules, baking assets into a
  ROMFS image, and the lookup order that determines which copy
  of a file the runtime actually loads at boot. The split
  that falls out: ``boot.py`` for pre-REPL environment setup,
  ``main.py`` as the application's entry point, frozen
  ``main.py`` for the entry and ROMFS for everything else.

* **Hardening for production** -- the :mod:`logging` library
  written to a known path, a :class:`machine.WDT` fed once
  per main-loop iteration, a top-level ``try`` / ``except``
  that turns crashes into logged events instead of resets,
  filesystem hygiene that keeps file operations fast as the
  application accumulates records over months in the field,
  and -- when the product calls for it -- flash readout
  protection.

* **Advanced material** -- TLS certificates for cams that need
  to authenticate to and encrypt traffic with network
  services.

A shipped cam has all of this in place: its application code
runs from the firmware image, its watchdog is fed once per
main-loop iteration, its log lands in a dated directory on
the SD card, and -- when the product calls for it -- its
flash has been locked against readout.

Where to go from here
---------------------

Production is the last chapter of the tutorial. From here
the documentation splits into reference material:

* The :doc:`library reference </library/index>` is the
  alphabetical "what is the exact name of this call" view of
  every module the cam exposes -- :mod:`machine`,
  :mod:`logging`, :mod:`os`, :mod:`csi`, :mod:`image`,
  :mod:`ml`, and the rest.

* The :doc:`per-board quickref pages </openmvcam/quickref>`
  cover the specifics of every cam in the OpenMV product
  line -- pinouts, mountable buses, board IDs, peripheral
  availability, and the small differences that matter when
  the application has to land on a specific part.

* The :doc:`sensor reference pages </openmvcam/sensors>` and
  :doc:`shield reference pages </openmvcam/shields>` cover
  the individual image sensors and add-on shields a cam can
  carry -- the per-part specifications, pinouts, and notes
  the application needs when picking sensors and shields for
  a build.

* The :doc:`MicroPython language reference </reference/index>`
  covers the language itself -- syntax differences from
  CPython, the implementation specifics that matter when a
  script straddles the two, and the inline-assembler
  reference for the rare case where Python is too slow.

The tutorial is the path from "I have a new cam in hand" to
"I have shipped a product." From here the cam is one piece of
a larger system the application is responsible for, and the
work is the application's own.
