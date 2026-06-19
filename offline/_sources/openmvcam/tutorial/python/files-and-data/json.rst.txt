JSON
====

JSON (JavaScript Object Notation) is a compact, human-readable
text format for structured data. It defines six types --
*string*, *number*, *boolean*, *null*, *array*, and *object* --
each of which maps directly onto a Python value, so converting
between Python and JSON is a single function call in either
direction.

JSON is the lingua franca of config files and web APIs. Reach
for it whenever you need to save a small bundle of settings to
disk in a form you can also read by eye, or to exchange
structured data with another program.

Two functions cover most needs:

* :func:`json.dumps` -- *dump string*: turn a Python value into
  a JSON string.
* :func:`json.loads` -- *load string*: parse a JSON string back
  into Python.

The pair ``json.dump`` / ``json.load`` (no ``s``) does the same
job but takes a file object directly.

Encoding (dumps)
----------------

::

    import json

    config = {
        "name":  "OpenMV",
        "width": 320,
        "tags":  ["red", "round"],
    }

    text = json.dumps(config)
    print(text)

Output::

    {"name": "OpenMV", "width": 320, "tags": ["red", "round"]}

The mapping is:

* :class:`dict` (string keys) → JSON object.
* :class:`list` and :class:`tuple` → JSON array.
* :class:`str` → JSON string.
* :class:`int`, :class:`float` → JSON number.
* :data:`True`, :data:`False`, :data:`None` → ``true``,
  ``false``, ``null``.

Anything outside that set (a custom class, a :class:`bytes`
buffer, a :class:`set`) raises :exc:`TypeError`. Convert the
value first.

.. note::

   CPython's :func:`json.dumps` accepts an ``indent`` argument
   for pretty-printed output; MicroPython's does not. The only
   formatting knob is ``separators``, which controls the
   in-line spacing -- pass ``(',', ':')`` for the most compact
   form. Multi-line, indented output has to be produced by hand
   if needed.

Decoding (loads)
----------------

::

    text = '{"name": "OpenMV", "width": 320}'
    config = json.loads(text)
    print(config["name"], config["width"])

Output::

    OpenMV 320

JSON objects become :class:`dict`, arrays become :class:`list`,
and the rest map back to their Python equivalents. Bad JSON
raises :exc:`ValueError`.

Reading and writing files
-------------------------

The file-based pair plays nicely with ``with``:

::

    import json

    with open("config.json") as f:
        config = json.load(f)

    config["width"] = 640

    with open("config.json", "w") as f:
        json.dump(config, f)

Treat the JSON file as a complete record -- read it in, modify
the Python value, write it back. Trying to edit JSON in place
inside a file usually creates more bugs than it saves.
