Operations: keys, expiry, and troubleshooting
=============================================

Three pieces of certificate work span every deployed
device: protecting the private key once it is on the
camera, planning for the day the certificate expires,
and the short list of error modes that show up in
practice.

Protecting the private key
--------------------------

Whenever the camera *presents* a certificate -- as a
TLS server, or as the client in mTLS -- its private
key has to live on the device, in plain DER, on the
filesystem or in ROMFS. Stored that way it is readable
by any code running on the camera and by anyone with
physical access to it: the USB mass-storage drive, a
REPL prompt, or the raw flash. ROMFS and read-only
flags prevent *modification*, not *extraction*.
**Treat any private key shipped on a device as
recoverable by a determined attacker with physical or
code access.**

This does not make TLS pointless -- it shapes how you
deploy it:

* **Use a unique key and certificate per device.**
  Never flash one shared key across the fleet:
  extracting it from a single unit would then let an
  attacker impersonate every camera. Per-device keys
  keep a compromise to that one device, which you can
  revoke or disable server-side.
* **Keep certificates short-lived.** A stolen key is
  only useful while its certificate is valid; short
  lifetimes plus routine rotation bound the damage
  (see `Certificate expiry and rotation`_ below).
* **Avoid putting a secret on the device at all when
  you can.** If you only need to verify the *server*
  (server authentication, not mTLS), the camera as a
  client stores only the CA certificate -- which is
  public -- and holds no private key worth stealing.
* **Never ship a key in a public firmware image.** A
  key baked into ROMFS in a firmware build you
  distribute is not secret; anyone who downloads the
  firmware has it. Per-device provisioning means
  programming the key *after* the generic firmware,
  not inside it.
* **Limit blast radius.** Scope whatever the
  certificate authenticates to (least privilege), and
  make sure a single leaked device identity can be
  revoked or disabled without affecting the rest.

If your threat model includes attackers with physical
access, design on the assumption that the device key
*will* eventually leak and make that survivable, rather
than assuming it can be kept secret on hardware that
has no facility to do so.

Certificate expiry and rotation
-------------------------------

Every certificate carries a validity window. Once it
passes, a :data:`ssl.CERT_REQUIRED` peer rejects the
connection -- so expiry is a real, scheduled outage,
not a theoretical risk. The camera's clock must also
be correct for the validity check to be evaluated
honestly.

* **Self-signed.** You picked the lifetime with
  ``-days``. When it lapses you must regenerate the
  key/certificate and redeploy it: re-copy the DER
  files, or rebuild and reflash the ROMFS image if the
  certificate is baked in. Pick a ``-days`` value you
  will actually remember to act on.
* **Public CA.** These are deliberately short-lived.
  Let's Encrypt issues 90-day certificates and expects
  automated renewal roughly every 60 days; there is no
  "install once and forget" option.

The broader trend is one-directional: the maximum
validity of publicly-trusted TLS certificates keeps
shrinking. It was 825 days, is currently capped at 398
days, and the CA/Browser Forum has adopted a schedule
that steps it down toward roughly 47 days by 2029. The
takeaway for a device design is to assume certificates
are short-lived and that rotation must be automated or
at least routine -- do not ship a product that depends
on a human swapping a ten-year certificate.

Practically, on the camera: prefer designs where the
certificate can be replaced without reflashing (a
writable filesystem plus a remote-update path, or
running the camera as a *client* that trusts a CA you
rotate centrally). If a certificate must live in
ROMFS, schedule firmware updates around its lifetime.

Troubleshooting
---------------

* **The clock must be set.** A camera that has not set
  its clock since power-up fails the certificate
  validity check -- call :func:`ntptime.settime`
  first.
* **Host name must match.** When the client passes
  ``server_hostname`` it must match the certificate's
  ``subjectAltName`` (or ``CN`` on older stacks), or
  verification fails.
* **Wrong format.** A PEM file copied to the camera
  will not load -- convert to DER first.
* **Certificate expired.** A connection that worked
  before and now fails with :exc:`OSError` may simply
  have an expired certificate -- check the validity
  dates and regenerate/redeploy as needed.
* **Ed25519 keys fail.** Use ECDSA P-256/P-384 or RSA,
  not Ed25519.
* **Errors are** :exc:`OSError`. MicroPython does not
  implement ``ssl.SSLError``; TLS failures (bad
  certificate, expired, unknown CA, format error,
  handshake failure) are raised as :exc:`OSError`.
