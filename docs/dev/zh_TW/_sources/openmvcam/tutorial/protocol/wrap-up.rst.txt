Wrap up
=======

A cam plugged into a USB cable that streams frames to a host
program, accepts config updates back from the host, and survives
unplug/replug without losing sync -- with retransmits hidden,
multiple logical streams sharing one port, and zero framing code in
the application -- comes out of about forty lines of cam-side code
and a similar amount on the host. The protocol library turns a byte
pipe into a programmable channel surface and keeps everything below
the application invisible.

What the chapter built
----------------------

* A four-layer mental model of the stack: transport, framing,
  reliability, channels. Each layer solves one problem and ignores
  everything above.
* The on-the-wire packet format -- 10-byte header with CRC,
  variable payload, trailing CRC. Small enough to walk through
  byte by byte.
* The handshake the cam and host run when a transport connects:
  PROTO_SYNC, capability exchange, channel discovery.
* The reliability machinery on top: sequence numbers, ACKs, NAKs,
  retransmits with exponential backoff, the ten status codes.
* The channel model: up to 32 named logical streams on one wire,
  with built-in ``stdin`` / ``stdout`` / ``stream`` / ``profile``
  and application channels registered by Python class.
* The backend interface -- ``size``, ``read``, ``write``, ``poll``,
  ``lock`` / ``unlock``, ``shape``, ``ioctl``, ``flush``,
  ``is_active`` -- and how the protocol library uses the methods
  present on a backend to decide what the channel supports.
* The host side: the openmv-python SDK's
  :class:`~openmv.camera.Camera` class, the ``921600``-baud magic
  rate that switches USB-CDC into protocol mode, and the
  ``channel_size`` / ``channel_read`` / ``channel_write``
  round-trip pattern.
* A frame-streaming pattern -- single-buffer capture, ``readp``
  with a latch, ``send_event`` for new-frame notifications -- and a
  bidirectional config pattern (host-writable channel, JSON
  round-trip) that together form the foundation for every
  interactive cam tool.

Reference roadmap
-----------------

The library reference pages are the lookup destinations when one of
these features comes up in real code:

* :doc:`/library/omv.protocol` -- the :mod:`protocol` module,
  :func:`protocol.init`, :func:`protocol.register`,
  :class:`~protocol.ProtocolChannel`, channel flag constants, and
  the per-cam max-payload table.
* The host SDK -- ``pip install openmv``,
  :class:`openmv.camera.Camera`. Methods touched in this chapter:
  :meth:`~openmv.camera.Camera.update_channels`,
  :meth:`~openmv.camera.Camera.has_channel`,
  :meth:`~openmv.camera.Camera.channel_size`,
  :meth:`~openmv.camera.Camera.channel_read`,
  :meth:`~openmv.camera.Camera.channel_write`,
  :meth:`~openmv.camera.Camera.poll_events`,
  :meth:`~openmv.camera.Camera.read_frame`,
  :meth:`~openmv.camera.Camera.exec`, and
  :meth:`~openmv.camera.Camera.stop`.
* The `openmv-projects
  <https://github.com/openmv/openmv-projects>`_ repository -- real
  tools built on the protocol library. The `tools/
  <https://github.com/openmv/openmv-projects/tree/master/tools>`_
  directory includes ``thermal-overlay-calibration`` (RGB + thermal
  alignment GUI), ``ccm-tuning`` (colour-correction matrix tuner),
  ``genx320-event-streaming`` and ``genx320-overlay-calibration``
  (event-camera tooling). Each one uses the patterns from this
  chapter end to end.

Where to take it next
---------------------

A few directions cam projects move from here:

* **Building a host GUI.** A frame channel feeding a video widget,
  one or two config channels feeding sliders and buttons. For the
  GUI layer itself, `DearPyGui
  <https://github.com/hoffstadt/DearPyGui>`_ is the natural choice
  -- pure-Python, pip-installable, fast enough for live preview,
  and what every existing OpenMV host tool reaches for first.
* **Multi-channel telemetry dashboard.** Several application
  channels on the same cam (sensor readings, counters, status
  events) each refreshed in its own callback, and a host GUI that
  reads them on a timer and renders each one separately. The
  channel layer's independent flow control means one slow read
  doesn't stall the others.
* **Remote tuning over UART.** The same channel callbacks; the
  application calls ``protocol.init`` to switch from USB to a UART
  transport. The cam keeps running headless and a Python script on
  a Raspberry Pi or laptop talks to it over a serial line for
  field tuning.

The wire format, the reliability layer, and the channel abstraction
don't change. Picking the transport that fits the deployment and
adding a channel for each thing the host needs to see or set is the
entire engineering job from here on.
