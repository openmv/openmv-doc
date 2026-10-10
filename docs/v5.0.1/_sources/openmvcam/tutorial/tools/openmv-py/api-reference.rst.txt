API reference
=============

The public surface of the ``openmv`` package is the
:class:`Camera` class for talking to a cam and the
:class:`OMVException` hierarchy for protocol errors.
Both are documented on this page.

.. py:currentmodule:: openmv

The Camera class
----------------

.. py:class:: Camera(port: str, *, baudrate: int = 921600, crc: bool = True, seq: bool = True, ack: bool = True, events: bool = True, timeout: float = 1.0, max_retry: int = 3, max_payload: int = 4096, drop_rate: float = 0.0)

   The host-side proxy for an OpenMV cam reached over
   USB serial.

   :param port: Serial device path. On Linux,
                ``/dev/ttyACMx`` for USB CDC and
                ``/dev/ttyUSBx`` for a USB-to-UART
                bridge. On macOS,
                ``/dev/tty.usbmodem...`` or
                ``/dev/cu.usbmodem...``. On Windows,
                ``COMx``.
   :param baudrate: Serial baud rate. Over USB,
                    ``921600`` is the *magic value*
                    that switches the cam from the
                    MicroPython REPL to the OpenMV
                    protocol -- any other value on a
                    USB link leaves the cam in REPL
                    mode, so the default must be used.
                    Over a UART link the value is the
                    actual line baud rate and can be
                    set freely on both sides.
   :param crc: Enable CRC validation on every packet.
   :param seq: Enable per-packet sequence numbers.
   :param ack: Require packet acknowledgement.
   :param events: Enable event notifications from the
                  cam.
   :param timeout: Per-operation timeout in seconds.
   :param max_retry: Number of retries before raising
                     on a failed packet.
   :param max_payload: Maximum negotiated payload size
                       in bytes. The cam may negotiate
                       down.
   :param drop_rate: Test-only probability of dropping
                     a packet, in ``[0.0, 1.0]``. Leave
                     at ``0.0`` in production.

   The class supports the context-manager protocol;
   ``with Camera(port) as cam:`` calls
   :meth:`connect` on entry and :meth:`disconnect` on
   exit.

Connection
----------

.. py:method:: Camera.connect() -> None

   Open the serial port and perform the protocol
   handshake. Cached state (channel list, system info,
   version info) is populated as a side effect. Called
   automatically by the context manager.

.. py:method:: Camera.disconnect() -> None

   Close the serial port and release the transport.
   Called automatically when the context manager
   exits.

.. py:method:: Camera.is_connected() -> bool

   :returns: ``True`` if the serial port is open.

.. py:method:: Camera.reset() -> None

   Reset the cam. The connection is dropped because
   the cam reboots.

.. py:method:: Camera.boot() -> None

   Jump the cam into its bootloader. The connection is
   dropped because the cam reboots.

.. py:method:: Camera.update_capabilities() -> None

   Renegotiate the protocol capabilities (CRC, sequence
   checking, ACKs, events, max payload) with the cam.
   The cam reports the maximum payload it can handle;
   the host's request is clipped to that and the agreed
   settings are pushed back. Called automatically by
   :meth:`connect` -- there is no reason to call it
   from user code unless the constructor flags need to
   be renegotiated on an existing connection.

.. py:method:: Camera.poll_events() -> None

   Run the transport's receive path once to consume any
   pending events from the cam without sending a
   command. Useful in long-running programs that go
   minutes without other I/O and want to surface
   channel-registration events promptly.

Script execution
----------------

.. py:method:: Camera.exec(script: str) -> None

   Upload ``script`` (a Python source string) into the
   cam's stdin buffer and start running it.

   :param script: MicroPython source to execute.

.. py:method:: Camera.stop() -> None

   Interrupt the running script. Equivalent to the
   IDE's Stop button.

.. py:method:: Camera.read_stdout() -> str | None

   Read whatever bytes the running script has written
   to ``stdout`` since the last call.

   :returns: The output as a decoded string, or
             :data:`None` if no data is waiting.

Streaming
---------

.. py:method:: Camera.streaming(enable: bool, raw: bool = False, resolution: tuple[int, int] | None = None) -> None

   Turn the frame stream on or off and pick the
   on-the-wire format.

   :param enable: ``True`` enables streaming, ``False``
                  disables it.
   :param raw: When ``False`` (default), the cam
               JPEG-compresses each frame before placing
               it in the stream channel and
               :meth:`read_frame` decompresses on the
               host. When ``True``, the cam sends the
               captured pixel buffer uncompressed --
               the right choice on cams without
               hardware JPEG support, where software
               compression is the slowest step in the
               loop.
   :param resolution: ``(width, height)`` target the
                      cam scales each raw frame down to
                      before sending, since
                      uncompressed frames are much
                      larger than JPEG-compressed ones.
                      Required when ``raw=True``;
                      ignored otherwise.

.. py:method:: Camera.read_frame() -> dict | None

   Read the latest frame from the stream channel.

   :returns: :data:`None` if no frame is waiting, or a
             dict with keys ``width`` (:class:`int`,
             pixels), ``height`` (:class:`int`,
             pixels), ``format`` (:class:`int`, the
             pixel-format identifier the cam declared),
             ``depth`` (:class:`int`, the compressed
             image size in bytes for JPEG / PNG frames;
             unused for uncompressed formats), ``data``
             (:class:`bytes`, RGB888 of length
             ``width * height * 3``), and ``raw_size``
             (:class:`int`, bytes the cam sent over USB
             before decode).

Custom channels
---------------

.. py:method:: Camera.has_channel(name: str) -> bool

   :returns: ``True`` if a channel registered with
             ``name`` exists on the cam.

.. py:method:: Camera.channel_size(name: str) -> int

   :returns: Number of bytes the named channel
             currently has available, or ``0`` when the
             channel is empty or does not exist.

.. py:method:: Camera.channel_read(name: str, size: int | None = None) -> bytes | None

   Read from a custom channel.

   :param name: Channel name registered by the cam-side
                script.
   :param size: Bytes to read, or :data:`None` to read
                whatever is available.
   :returns: The bytes, or :data:`None` if the channel
             does not exist.

.. py:method:: Camera.channel_write(name: str, data: bytes) -> bool

   Write ``data`` to a custom channel.
   Larger-than-payload writes are automatically split
   across packets.

   :param name: Channel name registered by the cam-side
                script.
   :param data: Bytes-like payload to send.
   :returns: ``True`` if the channel exists and the
             write was sent, ``False`` otherwise.

.. py:method:: Camera.read_status() -> dict[str, bool]

   Poll every registered channel.

   :returns: Dict mapping channel name to a boolean of
             "data is ready to read".

.. py:method:: Camera.update_channels() -> None

   Refresh the cached channel list from the cam. Runs
   automatically the next time a channel-by-name
   lookup is performed after a channel-registration
   event arrives; an application that wants to learn
   a newly-registered channel immediately can call
   this directly.

.. py:method:: Camera.get_channel(name: str | None = None, channel_id: int | None = None) -> int | str | None

   Look up a channel either by name (returning its
   numeric ID) or by ID (returning its name). Refreshes
   the channel cache via :meth:`update_channels` first
   if channel-registration events are pending.

   :param name: Channel name to resolve to an ID.
   :param channel_id: Channel ID to resolve to a name.
   :returns: The corresponding ID or name, or
             :data:`None` when the channel does not
             exist. One of ``name`` or ``channel_id``
             must be supplied.

Device introspection
--------------------

.. py:method:: Camera.version() -> dict

   Return the cam's protocol, bootloader, and firmware
   version triples. Cached after :meth:`connect`. Each
   triple is a ``(major, minor, patch)`` tuple of
   :class:`int`:

   * ``protocol_version`` -- the version of the OpenMV
     wire protocol the cam implements.
   * ``bootloader_version`` -- the bootloader image
     resident in flash.
   * ``firmware_version`` -- the MicroPython firmware
     currently running.

.. py:method:: Camera.system_info() -> dict

   Return the cam's hardware capability and memory
   information. Cached after :meth:`connect`. The
   returned dict's keys fall into four groups.

   **Identity**

   * ``cpu_id`` -- 32-bit CPU identifier.
   * ``device_id`` -- 3-tuple of 32-bit words, the
     unique device serial baked into the silicon.
   * ``chip_id`` -- 3-tuple of 32-bit words, one entry
     per image sensor connected to the cam.
   * ``usb_vid`` -- USB vendor ID.
   * ``usb_pid`` -- USB product ID.

   **Memory sizes** (all in kilobytes)

   * ``flash_size_kb`` -- total internal flash.
   * ``ram_size_kb`` -- total RAM.
   * ``framebuffer_size_kb`` -- RAM reserved for
     image capture.
   * ``stream_buffer_size_kb`` -- RAM reserved for
     the stream channel that ships frames to the
     host.

   **Capability flags** (one boolean per feature, all
   named ``<feature>_present``)

   * ``gpu_present`` -- graphics processing unit.
   * ``npu_present`` -- neural processing unit.
   * ``isp_present`` -- image signal processor.
   * ``venc_present`` -- video encoder.
   * ``jpeg_present`` -- JPEG hardware encoder.
   * ``dram_present`` -- external DRAM.
   * ``crc_present`` -- CRC accelerator.
   * ``pmu_present`` -- performance monitoring unit.
   * ``wifi_present`` -- Wi-Fi radio.
   * ``bt_present`` -- Bluetooth radio.
   * ``sd_present`` -- SD card slot.
   * ``eth_present`` -- Ethernet PHY.
   * ``multicore_present`` -- multiple CPU cores.

   **Other**

   * ``usb_highspeed`` -- boolean, ``True`` when USB
     enumerated in high-speed (USB 2.0 HS, 480 Mbps)
     mode.
   * ``pmu_eventcnt`` -- number of PMU event counters
     available; ``0`` when no PMU.

.. py:method:: Camera.print_system_info() -> None

   Log the formatted system-information block to
   :mod:`logging` at ``INFO`` level. The CLI uses this
   on connection.

Diagnostics
-----------

.. py:method:: Camera.host_stats() -> dict

   :returns: The transport-layer counters tracked on
             the host side: ``sent``, ``received``,
             ``checksum``, ``sequence``.

.. py:method:: Camera.device_stats() -> dict

   :returns: The transport-layer counters tracked on
             the cam side: ``sent``, ``received``,
             ``checksum``, ``sequence``, ``retransmit``,
             ``transport``, ``sent_events``,
             ``max_ack_queue_depth``.

Profiler
--------

The profiler reports per-function call counts and min /
max / total execution times for the instrumented
firmware modules -- currently :mod:`image`, :mod:`ml`,
and :mod:`ulab`. Function entry and exit are
intercepted at compile time; the runtime samples a
monotonic microsecond counter on each, accumulates the
result per function, and exposes the table to the host
through the ``profile`` channel.

The profiler is only built into the firmware when
``PROFILE_ENABLE=1`` is passed to ``make``. Stock
firmware images do not include it -- the
``-finstrument-functions`` flag the build adds to the
tracked modules has non-trivial runtime overhead, so
profiling builds are produced from source for the
specific debugging session that needs them. When the
firmware was not built with the flag, the ``profile``
channel is not registered and every profiler method on
this page returns silently without doing anything.

The Arm *Performance Monitoring Unit* (PMU) is the
Cortex-M55's hardware counter block -- a small set of
configurable counters that track cycle counts, cache
hits and misses, branch behaviour, and other
architecture-defined events without slowing the code
under measurement. On cams that have one -- the AE3
and the N6, the two cams in the OpenMV lineup built
around the M55 -- the profiler samples these counters
alongside the timing data and the event totals show up
in each per-function record. Cams without a PMU still
produce timing records; the event fields come back as
zero, and :meth:`profiler_event` is a no-op.

.. py:method:: Camera.profiler_mode(exclusive: bool = False) -> None

   Switch between inclusive and exclusive timing.
   Inclusive timing charges callees' time to the
   caller; exclusive timing does not.

   :param exclusive: ``True`` selects exclusive
                     timing, ``False`` selects
                     inclusive.

.. py:method:: Camera.profiler_reset(config: list | None = None) -> None

   Clear all profile counters. ``config=None`` also
   restores the default PMU event assignment.

   :param config: Reserved for future per-counter
                  configuration overrides. Pass
                  :data:`None` to keep the defaults.

.. py:method:: Camera.profiler_event(counter_num: int, event_id: int) -> None

   Bind one of the PMU counter slots to a specific
   hardware event.

   :param counter_num: Counter index.
   :param event_id: Architecture-defined event
                    identifier.

.. py:method:: Camera.read_profile() -> list[dict] | None

   Return the per-function profile records collected
   since the last reset. Each record is a dict with
   ``address``, ``caller``, ``call_count``,
   ``min_ticks``, ``max_ticks``, ``total_ticks``,
   ``total_cycles``, and an ``events`` tuple sized to
   the cam's ``pmu_eventcnt``.

   :returns: List of record dicts, or :data:`None` if
             the profile channel is not available or no
             data has been collected.

Subclassing and channel internals
---------------------------------

The methods documented above cover every common use of
the package. A few patterns -- handling cam-side events
the host wants to react to, locking a channel for a
multi-step exchange, talking to channels that carry
shaped data instead of byte streams, or driving
channel-specific control commands -- need methods that
:class:`Camera` keeps prefixed with an underscore.
These names are private *by convention* (Python does
not name-mangle them), and applications that need them
are expected to either subclass :class:`Camera` or call
the methods directly.

**Subclassing to react to events.**
Every event the cam emits arrives through
:meth:`Camera._handle_event`. Subclassing
:class:`Camera` and overriding the method is the way
an application reacts to events its cam-side script
raises; the :doc:`events` page walks the full pattern.

.. py:method:: Camera._handle_event(channel_id: int, event: int) -> None

   Dispatch one event from the cam. Called by the
   transport layer whenever an event packet arrives.
   Override in a subclass to add application-specific
   handling; call ``super()._handle_event(...)`` to
   keep the default behaviour (channel-list
   refresh on ``CHANNEL_REGISTERED``, frame-ready
   tracking on the ``stream`` channel,
   ``stdin``-channel start / stop logging).

   :param channel_id: ``0`` for system events,
                      otherwise the registered channel
                      ID.
   :param event: Event identifier; values come from the
                 :class:`EventType` enum for system
                 events and from whatever the cam-side
                 channel backend chose for channel
                 events.

A subclass that adds its own protocol-talking methods
should decorate them with :meth:`retry_if_failed` so
they inherit the same resync-and-retry behaviour every
shipped method on this page has.

.. py:staticmethod:: Camera.retry_if_failed(func)

   Decorator. Wraps an instance method so that it
   retries once when the transport raises
   :class:`ResyncException`. Any method that calls
   into :meth:`_send_cmd_wait_resp` (directly or
   through one of the ``_channel_*`` wrappers) should
   carry this decorator::

       class MyCamera(Camera):
           @Camera.retry_if_failed
           def my_custom_command(self, payload):
               return self._send_cmd_wait_resp(Opcode.MY_CMD,
                                               0, payload)

**Channel locking** ensures the channel's state does
not change between two related operations (a
:meth:`_channel_size` followed by a
:meth:`_channel_read`, for example, on a channel that
keeps appending data). :meth:`read_frame` and
:meth:`read_profile` use this internally; an
application driving a custom channel with multi-step
access does the same.

.. py:method:: Camera._channel_lock(channel_id: int) -> bool

   Acquire an exclusive lock on a channel. Other host
   operations on the same channel block until the lock
   is released.

   :param channel_id: Numeric channel ID, typically
                      resolved with :meth:`get_channel`.
   :returns: ``True`` when the lock was granted.

.. py:method:: Camera._channel_unlock(channel_id: int) -> bool

   Release a lock previously taken with
   :meth:`_channel_lock`. Always paired with a lock
   call; use ``try`` / ``finally`` to make sure the
   unlock happens even when the read in between raises.

   :param channel_id: Numeric channel ID, typically
                      resolved with :meth:`get_channel`.

**Shaped channels** carry structured records rather
than a flat byte stream. The profiler channel is the
shipped example: its shape is
``(record_count, record_size)`` and a host that wants
to know how many records are waiting reads the shape
rather than the byte size.

.. py:method:: Camera._channel_shape(channel_id: int) -> tuple[int, ...]

   Read the shape descriptor of a channel.

   :param channel_id: Numeric channel ID, typically
                      resolved with :meth:`get_channel`.
   :returns: Tuple of unsigned 32-bit integers
             describing the channel's layout. The
             meaning is channel-specific.

**Channel-specific control commands** -- start, stop,
reset, configure -- ride a single opcode
(``CHANNEL_IOCTL``) with a channel-specific command
number and an optional ``struct.pack`` payload. The
shipped methods like :meth:`stop`, :meth:`exec`, and
:meth:`streaming` are thin wrappers around
:meth:`_channel_ioctl` calls against the ``stdin`` and
``stream`` channels; a custom cam-side channel that
defines its own ioctl menu is driven the same way.

.. py:method:: Camera._channel_ioctl(channel_id: int, cmd: int, fmt: str | None = None, *args) -> bytes | None

   Issue an ioctl command on a channel.

   :param channel_id: Numeric channel ID, typically
                      resolved with :meth:`get_channel`.
   :param cmd: Command number defined by the cam-side
               channel backend.
   :param fmt: Optional :mod:`struct` format string for
               the argument tuple. Pass :data:`None`
               for ioctls that take no arguments.
   :param args: Values matching ``fmt``.
   :returns: Whatever payload the channel returned, or
             :data:`None`.

**By-ID byte-stream variants** of the public channel
methods skip the name-to-ID lookup and accept an
explicit byte ``offset`` -- useful for reading a chunk
from the middle of a large buffer (the ``profile``
channel records, for example).

.. py:method:: Camera._channel_size(channel_id: int) -> int

   :param channel_id: Numeric channel ID, typically
                      resolved with :meth:`get_channel`.
   :returns: Bytes currently available on the channel.

.. py:method:: Camera._channel_read(channel_id: int, offset: int, length: int) -> bytes

   Read ``length`` bytes starting at ``offset``.
   Multi-packet reads are reassembled automatically.

   :param channel_id: Numeric channel ID, typically
                      resolved with :meth:`get_channel`.
   :param offset: Byte offset to start reading from.
   :param length: Number of bytes to read.

.. py:method:: Camera._channel_write(channel_id: int, data: bytes, offset: int = 0) -> None

   Write ``data`` at the given ``offset``. Multi-packet
   writes are split across packets automatically.

   :param channel_id: Numeric channel ID, typically
                      resolved with :meth:`get_channel`.
   :param data: Bytes-like payload to write.
   :param offset: Byte offset to start writing at.

**Protocol primitives** are the lowest level the
class exposes -- the raw send-a-command, fetch-the-raw-
channel-list, and manual-resync entries everything
above is eventually built on. An application reaches
for them when sending an opcode the class does not
already wrap, or when implementing custom recovery in
a subclass.

.. py:method:: Camera._send_cmd_wait_resp(opcode: int, channel: int = 0, data: bytes = b'') -> bytes | None

   Send a protocol command and wait for the cam's
   response. The primitive every other method in this
   section is built on.

   :param opcode: Command number. The shipped
                  :class:`Opcode` enum lists the codes
                  the firmware ships with, but the
                  parameter is just an integer -- a
                  custom firmware build can define and
                  respond to its own.
   :param channel: Channel ID, or ``0`` for system
                   commands.
   :param data: Command-specific payload.
   :returns: Response payload, or :data:`None` for
             commands like :attr:`Opcode.SYS_RESET`
             and :attr:`Opcode.SYS_BOOT` that drop the
             connection.

.. py:method:: Camera._channel_list() -> dict

   Fetch the current channel list from the cam without
   touching the cached :attr:`channels_by_id` and
   :attr:`channels_by_name` dictionaries that
   :meth:`update_channels` populates. Useful for a
   subclass that wants to inspect the cam's channel
   state directly.

   :returns: Dict mapping channel ID to
             ``{'name': str, 'flags': int}``.

.. py:method:: Camera._resync() -> None

   Re-run the protocol handshake from scratch. Called
   automatically by :meth:`connect` on initial
   connection and by every public method that catches
   an :class:`OMVException` from the transport. An
   application implementing its own recovery loop in a
   subclass may call this directly after handling the
   underlying error.

Exceptions
----------

.. py:exception:: OMVException

   Base class for every protocol-level error. The
   three subclasses below all inherit from it, so a
   single ``except OMVException`` covers the entire
   error surface.

.. py:exception:: TimeoutException

   The cam did not respond within the configured
   timeout. Subclass of :class:`OMVException`.

.. py:exception:: ChecksumException

   A packet's CRC did not match. Raised after the
   protocol has exhausted its retry budget. Subclass of
   :class:`OMVException`.

.. py:exception:: SequenceException

   A packet arrived with an unexpected sequence number
   after retries. Subclass of :class:`OMVException`.
