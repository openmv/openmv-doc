Custom channels
===============

A *channel* is a named, bidirectional byte stream
between a cam-side script and the host. The cam
registers a channel and provides callbacks that produce
or consume data; the host reads from and writes to that
channel by name. The same mechanism the package uses
internally for the ``stream`` channel that carries
frames, the ``stdout`` channel that carries script
output, and the ``stdin`` channel that carries script
upload is exposed to user scripts, so any
application-specific data the host needs can ride the
same USB connection without inventing a second
protocol.

This is the most useful feature of the package and the
one the standard documentation covers least well, so
this page works through it end to end.

The two halves
--------------

A custom channel needs cooperating code on both sides.
The **cam-side script** imports :mod:`protocol`,
defines a class with three methods (:meth:`size`,
:meth:`read`, :meth:`poll`) plus an optional
:meth:`write`, and calls
``protocol.register(name=..., backend=...)`` to publish
the channel under a chosen name::

    import protocol
    import time

    class TicksChannel:
        def size(self):
            return 10

        def read(self, offset, size):
            return f'{time.ticks_ms():010d}'

        def poll(self):
            return True

    protocol.register(name='ticks', backend=TicksChannel())

The :meth:`size` method returns how many bytes the
channel currently has available. :meth:`read` is the
producer: given an ``offset`` and ``size`` requested by
the host, it returns the bytes (or a string the
protocol layer encodes). :meth:`poll` returns
:data:`True` when there is something to read -- the
protocol layer uses this to flag the channel as ready
in :meth:`~openmv.Camera.read_status`.

The **host-side program** uses four
:class:`openmv.Camera` methods:
:meth:`~openmv.Camera.has_channel` to check the channel
exists, :meth:`~openmv.Camera.channel_size` to ask how
much data is waiting,
:meth:`~openmv.Camera.channel_read` to pull bytes out,
and :meth:`~openmv.Camera.channel_write` to push bytes
in. :meth:`~openmv.Camera.read_status` polls every
channel at once::

    from openmv import Camera

    with Camera('/dev/ttyACM0') as cam:
        cam.stop()
        cam.exec(open('ticks_cam.py').read())

        while True:
            status = cam.read_status()

            if status.get('ticks'):
                data = cam.channel_read('ticks')
                print(f"ticks: {data.decode()}")

The host loop polls :meth:`~openmv.Camera.read_status`;
when the ``ticks`` channel is ready it calls
:meth:`~openmv.Camera.channel_read` with no ``size`` to
pull whatever is available. The cam's
:meth:`TicksChannel.poll` returns :data:`True` on every
check, so the channel is always "ready" and the host
gets a fresh tick value every poll.

A bidirectional channel
-----------------------

For a host that needs to push data back, the cam-side
class adds a :meth:`write` method that accepts the
incoming bytes::

    import protocol

    class CommandChannel:
        def __init__(self):
            self.last_command = b''
            self.replied = False

        def size(self):
            return len(self.last_command)

        def read(self, offset, size):
            self.replied = True
            return self.last_command

        def write(self, offset, data):
            self.last_command = b'echo: ' + bytes(data)
            self.replied = False

        def poll(self):
            return not self.replied and len(self.last_command) > 0

    protocol.register(name='echo', backend=CommandChannel())

The host writes to the channel with
:meth:`~openmv.Camera.channel_write` and reads the
reply back through the usual
:meth:`~openmv.Camera.read_status` /
:meth:`~openmv.Camera.channel_read` pattern::

    with Camera('/dev/ttyACM0') as cam:
        cam.stop()
        cam.exec(open('echo_cam.py').read())

        cam.channel_write('echo', b'hello')

        while True:
            if cam.read_status().get('echo'):
                print(cam.channel_read('echo').decode())
                break

What this gets the application
------------------------------

Custom channels are the right tool whenever an
application wants to ride the existing USB connection
for non-frame, non-print data: telemetry counters,
configuration knobs streamed live from a UI on the
host, control commands sent the other way, results of
a measurement the cam computed that does not fit the
"image" framing the stream channel assumes. The
protocol layer handles the framing, fragmentation,
acknowledgement, and retry; the script only needs to
implement the four-method backend, and the host only
needs to know the channel name and the data shape.

The CLI's ``--channel NAME`` flag is a quick way to
verify a custom channel from the terminal without
writing a host-side program: the CLI polls the named
channel and prints the first ten bytes of each update.

The size limit on a single
:meth:`~openmv.Camera.channel_read` or
:meth:`~openmv.Camera.channel_write` call is the
protocol's negotiated ``max_payload`` -- 4096 bytes by
default. The host-side methods automatically split
larger writes into the right number of packets, so the
application can pass arbitrarily large buffers; the
fragmentation is invisible.
