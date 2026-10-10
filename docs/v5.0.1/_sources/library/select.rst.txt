:mod:`select` --- wait for events on a set of streams
=====================================================

.. module:: select
   :synopsis: wait for events on a set of streams

This module provides functions to efficiently wait until one or more
:std:term:`streams <stream>` (file-like objects implementing the stream
protocol, such as sockets, UARTs and other I/O objects) is ready for reading
or writing, instead of busy-waiting or blocking on a single object.

The :class:`poll` object is the recommended interface: it scales to many
streams and is allocation-free when used via :meth:`poll.ipoll`. The
module-level :func:`select` function is a less efficient compatibility
interface.

Example using a :class:`poll` object::

    import select

    poller = select.poll()
    poller.register(uart, select.POLLIN)

    while True:
        # Wait up to 1000 ms for the UART to have data.
        for obj, event in poller.poll(1000):
            if event & select.POLLIN:
                print(obj.read())

Example using the module-level :func:`select` function::

    import select

    # Wait up to 1 second for the socket to become readable.
    rlist, wlist, xlist = select.select([sock], [], [], 1.0)
    if rlist:
        data = sock.recv(100)

Functions
---------

.. function:: select(rlist: List, wlist: List, xlist: List, timeout: Optional[float] = None) -> Tuple[List, List, List]

   Wait until one or more of the given stream objects is ready, or until
   *timeout* expires.

   * *rlist* is a list of objects to monitor for readability.
   * *wlist* is a list of objects to monitor for writability.
   * *xlist* is a list of objects to monitor for an error or hang-up
     condition.
   * *timeout* is the maximum time to wait, in seconds (a float is accepted).
     If it is omitted or ``None`` the call blocks indefinitely; ``0`` returns
     immediately (a non-blocking poll).

   Returns a 3-tuple of lists ``(rlist, wlist, xlist)``. Each returned list is
   the subset of the corresponding input list containing the objects that
   became ready for reading, ready for writing, or that signalled an
   error/hang-up, respectively. If *timeout* elapses with nothing ready, all
   three lists are empty.

   This function is less efficient than :class:`poll` (it rebuilds its
   internal poll set on every call); use :class:`poll` instead where
   possible.

Constants
---------

.. data:: POLLIN
   :type: int

   There is data available to read from the stream.

.. data:: POLLOUT
   :type: int

   The stream can accept more data to be written.

.. data:: POLLERR
   :type: int

   An error condition occurred on the stream. This is an *unsolicited* event:
   it is reported by :meth:`poll.poll` / :meth:`poll.ipoll` even if it was not
   requested in the *eventmask*, and it is not valid to pass it as an input
   *eventmask*.

.. data:: POLLHUP
   :type: int

   The stream was hung up / disconnected. This is an *unsolicited* event: it
   is reported by :meth:`poll.poll` / :meth:`poll.ipoll` even if it was not
   requested in the *eventmask*, and it is not valid to pass it as an input
   *eventmask*.

Classes
-------

.. class:: poll()

   Create a polling object that maintains a set of registered streams (or any
   objects exposing the stream protocol) and efficiently waits until one or
   more of them becomes readable, writable, or signals an exceptional
   condition.

   Streams are added with :meth:`register`, removed with :meth:`unregister`,
   and the set of events to watch can be changed with :meth:`modify`. Once
   configured, call :meth:`poll` to block until something is ready (or a
   timeout elapses), or :meth:`ipoll` for an allocation-free iterator-based
   variant.

   .. method:: register(obj: Any, eventmask: int = select.POLLIN | select.POLLOUT) -> None

      Register the :std:term:`stream` *obj* for polling, watching for the
      events given by *eventmask* (the logical OR of):

      * :data:`select.POLLIN`  -- data is available to read
      * :data:`select.POLLOUT` -- the stream can accept more data to write

      *eventmask* defaults to ``select.POLLIN | select.POLLOUT``.

      :data:`select.POLLHUP` and :data:`select.POLLERR` are *not* valid in an
      input *eventmask* -- they are unsolicited events that are reported by
      :meth:`poll` / :meth:`ipoll` regardless of whether they were asked for
      (this matches POSIX semantics).

      It is OK to call this method more than once for the same *obj*: a
      subsequent call updates *obj*'s event mask, behaving like
      :meth:`modify`.

   .. method:: unregister(obj: Any) -> None

      Remove *obj* from the set of registered streams. It is not an error to
      unregister an *obj* that is not currently registered (the call has no
      effect in that case).

   .. method:: modify(obj: Any, eventmask: int) -> None

      Change the event mask for an already-registered *obj* to *eventmask*.
      Raises :exc:`OSError` with :data:`errno.ENOENT` if *obj* is not
      registered.

   .. method:: poll(timeout: int = -1, /) -> List[Tuple]

      Block until at least one registered stream becomes ready or signals an
      exceptional condition, then return the list of streams that fired.

      *timeout* is the maximum time to wait in **milliseconds**. If it is
      omitted or ``-1`` the call blocks indefinitely; ``0`` returns
      immediately (a non-blocking poll).

      Returns a list of ``(obj, event, ...)`` tuples, one per stream that
      fired. ``obj`` is the registered stream and ``event`` is the bitwise OR
      of the :data:`select.POLLIN` / :data:`select.POLLOUT` /
      :data:`select.POLLERR` / :data:`select.POLLHUP` flags that occurred.
      Each tuple may contain additional implementation-defined elements, so do
      not assume a length of exactly 2. If *timeout* elapses with nothing
      ready, an empty list is returned.

      :data:`select.POLLHUP` and :data:`select.POLLERR` may be returned at any
      time (even if not requested) and must be acted on -- typically by
      unregistering and closing the affected stream -- otherwise subsequent
      calls will keep returning immediately with these flags set for that
      stream.

      Any pending scheduled callbacks are guaranteed to run before the polling
      loop is entered.

      .. admonition:: Difference to CPython
         :class: attention

         Returned tuples may contain more than 2 elements, as described above.

   .. method:: ipoll(timeout: int = -1, flags: int = 0, /) -> Iterator[Tuple]

      Like :meth:`poll`, but instead of building a list it returns an iterator
      that yields one ``(obj, event, ...)`` tuple at a time. This avoids
      allocating on each call, which is important for asynchronous I/O
      schedulers.

      The yielded tuple is *callee-owned*: it is reused (overwritten) on the
      next iteration, so its contents must be consumed within the loop body
      and references to it must not be stored.

      *timeout* has the same meaning as for :meth:`poll`. If *flags* is ``1``,
      one-shot behaviour is used: a stream whose event fired has its event
      mask automatically cleared (equivalent to ``poll.modify(obj, 0)``), so
      no further events are reported for it until its mask is set again with
      :meth:`modify`.

      Any pending scheduled callbacks are guaranteed to run before the polling
      loop is entered.

      .. admonition:: Difference to CPython
         :class: attention

         This method is a MicroPython extension.
