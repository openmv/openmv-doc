Verifying a public server (camera as client)
============================================

Everything on the previous page about a client "already
having the root" is true of browsers, phones and PCs --
it is **not** true of the camera. MicroPython's
:mod:`ssl` ships with no built-in trust store: a freshly
flashed camera trusts no CA at all, and the default
(:data:`ssl.CERT_NONE`) verifies nothing and is wide
open to a man-in-the-middle. So when the camera is the
*client* connecting out to a public TLS server (an
HTTPS API, an MQTT broker, ...) and you want it to truly
verify that server, you have to supply the trust anchor
yourself.

The mechanics are the same as the self-signed client
example on :doc:`self-signed`; the only difference is
that the file you load is a real CA certificate instead
of the peer's own certificate:

#. **Get the CA certificate that anchors the server's
   chain.** "Anchors" means the certificate at (or
   near) the top of the server's chain that you choose
   as your starting point of trust. A TLS server sends
   its leaf and usually its intermediate(s); it never
   sends its root. You must obtain that trust anchor
   yourself and *independently of the server* -- simply
   trusting whatever a server hands you would defeat
   the entire point of verification.

   First find out which CA actually issued the server's
   certificate. For example, against ``openmv.io``::

       openssl s_client -connect openmv.io:443 -showcerts < /dev/null

   The ``Certificate chain`` block lists each
   certificate with its subject (``s:``) and issuer
   (``i:``); newer OpenSSL also prints ``a:`` (key
   type) and ``v:`` (validity) lines you can ignore
   here::

       Certificate chain
        0 s:CN=openmv.io
          i:C=US, O=Let's Encrypt, CN=E8
        1 s:C=US, O=Let's Encrypt, CN=E8
          i:C=US, O=Internet Security Research Group, CN=ISRG Root X1

   Entry 0 is the leaf (``openmv.io``), issued by the
   intermediate ``E8``. Entry 1 is that intermediate,
   issued by the root ``ISRG Root X1``. The issuer
   (``i:``) of the topmost entry names the root -- here
   ``ISRG Root X1``. (The intermediate is ``E8`` rather
   than the ``R10`` / ``R11`` you may have seen
   elsewhere because ``openmv.io`` uses an ECDSA
   certificate; Let's Encrypt signs ECDSA leaves with
   its ``E``-series intermediates and RSA leaves with
   its ``R``-series ones. Both chain to ``ISRG Root
   X1``.)

   OpenSSL also prints ``depth=`` lines and may report
   the root with ``Verification: OK``. That happens
   only because *your PC* already trusts ``ISRG Root
   X1`` -- the server did **not** send it (a server
   never sends its root), and the camera, having no
   trust store, will not have it either. That is
   exactly why you must supply it.

   Download *that* root from the CA's own published
   roots. Let's Encrypt catalogues all of theirs on the
   `Let's Encrypt certificates page
   <https://letsencrypt.org/certs/>`__; the direct file
   for ISRG Root X1 is `isrgrootx1.pem
   <https://letsencrypt.org/certs/isrgrootx1.pem>`__
   (they also offer it pre-encoded as `isrgrootx1.der
   <https://letsencrypt.org/certs/isrgrootx1.der>`__,
   which lets you skip the DER conversion in the next
   step). Other CAs publish theirs on a similar "root
   certificates" / "repository" page; the canonical
   public set is the `Mozilla CA program (CCADB)
   <https://www.ccadb.org/>`__. Confirm you fetched the
   right file by comparing its fingerprint against the
   value the CA publishes (add ``-inform DER`` if you
   downloaded the ``.der``)::

       openssl x509 -in isrgrootx1.pem -noout -subject -fingerprint -sha256

   If you would rather not track a root, you can
   instead copy the **intermediate** straight out of
   the ``-showcerts`` output (the second
   ``-----BEGIN CERTIFICATE-----`` block), trust that,
   and accept that you must refresh it whenever the CA
   rotates the intermediate -- far more often than the
   root (see the trade-off below).

#. **Convert it to DER**, exactly as before::

       openssl x509 -in isrgrootx1.pem -outform DER -out ca.der

#. **Copy** ``ca.der`` to the camera (filesystem or
   ROMFS) and load it as the trust anchor::

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

   ``server_hostname`` is required here: it drives SNI
   and is the name checked against the server
   certificate's ``subjectAltName``.

.. tip::

   **Common-case shortcut.** Let's Encrypt is the most
   widely used public CA, and both its RSA and ECDSA
   certificates currently chain to ISRG Root X1 (as
   the ``openmv.io`` example above shows). If the
   servers your camera talks to use Let's Encrypt, you
   can skip the inspection entirely: just put
   `isrgrootx1.der
   <https://letsencrypt.org/certs/isrgrootx1.der>`__
   on the camera and ``load_verify_locations`` it.

   This does **not** make TLS work to *every* site. A
   server whose certificate comes from a different CA
   (DigiCert, Google Trust Services, Amazon, Sectigo,
   ...) will still fail verification, and because the
   camera trusts a single DER certificate per
   :class:`ssl.SSLContext` you cannot bundle every root
   the way a browser does. When in doubt, identify the
   server's actual CA as shown above and trust that
   root.

Which certificate you trust is a trade-off:

* **The root** (recommended). Long-lived -- often
  decades -- so ``ca.der`` rarely changes. It requires
  the server to send its intermediate so mbedTLS can
  build the path leaf → intermediate → your trusted
  root; virtually every correctly configured public
  server does.
* **The intermediate.** Also works, and keeps working
  even if a server omits the intermediate, but
  intermediates are rotated far more often than roots,
  so you will have to refresh ``ca.der`` more
  frequently.
* **The leaf itself** (certificate pinning). Tightest,
  but the leaf changes on every renewal -- roughly
  every 90 days for Let's Encrypt -- so this only
  makes sense when you also control the server and can
  push the new pin to every camera in lockstep. This
  is exactly what the self-signed client example does.

.. note::

   :meth:`ssl.SSLContext.load_verify_locations` takes a
   single DER-encoded CA certificate, so the camera
   trusts exactly one anchor at a time. To reach
   servers under different CAs, use a separate
   :class:`ssl.SSLContext` per anchor. And because that
   certificate will itself eventually expire or be
   rotated by the CA, treat it like any other
   certificate on the device -- see :doc:`operations`.
