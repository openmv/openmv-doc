.. _tutorial-index:

OpenMV Cam Tutorial
===================

The OpenMV Cam is a small, programmable, MicroPython-driven
camera designed for embedded machine vision. This tutorial
covers what to do with one, end to end -- from unboxing a
camera and writing the first script in the OpenMV IDE, to
the Python and hardware basics every script rests on, to the
camera's imaging stack and the image-processing and machine-
learning tools built on top of it, through the concurrency
and networking pieces an application reaches for when it
grows up, and finally the practical work of taking a working
prototype to a shipped product.

The chapters are written to be readable in order for a new
user, but each one is also self-contained -- a reader who
already knows Python can skip the Python Overview, and a
reader who has shipped before can skip straight to
*Production*. Where one chapter builds on something covered
earlier, it links back.

.. toctree::
   :numbered:
   :maxdepth: 1

   quickstart.rst

   python/index.rst
   hardware/index.rst

   vision/index.rst
   image/index.rst
   numpy/index.rst
   ml/index.rst

   asyncio/index.rst
   networking/index.rst
   webservers/index.rst
   bluetooth/index.rst
   protocol/index.rst

   tools/index.rst

   production/index.rst
