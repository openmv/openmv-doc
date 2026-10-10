Locks
=====

:class:`asyncio.Lock` provides *mutual exclusion* between
coroutines -- a guarantee that only one coroutine at a time
holds the lock, and the others wait until the holder
releases it.

When a lock is needed
---------------------

The :doc:`cooperative concurrency
<../basics/cooperative-concurrency>` page noted that two
coroutines cannot interleave halfway through code that has
no ``await`` in it. The *opposite* is also true: as soon as
a coroutine ``await``\ s, the loop is free to run another
coroutine. If two coroutines touch the same resource across
awaits -- a UART, I2C, or SPI bus -- their operations can
interleave in ways that corrupt the resource.

A lock around the critical section closes the gap::

    import asyncio

    bus_lock = asyncio.Lock()

    async def read_register(bus, addr):
        async with bus_lock:
            bus.write(addr)
            return await bus.read(2)

Two coroutines can now both call ``read_register``
concurrently; the lock makes sure only one of them holds the
bus at a time, and the other one waits for the lock to be
released before starting.

Locks are *not* needed when the critical section has no
``await`` inside it -- the cooperative scheduling guarantee
already covers that case. They are only needed when the
critical section yields to the loop partway through.

The ``async with`` idiom
------------------------

The example above shows the recommended way to use a lock:
inside an ``async with`` block. On entry the block ``await``\
s :meth:`~asyncio.Lock.acquire`; on exit (whether the block
returned normally, raised an exception, or was cancelled)
the lock is released automatically. There is no path out of
the block that leaves the lock held.

For the rare case where the lifetime of the lock does not
line up with a block of code, the methods are also
available directly::

    await bus_lock.acquire()
    try:
        bus.write(addr)
        result = await bus.read(2)
    finally:
        bus_lock.release()

The ``try``/``finally`` is required to make this equivalent
to the ``async with`` version. The ``async with`` form
exists because *this* is the right shape and the language
makes it concise.

Method reference
----------------

* :meth:`~asyncio.Lock.acquire` -- a coroutine. Blocks until
  the lock is unlocked, then takes it.
* :meth:`~asyncio.Lock.release` -- releases the lock. If
  any coroutines are queued waiting on
  :meth:`~asyncio.Lock.acquire`, the next one in the queue
  is scheduled to run and the lock stays locked; otherwise
  the lock becomes unlocked.
* :meth:`~asyncio.Lock.locked` -- returns ``True`` if the
  lock is currently held, ``False`` otherwise. Returns
  immediately; does not block.

Waiters are served in FIFO order. There is no priority, no
reentrancy (the same task cannot acquire a lock it already
holds), and no timeout on acquire. To put a deadline on a
lock acquisition, wrap the acquire in
:func:`asyncio.wait_for`::

    try:
        await asyncio.wait_for(bus_lock.acquire(), timeout=1)
    except asyncio.TimeoutError:
        # lock busy for >1 s -- bail out
        return None
    try:
        ...
    finally:
        bus_lock.release()
