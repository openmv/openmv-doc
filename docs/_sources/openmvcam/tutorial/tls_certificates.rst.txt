.. _tls_certificates:

Working with TLS certificates
=============================

The :mod:`ssl` module on the OpenMV Cam (built on mbedTLS) lets a script make
encrypted, authenticated network connections. To do anything beyond plain
encryption you need certificates. This page covers what they are, which key
types and file formats the camera accepts, how to create self-signed
certificates for development and obtain CA-signed ones for production, how to
get them onto the camera and verify a remote server, how to protect the
private key, and how certificate expiry and rotation affect a deployed device.

.. note::

   Self-signed certificates are appropriate for development, testing, and
   closed deployments where you control both ends of the connection. For a
   service that arbitrary clients (browsers, phones, third parties) must trust
   without extra configuration you need a certificate signed by a public
   Certificate Authority; see *CA-signed (publicly trusted) certificates*
   below.

Trust models
------------

A TLS connection can provide three increasing levels of assurance:

* **Encryption only** -- the traffic is encrypted but neither side proves who
  it is. Easy to set up (no certificate validation) but vulnerable to a
  man-in-the-middle attack. Use only for local testing.
* **Server authentication** -- the client verifies the server's certificate
  against a trusted certificate (the familiar HTTPS model). The OpenMV Cam can
  act as either the client (verifying a remote server) or the server
  (presenting its own certificate).
* **Mutual authentication (mTLS)** -- both ends present and verify
  certificates. Used where the server must also be sure of the client's
  identity.

Choosing a key type
-------------------

The camera's mbedTLS build supports ECDSA on the NIST/SEC prime curves and
RSA. There are three practical ways to make a key; **ECDSA P-256
(prime256v1) is recommended**:

* **ECDSA P-256 (prime256v1)** -- about 128-bit security with a 256-bit key.
  Tiny keys and signatures, and by far the fastest handshake of the supported
  options on a Cortex-M (elliptic-curve operations are much cheaper than RSA
  private-key operations). Universally supported by TLS peers. This is the best
  balance of security, speed, RAM/flash use and compatibility on an embedded
  device, which is why it is the default choice here.
* **ECDSA P-384 (secp384r1)** -- about 192-bit security. Still elliptic-curve,
  so reasonably efficient, but larger and slower than P-256 for a security
  margin that typical IoT deployments do not need. Use only if a long-lived
  certificate or a compliance requirement calls for it.
* **RSA-2048** -- about 112-bit security. Universally compatible, including
  with very old peers, but RSA keys and certificates are much larger and RSA
  private-key operations (done by the side presenting the certificate) are the
  slowest and most memory-hungry option on a microcontroller. Use only when a
  peer cannot do ECDSA.

.. note::

   **Ed25519 / Curve25519 keys are not supported.** The OpenMV Cam's mbedTLS
   build does not enable EdDSA or Curve25519, so an Ed25519 certificate or key
   will fail to load or handshake. Use one of the three options above.

File format: use DER
--------------------

The mbedTLS build used by the OpenMV Cam does not include PEM parsing, so the
camera reads certificates and keys only in **DER** form (the binary encoding).
OpenSSL produces PEM (base64 text) by default, so every file you copy to the
camera must be converted to DER first (shown below). You will need:

* A **private key** -- kept secret, used by whichever side presents a
  certificate.
* A **certificate** -- the public part, presented to the other side during the
  handshake.
* A **CA / trust certificate** -- the certificate the *verifying* side loads to
  decide whether the peer is trusted. For a self-signed setup this is simply
  the peer's own certificate.

Installing OpenSSL
------------------

The commands in this guide use the ``openssl`` command-line tool, run on your
development machine -- not on the camera. It is often already installed; check
with::

    openssl version

If it is missing, install it for your operating system:

* **Linux** -- use the package manager, e.g. ``sudo apt install openssl``
  (Debian/Ubuntu), ``sudo dnf install openssl`` (Fedora/RHEL) or
  ``sudo pacman -S openssl`` (Arch).
* **macOS** -- ``brew install openssl`` using `Homebrew
  <https://brew.sh>`__.
* **Windows** -- install a build such as `Win32/Win64 OpenSSL
  <https://slproweb.com/products/Win32OpenSSL.html>`__, use a package
  manager (``winget install ShiningLight.OpenSSL.Light`` or
  ``choco install openssl``), or use the ``openssl`` that ships with
  `Git for Windows <https://git-scm.com/download/win>`__ (run it from Git
  Bash).

Creating a self-signed certificate
----------------------------------

Run OpenSSL on your development machine. The ``subjectAltName`` (SAN) is what
modern TLS clients check during hostname verification, so set it to the
host name(s) and/or IP address(es) clients will use to reach the camera
(``CN`` alone is legacy and is ignored by many clients). Replace
``DNS:openmv`` / ``IP:192.168.1.50`` with the address your clients actually
connect to.

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

   A **client** certificate (used for mutual authentication, below) is created
   with exactly these same commands -- there is nothing client-specific about
   the certificate itself. Just generate a second, independent key/certificate
   pair under different names (e.g. ``client.key`` / ``client.crt``) and use it
   on the client as shown in the mTLS example. The ``subjectAltName`` only
   matters for the side whose host name the peer verifies (the client checks
   the server's name; nothing checks the client's), so it can be omitted for a
   client-only certificate. The ``-subj`` / ``CN`` is likewise just a label on
   a client certificate -- the server side here checks only that the
   certificate chains to a trusted CA, it never matches the name -- so set it
   to whatever identifies that client (e.g. ``/CN=sensor-01``). Keep some
   ``-subj`` value regardless, so OpenSSL can generate the certificate
   non-interactively.

Certificate lifetime is set by ``-days``; certificates expire and must be
regenerated and redeployed before then -- see `Certificate expiry and
rotation`_ below.

Converting to DER
-----------------

Convert both the certificate and the private key to DER before copying them to
the camera::

    openssl x509 -in server.crt -outform DER -out server.der
    openssl pkey -in server.key -outform DER -out server.key.der

Copying files to the camera
---------------------------

Copy the DER files to the camera's filesystem -- for example by dragging them
onto the OpenMV Cam's USB drive, or with ``mpremote cp server.der :`` and
``mpremote cp server.key.der :``. On the verifying side, also copy the CA /
peer certificate in DER form.

The DER files do not have to live on the writable filesystem. MicroPython can
also mount a read-only **ROMFS** image at ``/rom``, and certificates placed
there are loaded exactly like any other file -- e.g.
``ctx.load_cert_chain("/rom/server.der", "/rom/server.key.der")``. A ROMFS
image is prepared on your development machine (for example with
``mpremote romfs``) and is read-only at runtime, so the certificate cannot be
altered on the device -- useful for locking down a production unit. Note that a
private key stored in ROMFS is still readable by code running on the camera;
ROMFS protects against *modification*, not *extraction*. A ROMFS-resident
certificate can only be replaced by rebuilding and reflashing the image, so
weigh that against `Certificate expiry and rotation`_ below.

Setting the clock
-----------------

:data:`ssl.CERT_REQUIRED` checks each certificate's validity period, so the
camera's clock must be correct or verification fails (a freshly powered-up
camera has no idea what time it is). With a working network connection, the
:mod:`ntptime` module fetches the time over NTP and sets the on-board RTC
(:class:`machine.RTC`), in UTC::

    import ntptime

    ntptime.settime()                 # query NTP and set machine.RTC (UTC)

After this, :func:`time.localtime` and :class:`machine.RTC` reflect the
current UTC time. Bringing the network interface up is board-specific and is
not shown here; the examples below assume the camera is already connected.

Using the certificate
----------------------

A complete **client** that sets the clock, opens a socket, verifies a
self-signed server, and exchanges data::

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

A complete **server** presenting its certificate and key::

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

For **mutual authentication (mTLS)** the server additionally requires and
verifies a client certificate, and the client presents one of its own::

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

See the :mod:`ssl` module documentation for the full API.

.. note::

   Everything on this page applies unchanged to **DTLS** (TLS over UDP). The
   keys, certificates, DER format, trust model, expiry concerns, and the
   ``load_cert_chain`` / ``load_verify_locations`` calls are identical; only
   the transport differs -- you wrap a ``socket.SOCK_DGRAM`` socket and select
   :data:`ssl.PROTOCOL_DTLS_CLIENT` / :data:`ssl.PROTOCOL_DTLS_SERVER` instead
   of the ``TLS`` protocol constants. The one extra wrinkle is a server-side
   anti-spoofing cookie -- the first connection from a new client is expected
   to fail and the client simply retries; see :ref:`dtls` for details.

CA-signed (publicly trusted) certificates
-----------------------------------------

Self-signed certificates work when you control both ends. If instead arbitrary
clients (browsers, phones, third-party software) must connect to the camera
*without* being told to trust a custom certificate, the certificate has to be
signed by a public Certificate Authority (CA) that those clients already
trust. The TLS code on the camera is identical to the self-signed case --
``load_cert_chain`` with a certificate and a key in DER form -- only how you
obtain that certificate changes.

The single most important point: **you generate the private key yourself and
it never leaves your machine.** The CA never sees it. What you send the CA is
a *certificate signing request* (CSR) -- a small file containing your public
key and your domain name -- and what you get back is a *certificate* (your
public key and name, signed by the CA). The key and the certificate are two
separate files produced by two separate steps; the CA only ever handles the
public half.

The general flow, all done on a normal machine (never on the camera):

#. **Get a domain name.** Public CAs certify a DNS name you control
   (e.g. ``cam.example.com``); they will not issue for a bare IP address or a
   made-up name like ``openmv``.

#. **Generate a key and a CSR.** One OpenSSL command produces the private key
   and the matching CSR. Use the same key type you would for a self-signed
   certificate (see `Choosing a key type`_); ECDSA P-256 is recommended.

   ECDSA P-256 -- recommended::

       openssl req -new -newkey ec -pkeyopt ec_paramgen_curve:prime256v1 \
           -nodes -keyout domain.key -out domain.csr \
           -subj "/CN=cam.example.com" \
           -addext "subjectAltName=DNS:cam.example.com"

   ECDSA P-384 -- stronger, larger/slower::

       openssl req -new -newkey ec -pkeyopt ec_paramgen_curve:secp384r1 \
           -nodes -keyout domain.key -out domain.csr \
           -subj "/CN=cam.example.com" \
           -addext "subjectAltName=DNS:cam.example.com"

   RSA-2048 -- maximum compatibility::

       openssl req -new -newkey rsa:2048 \
           -nodes -keyout domain.key -out domain.csr \
           -subj "/CN=cam.example.com" \
           -addext "subjectAltName=DNS:cam.example.com"

   Keep ``domain.key`` secret -- this is the key file you will eventually put
   on the camera. ``domain.csr`` is the file you hand to the CA; it contains
   no secrets.

#. **Submit the CSR and prove you control the domain.** This is where the two
   common routes differ:

   * An automated ACME CA such as `Let's Encrypt
     <https://letsencrypt.org>`__, driven by a tool like ``certbot`` or
     ``acme.sh``, does steps 2 and 3 for you: it generates the key, builds the
     CSR, answers the challenge automatically (HTTP-01: serve a token over
     port 80 on the domain, or DNS-01: publish a TXT record in its DNS) and
     writes out the finished files.
   * A commercial CA (bought directly or through a domain/hosting reseller):
     you paste the ``domain.csr`` text into a web form, then prove control by
     replying to a validation email, publishing a DNS record, or placing a
     file on a web server for that domain. Once validated you download the
     issued files.

#. **Collect the issued files.** To make sense of what you receive, it helps
   to know that certificates form a *chain of trust*: your domain's
   certificate is signed by an intermediate CA, which is in turn signed by a
   root CA. Each link vouches for the one below it. You end up with:

   * Your **private key** (from step 2). The CA never had it; it stays on
     your machine and is the key you eventually put on the camera.
   * The **leaf** certificate -- also called the *end-entity* or *server*
     certificate. This is the certificate for your specific domain
     (``cam.example.com``): it contains your public key and your name, and is
     signed by the CA's intermediate. This is the certificate the camera
     presents to identify itself.
   * One or more **intermediate CA certificates** (the "chain" or "CA
     bundle"). A CA does not sign your leaf with its root directly -- the
     root's key is kept offline and heavily protected -- so it signs with an
     intermediate, which is itself signed by the root. The intermediate is the
     link that connects your leaf up to the root.

   The **root** certificate is the *trust anchor*: a self-signed certificate
   belonging to the CA that sits at the top of the chain. You are not given it
   and never deploy it, because every client already has it -- operating
   systems, browsers, phones and language runtimes ship with a built-in
   "trust store" of root certificates. A client trusts your leaf by walking
   the chain: it already trusts the root, the root vouches for the
   intermediate, and the intermediate vouches for your leaf. (This is exactly
   the job your single ``server.der`` / ``cafile`` does in the self-signed
   case -- there *you* are your own root.)

   A **fullchain** file is simply the leaf and the intermediate(s)
   concatenated into one file, leaf first, deliberately *without* the root
   (sending the root is pointless -- a client only trusts roots it already
   has). A normal server presents this entire fullchain so any client can walk
   it. The camera cannot: it loads and presents a single certificate, which is
   the reason for the limitation noted below.

   File names you will actually see: an ACME tool such as ``certbot`` writes
   ``privkey.pem`` (your key), ``cert.pem`` (the leaf alone), ``chain.pem``
   (the intermediate(s) alone) and ``fullchain.pem`` (leaf + intermediate(s)).
   A commercial CA usually gives you a ``.crt`` for the leaf and a
   ``.ca-bundle`` for the intermediate(s), with the ``.key`` being the one you
   generated yourself.

#. **Convert and copy.** Convert the private key and the leaf certificate to
   DER and copy them to the camera exactly as in `Converting to DER`_ and
   `Copying files to the camera`_ above. The camera then presents them as its
   server certificate and standard clients accept the connection
   automatically, because they already trust the CA -- no client-side
   configuration is needed.

There is one embedded limitation to be aware of regarding the chain from
step 4. The camera loads and presents **one** certificate -- the leaf. It
cannot also send the intermediate certificate(s) the CA gave you.

.. tip::

   In practice:

   * Clients that already have the CA's intermediate cached -- mainstream
     browsers and HTTPS libraries usually do -- complete the chain themselves
     and connect fine.
   * Clients that rely on the *server* to supply the intermediate will fail
     the handshake against the camera.

   If every possible client must succeed, do not terminate public TLS on the
   camera directly. Put a gateway / reverse proxy in front of it that serves
   the full chain to the outside world, and have the proxy reach the camera
   over the self-signed flow described above.

Verifying a public server (camera as client)
--------------------------------------------

Everything above about a client "already having the root" is true of browsers,
phones and PCs -- it is **not** true of the camera. MicroPython's :mod:`ssl`
ships with no built-in trust store: a freshly flashed camera trusts no CA at
all, and the default (:data:`ssl.CERT_NONE`) verifies nothing and is wide open
to a man-in-the-middle. So when the camera is the *client* connecting out to a
public TLS server (an HTTPS API, an MQTT broker, ...) and you want it to truly
verify that server, you have to supply the trust anchor yourself.

The mechanics are the same as the self-signed client example; the only
difference is that the file you load is a real CA certificate instead of the
peer's own certificate:

#. **Get the CA certificate that anchors the server's chain.** "Anchors"
   means the certificate at (or near) the top of the server's chain that you
   choose as your starting point of trust. A TLS server sends its leaf and
   usually its intermediate(s); it never sends its root. You must obtain that
   trust anchor yourself and *independently of the server* -- simply trusting
   whatever a server hands you would defeat the entire point of verification.

   First find out which CA actually issued the server's certificate. For
   example, against ``openmv.io``::

       openssl s_client -connect openmv.io:443 -showcerts < /dev/null

   The ``Certificate chain`` block lists each certificate with its subject
   (``s:``) and issuer (``i:``); newer OpenSSL also prints ``a:`` (key type)
   and ``v:`` (validity) lines you can ignore here::

       Certificate chain
        0 s:CN=openmv.io
          i:C=US, O=Let's Encrypt, CN=E8
        1 s:C=US, O=Let's Encrypt, CN=E8
          i:C=US, O=Internet Security Research Group, CN=ISRG Root X1

   Entry 0 is the leaf (``openmv.io``), issued by the intermediate ``E8``.
   Entry 1 is that intermediate, issued by the root ``ISRG Root X1``. The
   issuer (``i:``) of the topmost entry names the root -- here
   ``ISRG Root X1``. (The intermediate is ``E8`` rather than the ``R10`` /
   ``R11`` you may have seen elsewhere because ``openmv.io`` uses an ECDSA
   certificate; Let's Encrypt signs ECDSA leaves with its ``E``-series
   intermediates and RSA leaves with its ``R``-series ones. Both chain to
   ``ISRG Root X1``.)

   OpenSSL also prints ``depth=`` lines and may report the root with
   ``Verification: OK``. That happens only because *your PC* already trusts
   ``ISRG Root X1`` -- the server did **not** send it (a server never sends
   its root), and the camera, having no trust store, will not have it either.
   That is exactly why you must supply it.

   Download *that* root from the CA's own published roots. Let's Encrypt
   catalogues all of theirs on the `Let's Encrypt certificates page
   <https://letsencrypt.org/certs/>`__; the direct file for ISRG Root X1 is
   `isrgrootx1.pem <https://letsencrypt.org/certs/isrgrootx1.pem>`__ (they
   also offer it pre-encoded as `isrgrootx1.der
   <https://letsencrypt.org/certs/isrgrootx1.der>`__, which lets you skip the
   DER conversion in the next step). Other CAs publish theirs on a similar
   "root certificates" / "repository" page; the canonical public set is the
   `Mozilla CA program (CCADB) <https://www.ccadb.org/>`__. Confirm you
   fetched the right file by comparing its fingerprint against the value the
   CA publishes (add ``-inform DER`` if you downloaded the ``.der``)::

       openssl x509 -in isrgrootx1.pem -noout -subject -fingerprint -sha256

   If you would rather not track a root, you can instead copy the
   **intermediate** straight out of the ``-showcerts`` output (the second
   ``-----BEGIN CERTIFICATE-----`` block), trust that, and accept that you
   must refresh it whenever the CA rotates the intermediate -- far more often
   than the root (see the trade-off below).

#. **Convert it to DER**, exactly as before::

       openssl x509 -in isrgrootx1.pem -outform DER -out ca.der

#. **Copy** ``ca.der`` to the camera (filesystem or ROMFS) and load it as the
   trust anchor::

       import socket
       import ssl
       import ntptime

       ntptime.settime()                  # validity check needs the clock

       addr = socket.getaddrinfo("api.example.com", 443)[0][-1]
       sock = socket.socket()
       sock.connect(addr)

       ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
       ctx.verify_mode = ssl.CERT_REQUIRED
       ctx.load_verify_locations(cafile="ca.der")
       ssock = ctx.wrap_socket(sock, server_hostname="api.example.com")

   ``server_hostname`` is required here: it drives SNI and is the name checked
   against the server certificate's ``subjectAltName``.

.. tip::

   **Common-case shortcut.** Let's Encrypt is the most widely used public CA,
   and both its RSA and ECDSA certificates currently chain to ISRG Root X1
   (as the ``openmv.io`` example above shows). If the servers your camera
   talks to use Let's Encrypt, you can skip the inspection entirely: just put
   `isrgrootx1.der <https://letsencrypt.org/certs/isrgrootx1.der>`__ on the
   camera and ``load_verify_locations`` it.

   This does **not** make TLS work to *every* site. A server whose
   certificate comes from a different CA (DigiCert, Google Trust Services,
   Amazon, Sectigo, ...) will still fail verification, and because the camera
   trusts a single DER certificate per :class:`ssl.SSLContext` you cannot
   bundle every root the way a browser does. When in doubt, identify the
   server's actual CA as shown above and trust that root.

Which certificate you trust is a trade-off:

* **The root** (recommended). Long-lived -- often decades -- so ``ca.der``
  rarely changes. It requires the server to send its intermediate so mbedTLS
  can build the path leaf → intermediate → your trusted root; virtually every
  correctly configured public server does.
* **The intermediate.** Also works, and keeps working even if a server omits
  the intermediate, but intermediates are rotated far more often than roots,
  so you will have to refresh ``ca.der`` more frequently.
* **The leaf itself** (certificate pinning). Tightest, but the leaf changes on
  every renewal -- roughly every 90 days for Let's Encrypt -- so this only
  makes sense when you also control the server and can push the new pin to
  every camera in lockstep. This is exactly what the self-signed client
  example does.

.. note::

   :meth:`ssl.SSLContext.load_verify_locations` takes a single DER-encoded CA
   certificate, so the camera trusts exactly one anchor at a time. To reach
   servers under different CAs, use a separate :class:`ssl.SSLContext` per
   anchor. And because that certificate will itself eventually expire or be
   rotated by the CA, treat it like any other certificate on the device --
   see `Certificate expiry and rotation`_.

Protecting the private key
--------------------------

Whenever the camera *presents* a certificate -- as a TLS server, or as the
client in mTLS -- its private key has to live on the device, in plain DER, on
the filesystem or in ROMFS. Stored that way it is readable by any code running
on the camera and by anyone with physical access to it: the USB mass-storage
drive, a REPL prompt, or the raw flash. ROMFS and read-only flags prevent *modification*, not
*extraction*. **Treat any private key shipped on a device as recoverable by a
determined attacker with physical or code access.**

This does not make TLS pointless -- it shapes how you deploy it:

* **Use a unique key and certificate per device.** Never flash one shared key
  across the fleet: extracting it from a single unit would then let an
  attacker impersonate every camera. Per-device keys keep a compromise to that
  one device, which you can revoke or disable server-side.
* **Keep certificates short-lived.** A stolen key is only useful while its
  certificate is valid; short lifetimes plus routine rotation bound the
  damage (see `Certificate expiry and rotation`_).
* **Avoid putting a secret on the device at all when you can.** If you only
  need to verify the *server* (server authentication, not mTLS), the camera
  as a client stores only the CA certificate -- which is public -- and holds
  no private key worth stealing.
* **Never ship a key in a public firmware image.** A key baked into ROMFS in
  a firmware build you distribute is not secret; anyone who downloads the
  firmware has it. Per-device provisioning means programming the key *after*
  the generic firmware, not inside it.
* **Limit blast radius.** Scope whatever the certificate authenticates to
  (least privilege), and make sure a single leaked device identity can be
  revoked or disabled without affecting the rest.

If your threat model includes attackers with physical access, design on the
assumption that the device key *will* eventually leak and make that
survivable, rather than assuming it can be kept secret on hardware that has no
facility to do so.

Certificate expiry and rotation
-------------------------------

Every certificate carries a validity window. Once it passes, a
:data:`ssl.CERT_REQUIRED` peer rejects the connection -- so expiry is a real,
scheduled outage, not a theoretical risk. The camera's clock must also be
correct for the validity check to be evaluated honestly (set it with
:func:`ntptime.settime`, as shown under *Setting the clock* above).

* **Self-signed.** You picked the lifetime with ``-days``. When it lapses you
  must regenerate the key/certificate and redeploy it: re-copy the DER files,
  or rebuild and reflash the ROMFS image if the certificate is baked in. Pick a
  ``-days`` value you will actually remember to act on.
* **Public CA.** These are deliberately short-lived. Let's Encrypt issues
  90-day certificates and expects automated renewal roughly every 60 days;
  there is no "install once and forget" option.

The broader trend is one-directional: the maximum validity of publicly-trusted
TLS certificates keeps shrinking. It was 825 days, is currently capped at 398
days, and the CA/Browser Forum has adopted a schedule that steps it down toward
roughly 47 days by 2029. The takeaway for a device design is to assume
certificates are short-lived and that rotation must be automated or at least
routine -- do not ship a product that depends on a human swapping a ten-year
certificate.

Practically, on the camera: prefer designs where the certificate can be
replaced without reflashing (a writable filesystem plus a remote-update path,
or running the camera as a *client* that trusts a CA you rotate centrally). If
a certificate must live in ROMFS, schedule firmware updates around its
lifetime. In all cases keep the clock synchronised with :func:`ntptime.settime`
so the validity check is accurate.

Troubleshooting
---------------

* **The clock must be set.** If the camera's clock is wrong (for example not
  yet set after power-up) the certificate validity check fails -- call
  :func:`ntptime.settime` first, as shown above.
* **Host name must match.** When the client passes ``server_hostname`` it must
  match the certificate's ``subjectAltName`` (or ``CN`` on older stacks), or
  verification fails.
* **Wrong format.** A PEM file copied to the camera will not load -- convert
  to DER as shown above.
* **Certificate expired.** A connection that worked before and now fails with
  :exc:`OSError` may simply have an expired certificate -- check the validity
  dates and regenerate/redeploy as needed (see `Certificate expiry and
  rotation`_ above).
* **Ed25519 keys fail.** Use ECDSA P-256/P-384 or RSA, not Ed25519.
* **Errors are** :exc:`OSError`. MicroPython does not implement
  ``ssl.SSLError``; TLS failures (bad certificate, expired, unknown CA, format
  error, handshake failure) are raised as :exc:`OSError`.
