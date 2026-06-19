:mod:`scipy.signal` --- Signal processing
==============================================

.. module:: scipy.signal
   :synopsis: Signal-processing routines

The :mod:`scipy.signal` submodule provides a single signal-processing
routine.

Functions
---------

.. function:: sosfilt(sos: ndarray, x: ndarray, *, zi: ndarray | None = None) -> ndarray | tuple[ndarray, ndarray]

   Filter the one-dimensional, uniformly sampled data *x* using the
   cascaded second-order sections in *sos*.

   :param sos: an array-like of shape ``(n_sections, 6)`` giving the
               filter sections. Each row holds the six coefficients
               ``[b0, b1, b2, a0, a1, a2]`` of one biquad section.
   :param x: a one-dimensional input :class:`numpy.ndarray`.
   :param zi: optional initial filter delays, a float
              :class:`numpy.ndarray` of shape ``(n_sections, 2)``. If
              omitted, the initial conditions are taken to be zero.
   :return: the filtered signal as a float :class:`numpy.ndarray`. When
            *zi* is supplied, the return value is a 2-tuple
            ``(y, zf)`` where ``zf`` holds the final delays in the same
            shape as *zi*.
