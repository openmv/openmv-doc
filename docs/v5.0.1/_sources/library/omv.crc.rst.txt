:mod:`crc` --- CRC Computation
==============================

.. module:: crc
   :synopsis: CRC Computation

The ``crc`` module computes CRC16 and CRC32 checksums over byte-like
buffers. Each function may be called with only ``data`` to start a new CRC,
or with a previous ``value`` to continue an existing CRC across multiple
buffers.

Example::

   import crc

   c = crc.crc32(b"hello ")
   c = crc.crc32(b"world", value=c)
   print(hex(c))

Functions
---------

.. function:: crc16(data:bytes, *, value:int=None) -> int

   Computes a CRC16 checksum over ``data``, which must be a buffer-like
   object (e.g. ``bytes``, ``bytearray``, or ``memoryview``).

   If ``value`` is not provided, a new CRC16 is started over ``data`` and
   returned. If ``value`` is provided, it is used as the previous CRC16
   state and updated with ``data`` before being returned, allowing CRC16
   computation across multiple buffers. Only the lower 16 bits of
   ``value`` are used.

   Returns the resulting CRC16 as an ``int``.

.. function:: crc32(data:bytes, *, value:int=None) -> int

   Computes a CRC32 checksum over ``data``, which must be a buffer-like
   object (e.g. ``bytes``, ``bytearray``, or ``memoryview``).

   If ``value`` is not provided, a new CRC32 is started over ``data`` and
   returned. If ``value`` is provided, it is used as the previous CRC32
   state and updated with ``data`` before being returned, allowing CRC32
   computation across multiple buffers.

   Returns the resulting CRC32 as an ``int``.
