CORS and CSRF
=============

*CORS* and *CSRF* are the two browser-side protections an
open-internet cam needs alongside HTTPS and login. Each takes a few
lines to set up. The sections below define the term and show the
microdot integration.

What CORS does
--------------

*Cross-Origin Resource Sharing* (CORS) is the browser mechanism that
lets a server opt in to letting specific other origins read its
responses. The browser's default *same-origin policy* blocks that
read: JavaScript on ``https://example.com`` cannot read responses
from ``https://yard-cam.example.com``, because different host counts
as different origin. CORS is the server-side way to grant exceptions
for chosen peers.

If the dashboard is served from the cam itself, every request is
same-origin and CORS isn't doing anything. The setup matters when the
dashboard lives somewhere else -- a public URL like
``https://app.example.com`` that talks to a cam at
``https://yard-cam.example.com``:

.. code-block:: python

   from microdot.cors import CORS

   cors = CORS(
       app,
       allowed_origins=['https://app.example.com'],
       allow_credentials=True,
       max_age=86400,
   )

``allowed_origins`` is the list of origins that are permitted to read
the cam's responses. The dashboard's origin and *only* the
dashboard's origin -- not ``*`` -- so a third-party site can't read
the cam's responses by accident.

``allow_credentials=True`` lets cross-origin requests include the
session cookie, which is what the dashboard needs to stay logged in
across an origin boundary.

``max_age=86400`` tells the browser it can cache the preflight result
for a day. Browsers fire an extra ``OPTIONS`` request before any
cross-origin call that uses methods other than GET/HEAD/POST or sends
custom headers; ``max_age`` cuts that overhead to one preflight per
day per route.

What CSRF does
--------------

*Cross-Site Request Forgery* (CSRF) is the attack where a malicious
page makes the user's browser fire an authenticated request at a
trusted server. Even with CORS in place, a hidden ``<form>`` on
``evil.com`` that POSTs to ``https://yard-cam.example.com/config``
will reach the cam, and the browser will attach the cam's session
cookie -- cookies follow the destination host, not the origin of the
page making the request -- so the cam happily processes the POST as
if it were the owner.

CSRF protection rejects those requests. :class:`microdot.csrf.CSRF`
adds middleware that inspects the ``Sec-Fetch-Site`` header on every
state-changing request and rejects anything not labeled
``same-origin`` (or coming from a CORS-allowed origin):

.. code-block:: python

   from microdot.csrf import CSRF

   CSRF(app, cors=cors)

Passing the ``cors`` instance lets the middleware grandfather in the
dashboard's allowed origin -- the cam still accepts dashboard POSTs
even though they're cross-origin.

``Sec-Fetch-Site`` is set by modern browsers automatically; the cam
doesn't have to do anything on the client side. For older browsers
that don't send the header, the CORS allow-list is the fallback
check.

Exempting webhooks
------------------

If the cam needs a webhook endpoint to accept POSTs from a third-party
cloud service -- a callback from the archive provider, say -- mark
the route :meth:`@csrf.exempt <microdot.csrf.CSRF.exempt>` so the
middleware lets it through. The handler is responsible for verifying
the request some other way -- usually a *Hash-based Message
Authentication Code* (HMAC) over the payload, computed with a secret
the cam and the third party share, which proves the request came
from someone who knew the secret. The backyard cam doesn't have any
of those, but the decorator is there when you need it.

The four-line baseline
----------------------

Once HTTPS is in place, the recommended stack for any cam-facing-
internet deployment is:

.. code-block:: python

   Session(app, secret_key=SECRET,
           cookie_options={'http_only': True, 'secure': True})
   login = Login()
   cors = CORS(app, allowed_origins=[...], allow_credentials=True)
   CSRF(app, cors=cors)

Session and login earlier in the chapter, CORS and CSRF here, HTTPS
from the previous topic. The four pieces stack on top of each other
and stay out of each route's way.

The cam is now safe to face the open internet -- HTTPS, login, CSRF,
CORS.
