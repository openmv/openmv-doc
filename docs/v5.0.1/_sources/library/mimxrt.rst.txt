:mod:`mimxrt` --- functionality specific to NXP i.MXRT
======================================================

.. module:: mimxrt
    :synopsis: functionality specific to NXP i.MXRT

The ``mimxrt`` module contains functions and classes specific to the NXP
i.MXRT family of microcontrollers.

Classes
-------

.. class:: Flash()

   Get the singleton object that exposes the user-storage region of the
   on-board QSPI flash as a :class:`vfs.AbstractBlockDev`-compatible block
   device. Block numbers are relative to the start of that region, not
   the physical start of flash.

   In most cases, to store persistent data on the device, you'll want to
   use a higher-level abstraction -- for example the filesystem via
   Python's standard file API. This interface is useful to
   :ref:`customise the filesystem configuration <filesystem>` or
   implement a low-level storage system for your application.

   The object also implements the buffer protocol, allowing read-only
   memory-mapped access to the entire flash storage region via the QSPI
   XIP base. This makes a zero-copy view of the region available without
   issuing any flash reads::

      flash = mimxrt.Flash()
      view = memoryview(flash)
      magic = bytes(view[:4])      # read the first 4 bytes directly from XIP

   The block size used by the underlying flash sectors can be queried at
   runtime with :meth:`ioctl(5, 0) <ioctl>`.

   .. method:: readblocks(block_num: int, buf: bytearray) -> None
               readblocks(block_num: int, buf: bytearray, offset: int) -> None

      Read bytes from the flash into ``buf``. Two overloads expose the
      simple and extended interfaces:

      **Simple form** (``readblocks(block_num, buf)``): reads whole
      blocks starting at block index ``block_num``. ``len(buf)`` must be
      a multiple of the flash block size.

      **Extended form** (``readblocks(block_num, buf, offset)``): reads
      ``len(buf)`` bytes -- not necessarily a whole number of blocks --
      starting at byte ``offset`` within block ``block_num``.
      ``len(buf)`` has no alignment constraint.

   .. method:: writeblocks(block_num: int, buf: bytes) -> None
               writeblocks(block_num: int, buf: bytes, offset: int) -> None

      Write bytes from ``buf`` to the flash. Two overloads expose the
      simple and extended interfaces:

      **Simple form** (``writeblocks(block_num, buf)``): writes whole
      blocks starting at block index ``block_num``. ``len(buf)`` must be
      a multiple of the flash block size. Each affected block is erased
      automatically before being written.

      **Extended form** (``writeblocks(block_num, buf, offset)``):
      writes ``len(buf)`` bytes -- not necessarily a whole number of
      blocks -- starting at byte ``offset`` within block ``block_num``.
      ``len(buf)`` has no alignment constraint, and **no implicit erase
      is performed** -- the caller must ensure the affected blocks have
      been erased via a prior :meth:`ioctl(6, block_num) <ioctl>` call.

      Raises ``OSError`` if the underlying flash erase or write
      operation fails.

   .. method:: ioctl(cmd: int, arg: int) -> Optional[int]

      Standard :class:`vfs.AbstractBlockDev` ioctl entry point. See
      :meth:`vfs.AbstractBlockDev.ioctl` for the full list of ``cmd``
      values. ``cmd=5`` returns the flash block size in bytes; ``cmd=6``
      erases the block with index ``arg``.
