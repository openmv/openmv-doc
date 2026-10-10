CAN bus in code
===============

:class:`machine.CAN` wraps a hardware CAN controller. Bring
it up with the bus id and a bit rate:

::

    from machine import CAN

    can = CAN(1, 500_000)
    can.set_filters(None)        # accept all incoming IDs

The bit rate must match every other node on the bus exactly --
``125_000``, ``250_000``, ``500_000`` and ``1_000_000`` are the
common values. :meth:`~machine.CAN.set_filters` configures
which IDs the controller will pass through; ``None`` means
accept everything (useful while bringing up a link, less useful
once the bus is busy).

Inside the controller
---------------------

Three pieces of hardware sit between the camera's Python code
and the bus -- the *TX mailboxes*, an *acceptance filter*, and
the *RX FIFO*. Each one maps to a piece of the
:class:`~machine.CAN` API used below.

.. figure:: ../figures/can-controller.svg
   :alt: Block diagram of the CAN controller. On the TX side
         (top), can.send() drops frames into one of three TX
         mailboxes, and an arbitrate block picks which mailbox
         goes to the bus next. On the RX side (bottom),
         incoming frames pass through an acceptance filter;
         accepted frames land in the RX FIFO and can.recv()
         reads the FIFO from its oldest end.

   The controller's TX mailboxes, acceptance filter, and RX
   FIFO between the software and the bus.

* **TX mailboxes.** A small set of hardware slots (typically
  three) that hold outgoing frames the camera has handed off
  via :meth:`~machine.CAN.send` but that have not yet reached
  the bus. When the bus is idle, the controller picks the
  mailbox with the lowest-numbered ID (highest priority) and
  arbitrates for the bus on its behalf. The camera does not
  pick the mailbox; the controller assigns one and returns
  its index from :meth:`~machine.CAN.send`.

* **Acceptance filter.** Configurable hardware that compares
  each incoming frame's ID against a list of patterns and
  discards anything that does not match. Frames that pass
  continue into the RX FIFO; rejected frames are thrown away
  by the controller without ever reaching Python.
  :meth:`~machine.CAN.set_filters` configures these patterns.

* **RX FIFO.** A *first-in, first-out* queue -- the first
  frame in is also the first frame out, like a line at a
  ticket counter. The controller appends received frames to
  the back of the queue as they arrive, and
  :meth:`~machine.CAN.recv` pulls them off the front in the
  same order. The queue matters because the bus catches
  frames in the background while Python is busy elsewhere;
  the camera then drains them one at a time without losing
  any, as long as the FIFO has not overflowed.

Sending a frame
---------------

:meth:`~machine.CAN.send` queues a frame for transmission:

::

    can.send(0x123, b"\x01\x02\x03\x04")

The first argument is the ID (an 11-bit integer for a standard
frame); the second is the payload (0 to 8 bytes for CAN
Classic). The call returns a small integer index identifying
the hardware mailbox the frame went into. The controller
arbitrates with any other transmitters on the bus and
re-transmits as needed without further help from software.

For extended (29-bit) IDs, OR the :data:`CAN.FLAG_EXT_ID` flag
into the third argument:

::

    can.send(0x18FF1234, b"hello", CAN.FLAG_EXT_ID)

Receiving frames
----------------

The controller starts up with no filter installed and drops
every incoming frame. Before :meth:`~machine.CAN.recv` will
return anything, call :meth:`~machine.CAN.set_filters` once --
the simplest form is ``None``, which accepts every ID:

::

    can.set_filters(None)   # accept every frame

:meth:`~machine.CAN.recv` then returns the next frame in the
receive FIFO, or ``None`` if nothing is waiting:

::

    msg = can.recv()
    if msg is not None:
        can_id, data, flags, errs = msg
        print("got", hex(can_id), bytes(data))

The bus fills the RX FIFO in the background, so the main loop
just drains it as fast as it iterates. As long as the FIFO is
deeper than the longest gap between drains, no frames are
lost.

Filters
-------

A real bus is usually busy with frames the camera does not
care about. Hardware filters let the controller drop unwanted
IDs before they reach the FIFO. :meth:`~machine.CAN.set_filters`
takes a list of ``(id, mask, flags)`` tuples; a frame passes
the filter if its ID, masked by ``mask``, matches the
configured ``id``:

::

    # Accept only IDs 0x100 - 0x10F (mask off the bottom 4 bits)
    can.set_filters(((0x100, 0x7F0, 0),))

    # Accept IDs 0x300 and 0x700 exactly
    can.set_filters(((0x300, 0x7FF, 0),
                     (0x700, 0x7FF, 0)))

Unmatched frames are discarded by the controller and never
appear at :meth:`~machine.CAN.recv`, which saves both buffer
space and CPU time.

Error states and recovery
-------------------------

A real CAN bus picks up transmission errors -- shorts to
ground, missing nodes, electrical noise corrupting bits. The
controller keeps two counters that track this behaviour: a
Transmit Error Counter (TEC) and a Receive Error Counter
(REC), each incremented when the controller detects an error
and decremented after a successful transfer. The counter
values put the controller into one of four states:

* **Error Active** (TEC and REC both below 96). Normal
  operation. When the node detects a bus error it transmits
  a dominant *active error frame*, which forces every other
  node to discard the in-progress frame so the sender can
  retry.

* **Error Warning** (either counter reaches 96). Still fully
  active on the bus -- the warning state is a software
  signal that errors are accumulating, not a behaviour
  change.

* **Error Passive** (either counter reaches 128). The node is
  still on the bus but stops sending dominant error frames;
  errors are now signalled with *passive* (recessive) error
  frames so a faulty node cannot keep tearing up the bus for
  everyone else.

* **Bus Off** (TEC reaches 256). The controller has decided
  this node is too unreliable to participate. It disconnects
  from the bus, stops transmitting and acknowledging, and
  stays out until software explicitly restarts it.

The first three transitions are entirely automatic -- as the
counters decrement after successful frames, the controller
moves itself back toward Error Active without intervention.

Bus Off is the one state that requires software action.
:meth:`~machine.CAN.restart` resets the controller and
returns it to Error Active. A typical pattern is to check
the state from the main loop and restart after a short delay
to give the bus time to settle:

::

    import time
    from machine import CAN

    can = CAN(1, 500_000)
    can.set_filters(None)

    while True:
        if can.state() == CAN.STATE_BUS_OFF:
            time.sleep_ms(100)
            can.restart()
        # ... rest of the loop

The current counter values are available from
:meth:`~machine.CAN.get_counters` for diagnostics -- a TEC
that climbs steadily on an otherwise-quiet bus usually points
at wiring, termination, or a misconfigured bit rate.

