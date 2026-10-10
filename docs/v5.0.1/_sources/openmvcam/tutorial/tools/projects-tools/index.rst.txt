OpenMV Projects Tools
=====================

The `OpenMV Projects Tools
<https://github.com/openmv/openmv-projects/tree/master/tools>`__
are a growing collection of desktop GUI applications,
each paired with a companion MicroPython script on the
camera. The cam captures and streams sensor data; the
desktop app receives it over USB and provides the
real-time visualisation, parameter tuning, or
calibration workflow that one specific use case needs.

.. image:: ccm-tuning.jpg
   :alt: The CCM Tuning desktop GUI displaying live raw Bayer
         output from an OpenMV N6 alongside a software replica
         of the cam's ISP pipeline and an interactive
         colour-correction matrix solver.
   :align: center

Each tool has its own subdirectory in the repository
with the desktop script, the companion cam-side script,
a README covering install and usage, and screenshots.

Tools currently in the repository include calibration
utilities for overlaying thermal or event-camera output
on a colour frame, an interactive ISP tuner for the
OpenMV N6's colour pipeline (live debayer, white
balance, and colour-correction matrix), and a real-time
visualiser for the Prophesee GenX320 event sensor.
New tools land in the repository as new sensors or
workflows call for one.

Every tool follows the same shape: a Python desktop
application built with `DearPyGui
<https://github.com/hoffstadt/DearPyGui>`__, talking to
the cam through the openmv Python package over USB
serial. Python 3.12 or newer is required; macOS and
Linux give the best USB throughput.
