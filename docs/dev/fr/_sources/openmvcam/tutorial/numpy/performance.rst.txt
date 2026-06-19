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

The RAM saving is 2x for ``uint16`` and 4x for
``uint8`` against the 4-byte ``float`` default. The
math also runs faster because the integer code paths
inside :mod:`numpy` are tighter than the generic float
ones. The integer overflow rule covered on
:doc:`basics/dtypes` applies -- cast to a wider type
before arithmetic that might overflow.

Prefer an ndarray to an iterable
--------------------------------

Most reductions and universal functions accept either an
iterable or an :class:`~numpy.ndarray`::

    np.sum([1, 2, 3, 4, 5])               # works, but slow
    np.sum(np.array([1, 2, 3, 4, 5]))     # ~3x faster

The iterable form forces :mod:`numpy` to step through
the input one Python object at a time, converting each
to a number before it can use it. Against an
:class:`~numpy.ndarray` the conversion is already
done and the call runs straight through the packed
buffer.

When the same data is used more than once, build the
:class:`~numpy.ndarray` once and pass it around.
When the data exists only as a Python list and is
consumed once, the conversion cost can outweigh the
speedup -- the :func:`~numpy.array` constructor
itself has to walk the list and allocate.

Prefer views to copies
----------------------

Slicing, single-axis indexing of a higher-rank array,
:meth:`~numpy.ndarray.reshape`,
:meth:`~numpy.ndarray.transpose`, and
:func:`~numpy.frombuffer` all return *views* that
share data with the source. They are essentially free.

:meth:`~numpy.ndarray.copy`,
:meth:`~numpy.ndarray.flatten`, boolean indexing
(``a[mask]``), and any arithmetic expression allocate a
*copy*. Reach for them only when an independent buffer
is genuinely needed.

When in doubt, :func:`~numpy.ndinfo` prints the
location of the underlying buffer; two arrays that
report the same address share their data. The
complete view-vs-copy table is on
:doc:`shape/views-and-copies`.

Allocate once, then write
-------------------------

The single biggest performance pitfall on the camera is
allocating fresh arrays inside a loop that runs many
times a second. Each new
:class:`~numpy.ndarray` asks the cam for RAM, and
frequent fresh allocations waste it.

Most universal functions accept ``out=`` so the result
can be written into an array that already exists::

    x = np.linspace(0, 2 * np.pi, num=512)
    y = np.zeros(512)        # allocate once

    while True:
        np.sin(x, out=y)
        # use y ...

:meth:`image.Image.to_ndarray` accepts ``buffer=``
for the same reason; :func:`~ulab.utils.spectrogram` and
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

:class:`~numpy.ndarray` has no ``append`` -- on
purpose. Growing an array would mean allocating a fresh,
larger buffer and copying the old contents into it. On a
microcontroller, pre-allocate the final size and *fill*
it::

    out = np.zeros(N, dtype=np.float)
    for i in range(N):
        out[i] = some_calculation(i)

When ``N`` genuinely is not known in advance, write to a
Python :class:`list` and convert once at the end with
:func:`~numpy.array`.

Slice assignment instead of new arrays
--------------------------------------

Many "build a new array from pieces of others" patterns
can be expressed as slice assignments into a
pre-allocated buffer instead of a fresh allocation each
call.

A rolling window over a stream of samples -- the
foundation of a moving-average filter -- is the
canonical case. The buffer holds the last ``N``
samples; every iteration drops the oldest and appends
the newest. The obvious form rebuilds the buffer each
iteration::

    while True:
        sample = read_sample()
        buf = np.concatenate((buf[1:],              # new buffer every loop
                              np.array([sample])))
        avg = np.mean(buf)

That is a fresh allocation -- and a copy of ``N - 1``
elements -- per sample. The slice-assignment form
shifts in place::

    N   = 16
    buf = np.zeros(N, dtype=np.float)               # allocate once

    while True:
        sample   = read_sample()
        buf[:-1] = buf[1:]                          # shift left by one
        buf[-1]  = sample                           # append at the end
        avg      = np.mean(buf)

``buf[:-1] = buf[1:]`` is the interesting line: two
overlapping views into the same buffer, the right-hand
slice read from one end and written to the other.
:mod:`numpy` walks the underlying memory in the order
that makes the in-place shift safe. No new array is
ever allocated inside the loop.

Watch out for boolean masks in streaming loops
----------------------------------------------

Boolean indexing and :func:`~numpy.where` produce
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
