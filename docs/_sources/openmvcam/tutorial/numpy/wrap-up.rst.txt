Wrap up
=======

You have walked through the parts of :mod:`numpy` and
:mod:`scipy` that fit on the camera and that an OpenMV
application reaches for to do generic numerical work
alongside the rest of its code:

* **Concepts** -- the gap that
  :class:`~image.Image` and :class:`list` leave open
  (whole-buffer math that runs as one library call
  instead of a slow Python loop), and the data
  structure that fills it: an
  :class:`~ulab.numpy.ndarray`, a packed block of
  numbers with a small descriptor recording dtype,
  shape, and strides. Constructed from a literal, from
  a pre-filled shape, from a generated sequence, or by
  wrapping an existing peripheral buffer with
  :func:`~ulab.numpy.frombuffer`. The dtype set is
  small -- ``uint8``, ``int8``, ``uint16``, ``int16``,
  ``float``, ``bool``, optionally ``complex`` -- with
  upcasting rules that promote to float when the
  integer ranges run out, and silent wrap on integer
  overflow.

* **Shape and indexing** -- the descriptor records
  shape, strides, itemsize, ndim, and size;
  :func:`~ulab.numpy.ndinfo` prints them. Single
  indices return scalars; slices and single-axis
  indexing of higher-rank arrays return *views* that
  share data with the source. Boolean masks return
  *copies*. Slice assignment writes through an array
  that already exists with no fresh allocation -- the
  basic tool for allocation-free updates on the cam.
  Reshape, transpose, and ``.T`` rewrite the
  descriptor and leave the data alone.

* **Math** -- arithmetic, bit-wise, and comparison
  operators are element-wise and run as a single
  library call per expression. Integer arithmetic
  wraps; comparisons want the array on the left.
  Universal functions cover the trig / exp / log /
  rounding surface and accept an ``out=`` buffer so
  results land in memory the application already owns.
  Broadcasting fills in shape mismatches without
  copying data. Reductions collapse axes (``sum``,
  ``mean``, ``std``, ``min``, ``max``, ``median``,
  ``argmin``, ``argmax``). Selection covers ``where``,
  ``clip``, ``nonzero``, ``sort``, ``argsort``,
  ``take``, ``compress``, ``flip``, ``roll``,
  ``diff``.

* **Linear algebra** -- :func:`~ulab.numpy.dot`,
  :func:`~ulab.numpy.cross`,
  :func:`~ulab.numpy.trace` for products;
  :func:`~ulab.numpy.linalg.inv`,
  :func:`~ulab.numpy.linalg.det`,
  :func:`~ulab.numpy.linalg.cholesky`,
  :func:`~ulab.numpy.linalg.eig`,
  :func:`~ulab.numpy.linalg.norm`,
  :func:`~ulab.numpy.linalg.qr` for decompositions; and
  the dedicated solvers
  :func:`~ulab.scipy.linalg.solve_triangular` and
  :func:`~ulab.scipy.linalg.cho_solve` when the system
  has structure.

* **Signal processing** -- FFT in the standard
  one-array-in / one-array-out form, or split real /
  imag depending on the build;
  :func:`~ulab.scipy.signal.sosfilt` for IIR
  filtering; :func:`~ulab.utils.spectrogram` for
  allocation-free magnitude spectra; the
  :func:`~ulab.utils.from_int32_buffer`-style helpers
  for wider-than-16-bit peripheral buffers.

* **Curves and integration** --
  :func:`~ulab.numpy.interp` for linear interpolation
  between sample points,
  :func:`~ulab.numpy.polyfit` / :func:`~ulab.numpy.polyval`
  for polynomial fitting and evaluation,
  :func:`~ulab.numpy.convolve` for short FIR convolutions,
  :func:`~ulab.numpy.trapz` for trapezoidal integration of
  sampled data.

* **Solvers and random numbers** --
  :mod:`scipy.integrate` (``quad``, ``romberg``,
  ``simpson``, ``tanhsinh``) for quadrature of a Python
  callable; :mod:`scipy.optimize` (``bisect``, ``newton``,
  ``fmin``) for one-dimensional root finding and
  minimisation; :mod:`scipy.special` (``erf``, ``erfc``,
  ``gamma``, ``gammaln``) for the standard statistical
  functions; :class:`~ulab.numpy.random.Generator` for
  pseudo-random sampling from common distributions.

* **Images** -- the bridge between :class:`~image.Image`
  and :class:`~ulab.numpy.ndarray` for the rare cases
  where the built-in image library does not already
  provide what is needed.

* **Performance** -- pick a small dtype, keep the long
  axis last, prefer views to copies, allocate buffers
  once and write into them with ``out=`` or slice
  assignment, use the in-place arithmetic operators,
  do not let boolean masks accumulate through a
  streaming loop.

That is enough to express custom signal processing,
small-matrix linear algebra, and per-pixel transforms
the built-in image library does not provide, on data
arriving from any peripheral the camera can read.

Using this reference later
--------------------------

The tutorial chapters cover the shapes; the
:doc:`/library/omv.ulab` reference covers the
argument-level detail. When the question is "what is
the exact signature of :func:`~ulab.numpy.linspace`",
the reference is the place to look.

Where to go from here
---------------------

Other tutorial sections build on this one wherever
numerical work shows up. Custom pixel transforms via
the :class:`~image.Image`/:class:`~ulab.numpy.ndarray`
bridge, calibration matrices that come out of small
linear-algebra solves, FFTs of buffered audio or
vibration data -- :mod:`numpy` is the toolbox the rest
of the camera leans on when an operation does not have
a built-in method.
