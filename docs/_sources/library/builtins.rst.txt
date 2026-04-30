:mod:`builtins` -- builtin functions and exceptions
===================================================

All builtin functions and exceptions are described here. They are also
available via ``builtins`` module.

Functions and types
-------------------

.. function:: abs(x: Any) -> Any

   Return the absolute value of a number. The argument may be an integer, a
   float, or any object implementing ``__abs__()``.

.. function:: all(iterable: Iterable[Any]) -> bool

   Return ``True`` if all elements of *iterable* are truthy (or if the iterable
   is empty).

.. function:: any(iterable: Iterable[Any]) -> bool

   Return ``True`` if any element of *iterable* is truthy. Returns ``False`` if
   the iterable is empty.

.. function:: bin(x: int) -> str

   Convert an integer to a binary string prefixed with ``"0b"``. The argument
   must be a Python integer or implement ``__index__()``.

.. class:: bool(x: Any = False)

   Return a boolean value, i.e. one of ``True`` or ``False``. *x* is converted
   using the standard truth testing procedure.

.. class:: bytearray(source: Union[int, str, Iterable[int], bytes] = b"", encoding: str = "utf-8", errors: str = "strict")

    Mutable sequence of integers in the range 0-255.  Construction follows
    the same rules as ``bytes``: from an integer (creating a zero-filled
    buffer of that size), an iterable of ints, a string with ``encoding``,
    or any buffer-protocol object.  Supports the standard sequence operations
    plus in-place modification.

.. class:: bytes(source: Union[int, str, Iterable[int]] = b"", encoding: str = "utf-8", errors: str = "strict")

    Immutable sequence of integers in the range 0-255.  Created from an
    integer (zero-filled buffer), an iterable of ints, a string with
    ``encoding``, or any buffer-protocol object.  Bytes literals use the
    ``b'...'`` syntax.

.. function:: callable(obj: Any) -> bool

   Return ``True`` if *obj* appears callable, ``False`` otherwise.

.. function:: chr(i: int) -> str

   Return a string of one character whose Unicode code point is the integer *i*.

.. function:: classmethod(func: Callable[..., Any]) -> classmethod

   Transform a method into a class method. Typically used as a decorator.

.. function:: compile(source: Union[str, bytes], filename: str, mode: str) -> Any

   Compile *source* into a code object that can be executed by :func:`exec` or
   :func:`eval`. *mode* is one of ``"exec"``, ``"eval"`` or ``"single"``.

.. class:: complex(real: Union[float, str] = 0, imag: float = 0)

   Create a complex number from a real and imaginary part, or from a string.

.. function:: delattr(obj, name: str) -> None

   The argument *name* should be a string, and this function deletes the named
   attribute from the object given by *obj*.

.. class:: dict(*args, **kwargs)

   Create a new dictionary. Equivalent to CPython's ``dict``.

.. function:: dir(obj: Any = None) -> list

   Without arguments, return the list of names in the current local scope. With
   an argument, return a list of valid attributes for that object.

.. function:: divmod(a: Any, b: Any) -> tuple

   Return the pair ``(a // b, a % b)`` as a tuple, for two (non-complex)
   numbers.

.. function:: enumerate(iterable: Iterable[Any], start: int = 0) -> Iterator[tuple]

   Return an enumerate object yielding ``(index, value)`` pairs from *iterable*,
   with the index starting at *start*.

.. function:: eval(expression: Union[str, bytes], globals: Optional[dict] = None, locals: Optional[dict] = None) -> Any

   Evaluate a Python expression given as a string (or compiled code object) and
   return the result.

.. function:: exec(object: Union[str, bytes], globals: Optional[dict] = None, locals: Optional[dict] = None) -> None

   Dynamically execute Python code provided as a string or compiled code object.

.. function:: filter(function: Optional[Callable[[Any], Any]], iterable: Iterable[Any]) -> Iterator[Any]

   Construct an iterator from those elements of *iterable* for which *function*
   returns true. If *function* is ``None``, the identity function is assumed.

.. class:: float(x: Union[str, bytes, int, float] = 0.0)

   Return a floating point number constructed from a number or string *x*.

.. class:: frozenset(iterable: Iterable[Any] = ())

   Return a new frozenset object, optionally with elements taken from
   *iterable*. ``frozenset`` is an immutable, hashable variant of :class:`set`.

.. function:: getattr(obj: Any, name: str, default: Any = ...) -> Any

   Return the value of the named attribute of *obj*. If the attribute does not
   exist, *default* is returned if provided, otherwise :exc:`AttributeError` is
   raised.

.. function:: globals() -> dict

   Return a dictionary representing the current module's global symbol table.

.. function:: hasattr(obj: Any, name: str) -> bool

   Return ``True`` if *obj* has an attribute with the given *name*, ``False``
   otherwise.

.. function:: hash(obj: Any) -> int

   Return the hash value of *obj* (if it has one). Hash values are integers
   used to quickly compare dictionary keys during a dictionary lookup.

.. function:: hex(x: int) -> str

   Convert an integer to a lowercase hexadecimal string prefixed with ``"0x"``.

.. function:: id(obj: Any) -> int

   Return the identity of an object. This is an integer which is guaranteed to
   be unique and constant for this object during its lifetime.

.. function:: input(prompt: str = "") -> str

   Read a line from standard input and return it as a string (without a trailing
   newline). If *prompt* is given, it is written to standard output without a
   trailing newline first.

.. class:: int(x: Union[str, bytes, int, float] = 0, base: int = 10)

   .. classmethod:: from_bytes(bytes: bytes, byteorder: str) -> int

      In MicroPython, `byteorder` parameter must be positional (this is
      compatible with CPython).

   .. method:: to_bytes(size: int, byteorder: str) -> bytes

      In MicroPython, `byteorder` parameter must be positional (this is
      compatible with CPython).

      .. note:: The optional ``signed`` kwarg from CPython is not supported.
                MicroPython currently converts negative integers as signed,
                and positive as unsigned. (:ref:`Details <cpydiff_types_int_to_bytes>`.)

.. function:: isinstance(obj: Any, classinfo: Union[type, tuple]) -> bool

   Return ``True`` if *obj* is an instance of *classinfo* or any of its
   subclasses. *classinfo* may be a class or a tuple of classes.

.. function:: issubclass(cls: type, classinfo: Union[type, tuple]) -> bool

   Return ``True`` if *cls* is a subclass (direct, indirect, or virtual) of
   *classinfo*.

.. function:: iter(obj: Any, sentinel: Any = ...) -> Iterator[Any]

   Return an iterator object. With one argument, *obj* must support the
   iteration protocol. With two arguments, *obj* must be callable and iteration
   stops when it returns *sentinel*.

.. function:: len(obj: Any) -> int

   Return the number of items in a container.

.. class:: list(iterable: Iterable[Any] = ())

   Build a new list, optionally populated from items in *iterable*.

.. function:: locals() -> dict

   Return a dictionary representing the current local symbol table.

.. function:: map(function: Callable[..., Any], *iterables: Iterable[Any]) -> Iterator[Any]

   Return an iterator that applies *function* to every item of *iterables*,
   yielding the results.

.. function:: max(*args: Any, key: Optional[Callable[[Any], Any]] = None, default: Any = ...) -> Any

   With a single iterable argument, return its largest item. With two or more
   arguments, return the largest argument.

.. class:: memoryview(obj: Any)

    Create a memoryview that references *obj*, which must support the buffer
    protocol (e.g. ``bytes``, ``bytearray``, ``array.array``).  Allows zero-copy
    access and slicing of the underlying memory; slicing a memoryview returns
    another memoryview rather than a copy.

.. function:: min(*args: Any, key: Optional[Callable[[Any], Any]] = None, default: Any = ...) -> Any

   With a single iterable argument, return its smallest item. With two or more
   arguments, return the smallest argument.

.. function:: next(iterator: Iterator[Any], default: Any = ...) -> Any

   Retrieve the next item from *iterator*. If *default* is given and the
   iterator is exhausted, *default* is returned instead of raising
   :exc:`StopIteration`.

.. class:: object()

   Return a new featureless object. ``object`` is the base class for all
   classes.

.. function:: oct(x: int) -> str

   Convert an integer to an octal string prefixed with ``"0o"``.

.. function:: open(file: str, mode: str = "r", **kwargs) -> Any

   Open *file* and return a corresponding file object. *mode* defaults to
   ``"r"`` for text reading.

.. function:: ord(c: str) -> int

   Return the Unicode code point of a single-character string *c* as an integer.

.. function:: pow(base: Any, exp: Any, mod: Optional[Any] = None) -> Any

   Return *base* raised to the power *exp*. If *mod* is given, return
   ``base ** exp % mod`` (computed more efficiently than the explicit form).

.. function:: print(*objects: Any, sep: str = " ", end: str = "\n", file: Any = None) -> None

   Print *objects* to the text stream *file*, separated by *sep* and followed
   by *end*.

.. function:: property(fget: Optional[Callable[[Any], Any]] = None, fset: Optional[Callable[[Any, Any], None]] = None, fdel: Optional[Callable[[Any], None]] = None, doc: Optional[str] = None) -> property

   Return a property attribute. Typically used as a decorator to define managed
   attributes on a class.

.. function:: range(*args: int) -> range

   Return an immutable sequence of integers. Called as ``range(stop)``,
   ``range(start, stop)`` or ``range(start, stop, step)``.

.. function:: repr(obj: Any) -> str

   Return a string containing a printable representation of *obj*.

.. function:: reversed(seq: Any) -> Iterator[Any]

   Return a reverse iterator over the values of the given sequence.

.. function:: round(number: Any, ndigits: Optional[int] = None) -> Any

   Return *number* rounded to *ndigits* decimal places. If *ndigits* is omitted,
   return the nearest integer.

.. class:: set(iterable: Iterable[Any] = ())

   Return a new set object, optionally with elements taken from *iterable*.

.. function:: setattr(obj: Any, name: str, value: Any) -> None

   Set the named attribute on *obj* to *value*. The counterpart of
   :func:`getattr`.

.. class:: slice()

   The *slice* builtin is the type that slice objects have.

.. function:: sorted(iterable: Iterable[Any], key: Optional[Callable[[Any], Any]] = None, reverse: bool = False) -> list

   Return a new sorted list from the items in *iterable*.

.. function:: staticmethod(func: Callable[..., Any]) -> staticmethod

   Transform a method into a static method. Typically used as a decorator.

.. class:: str(object: Any = "", encoding: str = "utf-8", errors: str = "strict")

   Return a string version of *object*. If *object* is a bytes-like object, the
   *encoding* and *errors* arguments control decoding.

.. function:: sum(iterable: Iterable[Any], start: Any = 0) -> Any

   Sum *start* and the items of *iterable* from left to right, and return the
   total.

.. function:: super(type: Optional[type] = None, obj_or_type: Optional[Any] = None) -> Any

   Return a proxy object that delegates method calls to a parent or sibling
   class of *type*. Useful for accessing inherited methods that have been
   overridden in a class.

.. class:: tuple(iterable: Iterable[Any] = ())

   Build a new tuple, optionally populated from items in *iterable*. Tuples are
   immutable sequences.

.. function:: type(obj: Any) -> type

   With one argument, return the type of *obj*. The returned value is a type
   object.

.. function:: zip(*iterables: Iterable[Any]) -> Iterator[tuple]

   Return an iterator of tuples, where the *i*-th tuple contains the *i*-th
   element from each of the argument iterables. Iteration stops when the
   shortest input iterable is exhausted.


Exceptions
----------

.. exception:: AssertionError

   Raised when an ``assert`` statement fails.

.. exception:: AttributeError

   Raised when an attribute reference or assignment fails.

.. exception:: Exception

   Common base class for all non-system-exiting exceptions.

.. exception:: ImportError

   Raised when an ``import`` statement fails to find the module definition.

.. exception:: IndexError

   Raised when a sequence subscript is out of range.

.. exception:: KeyboardInterrupt

   Raised when the user interrupts program execution, usually by pressing
   ``Ctrl+C`` on the REPL.

   See also in the context of :ref:`soft_bricking`.

.. exception:: KeyError

   Raised when a mapping (dictionary) key is not found in the set of existing
   keys.

.. exception:: MemoryError

   Raised when an operation runs out of memory.

.. exception:: NameError

   Raised when a local or global name is not found.

.. exception:: NotImplementedError

   Raised when an abstract method or unimplemented feature is invoked.

.. exception:: OSError

   Raised when a system function returns a system-related error.

.. exception:: RuntimeError

   Raised when an error is detected that doesn't fall in any of the other
   categories.

.. exception:: StopIteration

   Raised by :func:`next` and an iterator's ``__next__()`` method to signal
   that there are no further items.

.. exception:: SyntaxError

   Raised when the parser encounters a syntax error.

.. exception:: SystemExit

    Raised by :func:`sys.exit` to request interpreter termination.  Unlike
    most exceptions, it does not produce a traceback when uncaught.

    On non-embedded ports (i.e. Windows and Unix), an unhandled ``SystemExit``
    exits the MicroPython process in a similar way to CPython.

    On embedded ports, an unhandled ``SystemExit`` currently causes a
    :ref:`soft_reset` of MicroPython.

.. exception:: TypeError

    Raised when an operation or function is applied to an object of
    inappropriate type.

.. exception:: ValueError

   Raised when a built-in operation or function receives an argument of the
   right type but an inappropriate value.

.. exception:: ZeroDivisionError

   Raised when the second argument of a division or modulo operation is zero.
