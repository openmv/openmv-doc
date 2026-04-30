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

The optional ``user`` and ``utils`` submodules — present only when the
firmware was built with ``ULAB_HAS_USER_MODULE`` or
``ULAB_HAS_UTILS_MODULE`` respectively — are not documented here.

Submodules
----------

.. toctree::
   :maxdepth: 1

   omv.ulab.numpy.rst
   omv.ulab.scipy.rst

Classes
-------

.. class:: dtype(t: int | str | None = None)

   Data-type descriptor for an `ndarray`. A ``dtype`` instance carries
   one of the type codes ``'b'`` (bool), ``'B'`` (uint8), ``'b'``
   (int8), ``'H'`` (uint16), ``'h'`` (int16), ``'f'`` / ``'d'`` (float)
   or ``'D'`` (complex), and is what is returned by the
   :attr:`ndarray.dtype` property.

   The constructor accepts either a single-character type code, one of
   the integer constants exposed by `numpy` (`numpy.uint8`,
   `numpy.int8`, `numpy.uint16`, `numpy.int16`, `numpy.float`,
   `numpy.bool`, and -- if the firmware was built with complex
   support -- `numpy.complex`), or another `dtype` instance.

   When the firmware is built with ``ULAB_HAS_DTYPE_OBJECT`` disabled,
   :attr:`ndarray.dtype` returns the underlying type-code integer
   directly instead of a ``dtype`` object, and this class is not
   available.

The `ndarray` n-dimensional array class is documented under
:doc:`omv.ulab.numpy`.

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
