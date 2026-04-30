:mod:`gif` --- gif recording
============================

.. module:: gif
   :synopsis: gif recording

The ``gif`` module is used for gif recording.


class Gif -- Gif recorder
-------------------------

You can use the gif module to record small video clips. Note that gif files save
uncompressed image data. So, they are best for recording short video clips that
you want to share. Use `mjpeg` for long clips.

Example usage::

    import csi, gif

    # Setup camera.
    csi0 = csi.CSI()
    csi0.reset()
    csi0.pixformat(csi.GRAYSCALE)
    csi0.framesize(csi.QQVGA)
    csi0.snapshot(time=2000)

    # Create the gif object.
    g = gif.Gif("example.gif")

    # Add frames.
    for i in range(100):
        g.add_frame(csi0.snapshot())

    # Finalize.
    g.close()

.. class:: Gif(filename:str, width:Optional[int]=None, height:Optional[int]=None, color:Optional[bool]=None, loop:bool=True)

   Creates a Gif object which frames can be added to. ``filename`` is the path
   to save the gif recording to.

   ``width`` defaults to the main framebuffer horizontal resolution.

   ``height`` defaults to the main framebuffer vertical resolution.

   ``color`` defaults to the main framebuffer color mode:

     - False results in a `sensor.GRAYSCALE` 7-bit per pixel gif.
     - True results in a `sensor.RGB565` 7-bit per pixel gif.

   ``loop`` when True results in the gif automatically looping on playback.

   .. method:: width() -> int

      Returns the width (horizontal resolution) of the gif.

   .. method:: height() -> int

      Returns the height (vertical resolution) of the gif.

   .. method:: format() -> int

      Returns `sensor.RGB565` if color is True or `sensor.GRAYSCALE` otherwise.

   .. method:: size() -> int

      Returns the file size of the gif so far. This value is updated after adding frames.

   .. method:: loop() -> bool

      Returns whether the gif object was constructed with ``loop`` enabled.

   .. method:: add_frame(image:image.Image, delay:int=10) -> None

      Adds an image to the gif recording. The image width, height, and color mode
      must match the values used in the constructor.

      ``delay`` is the number of centi-seconds to wait before displaying this frame
      after the previous frame.

   .. method:: close() -> None

      Finalizes the gif recording. This method must be called once the recording
      is complete to make the file viewable.
