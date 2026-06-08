:mod:`ulab` --- numpy-compatible array library
==============================================

.. module:: ulab
   :synopsis: numpy-compatible array library

``ulab`` is a numpy-compatible numerical array library for MicroPython.
It provides the `ndarray` n-dimensional array type along with the
:mod:`numpy` and :mod:`scipy` submodules, which mirror a useful
subset of CPython's ``numpy`` and ``scipy`` packages. Typical usage is
to import the submodules under their conventional aliases::

   from ulab import numpy as np
   from ulab import scipy as sp

The `ndarray` class itself is exposed both at the top level (as
``ulab.ndarray``) and through the `numpy` submodule (as
``numpy.ndarray``); both refer to the same type.

Submodules
----------

.. toctree::
   :maxdepth: 1

   omv.ulab.numpy.rst
   omv.ulab.scipy.rst
   omv.ulab.utils.rst

The `ndarray` n-dimensional array class is documented under
:doc:`omv.ulab.numpy`. On the OpenMV build, :attr:`ndarray.dtype`
returns the underlying type-code integer (the integer constants
exposed at the :mod:`numpy` module level: `numpy.uint8`,
`numpy.int8`, `numpy.uint16`, `numpy.int16`, `numpy.float`,
`numpy.bool`).

Constants
---------

.. data:: __version__
   :type: str

   Version string of the ``ulab`` build, including the maximum
   supported number of array dimensions, e.g. ``"6.7.3-2D"``.

.. data:: __sha__
   :type: str

   Git hash of the ``ulab`` source the firmware was built from. Only
   present when the firmware was built with hash information embedded.
