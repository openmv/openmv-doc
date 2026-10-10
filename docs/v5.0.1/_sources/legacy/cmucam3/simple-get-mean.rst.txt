Simple Get Mean
===============

This is a very simple example of how to use the cc3-ilp to get color information.
The output on a terminal program (115,200 8N1) will look something like this:

.. code-block:: text

   min = [23,16,16] mean = [104,99,64] max = [240,200,129] deviation = [108,92,56]
   min = [28,16,16] mean = [106,100,63] max = [236,197,130] deviation = [104,90,57]
   min = [25,16,16] mean = [102,99,66] max = [240,202,130] deviation = [107,93,57]
   min = [22,16,16] mean = [103,98,61] max = [240,191,120] deviation = [109,87,52]
   min = [21,16,16] mean = [102,98,64] max = [240,201,120] deviation = [109,92,52]
   min = [27,17,16] mean = [104,100,64] max = [240,194,123] deviation = [106,88,53]
   min = [25,16,16] mean = [102,98,64] max = [230,201,127] deviation = [102,92,55]

The code looks like this:

.. code-block:: c

   #include <stdio.h>
   #include <stdlib.h>
   #include <cc3.h>
   #include <cc3_ilp.h>
   #include <cc3_color_info.h>

   void simple_get_mean(cc3_color_info_pkt_t * s_pkt);

   int main(void) {
     cc3_color_info_pkt_t s_pkt;

     cc3_uart_init (0,
            CC3_UART_RATE_115200,
            CC3_UART_MODE_8N1,
            CC3_UART_BINMODE_TEXT);

     cc3_camera_init ();

     //cc3_camera_set_colorspace(CC3_COLORSPACE_YCRCB);
     cc3_camera_set_resolution(CC3_CAMERA_RESOLUTION_LOW);
     //cc3_pixbuf_frame_set_subsample(CC3_SUBSAMPLE_NEAREST, 2, 2);
     cc3_camera_set_auto_exposure (true);
     cc3_camera_set_auto_white_balance (true);

     cc3_led_set_state (0, false);
     printf ("Waiting for image to stabilize\n");
     cc3_timer_wait_ms (2000);
     cc3_led_set_state (0, true);
     cc3_camera_set_auto_exposure (false);
     cc3_camera_set_auto_white_balance (false);

     while(true) {
       simple_get_mean(&s_pkt);
       printf( "min = [%d,%d,%d] mean = [%d,%d,%d] max = [%d,%d,%d] deviation = [%d,%d,%d]\n",
               s_pkt.min.channelr0,
               s_pkt.min.channelr1,
               s_pkt.min.channelr2,
               s_pkt.mean.channelr0,
               s_pkt.mean.channelr1,
               s_pkt.mean.channelr2,
               s_pkt.max.channelr0,
               s_pkt.max.channelr1,
               s_pkt.max.channelr2,
               s_pkt.deviation.channelr0,
               s_pkt.deviation.channelr1,
               s_pkt.deviation.channelr2
               );

      }

   }

   void simple_get_mean (cc3_color_info_pkt_t * s_pkt)
   {
     cc3_image_t img;
     img.channels = 3;
     img.width = cc3_g_pixbuf_frame.width;
     img.height = 1;               // image will hold just 1 row for scanline processing
     img.pix = malloc (3 * img.width);

     cc3_pixbuf_load ();
     if (cc3_color_info_scanline_start (s_pkt) != 0) {
       while (cc3_pixbuf_read_rows (img.pix, 1)) {
         cc3_color_info_scanline (&img, s_pkt);
       }
       cc3_color_info_scanline_finish (s_pkt);
     }
     free (img.pix);
   }
