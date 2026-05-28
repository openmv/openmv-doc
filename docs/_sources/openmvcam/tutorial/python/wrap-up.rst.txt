Wrap up
=======

You have walked through the parts of Python that come up
constantly when writing scripts for the OpenMV Cam:

* **The language fundamentals** -- values and variables,
  arithmetic and comparison, strings and bytes, the four core
  collections (:class:`list`, :class:`tuple`, :class:`dict`,
  :class:`set`), conditionals and loops, defining functions
  and managing their arguments and scope, defining classes
  and using inheritance, raising and handling exceptions.
  These are the bricks every other piece of Python is built
  from.

* **The structural pieces** -- splitting code across modules
  and packages, importing what you need, reading and writing
  files with ``with``, exchanging structured data through
  :mod:`json`, and packing binary records through :mod:`struct`
  with endianness and fixed-width integer fields. These show
  up the moment a script grows past a single file or needs to
  talk to something outside itself.

* **The parts that change shape on a constrained runtime** --
  why MicroPython floats are 32-bit and how to compare them
  reliably, how the garbage collector hands out and reclaims
  blocks, why fragmentation matters on a small heap, and how
  pre-allocation keeps long-running scripts well behaved.
  Desktop habits sometimes mislead here; this material gives
  you the right mental model for code that lives on the
  device.

* **The introspection and dynamic-code tools** -- :func:`id`,
  :func:`hash`, :func:`isinstance`, :func:`issubclass`,
  :func:`callable`, :func:`globals`, :func:`locals` for
  looking *at* values and the environment;
  :func:`eval` / :func:`exec` / :func:`compile` for the rare
  cases where producing code at run time is the right answer.
  Most scripts never touch these, but knowing they exist (and
  when not to reach for them) is part of reading other
  people's Python.

* **The everyday workflow tools** -- comprehensions for
  building collections from existing ones, generators and
  the iterator protocol for processing data lazily, decorators
  and context managers for wrapping common acquire/release
  and before/after patterns, and the debugging habits
  (reading tracebacks, :func:`repr`, :func:`dir`, :func:`help`,
  the :mod:`logging` module) that turn a broken script into a
  fixed one.

Using this primer later
-----------------------

Treat the primer as reference material, not a one-pass read.
The chapters are short on purpose; coming back to refresh on
slicing or context managers or comprehensions is the intended
use. Bookmark the section you reach for most.

If something in the camera's documentation later references a
Python concept you do not recognise -- say, "this returns a
context manager" or "iterate the result" -- the corresponding
primer page is the place to start.

Where to go from here
---------------------

**Basic hardware control** builds directly on the Python you
now know. Where the primer lived in memory, hardware control
lives in the physical world -- voltages on pins, pulses on
wires, bytes clocked over buses to other chips. The toolkit
shifts to the :mod:`machine` module and a thin layer of
electronics. Everything from the primer carries forward; you
will not relearn ``def`` or ``with`` or how :class:`bytearray`
differs from :class:`bytes`.

When you hit a Python feature that feels unfamiliar in the
hardware material, this primer is where to come back to.
