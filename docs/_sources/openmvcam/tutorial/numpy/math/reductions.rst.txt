Reductions
==========

A *reduction* collapses an array along one or more axes
by summing, averaging, taking a min, and so on. Each
reduction is a single library call against the whole
array, much faster than the equivalent Python loop.
:mod:`numpy` covers the everyday ones:

* :func:`~ulab.numpy.sum`
* :func:`~ulab.numpy.mean`
* :func:`~ulab.numpy.std` -- standard deviation,
  ``ddof=`` adjusts the divisor (``N - ddof``)
* :func:`~ulab.numpy.min` / :func:`~ulab.numpy.max`
* :func:`~ulab.numpy.median`
* :func:`~ulab.numpy.argmin` / :func:`~ulab.numpy.argmax`
  -- the *index* of the minimum or maximum element
* :func:`~ulab.numpy.all` / :func:`~ulab.numpy.any` --
  truth-value reductions on boolean arrays

Without the ``axis`` keyword
----------------------------

Called without ``axis=``, a reduction returns a scalar
covering the entire array::

    a = np.array([1, 2, 3, 4], dtype=np.float)
    np.sum(a)           # 10.0
    np.mean(a)          # 2.5
    np.std(a)           # 1.118...
    np.median(a)        # 2.5

    b = np.array([40, 10, 30, 20], dtype=np.float)
    np.max(b)           # 40.0
    np.argmax(b)        # 0  (index of the maximum)

With the ``axis`` keyword
-------------------------

``axis=`` contracts one named axis and leaves the others
intact. The result is an array of one rank lower than
the input::

    m = np.arange(12, dtype=np.float).reshape((3, 4))

    np.sum(m)               # 66.0          - scalar
    np.sum(m, axis=0)       # length-4      - column sums
    np.sum(m, axis=1)       # length-3      - row sums

The same shape rule applies to every reduction:
``axis=0`` collapses the first axis, ``axis=1`` collapses
the second, and so on. The ``keepdims=True`` keyword
keeps the contracted axis in place with length 1, which
makes the result safe to broadcast back against the
original.

Mean / standard deviation along a row, for example, are
written ``np.mean(m, axis=1)`` and ``np.std(m, axis=1)``.
The result has the *other* axis's length.

Layout matters
--------------

Combined with the row-major layout covered on
:doc:`../shape/shape-and-strides`, reducing along the
*last* axis is the cheapest case. The reduction walks
the data block in the direction it is stored, with no
jumps from row to row::

    m = np.arange(2000, dtype=np.float).reshape((2, 1000))
    np.sum(m, axis=1)       # cheap - long axis is the inner one
    np.sum(m, axis=0)       # has to jump rows on every step

When the application has a choice about how to lay out
a buffer, put the long axis last so reductions along it
run in the fast direction.

Iterables as input
------------------

Most reductions accept a Python iterable (a
:class:`list`, a :class:`range`, a tuple) in place of
an :class:`~ulab.numpy.ndarray`. The convenience costs
a few microseconds for the implicit conversion -- which
adds up fast in a loop. When the same data is reduced
multiple times, build the
:class:`~ulab.numpy.ndarray` once and pass it around.
