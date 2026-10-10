Reading and writing
===================

Files live on disk; Python reaches them through :func:`open`,
which returns a *file object* whose methods read and write the
underlying bytes.

open and modes
--------------

The first argument is the path; the second is the *mode* -- a
short string telling Python how the file will be used:

* ``"r"`` -- read (default). Opens an existing file for reading.
* ``"w"`` -- write. Creates a new file or *truncates* an
  existing one to empty.
* ``"a"`` -- append. Opens a file for writing at its end without
  truncating.
* ``"b"`` appended to any of the above (``"rb"``, ``"wb"``,
  ``"ab"``) -- binary mode. The file's contents are :class:`bytes`
  rather than :class:`str`.

::

    f = open("notes.txt", "r")
    text = f.read()
    f.close()

Use a context manager
---------------------

The pattern above leaks the file handle if anything between
:func:`open` and ``close`` raises. The fix is the ``with``
statement (see :doc:`context managers <../classes/context-managers>`):

::

    with open("notes.txt") as f:
        text = f.read()

    # f is closed here, even if read() failed

This is the standard form -- write it this way every time.

Reading
-------

File objects support several read styles:

* :meth:`io.IOBase.read` -- read the whole file (or N bytes) and
  return it as a single string (or bytes object).
* :meth:`io.IOBase.readline` -- read one line, including the trailing
  ``"\n"``.
* Iterating the file directly yields lines one at a time, with
  much smaller memory use than reading the whole file at once.

::

    with open("log.txt") as f:
        for line in f:
            print(line.rstrip())

:meth:`str.rstrip` removes the trailing newline before printing
so the output is not double-spaced.

Writing
-------

Open the file in ``"w"`` mode and use :meth:`io.IOBase.write`:

::

    with open("out.txt", "w") as f:
        f.write("hello\n")
        f.write("world\n")

:meth:`io.IOBase.write` does *not* add a newline -- it writes exactly
the bytes (or characters, in text mode) you give it.

Text vs binary
--------------

Text mode (default, ``"r"`` / ``"w"`` without ``"b"``) decodes
incoming bytes into :class:`str` using a default encoding, and
encodes outgoing :class:`str` back to bytes. Use it for
configuration, logs, JSON -- anything that *is* text.

Binary mode (``"rb"`` / ``"wb"``) skips the decode step and
returns :class:`bytes`. Use it for images, struct-packed records,
network captures -- anything where every byte matters and the
file is not human-readable.

Listing and removing files
--------------------------

The :mod:`os` module exposes the filesystem operations that are
not on the file object itself:

* :func:`os.listdir` -- returns a list of names in a directory.
* :func:`os.remove` -- delete a file.
* :func:`os.rename` -- rename a file.
* :func:`os.stat` -- file metadata (size, modification time,
  ...).
* :func:`os.mkdir` -- create a new directory.

::

    import os

    for name in os.listdir("/"):
        print(name)

Catch :exc:`OSError` around these when the file or directory may
not be there -- the operation is one of the common places
exceptions show up in real scripts.
