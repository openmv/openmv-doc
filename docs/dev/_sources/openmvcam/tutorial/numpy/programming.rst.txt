Advanced patterns
=================

This page is a collection of Python-level patterns for using ``ulab``
effectively on a microcontroller. It assumes you already know the
basics from :doc:`getting-started` and :doc:`ndarray`.

Memory layout: the last axis is the fast axis
---------------------------------------------

Inside an ``ndarray`` the data lives in a single contiguous chunk of
memory. The shape and the strides describe how that linear chunk is
read out as a tensor. ``ulab`` always loops innermost over the
**last axis**: for a ``(2, 1000)`` array it walks ``a[0, 0]``,
``a[0, 1]``, ..., ``a[0, 999]``, then jumps to ``a[1, 0]``.

Two consequences:

* Long axes belong on the right. A ``(2, 1000)`` array iterates
  faster than a ``(1000, 2)`` array even though they hold the same
  values.
* Transposes are essentially free, because they only flip strides.

If you have control over how the data is laid out (e.g. you decide
how to reshape an input buffer), put the long axis last.

What "view" really means
------------------------

A view is a second ``ndarray`` header that points at the *same* data
buffer as the source. The ``np.ndinfo`` function shows you the data
pointer; for any view, that pointer is the same as the source's::

   from ulab import numpy as np

   a = np.arange(10, dtype=np.uint8)
   np.ndinfo(a)            # data pointer: 0x...
   np.ndinfo(a[::2])       # data pointer: 0x...   (SAME)

This is why writing to a view changes the source. It is also why
slicing is essentially free, even on large arrays -- only a few
bytes of header are allocated. ``np.frombuffer``, ``a[::2]``,
``m[:, 0]``, ``a.reshape(...)`` and ``a.T`` all behave this way.

If you want an independent buffer (e.g. so that further mutations
don't disturb the source), call ``.copy()``.

Broadcasting in detail
----------------------

When two arrays appear as the operands of a binary operator
(``a + b``, ``np.arctan2(a, b)``, ``a < b``, ...), ``ulab`` applies
``numpy``'s broadcasting rules. The rules are:

1. If the two arrays have a different rank, virtually prepend size-1
   axes to the lower-rank array until the ranks match.
2. Along each axis, the two sizes must be equal, or one of them must
   be 1. A size-1 axis is virtually stretched to match the other
   side.

If those two rules cannot be satisfied, you get
``ValueError("operands could not be broadcast together")``.

Internally, ``ulab`` implements broadcasting by setting the stride
of any size-1 axis to zero. That way the iterator advances normally
for the other operand but never moves the data pointer for the
broadcast axis. There is no actual stretching of data and no
allocation involved.

Example -- centring a 2-D array's columns::

   m = np.arange(12, dtype=np.float).reshape((3, 4))
   col_means = np.array([np.mean(m[:, j]) for j in range(4)])
   centred = m - col_means          # (3, 4) - (4,) -> (3, 4)

Example -- pairwise sums across two 1-D arrays::

   x = np.array([1, 2, 3, 4]).reshape((4, 1))     # column
   y = np.array([10, 20, 30])                     # row
   x + y                                           # (4, 3) matrix

Reductions and the ``axis`` argument
------------------------------------

Reductions like ``np.sum``, ``np.mean``, ``np.std``, ``np.min``,
``np.max``, ``np.median``, ``np.argmin`` and ``np.argmax`` all take
an optional ``axis=`` argument. Without it, the reduction is over
all elements; with it, the named axis is contracted out.

::

   m = np.arange(12, dtype=np.float).reshape((3, 4))

   np.sum(m)               # 66.0  -- scalar
   np.sum(m, axis=0)       # length-4 vector (column sums)
   np.sum(m, axis=1)       # length-3 vector (row sums)

Internally, the reduction places the named axis in the innermost
loop and walks every other axis with the outer loops. Combined with
the "last axis is fast" rule above, this means reducing along the
last axis is the cheapest case.

Avoiding allocation: pre-allocate and write
-------------------------------------------

The single biggest performance pitfall on a microcontroller is
allocation in the hot loop. Each new ``ndarray`` is a heap
allocation, and frequent allocations fragment the heap.

Strategies, roughly in order of effectiveness:

1. **Pre-allocate the output buffer once, write into it.** Most
   universal functions accept ``out=``; ``image.Image.to_ndarray``
   accepts ``buffer=``; ``utils.spectrogram`` accepts ``out=`` and
   ``scratchpad=``::

      x   = np.linspace(0, 2*np.pi, num=512)
      y   = np.zeros(512)            # allocate once
      while True:
          np.sin(x, out=y)           # no allocation
          # ... use y ...

2. **Use in-place operators.** ``b += 1`` is allocation-free; ``b =
   b + 1`` allocates a temporary, copies, and reassigns::

      # makes a temporary the size of b
      b = b + 1

      # no temporary
      b += 1

3. **Decompose compound expressions.** Each operator produces a
   temporary. Splitting a complicated expression into several simple
   ones, each writing into a slice of a pre-allocated buffer, lets
   you skip the temporaries::

      # one temporary for `a + b`, another for `* 2`
      out = (a + b) * 2

      # zero temporaries
      out[:] = a
      out += b
      out *= 2

4. **Slice-assign instead of building new arrays.** Many "build a
   new array from pieces" patterns can be expressed as a single
   pre-allocated array with several slice assignments. See the
   up-scaling example in :doc:`tricks`.

Boolean masks: be careful in tight loops
----------------------------------------

A boolean mask (``a < threshold``) is a real array on the heap, of
size equal to ``a``. Building masks in a hot loop -- in particular
combining them with ``&`` / ``|`` -- spawns lots of throwaway
arrays.

If a mask is reused, build it once and keep it::

   mask = a < threshold
   foo[mask] = 0
   bar[mask] = 1

If a mask depends on values that change every iteration, it is
unavoidable that you reallocate. A periodic ``gc.collect()`` keeps
the heap from fragmenting.

Building from raw buffers
-------------------------

Three useful building blocks:

* ``np.frombuffer(buf, dtype=...)`` -- view a ``bytes``-like buffer
  as an ``ndarray`` of the given dtype, no copy. Use this for
  in-memory peripherals (UART, SPI, ADC, audio buffers).
* ``a.tobytes()`` -- get the raw bytes underlying a *dense*
  ``ndarray`` (sliced views raise ``ValueError``). Useful when you
  want to ship pixels out over a transport.
* ``a.byteswap()`` / ``a.byteswap(inplace=True)`` -- flip endianness
  for multi-byte dtypes. Use when the peripheral that produced the
  buffer disagrees with the MCU on byte order.

For non-native dtypes (e.g. 32-bit ADC samples) the ``utils`` module
has converters: see :doc:`utils`.

Handling complex output safely
------------------------------

A few universal functions can produce complex results -- the obvious
ones are ``sqrt`` of a negative number and ``exp`` of a complex
input. ``ulab`` does not silently widen the dtype. If your input is
real but the result might be complex, you have to ask for the
complex output explicitly::

   a = np.array([1, -1])
   np.sqrt(a)                       # array([1.0, nan])  (NaN, real out)
   np.sqrt(a, dtype=np.complex)     # array([1+0j, 0+1j], complex out)

This is most often a footgun in numerical code -- if you see
``NaN`` where you expected an imaginary number, you forgot
``dtype=np.complex``.

Where to go next
----------------

* :doc:`tricks` -- short-form list of practical tips.
* :doc:`utils` -- buffer conversions and ``spectrogram``.
* :doc:`/library/omv.ulab.numpy` -- complete API reference.
