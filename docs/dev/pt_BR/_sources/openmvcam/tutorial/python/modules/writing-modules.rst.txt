Writing modules
===============

Any ``.py`` file is a module. Splitting a growing script across a
few files keeps each file short and lets common helpers be shared
between scripts.

Splitting a script
------------------

Pull a related group of functions out into their own file:

``camera_utils.py``::

    def banner():
        print("OpenMV")

    def label(text):
        return "[" + text + "]"

``main.py``::

    import camera_utils

    camera_utils.banner()
    print(camera_utils.label("ready"))

Output::

    OpenMV
    [ready]

The two files sit side by side in the same directory. When
``main.py`` runs, ``import camera_utils`` reads
``camera_utils.py`` once, executes its top-level statements, and
binds the resulting module object to the name ``camera_utils`` in
``main``. A second ``import camera_utils`` from anywhere else
returns the same object -- modules are cached after their first
load.

A module's name comes from its filename, so ``camera_utils.py``
gets imported as ``import camera_utils``.

Multi-file modules (packages)
-----------------------------

A module can also be a *directory* of files rather than a single
``.py``. The directory's name becomes the module name, and the
files inside are its *submodules*:

::

    camera_utils/
        __init__.py
        text.py
        timing.py

``__init__.py`` is the file that runs when the package itself is
imported; it can be empty, or it can re-export selected names
from the submodules. The submodules are reached with a dotted
name:

::

    import camera_utils.text
    from camera_utils.timing import elapsed

    camera_utils.text.label("ready")

Inside the package, submodules can reach each other either by
the full dotted name or by a *relative import* that uses a
leading dot to mean "this package":

``camera_utils/timing.py``::

    from . import text             # the sibling submodule

    def stamp(value):
        return text.label(str(value))

To pull in a specific name instead, name it after the dotted
sibling:

::

    from .text import label

    def stamp(value):
        return label(str(value))

Relative imports keep a package self-contained: renaming the
package directory does not require editing every submodule.

Use a package when a single file grows past a comfortable size,
or when a set of related modules belongs together under one
namespace. For everyday scripts a single ``.py`` file is enough.

The __name__ guard
------------------

Every module has a built-in name ``__name__``. Its value depends
on how the file is being used:

* When the file is *run directly*, ``__name__`` is set to the
  string ``"__main__"``.
* When the file is *imported* by another script, ``__name__`` is
  set to the module name -- the filename without ``.py``.

The idiom that uses this is:

``label_util.py``::

    def label(text):
        return "[" + text + "]"

    if __name__ == "__main__":
        print(label("self-test"))

Output (when run directly)::

    [self-test]

When the same file is *imported* instead, ``__name__`` is set to
the module name, so the ``if`` block is skipped and nothing extra
runs:

::

    >>> import label_util
    >>> label_util.__name__
    'label_util'

Use the pattern to attach a quick smoke test or demo to a library
file without disturbing scripts that import it.
