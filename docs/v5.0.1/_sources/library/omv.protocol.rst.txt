:mod:`protocol` --- OpenMV Protocol Channels
============================================

.. module:: protocol
   :synopsis: OpenMV protocol channel framework.

The ``protocol`` module exposes the OpenMV host protocol to Python. It allows
the firmware-side protocol stack to be initialized and configured, and lets
user code register custom logical channels backed by a Python object that
implements the channel interface (``read``, ``write``, ``size``, ``poll``,
etc.). This is what desktop companion tools talk to when they stream image
data or expose interactive widgets to a connected camera.

Examples
--------

Stream an RGB565 image to a host tool using a custom backend that
implements the raw channel interface (:meth:`backend.size`,
:meth:`backend.shape`, :meth:`backend.poll`, :meth:`backend.read`)::

    import csi
    import protocol

    csi0 = csi.CSI()
    csi0.reset()
    csi0.pixformat(csi.RGB565)
    csi0.framesize(csi.HD)

    img = csi0.snapshot()
    img_mv = memoryview(img.bytearray())
    frame_ready = True


    class FrameChannel:
        def size(self):
            return len(img_mv)

        def shape(self):
            return (img.height(), img.width(), len(img_mv))

        def poll(self):
            return frame_ready

        def read(self, offset, size):
            global frame_ready
            end = offset + size
            chunk = img_mv[offset:end]
            if end >= len(img_mv):
                frame_ready = False
            return chunk


    protocol.register(name="frame", backend=FrameChannel())

    while True:
        if not frame_ready:
            img = csi0.snapshot()
            img_mv = memoryview(img.bytearray())
            frame_ready = True

The matching host-side script, using the `openmv
<https://github.com/openmv/openmv-python>`__ Python package
(``pip install openmv``) to connect, push the on-camera script, and pull
each frame::

    import cv2
    import numpy as np
    from openmv.camera import Camera

    # The on-cam script above, stored as a string (or read from a file).
    SCRIPT = open("frame_streamer_on_cam.py").read()

    with Camera("/dev/ttyACM0", baudrate=921600) as cam:
        cam.stop()
        cam.exec(SCRIPT)

        while True:
            status = cam.read_status()
            if not cam.has_channel("frame") or not status.get("frame"):
                continue

            h, w, size = cam._channel_shape(cam.get_channel(name="frame"))
            if cam.channel_size("frame") < size:
                continue

            data = cam.channel_read("frame", size)
            rgb565 = np.frombuffer(data, dtype="<u2").reshape(h, w)

            # Unpack RGB565 to an HxWx3 uint8 RGB image.
            r = ((rgb565 >> 11) & 0x1F) << 3
            g = ((rgb565 >>  5) & 0x3F) << 2
            b = ( rgb565        & 0x1F) << 3
            frame = np.dstack([r, g, b]).astype(np.uint8)

            # Display with OpenCV (cv2 expects BGR, not RGB).
            cv2.imshow("OpenMV", cv2.cvtColor(frame, cv2.COLOR_RGB2BGR))
            if cv2.waitKey(1) == ord("q"):
                break

    cv2.destroyAllWindows()

Replace ``/dev/ttyACM0`` with the camera's serial port (e.g. ``COM3`` on
Windows). The ``openmv.camera.Camera`` constructor accepts the same protocol
parameters as `init` (``crc`` / ``seq`` / ``ack`` / ``events`` /
``max_payload`` / ``max_retry`` / ``timeout``) when the camera-side stack
has been reconfigured to match.

Functions
---------

.. function:: init(crc: bool = True, seq: bool = True, ack: bool = True, events: bool = True, max_payload: int = ..., rtx_retries: int = 3, rtx_timeout_ms: int = 500, lock_interval_ms: int = 10, poll_ms: int = 0) -> None

   Initialize (or reconfigure) the protocol stack and register the default
   logical data channels (``stdin``, ``stdout``, ``stream`` and, if compiled
   in, ``profile``). Raises ``RuntimeError`` if initialization fails. The
   firmware boots with a default USB protocol stack already running, so
   calling this is needed only to change the transport or override the
   default framing parameters. Calling it again re-initializes the stack:
   the previous polling timer is removed and the channels are registered
   afresh.

   ``crc`` enables CRC validation on protocol frames.

   ``seq`` enables sequence number tracking.

   ``ack`` enables per-frame acknowledgements.

   ``events`` enables channel event notifications.

   ``max_payload`` is the maximum payload size in bytes. If omitted the
   per-camera default below is used; it is derived from each board's
   protocol buffer size as ``buffer - 10 (header) - 4 (CRC)``.

   .. list-table::
      :header-rows: 1
      :widths: 60 20 20

      * - Camera
        - Buffer size
        - Max payload
      * - OpenMV Cam M4 (``OPENMV2``)
        - 512
        - 498
      * - OpenMV Cam M7 (``OPENMV3``)
        - 512
        - 498
      * - OpenMV Cam H7 (``OPENMV4``)
        - 512
        - 498
      * - OpenMV Cam H7 Plus (``OPENMV4P``)
        - 4096
        - 4082
      * - OpenMV Pure Thermal (``OPENMVPT``)
        - 4096
        - 4082
      * - OpenMV Cam RT1062 (``OPENMV_RT1060``)
        - 4096
        - 4082
      * - OpenMV Cam N6 (``OPENMV_N6``)
        - 8192
        - 8178
      * - OpenMV AE3 (``OPENMV_AE3``)
        - 8192
        - 8178
      * - Arduino Portenta H7 (``ARDUINO_PORTENTA_H7``)
        - 4096
        - 4082
      * - Arduino Giga (``ARDUINO_GIGA``)
        - 4096
        - 4082
      * - Arduino Nicla Vision (``ARDUINO_NICLA_VISION``)
        - 4096
        - 4082

   ``rtx_retries`` is the number of retransmission attempts. Default ``3``.

   ``rtx_timeout_ms`` is the retransmission timeout in milliseconds (doubled
   after each timeout). Default ``500``.

   ``lock_interval_ms`` is the minimum lock interval in milliseconds.
   Default ``10``.

   ``poll_ms`` is the polling interval in milliseconds. ``0`` (the default)
   disables timer polling.

.. function:: is_active() -> bool

   Return ``True`` if a host is currently connected and the protocol stack
   is active, otherwise ``False``.

.. function:: poll() -> int

   Run one iteration of the protocol task: drain the transport's receive
   buffer, parse any complete frames, dispatch commands and service channel
   events. The firmware normally does this for you from the USB interrupt
   and from the ``poll_ms`` timer, so this is only needed for custom
   transports that are not driven by either -- for example when
   ``poll_ms=0`` and the transport is polled from the script's main loop.

   Returns ``0`` on success and ``-1`` if no active transport is registered
   or the call was made from an interrupt context.

.. function:: register(name: str, *, backend: object, flags: int = 0) -> ProtocolChannel

   Register a Python ``backend`` object as a new logical channel and return
   a `ProtocolChannel` handle. The ``backend`` object's available methods
   (see :ref:`protocol-backend-interface` below) determine the channel's
   capabilities; `protocol.CHANNEL_FLAG_READ`, `protocol.CHANNEL_FLAG_WRITE`
   and `protocol.CHANNEL_FLAG_LOCK` are added to ``flags`` automatically
   when the corresponding methods are implemented.

   ``name`` is the channel name as a string. Truncated to the firmware's
   channel-name buffer size. **Required.**

   ``backend`` is the Python object implementing the backend interface.
   **Required.** Typically passed by keyword (``backend=...``).

   ``flags`` is additional channel flag bits (see the ``CHANNEL_FLAG_*``
   constants). Optional; defaults to ``0``.

   Raises ``RuntimeError`` if the channel cannot be registered (e.g. no
   free channel slots).

Classes
-------

.. class:: ProtocolChannel

   Handle returned by `protocol.register`. Instances are not constructed
   directly.

   .. method:: send_event(event: int, wait_ack: bool = False) -> None

      Send a channel event notification to the host.

      ``event`` is the event identifier (integer).

      ``wait_ack`` if ``True`` blocks until the host acknowledges the event.

      Raises ``RuntimeError`` if sending the event fails.

.. _protocol-backend-interface:

Backend Interface
-----------------

A backend object passed to `protocol.register` may implement any subset of
the following methods. Only the methods present on the object are wired to
the C protocol layer; missing methods leave the corresponding capability
disabled.

.. class:: backend

   Channel backend object passed to `protocol.register`. The methods below
   describe the optional interface a Python backend may implement.

   .. method:: init() -> object

      Called once when the channel is initialized. Return any non-``None``
      value on success; an exception or missing return is treated as an error.

   .. method:: poll() -> bool

      Return ``True`` if the channel has data ready to be read by the host.

   .. method:: lock() -> bool

      Acquire the channel for a transfer. Return ``True`` on success.

   .. method:: unlock() -> bool

      Release the channel after a transfer. Return ``True`` on success.

   .. method:: size() -> int

      Return the number of bytes currently readable from the channel.

   .. method:: shape() -> tuple

      Return a tuple of up to four integers describing the data shape (e.g.
      image dimensions). Up to four elements are consumed by the protocol
      layer.

   .. method:: flush() -> object

      Flush any pending data. Return any non-``None`` value on success.

   .. method:: read(offset: int, size: int) -> bytes

      Return up to ``size`` bytes starting at ``offset`` as a ``bytes``-like
      object that supports the buffer protocol.

   .. method:: readp(offset: int, size: int) -> bytes

      Zero-copy variant of ``read``. Returns a buffer whose underlying memory
      is read directly by the protocol layer; the buffer must remain valid
      for the duration of the transfer.

   .. method:: write(offset: int, data: bytearray) -> int

      Write ``data`` at ``offset``. ``data`` is a ``bytearray`` referencing
      the C buffer directly. Return the number of bytes written, or ``0`` on
      default success.

   .. method:: ioctl(cmd: int, length: int, arg: bytearray | None) -> int

      Handle an ioctl. ``arg`` is ``None`` if ``length`` is zero, otherwise a
      ``bytearray`` referencing the C buffer. Return ``0`` or ``None`` on
      success, or a negative integer on error.

   .. method:: is_active() -> bool

      For transport channels, return ``True`` if the underlying transport is
      currently connected.

.. class:: CBORChannel(on_read: Callable | None = None, on_write: Callable | None = None)

   A higher-level Python backend (provided by the frozen ``protocol``
   package) that serializes named fields to CBOR using SenML-compatible
   integer keys. Supports display widgets (``label``, ``text``, ``depth``,
   ``waveform``) and interactive controls (``toggle``, ``pushbutton``,
   ``slider``, ``spinbox``, ``select``, ``radio``, ``lineedit``) with
   ``on_read``/``on_write`` callbacks.

   ``on_read`` is an optional callable ``on_read(channel)`` invoked before
   the channel is serialized for the host. Use it to refresh field values.

   ``on_write`` is an optional callable ``on_write(channel, name, value)``
   invoked when the host writes a new value for a named field.

   .. method:: add(name: str, type: str, value: Any = None, unit: str | None = None, min: int | float | None = None, max: int | float | None = None, step: int | float | None = None, options: list | None = None, width: int | None = None, height: int | None = None, sample_rate: float | None = None, series: int = 1, typecode: str | None = None) -> None

      Add a named field to the channel.

      ``name`` is the display name; must be unique within this channel.

      ``type`` is the widget type:

      * ``"label"`` -- read-only numeric display with an optional ``unit``.
      * ``"text"`` -- read-only string display.
      * ``"toggle"`` -- boolean switch.
      * ``"pushbutton"`` -- momentary action (trigger, calibrate, ...). The
        host writes ``True`` on click and renders no state.
      * ``"slider"`` -- numeric control with ``min``/``max``/``step``.
      * ``"spinbox"`` -- precise stepped numeric entry; shares the slider
        fields and the ``(min, max, value)`` tuple update form.
      * ``"select"`` -- drop-down of ``options`` strings.
      * ``"radio"`` -- ``options`` rendered as a group of radio buttons.
      * ``"lineedit"`` -- writable string input.
      * ``"depth"`` -- 2D depth-map display of ``width`` x ``height``.
      * ``"waveform"`` -- 1D time-series plot of interleaved samples.

      ``value`` is the initial value. The default depends on ``type``:
      ``0`` for ``label``, ``""`` for ``text``/``lineedit``/``select``/
      ``radio``, ``False`` for ``toggle``/``pushbutton``, ``min`` for
      ``slider``/``spinbox``.

      ``unit`` is the unit string for ``label``/``slider``/``spinbox``/
      ``waveform`` (e.g. ``"Cel"``, ``"%RH"``).

      ``min`` is the minimum value (slider/spinbox range, or depth/waveform
      display range).

      ``max`` is the maximum value (slider/spinbox range, or depth/waveform
      display range).

      ``step`` is the step size (slider/spinbox).

      ``options`` is the list of option strings (select/radio), or the list
      of per-series names (waveform).

      ``width`` is the pixel width (depth).

      ``height`` is the pixel height (depth).

      ``sample_rate`` is the sample rate in samples per second (waveform).
      Sent to the host as the sample period.

      ``series`` is the number of interleaved series in each sample block
      (waveform), e.g. ``3`` for an XYZ accelerometer trace.

      ``typecode`` is the :mod:`array` typecode of the waveform samples
      (e.g. ``"H"``, ``"h"``, ``"f"``). Defaults to ``"H"`` (unsigned 16-bit).

   .. method:: __getitem__(name: str) -> object

      Return the current value of the named field. For ``depth`` and
      ``waveform`` fields the binary data buffer is returned, otherwise the
      scalar value.

   .. method:: __setitem__(name: str, value: Any) -> None

      Set the value of the named field. For ``slider`` and ``spinbox``
      fields, a ``(min, max, value)`` tuple updates the range and current
      value simultaneously. For ``depth`` fields, ``value`` is the binary
      data buffer. For ``waveform`` fields, ``value`` is a bytes-like block
      of interleaved samples in the field's ``typecode``; the samples-per-
      series count is derived from its length and a monotonic timestamp (in
      microseconds, accumulated from :func:`time.ticks_us`) is attached so
      the host can place the chunk on its time axis.

   .. method:: poll() -> bool

      Backend interface method. Returns ``True`` when serialized data is
      available for the host.

   .. method:: size() -> int

      Backend interface method. Invokes ``on_read`` (if set) and returns
      the size of the serialized buffer.

   .. method:: read(offset: int, size: int) -> bytes

      Backend interface method. Returns a slice of the serialized buffer.

   .. method:: write(offset: int, data: bytearray) -> int

      Backend interface method. Decodes a CBOR update list and applies
      values to matching named fields, invoking ``on_write`` for each.

Constants
---------

Channel flag bits (combined bitwise; passed to `protocol.register` via
``flags`` or set automatically based on the backend's methods).

.. data:: CHANNEL_FLAG_READ
   :type: int

   The channel supports reads.

.. data:: CHANNEL_FLAG_WRITE
   :type: int

   The channel supports writes.

.. data:: CHANNEL_FLAG_LOCK
   :type: int

   The channel implements ``lock``/``unlock``.

.. data:: CHANNEL_FLAG_PHYSICAL
   :type: int

   The channel represents a physical transport (as opposed to a logical
   data channel).

Built-in channel identifiers.

.. data:: CHANNEL_ID_TRANSPORT
   :type: int

   Reserved channel ID for the active transport.

.. data:: CHANNEL_ID_STDIN
   :type: int

   Channel ID of the built-in ``stdin`` channel.

.. data:: CHANNEL_ID_STDOUT
   :type: int

   Channel ID of the built-in ``stdout`` channel.

.. data:: CHANNEL_ID_STREAM
   :type: int

   Channel ID of the built-in ``stream`` channel.

.. data:: CHANNEL_ID_PROFILE
   :type: int

   Channel ID of the built-in profiler channel (only present when the
   firmware is built with the profiler enabled).
