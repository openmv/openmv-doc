Concepts: trust, keys, and file format
======================================

Before any commands, three pieces of background that
apply to every other page in this section.

Trust models
------------

A TLS connection can provide three increasing levels of
assurance:

* **Encryption only** -- the traffic is encrypted but
  neither side proves who it is. Easy to set up (no
  certificate validation) but vulnerable to a
  man-in-the-middle attack. Use only for local testing.
* **Server authentication** -- the client verifies the
  server's certificate against a trusted certificate
  (the familiar HTTPS model). The OpenMV Cam can act
  as either the client (verifying a remote server) or
  the server (presenting its own certificate).
* **Mutual authentication (mTLS)** -- both ends present
  and verify certificates. Used where the server must
  also be sure of the client's identity.

Choosing a key type
-------------------

The camera's mbedTLS build supports ECDSA on the
NIST/SEC prime curves and RSA. There are three
practical ways to make a key; **ECDSA P-256
(prime256v1) is recommended**:

* **ECDSA P-256 (prime256v1)** -- about 128-bit security
  with a 256-bit key. Tiny keys and signatures, and by
  far the fastest handshake of the supported options on
  a Cortex-M (elliptic-curve operations are much cheaper
  than RSA private-key operations). Universally
  supported by TLS peers. This is the best balance of
  security, speed, RAM/flash use and compatibility on
  an embedded device, which is why it is the default
  choice here.
* **ECDSA P-384 (secp384r1)** -- about 192-bit security.
  Still elliptic-curve, so reasonably efficient, but
  larger and slower than P-256 for a security margin
  that typical IoT deployments do not need. Use only
  if a long-lived certificate or a compliance
  requirement calls for it.
* **RSA-2048** -- about 112-bit security. Universally
  compatible, including with very old peers, but RSA
  keys and certificates are much larger and RSA
  private-key operations (done by the side presenting
  the certificate) are the slowest and most
  memory-hungry option on a microcontroller. Use only
  when a peer cannot do ECDSA.

.. note::

   **Ed25519 / Curve25519 keys are not supported.** The
   OpenMV Cam's mbedTLS build does not enable EdDSA or
   Curve25519, so an Ed25519 certificate or key will
   fail to load or handshake. Use one of the three
   options above.

File format: use DER
--------------------

The mbedTLS build used by the OpenMV Cam does not
include PEM parsing, so the camera reads certificates
and keys only in **DER** form (the binary encoding).
OpenSSL produces PEM (base64 text) by default, so every
file you copy to the camera must be converted to DER
first (covered on :doc:`self-signed`). You will need:

* A **private key** -- kept secret, used by whichever
  side presents a certificate.
* A **certificate** -- the public part, presented to
  the other side during the handshake.
* A **CA / trust certificate** -- the certificate the
  *verifying* side loads to decide whether the peer is
  trusted. For a self-signed setup this is simply the
  peer's own certificate.
