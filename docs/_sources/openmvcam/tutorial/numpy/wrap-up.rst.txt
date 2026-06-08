Wrap up
=======

The chapter covered the parts of :mod:`numpy` and
:mod:`scipy` an OpenMV application reaches for when an
operation does not have a built-in image-library method:

* **Concepts** -- what an :class:`~numpy.ndarray` is,
  why a packed typed buffer beats a Python
  :class:`list` for numerical work, and the dtype set
  the cam supports.
* **Shape and indexing** -- views vs. copies, slice
  assignment for allocation-free updates,
  :meth:`~numpy.ndarray.transpose` as a descriptor
  edit.
* **Math** -- element-wise operators, universal
  functions like :func:`~numpy.sin`, broadcasting
  rules, reductions like :func:`~numpy.mean`, and
  selection helpers like :func:`~numpy.where`.
* **Linear algebra** -- :func:`~numpy.dot` for matrix
  multiply, :func:`~numpy.linalg.inv` /
  :func:`~numpy.linalg.det` for the inverse, and the
  decompositions and solvers under
  :mod:`numpy.linalg` and :mod:`scipy.linalg` for
  problems with more structure.
* **Signal processing** -- :func:`~numpy.fft.fft`,
  :func:`~scipy.signal.sosfilt` for digital filtering,
  and :func:`~ulab.utils.spectrogram` for
  allocation-free magnitude spectra in a streaming
  loop.
* **Curves and integration** -- :func:`~numpy.interp`,
  :func:`~numpy.polyfit` / :func:`~numpy.polyval`,
  :func:`~numpy.convolve` for short FIR filters,
  :func:`~numpy.trapz` for trapezoidal integration of
  sampled data.
* **Solvers and random numbers** --
  :mod:`scipy.integrate` for quadrature of a Python
  callable, :mod:`scipy.optimize` for root finding and
  minimisation, :mod:`scipy.special` for statistical
  special functions, and
  :class:`~numpy.random.Generator` for pseudo-random
  sampling.
* **Images** -- the :meth:`~image.Image.to_ndarray` and
  :class:`image.Image` bridge for the rare cases the
  image library does not cover.
* **Performance** -- small dtypes, pre-allocated
  buffers, in-place operators, ``out=`` keywords, and
  watching out for boolean-mask churn in streaming
  loops.

That covers the generic numerical work the rest of the
camera leans on. :mod:`numpy` is the toolbox an
application reaches into when an operation does not
have a built-in method on :class:`~image.Image` -- a
custom pixel transform, a calibration solve, an FFT of
buffered audio.
