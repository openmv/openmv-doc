Self-signed certificates
========================

The fastest way to get TLS working between two devices
you control. Both ends trust a single certificate that
you generate yourself; the public CA flow on
:doc:`ca-signed` is only needed when third-party clients
have to connect *without* being told to trust a custom
certificate.

Creating a self-signed certificate
----------------------------------

Run OpenSSL on your development machine. The
``subjectAltName`` (SAN) is what modern TLS clients
check during hostname verification, so set it to the
host name(s) and/or IP address(es) clients will use to
reach the camera (``CN`` alone is legacy and is ignored
by many clients). Replace ``DNS:openmv`` /
``IP:192.168.1.50`` with the address your clients
actually connect to.

ECDSA P-256 -- recommended::

    # Generate a P-256 private key.
    openssl ecparam -name prime256v1 -genkey -noout -out server.key

    # Self-signed certificate valid for one year, with a SAN.
    openssl req -new -x509 -key server.key -out server.crt -days 365 \
        -subj "/CN=openmv" -addext "subjectAltName=DNS:openmv,IP:192.168.1.50"

ECDSA P-384 -- stronger, larger/slower::

    openssl ecparam -name secp384r1 -genkey -noout -out server.key

    openssl req -new -x509 -key server.key -out server.crt -days 365 \
        -subj "/CN=openmv" -addext "subjectAltName=DNS:openmv,IP:192.168.1.50"

RSA-2048 -- maximum compatibility::

    openssl req -new -x509 -newkey rsa:2048 -nodes -keyout server.key \
        -out server.crt -days 365 -subj "/CN=openmv" \
        -addext "subjectAltName=DNS:openmv,IP:192.168.1.50"

.. note::

   A **client** certificate (used for mutual
   authentication, below) is created with exactly these
   same commands -- there is nothing client-specific
   about the certificate itself. Just generate a second,
   independent key/certificate pair under different
   names (e.g. ``client.key`` / ``client.crt``) and use
   it on the client as shown in the mTLS example. The
   ``subjectAltName`` only matters for the side whose
   host name the peer verifies (the client checks the
   server's name; nothing checks the client's), so it
   can be omitted for a client-only certificate. The
   ``-subj`` / ``CN`` is likewise just a label on a
   client certificate -- the server side here checks
   only that the certificate chains to a trusted CA, it
   never matches the name -- so set it to whatever
   identifies that client (e.g. ``/CN=sensor-01``).
   Keep some ``-subj`` value regardless, so OpenSSL
   can generate the certificate non-interactively.

Certificate lifetime is set by ``-days``; certificates
expire and must be regenerated and redeployed before
then -- see :doc:`operations`.

Converting to DER
-----------------

Convert both the certificate and the private key to
DER before copying them to the camera::

    openssl x509 -in server.crt -outform DER -out server.der
    openssl pkey -in server.key -outform DER -out server.key.der

Copying files to the camera
---------------------------

Copy the DER files to the camera's filesystem -- for
example by dragging them onto the OpenMV Cam's USB
drive, or with ``mpremote cp server.der :`` and
``mpremote cp server.key.der :``. On the verifying
side, also copy the CA / peer certificate in DER form.

The DER files do not have to live on the writable
filesystem. MicroPython can also mount a read-only
**ROMFS** image at ``/rom``, and certificates placed
there are loaded exactly like any other file -- e.g.
``ctx.load_cert_chain("/rom/server.der",
"/rom/server.key.der")``. A ROMFS image is prepared on
your development machine (for example with
``mpremote romfs``) and is read-only at runtime, so the
certificate cannot be altered on the device -- useful
for locking down a production unit. Note that a private
key stored in ROMFS is still readable by code running
on the camera; ROMFS protects against *modification*,
not *extraction*. A ROMFS-resident certificate can only
be replaced by rebuilding and reflashing the image, so
weigh that against the rotation discussion on
:doc:`operations`.

Using the certificate
---------------------

The clock setup from :doc:`prerequisites` has to happen
before any of these examples; the validity check fails
otherwise.

A complete **client** that sets the clock, opens a
socket, verifies a self-signed server, and exchanges
data::

    import socket
    import ssl
    import ntptime

    ntptime.settime()                 # correct clock for the validity check

    # Open a plain TCP connection.
    addr = socket.getaddrinfo("openmv", 8443)[0][-1]
    sock = socket.socket()
    sock.connect(addr)

    # Wrap it for TLS, trusting the server's self-signed certificate.
    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
    ctx.verify_mode = ssl.CERT_REQUIRED
    ctx.load_verify_locations(cafile="server.der")
    ssock = ctx.wrap_socket(sock, server_hostname="openmv")

    ssock.write(b"hello\n")
    print(ssock.read())
    ssock.close()

A complete **server** presenting its certificate and
key::

    import socket
    import ssl
    import ntptime

    ntptime.settime()                 # correct clock for the validity check

    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ctx.load_cert_chain("server.der", "server.key.der")

    sock = socket.socket()
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.bind(socket.getaddrinfo("0.0.0.0", 8443)[0][-1])
    sock.listen(1)

    while True:
        client, addr = sock.accept()
        sclient = ctx.wrap_socket(client, server_side=True)
        sclient.write(b"hello\n")
        print(sclient.read())
        sclient.close()

For **mutual authentication (mTLS)** the server
additionally requires and verifies a client
certificate, and the client presents one of its own::

    # Server side: also demand and verify a client certificate.
    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ctx.load_cert_chain("server.der", "server.key.der")
    ctx.verify_mode = ssl.CERT_REQUIRED
    ctx.load_verify_locations(cafile="client.der")

    # Client side: present a certificate of our own.
    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
    ctx.load_cert_chain("client.der", "client.key.der")
    ctx.verify_mode = ssl.CERT_REQUIRED
    ctx.load_verify_locations(cafile="server.der")

See the :mod:`ssl` module documentation for the full
API.

.. note::

   Everything on this page applies unchanged to
   **DTLS** (TLS over UDP). The keys, certificates,
   DER format, trust model, expiry concerns, and the
   ``load_cert_chain`` / ``load_verify_locations``
   calls are identical; only the transport differs --
   you wrap a ``socket.SOCK_DGRAM`` socket and select
   :data:`ssl.PROTOCOL_DTLS_CLIENT` /
   :data:`ssl.PROTOCOL_DTLS_SERVER` instead of the
   ``TLS`` protocol constants. The one extra wrinkle is
   a server-side anti-spoofing cookie -- the first
   connection from a new client is expected to fail and
   the client simply retries; see :ref:`dtls` for
   details.
