Lua API: Functions
==================

set_debug
---------

``set_debug(boolean debug_on)``

:Parameters: ``debug_on`` -- Pass a value that evaluates to either true
   (debugging on) or false (debugging off)
:Return Values: none

Turn debugging on or off. When debugging is on, the camera will attempt to send
text and image debugging information over the serial port. Turn debugging off
once a program is finished to improve performance.

print
-----

Usage: ``print("a message")`` / ``print("one plus one is ", 1+1)``

:Parameters: Pass as many values as desired.
:Return Values: none

Debugging function, used to print values. The CMUcam3 will send all values
passed to this function to the :doc:`CamScripter <camscripter>` Eclipse plugin,
where they will be displayed in the Console area.

turn_on_led
-----------

``turn_on_led(integer led_number)``

:Parameters: ``led_number`` The number of the CMUcam3 LED to turn on. 0, 1, 2
   are the only legal values.
:Return Values: none

Turn on one of the CMUcam3 LEDs.

turn_off_led
------------

``turn_off_led(integer led_number)``

:Parameters: ``led_number`` The number of the CMUcam3 LED to turn on. 0, 1, 2
   are the only legal values.
:Return Values: none

Turn off one of the CMUcam3 LEDs.

take_picture
------------

``take_picture()``

:Parameters: none
:Return Values: none

Take a picture with the CMUcam3, and load the picture buffer (pixbuf).

print_picture
-------------

``print_picture()``

:Parameters: none
:Return Values: none

Send the picture that was just taken over the serial port to be displayed in the
:doc:`CamScripter <camscripter>` debug window. You must call take_picture prior
to calling this function - it doesn't take a picture itself.

save_picture
------------

``save_picture(string filename)``

:Parameters: ``filename`` Filename to try and save the picture under.
:Return Values: none

Save the picture currently in the picture buffer to the passed filename. The
filename must be a valid FAT16 filename <8.3>, or an error will be returned. If a
file already exists with the given filename, it will be overwritten. Note that
this function does not take a picture itself - you must call take_picture prior
to calling save_picture.

file_exists
-----------

``file_exists(string filename)``

:Parameters: ``filename``
:Return Values: boolean indicating if the file exists

Test to see if there is a file on the MMC/SD card with the passed filename.

camera_set_resolution
---------------------

``camera_set_resolution(integer resolution)``

:Parameters: ``resolution`` The new resolution for the camera
:Return Values: none

Set the resolution of the CMUcam3. Resolution must be either high or low (see the
Camera Resolution Constants in :doc:`luaapiconstants`).

camera_set_colorspace
---------------------

``camera_set_colorspace(integer space)``

:Parameters: ``space`` The new resolution for the camera, must be either
   ``CC3_COLORSPACE_YCRCB`` OR ``CC3_COLORSPACE_RGB``
:Return Values: none

Set the colorspace for the CMUcam3 to either YCRCB or RGB (RGB is the default).
See also :doc:`luaapiconstants`.

wait
----

``wait(integer ms)``

:Parameters: ``ms`` The number of milliseconds to wait
:Return Values: none

Wait for ms milliseconds.

pixbuf_set_coi
--------------

``pixbuf_set_coi(integer coi)``

:Return Values: none

Set the channels of interest for the camera. Determines which channels the camera
records when taking pictures. Setting smaller values for COI can speed image
processing. Legal values for COI can be found in the Channel of Interest Constants
in :doc:`luaapiconstants`.

pixbuf_read_rows
----------------

``pixbuf_read_rows(image img, integer num_rows)``

:Parameters: ``img`` An image object into which pixbuf rows get read, ``num_rows``
   The number of rows to read
:Return Values: The number of rows that were successfully read

Copy num_rows rows from the camera's picture buffer (pixbuf) into the passed
:doc:`image <luaapistructimage>` object.

pixbuf_get_width
----------------

``pixbuf_get_width()``

:Parameters: none
:Return Values: The width of the pixbuf in pixels

Get the width of the picture buffer (pixbuf). The picture buffer must have been
loaded before calling this by calling either take_picture or show_picture.

pixbuf_get_height
-----------------

``pixbuf_get_height()``

:Parameters: none
:Return Values: The height of the pixbuf in pixels

Get the height of the picture buffer (pixbuf). The picture buffer must have been
loaded before calling this by calling either take_picture or show_picture.

pixel_new
---------

``pixel_new()``

:Parameters: none
:Return Values: A new :doc:`pixel <luaapistructpixel>` data structure

Creates and returns a new pixel data structure. See the
:doc:`pixel documentation <luaapistructpixel>` for details about the structure.
See also ``pixbuf_get_pixel`` and ``get_pixel`` for usage of the
:doc:`pixel <luaapistructpixel>` structure.

get_pixel
---------

``get_pixel(pixel pxl, integer x, integer y)``

:Parameters: ``pxl`` The :doc:`pixel <luaapistructpixel>` data structure into
   which to store the pixel values. ``x``, ``y`` The x and y coordinates of the
   pixel to retrieve within the picture buffer.
:Return Values: none, the pixel values are stored in the passed in
   :doc:`pixel <luaapistructpixel>`

Get a single :doc:`pixel <luaapistructpixel>` from within the CMUcam3 picture
buffer (pixbuf). x and y must be less than ``pixbuf_get_width`` and
``pixbuf_get_height``, respectively. If ``take_picture`` hasn't been called to
store a picture in the pixbuf this function will not fail, but the values
inserted into the :doc:`pixel <luaapistructpixel>` will be garbage.

image_new
---------

``image_new(integer width, integer height)``

:Parameters: ``width`` The width of the image, ``height`` The image height
:Return Values: A new :doc:`image <luaapistructimage>` data structure.

Get a new :doc:`image <luaapistructimage>` data structure, with the passed-in
width, height and pixsize. See the :doc:`image <luaapistructimage>` documentation
for more information about using :doc:`image <luaapistructimage>` data structures.

Get a :doc:`pixel <luaapistructpixel>` from the passed-in
:doc:`image <luaapistructimage>` data structure. The pixel's RGB values will be
stored into the passed in :doc:`pixel <luaapistructpixel>` data structure. The
parameter x must be less than the :doc:`image <luaapistructimage>`'s width, and y
must be less than the :doc:`image <luaapistructimage>`'s height.

framediff_new
-------------

``framediff_new(integer template_width, integer template_height)``

:Parameters: ``template_width`` The width of the template we're diffing,
   ``template_height`` The height of the template
:Return Values: A new :doc:`framediff <luaapistructframediff>` data structure

Get a new :doc:`framediff <luaapistructframediff>` data structure, with the
passed in template width and height. See the
:doc:`framediff <luaapistructframediff>` structures are generally used for
evaluating the difference between two picture frames taken with the CMUcam3, but
see the :doc:`framediff <luaapistructframediff>` documentation for more
information.

framediff_scanline_start
------------------------

``framediff_scanline_start(framediff fd)``

:Parameters: ``fd`` The :doc:`framediff <luaapistructframediff>` object to use
:Return Values: Returns 1 if successful.

Initializes everything needed to do frame differencing using
``framediff_scanline``. Makes sure there is a current_template set in the
:doc:`framediff <luaapistructframediff>` structure (or loads current template if
``framediff:get_load_frame()`` is true).

framediff_scanline
------------------

``framediff_scanline(image img, framediff fd)``

:Parameters: ``img`` An :doc:`image <luaapistructimage>` data structure, ``fd`` A
   :doc:`framediff <luaapistructframediff>` data structure
:Return Values: Returns 1 if successful

Gets all the pixels from img and loads them into the proper slot in the
:doc:`framediff <luaapistructframediff>` structure, so that the two templates
(current_template and previous_template) can be compared. If fd:get_load_frame is
true, will load the pixels in img into the previous template slot. If
fd:get_load_frame is false, loads the pixels from img into the current_template.

framediff_scanline_finish
-------------------------

``framediff_scanline_finish(framediff fd)``

:Parameters: ``fd`` The :doc:`framediff <luaapistructframediff>` data structure to
   use
:Return Values: Returns 1 if the operation was successful.

Compares the two templates (current_template and previous_template) in the
:doc:`framediff <luaapistructframediff>` data structure, and computes the number
of pixels that are different, storing that value in
:doc:`framediff <luaapistructframediff>`:get_num_pixels.

print_color_tracker
-------------------

``print_color_tracker(tracker tracker)``

:Parameters: ``tracker`` The :doc:`tracker <luaapistructtracker>` provides the
   data used to print
:Return Values: none

Uses the data in the :doc:`tracker <luaapistructtracker>` object to print out
debugging information on the CamScripter. Prints a rectangle representing the
picture in the camera picture buffer, with another rectangle inside it
representing the bounding box for the color being tracked, and a red dot showing
the centroid of the color within the picture.

print_rectangle
---------------

``print_rectangle(integer x, integer y, integer width, integer height [, integer red, integer green, integer blue])``

:Parameters: ``x``, ``y`` is the coordinate location of the upper left corner of
   the rectangle in distance from the upper left corner of the graphics screen.
   ``width`` and ``height`` are the width and height of the rectangle. The
   optional ``red``, ``green``, and ``blue`` arguments give the color the
   rectangle will be drawn in as an RGB value. The default color is black.
:Return Values: none

Draws a rectangle width pixels wide and height pixels tall in the CamScripter
graphics tab. Optional red, green, and blue arguments allow for changing the
color of the rectangle using RGB values between 0 and 255.

print_line
----------

``print_line(integer start_x, integer start_y, integer end_x, integer end_y [, integer red, integer green, integer blue])``

:Parameters: The starting point and the ending point for the line, and optional
   arguments to set the color of the line.
:Return Values: none

Draw a line on the CamScripter graphics screen from (start_x, start_y) to
(end_x, end_y). The RGB color of the line can be specified with optional red,
green, and blue arguments. The default color is black, if no color is specified.

print_oval
----------

``print_oval(integer x, integer y, integer width, integer height [, integer red, intger green, integer blue])``

:Parameters: The upper left hand corner of the oval is specified by (x, y).
   Width and height are in pixels. Red, green, and blue are optional arguments to
   set the color of the oval.
:Return values: none

Draw an oval on the CamScripter graphics screen. The oval's upper left hand
corner is at the point (x, y). The RGB color of the oval can be specified with
optional red, green, and blue arguments. The default color is black, if no color
is specified.

clear_graphics
--------------

``clear_graphics()``

:Parameters: none
:Return values: none

Clear the CamScripter graphics screen.

tracker_track_color
-------------------

``tracker_track_color(tracker theTracker)``

:Parameters: the :doc:`tracker <luaapistructtracker>` object used to do the color
   tracking, set with the desired RGB value to set.
:Return values: boolean indicating if the tracking was able to happen. Returns
   true even if the color wasn't found -- only returns false if an error
   occurred.

Track a color in the CMUcam3 using the passed-in
:doc:`tracker <luaapistructtracker>` object. ``take_picture()`` must be called
before trying to track a color. Analyzes the picture buffer, and sets values in
the :doc:`tracker <luaapistructtracker>` object to give a bounding box for teh
color and an (x, y) value representing the centroid of the color. See
:doc:`the tracker documentation <luaapistructtracker>` for more details.
