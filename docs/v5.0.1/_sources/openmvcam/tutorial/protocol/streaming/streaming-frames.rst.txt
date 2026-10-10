Streaming frames
================

The most common real use of a custom channel is streaming image
frames from the cam to a host program at the cam's frame rate. The
mechanics are subtler than they look: a JPEG can run to 25 KB or
more, so the host reads it as several fragments, and the cam's
capture loop must be prevented from overwriting the buffer
mid-read. The right pattern -- shown here and used by the tools in
``openmv-projects/tools/`` -- *latches* the buffer until the host
finishes pulling the last byte.

The cam side
------------

A frame channel that captures into a single framebuffer, latches it
on the host's first read, and only takes the next snapshot once the
host has consumed the full image::

   import csi
   import protocol

   csi0 = csi.CSI()
   csi0.reset()
   csi0.pixformat(csi.RGB565)
   csi0.framesize(csi.QVGA)
   csi0.framebuffers(1)

   img = csi0.snapshot()
   img.compress(quality=85)
   img_mv = memoryview(img.bytearray())
   img_size = len(img_mv)
   frame_available = True


   class FrameChannel:
       def poll(self):
           return frame_available

       def size(self):
           return img_size

       def readp(self, offset, size):
           global frame_available
           end = offset + size
           mv = img_mv[offset:end]
           if end == img_size:
               # Host has just read the last byte of this frame --
               # release the buffer so the capture loop can refresh.
               frame_available = False
           return mv


   ch = protocol.register(name='frame', backend=FrameChannel())

   while True:
       if not frame_available:
           img = csi0.snapshot()
           img.compress(quality=85)
           img_mv = memoryview(img.bytearray())
           img_size = len(img_mv)
           frame_available = True
           ch.send_event(0x01)   # notify host that a new frame is ready

Four pieces are doing real work here:

* ``frame_available`` is the *latch*. The capture loop only takes a
  new snapshot when it is :data:`False` -- meaning the host has
  pulled the last byte of the previous frame. The host's read sets
  it back to :data:`False` from inside ``readp`` once the final
  offset has been served. Without this guard, the next
  ``csi0.snapshot()`` would overwrite the buffer mid-read and the
  host would receive a frame stitched together from two captures.
* ``readp`` rather than ``read`` is what the backend implements.
  The protocol library treats the returned buffer as authoritative
  and reads its bytes directly into the outgoing packet -- no copy.
  For frame-sized payloads ``readp`` is noticeably faster than
  ``read``, which forces an intermediate copy.
* ``size`` returns the cached JPEG length without recomputing
  anything; the capture loop maintains it whenever it refreshes the
  buffer. The host calls ``size`` between ``poll`` and ``readp`` to
  know how many bytes to pull.
* :meth:`~protocol.ProtocolChannel.send_event` notifies the host
  the instant a new frame lands so it can begin pulling without
  polling. The event ID ``0x01`` is application-defined ("frame
  ready" in this case); use a different small integer for each
  kind of notification.

Fragmentation
-------------

QVGA RGB565 at JPEG quality 85 compresses to roughly 10-25 KB,
depending on the scene -- much bigger than the negotiated max
payload on any cam (see the per-board table in
:func:`protocol.init`). One JPEG read won't fit in one packet, and
that's fine, because the protocol library fragments it
transparently.

When the host asks for ``channel_read('frame', 12000)``:

1. The cam's ``readp`` is called *once* with ``offset=0`` and the
   full 12000-byte request. It returns one memoryview covering the
   whole range.
2. The protocol library breaks that memoryview into max-payload-
   sized fragments on the wire, one ``CHANNEL_READ`` reply packet
   per fragment, each with its own header and CRC. The bytes are
   streamed out of the backend's buffer directly -- no copy.
3. The host receives the fragments in order, the reliability layer
   retransmits any one chunk that fails its CRC, and the host SDK
   glues the chunks into the 12000-byte result returned to the
   caller.

.. note::

   This is the key practical difference between ``readp`` and
   ``read``. ``readp`` is called *once per host request*; the
   protocol layer fragments and transmits out of the single
   returned buffer. ``read`` is called *once per fragment*, and
   the library copies each returned chunk into its own packet
   buffer. For frame-sized payloads ``readp`` saves both the
   per-fragment Python-level call overhead and the copy.

.. tip::

   Want to see the gap for yourself? Rename the backend's
   ``readp`` method to ``read`` -- nothing else changes; the
   library will pick up the ``read`` capability instead -- and
   compare the host's frame-rate counter before and after. The
   slower number is the per-fragment copy and Python-call cost
   you avoid by using ``readp``.

The latch in ``FrameChannel.readp`` releases the buffer when
``offset + size == img_size`` -- the moment the host has pulled
the last byte. Until then, the buffer must stay valid, which is
why the capture loop only takes the next snapshot once
``frame_available`` flips back to :data:`False`.

The host side
-------------

The host pulls frames in a tight loop::

   import io
   from PIL import Image
   from openmv.camera import Camera

   with Camera('/dev/ttyACM0', baudrate=921600) as cam:
       cam.update_channels()

       while True:
           size = cam.channel_size('frame')
           if not size:
               continue
           data = cam.channel_read('frame', size)
           img = Image.open(io.BytesIO(data))
           img.show()                  # or feed to a GUI

The :meth:`~openmv.camera.Camera.channel_size` call doubles as a
"is anything ready" check -- zero means the cam hasn't captured
yet -- so the loop skips read attempts on an empty buffer. For
GUI applications that already poll on a timer, this is the natural
pattern.

Pillow's ``Image.open`` decodes the JPEG; the cam already
JPEG-compressed it so the host doesn't have to redo expensive
bit-packing on RGB565. The host script could just as easily save
the bytes to disk, hand them to OpenCV, or push them through a web
view.

Throughput thinking
-------------------

Three things bound the achievable frame rate:

* The cam's capture rate. The protocol can't deliver frames faster
  than the sensor produces them; whatever cap the chosen pixel
  format and frame size impose on capture is the ceiling.
* The negotiated max payload. Bigger payloads mean fewer fragments
  per frame and less framing overhead, so cams with larger protocol
  buffers move bytes faster than smaller ones.
* CRC and ACK overhead. Each packet costs 14 bytes of framing plus
  one ACK round-trip. For long fragments the per-payload overhead
  is small; for tiny payloads it dominates.

For most cam-to-laptop GUI work the limiting factor is the cam's
capture and JPEG compression time, not the protocol stack. Where
the protocol does become the bottleneck -- streaming uncompressed
raw frames at high frame rates, for example -- the levers are
turning off ACKs (``protocol.init(ack=False)``), increasing the
protocol buffer if the cam supports it, or capturing in GRAYSCALE
so each compressed JPEG carries one channel instead of three and
the encoded frame ends up noticeably smaller on the wire.

The frame channel is the canonical cam-to-host data flow. The same
backend interface, with a ``write`` method added, lets the host
push data the other way too -- which is what an interactive cam
tool needs as soon as the operator wants to *change* something
rather than just watch.
