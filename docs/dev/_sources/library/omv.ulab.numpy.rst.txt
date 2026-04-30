:mod:`numpy` --- numpy-compatible array operations
=======================================================

.. module:: numpy
   :synopsis: numpy-compatible array operations

The `numpy` submodule of `ulab` provides a numpy-compatible API built
around the `ndarray` n-dimensional array type. It
implements a curated subset of CPython ``numpy``: array construction,
element-wise math, reductions and statistics, linear algebra, FFTs,
random number generation, polynomial fitting, and basic I/O.

The submodule is conventionally imported as ``np``::

   from ulab import numpy as np

   a = np.array([1, 2, 3, 4], dtype=np.float)
   b = np.linspace(0, 1, num=5)
   c = np.dot(a.reshape((2, 2)), a.reshape((2, 2)))

Each ``dtype`` argument is one of the integer constants exposed at module
level: `numpy.bool`, `numpy.uint8`, `numpy.int8`, `numpy.uint16`,
`numpy.int16`, `numpy.float` (the default), and (when complex support is
compiled in) `numpy.complex`. The result type `ndarray` refers to
`numpy.ndarray`.

Submodules
----------

.. toctree::
   :maxdepth: 1

   omv.ulab.numpy.fft.rst
   omv.ulab.numpy.linalg.rst
   omv.ulab.numpy.random.rst

class ``ndarray`` --- the n-dimensional array
---------------------------------------------

The `ndarray` is the n-dimensional, dtype-aware container at the core
of `numpy <omv.ulab.numpy>` / `ulab <omv.ulab>`. The data is stored in a
contiguous block whose interpretation is described by a small header
(``dtype``, ``shape``, ``strides``, ``ndim``, ``itemsize``). Many
operations -- ``reshape``, ``transpose``, slicing -- only adjust this
header and so are very cheap; methods that allocate new storage
(``copy``, ``flatten``, most arithmetic) return a new dense array.

The same type is reachable as ``ulab.ndarray``,
``numpy.ndarray``, and (within this page) simply ``ndarray``.

.. class:: ndarray(values: ndarray | bytes | list | tuple, *, dtype: int = numpy.float)

   Create a new `ndarray`.

   :param values: Source data. Either another `ndarray` (which is
      deep-copied, with type conversion if ``dtype`` differs) or any
      MicroPython iterable. Nested iterables produce multi-dimensional
      arrays; the inner iterables must all have the same length or a
      ``ValueError`` is raised.
   :param dtype: Element type for the new array. One of the type-code
      integers exposed by `numpy` (`numpy.bool`, `numpy.uint8`,
      `numpy.int8`, `numpy.uint16`, `numpy.int16`,
      `numpy.float`, and -- when supported -- `numpy.complex`), or
      a `dtype` instance. Defaults to `numpy.float`.

   The factory function `numpy.array` is the conventional way to
   create an `ndarray`; it forwards to this constructor.

   .. method:: byteswap(*, inplace: bool = False) -> ndarray

      Swap the byte order of every element. For ``uint16``, ``int16``,
      ``float`` and ``complex`` arrays this reverses the per-element
      byte order, which is useful when consuming data from peripherals
      whose endianness does not match the microcontroller's. For
      single-byte dtypes (``bool``, ``uint8``, ``int8``) this is a
      no-op that returns a view or copy.

      If ``inplace`` is ``False`` (the default) a new `ndarray` is
      returned and the original is left untouched. If ``inplace`` is
      ``True`` the bytes of ``self`` are swapped in place and a view
      of ``self`` is returned.

   .. method:: copy() -> ndarray

      Return a new dense, deep copy of the array. The copy owns its
      own data; modifications to it do not affect the original.

   .. method:: flatten(*, order: str = 'C') -> ndarray

      Return a new one-dimensional copy of the array.

      :param order: ``'C'`` (the default) walks the data in C order
         (last axis varies fastest); ``'F'`` walks it in Fortran order
         (first axis varies fastest).

   .. method:: reshape(shape: int | tuple[int, ...]) -> ndarray

      Return a view of the array with a new shape. The total number
      of elements must be unchanged or a ``ValueError`` is raised.
      Only available when ``ULAB_MAX_DIMS > 1``. Equivalent to
      assigning to :attr:`shape`.

   .. method:: sort(*, axis: int | None = -1) -> None

      Sort the array in place.

      :param axis: Axis along which to sort. ``-1`` (the default)
         sorts along the last axis; ``None`` first flattens the array
         and then sorts.

   .. method:: tobytes() -> bytearray

      Return a ``bytearray`` that aliases the array's underlying data
      buffer. Writes through the returned ``bytearray`` modify the
      array in place. Raises ``ValueError`` if the array is not
      dense (e.g. a sliced view).

   .. method:: tolist() -> list

      Return the contents of the array as a (possibly nested) Python
      ``list``. The nesting depth equals :attr:`ndim`.

   .. method:: transpose() -> ndarray

      Return the transpose of the array (axes reversed). For
      one-dimensional arrays this returns ``self``. Only available
      when ``ULAB_MAX_DIMS > 1``. The :attr:`T` attribute is a
      shorthand for this method.

   .. attribute:: dtype
      :type: dtype | int

      The data type of the array's elements. Returns a `dtype`
      instance when the firmware is built with
      ``ULAB_HAS_DTYPE_OBJECT`` enabled, otherwise the underlying
      single-character type code as an integer.

   .. attribute:: flat
      :type: flatiter

      A flat iterator that yields every element of the array in
      C order. Unlike :meth:`flatten`, iterating ``flat`` does not
      allocate a new array.

   .. attribute:: itemsize
      :type: int

      Size in bytes of a single array element, derived from
      :attr:`dtype`.

   .. attribute:: ndim
      :type: int

      Number of array dimensions (length of :attr:`shape`).

   .. attribute:: shape
      :type: tuple[int, ...]

      Lengths of the array along each axis. Assigning a tuple to
      ``shape`` reshapes the array in place (equivalent to
      :meth:`reshape`).

   .. attribute:: size
      :type: int

      Total number of elements in the array (the product of
      :attr:`shape`).

   .. attribute:: strides
      :type: tuple[int, ...]

      Number of bytes to step in memory along each axis to reach the
      next element along that axis.

   .. attribute:: T
      :type: ndarray

      The transpose of the array; equivalent to :meth:`transpose`.

   .. attribute:: real
      :type: ndarray

      The real part of a complex array, returned as a ``float``
      `ndarray`. For real arrays this is a copy of ``self`` with the
      same `dtype`. Only available when the firmware was built with
      complex support.

   .. attribute:: imag
      :type: ndarray

      The imaginary part of a complex array, returned as a ``float``
      `ndarray`. For real arrays this is an array of zeros with the
      same `dtype` as ``self``. Only available when the firmware was
      built with complex support.

Supported operators
~~~~~~~~~~~~~~~~~~~

`ndarray` instances support the following operators. Binary operators
broadcast their operands following standard numpy broadcasting rules
and follow numpy's upcasting rules (e.g. ``uint8 + int8 => int16``,
``uint16 + int16 => float``); operations involving a complex operand
produce a complex result.

**Arithmetic (binary):** ``+``, ``-``, ``*``, ``/``, ``//``, ``%``, ``**``.
Reflected (right-hand) operands and the in-place variants
``+=``, ``-=``, ``*=``, ``/=``, ``%=``, ``**=`` are also supported. Both
``ndarray``-with-``ndarray`` and ``ndarray``-with-scalar forms are
accepted. Floor division (``//``) and the modulo operator (``%``) are
not implemented for ``complex`` arrays.

**Comparison:** ``==``, ``!=``, ``<``, ``<=``, ``>``, ``>=``. Each
returns a boolean `ndarray` of the broadcast shape.

**Bitwise (integer arrays only):** ``&``, ``|``, ``^``. Applying
these to a ``float`` or ``complex`` array raises ``TypeError``.

**Unary:** ``+`` (returns a copy), ``-`` (negation; on unsigned
dtypes the values wrap modulo :math:`2^N`), ``abs()`` (element-wise
absolute value; on unsigned dtypes returns a copy without
computation), ``~`` (bitwise inversion, integer dtypes only),
``len()`` (returns the length of the first axis).

**Indexing and slicing:** ``a[i]``, ``a[i, j, ...]``, ``a[start:stop:step]``,
boolean-mask indexing (``a[mask]``) and integer-array (fancy)
indexing are all supported on both reads and writes.

**Iteration:** Iterating over an `ndarray` yields sub-arrays along
the first axis (one element at a time for 1-D arrays). Use
:attr:`flat` to iterate over every scalar element regardless of
dimensionality.

The matrix-multiplication operator ``@`` is not implemented; use
`numpy.dot` (``np.dot(a, b)``) instead.

The shift (``<<``, ``>>``) operators are not implemented at the
operator level. Use `numpy.left_shift` and `numpy.right_shift` for
element-wise integer shifts.

Array construction
------------------

.. function:: array(values: ndarray | list | tuple, *, dtype: int = float) -> ndarray

   Construct a new `ndarray` from a nested iterable of numbers. Equivalent
   alternate constructor for `numpy.ndarray`.

.. function:: arange(start: int | float, stop: int | float = ..., step: int | float = 1, *, dtype: int | None = None) -> ndarray

   Return evenly spaced values over the half-open interval ``[start, stop)``.
   If only one positional argument is given, it is treated as ``stop`` with
   ``start = 0``. If *dtype* is omitted, it is inferred from the inputs
   (integer if all of *start*, *stop*, *step* are ints and within range).

.. function:: asarray(a: ndarray | list | tuple, *, dtype: int | None = None) -> ndarray

   If *a* is already an `ndarray` whose dtype matches *dtype* (or *dtype* is
   ``None``), return *a* unchanged; otherwise create a new array (with the
   requested dtype conversion when given). Iterables are converted as in
   `numpy.array`.

.. function:: concatenate(arrays: tuple, *, axis: int = 0) -> ndarray

   Join a sequence of `ndarray` along an existing *axis*. All input arrays
   must share the same dtype, ndim, and shape on every axis other than
   *axis*.

.. function:: diag(a: ndarray, *, k: int = 0) -> ndarray

   For a 2-D *a*, return a 1-D array containing the *k*-th diagonal. For a
   1-D *a*, return a 2-D square array with *a* placed on the *k*-th diagonal.
   *k* may be positive (above main diagonal) or negative (below).

.. function:: empty(shape: int | tuple[int, ...], *, dtype: int = float) -> ndarray

   Alias for `zeros`; returns a zero-filled array of *shape* and *dtype*.
   (ulab does not leave the buffer uninitialised.)

.. function:: eye(N: int, M: int | None = None, k: int = 0, *, dtype: int = float) -> ndarray

   Return a 2-D *N* x *M* array (square *N* x *N* if *M* is ``None``) with
   ones on the *k*-th diagonal and zeros elsewhere.

.. function:: frombuffer(buffer: bytes, *, dtype: int = float, count: int = -1, offset: int = 0) -> ndarray

   Interpret a buffer-protocol object as a 1-D `ndarray` of *dtype*. *count*
   is the number of items to read (``-1`` reads all available items);
   *offset* skips that many bytes at the start of the buffer.

.. function:: full(shape: int | tuple[int, ...], fill_value: int | float | bool, *, dtype: int = float) -> ndarray

   Return a new array of *shape* and *dtype* with every element set to
   *fill_value*.

.. function:: linspace(start: float, stop: float, num: int = 50, *, endpoint: bool = True, retstep: bool = False, dtype: int = float) -> ndarray | tuple[ndarray, float]

   Return *num* evenly spaced samples over the closed interval ``[start, stop]``
   (or half-open if *endpoint* is ``False``). When *retstep* is ``True``, return
   a tuple ``(samples, step)``. Complex *start*/*stop* produce a complex array
   (when complex support is enabled).

.. function:: logspace(start: float, stop: float, num: int = 50, *, base: float = 10.0, endpoint: bool = True, dtype: int = float) -> ndarray

   Return *num* samples spaced evenly on a log scale: the result starts at
   ``base ** start`` and ends at ``base ** stop``.

.. function:: meshgrid(*xi: ndarray, indexing: str = 'xy') -> tuple[ndarray, ...]

   Return a tuple of coordinate matrices from a sequence of one-dimensional
   coordinate arrays. With *indexing* ``'xy'`` (the default) the first two
   inputs are treated as Cartesian coordinates and their output axes are
   swapped; with ``'ij'`` matrix-style indexing is used. The implementation
   corresponds to the NumPy equivalent with ``copy=True`` and
   ``sparse=False``.

.. function:: ones(shape: int | tuple[int, ...], *, dtype: int = float) -> ndarray

   Return a new array of *shape* and *dtype* filled with ones.

.. function:: zeros(shape: int | tuple[int, ...], *, dtype: int = float) -> ndarray

   Return a new array of *shape* and *dtype* filled with zeros.

Inspection / printing
---------------------

.. function:: get_printoptions() -> dict

   Return the current array printing options as a dict with keys
   ``threshold`` and ``edgeitems``.

.. function:: set_printoptions(*, threshold: int | None = None, edgeitems: int | None = None) -> None

   Set array printing options. *threshold* is the maximum number of array
   elements printed in full; *edgeitems* is the number of items shown at
   each end of an axis when the array is summarised.

.. function:: ndinfo(array: ndarray) -> None

   Print diagnostic information (shape, strides, dtype, itemsize, ...) about
   *array*.

.. function:: size(a: ndarray, *, axis: int | None = None) -> int

   Return the number of elements of *a* along *axis*; if *axis* is ``None``,
   return the total number of elements (the product of `ndarray.shape`).

Comparison
----------

.. function:: clip(a: ndarray | int | float, a_min: ndarray | int | float, a_max: ndarray | int | float) -> ndarray | int | float

   Clip the values of *a* so that ``a_min <= result <= a_max``. Equivalent to
   ``maximum(a_min, minimum(a, a_max))``; broadcasting follows the same rules
   as `minimum`.

.. function:: equal(x1: ndarray | int | float, x2: ndarray | int | float) -> ndarray | bool

   Element-wise ``x1 == x2``; returns a boolean `ndarray` (or a `bool` scalar
   if both inputs are scalars). Provided for portability -- the ``==`` operator
   on arrays gives the same result.

.. function:: not_equal(x1: ndarray | int | float, x2: ndarray | int | float) -> ndarray | bool

   Element-wise ``x1 != x2``; the boolean counterpart to `equal`.

.. function:: isfinite(x: ndarray | int | float) -> ndarray | bool

   Return a boolean array (or scalar) that is ``True`` where the input is
   finite. Integer inputs are always finite.

.. function:: isinf(x: ndarray | int | float) -> ndarray | bool

   Return a boolean array (or scalar) that is ``True`` where the input is
   infinite. Integer inputs are never infinite.

.. function:: maximum(x1: ndarray | int | float, x2: ndarray | int | float) -> ndarray | int | float

   Element-wise maximum of two arrays / scalars. The arguments are broadcast
   together; if dtypes differ, the output is upcast.

.. function:: minimum(x1: ndarray | int | float, x2: ndarray | int | float) -> ndarray | int | float

   Element-wise minimum of two arrays / scalars; counterpart to `maximum`.

.. function:: nonzero(a: ndarray) -> tuple[ndarray, ...]

   Return a tuple of `ndarray`, one per dimension of *a*, containing the
   indices of the non-zero elements of *a*.

.. function:: where(condition: ndarray | int | float, x: ndarray | int | float, y: ndarray | int | float) -> ndarray

   Return an `ndarray` whose elements come from *x* where *condition* is
   truthy, and from *y* otherwise. The three inputs are broadcast together;
   the output dtype is the upcast of *x* and *y*.

Numerical reductions
--------------------

.. function:: all(a: ndarray | list | tuple, *, axis: int | None = None) -> ndarray | bool

   Test whether all elements along *axis* evaluate to ``True``. With
   ``axis=None`` (the default) the flattened array is tested and a single
   `bool` is returned.

.. function:: any(a: ndarray | list | tuple, *, axis: int | None = None) -> ndarray | bool

   Test whether any element along *axis* evaluates to ``True``. With
   ``axis=None`` the flattened array is tested.

.. function:: argmax(a: ndarray | list | tuple, *, axis: int | None = None) -> ndarray | int

   Return the index of the maximum element along *axis*. With ``axis=None``
   the array is flattened and a single integer is returned.

.. function:: argmin(a: ndarray | list | tuple, *, axis: int | None = None) -> ndarray | int

   Return the index of the minimum element along *axis*. With ``axis=None``
   the array is flattened and a single integer is returned.

.. function:: argsort(a: ndarray, *, axis: int = -1) -> ndarray

   Return an unsigned integer index `ndarray` whose entries sort *a* in
   ascending order along *axis*. The output dtype is ``uint16``, so no axis
   may exceed 65535 elements. ``axis=None`` is not supported.

.. function:: cross(a: ndarray, b: ndarray) -> ndarray

   Return the cross product of two 1-D arrays of length 3.

.. function:: diff(a: ndarray, *, n: int = 1, axis: int = -1) -> ndarray

   Return the *n*-th discrete forward difference of *a* along *axis*. *n*
   must be in ``0..9`` (the differentiation stencil is stored in an
   ``int8``); the length of *axis* shrinks by *n*. The numpy ``prepend`` and
   ``append`` keywords are not implemented.

.. function:: flip(a: ndarray, *, axis: int | None = None) -> ndarray

   Return a new array with the order of elements reversed along *axis*; with
   ``axis=None`` the array is reversed along every axis.

.. function:: max(a: ndarray | list | tuple, *, axis: int | None = None, keepdims: bool = False) -> ndarray | int | float

   Return the maximum element along *axis*. With ``axis=None`` (the default)
   the flattened array is reduced to a scalar. The numpy ``out`` keyword is
   not implemented.

.. function:: min(a: ndarray | list | tuple, *, axis: int | None = None, keepdims: bool = False) -> ndarray | int | float

   Return the minimum element along *axis*; counterpart to `max`.

.. function:: mean(a: ndarray | list | tuple, *, axis: int | None = None, keepdims: bool = False) -> ndarray | float

   Return the arithmetic mean along *axis*. With ``axis=None`` (the default)
   the flattened array's mean is returned as a `float`.

.. function:: median(a: ndarray, *, axis: int | None = None) -> ndarray | float

   Return the median along *axis*. With ``axis=None`` the array is flattened
   first. The output dtype is always float.

.. function:: roll(a: ndarray, shift: int, *, axis: int | None = None) -> ndarray

   Return *a* with its elements rolled (cyclically shifted) by *shift*
   positions. With ``axis=None`` (the default) the array is flattened first.
   Negative shifts roll in the opposite direction.

.. function:: sort(a: ndarray, *, axis: int = -1) -> ndarray

   Return a sorted copy of *a* along *axis* using heap sort. With
   ``axis=None`` the array is flattened first. The numpy ``kind`` and
   ``order`` keywords are not implemented.

.. function:: std(a: ndarray | list | tuple, *, axis: int | None = None, ddof: int = 0, keepdims: bool = False) -> ndarray | float

   Return the standard deviation along *axis*. *ddof* is the delta degrees of
   freedom -- the divisor used is ``N - ddof``.

.. function:: sum(a: ndarray | list | tuple, *, axis: int | None = None, keepdims: bool = False) -> ndarray | int | float

   Return the sum along *axis*. With ``axis=None`` the flattened array's
   total is returned as a scalar.

Statistics
----------

.. function:: bincount(x: ndarray, *, weights: ndarray | None = None, minlength: int | None = None) -> ndarray

   Count the number of occurrences of each value in the one-dimensional,
   non-negative integer array *x*. The *x* dtype must be ``uint8`` or
   ``uint16``. If *weights* is given, each entry of *x* contributes its
   matching weight rather than ``1`` and the output is of dtype
   ``float``; otherwise the output is of dtype ``uint16``. If
   *minlength* is given, the output array has at least that many
   elements (extra entries are zero).

.. function:: trace(m: ndarray) -> int | float

   Return the sum of the diagonal elements of the square matrix *m*. The
   return type follows the dtype of *m* (integer arrays produce an int,
   float arrays a float).

Transform
---------

.. function:: compress(condition: ndarray | list | tuple, a: ndarray, *, axis: int | None = None) -> ndarray

   Return slices of *a* selected along *axis* by the boolean *condition*.
   With ``axis=None`` the flattened array is used.

.. function:: delete(a: ndarray, indices: int | ndarray | list | tuple | range, *, axis: int | None = None) -> ndarray

   Return a copy of *a* with the entries at *indices* removed along *axis*.
   With ``axis=None`` the array is flattened first. Negative indices count
   from the end of *axis*; *indices* is sorted internally before deletion.

.. function:: dot(m1: ndarray, m2: ndarray) -> ndarray | float

   Return the dot product of two arrays. For two 1-D arrays this is the
   inner product (a `float` scalar). For 2-D arrays this is matrix
   multiplication; the inner dimensions must match. The result is always of
   dtype ``float``.

Approximation
-------------

.. function:: interp(x: ndarray, xp: ndarray, fp: ndarray, *, left: float | None = None, right: float | None = None) -> ndarray

   One-dimensional linear interpolation. *xp* must be a monotonically
   increasing 1-D array of independent values; *fp* contains the
   corresponding dependent values; *x* are the points at which the
   interpolant is evaluated. *left* and *right* override the value returned
   for ``x < xp[0]`` and ``x > xp[-1]`` respectively (defaults: ``fp[0]`` and
   ``fp[-1]``).

.. function:: trapz(y: ndarray, x: ndarray | None = None, dx: float = 1.0) -> float

   Integrate *y* using the composite trapezoidal rule. If *x* is given it
   provides the sample positions corresponding to *y*; otherwise the spacing
   *dx* is used. *y* (and *x*) must be 1-D.

Selection
---------

.. function:: take(a: ndarray, indices: ndarray | list | tuple, *, axis: int | None = None, out: ndarray | None = None, mode: str | None = None) -> ndarray

   Take elements from *a* at the given *indices* along *axis*. With
   ``axis=None`` the flattened array is used. *mode* selects the
   out-of-bounds behaviour: ``"raise"`` (default -- raise ``ValueError``),
   ``"wrap"`` (modulo the axis length), or ``"clip"`` (clip to the valid
   range; negative indices are not allowed). If *out* is given the result
   is written into it.

Bitwise
-------

.. function:: bitwise_and(x1: ndarray, x2: ndarray) -> ndarray

   Element-wise bitwise AND of two integer arrays; broadcasting is supported.
   A non-integer dtype raises an exception.

.. function:: bitwise_or(x1: ndarray, x2: ndarray) -> ndarray

   Element-wise bitwise OR of two integer arrays.

.. function:: bitwise_xor(x1: ndarray, x2: ndarray) -> ndarray

   Element-wise bitwise XOR of two integer arrays.

.. function:: left_shift(x1: ndarray, x2: ndarray) -> ndarray

   Element-wise bitwise shift of *x1* left by *x2* bits; both arrays must
   have integer dtype.

.. function:: right_shift(x1: ndarray, x2: ndarray) -> ndarray

   Element-wise bitwise shift of *x1* right by *x2* bits; both arrays must
   have integer dtype.

Filtering
---------

.. function:: convolve(a: ndarray, v: ndarray) -> ndarray

   Return the discrete linear convolution of two 1-D arrays. Only ``"full"``
   mode is supported; the numpy ``mode`` keyword is not accepted (other modes
   can be obtained by slicing the full result). The output length is
   ``len(a) + len(v) - 1``.

Polynomial
----------

.. function:: polyfit(x: ndarray | list | tuple, y: ndarray | list | tuple, deg: int) -> ndarray
.. function:: polyfit(y: ndarray | list | tuple, deg: int) -> ndarray
   :no-index:

   Fit a polynomial of degree *deg* to the data points ``(x, y)`` by least
   squares and return the polynomial coefficients (highest degree first). If
   *x* is omitted, ``range(len(y))`` is used. Raises ``ValueError`` if the
   lengths of *x* and *y* differ.

.. function:: polyval(p: ndarray | list | tuple, x: ndarray | list | tuple | int | float) -> ndarray | float

   Evaluate the polynomial whose coefficients are *p* (highest degree first)
   at *x*. If *x* is a scalar a `float` is returned, otherwise an `ndarray`.

I/O
---

.. function:: load(file: str) -> ndarray

   Read an array previously written with `save` from *file* (numpy's
   platform-independent ``.npy`` format). Endianness is converted on the fly
   if the file's byte order differs from the host's.

.. function:: loadtxt(file: str, *, delimiter: str | None = None, comments: str = "#", max_rows: int = -1, usecols: int | ndarray | list | tuple | None = None, dtype: int = float, skiprows: int = 0) -> ndarray

   Read numeric data from a text *file* and return it as an `ndarray`.
   *delimiter* defaults to whitespace; *comments* is the line-comment marker;
   *max_rows* limits the number of data rows read (``-1`` for all);
   *usecols* selects columns by index; *skiprows* skips that many leading
   rows. If *dtype* is not float, values are converted by rounding.

.. function:: save(file: str, a: ndarray) -> None

   Save *a* to *file* in numpy's platform-independent ``.npy`` format.

.. function:: savetxt(file: str, a: ndarray, *, delimiter: str = " ", header: str | None = None, footer: str | None = None, comments: str = "# ") -> None

   Write *a* to *file* as text. *delimiter* separates values within a row;
   *header* and *footer*, if provided, are written before/after the data,
   each prefixed by *comments*. Values are written as floating point.

Complex helpers
---------------

These functions are only available when ulab was compiled with complex
support (``ULAB_SUPPORTS_COMPLEX``).

.. function:: real(val: ndarray) -> ndarray

   Return the real part of *val*. For a real-dtype input, returns a copy
   preserving the dtype; for a complex input, returns a float `ndarray`.

.. function:: imag(val: ndarray) -> ndarray

   Return the imaginary part of *val*. For a real-dtype input, returns an
   array of zeros with the same dtype; for a complex input, returns a float
   `ndarray`.

.. function:: conjugate(val: ndarray | complex | int | float) -> ndarray | complex | int | float

   Return the complex conjugate of *val*. Real-valued inputs are returned
   unchanged.

.. function:: sort_complex(a: ndarray) -> ndarray

   Sort the 1-D array *a* first by real part, then by imaginary part. The
   result is always of complex dtype, even if *a* was real-valued.

Universal functions
-------------------

Element-wise math functions. Each accepts a scalar or an `ndarray` and returns
a result of matching shape (a float scalar for scalar input, an ndarray for
array input). When called with an `ndarray`, the result is a new floating
point `ndarray`; an optional ``out`` keyword may be passed to write the result
into a pre-allocated float `ndarray` of the same size.

.. function:: acos(x: ndarray | float, /) -> ndarray | float

   Compute the inverse cosine (arc cosine) of each element of *x*; result is in radians.

.. function:: acosh(x: ndarray | float, /) -> ndarray | float

   Compute the inverse hyperbolic cosine of each element of *x*.

.. function:: arctan2(y: ndarray | float, x: ndarray | float, /) -> ndarray | float

   Compute the two-argument inverse tangent ``atan2(y, x)`` element-wise; supports broadcasting between the two inputs.

.. function:: around(x: ndarray, /, decimals: int = 0) -> ndarray

   Round the elements of the `ndarray` *x* to the given number of *decimals*; the first argument must be an `ndarray`.

.. function:: asin(x: ndarray | float, /) -> ndarray | float

   Compute the inverse sine (arc sine) of each element of *x*; result is in radians.

.. function:: asinh(x: ndarray | float, /) -> ndarray | float

   Compute the inverse hyperbolic sine of each element of *x*.

.. function:: atan(x: ndarray | float, /) -> ndarray | float

   Compute the inverse tangent (arc tangent) of each element of *x*; result is in radians.

.. function:: atanh(x: ndarray | float, /) -> ndarray | float

   Compute the inverse hyperbolic tangent of each element of *x*.

.. function:: ceil(x: ndarray | float, /) -> ndarray | float

   Compute the ceiling (smallest integer not less than the value) of each element of *x*.

.. function:: cos(x: ndarray | float, /) -> ndarray | float

   Compute the cosine of each element of *x* (in radians).

.. function:: cosh(x: ndarray | float, /) -> ndarray | float

   Compute the hyperbolic cosine of each element of *x*.

.. function:: degrees(x: ndarray | float, /) -> ndarray | float

   Convert each element of *x* from radians to degrees.

.. function:: exp(x: ndarray | float, /) -> ndarray | float

   Compute the exponential ``e**x`` of each element of *x*; may return a complex `ndarray` when given complex input (if complex support is enabled).

.. function:: expm1(x: ndarray | float, /) -> ndarray | float

   Compute ``exp(x) - 1`` of each element of *x* with improved precision near zero.

.. function:: floor(x: ndarray | float, /) -> ndarray | float

   Compute the floor (largest integer not greater than the value) of each element of *x*.

.. function:: log(x: ndarray | float, /) -> ndarray | float

   Compute the natural logarithm of each element of *x*.

.. function:: log10(x: ndarray | float, /) -> ndarray | float

   Compute the base-10 logarithm of each element of *x*.

.. function:: log2(x: ndarray | float, /) -> ndarray | float

   Compute the base-2 logarithm of each element of *x*.

.. function:: radians(x: ndarray | float, /) -> ndarray | float

   Convert each element of *x* from degrees to radians.

.. function:: sin(x: ndarray | float, /) -> ndarray | float

   Compute the sine of each element of *x* (in radians).

.. function:: sinc(x: ndarray | float, /) -> ndarray | float

   Compute the normalized sinc function ``sin(pi*x) / (pi*x)`` of each element of *x*.

.. function:: sinh(x: ndarray | float, /) -> ndarray | float

   Compute the hyperbolic sine of each element of *x*.

.. function:: sqrt(x: ndarray | float, /, *, dtype: int = float) -> ndarray | float

   Compute the square root of each element of *x*; pass ``dtype=numpy.complex`` to obtain complex results for negative real inputs (if complex support is enabled).

.. function:: tan(x: ndarray | float, /) -> ndarray | float

   Compute the tangent of each element of *x* (in radians).

.. function:: tanh(x: ndarray | float, /) -> ndarray | float

   Compute the hyperbolic tangent of each element of *x*.

.. function:: vectorize(f: Callable[[float], float], /, *, otypes: int | None = None) -> Callable

   Return a callable that applies the Python function *f* element-wise to a scalar, iterable, or `ndarray`; *otypes* selects the output dtype (default float).

Constants
---------

.. data:: e
   :type: float

   Euler's number :math:`e \approx 2.71828`.

.. data:: pi
   :type: float

   :math:`\pi \approx 3.14159`.

.. data:: inf
   :type: float

   IEEE-754 floating-point positive infinity.

.. data:: nan
   :type: float

   IEEE-754 floating-point "not a number".

.. data:: bool
   :type: int

   `ulab.dtype` code for boolean arrays (stored as ``uint8``).

.. data:: uint8
   :type: int

   `ulab.dtype` code for unsigned 8-bit integer arrays.

.. data:: int8
   :type: int

   `ulab.dtype` code for signed 8-bit integer arrays.

.. data:: uint16
   :type: int

   `ulab.dtype` code for unsigned 16-bit integer arrays.

.. data:: int16
   :type: int

   `ulab.dtype` code for signed 16-bit integer arrays.

.. data:: float
   :type: int

   `ulab.dtype` code for floating-point arrays. Element width is either
   32 bits or 64 bits depending on how MicroPython was built.

.. data:: complex
   :type: int

   `ulab.dtype` code for complex arrays. Only available when the firmware
   was built with ``ULAB_SUPPORTS_COMPLEX`` enabled. Complex elements
   pack two ``float`` values (real, imaginary).
