Your first script
=================

A Python *script* is a sequence of instructions saved in a text
file with a ``.py`` extension. The OpenMV Cam runs whatever script
is currently open in the IDE when you press the green **Run**
button, and prints any output in the IDE's serial terminal along
the bottom of the window.

The simplest possible script is one line:

::

    print("Hello, OpenMV!")

Pressing **Run** sends this script to the camera, which executes
it and prints the message back in the IDE.

What ``print`` does
-------------------

:func:`print` is a built-in function -- a piece of code that lives
inside the firmware and is always available without any setup.
Hand it one or more values inside parentheses and it prints a text
representation of those values in the IDE.

You can hand :func:`print` anything, not just text:

::

    print(42)
    print(3.14)
    print("temperature", 25)

Multiple arguments are separated by spaces in the output:

::

    >>> temperature 25

Comments
--------

A ``#`` starts a *comment* -- the rest of the line is ignored by
Python. Use comments to explain *why* the code does what it does;
the code itself already shows *what* it does.

::

    # Send a startup banner over the serial terminal.
    print("camera ready")

    print("running")  # Marker for the operator monitoring the IDE.

There is no separate syntax for multi-line comments in Python.
Comment several lines individually, or select the lines in the IDE
and press ``Ctrl+/`` to toggle them on and off.

Indentation matters
-------------------

Python uses indentation -- the whitespace at the start of a line --
to group related lines together. Inside a function, an
``if`` statement, or a loop, every line that belongs to the block
is indented by the **same amount** (four spaces is the convention).
Mixing tabs and spaces or changing the indent width inside a block
is a syntax error.

Top-level statements like the ``print`` calls above sit at indent
zero. Indented blocks appear once you start writing branches and
loops.

.. tip::

   The IDE auto-indents for you as soon as you finish a
   line ending in ``:``. If you ever get a mysterious
   ``IndentationError``, select the offending block and press
   ``Tab`` / ``Shift+Tab`` to re-align it.

Running the script again
------------------------

Every time you press **Run**, the camera stops whatever it was
doing, loads the current script, and starts from the top. There is
no separate compile step. Change a line, press **Run** again, and
the new output appears in the terminal.

To make a script run automatically every time the camera powers
on, save it as ``main.py`` on the camera's filesystem.
