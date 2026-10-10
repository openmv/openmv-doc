:mod:`numpy.random` --- Random number generation
=====================================================

.. module:: numpy.random
   :synopsis: Random number generation

The :mod:`numpy.random` submodule provides a :class:`Generator` class that
draws samples from common probability distributions. The underlying algorithm
is a permuted-congruential generator (PCG); see https://www.pcg-random.org/
for details.

A :class:`Generator` is a stateful object: each call to one of its sampling
methods advances the internal state, so consecutive calls return independent
samples. Output arrays are always of dtype :class:`numpy.float`.

Classes
-------

.. class:: Generator(seed: int | tuple[int, ...] | None = None)

   Construct a new pseudo-random number generator.

   :param seed: the seed used to initialise the generator state. If an integer
                is supplied it is used directly. If a tuple of integers is
                supplied, a tuple of independently-seeded :class:`Generator`
                objects (one per element) is returned instead of a single
                instance. If ``None`` is supplied, a platform-default seed is
                used (when one is configured at build time); otherwise a
                ``ValueError`` is raised.
   :raises TypeError: if *seed* is not ``None``, an integer, or a tuple of
                      integers.
   :raises ValueError: if *seed* is ``None`` and no default seed is configured.

   .. method:: normal(loc: float = 0.0, scale: float = 1.0, size: int | tuple[int, ...] | None = None) -> float | ndarray

      Draw samples from a normal (Gaussian) distribution.

      :param loc: the mean (centre) of the distribution.
      :param scale: the standard deviation (width) of the distribution. Must
                    be non-negative.
      :param size: the shape of the output. If an integer, a one-dimensional
                   array of that length is returned. If a tuple, an array of
                   that shape is returned. If ``None`` (the default), a single
                   Python ``float`` is returned.
      :return: either a Python ``float`` or a float :class:`numpy.ndarray` of
               the requested shape.
      :raises ValueError: if the requested shape exceeds ``ULAB_MAX_DIMS``.
      :raises TypeError: if *size* is neither ``None``, an integer, nor a
                         tuple.

      Samples are generated using the Box-Muller transform.

   .. method:: random(size: int | tuple[int, ...] | None = None, *, out: ndarray | None = None) -> float | ndarray

      Draw samples from the uniform distribution over the half-open interval
      ``[0.0, 1.0)``.

      :param size: the shape of the output. If an integer, a one-dimensional
                   array of that length is returned. If a tuple, an array of
                   that shape is returned. If ``None`` (the default) and *out*
                   is also ``None``, a single Python ``float`` is returned.
      :param out: an optional pre-allocated, dense, float
                  :class:`numpy.ndarray` to receive the samples. If both *size*
                  and *out* are supplied, their shapes must agree.
      :return: a Python ``float``, a new :class:`numpy.ndarray`, or *out*
               (filled with samples) depending on the arguments.
      :raises TypeError: if *size* has an unsupported type, or *out* is not an
                         ndarray, or *out* is not of dtype ``float``.
      :raises ValueError: if the requested shape exceeds ``ULAB_MAX_DIMS``,
                          if *size* and ``out.shape`` disagree, or if *out*
                          is not contiguous.

   .. method:: uniform(low: float = 0.0, high: float = 1.0, size: int | tuple[int, ...] | None = None) -> float | ndarray

      Draw samples from the uniform distribution over the half-open interval
      ``[low, high)``.

      :param low: the lower bound (inclusive) of the distribution.
      :param high: the upper bound (exclusive) of the distribution.
      :param size: the shape of the output. If a tuple, an array of that
                   shape is returned. If ``None`` (the default), a single
                   Python ``float`` drawn from ``[0.0, 1.0)`` is returned
                   (the *low*/*high* bounds are ignored in the scalar case).
      :return: either a Python ``float`` or a float :class:`numpy.ndarray` of
               the requested shape.
      :raises ValueError: if the requested shape exceeds ``ULAB_MAX_DIMS``.
      :raises TypeError: if *size* is neither ``None`` nor a tuple.

   With identical default arguments, :meth:`uniform` produces the same
   sequence as :meth:`random`.
