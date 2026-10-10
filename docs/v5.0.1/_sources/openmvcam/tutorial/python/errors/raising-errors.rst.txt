Raising errors
==============

A function can signal a problem to its caller by *raising* an
exception. The keyword is ``raise``:

::

    def square_root(x):
        if x < 0:
            raise ValueError("square_root expects a non-negative number")
        return x ** 0.5

Calling ``square_root(-1)`` stops at the ``raise`` line, jumps
out of the function, and looks for a matching ``except`` in the
caller. If no caller catches it, the script ends with a
traceback.

Why raise instead of returning a sentinel
-----------------------------------------

Two ways to report "bad input":

::

    # signal with a sentinel
    def square_root_or_none(x):
        if x < 0:
            return None
        return x ** 0.5

    # raise an exception
    def square_root(x):
        if x < 0:
            raise ValueError("...")
        return x ** 0.5

The exception form is usually better:

* The caller has to *deliberately* handle the error case --
  either with a ``try``, or by letting the exception propagate.
  Sentinels are easy to forget and easy to mistake for a normal
  result.
* The error message travels with the exception; the sentinel
  approach has to attach the diagnostic somewhere else.
* The default behaviour on an unhandled exception is a loud
  crash with a traceback that points at the offending call.
  Silent ``None`` returns become subtle bugs later.

Reach for sentinels only when "not found" is a routine,
non-exceptional outcome -- :meth:`dict.get` returns :data:`None`
on a missing key precisely because lookups are expected to
sometimes miss.

Custom exception classes
------------------------

To raise a problem the caller might want to distinguish from
built-in errors, define a subclass of :exc:`Exception`:

::

    class ConfigError(Exception):
        pass

    def load_config(path):
        try:
            f = open(path)
        except OSError as e:
            raise ConfigError("missing config file: " + path)

    try:
        load_config("settings.json")
    except ConfigError as e:
        print("startup failed:", e)

The empty ``class`` body is fine -- the name itself is what
matters, because callers catch by class. Group related errors
under a common base if a caller might want to catch the whole
family in one block.

Re-raising
~~~~~~~~~~

A bare ``raise`` inside an ``except`` block re-raises the
current exception so it propagates to the next handler:

::

    try:
        do_work()
    except Exception as e:
        log(e)
        raise        # let it keep going

This is the right shape when a function wants to *observe* an
error (log it, count it, undo a partial change) without
actually handling it.

When to catch and when to propagate
-----------------------------------

A useful rule of thumb:

* Catch an exception at the level that can *meaningfully recover*
  -- substitute a default, retry, skip the bad input.
* Let it propagate when there is nothing useful to do except
  crash, or when the layer above is the one that knows how to
  recover.

A function in the middle of a call stack that swallows every
error and returns silently makes failures untraceable. Prefer to
let exceptions travel until they reach code that genuinely has a
plan.
