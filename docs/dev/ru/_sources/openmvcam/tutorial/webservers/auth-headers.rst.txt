Auth for programmatic clients
=============================

Bearer tokens are how phones, companion microcontrollers, and cloud
workers authenticate to a server -- the client puts a token in the
``Authorization`` header on every request and the server checks it.
The companion phone app POSTs an "ack" when the owner taps "seen" on
a motion notification; those requests need a token.

The signing secret
------------------

The secret is the cam's private key for signing and verifying tokens.
Generate 32 random bytes from the hardware RNG on the cam's first
boot, persist them to the filesystem, and reuse the same bytes on
every subsequent boot:

.. code-block:: python

   # auth/tokens.py
   import os

   try:
       with open('secret.bin', 'rb') as f:
           SECRET = f.read()
   except OSError:
       SECRET = os.urandom(32)
       with open('secret.bin', 'wb') as f:
           f.write(SECRET)

:func:`os.urandom` is the cryptographically suitable random source on
each cam port -- on most ports it reads the chip's hardware
random-number generator directly. The file lives in the cam's working
directory (``/sdcard`` if an SD card is mounted, ``/flash`` otherwise)
and never leaves the cam. Deleting ``secret.bin`` and rebooting
rotates the secret and invalidates every token issued under the old
one.

.. note::

   :func:`machine.unique_id` is *not* a substitute. On some cam
   ports it is also used to derive the network MAC address, which
   means its value travels with every packet the cam sends -- not
   the property a signing secret needs.

Issuing tokens
--------------

The phone needs a way to *get* a token in the first place. A
short-lived *JSON Web Token* (JWT) -- a base64-encoded JSON payload
with a signature appended -- is enough for a first pass: the owner
trades a password for a token, then uses the token until it
expires:

.. code-block:: python

   import jwt
   import time

   @app.post('/api/login')
   async def api_login(request):
       creds = request.json
       if creds.get('user') != 'owner' or creds.get('pass') != load_password():
           abort(401)
       token = jwt.encode({
           'sub': 'owner',
           'exp': int(time.time()) + 3600,
       }, SECRET)
       return {'token': token}

The phone POSTs ``{user, pass}`` once, stores the returned token in
local storage, and includes it as ``Authorization: Bearer <token>``
on every subsequent request.

The ``exp`` claim is a Unix timestamp. The verifier on the next
section relies on this claim to reject expired tokens automatically
-- which means the cam's wall clock has to be set, because otherwise
every token will look either far in the future or already expired.
See :doc:`/openmvcam/tutorial/networking/names/ntp` for the NTP-sync
recipe.

Verifying tokens with TokenAuth
-------------------------------

:class:`microdot.auth.TokenAuth` is the decorator factory for routes
that require an ``Authorization: Bearer <token>`` header. The
verifier callback receives the token string and returns whatever
identity object should be attached to the request -- or
:data:`None` to reject:

.. code-block:: python

   from microdot.auth import TokenAuth

   tokens = TokenAuth()

   @tokens.authenticate
   async def check_token(request, token):
       try:
           claims = jwt.decode(token, SECRET)
       except jwt.exceptions.PyJWTError:
           return None
       return claims['sub']

   @app.post('/api/ack')
   @tokens
   async def ack(request):
       body = request.json
       if not body or 'count' not in body:
           abort(400, 'missing count')
       return {'ok': True, 'user': request.g.current_user}

:func:`jwt.decode` raises :exc:`jwt.exceptions.PyJWTError` (or a
subclass) when the signature is wrong, the token is malformed, or
the ``exp`` claim has passed. The verifier swallows all of those and
returns :data:`None`, so microdot responds 401 without the handler
seeing anything.

When the verifier returns a non-:data:`None` value, microdot stores
it on :attr:`request.g.current_user` so the handler can read it -- in
this case it's the JWT ``sub`` (subject) claim.

BasicAuth for closed networks
-----------------------------

For an admin endpoint that's only ever hit from a trusted network,
:class:`microdot.auth.BasicAuth` is simpler -- the browser pops a
native username/password dialog and sends them in the
``Authorization: Basic ...`` header on every request:

.. code-block:: python

   from microdot.auth import BasicAuth

   basic = BasicAuth(realm='Backyard cam admin')

   @basic.authenticate
   async def check_basic(request, username, password):
       if username == 'owner' and password == load_password():
           return 'owner'
       return None

   @app.get('/admin')
   @basic
   async def admin(request):
       return 'hi ' + request.g.current_user

The credentials travel in the clear unless the connection is HTTPS,
so this approach only makes sense on a trusted network or with HTTPS
in place.

``/api/ack`` and ``/api/login`` now understand tokens; ``/admin``
requires Basic auth.
