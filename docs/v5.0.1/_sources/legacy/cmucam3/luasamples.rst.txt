CamScripter Lua Samples
=======================

**Grab an Image**

.. code-block:: lua

   print("Hello, World!");
   take_picture("pic_name");
   print_picture("pic_name");
   print("It's a picture!");

**Track Color for 100 Frames**

.. code-block:: lua

   clear_graphics();
   trkr = tracker_new(195, 0, 0, 255, 45, 45); -- track red
   trkr:set_noise_filter(3);  -- 2 is the default

   print( "start" );
   for y=0, 100, 1 do
        take_picture();
        tracker_track_color(trkr);
        print_color_tracker(trkr);                               -- print color tracker info to the screen
        print("num pixels tracked: " .. trkr:get_num_pixels());  -- print number of red pixels found in the picture
   end
   print( "done" );

**Draw Some Rectangles**

.. code-block:: lua

   clear_graphics();
   print_rectangle(5,5,30,10, 255, 0, 0 ); -- red
   print_rectangle(5,25,40,10, 0, 255, 0 ); -- green
   print_rectangle(5,45,50,10, 0, 0, 255 ); -- blue

**Frame Dump by Drawing Rectangles**

.. code-block:: lua

   print( "Starting" );
   take_picture();
   pix = pixel_new();
   clear_graphics();
   for y=0, pixbuf_get_height()-1, 1 do
       for x=0,pixbuf_get_width()-1,1 do
           get_pixel(pix, x, y);
           print_rectangle(x,y,1,1, pix:get_value(0), pix:get_value(1), pix:get_value(2) );
       end
       if (y%2==0) then
           turn_on_led(1);
       else
           turn_off_led(1);
       end
       print( "row=" .. y );

   end
   print( "done!" );
