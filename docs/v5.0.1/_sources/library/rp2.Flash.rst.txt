.. currentmodule:: rp2
.. _rp2.Flash:

class Flash -- access to built-in flash storage
===============================================

The :class:`Flash` class provides direct, block-level access to the
RP2040's external QSPI flash chip. The driver implements the
:class:`vfs.AbstractBlockDev` interface so it can be passed to
:func:`vfs.mount` for custom filesystem configurations.

Most scripts persist data through the auto-mounted filesystem at
``/`` and never construct :class:`Flash` directly. Construct one
manually when you need to:

   * Mount a non-default filesystem (e.g. wrap with
     :class:`vfs.VfsFat`) on a custom partition.
   * Read or write firmware regions or factory-data blocks that
     aren't owned by the filesystem.
   * Implement a custom on-flash storage format that bypasses the
     filesystem layer.

Constructors
------------

.. class:: Flash() -> Flash

   Return the singleton :class:`Flash` block-device object backed
   by the RP2040's QSPI flash chip. The first block exposed is the
   one immediately after the firmware region, so callers see only
   the filesystem-eligible area of the chip.

   Methods
   -------

   .. method:: readblocks(block_num: int, buf: bytearray) -> None
               readblocks(block_num: int, buf: bytearray, offset: int) -> None

      Read bytes from the flash into ``buf``. Standard
      :class:`vfs.AbstractBlockDev` block-device entry point used
      by the filesystem layer.

      **Simple form** (``readblocks(block_num, buf)``): read whole
      blocks starting at block index ``block_num``. ``len(buf)``
      must be a multiple of the flash block size.

      **Extended form** (``readblocks(block_num, buf, offset)``):
      read ``len(buf)`` bytes -- not necessarily a whole number of
      blocks -- starting at byte ``offset`` within block
      ``block_num``. Used by littlefs and other byte-addressable
      filesystems.

   .. method:: writeblocks(block_num: int, buf: bytes) -> None
               writeblocks(block_num: int, buf: bytes, offset: int) -> None

      Write bytes from ``buf`` to the flash. Standard
      :class:`vfs.AbstractBlockDev` block-device entry point used
      by the filesystem layer.

      **Simple form** (``writeblocks(block_num, buf)``): write
      whole blocks starting at block index ``block_num``.
      ``len(buf)`` must be a multiple of the flash block size.
      Each affected block is erased automatically before being
      written.

      **Extended form** (``writeblocks(block_num, buf, offset)``):
      write ``len(buf)`` bytes -- not necessarily a whole number
      of blocks -- starting at byte ``offset`` within block
      ``block_num``. **No implicit erase** is performed -- the
      caller must ensure the affected blocks have been erased via
      a prior ``ioctl(6, block_num)`` call.

   .. method:: ioctl(cmd: int, arg: int) -> int | None

      Standard :class:`vfs.AbstractBlockDev` control entry point.
      Called by the filesystem layer at mount/unmount time and on
      every sync. Recognised ``cmd`` values:

         * ``1`` -- initialise. Returns ``0`` on success.
         * ``2`` -- deinitialise. Returns ``0`` on success.
         * ``3`` -- sync pending writes. Returns ``0``.
         * ``4`` -- return the number of flash blocks visible to
           the filesystem.
         * ``5`` -- return the block size in bytes (typically the
           flash sector size, ``4096``).
         * ``6`` -- erase the block at index ``arg``. Required
           before using the extended ``writeblocks`` form.
         * ``7`` -- return whether the device supports the block
           erase command (``1`` on RP2040).

      Direct callers normally don't use this method -- the
      filesystem driver dispatches the standard codes
      automatically once the :class:`Flash` is mounted.
