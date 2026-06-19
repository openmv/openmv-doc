Streaming frames
================

A script that captures frames on the cam can stream
each frame back to the host over USB. The pattern is
two calls on the :class:`openmv.Camera` instance:
:meth:`~openmv.Camera.streaming` to turn the stream on
or off, and :meth:`~openmv.Camera.read_frame` to pull
the next frame out of the channel.

A minimal stream-and-display loop
---------------------------------

The cam-side script is the usual snapshot loop; what is
new is that the host opens streaming and reads the
result back::

    from openmv import Camera

    script = """
    import csi
    csi0 = csi.CSI()
    csi0.reset()
    csi0.pixformat(csi.RGB565)
    csi0.framesize(csi.QVGA)
    while True:
        csi0.snapshot()
    """

    with Camera('/dev/ttyACM0') as cam:
        cam.stop()
        cam.exec(script)
        cam.streaming(True)

        while True:
            if frame := cam.read_frame():
                print(f"{frame['width']}x{frame['height']}, "
                      f"{frame['raw_size']} bytes")

The cam captures frames continuously; the host pulls
each one out of the stream buffer as it lands. The cam
overwrites the stream buffer on every new snapshot, so
a host that polls slower than the cam captures will
silently drop frames -- that is the right behaviour for
viewer-style use cases.

The frame dict
--------------

:meth:`~openmv.Camera.read_frame` returns either
:data:`None` (no frame is waiting) or a :class:`dict`
with five entries:

==============  ====================================================
Key             Meaning
==============  ====================================================
``width``       Frame width in pixels.
``height``      Frame height in pixels.
``format``      Pixel-format identifier the cam declared (an integer
                from the cam's :data:`csi` constants).
``depth``       For compressed formats (JPEG, PNG), the size of the
                compressed image in bytes. Unused for uncompressed
                formats.
``data``        The frame as a :class:`bytes` buffer in **RGB888**.
                Each pixel is three bytes ``(R, G, B)``; total length
                is ``width * height * 3``.
``raw_size``    Bytes the cam sent over USB before decode. Useful
                for the actual throughput calculation.
==============  ====================================================

The package converts the cam's native format
(``GRAYSCALE``, ``RGB565``, ``JPEG``) to RGB888 before
returning, so the host never has to deal with the
bit-packed RGB565 or JPEG-decompression path itself.
Grayscale frames come back with the luma value
replicated into all three channels.

The ``data`` buffer is laid out row-by-row, top to
bottom; feeding it straight to a display library or
saving it as a raw RGB file works without any further
shuffling.

Raw streaming mode
------------------

By default the cam JPEG-compresses each captured
frame before placing it in the stream channel and
:meth:`~openmv.Camera.read_frame` decompresses on the
host. On cams without hardware JPEG support, the
software compression is the slowest step in the loop.
Passing ``raw=True`` skips it::

    cam.streaming(True, raw=True, resolution=(320, 240))

The cam then sends the pixel buffer uncompressed.
Uncompressed frames are much larger than their JPEG
equivalents, so the cam scales each captured frame
down to fit the stream channel before sending it; the
``resolution=(width, height)`` argument sets that
target. The host still receives RGB888 in the
``data`` field -- the package converts from whatever
pixel format the cam reported in ``format``.

Letting events drive the loop
-----------------------------

A polling loop that calls
:meth:`~openmv.Camera.read_frame` faster than the cam
produces frames spends most of its time getting
:data:`None` back. When the host also has other work to
do (a UI to update, other channels to poll),
:meth:`~openmv.Camera.read_status` is the cheaper
check: it returns a dict mapping every registered
channel name to a boolean of "data is ready"::

    while True:
        status = cam.read_status()

        if status.get('stream'):
            frame = cam.read_frame()
            # ... process the frame ...

        if status.get('stdout'):
            text = cam.read_stdout()
            print(text, end='')

        if status.get('my_channel'):
            data = cam.channel_read('my_channel')
            # ... process custom-channel data ...

This is the loop shape the CLI viewer itself uses.

Stopping the stream
-------------------

Call :meth:`~openmv.Camera.streaming` with ``enable=False``
to stop. The cam keeps running its script but no longer
fills the stream buffer; :meth:`~openmv.Camera.read_frame`
just returns :data:`None` from that point on. Calling
:meth:`~openmv.Camera.stop` does the same thing
implicitly by halting the script.
