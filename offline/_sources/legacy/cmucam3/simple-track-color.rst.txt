Simple Track Color
==================

This is a very simple example of how to use the cc3-ilp to track colors. The
color in this example is hard-coded to a bright red object. The output on a
terminal program (115,200 8N1) will look something like this:

.. code-block:: text

   centroid = 0,0 bounding box = 0,0,0,0 num pix= 0 density = 0
   centroid = 144,91 bounding box = 124,85,175,106 num pix= 462 density = 431
   centroid = 118,103 bounding box = 70,92,171,112 num pix= 1169 density = 578
   centroid = 96,110 bounding box = 40,97,141,122 num pix= 1393 density = 551

The code looks like this:

.. code-block:: c

   #include <stdio.h>
   #include <stdlib.h>
   #include <cc3.h>
   #include <cc3_ilp.h>
   #include <cc3_color_track.h>

   void simple_track_color(cc3_track_pkt_t* t_pkt);

   int main(void) {
     cc3_track_pkt_t t_pkt;

     cc3_uart_init (0,
            CC3_UART_RATE_115200,
            CC3_UART_MODE_8N1,
            CC3_UART_BINMODE_TEXT);

     cc3_camera_init ();

     //cc3_camera_set_colorspace(CC3_COLORSPACE_YCRCB);
     cc3_camera_set_resolution(CC3_CAMERA_RESOLUTION_LOW);
     //cc3_pixbuf_frame_set_subsample(CC3_SUBSAMPLE_NEAREST, 2, 2);

     // init pixbuf with width and height
     cc3_pixbuf_load();

     // Load in your tracking parameters
     t_pkt.lower_bound.channel[CC3_CHANNEL_RED] = 150;
     t_pkt.upper_bound.channel[CC3_CHANNEL_RED] = 255;
     t_pkt.lower_bound.channel[CC3_CHANNEL_GREEN] = 0;
     t_pkt.upper_bound.channel[CC3_CHANNEL_GREEN] = 50;
     t_pkt.lower_bound.channel[CC3_CHANNEL_BLUE] = 0;
     t_pkt.upper_bound.channel[CC3_CHANNEL_BLUE] = 50;
     t_pkt.noise_filter = 2;

     while(true) {
       simple_track_color(&t_pkt);
       printf( "centroid = %d,%d bounding box = %d,%d,%d,%d num pix= %d density = %d\n",
               t_pkt.centroid_x, t_pkt.centroid_y,
               t_pkt.x0,t_pkt.y0,t_pkt.x1,t_pkt.y1,
               t_pkt.num_pixels, t_pkt.int_density );

      }

   }

   void simple_track_color(cc3_track_pkt_t * t_pkt)
   {
     cc3_image_t img;

     img.channels = 3;
     img.width = cc3_g_pixbuf_frame.width;
     img.height = 1;               // image will hold just 1 row for scanline processing
     img.pix = cc3_malloc_rows (1);
     if (img.pix == NULL) {
       return;
     }

       cc3_pixbuf_load ();
       if (cc3_track_color_scanline_start (t_pkt) != 0) {
         while (cc3_pixbuf_read_rows (img.pix, 1)) {
          // This does the HSV conversion
          // cc3_rgb2hsv_row(img.pix,img.width);
              cc3_track_color_scanline (&img, t_pkt);
             }
           }
       cc3_track_color_scanline_finish (t_pkt);

     free (img.pix);
     return;
   }

Tracking Multiple Colors
------------------------

The following example tracks bright red and green within the same frame without
rewinding the FIFO. Loading the scanline into memory is a relatively slow
operation. Once the scanline resides in memory computation over it is fast.

.. code-block:: c

   #include <stdio.h>
   #include <stdlib.h>
   #include <cc3.h>
   #include <cc3_ilp.h>
   #include <cc3_color_track.h>

   void simple_track_color_2(cc3_track_pkt_t* t_pkt,cc3_track_pkt_t* t_pkt2);

   int main(void) {
     cc3_track_pkt_t t_pkt1;
     cc3_track_pkt_t t_pkt2;

     cc3_uart_init (0,
            CC3_UART_RATE_115200,
            CC3_UART_MODE_8N1,
            CC3_UART_BINMODE_TEXT);

     cc3_camera_init ();

     //cc3_camera_set_colorspace(CC3_COLORSPACE_YCRCB);
     cc3_camera_set_resolution(CC3_CAMERA_RESOLUTION_LOW);
     //cc3_pixbuf_frame_set_subsample(CC3_SUBSAMPLE_NEAREST, 2, 2);

     // init pixbuf with width and height
     cc3_pixbuf_load();

     // Load in your tracking parameters
     // Track Red
     t_pkt1.lower_bound.channel[CC3_CHANNEL_RED] = 150;
     t_pkt1.upper_bound.channel[CC3_CHANNEL_RED] = 255;
     t_pkt1.lower_bound.channel[CC3_CHANNEL_GREEN] = 0;
     t_pkt1.upper_bound.channel[CC3_CHANNEL_GREEN] = 50;
     t_pkt1.lower_bound.channel[CC3_CHANNEL_BLUE] = 0;
     t_pkt1.upper_bound.channel[CC3_CHANNEL_BLUE] = 50;
     t_pkt1.noise_filter = 2;

     // Track Green
     t_pkt2.lower_bound.channel[CC3_CHANNEL_RED] = 0;
     t_pkt2.upper_bound.channel[CC3_CHANNEL_RED] = 50;
     t_pkt2.lower_bound.channel[CC3_CHANNEL_GREEN] = 150;
     t_pkt2.upper_bound.channel[CC3_CHANNEL_GREEN] = 255;
     t_pkt2.lower_bound.channel[CC3_CHANNEL_BLUE] = 0;
     t_pkt2.upper_bound.channel[CC3_CHANNEL_BLUE] = 50;
     t_pkt2.noise_filter = 2;

     while(true) {
       simple_track_color_2(&t_pkt1,&t_pkt2);
       printf( "red centroid = %d,%d bounding box = %d,%d,%d,%d num pix= %d density = %d\n",
               t_pkt1.centroid_x, t_pkt1.centroid_y,
               t_pkt1.x0,t_pkt1.y0,t_pkt1.x1,t_pkt1.y1,
               t_pkt1.num_pixels, t_pkt1.int_density );
       printf( "green centroid = %d,%d bounding box = %d,%d,%d,%d num pix= %d density = %d\n",
               t_pkt2.centroid_x, t_pkt2.centroid_y,
               t_pkt2.x0,t_pkt2.y0,t_pkt2.x1,t_pkt2.y1,
               t_pkt2.num_pixels, t_pkt2.int_density );

      }

   }

   void simple_track_color_2(cc3_track_pkt_t * t_pkt,cc3_track_pkt_t * t_pkt2)
   {
     cc3_image_t img;

     img.channels = 3;
     img.width = cc3_g_pixbuf_frame.width;
     img.height = 1;
     // image will hold just 1 row for scanline processing
     img.pix = cc3_malloc_rows (1);
     if (img.pix == NULL) {
       return;
     }

       cc3_pixbuf_load ();
       if (cc3_track_color_scanline_start (t_pkt) != 0 && cc3_track_color_scanline_start (t_pkt2) != 0) {
         while (cc3_pixbuf_read_rows (img.pix, 1)) {
          // This does the HSV conversion
          // cc3_rgb2hsv_row(img.pix,img.width);
              // Use the same scanline twice since it is already in memory and hence quick to operate upon
              cc3_track_color_scanline (&img, t_pkt);
              cc3_track_color_scanline (&img, t_pkt2);
             }
           }
       cc3_track_color_scanline_finish (t_pkt);
       cc3_track_color_scanline_finish (t_pkt2);

     free (img.pix);
     return;
   }
