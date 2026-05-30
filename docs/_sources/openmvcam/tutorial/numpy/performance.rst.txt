Performance
===========

The same design decisions that make :mod:`numpy` fast
on the camera -- whole-array library calls, packed
typed buffers, views that share data with their source
-- also expose a set of habits that are worth knowing
about. The :doc:`shape/shape-and-strides` page already
covered the last-axis layout rule; this page catalogues
the allocation and dtype habits that matter most in a
streaming loop.

Pick a reasonable dtype
-----------------------

The default dtype of every constructor is ``float``. For
data that is naturally 8-bit or 16-bit -- ADC samples,
image pixels, sensor readings -- pass ``dtype=``
explicitly to one of the integer types::

    adc = np.array(adc_samples, dtype=np.uint16)

The RAM saving is 4-8x. The math also runs faster
because the integer code paths inside :mod:`numpy` are
tighter than the generic float ones. The integer
overflow rule covered on :doc:`basics/dtypes` applies
-- cast to a wider type before arithmetic that might
overflow.

Use an ndarray when you can
---------------------------

Most reductions and universal functions accept either an
iterable or an :class:`~ulab.numpy.ndarray`::

    np.sum([1, 2, 3, 4, 5])               # works, but slow
    np.sum(np.array([1, 2, 3, 4, 5]))     # ~3x faster

The iterable form forces :mod:`numpy` to step through
the input one Python object at a time, converting each
to a number before it can use it. Against an
:class:`~ulab.numpy.ndarray` the conversion is already
done and the call runs straight through the packed
buffer.

When the same data is used more than once, build the
:class:`~ulab.numpy.ndarray` once and pass it around.
When the data exists only as a Python list and is
consumed once, the conversion cost can outweigh the
speedup -- the :func:`~ulab.numpy.array` constructor
itself has to walk the list and allocate.

Prefer views to copies
----------------------

Slicing, single-axis indexing of a higher-rank array,
:meth:`~ulab.numpy.ndarray.reshape`,
:meth:`~ulab.numpy.ndarray.transpose`, and
:func:`~ulab.numpy.frombuffer` all return *views* that
share data with the source. They are essentially free.

:meth:`~ulab.numpy.ndarray.copy`,
:meth:`~ulab.numpy.ndarray.flatten`, boolean indexing
(``a[mask]``), and any arithmetic expression allocate a
*copy*. Reach for them only when an independent buffer
is genuinely needed.

When in doubt, :func:`~ulab.numpy.ndinfo` prints the
location of the underlying buffer; two arrays that
report the same address share their data. The
complete view-vs-copy table is on
:doc:`shape/views-and-copies`.

Allocate once, then write
-------------------------

The single biggest performance pitfall on the camera is
allocating fresh arrays inside a loop that runs many
times a second. Each new
:class:`~ulab.numpy.ndarray` asks the cam for RAM, and
frequent fresh allocations waste it.

Most universal functions accept ``out=`` so the result
can be written into an array that already exists::

    x = np.linspace(0, 2 * np.pi, num=512)
    y = np.zeros(512)        # allocate once

    while True:
        np.sin(x, out=y)
        # use y ...

:py:meth:`image.Image.to_ndarray` accepts ``buffer=``
for the same reason; :func:`ulab.utils.spectrogram` and
the :func:`~ulab.utils.from_int32_buffer`-style
converters accept both ``out=`` and ``scratchpad=``.
Allocate everything once and reuse it.

Use in-place operators
----------------------

``b = b + 1`` allocates a temporary the size of ``b``,
copies, and re-assigns. ``b += 1`` modifies ``b``
directly::

    # makes a temporary
    b = b + 1

    # no temporary
    b += 1

The same idea applies to compound expressions.
``a + b * c`` allocates a temporary for ``b * c``.
Splitting the expression into simple sub-assignments
writing into a pre-allocated buffer eliminates the
temporaries::

    # one temporary for (a + b), another for the ``* 2``
    out = (a + b) * 2

    # zero temporaries
    out[:]  = a
    out    += b
    out    *= 2

Build the result, do not append to it
-------------------------------------

:class:`~ulab.numpy.ndarray` has no ``append`` -- on
purpose. Growing an array would mean allocating a fresh,
larger buffer and copying the old contents into it. On a
microcontroller, pre-allocate the final size and *fill*
it::

    out = np.zeros(N, dtype=np.float)
    for i in range(N):
        out[i] = some_calculation(i)

When ``N`` genuinely is not known in advance, write to a
Python :class:`list` and convert once at the end with
:func:`~ulab.numpy.array`.

Slice assignment instead of new arrays
--------------------------------------

Many "build a new array from pieces" patterns can be
expressed as slice assignments into a pre-allocated
buffer. The classic example is linear interpolation by
2::

    # Originals at even indices; midpoints at odd indices.
    a = np.array([0, 10, 2, 20, 4], dtype=np.uint8)
    b = np.zeros(2 * len(a) - 1, dtype=np.uint8)

    b[::2]   = a
    b[1::2]  = a[:-1]
    b[1::2] += a[1:]
    # divide by 2 if you want the average

The compound form ``b[1::2] = (a[:-1] + a[1:]) // 2``
would allocate a temporary the size of ``a[:-1] + a[1:]``
plus another for the division. The four-line version
above touches only views.

The same idea generalises to two dimensions, which
makes it the right tool for upscaling small images --
think 8x8 thermal sensors that need a human-friendly
preview::

    # ``a`` is 8x8; ``b`` is 15x15
    b = np.zeros((15, 15), dtype=np.uint8)

    b[::2, ::2]    = a
    b[1::2, ::2]   = a[:-1, :]
    b[1::2, ::2]  += a[1:, :]
    b[1::2, ::2] //= 2
    b[:, 1::2]     = b[:, :-1:2]
    b[:, 1::2]    += b[:, 2::2]
    b[:, 1::2]   //= 2

Watch out for boolean masks in streaming loops
----------------------------------------------

Boolean indexing and :func:`~ulab.numpy.where` produce
a new array on each call -- the size of the result
depends on the data, so no pre-allocated buffer can
absorb the allocation. Repeated mask building in a
streaming loop fills RAM with throwaway arrays. A
periodic ``gc.collect()`` reclaims the space::

    import gc

    for i in range(1000):
        mask = a < threshold
        _    = a[mask]
        if i % 100 == 0:
            gc.collect()

The same caveat applies to compound boolean expressions
like ``(a > lo) & (a < hi)`` -- each operator allocates
a new bool array. When a mask is reused, build it once
and keep it::

    mask = a < threshold
    foo[mask] = 0
    bar[mask] = 1
