:mod:`hashlib` --- hashing algorithms
=====================================

.. module:: hashlib
   :synopsis: hashing algorithms

This module implements binary data hashing algorithms.  Each algorithm is
exposed as a class whose instances accept incremental data via
``update()`` and produce a fixed-size digest via ``digest()``.  The
exact inventory of available algorithms depends on the board.  Among the
algorithms which may be implemented:

* SHA256 - The current generation, modern hashing algorithm (of SHA2 series).
  It is suitable for cryptographically-secure purposes. Included in the
  MicroPython core and any board is recommended to provide this, unless
  it has particular code size constraints.

* SHA1 - A previous generation algorithm. Not recommended for new usages,
  but SHA1 is a part of number of Internet standards and existing
  applications, so boards targeting network connectivity and
  interoperability will try to provide this.

* MD5 - A legacy algorithm, not considered cryptographically secure. Only
  selected boards, targeting interoperability with legacy applications,
  will offer this.

Classes
-------

.. class:: hashlib.sha256(data: bytes = b"")

    Create an SHA256 hasher object and optionally feed *data* into it.

    .. method:: update(data: bytes) -> None

       Feed more binary data into the hash.

    .. method:: digest() -> bytes

       Return the hash of all data passed through it so far, as a bytes
       object. After this method is called, no more data can be fed into the
       hash.

    .. note::

       ``hexdigest()`` is not implemented in MicroPython. Use
       ``binascii.hexlify(h.digest())`` to obtain a hex string.

.. class:: hashlib.sha1(data: bytes = b"")

    Create an SHA1 hasher object and optionally feed *data* into it.

    .. method:: update(data: bytes) -> None

       Feed more binary data into the hash.

    .. method:: digest() -> bytes

       Return the hash of all data passed through it so far, as a bytes
       object. After this method is called, no more data can be fed into the
       hash.

    .. note::

       ``hexdigest()`` is not implemented in MicroPython. Use
       ``binascii.hexlify(h.digest())`` to obtain a hex string.

.. class:: hashlib.md5(data: bytes = b"")

    Create an MD5 hasher object and optionally feed *data* into it.

    .. method:: update(data: bytes) -> None

       Feed more binary data into the hash.

    .. method:: digest() -> bytes

       Return the hash of all data passed through it so far, as a bytes
       object. After this method is called, no more data can be fed into the
       hash.

    .. note::

       ``hexdigest()`` is not implemented in MicroPython. Use
       ``binascii.hexlify(h.digest())`` to obtain a hex string.
