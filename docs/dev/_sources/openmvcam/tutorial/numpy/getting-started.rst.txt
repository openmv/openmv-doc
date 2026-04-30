Getting started with numpy
==========================

This page is a hands-on introduction to ``numpy`` on the OpenMV Cam.
If you already know desktop ``numpy``, the takeaway is short:
everything works the same -- just import ``numpy`` from ``ulab``.

What ``ulab`` actually is
-------------------------

``ulab`` is a ``numpy``- and ``scipy``-compatible library written in C
for MicroPython. It provides:

* compact, iterable and slice-able n-dimensional containers of
  numerical data (``ndarray``);
* vectorised computations on iterables and ``ndarray``\ s (the so
  called *universal functions*);
* statistical helpers (``mean``, ``std``, ``median`` ...);
* basic linear algebra (matrix inversion, multiplication, eigenvalues,
  Cholesky factorisation, ...);
* polynomial fits and evaluation;
* fast Fourier transforms;
* simple filtering (convolution, second-order sections);
* function minimisation, root finding and numerical integration;
* utilities for converting raw peripheral buffers to and from arrays.

The Python-level API tracks CPython ``numpy`` very closely. The most
important practical differences are:

* a smaller set of dtypes (no ``int32``, ``int64``, ``float128``,
  string types, etc.) -- see :doc:`ndarray`;
* slightly different upcasting rules (because of the smaller dtype
  set);
* a few API simplifications driven by RAM and flash limits.

Importing
---------

The ``numpy``-compatible API lives inside the ``ulab`` package and is
conventionally aliased as ``np``::

   from ulab import numpy as np

For the ``scipy`` submodule, the convention is ``sp`` (or ``spy``)::

   from ulab import scipy as sp

If you want a script that runs unchanged on both your desktop CPython
and on the OpenMV Cam, use a ``try`` / ``except`` import::

   try:
       from ulab import numpy as np
       from ulab import scipy as sp
   except ImportError:
       import numpy as np
       import scipy as sp

This is the official ``ulab`` recommendation: testing and debugging on
a PC and then loading the very same code onto the camera.

The ``fft``, ``linalg`` and ``random`` modules are accessed through
their parent module, exactly as in CPython ``numpy``::

   from ulab import numpy as np

   spectrum = np.fft.fft(samples)
   inv      = np.linalg.inv(matrix)

Creating an array
-----------------

The fundamental object is the ``ndarray``. Create one from a
MicroPython iterable::

   from ulab import numpy as np

   a = np.array([1, 2, 3, 4, 5, 6, 7, 8])
   print(a)
   # array([1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0], dtype=float64)

The default ``dtype`` is ``float``. For data coming from sensors,
choose a smaller type and save RAM::

   b = np.array([1, 2, 3, 4], dtype=np.uint8)   # 1 byte per element
   c = np.array([1, 2, 3, 4], dtype=np.int16)   # 2 bytes per element

The supported dtypes are ``np.uint8``, ``np.int8``, ``np.uint16``,
``np.int16``, ``np.float`` and (if the firmware supports it)
``np.complex``.

Two-dimensional arrays are built from nested iterables::

   m = np.array([[1, 2, 3],
                 [4, 5, 6],
                 [7, 8, 9]], dtype=np.uint8)

If the inner iterables have different lengths, ``np.array`` raises a
``ValueError``. Mixed iterable types (``range`` + ``list``, etc.) are
fine.

Useful constructors
-------------------

The same array-creation helpers you know from ``numpy`` are available.
Here is the full list, with one-line descriptions:

* ``np.zeros(shape, dtype=float)`` -- new array filled with zeros.
* ``np.ones(shape, dtype=float)`` -- new array filled with ones.
* ``np.full(shape, value, dtype=...)`` -- new array filled with ``value``.
* ``np.empty(shape, dtype=...)`` -- alias for ``zeros`` in ``ulab``.
* ``np.eye(N, M=None, k=0, dtype=float)`` -- identity (or shifted
  identity).
* ``np.diag(v, k=0)`` -- create a diagonal matrix from a vector, or
  extract the diagonal of a matrix.
* ``np.arange(start, stop, step, dtype=...)`` -- evenly spaced
  integers (or floats).
* ``np.linspace(start, stop, num=50, endpoint=True, dtype=float)`` --
  evenly spaced points between two limits.
* ``np.logspace(start, stop, num=50, endpoint=True, base=10,
  dtype=float)`` -- geometrically spaced sequence.
* ``np.frombuffer(buf, dtype=float, count=-1, offset=0)`` -- wrap a
  ``bytes``-like buffer as a typed array, with no copy.

Quick examples::

   np.zeros((3, 3))                    # 3x3 of zeros
   np.ones(5, dtype=np.uint8)          # length-5 vector of ones
   np.arange(0, 10, 2)                 # 0, 2, 4, 6, 8
   np.linspace(0, 1, num=11)           # 0.0, 0.1, 0.2, ..., 1.0
   np.eye(4)                           # 4x4 identity
   np.full((2, 3), 7)                  # 2x3, filled with 7
   np.diag([1, 2, 3])                  # 3x3 diagonal matrix
   np.logspace(0, 3, num=4)            # 1, 10, 100, 1000

``np.frombuffer`` is invaluable on a microcontroller. It re-interprets
an existing buffer (UART, SPI, ADC, audio capture, ...) as a typed
array *without copying*, and accepts ``offset=`` and ``count=``
keyword arguments to skip a header or limit the number of values
read::

   buffer = b'\x01\x02\x03\x04\x05\x06\x07\x08'
   a = np.frombuffer(buffer, dtype=np.uint16)
   # array([513, 1027, 1541, 2055], dtype=uint16) on a little-endian MCU

   b = np.frombuffer(buffer, dtype=np.uint8, offset=2)
   # array([3, 4, 5, 6, 7, 8], dtype=uint8)

   c = np.frombuffer(buffer, dtype=np.uint8, offset=2, count=3)
   # array([3, 4, 5], dtype=uint8)

For an exhaustive reference of all of these constructors, see
:doc:`/library/omv.ulab.numpy`.

Basic operations
----------------

Arithmetic, comparison and bit-wise operators are *element-wise* and
broadcast over scalar operands::

   from ulab import numpy as np

   a = np.array([1, 2, 3, 4], dtype=np.float)
   b = np.array([10, 20, 30, 40], dtype=np.float)

   print(a + b)        # array([11.0, 22.0, 33.0, 44.0])
   print(a * 2)        # array([2.0, 4.0, 6.0, 8.0])
   print(b - a)        # array([9.0, 18.0, 27.0, 36.0])
   print(a > 2)        # array([False, False, True, True], dtype=bool)

Universal functions (``sin``, ``cos``, ``exp``, ``log``, ``sqrt``,
``abs``, ...) work the same way::

   x = np.linspace(0, 2 * np.pi, num=8)
   y = np.sin(x)

See :doc:`universal` for a tour of the universal functions.

Reductions return scalars (or arrays, if you pass an ``axis``)::

   np.sum(a)           # 10.0
   np.mean(a)          # 2.5
   np.max(b)           # 40.0
   np.min(b)           # 10.0
   np.std(a)           # standard deviation
   np.median(a)        # 2.5

.. note::

   In ``ulab``, the relational operators (``<``, ``>``, ``<=``,
   ``>=``, ``==``, ``!=``) require the ``ndarray`` to be on the
   *left*. ``a > 2`` works; ``2 < a`` raises ``TypeError``. Use
   ``np.equal``/``np.not_equal``/``np.greater``/``np.less`` if you
   need the symmetric form (and CircuitPython-style equality).

Why bother (a benchmark)
------------------------

The whole point of using ``ulab`` over a list comprehension is
speed. ``ulab`` runs C code with very little Python overhead. Typical
speedups for binary operators are around 30-50x, regardless of the
hardware platform. As an example, on a 1000-element addition::

   import time
   from ulab import numpy as np

   N = 1000

   def py_add(a, b):
       return [a[i] + b[i] for i in range(N)]

   def np_add(a, b):
       return a + b

   a_list = [float(i) for i in range(N)]
   b_list = [1.0] * N
   a_arr  = np.array(a_list)
   b_arr  = np.array(b_list)

   t0 = time.ticks_us()
   py_add(a_list, b_list)
   print('python:', time.ticks_diff(time.ticks_us(), t0), 'us')

   t0 = time.ticks_us()
   np_add(a_arr, b_arr)
   print('numpy: ', time.ticks_diff(time.ticks_us(), t0), 'us')

The bigger the array, the larger the win. The same factor applies to
``np.sum``, ``np.exp`` and similar element-wise computations: a
1024-point FFT, for example, takes around 2 ms on STM32 hardware
where a pure-Python implementation would take 90 ms.

Discovering what your firmware supports
---------------------------------------

``ulab`` has many compile-time options, so what is actually available
on a given firmware build can vary. The simplest way to check is
``dir()``::

   from ulab import numpy as np
   from ulab import scipy as sp

   print(dir(np))
   print(dir(np.fft))
   print(dir(np.linalg))
   print(dir(sp))
   print(dir(sp.signal))
   print(dir(sp.optimize))

Operators (``**``, ``%``, ``&`` etc.) cannot be discovered with
``dir`` -- the only way is to ``try`` them and catch the exception.

The ``ulab`` version, including the maximum number of supported
dimensions and whether complex support is compiled in, is reported
through ``ulab.__version__``::

   import ulab
   print(ulab.__version__)
   # '4.0.0-2D-c'

The trailing ``2D`` is the maximum supported tensor rank, and ``-c``
indicates complex support is enabled.

Where to go next
----------------

* :doc:`ndarray` -- creating, slicing, reshaping, broadcasting and
  iterating arrays.
* :doc:`universal` -- element-wise math and how to vectorise your own
  Python functions.
* :doc:`images` -- moving data between ``image.Image`` and
  ``ndarray``.
* :doc:`tricks` -- performance tips, broadcasting, advanced indexing.
* :doc:`fft` -- Fourier transforms.
* :doc:`linalg` -- linear algebra.
* :doc:`scipy` -- the ``scipy`` submodule.
* :doc:`utils` -- utilities for peripheral buffers and spectrograms.
* :doc:`programming` -- Python-level patterns for memory-efficient
  computation.
* :doc:`/library/omv.ulab.numpy` -- complete API reference.
