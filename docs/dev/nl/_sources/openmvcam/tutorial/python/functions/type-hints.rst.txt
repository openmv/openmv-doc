Type hints
==========

Python lets you *annotate* function parameters and return values
with type information. The annotations are ignored at run time --
nothing checks them, nothing converts based on them -- but they
serve as documentation for readers and for the IDE.

Annotation syntax
-----------------

A parameter annotation goes after a colon. The return type goes
after ``->`` and before the body's colon:

::

    def greet(name: str) -> None:
        print("hello,", name)

    def add(a: int, b: int) -> int:
        return a + b

    def average(values: list) -> float:
        return sum(values) / len(values)

The hints describe what *should* be passed in and what *will* be
returned. Calling ``add("hi", "there")`` does not raise -- Python
runs the body anyway. The hints are a contract, not a check.

A parameter can have both a default and an annotation:

::

    def greet(name: str, greeting: str = "hello") -> None:
        print(greeting, name)

CPython has richer notation (``Optional``, ``Union``, generics)
through the ``typing`` module, but those are heavyweight on
MicroPython and rarely needed for everyday camera code.

MicroPython at run time
-----------------------

MicroPython parses annotations and then ignores them. There is no
:mod:`typing` module to import from on the camera; trying to use
``Optional[int]`` or ``list[int]`` will either fail to import or
silently behave as plain attribute access, depending on the
firmware build.

Stick to plain type names (:class:`int`, :class:`float`,
:class:`str`, :class:`bool`, :class:`bytes`, :class:`list`,
:class:`tuple`, :class:`dict`) in annotations. They cost nothing
at run time and convey the intent clearly.

How the IDE uses them
---------------------

The IDE reads annotations to drive tooltips, autocomplete, and
inline hints. A function annotated with ``-> int`` shows ``int``
as its return type when the cursor hovers on the call. A parameter
annotated with ``: str`` autocompletes string methods on the
argument inside the function body.

This is the practical payoff of writing annotations on a runtime
that ignores them: better support from the editor with no cost at
all when the script runs on the camera.

Variable annotations
--------------------

Annotations on plain assignments work the same way:

::

    threshold: float = 0.5
    name: str = "OpenMV"

These are also ignored at run time. Their main use is making the
intended type obvious when the right-hand side does not make it
obvious -- typically when the initial value is a placeholder that
will be replaced later.
