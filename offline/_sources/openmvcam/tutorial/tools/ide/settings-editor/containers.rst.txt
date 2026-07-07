Containers
==========

Containers do not hold a value of their own -- they
organise other controls. Each spans the full width of
the form, and the controls listed inside it are built
as a form of their own. There are two: *group* draws a
labelled box, and *tabs* draws a tab strip.

All controls also accept the common keys (*name*,
*label*, *tooltip*, *enabled*); see the
:doc:`overview <index>`.

group
-----

A labelled box around a set of controls. Optionally
*checkable*, which turns the heading into a switch for
everything inside it.

.. code-block:: json

   {
     "type": "group",
     "title": "Wi-Fi",
     "checkable": true,
     "name": "wifi_enabled",
     "value": true,
     "controls": [
       { "type": "lineedit", "name": "ssid", "label": "SSID" },
       { "type": "lineedit", "name": "password", "label": "Password", "password": true }
     ]
   }

Arguments:

* *title* (string) -- the heading shown on the box.
* *checkable* (boolean, default ``false``) -- when
  ``true``, the heading carries a checkbox that enables
  or disables every control inside the box, and whose
  own on/off state is saved.
* *value* (boolean, default ``true``) -- the initial
  state of that heading checkbox. Only meaningful when
  *checkable* is ``true``.
* *controls* (array) -- the controls shown inside the
  box.

Saves: a **boolean** (the heading checkbox) when
*checkable* is ``true``; a plain group saves nothing of
its own -- only the controls inside it save their
values.

tabs
----

A tab strip. Each tab is a page with its own list of
controls, so a long form can be split across *Camera*,
*Network*, *System*, and so on.

.. code-block:: json

   {
     "type": "tabs",
     "tab_position": "north",
     "tabs": [
       {
         "title": "Camera",
         "tooltip": "Sensor settings",
         "controls": [
           { "type": "slider", "name": "gain", "label": "Gain" }
         ]
       },
       {
         "title": "Network",
         "controls": [
           { "type": "lineedit", "name": "hostname", "label": "Hostname" }
         ]
       }
     ]
   }

Arguments:

* *tab_position* (string, default ``"north"``) -- which
  edge the tab bar sits on: ``"north"``, ``"south"``,
  ``"west"``, or ``"east"``.
* *tabs* (array) -- the tab pages, in order. Each page
  is an object with:

  * *title* (string) -- the tab's label.
  * *tooltip* (string) -- hover text for the tab.
  * *controls* (array) -- the controls shown on that
    page.

Saves: nothing of its own; the controls on each page
save their own values.

Nesting
-------

Any control can go inside any container, to any depth.
A *group* can contain a *tabs*, a tab page can contain
*group* boxes, groups can nest inside groups. Every
*controls* array -- the top-level one, a group's, and a
tab page's -- takes the same control objects, so the
rules on these pages apply the same at every level.

A checkable *group* nested inside a tab is a common
shape: the tab holds a feature, the group's checkbox
turns the feature on or off, and the controls inside
configure it.
