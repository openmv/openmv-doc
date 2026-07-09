MMC/SD Card Slot
================

The MMC/SD slot on the CMUcam3 can be used for Mass file storage. The CMUcam3
communicates to the card using the SPI interface. Most MMC and SD cards support
this mode of communication and can be used with the CMUcam3.

Format the Memory Card using the FAT filesystem

* DO NOT USE FAT32 which is the Windows Default

To configure the MMC/SD card and the FAT filesystem, you need to call:

.. code-block:: c

   // init filesystem driver
   cc3_filesystem_init ();

Disk files required the ``c:/`` prefix in the name of the file you are trying to
access. This indicates that you are writing to a File on the FAT file system
located on the memory card.

.. code-block:: c

   FILE *fp;

   // init filesystem driver
   cc3_filesystem_init ();

   // sample showing how to write to the MMC card
   fp = fopen ("c:/test.txt", "w");
   if (fp == NULL) {
     perror ("fopen failed");
   }
   else
   {
     fprintf( fp, "This is a test string we want to write to the file..." );
     fclose (fp);
   }

Like most standard implementations of fopen(), you can use r,w,a to read, write
or append data.

The following cards are known to work with the CMUcam3 (r507 and later):

* PQI 128MB MMC
* SanDisk 2GB / 1GB / 512MB SD cards
* SanDisk 512MB MMC cards
* Transcend 1GB SD (handles 96KB bursts, but very slow constant throughput
  6KB/s!)

The following cards are known to have issues:

* SanDisk miniSD 256MB using SD Adapter
* Cannon MMC-16M
* SDHC 4Gb SanDisk

In the original release of the CC3 source, subdirectories could only hold 254
files. Ticket 54 extends this to 65K. Note, there will be a significant slow
down as the number of files in one directory increases. We suggest using a set
of directories to load balance the data storage if speed is required.
