Hello World
===========

Hello World is a simple application that does the following:

* Setup serial port and show how to read and write data
* Setup the FAT filesystem and show how to write to the :doc:`MMC <mmc>` slot
* Control LEDs
* Use timer
* Various ways to track the brightest red spot on the image

Sample code for setting up the serial port:

.. code-block:: c

   // configure uarts
   cc3_uart_init (0, CC3_UART_RATE_115200, CC3_UART_MODE_8N1,
                  CC3_UART_BINMODE_TEXT);
   // Make it so that stdout and stdin are not buffered
   val = setvbuf (stdout, NULL, _IONBF, 0);
   val = setvbuf (stdin, NULL, _IONBF, 0);

Set up the camera to use the RGB color space in low resolution with white balance
and auto exposure turned on:

.. code-block:: c

   cc3_camera_init ();
   cc3_camera_set_colorspace (CC3_COLORSPACE_RGB);
   cc3_camera_set_resolution (CC3_CAMERA_RESOLUTION_LOW);
   cc3_camera_set_auto_white_balance (true);
   cc3_camera_set_auto_exposure (true);

This first method for tracking the brightest red color packs data into the
cc3_pixel_t structure. This allows use of the cc3_get_pixel() function which
simplifies accessing data.

.. code-block:: c

   // This tells the camera to grab a new frame into the fifo and reset
   // any internal location information.
   cc3_pixbuf_frame_set_coi(CC3_CHANNEL_ALL);
   cc3_pixbuf_load ();

   // red search!
   // *** slow method for red search
   start_time = cc3_timer_get_current_ms();
   max_red = 0;
   my_x = 0;
   my_y = 0;
   y = 0;
   while (cc3_pixbuf_read_rows (img.pix, 1)) {
     // read a row into the image picture memory from the camera
     for (uint16_t x = 0; x < img.width; x++) {
       // get a pixel from the img row memory
       cc3_get_pixel (&img, x, 0, &my_pix);
       if (my_pix.channel[CC3_CHANNEL_RED] > max_red) {
         max_red = my_pix.channel[CC3_CHANNEL_RED];
         my_x = x;
         my_y = y;
       }
     }
     y++;
   }
   end_time = cc3_timer_get_current_ms();

   printf ("Found max red value %d at %d, %d\n", max_red, my_x, my_y);
   printf (" cc3_get_pixel version took %d ms to complete\n",
       end_time - start_time);

The next code example shows how you could access the pixel data directly in
memory without using the cc3_get_pixel() function. This is slightly faster, but
now the developer has to keep track of which color channel is being accessed.

.. code-block:: c

   // *** faster method for red search
   cc3_pixbuf_rewind();  // use exactly the same pixbuf contents
   start_time = cc3_timer_get_current_ms();
   max_red = 0;
   my_x = 0;
   my_y = 0;
   y = 0;
   while (cc3_pixbuf_read_rows (img.pix, 1)) {
     // read a row into the image picture memory from the camera
     for (uint16_t x = 0; x < img.width * 3; x+=3) {
       uint8_t red = ((uint8_t *) img.pix)[x + CC3_CHANNEL_RED];
       if (red > max_red) {
         max_red = red;
         my_x = x;
         my_y = y;
       }
     }
     y++;
   }
   my_x /= 3; // correct channel offset
   end_time = cc3_timer_get_current_ms();

   printf ("Found max red value %d at %d, %d\n", max_red, my_x, my_y);
   printf (" faster version took %d ms to complete\n",
       end_time - start_time);

This final example is the fastest because it grabs only a single channel of the
image. The CMUcam can now quickly clock out unused pixels without reading them
into memory. The data is still stored in the FIFO, so it would be possible to
rewind the frame, change the channel and still access the other color channels.
This currently cannot be done mid-image.

.. code-block:: c

   // *** even faster method for red search
   cc3_pixbuf_rewind();  // use exactly the same pixbuf contents
   cc3_pixbuf_frame_set_coi(CC3_CHANNEL_RED);
   start_time = cc3_timer_get_current_ms();
   max_red = 0;
   my_x = 0;
   my_y = 0;
   y = 0;
   while (cc3_pixbuf_read_rows (img.pix, 1)) {
     // read a row into the image picture memory from the camera
     for (uint16_t x = 0; x < img.width; x++) {
       uint8_t red = ((uint8_t *) img.pix)[x];
       if (red > max_red) {
         max_red = red;
         my_x = x;
         my_y = y;
       }
     }
     y++;
   }
   end_time = cc3_timer_get_current_ms();

   printf ("Found max red value %d at %d, %d\n", max_red, my_x, my_y);
   printf (" even faster version took %d ms to complete\n",
       end_time - start_time);
