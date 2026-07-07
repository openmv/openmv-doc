Value controls
==============

These are the controls that hold a setting. Each one
carries a *value*, and Save writes the edited *value*
back into the control. The table below is the quick map
from control to the JSON type it stores; the sections
that follow document every key.

============== ============================================
Control        Saves
============== ============================================
checkbox       boolean, or integer ``0``/``1``/``2``
combobox       the chosen value, or its index
radio          the chosen value, or its index
spinbox        integer
doublespinbox  number (floating point)
slider         integer
lineedit       string
============== ============================================

All value controls also accept the common keys (*name*,
*label*, *tooltip*, *enabled*); see the
:doc:`overview <index>`. The *label* is shown beside the
control (on the box itself for a *checkbox*).

checkbox
--------

An on/off switch. Optionally three-state, for settings
that have an "unset" middle.

.. code-block:: json

   { "type": "checkbox", "name": "draw_overlays", "label": "Draw Overlays", "value": true }

Arguments:

* *label* (string) -- the text shown next to the box.
  Plain text only (unlike the other controls, whose
  labels take rich text).
* *tristate* (boolean, default ``false``) -- allow a
  third, partially-checked state.
* *value* -- the initial state. Two-state: a boolean.
  Tristate: ``0`` (off), ``1`` (partial), or ``2`` (on).

Saves: a **boolean** for a two-state box; an **integer**
``0``, ``1``, or ``2`` for a tristate box.

combobox
--------

A dropdown menu of choices.

.. code-block:: json

   {
     "type": "combobox",
     "name": "resolution",
     "label": "Resolution",
     "options": ["QQVGA", "QVGA", "VGA"],
     "values": ["qqvga", "qvga", "vga"],
     "value": "qvga"
   }

Arguments:

* *options* (array of strings) -- the items shown in
  the menu.
* *values* (array) -- an optional parallel array of the
  values to save, one per *option*. With *values*, the
  menu shows ``options[i]`` but saves ``values[i]`` --
  so the user sees "QVGA" while the file stores
  ``"qvga"``. The entries can be any JSON type. Without
  *values*, the control saves the selected item's
  **index** instead.
* *value* -- the initial selection. With *values*, the
  entry equal to one of the *values*. Without *values*,
  the index of the item to select (default ``0``).

Saves: the matching *values* entry (**any type**) when
*values* is given; otherwise the selected **index**
(integer).

radio
-----

A set of radio buttons -- one choice visible at a time,
like a *combobox* but laid out in full.

.. code-block:: json

   {
     "type": "radio",
     "name": "mode",
     "label": "Mode",
     "options": ["Idle", "Track", "Record"],
     "values": ["idle", "track", "record"],
     "value": "idle",
     "orientation": "horizontal"
   }

Arguments:

* *options* (array of strings) -- one button per entry.
* *values* (array) -- the optional values to save, one
  per *option*, exactly as for `combobox`_. Without it,
  the control saves the selected **index**.
* *value* -- the initial selection, matched against
  *values* or used as an index, as for `combobox`_.
* *orientation* (string, default ``"vertical"``) --
  ``"horizontal"`` to lay the buttons in a row,
  otherwise a column.

Saves: the matching *values* entry (any type), or the
selected **index**.

spinbox
-------

A number box for integers, with up/down arrows.

.. code-block:: json

   {
     "type": "spinbox",
     "name": "server_port",
     "label": "Port",
     "value": 8080,
     "min": 0,
     "max": 65535,
     "group_separator": true
   }

Arguments:

* *value* (integer, default ``0``) -- the initial
  number.
* *min* (integer, default ``0`` or *value*, whichever
  is smaller) -- the lowest allowed value.
* *max* (integer, default ``100`` or *value*, whichever
  is larger) -- the highest allowed value.
* *step* (integer, default ``1``) -- the up/down
  increment.
* *prefix* (string) -- text shown before the number,
  e.g. ``"0x"``.
* *suffix* (string) -- text shown after the number,
  e.g. a unit like ``" px"``.
* *base* (integer, default ``10``) -- the display base;
  set to ``16`` to show and edit the number in hex.
* *group_separator* (boolean, default ``false``) --
  group the digits with thousands separators.
* *special_value_text* (string) -- text to show in
  place of the number when it sits at *min*, e.g. show
  "Off" at ``0``.

Saves: an **integer**.

doublespinbox
-------------

A number box for decimals.

.. code-block:: json

   {
     "type": "doublespinbox",
     "name": "sensitivity",
     "label": "Sensitivity",
     "value": 50.0,
     "min": 0,
     "max": 100,
     "step": 0.5,
     "decimals": 1,
     "suffix": " %"
   }

Arguments:

* *value* (number, default ``0``) -- the initial
  number.
* *min* (number, default ``0`` or *value*, whichever is
  smaller) -- the lowest allowed value.
* *max* (number, default ``100`` or *value*, whichever
  is larger) -- the highest allowed value.
* *decimals* (integer, default ``2``) -- how many
  digits to show after the decimal point.
* *step* (number, default ``1.0``) -- the up/down
  increment.
* *prefix* (string) -- text shown before the number,
  e.g. ``"max "``.
* *suffix* (string) -- text shown after the number,
  e.g. a unit like ``" %"``.
* *group_separator* (boolean, default ``false``) --
  thousands separators.
* *special_value_text* (string) -- text to show when
  the number sits at *min*.

Saves: a **number** (floating point).

slider
------

A horizontal slider with a live numeric readout beside
it.

.. code-block:: json

   {
     "type": "slider",
     "name": "brightness",
     "label": "Brightness",
     "value": 50,
     "min": 0,
     "max": 100,
     "step": 1,
     "suffix": " %",
     "ticks": 25
   }

Arguments:

* *value* (integer, default ``0``) -- the initial
  position.
* *min* (integer, default ``0`` or *value*, whichever
  is smaller) -- the low end of the track.
* *max* (integer, default ``100`` or *value*, whichever
  is larger) -- the high end of the track.
* *step* (integer, default ``1``) -- the keyboard and
  drag increment; drags snap to the nearest multiple.
* *prefix* (string) -- text shown before the numeric
  readout beside the slider, e.g. ``"x"``.
* *suffix* (string) -- text shown after the readout,
  e.g. ``" %"``.
* *ticks* (integer) -- the spacing of tick marks drawn
  under the track.

Saves: an **integer**.

lineedit
--------

A single-line text field, for names, passwords,
addresses, and the like.

.. code-block:: json

   {
     "type": "lineedit",
     "name": "hostname",
     "label": "Hostname",
     "value": "openmv-cam",
     "placeholder": "letters, digits, dashes",
     "regex": "[A-Za-z0-9-]+",
     "clear_button": true
   }

Arguments:

* *value* (string, default ``""``) -- the initial text.
* *placeholder* (string) -- grey hint text shown while
  the field is empty.
* *max_length* (integer) -- the most characters the
  field will accept.
* *mask* (string) -- an input mask that fixes the
  layout of what can be typed, e.g.
  ``"000.000.000.000;_"`` for an IPv4 address. See
  `Input masks`_ below.
* *regex* (string) -- a regular expression the whole
  entry must match. See `Regular expressions`_ below.
* *clear_button* (boolean, default ``false``) -- show a
  small clear button inside the field.
* *password* (boolean, default ``false``) -- hide the
  text as dots and add an eye button to reveal it.

Saves: a **string**.

A *mask* and a *regex* both restrict what the field will
accept, from opposite angles -- a mask fixes the *layout*
of the text, a regex constrains its *content*. A field
with either one is the only control that can block a
Save: if its text is incomplete or does not match, the
editor lists the field by its *label* and refuses to
save until it is fixed or cleared. Use at most one of the
two on a field.

Input masks
~~~~~~~~~~~

A *mask* fixes the field character by character:
separators are drawn in for the user, who only fills the
blanks. Each mask character stands for one input
position:

* ``9`` -- a required digit; ``0`` -- an optional digit.
* ``A`` / ``a`` -- a required / optional letter.
* ``N`` / ``n`` -- a required / optional letter or digit.
* ``X`` / ``x`` -- a required / optional character of any
  kind.
* ``H`` / ``h`` -- a required / optional hexadecimal
  digit.
* ``>`` / ``<`` -- upper-case / lower-case the letters
  that follow; ``!`` stops the conversion.

Any other character -- the ``.`` in ``000.000.000.000``,
a ``-`` in a serial number -- is a literal separator: it
is placed automatically and skipped over as the user
types. To use a mask character as a literal, put a
backslash in front of it.

A ``;`` near the end sets the placeholder shown for
unfilled positions: ``"000.000.000.000;_"`` shows an
empty field as ``___.___.___.___``. Leave it off and the
blanks are spaces. While any *required* position is
still empty the entry is incomplete, which blocks Save.

Regular expressions
~~~~~~~~~~~~~~~~~~~

A *regex* checks content rather than layout, and is the
better fit when the rule is "these characters, this
pattern" rather than a fixed field. The whole entry must
match -- the expression is anchored at both ends, so
``"[A-Za-z0-9-]+"`` means *only* letters, digits, and
dashes from start to finish, not merely "contains one".

The check runs on every keystroke. A character is
accepted as long as the text could still grow into a
full match, and rejected the moment it could not, so the
user can never type their way to something invalid. The
field counts as valid -- and Save is allowed -- only once
the whole expression matches; a partial entry on its way
there stays in place but blocks Save until it is
complete.

To build and test a pattern, `regex101.com
<https://regex101.com/>`__ explains each part as you type
-- set its flavor to PCRE2, the syntax the editor uses.
