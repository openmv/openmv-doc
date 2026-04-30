:mod:`select` -- wait for events on a set of streams
====================================================

.. module:: select
   :synopsis: wait for events on a set of streams

This module provides functions to efficiently wait for events on multiple
:std:term:`streams <stream>` (select streams which are ready for operations).

Functions
---------

.. function:: poll() -> poll

   Create a new `poll` object — used to register a set of streams (or any
   objects exposing the stream protocol) and efficiently wait until one
   or more of them becomes readable or writable.

.. function:: select(rlist: List, wlist: List, xlist: List, timeout: Optional[float] = None) -> Tuple[List, List, List]

   Wait for activity on a set of objects.

   This function is provided by some MicroPython ports for compatibility
   and is not efficient. Usage of `poll` is recommended instead.

Classes
-------

.. class:: poll
   :no-index:

   Polling object returned by `select.poll()`. It maintains a set of
   registered streams (or any objects exposing the stream protocol) and
   efficiently waits until one or more of them becomes readable, writable,
   or signals an exceptional condition.

   Streams are added with `register`, removed with `unregister`, and the
   set of events to watch can be changed with `modify`. Once configured,
   call `poll` to block until something is ready (or a timeout elapses),
   or `ipoll` for an allocation-free iterator-based variant.

   .. method:: register(obj: Any, eventmask: int = select.POLLIN | select.POLLOUT) -> None

      Register :std:term:`stream` *obj* for polling. *eventmask* is logical OR of:

      * ``select.POLLIN``  - data available for reading
      * ``select.POLLOUT`` - more data can be written

      Note that flags like ``select.POLLHUP`` and ``select.POLLERR`` are
      *not* valid as input eventmask (these are unsolicited events which
      will be returned from `poll()` regardless of whether they are asked
      for). This semantics is per POSIX.

      *eventmask* defaults to ``select.POLLIN | select.POLLOUT``.

      It is OK to call this function multiple times for the same *obj*.
      Successive calls will update *obj*'s eventmask to the value of
      *eventmask* (i.e. will behave as `modify()`).

   .. method:: unregister(obj: Any) -> None

      Unregister *obj* from polling.

   .. method:: modify(obj: Any, eventmask: int) -> None

      Modify the *eventmask* for *obj*. If *obj* is not registered, `OSError`
      is raised with error of ENOENT.

   .. method:: poll(timeout: int = -1, /) -> List[Tuple]

      Wait for at least one of the registered objects to become ready or have an
      exceptional condition, with optional timeout in milliseconds (if *timeout*
      arg is not specified or -1, there is no timeout).

      Returns list of (``obj``, ``event``, ...) tuples. There may be other elements in
      tuple, depending on a platform and version, so don't assume that its size is 2.
      The ``event`` element specifies which events happened with a stream and
      is a combination of ``select.POLL*`` constants described above. Note that
      flags ``select.POLLHUP`` and ``select.POLLERR`` can be returned at any time
      (even if were not asked for), and must be acted on accordingly (the
      corresponding stream unregistered from poll and likely closed), because
      otherwise all further invocations of `poll()` may return immediately with
      these flags set for this stream again.

      In case of timeout, an empty list is returned.

      Calling ``poll.poll`` is guaranteed to call pending callback functions
      before entering the polling loop.

      .. admonition:: Difference to CPython
         :class: attention

         Tuples returned may contain more than 2 elements as described above.

   .. method:: ipoll(timeout: int = -1, flags: int = 0, /) -> Iterator[Tuple]

      Like :meth:`poll.poll`, but instead returns an iterator which yields a
      `callee-owned tuple`. This function provides an efficient, allocation-free
      way to poll on streams.

      If *flags* is 1, one-shot behaviour for events is employed: streams for
      which events happened will have their event masks automatically reset
      (equivalent to ``poll.modify(obj, 0)``), so new events for such a stream
      won't be processed until new mask is set with `poll.modify()`. This
      behaviour is useful for asynchronous I/O schedulers.

      Calling ``poll.ipoll`` is guaranteed to call pending callback functions
      before entering the polling loop.

      .. admonition:: Difference to CPython
         :class: attention

         This function is a MicroPython extension.
