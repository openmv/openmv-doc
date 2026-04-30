:mod:`mimxrt` --- functionality specific to NXP i.MXRT
======================================================

.. module:: mimxrt
    :synopsis: functionality specific to NXP i.MXRT

The ``mimxrt`` module contains functions and classes specific to the NXP
i.MXRT family of microcontrollers.

Classes
-------

.. class:: Flash()

   Gets the singleton object for accessing the SPI flash memory. This class
   gives access to the on-board SPI flash memory.

   In most cases, to store persistent data on the device, you'll want to
   use a higher-level abstraction, for example the filesystem via Python's
   standard file API, but this interface is useful to :ref:`customise the
   filesystem configuration <filesystem>` or implement a low-level storage
   system for your application.

   .. method:: readblocks(block_num: int, buf: bytearray) -> None
               readblocks(block_num: int, buf: bytearray, offset: int) -> None
               writeblocks(block_num: int, buf: bytes) -> None
               writeblocks(block_num: int, buf: bytes, offset: int) -> None
               ioctl(cmd: int, arg: int) -> Optional[int]

      These methods implement the simple and extended
      :ref:`block protocol <block-device-interface>` defined by
      :class:`vfs.AbstractBlockDev`.

      The block size can be queried by calling ``ioctl(5, 0)``. Block numbers
      are relative to the start of the user flash storage area, not the physical
      start of flash memory.
