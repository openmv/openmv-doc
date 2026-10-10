Channel callbacks
=================

The backend object handed to :func:`protocol.register` is a Python
class. The protocol library doesn't ask the class which methods it
implements; it inspects the instance and wires the ones it finds.
That introspection is what makes the backend interface flexible:
the smallest useful backend is two methods, the most elaborate is
twelve, and the application opts in to each capability one method
at a time.

The introspection rules
-----------------------

When :func:`protocol.register` runs, the library walks a fixed list
of callable names and binds each one it finds on the backend
instance:

* Adding ``read`` to the class flips ``CHANNEL_FLAG_READ`` on. A
  host call to :meth:`~openmv.camera.Camera.channel_read` only
  reaches the backend if this flag is set.
* Adding ``write`` flips ``CHANNEL_FLAG_WRITE`` on, enabling
  :meth:`~openmv.camera.Camera.channel_write`.
* Adding ``lock`` and ``unlock`` flips ``CHANNEL_FLAG_LOCK`` on,
  enabling the host to lock the channel for a multi-packet atomic
  read.
* Adding ``poll`` lets the host ask "is anything ready?" cheaply,
  without forcing a full read.

Missing methods are not errors -- the protocol library just leaves
the corresponding capability disabled. A backend with only ``size``
and ``read`` is perfectly valid; it's a read-only data channel.

A read-only sensor channel
--------------------------

A sensor channel that publishes a fresh reading every time the host
asks, refusing host writes, exercises four of the callbacks::

   import protocol
   import struct

   class TempChannel:
       def __init__(self, read_sensor):
           self._read_sensor = read_sensor
           self._buf = b''
           self._fresh = False

       def poll(self):
           # Tell the host whether a reading is waiting.
           return self._fresh

       def size(self):
           # Sample fresh data on every host-side size query.
           value = self._read_sensor()
           self._buf = struct.pack('<f', value)
           self._fresh = True
           return len(self._buf)

       def read(self, offset, size):
           end = offset + size
           if end >= len(self._buf):
               self._fresh = False
           return self._buf[offset:end]

   protocol.register(name='temp', backend=TempChannel(read_temperature))

Walking through what each method does:

* ``poll`` returns the freshness flag. The host calls it before
  reading and skips the read entirely when it returns
  :data:`False`. That saves the round-trip cost for "no new data
  yet."
* ``size`` regenerates the buffer on demand and reports its length.
  Doing the sampling here means the backend doesn't need a
  background task -- a host call drives every measurement.
* ``read`` returns a slice of the buffer. The protocol library may
  call it more than once when the buffer is larger than the
  negotiated max payload; the ``offset`` argument walks through
  the fragments.
* No ``write`` means host writes are refused at the framing layer,
  before the backend is involved.

The full callback set
---------------------

For reference, every method the library looks for on a backend:

.. list-table::
   :header-rows: 1
   :widths: 28 12 60

   * - Method
     - Returns
     - Purpose
   * - ``init(self)``
     - object
     - Optional one-shot initialisation when the channel first
       binds to a host. Return any non-:data:`None` value on
       success.
   * - ``poll(self)``
     - bool
     - Return :data:`True` when data is available.
   * - ``lock(self)``
     - bool
     - Acquire the channel for an atomic multi-packet transfer.
   * - ``unlock(self)``
     - bool
     - Release a prior ``lock``.
   * - ``size(self)``
     - int
     - Number of bytes currently readable from the channel.
   * - ``shape(self)``
     - tuple
     - Up to four integers describing the data structure (e.g.
       image height, width, byte count). Used by the host to
       unpack typed buffers.
   * - ``read(self, offset, size)``
     - bytes
     - Return up to *size* bytes starting at *offset*. Called once
       per fragment when the payload exceeds the negotiated max.
   * - ``readp(self, offset, size)``
     - bytes
     - Zero-copy variant of ``read``: the buffer's memory must
       stay valid for the duration of the transfer.
   * - ``write(self, offset, data)``
     - int
     - Host wrote *data* at *offset*. ``data`` is a ``bytearray``
       view into the protocol layer's receive buffer -- copy out
       what you want to keep before returning.
   * - ``ioctl(self, cmd, length, arg)``
     - int
     - Application-defined opcode outside the read/write model.
       Negative return is an error.
   * - ``flush(self)``
     - object
     - Drop any buffered data. Called when the host wants to
       reset the channel.
   * - ``is_active(self)``
     - bool
     - Only meaningful on backends that represent a physical
       transport (the built-in USB channels). Application channels
       don't need this.

That's the entire backend interface. Twelve method names, all
optional, and the protocol library decides what each channel can
do based on which ones are present.
