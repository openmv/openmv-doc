:mod:`struct` --- pack and unpack primitive data types
======================================================

.. module:: struct
   :synopsis: pack and unpack primitive data types

This module performs conversions between Python values and C-style structs
represented as Python bytes objects, using format strings to describe the
layout of the data.

The following byte orders are supported:

+-----------+------------------------+----------+-----------+
| Character | Byte order             | Size     | Alignment |
+===========+========================+==========+===========+
| @         | native                 | native   | native    |
+-----------+------------------------+----------+-----------+
| <         | little-endian          | standard | none      |
+-----------+------------------------+----------+-----------+
| >         | big-endian             | standard | none      |
+-----------+------------------------+----------+-----------+
| !         | network (= big-endian) | standard | none      |
+-----------+------------------------+----------+-----------+

The following data types are supported:

+--------+--------------------+-------------------+---------------+
| Format | C Type             | Python type       | Standard size |
+========+====================+===================+===============+
| b      | signed char        | integer           | 1             |
+--------+--------------------+-------------------+---------------+
| B      | unsigned char      | integer           | 1             |
+--------+--------------------+-------------------+---------------+
| h      | short              | integer           | 2             |
+--------+--------------------+-------------------+---------------+
| H      | unsigned short     | integer           | 2             |
+--------+--------------------+-------------------+---------------+
| i      | int                | integer (`1<fn>`) | 4             |
+--------+--------------------+-------------------+---------------+
| I      | unsigned int       | integer (`1<fn>`) | 4             |
+--------+--------------------+-------------------+---------------+
| l      | long               | integer (`1<fn>`) | 4             |
+--------+--------------------+-------------------+---------------+
| L      | unsigned long      | integer (`1<fn>`) | 4             |
+--------+--------------------+-------------------+---------------+
| q      | long long          | integer (`1<fn>`) | 8             |
+--------+--------------------+-------------------+---------------+
| Q      | unsigned long long | integer (`1<fn>`) | 8             |
+--------+--------------------+-------------------+---------------+
| e      | n/a (half-float)   | float (`2<fn>`)   | 2             |
+--------+--------------------+-------------------+---------------+
| f      | float              | float (`2<fn>`)   | 4             |
+--------+--------------------+-------------------+---------------+
| d      | double             | float (`2<fn>`)   | 8             |
+--------+--------------------+-------------------+---------------+
| s      | char[]             | bytes             |               |
+--------+--------------------+-------------------+---------------+
| P      | void *             | integer           |               |
+--------+--------------------+-------------------+---------------+

.. _fn:

(1) Requires long support when used with values larger than 30 bits.
(2) Requires floating point support.

.. admonition:: Difference to CPython
   :class: attention

   Whitespace is not supported in format strings.

Examples
--------

Pack and unpack little-endian values. The ``<`` prefix selects little-endian
byte order with standard sizes and no alignment::

    import struct

    # Pack an unsigned short (H, 2 bytes) then an unsigned int (I, 4 bytes).
    data = struct.pack("<HI", 7, 1000)
    # data == b'\x07\x00\xe8\x03\x00\x00'

    # Unpack returns a tuple of the values, in order.
    struct.unpack("<HI", data)
    # (7, 1000)

    # calcsize() reports how many bytes the format needs.
    struct.calcsize("<HI")
    # 6

Pack into and unpack from an existing buffer at a byte offset::

    buf = bytearray(8)

    # Write a little-endian signed int (i) at offset 2.
    struct.pack_into("<i", buf, 2, -12345)
    # buf == bytearray(b'\x00\x00\xc7\xcf\xff\xff\x00\x00')

    # Read it back from the same offset.
    struct.unpack_from("<i", buf, 2)
    # (-12345,)

Functions
---------

.. function:: calcsize(fmt: str) -> int

   Return the number of bytes needed to store the given *fmt*.

.. function:: pack(fmt: str, *values: Any) -> bytes

   Pack the *values* according to the format string *fmt*. The return value
   is a bytes object encoding the values.

.. function:: pack_into(fmt: str, buffer: Any, offset: int, *values: Any) -> None

   Pack the *values* according to the format string *fmt* into a *buffer*
   starting at *offset*. *offset* may be negative to count from the end of
   *buffer*.

.. function:: unpack(fmt: str, data: bytes) -> Tuple

   Unpack from the *data* according to the format string *fmt*.
   The return value is a tuple of the unpacked values.

.. function:: unpack_from(fmt: str, data: bytes, offset: int = 0, /) -> Tuple

   Unpack from the *data* starting at *offset* according to the format string
   *fmt*. *offset* may be negative to count from the end of *data*. The return
   value is a tuple of the unpacked values.
