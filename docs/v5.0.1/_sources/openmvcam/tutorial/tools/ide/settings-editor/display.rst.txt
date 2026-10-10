Display
=======

label
-----

A block of static text -- a heading, a note, or a link.
A *label* holds no value and is never saved; it is there
to explain the controls around it.

.. code-block:: json

   {
     "type": "label",
     "align": "center",
     "text": "<b>Camera settings</b><br/>See the <a href='https://docs.openmv.io'>documentation</a>."
   }

Arguments:

* *text* (string) -- the text to show. Rich text: HTML
  tags such as ``<b>`` and ``<br/>``, and ``<a href>``
  links (which open in a browser), all work.
* *align* (string, default left) -- ``"center"`` or
  ``"right"`` to align the text; any other value is
  left-aligned.

Saves: nothing -- a *label* is display only.

A *label* also accepts the common keys (*tooltip*,
*enabled*); see the :doc:`overview <index>`.
