:mod:`io` --- input/output streams
==================================

.. module:: io
   :synopsis: input/output streams

This module contains additional types of :std:term:`stream` (file-like) objects
and helper functions.  It exposes the :func:`open` builtin along with
in-memory text and binary buffers (:class:`StringIO`, :class:`BytesIO`)
that implement the standard ``read``/``write``/``seek`` stream interface.

Conceptual hierarchy
--------------------

.. admonition:: Difference to CPython
   :class: attention

   Conceptual hierarchy of stream base classes is simplified in MicroPython,
   as described in this section.

(Abstract) base stream classes, which serve as a foundation for behaviour
of all the concrete classes, adhere to few dichotomies (pair-wise
classifications) in CPython. In MicroPython, they are somewhat simplified
and made implicit to achieve higher efficiencies and save resources.

An important dichotomy in CPython is unbuffered vs buffered streams. In
MicroPython, all streams are currently unbuffered. This is because all
modern OSes, and even many RTOSes and filesystem drivers already perform
buffering on their side. Adding another layer of buffering is counter-
productive (an issue known as "bufferbloat") and takes precious memory.
Note that there still cases where buffering may be useful, so we may
introduce optional buffering support at a later time.

But in CPython, another important dichotomy is tied with "bufferedness" -
it's whether a stream may incur short read/writes or not. A short read
is when a user asks e.g. 10 bytes from a stream, but gets less, similarly
for writes. In CPython, unbuffered streams are automatically short
operation susceptible, while buffered are guarantee against them. The
no short read/writes is an important trait, as it allows to develop
more concise and efficient programs - something which is highly desirable
for MicroPython. So, while MicroPython doesn't support buffered streams,
it still provides for no-short-operations streams. Whether there will
be short operations or not depends on each particular class' needs, but
developers are strongly advised to favour no-short-operations behaviour
for the reasons stated above. For example, MicroPython sockets are
guaranteed to avoid short read/writes. Actually, at this time, there is
no example of a short-operations stream class in the core, and one would
be a port-specific class, where such a need is governed by hardware
peculiarities.

The no-short-operations behaviour gets tricky in case of non-blocking
streams, blocking vs non-blocking behaviour being another CPython dichotomy,
fully supported by MicroPython. Non-blocking streams never wait for
data either to arrive or be written - they read/write whatever possible,
or signal lack of data (or ability to write data). Clearly, this conflicts
with "no-short-operations" policy, and indeed, a case of non-blocking
buffered (and this no-short-ops) streams is convoluted in CPython - in
some places, such combination is prohibited, in some it's undefined or
just not documented, in some cases it raises verbose exceptions. The
matter is much simpler in MicroPython: non-blocking stream are important
for efficient asynchronous operations, so this property prevails on
the "no-short-ops" one. So, while blocking streams will avoid short
reads/writes whenever possible (the only case to get a short read is
if end of file is reached, or in case of error (but errors don't
return short data, but raise exceptions)), non-blocking streams may
produce short data to avoid blocking the operation.

The final dichotomy is binary vs text streams. MicroPython of course
supports these, but while in CPython text streams are inherently
buffered, they aren't in MicroPython. (Indeed, that's one of the cases
for which we may introduce buffering support.)

Note that for efficiency, MicroPython doesn't provide abstract base
classes corresponding to the hierarchy above, and it's not possible
to implement, or subclass, a stream class in pure Python.

Functions
---------

.. function:: open(name: str, mode: str = 'r', **kwargs) -> Any

    Open a file. Builtin ``open()`` function is aliased to this function.
    All ports (which provide access to file system) are required to support
    *mode* parameter, but support for other arguments vary by port.

Classes
-------

.. class:: IOBase

    Base class for implementing stream ("file-like") objects in pure Python.
    Derive from this class and implement the methods below; the runtime calls
    them when the corresponding stream operation is performed on an instance.

    .. method:: readinto(buf: bytearray) -> Optional[int]

        Read bytes into the writable buffer *buf*. Return the number of bytes
        read, ``0`` at end of stream, or ``None`` if no data is available
        right now (for a non-blocking stream).

    .. method:: write(buf: bytes) -> Optional[int]

        Write the bytes in *buf*. Return the number of bytes written, or
        ``None`` if the write cannot be performed right now (for a
        non-blocking stream).

    .. method:: ioctl(request: int, arg: int) -> int

        Control the underlying stream/device. *request* is one of the
        ``MP_STREAM_*`` request codes. Return a non-negative value on success,
        or a negative ``errno`` value on error.

.. class:: StringIO(string: str = "")
           StringIO(alloc_size: int)

    In-memory file-like object for text-mode input/output (similar to a
    normal file opened with the "t" modifier). The first form initializes the
    contents from the *string* parameter (which should be a normal string).
    The second form creates an empty ``StringIO`` preallocated to hold up to
    *alloc_size* bytes, so writing up to that many bytes will not reallocate
    the buffer (avoiding an out-of-memory situation or memory fragmentation);
    it is a MicroPython extension recommended only for special cases and
    system-level libraries, not end-user applications. Instances also support
    the context-manager protocol (usable in a ``with`` statement).

    .. admonition:: Difference to CPython
        :class: attention

        The ``StringIO(alloc_size)`` constructor is a MicroPython extension.

    .. method:: read(size: int = -1) -> str

        Read and return up to *size* characters. If *size* is omitted or
        negative, read and return all remaining contents.

    .. method:: readline(size: int = -1) -> str

        Read and return one line. If *size* is given, at most *size*
        characters are read.

    .. method:: readinto(buf: bytearray) -> int

        Read into the pre-allocated, writable buffer *buf* and return the
        number of bytes read.

    .. method:: write(s: str) -> int

        Write the string *s* and return the number of characters written.

    .. method:: seek(offset: int, whence: int = 0) -> int

        Change the stream position to *offset* relative to *whence*
        (``0`` = start, ``1`` = current, ``2`` = end) and return the new
        absolute position.

    .. method:: tell() -> int

        Return the current stream position.

    .. method:: flush() -> None

        Flush the write buffers. This is a no-op for an in-memory stream.

    .. method:: close() -> None

        Close the stream and free the underlying buffer. Further operations
        on a closed stream raise :exc:`ValueError`.

    .. method:: getvalue() -> str

        Return the current contents of the underlying buffer.

.. class:: BytesIO(string: bytes = b"")
           BytesIO(alloc_size: int)

    In-memory file-like object for binary-mode input/output (similar to a
    normal file opened with the "b" modifier). The first form initializes the
    contents from the *string* parameter (which should be a bytes object).
    The second form creates an empty ``BytesIO`` preallocated to hold up to
    *alloc_size* bytes, so writing up to that many bytes will not reallocate
    the buffer (avoiding an out-of-memory situation or memory fragmentation);
    it is a MicroPython extension recommended only for special cases and
    system-level libraries, not end-user applications. Instances also support
    the context-manager protocol (usable in a ``with`` statement).

    .. admonition:: Difference to CPython
        :class: attention

        The ``BytesIO(alloc_size)`` constructor is a MicroPython extension.

    .. method:: read(size: int = -1) -> bytes

        Read and return up to *size* bytes. If *size* is omitted or negative,
        read and return all remaining contents.

    .. method:: readline(size: int = -1) -> bytes

        Read and return one line. If *size* is given, at most *size* bytes
        are read.

    .. method:: readinto(buf: bytearray) -> int

        Read into the pre-allocated, writable buffer *buf* and return the
        number of bytes read.

    .. method:: write(b: bytes) -> int

        Write the bytes-like object *b* and return the number of bytes
        written.

    .. method:: seek(offset: int, whence: int = 0) -> int

        Change the stream position to *offset* relative to *whence*
        (``0`` = start, ``1`` = current, ``2`` = end) and return the new
        absolute position.

    .. method:: tell() -> int

        Return the current stream position.

    .. method:: flush() -> None

        Flush the write buffers. This is a no-op for an in-memory stream.

    .. method:: close() -> None

        Close the stream and free the underlying buffer. Further operations
        on a closed stream raise :exc:`ValueError`.

    .. method:: getvalue() -> bytes

        Return the current contents of the underlying buffer.
