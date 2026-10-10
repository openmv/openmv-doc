Lua API: tracker
================

Description
-----------

The tracker data structure is used to assist color tracking in the CMUcam3. It
holds information about tracking being done, and parameters that can be set to
control which color is tracked and other aspects of the color tracking. **TODO:
Add a good description of what hte bounding box is, and what the centroid is**

Example
-------

Here's a short example that shows how the tracker object is used to find a red
area in the CMUcam3 picture frame, and then that box is printed to the CamScripter
debugging area in Eclipse.

.. code-block:: lua

   trkr = tracker_new(195, 0, 0, 255, 45, 45); -- track red
   trkr:set_noise_filter(3);  -- 2 is the default

   take_picture();
   tracker_track_color(trkr);
   print_color_tracker(trkr);  -- print color tracker info to the screen
   print("num pixels tracked: " .. trkr:get_num_pixels()); -- print number of red pixels found in the picture
   -- print_picture(); -- uncomment this line to print the picture itself to the screen as well (slower)

Creation
--------

See :doc:`tracker_new <luaapifunctions>`

Methods
-------

* ``get_centroid_x``
* ``get_centroid_y``
* ``get_density``
* ``get_num_pixels``
* ``get_x0``
* ``get_x1``
* ``get_y0``
* ``get_y1``
* ``set_lower_bound``
* ``set_noise_filter``
* ``set_upper_bound``

get_centroid_x
~~~~~~~~~~~~~~

``trkr:get_centroid_x()``

:Parameters: none
:Return Values: Integer x-coordinate of the centroid

Get the x-coordinate of the centroid of the color being tracked, where (0, 0) is
the upper left hand corner of the picture.

get_centroid_y
~~~~~~~~~~~~~~

``trkr:get_centroid_y()``

:Parameters: none
:Return Values: Integer y-coordinate of the centroid

Get the y-coordinate of the centroid of the color being tracked, where (0, 0) is
the upper left hand corner of the picture.

get_density
~~~~~~~~~~~

``trkr:get_density()``

:Parameters: none
:Return Values: Density of the color being tracked

Get the density of the color tracked within the picture buffer. Density is a
measure of how dense the color being tracked is within the color tracker bounding
box -- the more pixels of the color being tracked in the box, the higher the
density is.

get_num_pixels
~~~~~~~~~~~~~~

``trkr:get_num_pixels()``

:Parameters: none
:Return Values: Number of pixels in the picture buffer matching the color tracker
   color

Get the total number of pixels of the color being tracked (as determined by the
RGB values passed to :doc:`tracker_new <luaapifunctions>`) that were found in the
CMUcam3 picture buffer.

get_x0
~~~~~~

``trkr:get_x0()``

:Parameters: none
:Return Values: The integer value of the x-coordinate of the upper left hand
   corner of the color tracking bounding box.

When :doc:`tracker_track_color <luaapifunctions>` is called, it establishes a
bounding box that describes the boundaries of the color being tracked within the
picture. (x0, y0) is the location of the upper left hand corner of that box, and
(x1, y1) is the location of the lower right hand corner of that box within the
picture buffer, where (0, 0) is the upper left hand corner of the picture buffer.
get_x0 returns the x-coordinate of the upper left hand corner of the color
boundary box.

get_y0
~~~~~~

``trkr:get_y0()``

:Parameters: none
:Return Values: The integer value of the y-coordinate of the upper left hand
   corner of the color tracking bounding box.

When :doc:`tracker_track_color <luaapifunctions>` is called, it establishes a
bounding box that describes the boundaries of the color being tracked within the
picture. (x0, y0) is the location of the upper left hand corner of that box, and
(x1, y1) is the location of the lower right hand corner of that box within the
picture buffer, where (0, 0) is the upper left hand corner of the picture buffer.
get_y0 returns the x-coordinate of the upper left hand corner of the color
boundary box.

get_x1
~~~~~~

``trkr:get_y1()``

:Parameters: none
:Return Values: The integer value of the x-coordinate of the lower right hand
   corner of the color tracking bounding box.

When :doc:`tracker_track_color <luaapifunctions>` is called, it establishes a
bounding box that describes the boundaries of the color being tracked within the
picture. (x0, y0) is the location of the upper left hand corner of that box, and
(x1, y1) is the location of the lower right hand corner of that box within the
picture buffer, where (0, 0) is the upper left hand corner of the picture buffer.
get_x1 returns the x-coordinate of the upper left hand corner of the color
boundary box.

get_y1
~~~~~~

``trkr:get_y1()``

:Parameters: none
:Return Values: The integer value of the y-coordinate of the lower right hand
   corner of the color tracking bounding box.

When :doc:`tracker_track_color <luaapifunctions>` is called, it establishes a
bounding box that describes the boundaries of the color being tracked within the
picture. (x0, y0) is the location of the upper left hand corner of that box, and
(x1, y1) is the location of the lower right hand corner of that box within the
picture buffer, where (0, 0) is the upper left hand corner of the picture buffer.
get_y1 returns the x-coordinate of the upper left hand corner of the color
boundary box.

set_lower_bound
~~~~~~~~~~~~~~~

``trkr:set_lower_bound(integer channel, integer bound)``

:Parameters: ``channel`` The channel you're setting a bound for. See the channel
   of interest constants in :doc:`luaapiconstants`. ``bound`` The minimum value
   possible for the given channel. Must be between 0 and 255.
:Return Values: none

Set the lower bound for one channel in the color tracker. The lower bound is the
minimum value a pixel can have in that channel in order to be tracked. For color
tracking purposes, for any pixel to be considered trackable, that pixel must be
between the lower and upper bound in each of its channels.

set_noise_filter
~~~~~~~~~~~~~~~~

``trkr:set_noise_filter(integer filter)``

:Parameters: ``filter`` The new noise filter value. Default is 2.
:Return Values: none

The noise filter value determines how many consecutive active pixels before a
pixel are required before the pixel should be counted as being detected by color
tracking. The value must be between 0 and 255.

set_upper_bound
~~~~~~~~~~~~~~~

``trkr:set_upper_bound(integer channel, integer bound)``

:Parameters: ``channel`` The channel you're setting a bound for. See the channel
   of interest constants in :doc:`luaapiconstants`. ``bound`` The maximum value
   possible for the given channel. Must be between 0 and 255.
:Return Values: none

Set the upper bound for one channel in the color tracker. The upper bound is the
maximum value a pixel can have in that channel in order to be tracked. For color
tracking purposes, for any pixel to be considered trackable, that pixel must be
between the lower and upper bound in each of its channels.
