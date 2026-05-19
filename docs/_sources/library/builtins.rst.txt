:mod:`builtins` --- builtin functions and exceptions
====================================================

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
    the same rules as :class:`bytes`: from an integer (creating a zero-filled
    buffer of that size), an iterable of ints, a string with ``encoding``,
    or any buffer-protocol object.  Supports the standard sequence operations
    plus in-place modification.

    .. classmethod:: fromhex(string: str) -> bytearray

       Construct a :class:`bytearray` from a string of hexadecimal digit
       pairs. Whitespace between digit pairs is skipped; a non-hex character
       raises :exc:`ValueError`.

    .. method:: append(val: int) -> None

       Append a single value (an integer in the range 0-255) to the end of
       the bytearray, growing it by one byte.

    .. method:: center(width: int, fillbyte: bytes) -> bytes

       Return a copy of the contents centered in a sequence of length *width*,
       padded with *fillbyte*. Unlike CPython, *fillbyte* is required. The
       data is returned unchanged when *width* is not greater than the current
       length.

    .. method:: count(sub: bytes, start: int = 0, end: int = -1) -> int

       Return the number of non-overlapping occurrences of *sub* in the slice
       ``[start:end]``.

    .. method:: endswith(suffix: bytes, start: int = 0, end: int = -1) -> bool

       Return ``True`` if the contents end with *suffix*. Unlike CPython,
       *suffix* cannot be a tuple of values.

    .. method:: extend(iterable: Iterable[int]) -> None

       Append all items from *iterable* to the end of the bytearray. As an
       extension to CPython, any object supporting the buffer protocol may be
       used.

    .. method:: find(sub: bytes, start: int = 0, end: int = -1) -> int

       Return the lowest index where *sub* is found within the slice
       ``[start:end]``, or ``-1`` if not found.

    .. method:: format(*args: Any, **kwargs: Any) -> str

       Perform a string formatting operation using the contents as the format
       string, returning the formatted result.

    .. method:: hex(sep: str = "") -> str

       Return a string of two hexadecimal digits for each byte. If the
       optional *sep* (a length-1 string) is given, it is inserted between
       consecutive byte values.

    .. method:: index(sub: bytes, start: int = 0, end: int = -1) -> int

       Like :meth:`find`, but raise :exc:`ValueError` when *sub* is not found.

    .. method:: isalpha() -> bool

       Return ``True`` if all bytes are alphabetic ASCII characters and there
       is at least one byte, otherwise ``False``.

    .. method:: isdigit() -> bool

       Return ``True`` if all bytes are ASCII decimal digits and there is at
       least one byte, otherwise ``False``.

    .. method:: islower() -> bool

       Return ``True`` if all cased bytes are lowercase and there is at least
       one cased byte, otherwise ``False``.

    .. method:: isspace() -> bool

       Return ``True`` if all bytes are ASCII whitespace and there is at least
       one byte, otherwise ``False``.

    .. method:: isupper() -> bool

       Return ``True`` if all cased bytes are uppercase and there is at least
       one cased byte, otherwise ``False``.

    .. method:: join(iterable: Iterable[bytes]) -> bytes

       Return a bytes object which is the concatenation of the items in
       *iterable*, using the bytearray contents as the separator.

    .. method:: lower() -> bytes

       Return a copy of the contents with all ASCII uppercase characters
       converted to lowercase.

    .. method:: lstrip(chars: Optional[bytes] = None) -> bytes

       Return a copy with leading bytes removed. *chars* specifies the set of
       bytes to remove; if omitted or ``None``, ASCII whitespace is removed.

    .. method:: partition(sep: bytes) -> tuple

       Split at the first occurrence of *sep*, returning ``(head, sep, tail)``.
       If *sep* is not found, return the contents followed by two empty
       objects.

    .. method:: replace(old: bytes, new: bytes, count: int = -1) -> bytes

       Return a copy with all occurrences of *old* replaced by *new*. If
       *count* is given, only the first *count* occurrences are replaced.

    .. method:: rfind(sub: bytes, start: int = 0, end: int = -1) -> int

       Return the highest index where *sub* is found within the slice
       ``[start:end]``, or ``-1`` if not found.

    .. method:: rindex(sub: bytes, start: int = 0, end: int = -1) -> int

       Like :meth:`rfind`, but raise :exc:`ValueError` when *sub* is not found.

    .. method:: rpartition(sep: bytes) -> tuple

       Split at the last occurrence of *sep*, returning ``(head, sep, tail)``.
       If *sep* is not found, return two empty objects followed by the
       contents.

    .. method:: rsplit(sep: Optional[bytes] = None, maxsplit: int = -1) -> list

       Split at occurrences of *sep* into a list of pieces, performing at most
       *maxsplit* splits counting from the right. If *sep* is ``None`` or
       omitted, split on runs of ASCII whitespace.

    .. method:: rstrip(chars: Optional[bytes] = None) -> bytes

       Return a copy with trailing bytes removed. *chars* specifies the set of
       bytes to remove; if omitted or ``None``, ASCII whitespace is removed.

    .. method:: split(sep: Optional[bytes] = None, maxsplit: int = -1) -> list

       Split at occurrences of *sep* into a list of pieces. If *sep* is
       ``None`` or omitted, split on runs of ASCII whitespace and
       leading/trailing whitespace is ignored.

    .. method:: splitlines(keepends: bool = False) -> list

       Return a list of the lines, breaking at ``\n``, ``\r`` and ``\r\n``.
       Line breaks are excluded unless *keepends* is true.

    .. method:: startswith(prefix: bytes, start: int = 0, end: int = -1) -> bool

       Return ``True`` if the contents start with *prefix*. Unlike CPython,
       *prefix* cannot be a tuple, and *end* is accepted but ignored.

    .. method:: strip(chars: Optional[bytes] = None) -> bytes

       Return a copy with leading and trailing bytes removed. *chars*
       specifies the set of bytes to remove; if omitted or ``None``, ASCII
       whitespace is removed.

    .. method:: upper() -> bytes

       Return a copy of the contents with all ASCII lowercase characters
       converted to uppercase.

.. class:: bytes(source: Union[int, str, Iterable[int]] = b"", encoding: str = "utf-8", errors: str = "strict")

    Immutable sequence of integers in the range 0-255.  Created from an
    integer (zero-filled buffer), an iterable of ints, a string with
    ``encoding``, or any buffer-protocol object.  Bytes literals use the
    ``b'...'`` syntax.

    .. classmethod:: fromhex(string: str) -> bytes

       Construct a :class:`bytes` object from a string of hexadecimal digit
       pairs. Whitespace between digit pairs is skipped; a non-hex character
       raises :exc:`ValueError`.

    .. method:: center(width: int, fillbyte: bytes) -> bytes

       Return a copy centered in a sequence of length *width*, padded with
       *fillbyte* (a length-1 bytes giving the pad byte). Unlike CPython,
       *fillbyte* is required. The original object is returned unchanged when
       *width* is not greater than its length.

    .. method:: count(sub: bytes, start: int = 0, end: int = -1) -> int

       Return the number of non-overlapping occurrences of *sub* in the slice
       ``[start:end]``.

    .. method:: decode(encoding: str = "utf-8") -> str

       Return a :class:`str` decoded from the bytes. In MicroPython the
       *encoding* argument is accepted but effectively ignored (the bytes are
       reinterpreted as UTF-8).

    .. method:: endswith(suffix: bytes, start: int = 0, end: int = -1) -> bool

       Return ``True`` if the bytes end with *suffix*. Unlike CPython,
       *suffix* cannot be a tuple of values to try.

    .. method:: find(sub: bytes, start: int = 0, end: int = -1) -> int

       Return the lowest index where subsequence *sub* is found within the
       slice ``[start:end]``, or ``-1`` if not found.

    .. method:: format(*args: Any, **kwargs: Any) -> str

       Perform a string formatting operation using the bytes as the format
       string, returning the formatted result.

    .. method:: hex(sep: str = "") -> str

       Return a string of two hexadecimal digits for each byte. If the
       optional *sep* (a length-1 string) is given, it is inserted between
       consecutive byte values.

    .. method:: index(sub: bytes, start: int = 0, end: int = -1) -> int

       Like :meth:`find`, but raise :exc:`ValueError` when *sub* is not found.

    .. method:: isalpha() -> bool

       Return ``True`` if all bytes are alphabetic ASCII characters and there
       is at least one byte, otherwise ``False``.

    .. method:: isdigit() -> bool

       Return ``True`` if all bytes are ASCII decimal digits and there is at
       least one byte, otherwise ``False``.

    .. method:: islower() -> bool

       Return ``True`` if all cased bytes are lowercase and there is at least
       one cased byte, otherwise ``False``.

    .. method:: isspace() -> bool

       Return ``True`` if all bytes are ASCII whitespace and there is at least
       one byte, otherwise ``False``.

    .. method:: isupper() -> bool

       Return ``True`` if all cased bytes are uppercase and there is at least
       one cased byte, otherwise ``False``.

    .. method:: join(iterable: Iterable[bytes]) -> bytes

       Return a bytes object which is the concatenation of the items in
       *iterable*, using the bytes object itself as the separator.

    .. method:: lower() -> bytes

       Return a copy with all ASCII uppercase characters converted to
       lowercase.

    .. method:: lstrip(chars: Optional[bytes] = None) -> bytes

       Return a copy with leading bytes removed. *chars* specifies the set of
       bytes to remove; if omitted or ``None``, ASCII whitespace is removed.

    .. method:: partition(sep: bytes) -> tuple

       Split at the first occurrence of *sep*, returning ``(head, sep, tail)``.
       If *sep* is not found, return the bytes followed by two empty bytes
       objects.

    .. method:: replace(old: bytes, new: bytes, count: int = -1) -> bytes

       Return a copy with all occurrences of *old* replaced by *new*. If
       *count* is given, only the first *count* occurrences are replaced.

    .. method:: rfind(sub: bytes, start: int = 0, end: int = -1) -> int

       Return the highest index where *sub* is found within the slice
       ``[start:end]``, or ``-1`` if not found.

    .. method:: rindex(sub: bytes, start: int = 0, end: int = -1) -> int

       Like :meth:`rfind`, but raise :exc:`ValueError` when *sub* is not found.

    .. method:: rpartition(sep: bytes) -> tuple

       Split at the last occurrence of *sep*, returning ``(head, sep, tail)``.
       If *sep* is not found, return two empty bytes objects followed by the
       bytes.

    .. method:: rsplit(sep: Optional[bytes] = None, maxsplit: int = -1) -> list

       Split at occurrences of *sep* into a list of pieces, performing at most
       *maxsplit* splits counting from the right. If *sep* is ``None`` or
       omitted, split on runs of ASCII whitespace.

    .. method:: rstrip(chars: Optional[bytes] = None) -> bytes

       Return a copy with trailing bytes removed. *chars* specifies the set of
       bytes to remove; if omitted or ``None``, ASCII whitespace is removed.

    .. method:: split(sep: Optional[bytes] = None, maxsplit: int = -1) -> list

       Split at occurrences of *sep* into a list of pieces. If *sep* is
       ``None`` or omitted, split on runs of ASCII whitespace and
       leading/trailing whitespace is ignored.

    .. method:: splitlines(keepends: bool = False) -> list

       Return a list of the lines, breaking at ``\n``, ``\r`` and ``\r\n``.
       Line breaks are excluded unless *keepends* is true.

    .. method:: startswith(prefix: bytes, start: int = 0, end: int = -1) -> bool

       Return ``True`` if the bytes start with *prefix*. Unlike CPython,
       *prefix* cannot be a tuple, and *end* is accepted but ignored.

    .. method:: strip(chars: Optional[bytes] = None) -> bytes

       Return a copy with leading and trailing bytes removed. *chars*
       specifies the set of bytes to remove; if omitted or ``None``, ASCII
       whitespace is removed.

    .. method:: upper() -> bytes

       Return a copy with all ASCII lowercase characters converted to
       uppercase.

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

   .. classmethod:: fromkeys(iterable: Iterable[Any], value: Any = None) -> dict

      Create a new dictionary with keys taken from *iterable*, each mapped to
      *value* (defaulting to ``None``). Called on the type, e.g.
      ``dict.fromkeys(...)``.

   .. method:: clear() -> None

      Remove all items from the dictionary, leaving it empty. Raises
      :exc:`TypeError` if the dictionary is fixed (read-only).

   .. method:: copy() -> dict

      Return a shallow copy of the dictionary. The returned object has the
      same type as the original (``dict`` or ``OrderedDict``) but is not
      fixed.

   .. method:: get(key: Any, default: Any = None) -> Any

      Return the value for *key* if it is in the dictionary, otherwise return
      *default* (which itself defaults to ``None``, so this never raises
      :exc:`KeyError`). The dictionary is not modified.

   .. method:: items() -> Any

      Return a dynamic view object over the ``(key, value)`` pairs that
      reflects subsequent changes to the dictionary and supports iteration,
      :func:`len`, the ``in`` operator and set-comparison operators.

   .. method:: keys() -> Any

      Return a dynamic view object over the keys that reflects subsequent
      changes to the dictionary and supports iteration, :func:`len`, the
      ``in`` operator and set-comparison operators.

   .. method:: pop(key: Any, default: Any = None) -> Any

      Remove *key* from the dictionary and return its value. If *key* is not
      present, return *default* if it was supplied; otherwise raise
      :exc:`KeyError`. Raises :exc:`TypeError` if the dictionary is fixed.

   .. method:: popitem() -> tuple

      Remove and return an arbitrary ``(key, value)`` pair as a 2-tuple. For a
      plain ``dict`` the chosen pair is unspecified; for an ``OrderedDict``
      the last inserted pair is removed (LIFO). Raises :exc:`KeyError` if the
      dictionary is empty, or :exc:`TypeError` if it is fixed.

   .. method:: setdefault(key: Any, default: Any = None) -> Any

      If *key* is in the dictionary, return its value. Otherwise insert *key*
      with a value of *default* (defaulting to ``None``) and return that
      value. Raises :exc:`TypeError` if the dictionary is fixed.

   .. method:: update(*args: Any, **kwargs: Any) -> None

      Update the dictionary in place. At most one positional argument is
      accepted: either another dictionary, or an iterable of two-element
      ``(key, value)`` pairs (each must yield exactly two items or
      :exc:`ValueError` is raised). Keyword arguments are then added as
      string-keyed entries. Existing keys are overwritten. Raises
      :exc:`TypeError` if the dictionary is fixed.

   .. method:: values() -> Any

      Return a dynamic view object over the values that reflects subsequent
      changes to the dictionary and supports iteration and :func:`len`.

   .. method:: __getitem__(key: Any) -> Any

      Return ``self[key]``. Implements the indexing operator ``d[key]``;
      raises :exc:`KeyError` if *key* is not present.

   .. method:: __setitem__(key: Any, value: Any) -> None

      Set ``self[key]`` to *value*. Implements ``d[key] = value``.

   .. method:: __delitem__(key: Any) -> None

      Delete ``self[key]``. Implements ``del d[key]``; raises :exc:`KeyError`
      if *key* is not present.

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

   .. method:: copy() -> frozenset

      Return a shallow copy of the frozenset.

   .. method:: difference(*others: Iterable[Any]) -> frozenset

      Return a new frozenset with elements from the frozenset that are not in
      any of *others*. Each argument may be any iterable.

   .. method:: intersection(other: Iterable[Any]) -> frozenset

      Return a new frozenset with elements common to the frozenset and
      *other*. In MicroPython only a single *other* argument is accepted
      (CPython accepts multiple).

   .. method:: isdisjoint(other: Iterable[Any]) -> bool

      Return ``True`` if the frozenset has no elements in common with *other*.

   .. method:: issubset(other: Iterable[Any]) -> bool

      Return ``True`` if every element of the frozenset is in *other*.

   .. method:: issuperset(other: Iterable[Any]) -> bool

      Return ``True`` if every element of *other* is in the frozenset.

   .. method:: symmetric_difference(other: Iterable[Any]) -> frozenset

      Return a new frozenset with elements in either the frozenset or *other*
      but not both. In MicroPython only a single *other* argument is accepted.

   .. method:: union(other: Iterable[Any]) -> frozenset

      Return a new frozenset with elements from the frozenset and *other*. In
      MicroPython only a single *other* argument is accepted (CPython accepts
      multiple).

.. function:: getattr(obj: Any, name: str, default: Any = None) -> Any

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

.. function:: iter(obj: Any, sentinel: Any = None) -> Iterator[Any]

   Return an iterator object. With one argument, *obj* must support the
   iteration protocol. With two arguments, *obj* must be callable and iteration
   stops when it returns *sentinel*.

.. function:: len(obj: Any) -> int

   Return the number of items in a container.

.. class:: list(iterable: Iterable[Any] = ())

   Build a new list, optionally populated from items in *iterable*.

   .. method:: append(object: Any) -> None

      Append *object* to the end of the list.

   .. method:: clear() -> None

      Remove all items from the list, leaving it empty.

   .. method:: copy() -> list

      Return a shallow copy of the list.

   .. method:: count(value: Any) -> int

      Return the number of elements in the list that are equal to *value*.

   .. method:: extend(iterable: Iterable[Any]) -> None

      Append all items from *iterable* to the end of the list. If *iterable*
      is itself a list its items are copied directly; otherwise it is
      iterated over.

   .. method:: index(value: Any, start: int = 0, stop: int = -1) -> int

      Return the index of the first element equal to *value*, searching the
      slice ``[start:stop]``. Raises :exc:`ValueError` if *value* is not
      present.

   .. method:: insert(index: int, object: Any) -> None

      Insert *object* before position *index*. A negative *index* is
      interpreted relative to the end of the list, and the index is clamped to
      the valid range (so values past either end insert at the start or end).

   .. method:: pop(index: int = -1) -> Any

      Remove and return the item at *index* (the last item by default). Raises
      :exc:`IndexError` if the list is empty or *index* is out of range.

   .. method:: remove(value: Any) -> None

      Remove the first element equal to *value*. Raises :exc:`ValueError` if
      *value* is not present.

   .. method:: reverse() -> None

      Reverse the items of the list in place.

   .. method:: sort(*, key: Optional[Callable[[Any], Any]] = None, reverse: bool = False) -> None

      Sort the items of the list in place. *key* and *reverse* are
      keyword-only. *key*, if given, is a function applied to each element to
      produce the comparison value; *reverse* sorts in descending order.

      .. note:: Unlike CPython, the MicroPython list sort is **not** stable.

.. function:: locals() -> dict

   Return a dictionary representing the current local symbol table.

.. function:: map(function: Callable[..., Any], *iterables: Iterable[Any]) -> Iterator[Any]

   Return an iterator that applies *function* to every item of *iterables*,
   yielding the results.

.. function:: max(*args: Any, key: Optional[Callable[[Any], Any]] = None, default: Any = None) -> Any

   With a single iterable argument, return its largest item. With two or more
   arguments, return the largest argument.

.. class:: memoryview(obj: Any)

    Create a memoryview that references *obj*, which must support the buffer
    protocol (e.g. :class:`bytes`, :class:`bytearray`, :class:`array.array`).  Allows zero-copy
    access and slicing of the underlying memory; slicing a memoryview returns
    another memoryview rather than a copy.

.. function:: min(*args: Any, key: Optional[Callable[[Any], Any]] = None, default: Any = None) -> Any

   With a single iterable argument, return its smallest item. With two or more
   arguments, return the smallest argument.

.. function:: next(iterator: Iterator[Any], default: Any = None) -> Any

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

   .. method:: add(elem: Any) -> None

      Add element *elem* to the set.

   .. method:: clear() -> None

      Remove all elements from the set.

   .. method:: copy() -> set

      Return a shallow copy of the set.

   .. method:: difference(*others: Iterable[Any]) -> set

      Return a new set with elements from the set that are not in any of
      *others*. Each argument may be any iterable.

   .. method:: difference_update(*others: Iterable[Any]) -> None

      Remove from the set all elements found in any of *others* (in place).

   .. method:: discard(elem: Any) -> None

      Remove element *elem* from the set if it is present. Unlike
      :meth:`remove`, this does not raise an error if *elem* is absent.

   .. method:: intersection(other: Iterable[Any]) -> set

      Return a new set with elements common to the set and *other*. In
      MicroPython only a single *other* argument is accepted (CPython accepts
      multiple).

   .. method:: intersection_update(other: Iterable[Any]) -> None

      Update the set, keeping only elements also found in *other* (in place).
      In MicroPython only a single *other* argument is accepted.

   .. method:: isdisjoint(other: Iterable[Any]) -> bool

      Return ``True`` if the set has no elements in common with *other*.

   .. method:: issubset(other: Iterable[Any]) -> bool

      Return ``True`` if every element of the set is in *other*.

   .. method:: issuperset(other: Iterable[Any]) -> bool

      Return ``True`` if every element of *other* is in the set.

   .. method:: pop() -> Any

      Remove and return an arbitrary element from the set. Raises
      :exc:`KeyError` if the set is empty.

   .. method:: remove(elem: Any) -> None

      Remove element *elem* from the set. Raises :exc:`KeyError` if *elem* is
      not contained in the set.

   .. method:: symmetric_difference(other: Iterable[Any]) -> set

      Return a new set with elements in either the set or *other* but not
      both. In MicroPython only a single *other* argument is accepted.

   .. method:: symmetric_difference_update(other: Iterable[Any]) -> None

      Update the set, keeping only elements found in either the set or *other*
      but not both (in place). In MicroPython only a single *other* argument
      is accepted.

   .. method:: union(other: Iterable[Any]) -> set

      Return a new set with elements from the set and *other*. In MicroPython
      only a single *other* argument is accepted (CPython accepts multiple).

   .. method:: update(*others: Iterable[Any]) -> None

      Update the set, adding elements from all of *others* (in place).

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

   .. method:: center(width: int) -> str

      Return a copy of the string centered in a field of length *width*, padded
      with spaces. In MicroPython only a space is used as the fill character
      (there is no fill-character argument), and the original string is
      returned unchanged when *width* is not greater than its length.

   .. method:: count(sub: str, start: int = 0, end: int = -1) -> int

      Return the number of non-overlapping occurrences of *sub* in the slice
      ``[start:end]``. An empty *sub* counts each gap between characters.

   .. method:: encode(encoding: str = "utf-8", errors: str = "strict") -> bytes

      Return a :class:`bytes` object encoding the string. MicroPython
      effectively ignores the arguments and uses UTF-8; *errors* is accepted
      but not acted upon. Equivalent to ``bytes(s, "utf-8")``.

   .. method:: endswith(suffix: Union[str, tuple], start: int = 0, end: int = -1) -> bool

      Return ``True`` if the string ends with the given *suffix*, which may be
      a single string or a tuple of strings to try. Optional *start* and *end*
      restrict the comparison to the slice ``[start:end]``.

   .. method:: find(sub: str, start: int = 0, end: int = -1) -> int

      Return the lowest index in the string where substring *sub* is found
      within the slice ``[start:end]``, or ``-1`` if it is not found.

   .. method:: format(*args: Any, **kwargs: Any) -> str

      Perform a string formatting operation, substituting replacement fields
      delimited by braces ``{}`` with values from *args* and *kwargs*. Supports
      the standard format-specification mini-language.

   .. method:: index(sub: str, start: int = 0, end: int = -1) -> int

      Like :meth:`find`, but raise :exc:`ValueError` when the substring *sub*
      is not found in the slice ``[start:end]``.

   .. method:: isalpha() -> bool

      Return ``True`` if all characters in the string are alphabetic and the
      string is non-empty, otherwise ``False``.

   .. method:: isdigit() -> bool

      Return ``True`` if all characters in the string are digits and the
      string is non-empty, otherwise ``False``.

   .. method:: islower() -> bool

      Return ``True`` if the string contains at least one alphabetic character
      and all such characters are lowercase, otherwise ``False``.

   .. method:: isspace() -> bool

      Return ``True`` if all characters in the string are whitespace and the
      string is non-empty, otherwise ``False``.

   .. method:: isupper() -> bool

      Return ``True`` if the string contains at least one alphabetic character
      and all such characters are uppercase, otherwise ``False``.

   .. method:: join(iterable: Iterable[str]) -> str

      Concatenate the strings in *iterable*, inserting this string as the
      separator between elements. Items must be strings, otherwise
      :exc:`TypeError` is raised.

   .. method:: lower() -> str

      Return a copy of the string with all characters converted to lowercase.

   .. method:: lstrip(chars: Optional[str] = None) -> str

      Return a copy of the string with leading characters removed. If *chars*
      is omitted or ``None``, whitespace is stripped; otherwise *chars* is
      treated as a set of characters to remove.

   .. method:: partition(sep: str) -> tuple

      Split the string at the first occurrence of *sep* and return a 3-tuple
      ``(head, sep, tail)``. If *sep* is not found, return ``(self, "", "")``.
      An empty *sep* raises :exc:`ValueError`.

   .. method:: replace(old: str, new: str, count: int = -1) -> str

      Return a copy of the string with all occurrences of substring *old*
      replaced by *new*. If *count* is given and non-negative, only the first
      *count* occurrences are replaced.

   .. method:: rfind(sub: str, start: int = 0, end: int = -1) -> int

      Return the highest index in the string where substring *sub* is found
      within the slice ``[start:end]``, or ``-1`` if it is not found.

   .. method:: rindex(sub: str, start: int = 0, end: int = -1) -> int

      Like :meth:`rfind`, but raise :exc:`ValueError` when the substring *sub*
      is not found in the slice ``[start:end]``.

   .. method:: rpartition(sep: str) -> tuple

      Split the string at the last occurrence of *sep* and return a 3-tuple
      ``(head, sep, tail)``. If *sep* is not found, return ``("", "", self)``.
      An empty *sep* raises :exc:`ValueError`.

   .. method:: rsplit(sep: Optional[str] = None, maxsplit: int = -1) -> list

      Split the string from the right into a list of substrings using *sep* as
      the delimiter, performing at most *maxsplit* splits. With no *maxsplit*
      (or a negative one) it behaves identically to :meth:`split`; in
      MicroPython ``rsplit(None, n)`` with a non-negative *n* raises
      :exc:`NotImplementedError`.

   .. method:: rstrip(chars: Optional[str] = None) -> str

      Return a copy of the string with trailing characters removed. If *chars*
      is omitted or ``None``, whitespace is stripped; otherwise *chars* is
      treated as a set of characters to remove.

   .. method:: split(sep: Optional[str] = None, maxsplit: int = -1) -> list

      Split the string into a list of substrings using *sep* as the delimiter,
      performing at most *maxsplit* splits. If *sep* is omitted or ``None``,
      split on runs of whitespace with leading whitespace ignored; otherwise
      an empty *sep* raises :exc:`ValueError`.

   .. method:: splitlines(keepends: bool = False) -> list

      Return a list of the lines in the string, breaking at ``\n``, ``\r`` and
      ``\r\n``. Line breaks are not included unless *keepends* is true.

   .. method:: startswith(prefix: Union[str, tuple], start: int = 0, end: int = -1) -> bool

      Return ``True`` if the string starts with the given *prefix*, which may
      be a single string or a tuple of strings to try. Optional *start* and
      *end* restrict the comparison to the slice ``[start:end]``.

   .. method:: strip(chars: Optional[str] = None) -> str

      Return a copy of the string with leading and trailing characters
      removed. If *chars* is omitted or ``None``, whitespace is stripped;
      otherwise *chars* is treated as a set of characters to remove.

   .. method:: upper() -> str

      Return a copy of the string with all characters converted to uppercase.

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

   .. method:: count(value: Any) -> int

      Return the number of elements in the tuple that are equal to *value*.

   .. method:: index(value: Any, start: int = 0, stop: int = -1) -> int

      Return the index of the first element equal to *value*, searching the
      slice ``[start:stop]``. Raises :exc:`ValueError` if *value* is not
      present.

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

    On the OpenMV Cam, an unhandled ``SystemExit`` currently causes a
    :ref:`soft_reset` of MicroPython.

.. exception:: TypeError

    Raised when an operation or function is applied to an object of
    inappropriate type.

.. exception:: ValueError

   Raised when a built-in operation or function receives an argument of the
   right type but an inappropriate value.

.. exception:: ZeroDivisionError

   Raised when the second argument of a division or modulo operation is zero.
