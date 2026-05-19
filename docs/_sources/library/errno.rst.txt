:mod:`errno` --- system error codes
===================================

.. module:: errno
   :synopsis: system error codes

This module provides access to symbolic error codes for the :exc:`OSError`
exception, along with the :data:`errorcode` dictionary mapping numeric codes
back to their symbolic names.

Constants
---------

The error codes below are based on the ANSI C / POSIX standard; each is an
integer whose symbolic name starts with ``E``. These are the codes provided on
the OpenMV Cam. An error code is usually accessed as ``exc.errno`` where
``exc`` is an instance of :exc:`OSError`. Usage example::

    try:
        os.mkdir("my_dir")
    except OSError as exc:
        if exc.errno == errno.EEXIST:
            print("Directory already exists")

.. data:: EPERM
   :type: int

   Operation not permitted.

.. data:: ENOENT
   :type: int

   No such file or directory.

.. data:: EIO
   :type: int

   I/O error.

.. data:: EBADF
   :type: int

   Bad file descriptor.

.. data:: EAGAIN
   :type: int

   Resource temporarily unavailable. Returned by a non-blocking operation
   (e.g. a socket read/write) that would otherwise block.

.. data:: ENOMEM
   :type: int

   Out of memory.

.. data:: EACCES
   :type: int

   Permission denied.

.. data:: EEXIST
   :type: int

   File or directory already exists.

.. data:: ENODEV
   :type: int

   No such device.

.. data:: EISDIR
   :type: int

   Is a directory (an operation that requires a file was applied to a
   directory).

.. data:: EINVAL
   :type: int

   Invalid argument.

.. data:: EOPNOTSUPP
   :type: int

   Operation not supported on the socket or device.

.. data:: EADDRINUSE
   :type: int

   Address already in use.

.. data:: ECONNABORTED
   :type: int

   Connection aborted.

.. data:: ECONNRESET
   :type: int

   Connection reset by peer.

.. data:: ENOBUFS
   :type: int

   No buffer space available.

.. data:: ENOTCONN
   :type: int

   Socket is not connected.

.. data:: ETIMEDOUT
   :type: int

   Connection or operation timed out.

.. data:: ECONNREFUSED
   :type: int

   Connection refused.

.. data:: EHOSTUNREACH
   :type: int

   Host is unreachable (no route to host).

.. data:: EALREADY
   :type: int

   Operation already in progress.

.. data:: EINPROGRESS
   :type: int

   Operation now in progress (e.g. a non-blocking ``connect()``).

.. data:: errorcode
   :type: dict[int, str]

   Dictionary mapping each numeric error code to a string with its symbolic
   name::

       >>> print(errno.errorcode[errno.EEXIST])
       EEXIST
