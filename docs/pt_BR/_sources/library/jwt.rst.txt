:mod:`jwt` --- JSON Web Tokens
==============================

.. module:: jwt
   :synopsis: Minimal JSON Web Token (JWT) encoder and decoder

A small implementation of the JSON Web Token (JWT) standard for
MicroPython. JWT is a compact, URL-safe container for a JSON payload
that the issuer signs so the verifier can detect tampering and expiry.

This MicroPython port is intentionally tiny:

* Only **HS256** (HMAC with SHA-256) is supported. RSA / ECDSA / EdDSA
  algorithms are not implemented; the issuer and verifier must share a
  symmetric secret key.
* The optional ``exp`` (expiration) claim is honored. Other registered
  claims (``nbf``, ``iat``, ``iss``, ``aud``, ``sub``, ``jti``) are
  passed through unchanged in the payload but **not validated**; the
  application checks them if it cares.
* No key-rotation, JWKS, or audience-list handling.

Functions
---------

.. function:: encode(payload: dict, key: bytes | str, algorithm: str = "HS256") -> str

   Encode *payload* into a signed JWT and return the resulting compact
   serialization (a ``str`` of the form ``"header.payload.signature"``,
   each segment Base64-URL-encoded).

   *payload*
       A JSON-serializable dict of claims. Standard claims (``exp``,
       ``iat``, ``sub``, ...) are passed through verbatim; custom
       application keys are allowed.

   *key*
       The shared HMAC secret. ``bytes`` is preferred; ``str`` is
       UTF-8-encoded automatically.

   *algorithm*
       Must be ``"HS256"`` (the default). Anything else raises
       :exc:`exceptions.InvalidAlgorithmError`.

.. function:: decode(token: str, key: bytes | str, algorithms: list = ["HS256"]) -> dict

   Verify *token*'s signature and (if present) its ``exp`` claim, and
   return the decoded payload dict. Raises a subclass of
   :exc:`exceptions.PyJWTError` on any failure -- the caller usually
   catches the base class.

   *token*
       The compact JWT string produced by :func:`encode` (or any
       compatible issuer).

   *key*
       The shared HMAC secret. Must match the key used at encode time.

   *algorithms*
       The list of algorithms the caller is willing to accept. ``HS256``
       must be present, and the token's header ``alg`` must be in the
       list. Defaults to ``["HS256"]``.

   **Raises:**

   * :exc:`exceptions.InvalidAlgorithmError` -- ``HS256`` is not in
     *algorithms*, or the token's header ``alg`` is anything other than
     ``HS256``.
   * :exc:`exceptions.InvalidTokenError` -- the token is malformed (does
     not split into three Base64-URL segments, or a segment fails to
     decode / parse as JSON).
   * :exc:`exceptions.InvalidSignatureError` -- the signature does not
     match the recomputed HMAC over the header and payload.
   * :exc:`exceptions.ExpiredSignatureError` -- the payload contains an
     ``exp`` claim whose value is less than the current Unix time. The
     camera's clock must be set for this check to be meaningful; see
     :func:`ntptime.settime`.

Exceptions
----------

All exceptions are nested under the module attribute ``jwt.exceptions``.

.. exception:: exceptions.PyJWTError

   Base class for every JWT failure. Catch this if you do not need to
   distinguish among the cases below.

.. exception:: exceptions.InvalidTokenError

   The token is structurally invalid -- wrong number of segments, a
   segment that fails Base64 decode, or JSON that fails to parse.
   Subclass of :exc:`exceptions.PyJWTError`.

.. exception:: exceptions.InvalidAlgorithmError

   The token's algorithm is not in the caller-accepted list, or the
   caller asked for an algorithm other than ``HS256``. Subclass of
   :exc:`exceptions.PyJWTError`.

.. exception:: exceptions.InvalidSignatureError

   The token's signature does not match the HMAC computed from the
   header and payload using the supplied key. Subclass of
   :exc:`exceptions.PyJWTError`.

.. exception:: exceptions.ExpiredSignatureError

   The token's ``exp`` claim is in the past. Subclass of
   :exc:`exceptions.PyJWTError`. The camera's wall-clock time must be
   set (via :func:`ntptime.settime`) for this check to be meaningful.

Example
-------

A symmetric-secret issue/verify cycle::

    import jwt
    import time

    SECRET = b"keep-this-out-of-source-control"

    payload = {
        "sub": "kitchen-cam",
        "role": "admin",
        "exp": time.time() + 3600,                 # 1 hour from now
    }

    token = jwt.encode(payload, SECRET)
    print("token:", token)

    try:
        claims = jwt.decode(token, SECRET)
    except jwt.exceptions.PyJWTError as e:
        print("rejected:", type(e).__name__)
    else:
        print("subject:", claims["sub"])

The same secret is used to sign and verify, so the verifier must hold
the key the issuer used. For services where the camera is the issuer
(handing out tokens to a paired phone), keep the secret on the camera
filesystem and treat it like any other long-lived credential -- see
:doc:`/openmvcam/tutorial/production/tls/operations`.

.. note::

   This module relies on :mod:`hmac` and :mod:`hashlib`, both of which
   are built into the camera. No external configuration is needed.
   Keys may be any length, but the HMAC construction is most useful
   with keys at least as long as the SHA-256 block size (32 bytes).
