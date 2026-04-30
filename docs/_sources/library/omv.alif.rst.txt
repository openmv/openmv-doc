:mod:`alif` --- Alif Ensemble SoC functions
===========================================

.. module:: alif
   :synopsis: Alif Ensemble SoC port-specific functions

The ``alif`` module exposes port-specific functionality for the Alif
Ensemble SoC, including a block-device wrapper for the on-board OSPI flash
and a helper to dump SoC information from the Secure Enclave services.

Example::

   import alif

   alif.info()
   flash = alif.Flash()

Functions
---------

.. function:: info() -> None

   Dumps device information collected from the Alif Secure Enclave services
   (SE services) to the serial terminal.

Classes
-------

.. class:: Flash(*, start:int=-1, len:int=-1)

   Creates a block-device object backed by the on-board OSPI flash. This
   class is only available when the firmware is built with OSPI support
   enabled.

   When called with no arguments, returns the default singleton object
   covering the writable filesystem region of flash.

   ``start`` is the byte offset into the flash storage region. Must be a
   multiple of the flash block size and within the flash storage range.
   Defaults to ``-1`` which means start at offset ``0``.

   ``len`` is the length in bytes of the flash region exposed by the object.
   Must be a multiple of the flash block size and not extend past the
   end of the flash storage region. Defaults to ``-1`` which means use
   all remaining bytes from ``start``.

   The object also implements the buffer protocol, allowing read-only
   memory-mapped access to the flash region via the OSPI XIP base.

   .. method:: readblocks(block_num:int, buf:bytearray) -> int
               readblocks(block_num:int, buf:bytearray, offset:int) -> int

      Reads from the flash starting at the block ``block_num`` (and an
      optional byte ``offset`` within that block) into ``buf``. The number
      of bytes read is determined by the length of ``buf``.

      Returns ``0`` on success or a negative error code.

   .. method:: writeblocks(block_num:int, buf:bytes) -> int
               writeblocks(block_num:int, buf:bytes, offset:int) -> int

      Writes ``buf`` to the flash starting at the block ``block_num`` (and
      an optional byte ``offset`` within that block).

      When called without ``offset``, the affected blocks are erased
      before being written. When called with ``offset``, the data is
      written without erasing first (the caller must ensure the target
      region has already been erased).

      Returns ``0`` on success or a negative error code.

   .. method:: ioctl(cmd:int, arg:int) -> int

      Performs a block-device control operation. ``cmd`` is one of the
      standard MicroPython ``MP_BLOCKDEV_IOCTL_*`` commands:

      * ``1`` (init) --- returns ``0``.
      * ``2`` (deinit) --- returns ``0``.
      * ``3`` (sync) --- returns ``0``.
      * ``4`` (block count) --- returns the number of blocks in the
        region.
      * ``5`` (block size) --- returns the flash block size in bytes.
      * ``6`` (block erase) --- erases the block at index ``arg`` and
        returns the result of the erase operation.

      Other ``cmd`` values return ``None``.

Constants
---------

.. data:: usb_msc
   :type: bool

   Present and set to ``True`` only when the firmware is built with USB
   Mass Storage Class support enabled. The attribute is absent otherwise.
