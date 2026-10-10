Lua API: framediff
==================

Description
-----------

The framediff data structure holds information about the difference between two
different frames taken with the CMUcam3. Internally, these frames are held in a
"current" and "previous" template. Comparisons between those two templates are
done using :doc:`framediff_scanline_start <luaapifunctions>`,
:doc:`framediff_scanline <luaapifunctions>` and
:doc:`framediff_scanline_finish <luaapifunctions>`.

Example
-------

This example demonstrates an implementation using the CMUcam3 and frame
differencing. It loops, taking pictures until one picture is different than the
previous one, at which point it saves that picture to disk by calling
:doc:`save_picture <luaapifunctions>`.

.. code-block:: lua

   -- get a new framediff, and initialize it
   fdiff = framediff_new(16, 16);
   fdiff:set_total_x(pixbuf_get_width());
   fdiff:set_total_y(pixbuf_get_height());
   fdiff:set_threshold(10);
   img = image_new(pixbuf_get_width(), 1); -- need an image object for the framediff'ing

   take_picture();
   fdiff:set_load_frame(true);

   -- take the first picture
   if (framediff_scanline_start(fdiff) > 0) then
       while pixbuf_read_rows(img, 1) > 0 do
           framediff_scanline(img, fdiff);
       end
       framediff_scanline_finish(fdiff);
   end

   fdiff:set_load_frame(false);

   -- now keep taking pictures until a picture is different than its predecessor
   repeat
       take_picture();
       if (framediff_scanline_start(fdiff) > 0) then
           while pixbuf_read_rows(img, 1) > 0 do
               framediff_scanline(img, fdiff);
           end
           framediff_scanline_finish(fdiff);
       else
           print("Error!");
       end

       fdiff:swap_templates(); -- put current template in previous template spot
   until fdiff:get_num_pixels() > fdiff:get_threshold()

   -- we got an image that was different! Save it to disk, and send it to the Camscripter
   save_picture("Diff.ppm"):
   print_picture();

Constructor
-----------

See ``framediff_new`` in :doc:`luaapifunctions`

Methods
-------

* ``dispose``
* ``get_coi``
* ``get_load_frame``
* ``get_num_pixels``
* ``get_template_height``
* ``get_template_width``
* ``get_threshold``
* ``get_total_x``
* ``get_total_y``
* ``set_coi``
* ``set_load_frame``
* ``set_total_x``
* ``set_total_y``
* ``set_threshold``
* ``swap_templates``

dispose
~~~~~~~

``fdiff:dispose()``

:Parameters: none
:Return Values: none

Provides a way to explicitly dispose of memory associated with this framediff
data structure instead of waiting for the Lua garbage collector to dispose of
that memory. **Warning:** Errors are likely to result from using a framediff
after calling dispose on it, it's highly recommended that you not do so.

get_coi
~~~~~~~

``fdiff:get_coi()``

:Parameters: none
:Return Values: the channel of interest for this framediff structure.

Get the channel of interest for this structure. See the channel of interest
constants in :doc:`luaapiconstants` for possible return values.

get_load_frame
~~~~~~~~~~~~~~~

``fdiff:get_load_frame()``

:Parameters: none
:Return values: whether or not we want to load a new frame

Get the value of load_frame for this framediff object. load_frame determines
whether we need to load a new frame from the CMUcam3 before doing any differencing
of the current and previous templates.

get_num_pixels
~~~~~~~~~~~~~~~

``fdiff:get_num_pixels()``

:Parameters: none
:Return Values: the number of pixels of difference between the current template
   and the previous template

After using :doc:`framediff_scanline_start <luaapifunctions>`,
:doc:`framediff_scanline <luaapifunctions>` and
:doc:`framediff_scanline_finish <luaapifunctions>`, call this method to get the
number of pixels of difference that were found between the current and previous
template.

get_template_height
~~~~~~~~~~~~~~~~~~~~

``fdiff:get_template_height()``

:Parameters: none
:Return Values: the height of the templates

Get the height of the templates being differenced.

get_template_width
~~~~~~~~~~~~~~~~~~~

``fdiff:get_template_width()``

:Parameters: none
:Return Values: the width of the templates

Get the width of the templates being differenced.

get_total_x
~~~~~~~~~~~

``fdiff:get_total_x()``

:Parameters: none
:Return Values: the total width to be analyzed

Get the total width, usually equivalent to
:doc:`pixbuf_get_width <luaapifunctions>`

get_total_y
~~~~~~~~~~~

``fdiff:get_total_y()``

:Parameters: none
:Return Values: the total height to be analyzed

Get the total width, usually equivalent to
:doc:`pixbuf_get_height <luaapifunctions>`

set_coi
~~~~~~~

``fdiff:set_coi(integer channel_of_interest)``

:Parameters: ``channel_of_interest`` The new channel of interest for frame
   differencing
:Return Values: none

Set the channel of interest for framedifferencing. The parameter
channel_of_interest must be one of the channel of interest constants in
:doc:`luaapiconstants`.

set_load_frame
~~~~~~~~~~~~~~~

``fdiff:set_load_frame(boolean newValue)``

:Parameters: ``newValue`` The new value
:Return Values: none

Control whether or not a new frame needs to be loaded in the course of the next
round of frame differencing. If this is true, a new picture will be taken and
stored as the current template for frame differencing purposes.

set_total_x
~~~~~~~~~~~

``fdiff:set_total_x(integer total_x)``

:Parameters: ``total_x`` the new value for total_x
:Return Values: none

Set total_x for the framediff packet.

set_total_y
~~~~~~~~~~~

``fdiff:set_total_y(integer total_y)``

:Parameters: ``total_y`` the new value for total_y
:Return Values: none

Set total_y for the framediff packet.

set_threshold
~~~~~~~~~~~~~

``fdiff:set_threshold(integer threshold)``

:Parameters: ``threshold`` The new threshold value
:Return Values: none

Set the threshold, in number of pixels difference, that determines whether one
frame is considered "different" from another frame.

swap_templates
~~~~~~~~~~~~~~

``fdiff:swap_templates``

:Parameters: none
:Return Values: none

Swaps the current and previous template in this framediff structure. This
function puts the current_template in the previous_template, and vice versa.
