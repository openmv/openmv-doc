:mod:`types` --- names for built-in types
=========================================

.. module:: types
   :synopsis: names for built-in types

This module defines names for some object types that are used by the standard
Python interpreter but are not exposed as builtins (such as the type of
functions or generators), together with a small number of helpers for dynamic
class construction.

This is a MicroPython port of a subset of CPython's :mod:`types` module. Several
type aliases that have no useful representation in MicroPython (``CodeType``,
``MappingProxyType``, ``SimpleNamespace``, ``TracebackType``, ``FrameType``,
``GetSetDescriptorType``, ``MemberDescriptorType``) are exposed as ``None``
placeholders so that code which only references them keeps importing, but they
will not match any real object via :func:`isinstance`.

Type aliases
------------

.. data:: FunctionType
   :type: type

   The type of user-defined functions and of objects created by
   ``def`` statements.

.. data:: LambdaType
   :type: type

   The type of ``lambda`` expressions. Identical to `FunctionType`.

.. data:: GeneratorType
   :type: type

   The type of generator-iterator objects produced by generator functions.

.. data:: MethodType
   :type: type

   The type of bound methods of user-defined class instances.

.. data:: BuiltinFunctionType
   :type: type

   The type of built-in functions such as :func:`len` and :func:`sys.exit`.

.. data:: BuiltinMethodType
   :type: type

   The type of bound methods of built-in types (for example ``[].append``).
   Identical to `BuiltinFunctionType`.

.. data:: ModuleType
   :type: type

   The type of imported modules.

.. data:: CodeType
   :type: None

   Placeholder for the CPython ``code`` object type. Always ``None`` in this
   implementation.

.. data:: MappingProxyType
   :type: None

   Placeholder for the read-only mapping proxy type returned by
   ``type.__dict__`` in CPython. Always ``None`` in this implementation.

.. data:: SimpleNamespace
   :type: None

   Placeholder for the CPython ``types.SimpleNamespace`` class. Always
   ``None`` in this implementation.

.. data:: TracebackType
   :type: None

   Placeholder for the type of traceback objects. Always ``None`` in this
   implementation.

.. data:: FrameType
   :type: None

   Placeholder for the type of frame objects. Always ``None`` in this
   implementation.

.. data:: GetSetDescriptorType
   :type: None

   Placeholder for the type of attribute descriptors defined by extension
   types. Always ``None`` in this implementation.

.. data:: MemberDescriptorType
   :type: None

   Placeholder for the type of slot descriptors defined by extension types.
   Always ``None`` in this implementation.

Functions
---------

.. function:: new_class(name: str, bases: tuple = (), kwds: dict | None = None, exec_body: Callable[[dict], None] | None = None) -> type

    Create a class object dynamically in a way that mirrors the
    :pep:`3115`-compliant ``class`` statement.

        - *name* is the name of the new class.
        - *bases* is a tuple of base classes.
        - *kwds* is a dict of keyword arguments to pass to the metaclass.
          A ``"metaclass"`` key, if present, selects the metaclass directly.
        - *exec_body* is an optional callable that will be invoked with the
          freshly prepared class namespace; it should populate it with the
          new class's attributes.

    Returns the newly constructed class.

.. function:: prepare_class(name: str, bases: tuple = (), kwds: dict | None = None) -> tuple[type, dict, dict]

    Compute the appropriate metaclass and prepare the namespace for a new
    class.

        - *name* is the name of the class about to be created.
        - *bases* is a tuple of base classes.
        - *kwds* is a dict of keyword arguments. A ``"metaclass"`` key, if
          present, is removed from the returned *kwds* and used as the
          metaclass. Otherwise the metaclass of ``bases[0]`` is used, falling
          back to :class:`type`.

    Returns a 3-tuple ``(metaclass, namespace, kwds)`` where *namespace* is the
    result of calling ``metaclass.__prepare__`` if defined, or an empty dict
    otherwise, and *kwds* is a copy of the input with any ``"metaclass"`` entry
    removed.
