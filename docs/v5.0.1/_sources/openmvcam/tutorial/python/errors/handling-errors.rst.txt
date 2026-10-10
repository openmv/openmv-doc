Handling errors
===============

Most runtime problems in Python surface as *exceptions* -- a
named, structured way to report that something went wrong.
:exc:`ValueError`, :exc:`TypeError`, :exc:`KeyError`,
:exc:`OSError`, :exc:`MemoryError` are all examples; each is a
class, and *raising* one stops the current call and looks for a
handler in the surrounding code.

try / except
------------

Wrap a block of code in ``try`` to catch any exception it
raises:

::

    try:
        n = int(input_text)
    except ValueError:
        n = 0

If the ``int(...)`` conversion fails, control jumps to the
``except`` block instead of propagating the error further. If
``input_text`` was a valid integer string, the ``except`` block
is skipped.

A single ``try`` can have several ``except`` blocks, each
catching a different kind of error:

::

    try:
        value = data[key]
    except KeyError:
        value = None
    except TypeError:
        value = -1

Python matches in order; the first one whose exception class
fits handles the problem. Catching :exc:`Exception` (the base
class for almost everything) handles *any* error; reserve that
for the outermost layer of a program where the alternative is a
crash.

.. warning::

   A bare ``except:`` (no class after the keyword) also catches
   :exc:`KeyboardInterrupt` -- the exception the IDE sends when
   you press its **stop** button to interrupt a running script.
   A loop wrapped in a bare ``except: pass`` will swallow the
   interrupt and keep running, leaving no way to stop the script
   except a power cycle.

   Prefer ``except Exception:`` over bare ``except:`` when you
   genuinely need to catch broadly. :exc:`KeyboardInterrupt`
   inherits from :exc:`BaseException`, not :exc:`Exception`, so
   ``except Exception:`` leaves the stop button working.

Inspecting the exception
~~~~~~~~~~~~~~~~~~~~~~~~

To read the message attached to an exception, name it with
``as``:

::

    try:
        f = open("data.txt")
    except OSError as e:
        print("could not open file:", e)

The variable bound by ``as`` is only valid inside the
``except`` block.

else and finally
----------------

A ``try`` block has two optional extras.

``else`` runs only when the ``try`` finished without raising:

::

    try:
        value = compute()
    except ValueError:
        print("bad input")
    else:
        print("got", value)

Putting "what to do when it worked" in ``else`` keeps the
``try`` block narrow -- only the line that might fail belongs in
``try``.

``finally`` runs at the end *no matter what* -- whether the
``try`` succeeded, raised and was handled, or raised and is about
to propagate:

::

    try:
        do_work()
    finally:
        cleanup()

.. figure:: ../figures/try-flow.svg
   :alt: Flow diagram showing the four possible paths through
         try / except / else / finally: success goes to else
         then finally; a caught exception goes to except then
         finally; an uncaught exception goes to finally then
         propagates.

   ``finally`` always runs. ``else`` runs only on the
   non-exception path.

For most acquire/release patterns, prefer a :doc:`context manager
<../classes/context-managers>` over a ``try / finally`` pair --
the resource itself manages its own cleanup.

Common built-in exceptions
--------------------------

A short list of the exceptions you will run into often:

* :exc:`ValueError` -- right type, wrong value
  (``bytes([300])`` -- 300 is the right type, but is outside the
  valid byte range of 0..255).
* :exc:`TypeError` -- wrong type altogether
  (``len(42)``).
* :exc:`KeyError` -- missing key in a :class:`dict`.
* :exc:`IndexError` -- index past the end of a sequence.
* :exc:`AttributeError` -- accessing an attribute that does not
  exist (``"abc".foo``).
* :exc:`OSError` -- a filesystem or I/O failure.
* :exc:`MemoryError` -- ran out of heap. On a memory-constrained
  runtime, this can happen during normal operation -- not just
  in pathological cases.
