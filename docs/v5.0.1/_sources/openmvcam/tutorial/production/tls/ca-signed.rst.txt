CA-signed (publicly trusted) certificates
=========================================

Self-signed certificates work when you control both
ends. If instead arbitrary clients (browsers, phones,
third-party software) must connect to the camera
*without* being told to trust a custom certificate, the
certificate has to be signed by a public Certificate
Authority (CA) that those clients already trust. The
TLS code on the camera is identical to the self-signed
case -- ``load_cert_chain`` with a certificate and a
key in DER form -- only how you obtain that certificate
changes.

The single most important point: **you generate the
private key yourself and it never leaves your machine.**
The CA never sees it. What you send the CA is a
*certificate signing request* (CSR) -- a small file
containing your public key and your domain name -- and
what you get back is a *certificate* (your public key
and name, signed by the CA). The key and the
certificate are two separate files produced by two
separate steps; the CA only ever handles the public
half.

The general flow, all done on a normal machine (never
on the camera):

#. **Get a domain name.** Public CAs certify a DNS name
   you control (e.g. ``cam.example.com``); they will
   not issue for a bare IP address or a local-only name
   like ``mycam``.

#. **Generate a key and a CSR.** One OpenSSL command
   produces the private key and the matching CSR. Use
   the same key type you would for a self-signed
   certificate (see :doc:`concepts`); ECDSA P-256 is
   recommended.

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

   Keep ``domain.key`` secret -- this is the key file
   you will eventually put on the camera.
   ``domain.csr`` is the file you hand to the CA; it
   contains no secrets.

#. **Submit the CSR and prove you control the domain.**
   This is where the two common routes differ:

   * An automated ACME CA such as `Let's Encrypt
     <https://letsencrypt.org>`__, driven by a tool
     like ``certbot`` or ``acme.sh``, does steps 2 and
     3 for you: it generates the key, builds the CSR,
     answers the challenge automatically (HTTP-01:
     serve a token over port 80 on the domain, or
     DNS-01: publish a TXT record in its DNS) and
     writes out the finished files.
   * A commercial CA (bought directly or through a
     domain/hosting reseller): you paste the
     ``domain.csr`` text into a web form, then prove
     control by replying to a validation email,
     publishing a DNS record, or placing a file on a
     web server for that domain. Once validated you
     download the issued files.

#. **Collect the issued files.** To make sense of what
   you receive, it helps to know that certificates form
   a *chain of trust*: your domain's certificate is
   signed by an intermediate CA, which is in turn
   signed by a root CA. Each link vouches for the one
   below it. You end up with:

   * Your **private key** (from step 2). The CA never
     had it; it stays on your machine and is the key
     you eventually put on the camera.
   * The **leaf** certificate -- also called the
     *end-entity* or *server* certificate. This is the
     certificate for your specific domain
     (``cam.example.com``): it contains your public key
     and your name, and is signed by the CA's
     intermediate. This is the certificate the camera
     presents to identify itself.
   * One or more **intermediate CA certificates** (the
     "chain" or "CA bundle"). A CA does not sign your
     leaf with its root directly -- the root's key is
     kept offline and heavily protected -- so it signs
     with an intermediate, which is itself signed by
     the root. The intermediate is the link that
     connects your leaf up to the root.

   The **root** certificate is the *trust anchor*: a
   self-signed certificate belonging to the CA that
   sits at the top of the chain. You are not given it
   and never deploy it, because every client already
   has it -- operating systems, browsers, phones and
   language runtimes ship with a built-in "trust store"
   of root certificates. A client trusts your leaf by
   walking the chain: it already trusts the root, the
   root vouches for the intermediate, and the
   intermediate vouches for your leaf. (This is exactly
   the job your single ``server.der`` / ``cafile`` does
   in the self-signed case -- there *you* are your own
   root.)

   A **fullchain** file is simply the leaf and the
   intermediate(s) concatenated into one file, leaf
   first, deliberately *without* the root (sending the
   root is pointless -- a client only trusts roots it
   already has). A normal server presents this entire
   fullchain so any client can walk it. The camera
   cannot: it loads and presents **one** certificate --
   the leaf -- and cannot also send the intermediate
   certificate(s) the CA gave you.

   File names you will actually see: an ACME tool such
   as ``certbot`` writes ``privkey.pem`` (your key),
   ``cert.pem`` (the leaf alone), ``chain.pem`` (the
   intermediate(s) alone) and ``fullchain.pem``
   (leaf + intermediate(s)). A commercial CA usually
   gives you a ``.crt`` for the leaf and a
   ``.ca-bundle`` for the intermediate(s), with the
   ``.key`` being the one you generated yourself.

#. **Convert and copy.** Convert the private key and
   the leaf certificate to DER and copy them to the
   camera exactly as on :doc:`self-signed`. The camera
   then presents them as its server certificate and
   standard clients accept the connection automatically,
   because they already trust the CA -- no client-side
   configuration is needed.

.. tip::

   In practice, the camera presenting only the leaf
   (and never the intermediates) plays out like this:

   * Clients that already have the CA's intermediate
     cached -- mainstream browsers and HTTPS libraries
     usually do -- complete the chain themselves and
     connect fine.
   * Clients that rely on the *server* to supply the
     intermediate will fail the handshake against the
     camera.

   If every possible client must succeed, do not
   terminate public TLS on the camera directly. Put a
   gateway / reverse proxy in front of it that serves
   the full chain to the outside world, and have the
   proxy reach the camera over the self-signed flow
   described above.
