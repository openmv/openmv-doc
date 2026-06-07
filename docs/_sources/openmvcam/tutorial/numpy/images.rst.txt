Images and ndarrays
===================

This page closes the loop the section opened with. The
:class:`~image.Image` class is the fast surface for
camera-native pixel work: every method on it operates
directly on the frame buffer in the camera's native
pixel format. :mod:`numpy` is the generic numerical
surface for everything else. Two methods bridge them:

* :meth:`image.Image.to_ndarray` -- view or copy the
  pixels of an image as an :class:`~ulab.numpy.ndarray`.
* The :class:`image.Image` constructor -- build a
  fresh image from an :class:`~ulab.numpy.ndarray`.

Together they let an application snap a frame, hand it
to :mod:`numpy` for a custom transform, then put the
result back into an image to display, save, or feed
back into the rest of the image library.

Image to ndarray
----------------

:meth:`~image.Image.to_ndarray` returns an
:class:`~ulab.numpy.ndarray` whose data come from the
image's pixel buffer. The signature is
``to_ndarray(dtype, *, buffer=None)``, and the output
shape depends on the image format:

* **GRAYSCALE** -- 2-D array, shape ``(height, width)``.
* **RGB565** -- 3-D array, shape ``(height, width, 3)``,
  planes in R/G/B order.

The ``dtype`` argument controls how each 8-bit pixel
value ``v`` is mapped:

=========  ===========  =======================================
``dtype``  element      mapping for an 8-bit pixel value ``v``
=========  ===========  =======================================
``'B'``    ``uint8``    ``v`` (raw)
``'b'``    ``int8``     ``v - 128`` (re-centred around zero)
``'f'``    ``float32``  ``float(v)`` (0.0 ... 255.0)
=========  ===========  =======================================

Example -- view a grayscale frame as a ``uint8`` matrix::

    import csi
    from ulab import numpy as np

    csi0 = csi.CSI()
    csi0.reset()
    csi0.pixformat(csi.GRAYSCALE)
    csi0.framesize(csi.QVGA)

    img = csi0.snapshot()
    a   = img.to_ndarray('B')        # shape (240, 320), dtype=uint8

    print(a.shape, a.dtype)
    print("mean brightness:", np.mean(a))

The ``buffer=`` keyword lets the application reuse a
:class:`bytearray` it already allocated, so the cam
does not have to allocate a new one every frame::

    buf = bytearray(320 * 240)
    while True:
        img = csi0.snapshot()
        a   = img.to_ndarray('B', buffer=buf)
        # ... process a ...

ndarray to image
----------------

Going the other way, pass the
:class:`~ulab.numpy.ndarray` as the first argument to
:class:`image.Image`::

    image.Image(arr, *, buffer=None, copy_to_fb=False)

The constructor infers the geometry and pixel format
from the array's shape:

* shape ``(h, w)``    -- ``GRAYSCALE`` image.
* shape ``(h, w, 3)`` -- ``RGB565`` image.

The :class:`~ulab.numpy.ndarray` must have dtype
:class:`~ulab.numpy.float`; the constructor only
supports that case today. Values are rounded and
clamped to the ``0..255`` range.

``buffer=`` lets the application supply a
:class:`bytearray` it already allocated for the
resulting image. ``copy_to_fb=True`` writes the result
into the camera's frame buffer, which is the right
choice when the result should appear in the IDE
preview.

Round trip
----------

::

    import csi
    import image
    from ulab import numpy as np

    csi0 = csi.CSI()
    csi0.reset()
    csi0.pixformat(csi.GRAYSCALE)
    csi0.framesize(csi.QVGA)

    img = csi0.snapshot()
    a   = img.to_ndarray('f')                  # work in float space

    a = 255.0 * (a / 255.0) ** 0.5             # gamma correction

    out = image.Image(a, copy_to_fb=True)      # back to an image

When to bridge
--------------

This bridge is the right answer when the application
needs a *generic* numerical operation the built-in
:mod:`image` methods do not provide -- custom filters,
custom blends, unusual non-linearities -- or when pixel
data has to be combined with non-image data (IMU, ToF
depth, audio) in a single computation.

It is **not** the right answer for high-throughput
pixel processing the :class:`~image.Image` class
already covers. The built-in methods operate directly
on the frame buffer in the camera's native pixel format
and are much faster than the equivalent :mod:`numpy`
expression. Reach for the bridge for the operations
the image library does not already provide.
