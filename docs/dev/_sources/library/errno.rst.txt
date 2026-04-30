:mod:`errno` -- system error codes
==================================

.. module:: errno
   :synopsis: system error codes

This module provides access to symbolic error codes for `OSError` exception,
along with the :data:`errorcode` dictionary mapping numeric codes back to
their symbolic names.  The particular inventory of codes depends on the
:term:`MicroPython port`.

Constants
---------

.. data:: EEXIST, EAGAIN, etc.
   :type: int

    Error codes, based on ANSI C/POSIX standard. All error codes start with
    "E". As mentioned above, inventory of the codes depends on
    :term:`MicroPython port`. Errors are usually accessible as ``exc.errno``
    where ``exc`` is an instance of `OSError`. Usage example::

        try:
            os.mkdir("my_dir")
        except OSError as exc:
            if exc.errno == errno.EEXIST:
                print("Directory already exists")

.. data:: errorcode
   :type: dict[int, str]

    Dictionary mapping numeric error codes to strings with symbolic error
    code (see above)::

        >>> print(errno.errorcode[errno.EEXIST])
        EEXIST
