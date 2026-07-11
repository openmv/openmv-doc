Simple Histogram
================

This is a very simple example of how to use the cc3-ilp to get histogram
information. The output on a terminal program (115,200 8N1) will look something
like this:

.. code-block:: text

   hist: 0 1 29 937 2089 1079 1696 2173 2982 1649 415 288 130 71 87 57 33 54 27 36 57 40 60 11354
   hist: 0 0 11 491 1658 1361 1295 1868 2413 2378 1349 438 234 108 74 39 72 34 66 35 23 52 41 11304
   hist: 0 1 294 1463 2592 1674 1176 1478 1920 1735 636 82 57 57 35 28 46 39 48 40 29 18 52 11844
   ...

The code looks like this:

.. code-block:: c

   #include <stdio.h>
   #include <stdlib.h>
   #include <cc3.h>
   #include <cc3_ilp.h>
   #include <cc3_histogram.h>

   void simple_get_histogram (cc3_histogram_pkt_t * h_pkt);

   int main (void)
   {
     cc3_histogram_pkt_t my_hist;
     uint32_t i;

     cc3_uart_init (0,
                    CC3_UART_RATE_115200,
                    CC3_UART_MODE_8N1, CC3_UART_BINMODE_TEXT);

     cc3_camera_init ();

     //cc3_camera_set_colorspace(CC3_COLORSPACE_YCRCB);
     cc3_camera_set_resolution (CC3_CAMERA_RESOLUTION_LOW);
     //cc3_pixbuf_frame_set_subsample(CC3_SUBSAMPLE_NEAREST, 2, 2);

     // init pixbuf with width and height
     // When using the virtual-cam, note that this will skip the first image
     cc3_pixbuf_load ();

     my_hist.channel = CC3_CHANNEL_GREEN;
     my_hist.bins = 24;
     my_hist.hist = malloc (my_hist.bins * sizeof (uint32_t));

     while (true) {
       // Grab an image and take a histogram of it
       simple_get_histogram (&my_hist);

       // Print the histogram out on the screen
       printf ("hist: ");
       for (i = 0; i < my_hist.bins; i++)
         printf ("%d ", my_hist.hist[i]);
       printf ("\n");
     }
   }

   void simple_get_histogram (cc3_histogram_pkt_t * h_pkt)
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
     if (cc3_histogram_scanline_start (h_pkt) != 0) {
       while (cc3_pixbuf_read_rows (img.pix, 1)) {
         // This does the HSV conversion
         // cc3_rgb2hsv_row(img.pix,img.width);
         cc3_histogram_scanline (&img, h_pkt);
       }
     }
     cc3_histogram_scanline_finish (h_pkt);

     free (img.pix);
     return;
   }
