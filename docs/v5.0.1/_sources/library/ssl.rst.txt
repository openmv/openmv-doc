:mod:`ssl` --- SSL/TLS module
=============================

.. module:: ssl
   :synopsis: TLS/SSL wrapper for socket objects

This module provides access to Transport Layer Security (previously and
widely known as “Secure Sockets Layer”) encryption and peer authentication
facilities for network sockets, both client-side and server-side.

.. tip::

   **New to TLS on the camera?** Start with the :ref:`tls_certificates`
   tutorial. It walks through choosing key types, creating and converting
   certificates to the DER format the camera requires, getting them onto the
   device, and verifying servers and clients -- with complete working
   examples.

.. note::

   MicroPython does not implement ``ssl.SSLError``. SSL/TLS failures are
   raised as ``OSError`` instead.

Examples
--------

TLS client, verifying the server's certificate against a CA certificate
(in DER format) stored on the filesystem::

    import socket
    import ssl
    import ntptime

    # CERT_REQUIRED checks the certificate's validity dates, so the clock
    # must be set (see the certificates tutorial linked above).
    ntptime.settime()

    # Open a plain TCP connection.
    addr = socket.getaddrinfo("example.com", 443)[0][-1]
    sock = socket.socket()
    sock.connect(addr)

    # Wrap it for TLS and require a valid certificate.
    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
    ctx.verify_mode = ssl.CERT_REQUIRED
    ctx.load_verify_locations(cafile="ca.der")
    ssock = ctx.wrap_socket(sock, server_hostname="example.com")

    ssock.write(b"GET / HTTP/1.0\r\nHost: example.com\r\n\r\n")
    print(ssock.read())
    ssock.close()

For a quick, **insecure** connection (no certificate validation) the
:func:`ssl.wrap_socket` convenience function can be used instead::

    ssock = ssl.wrap_socket(sock, server_hostname="example.com")

TLS server, presenting its own certificate and private key (DER format)::

    import socket
    import ssl

    sock = socket.socket()
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.bind(socket.getaddrinfo("0.0.0.0", 8443)[0][-1])
    sock.listen(1)

    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ctx.load_cert_chain("server.der", "server.key")

    while True:
        client, addr = sock.accept()
        sclient = ctx.wrap_socket(client, server_side=True)
        sclient.write(b"hello\n")
        sclient.close()

Functions
---------

.. function:: ssl.wrap_socket(sock: Any, server_side: bool = False, key: Optional[bytes] = None, cert: Optional[bytes] = None, cert_reqs: int = CERT_NONE, cadata: Optional[bytes] = None, server_hostname: Optional[str] = None, do_handshake: bool = True) -> Any

    Wrap the given *sock* and return a new wrapped-socket object.  The implementation
    of this function is to first create an :class:`SSLContext` and then call the :meth:`SSLContext.wrap_socket`
    method on that context object.  The arguments *sock*, *server_side* and *server_hostname* are
    passed through unchanged to the method call.  The argument *do_handshake* is passed through as
    *do_handshake_on_connect*.  The remaining arguments have the following behaviour:

   - *cert_reqs* determines whether the peer (server or client) must present a valid certificate.
     Note that ``ssl.CERT_NONE`` and ``ssl.CERT_OPTIONAL`` do not validate any
     certificate; only ``ssl.CERT_REQUIRED`` does.

   - *cadata* is a bytes object containing the CA certificate chain (in DER format) that will
     validate the peer's certificate.  Currently only a single DER-encoded certificate is supported.

Classes
-------

.. class:: SSLContext(protocol: int, /)

    Create a new SSLContext instance.  The *protocol* argument must be one of the ``PROTOCOL_*``
    constants.

    .. method:: load_cert_chain(certfile: Union[str, bytes], keyfile: Union[str, bytes]) -> None

       Load a private key and the corresponding certificate.  The *certfile* is a string
       with the file path of the certificate.  The *keyfile* is a string with the file path
       of the private key.

       .. admonition:: Difference to CPython
          :class: attention

          MicroPython extension: *certfile* and *keyfile* can be bytes objects instead of
          strings, in which case they are interpreted as the actual certificate/key data.

    .. method:: load_verify_locations(cafile: Optional[str] = None, cadata: Optional[bytes] = None) -> None

       Load the CA certificate chain that will validate the peer's certificate.
       *cafile* is the file path of the CA certificates.  *cadata* is a bytes object
       containing the CA certificates.  Only one of these arguments should be provided.

    .. method:: get_ciphers() -> List[str]

       Get a list of enabled ciphers, returned as a list of strings.

    .. method:: set_ciphers(ciphers: List[str]) -> None

       Set the available ciphers for sockets created with this context.  *ciphers* should be
       a list of strings in the `IANA cipher suite format <https://wiki.mozilla.org/Security/Cipher_Suites>`_ .

    .. method:: wrap_socket(sock: Any, *, server_side: bool = False, do_handshake_on_connect: bool = True, server_hostname: Optional[str] = None, client_id: Optional[bytes] = None) -> Any

       Takes a :std:term:`stream` *sock* (usually socket.socket instance of ``SOCK_STREAM`` type),
       and returns an instance of ssl.SSLSocket, wrapping the underlying stream.
       The returned object has the usual :std:term:`stream` interface methods like
       ``read()``, ``write()``, etc.

       - *server_side* selects whether the wrapped socket is on the server or client side.
         A server-side SSL socket should be created from a normal socket returned from
         :meth:`~socket.socket.accept()` on a non-SSL listening server socket.

       - *do_handshake_on_connect* determines whether the handshake is done as part of the ``wrap_socket``
         or whether it is deferred to be done as part of the initial reads or writes
         For blocking sockets doing the handshake immediately is standard. For non-blocking
         sockets (i.e. when the *sock* passed into ``wrap_socket`` is in non-blocking mode)
         the handshake should generally be deferred because otherwise ``wrap_socket`` blocks
         until it completes.

       - *server_hostname* is for use as a client, and sets the hostname to check against the received
         server certificate.  It also sets the name for Server Name Indication (SNI), allowing the server
         to present the proper certificate.

       - *client_id* is a MicroPython-specific extension argument used only when implementing a DTLS
         Server. See :ref:`dtls` for details.

       .. warning::

          By default no certificate validation is performed
          (:data:`ssl.CERT_NONE`). For a secure connection you must verify the
          peer's certificate by setting *cert_reqs* /
          :attr:`SSLContext.verify_mode` to :data:`ssl.CERT_REQUIRED`;
          otherwise the connection is vulnerable to man-in-the-middle attacks.

          CPython's ``wrap_socket`` returns an ``SSLSocket`` object which has methods typical
          for sockets, such as ``send``, ``recv``, etc. MicroPython's ``wrap_socket``
          returns an object more similar to CPython's ``SSLObject`` which does not have
          these socket methods.

    .. attribute:: verify_mode

       Set or get the behaviour for verification of peer certificates.  Must be one of the
       ``CERT_*`` constants.

       .. note::

          ``ssl.CERT_REQUIRED`` requires the device's date/time to be properly set, e.g. using
          `mpremote rtc --set <mpremote_command_rtc>` or ``ntptime``, and ``server_hostname``
          must be specified when on the client side.

.. _dtls:

DTLS support
------------

.. admonition:: Difference to CPython
   :class: attention

   This is a MicroPython extension.

This module supports DTLS in client and server mode via the
:data:`PROTOCOL_DTLS_CLIENT` and :data:`PROTOCOL_DTLS_SERVER` constants that can be used as
the ``protocol`` argument of :class:`SSLContext`.

In this case the underlying socket is expected to behave as a datagram socket (i.e.
like the socket opened with ``socket.socket`` with ``socket.AF_INET`` as ``af`` and
``socket.SOCK_DGRAM`` as ``type``).

DTLS server support
^^^^^^^^^^^^^^^^^^^

MicroPython's DTLS server support is configured with "Hello Verify" as required
for DTLS 1.2. This is transparent for DTLS clients, but there are relevant
considerations when implementing a DTLS server in MicroPython:

- The server should pass an additional argument *client_id* when calling
  :meth:`SSLContext.wrap_socket()`. This ID must be a `bytes` object (or similar) with
  a transport-specific identifier representing the client.

  The simplest approach is to convert the tuple of ``(client_ip, client_port)``
  returned from ``socket.recv_from()`` into a byte string, i.e.::

        _, client_addr = sock.recvfrom(1, socket.MSG_PEEK)
        sock.connect(client_addr)  # Connect back to the client
        sock = ssl_ctx.wrap_socket(sock, server_side=True,
                                   client_id=repr(client_addr).encode())

- The first time a client connects, the server call to ``wrap_socket`` will fail
  with a :exc:`OSError` error "Hello Verify Required". This is because the DTLS
  "Hello Verify" cookie is not yet known by the client. If the same client
  connects a second time then ``wrap_socket`` will succeed.

- DTLS cookies for "Hello Verify" are associated with the :class:`SSLContext` object,
  so the same :class:`SSLContext` object should be used to wrap a subsequent connection
  from the same client. The cookie implementation includes a timeout and has
  constant memory use regardless of how many clients connect, so it's OK to
  reuse the same :class:`SSLContext` object for the lifetime of the server.

Constants
---------

.. data:: ssl.PROTOCOL_TLS_CLIENT
   :type: int

    Supported value for the *protocol* parameter, selecting TLS client mode.

.. data:: ssl.PROTOCOL_TLS_SERVER
   :type: int

    Supported value for the *protocol* parameter, selecting TLS server mode.

.. data:: ssl.PROTOCOL_DTLS_CLIENT
   :type: int

    Supported value for the *protocol* parameter, selecting DTLS client mode.

.. data:: ssl.PROTOCOL_DTLS_SERVER
   :type: int

    Supported value for the *protocol* parameter, selecting DTLS server mode.

.. data:: ssl.CERT_NONE
   :type: int

    Supported value for the *cert_reqs* parameter, and the
    :attr:`SSLContext.verify_mode` attribute.  No certificate verification is
    performed on the peer.

.. data:: ssl.CERT_OPTIONAL
   :type: int

    Supported value for the *cert_reqs* parameter, and the
    :attr:`SSLContext.verify_mode` attribute.  Certificate verification is
    optional.  Note that on the OpenMV Cam this behaves like
    :data:`ssl.CERT_NONE`.

.. data:: ssl.CERT_REQUIRED
   :type: int

    Supported value for the *cert_reqs* parameter, and the
    :attr:`SSLContext.verify_mode` attribute.  A valid certificate is required
    from the peer.
