NumPy
=====

The :class:`~image.Image` class covers the per-pixel
work the camera already knows how to do -- thresholds,
blob finding, edge detection, and the rest of the image
library. The :mod:`numpy` module covers everything
else: ADC readings and other buffers of plain numbers,
math that runs across a whole buffer at once, and
per-pixel transforms the image library has not already
built in.

Enter the :class:`~ulab.numpy.ndarray`, a single class
that holds a packed block of equally typed numbers.
Everything else in ``numpy`` is a math function that
operates on an ``ndarray``. Adding two arrays together,
summing one of them, taking a sine of every element --
each is a single library call that processes the whole
buffer in one go, much faster than the equivalent
Python ``for`` loop.

.. toctree::
   :caption: Concepts
   :maxdepth: 1

   basics/why-arrays.rst
   basics/the-ndarray.rst
   basics/making-arrays.rst
   basics/dtypes.rst

.. toctree::
   :caption: Shape and indexing
   :maxdepth: 1

   shape/shape-and-strides.rst
   shape/indexing-and-slicing.rst
   shape/views-and-copies.rst

.. toctree::
   :caption: Math
   :maxdepth: 1

   math/operators.rst
   math/universal-functions.rst
   math/broadcasting.rst
   math/reductions.rst
   math/selection.rst

.. toctree::
   :caption: Linear algebra
   :maxdepth: 1

   linalg.rst

.. toctree::
   :caption: Signal processing
   :maxdepth: 1

   signals/fft.rst
   signals/filtering.rst

.. toctree::
   :caption: Numerical extras
   :maxdepth: 1

   numerical.rst

.. toctree::
   :caption: Images
   :maxdepth: 1

   images.rst

.. toctree::
   :caption: Performance
   :maxdepth: 1

   performance.rst

.. toctree::
   :caption: Wrap up
   :maxdepth: 1

   wrap-up.rst
