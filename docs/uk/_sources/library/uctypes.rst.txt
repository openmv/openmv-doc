:mod:`uctypes` --- access binary data in a structured way
=========================================================

.. module:: uctypes
   :synopsis: access binary data in a structured way

This module implements "foreign data interface" for MicroPython. The idea
behind it is similar to CPython's ``ctypes`` modules, but the actual API is
different, streamlined and optimized for small size. The basic idea of the
module is to define data structure layout with about the same power as the
C language allows, and then access it using familiar dot-syntax to reference
sub-fields.

.. warning::

    ``uctypes`` module allows access to arbitrary memory addresses of the
    machine (including I/O and control registers). Uncareful usage of it
    may lead to crashes, data loss, and even hardware malfunction.

.. seealso::

    Module :mod:`struct`
        The standard Python module for packing and unpacking binary
        data. :mod:`struct` operates on whole buffers at a time using a
        compact format string (e.g. ``'<HBB4sI'``), which works well for
        a few fixed fields but scales poorly to large or deeply-nested
        structures: every read or write re-parses the format string,
        unions and bitfields are not supported, and there is no way to
        get a typed view into an existing buffer. :mod:`uctypes`
        complements :mod:`struct` by letting you describe the layout
        once, attach it to a memory region (RAM, peripheral registers,
        a ``bytearray``) and then access individual fields as named
        attributes -- avoiding repeated parsing and copying, and adding
        support for nested structs, arrays, unions and bitfields.

Usage examples::

    import uctypes

    # Example 1: Subset of ELF file header
    # https://wikipedia.org/wiki/Executable_and_Linkable_Format#File_header
    ELF_HEADER = {
        "EI_MAG": (0x0 | uctypes.ARRAY, 4 | uctypes.UINT8),
        "EI_DATA": 0x5 | uctypes.UINT8,
        "e_machine": 0x12 | uctypes.UINT16,
    }

    # "f" is an ELF file opened in binary mode
    buf = f.read(uctypes.sizeof(ELF_HEADER, uctypes.LITTLE_ENDIAN))
    header = uctypes.struct(uctypes.addressof(buf), ELF_HEADER, uctypes.LITTLE_ENDIAN)
    assert header.EI_MAG == b"\x7fELF"
    assert header.EI_DATA == 1, "Oops, wrong endianness. Could retry with uctypes.BIG_ENDIAN."
    print("machine:", hex(header.e_machine))


    # Example 2: In-memory data structure, with pointers
    COORD = {
        "x": 0 | uctypes.FLOAT32,
        "y": 4 | uctypes.FLOAT32,
    }

    STRUCT1 = {
        "data1": 0 | uctypes.UINT8,
        "data2": 4 | uctypes.UINT32,
        "ptr": (8 | uctypes.PTR, COORD),
    }

    # Suppose you have address of a structure of type STRUCT1 in "addr"
    # uctypes.NATIVE is optional (used by default)
    struct1 = uctypes.struct(addr, STRUCT1, uctypes.NATIVE)
    print("x:", struct1.ptr[0].x)


    # Example 3: Access to CPU registers. Subset of STM32F4xx WWDG block
    WWDG_LAYOUT = {
        "WWDG_CR": (0, {
            # BFUINT32 here means size of the WWDG_CR register
            "WDGA": 7 << uctypes.BF_POS | 1 << uctypes.BF_LEN | uctypes.BFUINT32,
            "T": 0 << uctypes.BF_POS | 7 << uctypes.BF_LEN | uctypes.BFUINT32,
        }),
        "WWDG_CFR": (4, {
            "EWI": 9 << uctypes.BF_POS | 1 << uctypes.BF_LEN | uctypes.BFUINT32,
            "WDGTB": 7 << uctypes.BF_POS | 2 << uctypes.BF_LEN | uctypes.BFUINT32,
            "W": 0 << uctypes.BF_POS | 7 << uctypes.BF_LEN | uctypes.BFUINT32,
        }),
    }

    WWDG = uctypes.struct(0x40002c00, WWDG_LAYOUT)

    WWDG.WWDG_CFR.WDGTB = 0b10
    WWDG.WWDG_CR.WDGA = 1
    print("Current counter:", WWDG.WWDG_CR.T)

Defining structure layout
-------------------------

Structure layout is defined by a "descriptor" - a Python dictionary which
encodes field names as keys and other properties required to access them as
associated values::

    {
        "field1": <properties>,
        "field2": <properties>,
        ...
    }

Currently, ``uctypes`` requires explicit specification of offsets for each
field. Offset are given in bytes from the structure start.

Following are encoding examples for various field types:

* Scalar types::

    "field_name": offset | uctypes.UINT32

  in other words, the value is a scalar type identifier ORed with a field offset
  (in bytes) from the start of the structure.

* Recursive structures::

    "sub": (offset, {
        "b0": 0 | uctypes.UINT8,
        "b1": 1 | uctypes.UINT8,
    })

  i.e. value is a 2-tuple, first element of which is an offset, and second is
  a structure descriptor dictionary (note: offsets in recursive descriptors
  are relative to the structure it defines). Of course, recursive structures
  can be specified not just by a literal dictionary, but by referring to a
  structure descriptor dictionary (defined earlier) by name.

* Arrays of primitive types::

      "arr": (offset | uctypes.ARRAY, size | uctypes.UINT8),

  i.e. value is a 2-tuple, first element of which is ARRAY flag ORed
  with offset, and second is scalar element type ORed number of elements
  in the array.

* Arrays of aggregate types::

    "arr2": (offset | uctypes.ARRAY, size, {"b": 0 | uctypes.UINT8}),

  i.e. value is a 3-tuple, first element of which is ARRAY flag ORed
  with offset, second is a number of elements in the array, and third is
  a descriptor of element type.

* Pointer to a primitive type::

    "ptr": (offset | uctypes.PTR, uctypes.UINT8),

  i.e. value is a 2-tuple, first element of which is PTR flag ORed
  with offset, and second is a scalar element type.

* Pointer to an aggregate type::

    "ptr2": (offset | uctypes.PTR, {"b": 0 | uctypes.UINT8}),

  i.e. value is a 2-tuple, first element of which is PTR flag ORed
  with offset, second is a descriptor of type pointed to.

* Bitfields::

    "bitf0": offset | uctypes.BFUINT16 | lsbit << uctypes.BF_POS | bitsize << uctypes.BF_LEN,

  i.e. value is a type of scalar value containing given bitfield (typenames are
  similar to scalar types, but prefixes with ``BF``), ORed with offset for
  scalar value containing the bitfield, and further ORed with values for
  bit position and bit length of the bitfield within the scalar value, shifted by
  BF_POS and BF_LEN bits, respectively. A bitfield position is counted
  from the least significant bit of the scalar (having position of 0), and
  is the number of right-most bit of a field (in other words, it's a number
  of bits a scalar needs to be shifted right to extract the bitfield).

  In the example above, first a UINT16 value will be extracted at offset 0
  (this detail may be important when accessing hardware registers, where
  particular access size and alignment are required), and then bitfield
  whose rightmost bit is *lsbit* bit of this UINT16, and length
  is *bitsize* bits, will be extracted. For example, if *lsbit* is 0 and
  *bitsize* is 8, then effectively it will access least-significant byte
  of UINT16.

  Note that bitfield operations are independent of target byte endianness,
  in particular, example above will access least-significant byte of UINT16
  in both little- and big-endian structures. But it depends on the least
  significant bit being numbered 0. Some targets may use different
  numbering in their native ABI, but ``uctypes`` always uses the normalized
  numbering described above.

Module contents
---------------

.. class:: struct(addr: int, descriptor: dict, layout_type: int = NATIVE, /)

   Instantiate a "foreign data structure" object based on structure address in
   memory, descriptor (encoded as a dictionary), and layout type (see below).

.. data:: LITTLE_ENDIAN
   :type: int

   Layout type for a little-endian packed structure. (Packed means that every
   field occupies exactly as many bytes as defined in the descriptor, i.e.
   the alignment is 1).

.. data:: BIG_ENDIAN
   :type: int

   Layout type for a big-endian packed structure.

.. data:: NATIVE
   :type: int

   Layout type for a native structure - with data endianness and alignment
   conforming to the ABI of the system on which MicroPython runs.

.. function:: sizeof(struct: Union[dict, Any], layout_type: int = NATIVE, /) -> int

   Return size of data structure in bytes. The *struct* argument can be
   either a structure class or a specific instantiated structure object
   (or its aggregate field).

.. function:: addressof(obj: Any) -> int

   Return address of an object. Argument should be bytes, bytearray or
   other object supporting buffer protocol (and address of this buffer
   is what actually returned).

.. function:: bytes_at(addr: int, size: int) -> bytes

   Capture memory at the given address and size as bytes object. As bytes
   object is immutable, memory is actually duplicated and copied into
   bytes object, so if memory contents change later, created object
   retains original value.

.. function:: bytearray_at(addr: int, size: int) -> bytearray

   Capture memory at the given address and size as bytearray object.
   Unlike bytes_at() function above, memory is captured by reference,
   so it can be both written too, and you will access current value
   at the given memory address.

Scalar integer types. Each occupies the obvious number of bytes
(``1``, ``2``, ``4`` or ``8``) and is read/written using the
endianness of the structure's layout type (one of :data:`NATIVE`,
:data:`LITTLE_ENDIAN`, or :data:`BIG_ENDIAN`).

.. data:: UINT8
   :type: int

   Unsigned 8-bit integer. Range ``0`` -- ``255``.

.. data:: INT8
   :type: int

   Signed 8-bit integer. Range ``-128`` -- ``127``.

.. data:: UINT16
   :type: int

   Unsigned 16-bit integer. Range ``0`` -- ``65535``.

.. data:: INT16
   :type: int

   Signed 16-bit integer. Range ``-32768`` -- ``32767``.

.. data:: UINT32
   :type: int

   Unsigned 32-bit integer. Range ``0`` -- ``0xFFFFFFFF``.

.. data:: INT32
   :type: int

   Signed 32-bit integer. Range ``-0x80000000`` -- ``0x7FFFFFFF``.

.. data:: UINT64
   :type: int

   Unsigned 64-bit integer. Range ``0`` -- ``0xFFFFFFFFFFFFFFFF``.

.. data:: INT64
   :type: int

   Signed 64-bit integer. Range ``-0x8000000000000000`` -- ``0x7FFFFFFFFFFFFFFF``.

.. data:: FLOAT32
   :type: int

   IEEE 754 single-precision floating-point (4 bytes). Reads and writes
   are converted to/from a Python ``float``.

.. data:: FLOAT64
   :type: int

   IEEE 754 double-precision floating-point (8 bytes). Reads and writes
   are converted to/from a Python ``float``.

.. data:: VOID
   :type: int

   Alias for :data:`UINT8`. Provided so that C-style ``void *`` fields
   can be described idiomatically as ``(uctypes.PTR, uctypes.VOID)``.

.. data:: PTR
   :type: int

   Marks a descriptor field as a pointer to another type. A pointer
   field is written as a two-tuple
   ``(offset | PTR, target_type_or_descriptor)``. Dereferencing the
   pointer yields a typed view into the address it holds.

.. data:: ARRAY
   :type: int

   Marks a descriptor field as a fixed-length array of another type.
   An array field is either ``(offset | ARRAY, count | element_type)``
   for arrays of scalars or
   ``(offset | ARRAY, count, element_descriptor)`` for arrays of
   structures. The number of elements is fixed at descriptor time.

There is no explicit constant for structures: an aggregate descriptor
that uses neither :data:`PTR` nor :data:`ARRAY` is treated as a
structure.

Structure descriptors and instantiating structure objects
---------------------------------------------------------

Given a structure descriptor dictionary and its layout type, you can
instantiate a specific structure instance at a given memory address
using :class:`uctypes.struct()` constructor. Memory address usually comes from
following sources:

* Predefined address, when accessing hardware registers on a baremetal
  system. Lookup these addresses in datasheet for a particular MCU/SoC.
* As a return value from a call to some FFI (Foreign Function Interface)
  function.
* From `uctypes.addressof()`, when you want to pass arguments to an FFI
  function, or alternatively, to access some data for I/O (for example,
  data read from a file or network socket).

Structure objects
-----------------

Structure objects allow accessing individual fields using standard dot
notation: ``my_struct.substruct1.field1``. If a field is of scalar type,
getting it will produce a primitive value (Python integer or float)
corresponding to the value contained in a field. A scalar field can also
be assigned to.

If a field is an array, its individual elements can be accessed with
the standard subscript operator ``[]`` - both read and assigned to.

If a field is a pointer, it can be dereferenced using ``[0]`` syntax
(corresponding to C ``*`` operator, though ``[0]`` works in C too).
Subscripting a pointer with other integer values but 0 are also supported,
with the same semantics as in C.

Summing up, accessing structure fields generally follows the C syntax,
except for pointer dereference, when you need to use ``[0]`` operator
instead of ``*``.

Limitations
-----------

1. Accessing non-scalar fields leads to allocation of intermediate objects
to represent them. This means that special care should be taken to
layout a structure which needs to be accessed when memory allocation
is disabled (e.g. from an interrupt). The recommendations are:

* Avoid accessing nested structures. For example, instead of
  ``mcu_registers.peripheral_a.register1``, define separate layout
  descriptors for each peripheral, to be accessed as
  ``peripheral_a.register1``. Or just cache a particular peripheral:
  ``peripheral_a = mcu_registers.peripheral_a``. If a register
  consists of multiple bitfields, you would need to cache references
  to a particular register: ``reg_a = mcu_registers.peripheral_a.reg_a``.
* Avoid other non-scalar data, like arrays. For example, instead of
  ``peripheral_a.register[0]`` use ``peripheral_a.register0``. Again,
  an alternative is to cache intermediate values, e.g.
  ``register0 = peripheral_a.register[0]``.

2. Range of offsets supported by the ``uctypes`` module is limited.
The exact range supported is considered an implementation detail,
and the general suggestion is to split structure definitions to
cover from a few kilobytes to a few dozen of kilobytes maximum.
In most cases, this is a natural situation anyway, e.g. it doesn't make
sense to define all registers of an MCU (spread over 32-bit address
space) in one structure, but rather a peripheral block by peripheral
block. In some extreme cases, you may need to split a structure in
several parts artificially (e.g. if accessing native data structure
with multi-megabyte array in the middle, though that would be a very
synthetic case).
