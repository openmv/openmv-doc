HTTPS -- transport encryption for the server
============================================

Up to now everything has been plain HTTP on port 80. Anyone with a
packet capture between the browser and the cam can read the login
form's password, the session cookie that comes back from it, the JWT
in the ``Authorization`` header, and the JPEG bytes of every captured
frame. HTTPS encrypts the wire end to end.

The cert workflow itself -- generating a self-signed cert for
development, getting a CA-signed cert for production, copying the
files onto the cam in the right format -- is covered in
:doc:`/openmvcam/tutorial/production/tls/index`. This page is about
*plugging an already-loaded cert into microdot*.

Building the SSL context
------------------------

:class:`ssl.SSLContext` is the standard library's container for cert,
key, and protocol options. For a server you want
``PROTOCOL_TLS_SERVER`` and a cert chain loaded from the cam's
filesystem:

.. code-block:: python

   import ssl

   ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
   ctx.load_cert_chain('/flash/cert.der', '/flash/key.der')

The DER paths come from whichever workflow you ran in the TLS section
-- self-signed for dev, CA-signed for production. The files don't
have to be on ``/flash``; ``/sdcard`` works equally well.

Pass the context to start_server
--------------------------------

The only difference from the earlier
:meth:`~microdot.Microdot.start_server` call is the ``ssl=ctx``
argument and the port number. Port 443 is the HTTPS default, which
means browsers don't need to type ``:443`` -- just
``https://yard-cam.local/`` works:

.. code-block:: python

   async def main():
       await asyncio.gather(
           capture_loop(),
           motion_detector(),
           app.start_server(host='0.0.0.0', port=443, ssl=ctx),
       )

   asyncio.run(main())

That's it for the server side. Every existing route -- ``/status``,
``/snapshot.jpg``, ``/stream.jpg``, ``/config``, ``/events``,
``/control``, the static dashboard -- now runs over TLS without any
other code changes.

Tightening the session cookie
-----------------------------

The session cookie was created with ``secure=False`` as a
placeholder. With HTTPS in place, flip it to ``True`` so the cookie
is never sent over plain HTTP -- even if a misconfigured client or
a stale link tries to:

.. code-block:: python

   Session(app, secret_key=SECRET,
           cookie_options={'http_only': True, 'secure': True})

The same applies to the ``_remember`` cookie that
:meth:`~microdot.login.Login.login_user` writes when ``remember=True``
is set -- microdot picks up the ``secure`` flag from the same
``cookie_options`` dict.

What's not covered here
-----------------------

*HTTP Strict Transport Security* (HSTS), certificate auto-renewal,
the CA trust chain on the cam side for outbound requests, and the
choice of cipher suites all live in the TLS section. The plug-in here -- one ``SSLContext``, one
``ssl=ctx`` -- is the only piece that's specific to microdot.

The dashboard URL bar now goes from ``http://`` to ``https://`` and
the WebSocket from ``ws://`` to ``wss://`` -- the dashboard
JavaScript already chose the right scheme based on
``location.protocol``, so no client changes are needed.

The cam serves over HTTPS. The login form, the JWT, and the captured
frames are encrypted in transit.
