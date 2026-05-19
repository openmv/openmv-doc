:mod:`socket` --- socket module
===============================

.. module:: socket
   :synopsis: socket module

This module provides access to the BSD socket interface.

.. admonition:: Difference to CPython
   :class: attention

   For efficiency and consistency, socket objects in MicroPython implement a :std:term:`stream`
   (file-like) interface directly. In CPython, you need to convert a socket to
   a file-like object using :meth:`~socket.socket.makefile` method. This method is still supported
   by MicroPython (but is a no-op), so where compatibility with CPython matters,
   be sure to use it.

Socket address format(s)
------------------------

The native socket address format of the ``socket`` module is an opaque data type
returned by :func:`getaddrinfo` function, which must be used to resolve textual address
(including numeric addresses)::

    sockaddr = socket.getaddrinfo('www.micropython.org', 80)[0][-1]
    # You must use getaddrinfo() even for numeric addresses
    sockaddr = socket.getaddrinfo('127.0.0.1', 80)[0][-1]
    # Now you can use that address
    sock.connect(sockaddr)

Using :func:`getaddrinfo` is the most efficient (both in terms of memory and processing
power) and portable way to work with addresses.

The ``socket`` module also provides a CPython-compatible way to specify
addresses using tuples, as described below. On the OpenMV Cam the ``socket``
module is built in; numeric addresses may be given directly in the tuple
format, but domain names must first be resolved with :func:`getaddrinfo`.

Summing up:

* Always use :func:`getaddrinfo` to resolve host names.
* Tuple addresses described below can be used as a shortcut for numeric
  addresses, for quick hacks and interactive use.

Tuple address format for the ``socket`` module:

* IPv4: *(ipv4_address, port)*, where *ipv4_address* is a string with
  dot-notation numeric IPv4 address, e.g. ``"8.8.8.8"``, and *port* is an
  integer port number in the range 1-65535. Domain names are not accepted as
  *ipv4_address*; resolve them first using :func:`getaddrinfo`.
* IPv6: *(ipv6_address, port, flowinfo, scopeid)*, where *ipv6_address*
  is a string with colon-notation numeric IPv6 address, e.g. ``"2001:db8::1"``,
  and *port* is an integer port number in the range 1-65535. *flowinfo*
  must be 0. *scopeid* is the interface scope identifier for link-local
  addresses. Domain names are not accepted as *ipv6_address*; resolve them
  first using :func:`getaddrinfo`.

Functions
---------

.. function:: getaddrinfo(host: str, port: int, af: int = 0, type: int = 0, proto: int = 0, flags: int = 0, /) -> List[Tuple]

   Translate the host/port argument into a sequence of 5-tuples that contain all the
   necessary arguments for creating a socket connected to that service. Arguments
   *af*, *type*, and *proto* (which have the same meaning as for the :class:`socket` function)
   can be used to filter which kind of addresses are returned. If a parameter is not
   specified or zero, all combinations of addresses can be returned (requiring
   filtering on the user side).

   The resulting list of 5-tuples has the following structure::

      (family, type, proto, canonname, sockaddr)

   The following example shows how to connect to a given url::

      s = socket.socket()
      # This assumes that if "type" is not specified, an address for
      # SOCK_STREAM will be returned, which may be not true
      s.connect(socket.getaddrinfo('www.micropython.org', 80)[0][-1])

   Recommended use of filtering params::

      s = socket.socket()
      # Guaranteed to return an address which can be connect'ed to for
      # stream operation.
      s.connect(socket.getaddrinfo('www.micropython.org', 80, 0, SOCK_STREAM)[0][-1])

   .. admonition:: Difference to CPython
      :class: attention

      CPython raises a ``socket.gaierror`` exception (:exc:`OSError` subclass) in case
      of error in this function. MicroPython doesn't have ``socket.gaierror``
      and raises OSError directly. Note that error numbers of :func:`getaddrinfo()`
      form a separate namespace and may not match error numbers from
      the :mod:`errno` module. To distinguish :func:`getaddrinfo()` errors, they are
      represented by negative numbers, whereas standard system errors are
      positive numbers (error numbers are accessible using ``e.args[0]`` property
      from an exception object). The use of negative values is a provisional
      detail which may change in the future.

.. function:: inet_ntop(af: int, bin_addr: bytes) -> str

   Convert a binary network address *bin_addr* of the given address family *af*
   to a textual representation::

        >>> socket.inet_ntop(socket.AF_INET, b"\x7f\0\0\1")
        '127.0.0.1'

.. function:: inet_pton(af: int, txt_addr: str) -> bytes

   Convert a textual network address *txt_addr* of the given address family *af*
   to a binary representation::

        >>> socket.inet_pton(socket.AF_INET, "1.2.3.4")
        b'\x01\x02\x03\x04'

Constants
---------

.. data:: AF_INET
   :type: int

   IPv4 address family.

.. data:: AF_INET6
   :type: int

   IPv6 address family.

.. data:: SOCK_STREAM
   :type: int

   Stream (TCP) socket type.

.. data:: SOCK_DGRAM
   :type: int

   Datagram (UDP) socket type.

.. data:: SOCK_RAW
   :type: int

   Raw socket type.

.. data:: IPPROTO_IP
   :type: int

   The IP protocol level. Used as the *level* argument to
   :meth:`~socket.socket.setsockopt` together with the ``IP_*`` options.

.. data:: IPPROTO_TCP
   :type: int

   The TCP protocol. You do not need to pass this to :class:`socket` (the
   :data:`SOCK_STREAM` socket type selects it automatically); its only real
   use is as the *level* argument to :meth:`~socket.socket.setsockopt`
   together with the ``TCP_*`` options.

.. data:: SOL_SOCKET
   :type: int

   The socket option level. Used as the *level* argument to
   :meth:`~socket.socket.setsockopt` together with the ``SO_*`` options.

.. data:: SO_REUSEADDR
   :type: int

   Allow the socket to bind to an address/port that is still in the
   ``TIME_WAIT`` state.

.. data:: SO_BROADCAST
   :type: int

   Permit sending datagrams to a broadcast address.

.. data:: SO_KEEPALIVE
   :type: int

   Enable periodic transmission of keep-alive probes on a connected socket.

.. data:: SO_SNDTIMEO
   :type: int

   Send timeout, in milliseconds, passed as the *value* argument to
   :meth:`~socket.socket.setsockopt`.

.. data:: SO_RCVTIMEO
   :type: int

   Receive timeout, in milliseconds, passed as the *value* argument to
   :meth:`~socket.socket.setsockopt`.

.. data:: IP_ADD_MEMBERSHIP
   :type: int

   Join a multicast group. An :data:`IPPROTO_IP`-level
   :meth:`~socket.socket.setsockopt` option.

.. data:: IP_DROP_MEMBERSHIP
   :type: int

   Leave a multicast group. An :data:`IPPROTO_IP`-level
   :meth:`~socket.socket.setsockopt` option.

.. data:: TCP_NODELAY
   :type: int

   Disable Nagle's algorithm. An :data:`IPPROTO_TCP`-level
   :meth:`~socket.socket.setsockopt` option.

.. data:: MSG_PEEK
   :type: int

   For :meth:`~socket.socket.recv` / :meth:`~socket.socket.recvfrom`: return
   data without removing it from the input queue.

.. data:: MSG_DONTWAIT
   :type: int

   For :meth:`~socket.socket.recv` / :meth:`~socket.socket.recvfrom`: perform
   the operation in non-blocking mode.

Classes
-------

.. class:: socket(af: int = AF_INET, type: int = SOCK_STREAM, proto: int = IPPROTO_TCP, /)

   Create a new socket using the given address family, socket type and
   protocol number. Specifying *proto* is in most cases not required (and not
   recommended); the *type* argument selects the needed protocol
   automatically::

        # Create STREAM TCP socket
        socket(AF_INET, SOCK_STREAM)
        # Create DGRAM UDP socket
        socket(AF_INET, SOCK_DGRAM)

   .. method:: close() -> None

      Mark the socket closed and release all resources. Once that happens, all future operations
      on the socket object will fail. The remote end will receive EOF indication if
      supported by protocol.

      Sockets are automatically closed when they are garbage-collected, but it is recommended
      to :meth:`close()` them explicitly as soon you finished working with them.

   .. method:: bind(address: Any) -> None

      Bind the socket to *address*. The socket must not already be bound.

   .. method:: listen(backlog: int = 2) -> None

      Enable a server to accept connections. If *backlog* is specified, it must be at least 0
      (if it's lower, it will be set to 0); and specifies the number of unaccepted connections
      that the system will allow before refusing new connections. If not specified, a default
      reasonable value is chosen.

   .. method:: accept() -> Tuple["socket", Tuple]

      Accept a connection. The socket must be bound to an address and listening for connections.
      The return value is a pair (conn, address) where conn is a new socket object usable to send
      and receive data on the connection, and address is the address bound to the socket on the
      other end of the connection.

   .. method:: connect(address: Any) -> None

      Connect to a remote socket at *address*.

   .. method:: send(bytes: bytes) -> int

      Send data to the socket. The socket must be connected to a remote socket.
      Returns number of bytes sent, which may be smaller than the length of data
      ("short write").

   .. method:: sendall(bytes: bytes) -> None

      Send all data to the socket. The socket must be connected to a remote socket.
      Unlike :meth:`send()`, this method will try to send all of data, by sending data
      chunk by chunk consecutively.

      The behaviour of this method on non-blocking sockets is undefined. Due to this,
      on MicroPython, it's recommended to use :meth:`write()` method instead, which
      has the same "no short writes" policy for blocking sockets, and will return
      number of bytes sent on non-blocking sockets.

   .. method:: recv(bufsize: int, flags: int = 0) -> bytes

      Receive data from the socket. The return value is a bytes object representing the data
      received. The maximum amount of data to be received at once is specified by bufsize.

      The optional *flags* argument is a bitwise OR of message flags
      (:data:`MSG_PEEK`, :data:`MSG_DONTWAIT`), which have the same meaning as
      in CPython.

   .. method:: sendto(bytes: bytes, address: Any) -> int

      Send data to the socket. The socket should not be connected to a remote socket, since the
      destination socket is specified by *address*.

   .. method:: recvfrom(bufsize: int, flags: int = 0) -> Tuple[bytes, Tuple]

     Receive data from the socket. The return value is a pair *(bytes, address)* where *bytes* is a
     bytes object representing the data received and *address* is the address of the socket sending
     the data.

     See the :meth:`recv` function for an explanation of the optional *flags* argument.

   .. method:: setsockopt(level: int, optname: int, value: Union[int, bytes]) -> None

      Set the value of the given socket option. The needed symbolic constants are defined in the
      socket module (SO_* etc.). The *value* can be an integer or a bytes-like object representing
      a buffer.

   .. method:: settimeout(value: Optional[float]) -> None

      Set a timeout on blocking socket operations. The value argument can be a nonnegative floating
      point number expressing seconds, or None. If a non-zero value is given, subsequent socket operations
      will raise an :exc:`OSError` exception if the timeout period value has elapsed before the operation has
      completed. If zero is given, the socket is put in non-blocking mode. If None is given, the socket
      is put in blocking mode.

      A portable and generic alternative is to use a :class:`select.poll`
      object. This allows waiting on multiple objects at the same time (and
      not just on sockets, but on generic :std:term:`stream` objects which
      support polling). Example::

           # Instead of:
           s.settimeout(1.0)  # time in seconds
           s.read(10)  # may timeout

           # Use:
           poller = select.poll()
           poller.register(s, select.POLLIN)
           res = poller.poll(1000)  # time in milliseconds
           if not res:
               # s is still not ready for input, i.e. operation timed out

      .. admonition:: Difference to CPython
         :class: attention

         CPython raises a ``socket.timeout`` exception in case of timeout,
         which is an :exc:`OSError` subclass. MicroPython raises an OSError directly
         instead. If you use ``except OSError:`` to catch the exception,
         your code will work both in MicroPython and CPython.

   .. method:: setblocking(flag: bool) -> None

      Set blocking or non-blocking mode of the socket: if flag is false, the socket is set to non-blocking,
      else to blocking mode.

      This method is a shorthand for certain :meth:`settimeout()` calls:

      * ``sock.setblocking(True)`` is equivalent to ``sock.settimeout(None)``
      * ``sock.setblocking(False)`` is equivalent to ``sock.settimeout(0)``

   .. method:: makefile(mode: str = 'rb', buffering: int = 0, /) -> Any

      Return a file object associated with the socket. The exact returned type depends on the arguments
      given to makefile(). The support is limited to binary modes only ('rb', 'wb', and 'rwb').
      CPython's arguments: *encoding*, *errors* and *newline* are not supported.

      .. admonition:: Difference to CPython
         :class: attention

         As MicroPython doesn't support buffered streams, values of *buffering*
         parameter is ignored and treated as if it was 0 (unbuffered).

      .. admonition:: Difference to CPython
         :class: attention

         Closing the file object returned by makefile() WILL close the
         original socket as well.

   .. method:: read(size: int | None = None) -> bytes

      Read up to size bytes from the socket. Return a bytes object. If *size* is not given, it
      reads all data available from the socket until EOF; as such the method will not return until
      the socket is closed. This function tries to read as much data as
      requested (no "short reads"). This may be not possible with
      non-blocking socket though, and then less data will be returned.

   .. method:: readinto(buf: bytearray | memoryview, nbytes: int | None = None) -> int

      Read bytes into the *buf*.  If *nbytes* is specified then read at most
      that many bytes.  Otherwise, read at most *len(buf)* bytes. Just as
      :meth:`read()`, this method follows "no short reads" policy.

      Return value: number of bytes read and stored into *buf*.

   .. method:: readline() -> bytes

      Read a line, ending in a newline character.

      Return value: the line read.

   .. method:: write(buf: bytes) -> int

      Write the buffer of bytes to the socket. This function will try to
      write all data to a socket (no "short writes"). This may be not possible
      with a non-blocking socket though, and returned value will be less than
      the length of *buf*.

      Return value: number of bytes written.

.. note::

   MicroPython does not implement ``socket.error``. CPython has a deprecated
   ``socket.error`` exception that is an alias of :exc:`OSError`; in MicroPython,
   use :exc:`OSError` directly to catch socket-related errors.
