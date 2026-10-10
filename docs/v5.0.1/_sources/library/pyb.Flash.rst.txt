.. currentmodule:: pyb
.. _pyb.Flash:

class Flash -- access to built-in flash storage
===============================================

The Flash class allows direct access to the primary flash device on the
STM32-based OpenMV Cams.

In most cases, to store persistent data on the device, you'll want to use a
higher-level abstraction, for example the filesystem via Python's standard
file API, but this interface is useful to :ref:`customise the filesystem
configuration <filesystem>` or implement a low-level storage system for
your application.

.. note::

   The OpenMV Cam **H7 Plus**, **Pure Thermal** and **N6** use an external
   SPI/QSPI/XSPI flash chip for primary storage; the other STM32-based
   OpenMV Cams use the internal flash inside the :term:`MCU`. The Python
   interface is identical in both cases.

Constructors
------------

.. class:: Flash()
           Flash(*, start: int = -1, len: int = -1)

   Construct a :class:`vfs.AbstractBlockDev`-compatible block device for
   the on-board flash. Two forms exist:

   - ``Flash()`` (no arguments): returns the legacy singleton object that
     exposes the whole flash with a virtual partition table prepended.
     The actual flash data starts at block ``0x100``. **This form is
     deprecated** and will be removed in a future MicroPython release.
   - ``Flash(start=..., len=...)``: returns a fresh block device that
     accesses the flash starting at byte offset ``start`` (default
     ``0``) for ``len`` bytes (default: the remainder of the device).
     Both values must be a multiple of the underlying block size
     (typically 512 bytes for internal flash; the external SPI/QSPI/XSPI
     parts use a larger erase-sector size).

   Methods
   -------

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
      ``len(buf)`` has no alignment constraint. Only supported on
      objects created with explicit ``start`` / ``len`` arguments, not
      on the deprecated singleton.

   .. method:: writeblocks(block_num: int, buf: Union[bytes, bytearray]) -> None
               writeblocks(block_num: int, buf: Union[bytes, bytearray], offset: int) -> None

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
      Only supported on objects created with explicit ``start`` /
      ``len`` arguments.

   .. method:: ioctl(cmd: int, arg: int) -> Optional[int]

      Standard :class:`vfs.AbstractBlockDev` ioctl entry point. See
      :meth:`vfs.AbstractBlockDev.ioctl` for the full list of ``cmd``
      values. ``cmd=5`` returns the flash block size in bytes;
      ``cmd=6`` erases the block with index ``arg``.
