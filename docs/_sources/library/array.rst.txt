:mod:`array` -- arrays of numeric data
======================================

.. module:: array
   :synopsis: efficient arrays of numeric data

This module defines the :class:`array.array` type: a space-efficient
sequence of values of a single fixed numeric type, indexable like a list
but backed by a contiguous block of memory accessible via the buffer
protocol.

Supported type codes
~~~~~~~~~~~~~~~~~~~~

The single-character ``typecode`` argument selects the element type:

.. list-table::
   :header-rows: 1
   :widths: 10 30 10 15

   * - Type code
     - C type
     - Bytes
     - Python type
   * - ``'b'``
     - ``signed char``
     - 1
     - ``int``
   * - ``'B'``
     - ``unsigned char``
     - 1
     - ``int``
   * - ``'h'``
     - ``signed short``
     - 2
     - ``int``
   * - ``'H'``
     - ``unsigned short``
     - 2
     - ``int``
   * - ``'i'``
     - ``signed int``
     - 2 or 4
     - ``int``
   * - ``'I'``
     - ``unsigned int``
     - 2 or 4
     - ``int``
   * - ``'l'``
     - ``signed long``
     - 4
     - ``int``
   * - ``'L'``
     - ``unsigned long``
     - 4
     - ``int``
   * - ``'q'``
     - ``signed long long``
     - 8
     - ``int``
   * - ``'Q'``
     - ``unsigned long long``
     - 8
     - ``int``
   * - ``'f'``
     - ``float``
     - 4
     - ``float``
   * - ``'d'``
     - ``double``
     - 8
     - ``float``

The ``'f'`` and ``'d'`` codes require firmware built with floating-point
support (the default on most boards). The exact width of ``'i'`` and
``'I'`` follows the host C ABI — typically 4 bytes on the Cortex-M
ports.

Classes
-------

.. class:: array(typecode: str, iterable: Iterable = ())

    Create array with elements of given type. Initial contents of the
    array are given by *iterable*. If it is not provided, an empty
    array is created.

    In addition to the methods below, array objects also implement the buffer
    protocol. This means the contents of the entire array can be accessed as raw
    bytes via a `memoryview` or other interfaces which use this protocol.

    .. method:: append(val: Any) -> None

        Append new element *val* to the end of array, growing it.

    .. method:: extend(iterable: Iterable) -> None

        Append new elements as contained in *iterable* to the end of
        array, growing it.

    .. method:: __getitem__(index: int | slice) -> Any

        Indexed read of the array, called as ``a[index]`` (where ``a`` is an ``array``).
        Returns a value if *index* is an ``int`` and an ``array`` if *index* is a slice.
        Negative indices count from the end and ``IndexError`` is thrown if the index is
        out of range.

        **Note:** ``__getitem__`` cannot be called directly (``a.__getitem__(index)`` fails) and
        is not present in ``__dict__``, however ``a[index]`` does work.

    .. method:: __setitem__(index: int | slice, value: Any) -> None

        Indexed write into the array, called as ``a[index] = value`` (where ``a`` is an ``array``).
        ``value`` is a single value if *index* is an ``int`` and an ``array`` if *index* is a slice.
        Negative indices count from the end and ``IndexError`` is thrown if the index is out of range.

        **Note:** ``__setitem__`` cannot be called directly (``a.__setitem__(index, value)`` fails) and
        is not present in ``__dict__``, however ``a[index] = value`` does work.

    .. method:: __len__() -> int

        Returns the number of items in the array, called as ``len(a)`` (where ``a`` is an ``array``).

        **Note:** ``__len__`` cannot be called directly (``a.__len__()`` fails) and the
        method is not present in ``__dict__``, however ``len(a)`` does work.

    .. method:: __add__(other: array) -> array

        Return a new ``array`` that is the concatenation of the array with *other*, called as
        ``a + other`` (where ``a`` and *other* are both ``arrays``).

        **Note:** ``__add__`` cannot be called directly (``a.__add__(other)`` fails) and
        is not present in ``__dict__``, however ``a + other`` does work.

    .. method:: __iadd__(other: array) -> array

        Concatenates the array with *other* in-place, called as ``a += other`` (where ``a`` and *other*
        are both ``arrays``).  Equivalent to ``extend(other)``.

        **Note:** ``__iadd__`` cannot be called directly (``a.__iadd__(other)`` fails) and
        is not present in ``__dict__``, however ``a += other`` does work.

    .. method:: __repr__() -> str

        Returns the string representation of the array, called as ``str(a)``
        or ``repr(a)`` (where ``a`` is an ``array``).  Returns the string ``"array(<type>, [<elements>])"``,
        where ``<type>`` is the type code letter for the array and ``<elements>`` is a comma
        separated list of the elements of the array.

        **Note:** ``__repr__`` cannot be called directly (``a.__repr__()`` fails) and
        is not present in ``__dict__``, however ``str(a)`` and ``repr(a)`` both work.
