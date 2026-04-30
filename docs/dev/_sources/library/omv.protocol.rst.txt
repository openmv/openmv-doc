:mod:`protocol` --- OpenMV Protocol Channels
============================================

.. module:: protocol
   :synopsis: OpenMV protocol channel framework.

The ``protocol`` module exposes the OpenMV host protocol to Python. It allows
the firmware-side protocol stack to be initialized and configured, and lets
user code register custom logical channels backed by a Python object that
implements the channel interface (``read``, ``write``, ``size``, ``poll``,
etc.).

Example::

    import protocol
    from protocol import CBORChannel

    protocol.init()

    def on_read(ch):
        ch["temp"] = read_temp()

    def on_write(ch, name, value):
        if name == "mirror":
            set_mirror(value)

    ch = CBORChannel(on_read=on_read, on_write=on_write)
    ch.add("temp", type="label", unit="Cel")
    ch.add("mirror", type="toggle")

    handle = protocol.register(name="sensors", backend=ch)

Functions
---------

.. function:: init(crc: bool = True, seq: bool = True, ack: bool = True, events: bool = True, max_payload: int = OMV_PROTOCOL_MAX_PAYLOAD_SIZE, rtx_retries: int = OMV_PROTOCOL_DEF_RTX_RETRIES, rtx_timeout_ms: int = OMV_PROTOCOL_DEF_RTX_TIMEOUT_MS, lock_interval_ms: int = OMV_PROTOCOL_MIN_LOCK_INTERVAL_MS, poll_ms: int = 0) -> None

   Initialize the protocol stack and register the default logical data
   channels (``stdin``, ``stdout``, ``stream`` and, if compiled in,
   ``profile``). Raises ``RuntimeError`` if initialization fails.

   ``crc`` enables CRC validation on protocol frames.

   ``seq`` enables sequence number tracking.

   ``ack`` enables per-frame acknowledgements.

   ``events`` enables channel event notifications.

   ``max_payload`` is the maximum payload size in bytes.

   ``rtx_retries`` is the number of retransmission attempts.

   ``rtx_timeout_ms`` is the retransmission timeout in milliseconds.

   ``lock_interval_ms`` is the minimum lock interval in milliseconds.

   ``poll_ms`` is the polling interval in milliseconds (``0`` disables timer
   polling).

.. function:: is_active() -> bool

   Return ``True`` if a host is currently connected and the protocol stack
   is active, otherwise ``False``.

.. function:: register(name: str, backend: object, flags: int = 0) -> ProtocolChannel

   Register a Python ``backend`` object as a new logical channel and return
   a `ProtocolChannel` handle. The ``backend`` object's available methods
   (see :ref:`protocol-backend-interface` below) determine the channel's
   capabilities; `protocol.CHANNEL_FLAG_READ`, `protocol.CHANNEL_FLAG_WRITE`
   and `protocol.CHANNEL_FLAG_LOCK` are added to ``flags`` automatically
   when the corresponding methods are implemented.

   ``name`` is the channel name as a string. Truncated to the firmware's
   channel-name buffer size.

   ``backend`` is the Python object implementing the backend interface.

   ``flags`` is additional channel flag bits (see the ``CHANNEL_FLAG_*``
   constants).

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
      :noindex:

      Called once when the channel is initialized. Return any non-``None``
      value on success; an exception or missing return is treated as an error.

   .. method:: poll() -> bool
      :noindex:

      Return ``True`` if the channel has data ready to be read by the host.

   .. method:: lock() -> bool
      :noindex:

      Acquire the channel for a transfer. Return ``True`` on success.

   .. method:: unlock() -> bool
      :noindex:

      Release the channel after a transfer. Return ``True`` on success.

   .. method:: size() -> int
      :noindex:

      Return the number of bytes currently readable from the channel.

   .. method:: shape() -> tuple
      :noindex:

      Return a tuple of up to four integers describing the data shape (e.g.
      image dimensions). Up to four elements are consumed by the protocol
      layer.

   .. method:: flush() -> object
      :noindex:

      Flush any pending data. Return any non-``None`` value on success.

   .. method:: read(offset: int, size: int) -> bytes
      :noindex:

      Return up to ``size`` bytes starting at ``offset`` as a ``bytes``-like
      object that supports the buffer protocol.

   .. method:: readp(offset: int, size: int) -> bytes
      :noindex:

      Zero-copy variant of ``read``. Returns a buffer whose underlying memory
      is read directly by the protocol layer; the buffer must remain valid
      for the duration of the transfer.

   .. method:: write(offset: int, data: bytearray) -> int
      :noindex:

      Write ``data`` at ``offset``. ``data`` is a ``bytearray`` referencing
      the C buffer directly. Return the number of bytes written, or ``0`` on
      default success.

   .. method:: ioctl(cmd: int, length: int, arg: bytearray | None) -> int
      :noindex:

      Handle an ioctl. ``arg`` is ``None`` if ``length`` is zero, otherwise a
      ``bytearray`` referencing the C buffer. Return ``0`` or ``None`` on
      success, or a negative integer on error.

   .. method:: is_active() -> bool
      :noindex:

      For transport channels, return ``True`` if the underlying transport is
      currently connected.

.. class:: CBORChannel(on_read: Callable | None = None, on_write: Callable | None = None)

   A higher-level Python backend (provided by the frozen ``protocol``
   package) that serializes named fields to CBOR using SenML-compatible
   integer keys. Supports display widgets (``label``, ``depth``) and
   interactive controls (``toggle``, ``slider``, ``select``) with
   ``on_read``/``on_write`` callbacks.

   ``on_read`` is an optional callable ``on_read(channel)`` invoked before
   the channel is serialized for the host. Use it to refresh field values.

   ``on_write`` is an optional callable ``on_write(channel, name, value)``
   invoked when the host writes a new value for a named field.

   .. method:: add(name: str, type: str, value: Any = None, unit: str | None = None, min: int | float | None = None, max: int | float | None = None, step: int | float | None = None, options: list | None = None, width: int | None = None, height: int | None = None) -> None

      Add a named field to the channel.

      ``name`` is the display name; must be unique within this channel.

      ``type`` is the widget type: ``"label"``, ``"toggle"``, ``"slider"``,
      ``"select"``, or ``"depth"``.

      ``value`` is the initial value. The default depends on ``type``.

      ``unit`` is the unit string for ``label``/``slider`` (e.g. ``"Cel"``,
      ``"%RH"``).

      ``min`` is the minimum value (slider range or depth range).

      ``max`` is the maximum value (slider range or depth range).

      ``step`` is the step size (slider).

      ``options`` is the list of option strings (select).

      ``width`` is the pixel width (depth).

      ``height`` is the pixel height (depth).

   .. method:: __getitem__(name: str) -> object

      Return the current value of the named field. For ``depth`` fields
      the binary data buffer is returned, otherwise the scalar value.

   .. method:: __setitem__(name: str, value: Any) -> None

      Set the value of the named field. For ``slider`` fields, a
      ``(min, max, value)`` tuple updates the range and current value
      simultaneously. For ``depth`` fields, ``value`` is the binary data
      buffer.

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
