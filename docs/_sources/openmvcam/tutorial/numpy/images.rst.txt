Bridging image.Image and ndarray
================================

OpenMV's ``image`` module and ``numpy`` are complementary. The
``image`` module is fast and operates directly on the framebuffer in
the camera's native pixel format; ``numpy`` is generic and lets you
express arbitrary numerical operations element-wise. The two are
linked by a pair of conversions:

* :py:meth:`image.Image.to_ndarray` -- view or copy the image's
  pixels as an ``ndarray``.
* The :py:class:`image.Image` constructor -- build an image from an
  ``ndarray``.

Together they let you snap a frame, hand it off to ``numpy`` for some
custom processing, and put the result back into an image you can
display, save, or feed back into the rest of OpenMV.

image.Image to ndarray
----------------------

``Image.to_ndarray(dtype, *, buffer=None)`` returns a fresh
``ndarray`` whose data come from the image's pixel buffer. The shape
depends on the image format:

* **GRAYSCALE** -> 2-D array, shape ``(height, width)``.
* **RGB565**    -> 3-D array, shape ``(height, width, 3)``, planes
  in R, G, B order.

The ``dtype`` argument controls how each pixel is mapped:

==========  ============  =====================================
``dtype``   element type  mapping for an 8-bit pixel value ``v``
==========  ============  =====================================
``'B'``     ``uint8``     ``v`` (raw)
``'b'``     ``int8``      ``v - 128``  (re-centred around zero)
``'f'``     ``float32``   ``float(v)`` (0.0 ... 255.0)
==========  ============  =====================================

Example -- view a grayscale frame as a ``uint8`` matrix::

   import csi
   from ulab import numpy as np

   csi0 = csi.CSI()
   csi0.reset()
   csi0.pixformat(csi.GRAYSCALE)
   csi0.framesize(csi.QVGA)
   csi0.snapshot(time=2000)

   img = csi0.snapshot()
   a = img.to_ndarray('B')          # shape (240, 320), dtype=uint8

   print(a.shape, a.dtype)
   print('mean brightness:', np.mean(a))

The optional ``buffer`` keyword lets you reuse a pre-allocated
``bytearray``, which is important on a microcontroller because it
avoids a fresh heap allocation every frame::

   buf = bytearray(320 * 240)       # reused across frames
   while True:
       img = csi0.snapshot()
       a = img.to_ndarray('B', buffer=buf)
       # ... process a ...

ndarray to image.Image
----------------------

To go in the opposite direction, pass an ``ndarray`` as the first
argument to :py:class:`image.Image`::

   image.Image(arr, *, buffer=None, copy_to_fb=False)

The constructor infers the geometry and pixel format from the
ndarray's shape:

* shape ``(h, w)``     -> ``GRAYSCALE`` image.
* shape ``(h, w, 3)``  -> ``RGB565`` image.

The ``ndarray`` must have ``dtype=np.float`` (the constructor only
supports the ``float`` dtype today). Values are rounded and clamped
to ``0..255``.

``buffer=`` lets you supply a pre-allocated ``bytearray`` to hold
the resulting image. ``copy_to_fb=True`` writes the result into the
framebuffer, which is the right choice if you want OpenMV IDE to
display the result.

Round trip example::

   import csi
   import image
   from ulab import numpy as np

   csi0 = csi.CSI()
   csi0.reset()
   csi0.pixformat(csi.GRAYSCALE)
   csi0.framesize(csi.QVGA)
   csi0.snapshot(time=2000)

   img = csi0.snapshot()

   # Pull pixels in as float so we can do real arithmetic.
   a = img.to_ndarray('f')

   # Custom processing: gamma correction in float space.
   gamma = 0.5
   a = 255.0 * (a / 255.0) ** gamma

   # Wrap the modified pixels back into a displayable image.
   out = image.Image(a, copy_to_fb=True)

A simple worked example
-----------------------

Here is a slightly more interesting example that subtracts a running
average from each new frame to highlight motion. Because we use
``numpy``, the math is just a couple of lines::

   import csi
   import image
   from ulab import numpy as np

   csi0 = csi.CSI()
   csi0.reset()
   csi0.pixformat(csi.GRAYSCALE)
   csi0.framesize(csi.QQVGA)                      # 160 x 120
   csi0.snapshot(time=2000)

   bg = csi0.snapshot().to_ndarray('f')           # initial background

   while True:
       img   = csi0.snapshot()
       frame = img.to_ndarray('f')

       diff  = np.abs(frame - bg)                 # absolute difference
       bg    = bg * 0.95 + frame * 0.05           # slow background update

       image.Image(diff, copy_to_fb=True)         # show it

When to use this and when *not* to
----------------------------------

This bridge is most useful when:

* You need a *generic* image-processing operation that the built-in
  ``image`` module doesn't provide (custom filters, custom blends,
  unusual non-linearities).
* You are integrating with code that was originally written against
  CPython ``numpy``.
* You want to combine pixel data with non-image data (IMU, ToF
  depth, audio) in a single computation.

It is **not** the right choice for high-throughput pixel processing.
The built-in ``image`` methods (``image.find_blobs``,
``image.gaussian``, ``image.binary``, ``image.morph``, ...) operate
directly on the framebuffer in the camera's native pixel format and
are much faster than the equivalent ``numpy`` expression. Use the
bridge for the operations the image library doesn't already provide.

References
----------

* :py:meth:`image.Image.to_ndarray` -- full method reference.
* :py:class:`image.Image` -- the image constructor.
* :doc:`/library/omv.image.Image` -- complete ``image.Image``
  documentation.
* :doc:`/library/omv.ulab.numpy` -- ``numpy`` API reference.
