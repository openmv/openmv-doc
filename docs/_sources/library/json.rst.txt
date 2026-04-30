:mod:`json` -- JSON encoding and decoding
=========================================

.. module:: json
   :synopsis: JSON encoding and decoding

This module converts between Python objects and the JSON
data format.  Use :func:`dumps`/:func:`loads` to (de)serialise to or
from a string, or :func:`dump`/:func:`load` to read or write JSON from
a stream such as a file or socket.

Functions
---------

.. function:: dump(obj: Any, stream: Any, separators: Optional[Tuple[str, str]] = None) -> None

   Serialise *obj* to a JSON string, writing it to the given *stream*.

   If specified, separators should be an ``(item_separator, key_separator)``
   tuple. The default is ``(', ', ': ')``. To get the most compact JSON
   representation, you should specify ``(',', ':')`` to eliminate whitespace.

.. function:: dumps(obj: Any, separators: Optional[Tuple[str, str]] = None) -> str

   Return *obj* represented as a JSON string.

   The arguments have the same meaning as in `dump`.

.. function:: load(stream: Any) -> Any

   Parse the given *stream*, interpreting it as a JSON string and
   deserialising the data to a Python object.  The resulting object is
   returned.

   Parsing continues until end-of-file is encountered.
   A :exc:`ValueError` is raised if the data in *stream* is not correctly formed.

.. function:: loads(str: Union[str, bytes]) -> Any

   Parse the JSON *str* and return an object.  Raises :exc:`ValueError` if the
   string is not correctly formed.
