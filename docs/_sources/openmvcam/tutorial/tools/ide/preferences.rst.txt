Preferences and appearance
==========================

Edit → Preferences (the application menu on macOS)
opens the settings dialog. Almost everything in it can
be left alone -- the defaults are the configuration the
rest of this chapter describes -- but a few categories
are worth knowing exist.

Interface and themes
--------------------

The Environment → Interface page selects the theme. The
IDE ships dark (the default) and light themes, and the
editor's syntax colours follow the theme automatically.
The same page holds the user-interface language and
display-scaling options.

Day-to-day layout lives outside the dialog: each
bottom pane -- the serial terminal, the search results
-- has a toggle button in the status bar, the side
panes collapse by dragging their splitters shut and
reopen from the drawer arrows at the window edges, and
the Window menu's Full Screen (``Ctrl+Shift+F11``)
gives a demo or a wall-mounted monitor the whole
screen.

Text editor settings
--------------------

The Text Editor category controls the editing surface:
*Font* for typeface and size; *Display* for line
numbers, whitespace visualization, and text wrapping;
*Behavior* for indentation -- tab width, spaces versus
tabs -- and automatic whitespace cleanup. The font
size also changes on the fly with ``Ctrl++`` /
``Ctrl+-`` / ``Ctrl+0``, and the mouse wheel with
``Ctrl`` held.

Keyboard shortcuts are fixed in OpenMV IDE -- each one
is shown beside its menu entry, and the chapter quotes
the important ones where the feature comes up.

Other categories
----------------

The Python and Copilot categories configure the
:doc:`editor's <editor>` language intelligence -- the
bundled Python language server and the optional GitHub
Copilot sign-in. The remaining categories belong to the
Qt Creator core and rarely need attention.
