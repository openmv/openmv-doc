numpy / scipy on the OpenMV Cam
===============================

The OpenMV Cam ships with `ulab <https://github.com/v923z/micropython-ulab>`_,
a ``numpy`` and ``scipy`` compatible library written in C for
MicroPython. ``ulab`` lets you do fast, vectorised numerical work on
the camera itself: array math, linear algebra, FFTs, polynomial
fitting, basic statistics and signal processing -- without leaving
MicroPython.

What it is
----------

``ulab`` is a *subset* of ``numpy`` and ``scipy`` that has been
trimmed and tuned to fit on a microcontroller. The Python-level API
matches CPython ``numpy`` very closely, so most code that works on
your desktop also runs on the OpenMV Cam. It is conventionally
imported as::

   from ulab import numpy as np
   from ulab import scipy as sp

When to use it
--------------

Reach for ``numpy`` on the OpenMV Cam when you want to:

* Process buffers from sensors (ADC samples, IMU data, microphone
  audio, time-of-flight depth maps, low-resolution thermal images).
* Run an FFT or simple filter on a streamed signal.
* Do linear algebra on small matrices (camera calibration, sensor
  fusion, kinematics).
* Manipulate pixel data with element-wise math, masks and slicing
  before or after running OpenMV's built-in image processing.

For pure pixel-level work, OpenMV's built-in :doc:`image library
</library/omv.image>` is usually faster and uses less RAM, because it
operates directly on the framebuffer in the camera's native pixel format.
``numpy`` is the right tool when you need a *generic numerical*
operation that the image library does not provide, or when you want
to bridge to algorithms expressed in standard ``numpy`` form.

When *not* to use it
~~~~~~~~~~~~~~~~~~~~

* For simple per-pixel thresholding, blob detection, edge filtering,
  template matching, etc., use the built-in ``image`` module --
  it is much faster than the equivalent ``numpy`` expression.
* For very large arrays. The OpenMV Cam has limited RAM. A 320x240
  ``float32`` array is 300 kB.

Tutorial pages
--------------

.. toctree::
   :maxdepth: 1

   getting-started.rst
   ndarray.rst
   universal.rst
   images.rst
   fft.rst
   linalg.rst
   scipy.rst
   utils.rst
   tricks.rst
   programming.rst

API reference
-------------

The full ``ulab`` API reference lives under the library section:

* :doc:`/library/omv.ulab.numpy` - the ``numpy`` submodule (and the ``ndarray`` class).
* :doc:`/library/omv.ulab.numpy.fft` - Fourier transforms.
* :doc:`/library/omv.ulab.numpy.linalg` - linear algebra.
* :doc:`/library/omv.ulab.numpy.random` - random number generation.
* :doc:`/library/omv.ulab.scipy` - the ``scipy`` submodule.
* :doc:`/library/omv.ulab` - top-level ``ulab`` module.
