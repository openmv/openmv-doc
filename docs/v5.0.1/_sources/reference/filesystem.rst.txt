.. _filesystem:

Working with filesystems
========================

.. contents::
   :local:
   :depth: 1

This tutorial describes how the OpenMV Cam provides an on-device filesystem,
allowing standard Python file I/O methods to be used with persistent storage.

The OpenMV Cam creates a default configuration and auto-detects and mounts the
primary filesystem on power-on, so this tutorial is mostly useful if you want
to repartition the flash, change the filesystem type, or use a custom block
device.

The filesystem is backed by the internal flash memory, or by an SD card when
one is installed.

VFS
---

MicroPython implements a Unix-like Virtual File System (VFS) layer. All mounted
filesystems are combined into a single virtual filesystem, starting at the root
``/``. Filesystems are mounted into directories in this structure, and at
startup the working directory is set to the primary filesystem.

On the OpenMV Cam the internal flash is mounted at ``/flash`` and is the
working directory. If an SD card is installed it is mounted at ``/sdcard``
and becomes the working directory instead.

Block devices
-------------

A block device is an instance of a class that implements the
:class:`vfs.AbstractBlockDev` protocol.

On power-on the OpenMV Cam attempts to detect the filesystem on the internal
flash (or SD card) and configure and mount it automatically. If no filesystem
is found, a FAT filesystem spanning the entire flash is created. To erase or
reformat the on-board filesystem the easiest path is OpenMV IDE or a
:ref:`factory reset <soft_bricking>`; the lower-level Python API below is for
advanced/programmatic use.

Internal flash
~~~~~~~~~~~~~~

On STM32-based OpenMV Cams the :ref:`pyb.Flash <pyb.Flash>` class provides
access to the internal flash. On boards which have larger external flash it
will use that instead. The ``start`` kwarg should always be specified, i.e.
``pyb.Flash(start=0)``.

Note: For backwards compatibility, when constructed with no arguments (i.e.
``pyb.Flash()``), it only implements the simple block interface and reflects
the virtual device presented to USB mass storage (i.e. it includes a virtual
partition table at the start).

Custom block devices
~~~~~~~~~~~~~~~~~~~~

You can also create your own block device in Python and mount it — for example
a RAM disk. The following class implements a simple block device that stores
its data in RAM using a ``bytearray``::

    class RAMBlockDev:
        def __init__(self, block_size, num_blocks):
            self.block_size = block_size
            self.data = bytearray(block_size * num_blocks)

        def readblocks(self, block_num, buf):
            for i in range(len(buf)):
                buf[i] = self.data[block_num * self.block_size + i]

        def writeblocks(self, block_num, buf):
            for i in range(len(buf)):
                self.data[block_num * self.block_size + i] = buf[i]

        def ioctl(self, op, arg):
            if op == 4: # get number of blocks
                return len(self.data) // self.block_size
            if op == 5: # get block size
                return self.block_size

It can be used as follows::

    import vfs

    bdev = RAMBlockDev(512, 50)
    vfs.VfsFat.mkfs(bdev)
    vfs.mount(bdev, '/ramdisk')

Once mounted, the filesystem can be used as it
normally would be used from Python code, for example::

    with open('/ramdisk/hello.txt', 'w') as f:
        f.write('Hello world')
    print(open('/ramdisk/hello.txt').read())

Filesystems
-----------

The OpenMV Cam formats the internal flash as :class:`FAT <vfs.VfsFat>` so
that, on boards that expose the filesystem over USB mass storage, the host PC
can read and write it with no extra drivers.

FAT is not tolerant to power failure during writes, which can lead to
filesystem corruption. Eject/unmount the drive on the host before powering
the camera off, and prefer an SD card over the internal flash for data the
script writes back.

On STM32-based OpenMV Cams the internal flash can be reformatted from Python::

    import os, vfs, pyb
    vfs.umount('/flash')
    vfs.VfsFat.mkfs(pyb.Flash(start=0))
    vfs.mount(pyb.Flash(start=0), '/flash')
    os.chdir('/flash')
