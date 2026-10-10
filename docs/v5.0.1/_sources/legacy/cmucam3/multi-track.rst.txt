Multi-Track Algorithm
=====================

Multi-track is a simple multiple object tracking algorithm for the CMUcam3
developed by Steve Sherman for Dr. Derek Paley at the University of Maryland
College Park Collective Dynamics and Control Lab. The core of the algorithm is to
call simple simple color track on small areas of the image frame and then merge
the returned bounding boxes back together to give a list of found objects.

On a typical three channel full resolution image, multitrack will take around
450 ms to execute. This is comparison to 300ms for simple_color_track, and 200ms
for a basic bright pixel search. On a full resolution single channel image,
multitrack will take ~340ms, simple color track ~200ms and bright pixel
approximately 150ms. I'm sure there are many optimizations to be made, so feel
free to tinker and improve the algorithm.

A sample calling of multitrack:

.. code-block:: c

   multitrack_pkt_t tracker;
   cc3_pixbuf_load();  //takes picture
   multitrack(&tracker);

   //make sure to free the memory after you are done to prevent a memory leak
   free(tracker.objects);

   tracker.entries=0;

Each multitrack_pkt_t is defined as follows:

.. code-block:: c

   typedef struct {

     uint8_t entries; // the number of objects

     cc3_track_pkt_t* objects;//pointer to the array of objects
     cc3_track_pkt_t base; //the reference color data

     uint8_t divh; //number of rows of blocks

     uint8_t divw; //number of columns of blocks

     uint16_t tolerance; //max distance track_pkts must be to merge

     uint8_t minpix; // minimum number of pixels to not be filtered

     uint8_t mindensity; //minimum density to not be filtered

     uint8_t minwidth; //minimum dimension of a track pkt

   } multitrack_pkt_t;

Further documentation should be available in the source, as well as a sample main
file, but if you have any questions feel free to ask in the forums.
