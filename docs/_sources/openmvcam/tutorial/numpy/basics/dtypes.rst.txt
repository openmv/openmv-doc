Dtypes
======

The element type of an :class:`~ulab.numpy.ndarray` is its
*dtype*. The dtype decides three things at once: how many
bytes each element occupies, how the bytes are
interpreted, and what range of values the array can store.
Choosing the right dtype is the single biggest decision
that affects RAM use on the camera.

The supported dtypes
--------------------

:mod:`numpy` on the camera supports a small set of
dtypes:

=============  =======  ===============================
dtype          bytes    range
=============  =======  ===============================
``uint8``      1        0 to 255
``int8``       1        -128 to 127
``uint16``     2        0 to 65 535
``int16``      2        -32 768 to 32 767
``float``      4 or 8   IEEE 754 (single or double)
``bool``       1        ``True`` / ``False``
``complex``    8 or 16  optional, firmware-dependent
=============  =======  ===============================

The ``float`` width depends on how the firmware was
built; ``complex`` is only available on cams whose
firmware reports a ``-c`` suffix in
:data:`ulab.__version__`. There is no ``int32`` or
``int64``.

Pick the type that matches the hardware that produced the
data. An 8-bit ADC sample wants ``uint8``; a 12-bit ADC
sample fits in ``uint16``; a luminance pixel from a
grayscale camera fits in ``uint8`` -- saving four to eight
times the RAM the default ``float`` would cost.

The default dtype
-----------------

The default dtype of every constructor on
:doc:`making-arrays` is ``float``. That is rarely what
the application wants when handling sensor data. Pass
``dtype=`` explicitly whenever the natural width is
smaller::

    sensor = np.array(samples, dtype=np.uint16)

Re-wrapping an integer array without a ``dtype=`` argument
copies *and* converts to float, which both costs time and
costs RAM. When performance matters, name the dtype.

The dtype of an existing array
------------------------------

:attr:`~ulab.numpy.ndarray.dtype` reads back the array's
dtype as a :class:`ulab.dtype` instance. The single-
character type code is what gets compared on
firmware-conditional code paths::

    a = np.array([1, 2, 3], dtype=np.uint8)
    print(a.dtype)            # dtype('uint8')

Upcasting rules
---------------

Two arrays of different dtypes can be operands of the
same operator. :mod:`numpy` picks the result type
according to a short table:

==========  ===========  ===========
left        right        result
==========  ===========  ===========
``uint8``   ``int8``     ``int16``
``uint8``   ``int16``    ``int16``
``uint8``   ``uint16``   ``uint16``
``int8``    ``int16``    ``int16``
``int8``    ``uint16``   ``uint16``
``uint16``  ``int16``    ``float``
any         ``float``    ``float``
any         ``complex``  ``complex``
==========  ===========  ===========

The last two rules promote straight to ``float`` because
:mod:`numpy` on the camera has no 32-bit integer dtype.

When a binary operator has a Python scalar on one side,
the scalar is converted to a single-element array of the
*smallest* suitable dtype: ``123`` becomes a ``uint8``
array, ``-1000`` becomes ``int16``, a Python ``float``
becomes ``float``.

Integer overflow wraps
----------------------

Operations on two arrays of the same integer dtype keep
that dtype, *even when the result overflows*. The carry
is silently dropped::

    a = np.array([200, 200], dtype=np.uint8)
    b = np.array([100, 100], dtype=np.uint8)
    print(a + b)

Output::

    array([44, 44], dtype=uint8)

The result is ``300 mod 256 == 44``. When an intermediate
needs more range than the input dtype allows, cast first::

    c = np.array(a, dtype=np.uint16) + b
    # array([300, 300], dtype=uint16)

This rule applies to every integer operator -- ``+``,
``-``, ``*``, ``//``, ``%``, ``&``, ``|``, ``^``. Float
arrays never overflow (they promote to infinity instead),
so the cast trick is only needed in the integer case.
