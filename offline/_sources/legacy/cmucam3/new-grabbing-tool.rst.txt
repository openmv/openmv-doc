New Grabbing Tool
=================

The new grabbing tool include two parts: the code running in cmucam3
(Attachment cmucam3.rar) and the software running in PC (Attachment cmucam
location.rar). You should unzip "cmucam3.rar" and install it on your CMUcam3
first. And then you should download and un-rar "cmucam location.rar". You should
be able to execute the software by double clicking on "cmucam location.exe".

The code running in cmucam3 is similiar to the code of cmucam2 project. The soft
in PC is based on Microsoft Visual C++ 6.0. The new tool includes not only the
basic functions in "cmucam frame grabber", but also some new functions, such as
"save bmp picture to mmc card", "send bmp picture to pc". The command details
show below:

.. code-block:: text

   return ""    exit (mainly in virtual-cam)
   debug        "db" debug/no debug; save or not the result in mmc
   reset        "rs" reset the camera
   get_version  "gv" get version of code
   capture_jpg  "cj" send jpg picture to pc
   capture_bmp  "cb" send bmp picture to pc
   save_bmp     "sb" save bmp picture to mmc
   save_jpg     "sj" save jpg picture to mmc
   save_ppm     "sp" save ppm file to mmc

   // same as cmucam2

   hi_res              "hr" set high/low resolution
   camera_reg          "cr" set color space
   down_sample         "ds" down sample
   virtual_window      "vw" virtual window
   auto_white_balance  "wb" set auto white balance
   auto_exposure       "ex" set auto exposure
   brightness          "bn" set brightness
   contrast            "ct" set contrast
