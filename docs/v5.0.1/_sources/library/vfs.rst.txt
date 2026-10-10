:mod:`vfs` --- virtual filesystem control
=========================================

.. module:: vfs
   :synopsis: virtual filesystem control

The ``vfs`` module contains functions for creating filesystem objects and
mounting/unmounting them in the Virtual Filesystem.

Filesystem mounting
-------------------

Some ports provide a Virtual Filesystem (VFS) and the ability to mount multiple
"real" filesystems within this VFS.  Filesystem objects can be mounted at either
the root of the VFS, or at a subdirectory that lives in the root.  This allows
dynamic and flexible configuration of the filesystem that is seen by Python
programs.  Ports that have this functionality provide the :func:`mount` and
:func:`umount` functions, and possibly various filesystem implementations
represented by VFS classes.

.. function:: mount(fsobj: Any, mount_point: str, *, readonly: bool = False) -> None

    Mount the filesystem object *fsobj* at the location in the VFS given by the
    *mount_point* string.  *fsobj* can be a a VFS object that has a ``mount()``
    method, or a block device.  If it's a block device then the filesystem type
    is automatically detected (an exception is raised if no filesystem was
    recognised).  *mount_point* may be ``'/'`` to mount *fsobj* at the root,
    or ``'/<name>'`` to mount it at a subdirectory under the root.

    If *readonly* is ``True`` then the filesystem is mounted read-only.

    During the mount process the method ``mount()`` is called on the filesystem
    object.

    Will raise ``OSError(EPERM)`` if *mount_point* is already mounted.

.. function:: mount() -> List[Tuple[Any, str]]
    :noindex:

    With no arguments to :func:`mount`, return a list of tuples representing
    all active mountpoints.
    
    The returned list has the form *[(fsobj, mount_point), ...]*.

.. function:: umount(mount_point: Union[str, Any]) -> None

    Unmount a filesystem. *mount_point* can be a string naming the mount location,
    or a previously-mounted filesystem object.  During the unmount process the
    method ``umount()`` is called on the filesystem object.

    Will raise ``OSError(EINVAL)`` if *mount_point* is not found.

.. class:: VfsFat(block_dev: AbstractBlockDev)

    Create a filesystem object that uses the FAT filesystem format.  Storage of
    the FAT filesystem is provided by *block_dev*.
    Objects created by this constructor can be mounted using :func:`mount`.

    .. staticmethod:: mkfs(block_dev: AbstractBlockDev) -> None

        Build a FAT filesystem on *block_dev*.

.. class:: VfsRom(buffer: Union[bytes, bytearray, memoryview])

    Create a filesystem object that uses the :ref:`ROMFS read-only
    filesystem format <romfs>`. ``buffer`` must be an object supporting the
    buffer protocol (``bytes``, ``bytearray`` or ``memoryview``) that
    contains a valid ROMFS image.

    Objects created by this constructor can be mounted using :func:`mount`.

    See :ref:`romfs` for full details, including how to build and deploy
    ROMFS images with :ref:`mpremote <mpremote>`.

.. function:: rom_ioctl(op: int, *args: Any) -> Any

    Low-level interface for accessing the read-only memory (ROM)
    partition(s) of the device. The supported operations are:

    .. list-table::
       :header-rows: 1
       :widths: 38 62

       * - Call
         - Behaviour
       * - ``rom_ioctl(1)``
         - Return the number of available ROM partitions.
       * - ``rom_ioctl(2, id)``
         - Return partition ``id`` as a ``memoryview``.
       * - ``rom_ioctl(3, id, length)``
         - Erase the first ``length`` bytes of partition ``id`` in
           preparation for writing. Returns the minimum write alignment
           in bytes.
       * - ``rom_ioctl(4, id, offset, buf)``
         - Write ``buf`` to partition ``id`` at byte ``offset``.
       * - ``rom_ioctl(5, id)``
         - Finalise a write sequence to partition ``id`` (flushes
           caches, etc.).

    These operations are normally invoked indirectly by
    :ref:`mpremote <mpremote>` when deploying a ROMFS image; most
    applications do not need to call them directly.

.. class:: VfsPosix(root: Optional[str] = None)

    Create a filesystem object that accesses the host POSIX filesystem.
    If *root* is specified then it should be a path in the host filesystem to use
    as the root of the ``VfsPosix`` object.  Otherwise the current directory of
    the host filesystem is used.

    .. note::

       :class:`VfsPosix` is only available on the MicroPython Unix port; it
       is not present in OpenMV Cam firmware.

Block devices
-------------

A block device is an object which implements the block protocol. This enables a
device to support MicroPython filesystems. The physical hardware is represented
by a user defined class. The :class:`AbstractBlockDev` class is a template for
the design of such a class: MicroPython does not actually provide that class,
but an actual block device class must implement the methods described below.

A concrete implementation of this class will usually allow access to the
memory-like functionality of a piece of hardware (like flash memory). A block
device can be formatted to any supported filesystem and mounted using ``os``
methods.

See :ref:`filesystem` for example implementations of block devices using the
two variants of the block protocol described below.

.. _block-device-interface:

Simple and extended interface
.............................

There are two compatible signatures for the ``readblocks`` and ``writeblocks``
methods (see below), in order to support a variety of use cases.  A given block
device may implement one form or the other, or both at the same time. The second
form (with the offset parameter) is referred to as the "extended interface".

Some filesystems require more control over write operations -- for example,
writing to sub-block regions without erasing -- and need the block device to
support the extended interface.

.. class:: AbstractBlockDev

    Documentation template for the block-device protocol. MicroPython does
    not actually expose this class --- it is shown here only to document the
    methods a user-defined block-device class must implement. Constructor
    arguments are entirely up to the implementation (typically things like
    flash bus, chip-select pin, sector size, etc.).

    .. method:: readblocks(block_num: int, buf: bytearray) -> None
                readblocks(block_num: int, buf: bytearray, offset: int) -> None

        Read bytes from the device into *buf*. Two overloads expose the
        :ref:`simple and extended <block-device-interface>` interfaces.

        **Simple form** (``readblocks(block_num, buf)``): reads whole
        blocks starting at block index *block_num*. ``len(buf)`` must be
        a multiple of the block size, and the number of blocks read is
        ``len(buf) // block_size``.

        **Extended form** (``readblocks(block_num, buf, offset)``):
        reads ``len(buf)`` bytes -- not necessarily a whole number of
        blocks -- starting at byte ``offset`` within block *block_num*.
        Use this form when the filesystem needs sub-block read access.

    .. method:: writeblocks(block_num: int, buf: bytes) -> None
                writeblocks(block_num: int, buf: bytes, offset: int) -> None

        Write bytes from *buf* to the device.

        **Simple form** (``writeblocks(block_num, buf)``): writes whole
        blocks starting at block index *block_num*. ``len(buf)`` must be
        a multiple of the block size, and the number of blocks written
        is ``len(buf) // block_size``. The implementation is responsible
        for erasing each destination block first if the underlying
        hardware requires it.

        **Extended form** (``writeblocks(block_num, buf, offset)``):
        writes ``len(buf)`` bytes -- not necessarily a whole number of
        blocks -- starting at byte ``offset`` within block *block_num*.
        Only the bytes being written may change; the caller is
        responsible for ensuring affected blocks have been erased via a
        prior :meth:`ioctl(6, block_num) <ioctl>` call. Implementations
        of this form **must never** implicitly erase a block, even when
        ``offset`` is zero.

    .. method:: ioctl(op: int, arg: int) -> Optional[int]

        Control the block device and query its parameters.  The operation to
        perform is given by *op* which is one of the following integers:

          - 1 -- initialise the device (*arg* is unused)
          - 2 -- shutdown the device (*arg* is unused)
          - 3 -- sync the device (*arg* is unused)
          - 4 -- get a count of the number of blocks, should return an integer
            (*arg* is unused)
          - 5 -- get the number of bytes in a block, should return an integer,
            or ``None`` in which case the default value of 512 is used
            (*arg* is unused)
          - 6 -- erase a block, *arg* is the block number to erase

       As a minimum ``ioctl(4, ...)`` must be intercepted; filesystems that
       use the extended interface additionally require ``ioctl(6, ...)``.
       The need for the other operations is hardware-dependent.

       Before any call to ``writeblocks(block, ...)`` a filesystem that uses
       the extended interface issues ``ioctl(6, block)`` so the driver can
       erase the block first if the hardware requires it. A driver may
       instead intercept ``ioctl(6, block)`` and return 0 (success), taking
       on the responsibility for detecting when erasure is needed itself.

       Unless otherwise stated ``ioctl(op, arg)`` can return ``None``.
       Consequently an implementation can ignore unused values of ``op``. Where
       ``op`` is intercepted, the return value for operations 4 and 5 are as
       detailed above. Other operations should return 0 on success and non-zero
       for failure, with the value returned being an ``OSError`` errno code.
