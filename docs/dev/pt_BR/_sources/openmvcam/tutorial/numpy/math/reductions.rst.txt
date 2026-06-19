Reductions
==========

A *reduction* collapses an array along one or more axes
by summing, averaging, taking a min, and so on. Each
reduction is a single library call against the whole
array, much faster than the equivalent Python loop.
:mod:`numpy` covers the everyday ones:

* :func:`~numpy.sum` -- total of every element
* :func:`~numpy.mean` -- arithmetic average (sum divided
  by element count)
* :func:`~numpy.std` -- standard deviation,
  ``ddof=`` adjusts the divisor (``N - ddof``)
* :func:`~numpy.min` / :func:`~numpy.max` -- smallest
  and largest element
* :func:`~numpy.median` -- middle value when the
  elements are sorted (50th percentile)
* :func:`~numpy.argmin` / :func:`~numpy.argmax`
  -- the *index* of the minimum or maximum element
* :func:`~numpy.all` / :func:`~numpy.any` --
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
the second, and so on. Mean / standard deviation along a
row, for example, are written ``np.mean(m, axis=1)`` and
``np.std(m, axis=1)``. The result has the *other* axis's
length.

The ``keepdims=True`` keyword keeps the contracted axis
in place with length 1 instead of dropping it. The
distinction matters when the reduced result needs to
broadcast back against the original: ``keepdims``
preserves the rank, which keeps the broadcasting rules
aligned axis-for-axis.

Subtracting each row's mean from that row is the
canonical use::

    m = np.arange(12, dtype=np.float).reshape((3, 4))
    row_means = np.mean(m, axis=1, keepdims=True)
    # row_means has shape (3, 1)
    centred = m - row_means
    # (3, 4) - (3, 1) -> (3, 4), each row centred on its own mean

Without ``keepdims``, ``np.mean(m, axis=1)`` returns a
1-D result of shape ``(3,)``. Broadcasting
``(3, 4) - (3,)`` lines ``(3,)`` up as ``(1, 3)`` after
the rank prepend, which is incompatible with ``(3, 4)``:
the last axes disagree (4 against 3) and neither is 1,
so :mod:`numpy` raises :exc:`ValueError`.
``keepdims=True`` is what keeps the subtraction valid.

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
an :class:`~numpy.ndarray`. The convenience costs
a few microseconds for the implicit conversion -- which
adds up fast in a loop. When the same data is reduced
multiple times, build the
:class:`~numpy.ndarray` once and pass it around.
