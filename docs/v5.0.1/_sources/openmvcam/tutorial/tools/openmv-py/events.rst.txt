Events
======

The pages so far call into the cam: upload a script,
read a frame, write to a channel. Every one of those
operations is host-initiated -- the host asks, the cam
responds. The protocol also runs in the other
direction. The cam can push *events* to the host
without being asked, and the host SDK delivers each one
to a callback the application can override.

This is the right tool whenever the application wants
to react to something the cam noticed before it asks.
Without events, the only way to find out is to keep
calling :meth:`~openmv.Camera.read_status` in a loop.

The default callback
--------------------

:class:`~openmv.Camera` already subscribes to events
internally. :meth:`~openmv.Camera._handle_event` is the
callback the transport runs whenever an event packet
arrives. The default handles three system events:

* :data:`~openmv.EventType.CHANNEL_REGISTERED` -- a new
  channel appeared on the cam after the host connected.
  The framework refreshes its channel cache so the next
  :meth:`~openmv.Camera.has_channel` lookup finds it.
* :data:`~openmv.EventType.CHANNEL_UNREGISTERED` -- a
  channel disappeared.
* :data:`~openmv.EventType.SOFT_REBOOT` -- the cam
  rebooted on its own (watchdog, hard fault,
  intentional :func:`machine.reset`).

It also tracks the ``stream`` channel's frame-ready
event for the streaming path and the ``stdin`` channel's
script start / stop for stdout buffering. The
constructor's ``events=True`` default keeps all of this
on; an application that wants none of it can pass
``events=False`` to :class:`~openmv.Camera` and the
event subsystem stays quiet.

Subclassing to react
--------------------

To handle application-specific events the cam raises,
subclass :class:`~openmv.Camera` and override
:meth:`~openmv.Camera._handle_event`. Call the parent
first to keep the default behaviour, then dispatch the
events the application cares about::

    from openmv import Camera

    class MyCamera(Camera):
        def _handle_event(self, channel_id, event):
            super()._handle_event(channel_id, event)

            name = self.channels_by_id.get(
                channel_id, {}).get('name')
            if name == 'motion' and event == 1:
                self.on_motion()

        def on_motion(self):
            print("motion detected")

The signature is ``(channel_id, event)``. ``channel_id``
is ``0`` for system events and otherwise the numeric
ID of the channel that raised it; ``event`` is an
integer the cam-side script chose. The
:class:`~openmv.EventType` enum gives names to the
three system events; channel events use whatever values
the cam-side backend defines.

Channel events come back keyed by numeric ID, not name.
The cached ``channels_by_id`` dict is what the override
above uses to look up the name; ``channels_by_name`` is
its mirror, keyed the other way.

The cam-side half
-----------------

The cam-side script raises an event by calling
:meth:`~protocol.ProtocolChannel.send_event` on the
handle returned from :func:`protocol.register`::

    import protocol

    class MotionChannel:
        def size(self):
            return 0

        def read(self, offset, size):
            return b''

        def poll(self):
            return False

    ch = protocol.register(
        name='motion', backend=MotionChannel())

    while True:
        if detect_motion():
            ch.send_event(1)

The event number is an integer chosen by the
application. Any value the host's override is prepared
to handle is fair game; the protocol layer treats it as
opaque payload. By default the call fires and forgets;
pass ``wait_ack=True`` to block until the host
acknowledges, when knowing the event landed matters
more than the latency of the round trip.

A channel that only fires events and carries no
readable data is a valid pattern -- ``size`` returns
``0`` and ``read`` returns empty bytes. The protocol
library still needs both methods present to mark the
channel as readable; the cam-side script just never
puts data in it.

Driving the receive path while idle
-----------------------------------

Events arrive on the same connection as everything
else, so any host call that sends or receives bytes
gives the transport a chance to process pending events
inline. A polling loop that already calls
:meth:`~openmv.Camera.read_status` or
:meth:`~openmv.Camera.read_frame` once per cycle does
not need anything extra.

For programs that go minutes without other I/O,
:meth:`~openmv.Camera.poll_events` runs the receive
path once without sending a command. It returns as
soon as the inbound buffer is empty, so a tight loop
around it -- or a short timer in a GUI event loop --
is what keeps the handlers reactive.

A complete loop
---------------

End to end, the pattern is: the cam-side script
registers a channel and calls
:meth:`~protocol.ProtocolChannel.send_event` when
something happens; the host-side subclass overrides
:meth:`~openmv.Camera._handle_event` and dispatches.
A host loop that does nothing but service events looks
like::

    with MyCamera('/dev/ttyACM0') as cam:
        cam.stop()
        cam.exec(open('motion_cam.py').read())

        while True:
            cam.poll_events()

The cam captures, decides, and raises events. The host
sits inside :meth:`~openmv.Camera.poll_events` until
one arrives, then ``on_motion`` runs. No
:meth:`~openmv.Camera.read_status` call runs when
nothing has happened, and no frame is pulled across
USB when the cam has nothing to report.
