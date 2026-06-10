The script editor
=================

The editor is a full professional text editor -- the
same Qt Creator core that ships in commercial IDEs --
trimmed to a tabbed, single-window layout so that the
script about to run is always the one in front. Most of
it needs no explanation: tabs along the top switch
between open files, and the usual file and edit
operations live in the File and Edit menus and on the
toolbar buttons along the left edge. The features below
are the ones worth knowing about specifically for
MicroPython work.

Whitespace and undo
-------------------

Indentation is syntax in Python, so the editor can
render whitespace visibly -- toggle Visualize
Whitespace under Edit → Advanced when a script fails
with an ``IndentationError`` that is invisible in the
source. Undo and redo are unlimited and tracked per
file across all open files.

Find and replace
----------------

The find and replace bar (``Ctrl+F``) supports plain
text, whole-word, and regular-expression matching, with
capture groups available in the replacement text and an
option to preserve the case of each replaced match.
*Advanced Find* (``Ctrl+Shift+F``) widens the scope
from the current file to all open files or to every
file under a folder on disk, and presents the matches
as a clickable result list.

Code completion and call tips
-----------------------------

The editor knows the camera's Python API. Typing ``.``
after a module or object name opens a completion list
of its functions, methods, and constants; once a name
is chosen, a call tip walks through the arguments.
Hovering over any API name shows its documentation in a
tooltip -- the same text as the library reference,
without leaving the editor. Completion covers the
camera-specific modules (:mod:`csi`, :mod:`image`,
:mod:`machine`, and the rest of the library reference)
in addition to the Python language itself.

A bundled Python language server checks the code as it
is typed, underlining undefined names, unused imports,
and syntax errors in the editor before the script ever
runs -- a whole class of typo crashes caught at the
desk instead of on the camera.

Threshold tuples get the same treatment in reverse:
select a grayscale or LAB threshold tuple in a script,
right-click it, and the context menu offers to open it
in the threshold editor, which writes the tuned values
back into the script when confirmed with OK.

.. admonition:: Screenshot needed

   ``figures/editor-completion.png`` -- the editor with
   a completion popup open after typing ``img.`` in a
   script, showing the method list and one entry's
   documentation tooltip. Crop to the editor pane.

GitHub Copilot
--------------

The editor ships with GitHub Copilot support for inline
AI code suggestions. It stays dormant until a GitHub
account with a Copilot subscription is signed in, under
the Copilot section of the preferences dialog; sign out
or untick its enable box to switch it off.

Beyond Python files
-------------------

The editor opens more than scripts. An image file
opens in an image viewer with zoom and fit-to-screen
controls -- handy for inspecting saved snapshots and
templates without leaving the IDE -- and a binary file
opens in a hex editor, useful for a quick look inside
a recording or a descriptor file.

Editing outside the IDE
-----------------------

Scripts are plain ``.py`` files, and nothing requires
them to be edited in the IDE. When a file open in the
editor changes on disk -- saved from another editor,
pulled from version control -- the IDE picks the
change up when its window regains focus and reloads
the file, asking first only when the copy in the
editor has unsaved changes of its own.
