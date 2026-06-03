Web Servers
===========

The networking chapters got the cam onto the network and gave it
sockets to talk through (:doc:`/openmvcam/tutorial/networking/index`).
What now? Most camera applications boil down to two things --
*expose what the cam sees to the world* and *react to what other
things on the network say*. HTTP is how that conversation happens, and
it works in both directions:

* As a **server**, the cam answers requests from phones, browsers,
  and other devices on the network. The :mod:`microdot` framework
  is the cam's server.
* As a **client**, the cam reaches out to cloud services to upload,
  fetch, or coordinate. The :mod:`requests` module is the cam's
  client.

Across the next 14 chapters we'll build *one* running camera
application that exercises both.

A *backyard motion-trigger cam* sits on a pole in the yard, sees what's
going on, and tells the owner about anything interesting. We'll grow
the cam from a one-route "I'm alive" server into a shippable thing:
live preview to the owner's phone, a dashboard with a threshold slider
and an event log, push notifications when motion fires, login, HTTPS,
and a cloud archive of every triggered frame.

Each chapter adds *one* feature. Code samples assume the earlier
chapters are in place -- we don't re-paste the whole script every
time.

.. image:: figures/system-overview.svg
   :alt: The phone or laptop talks to the cam over HTTPS for the
         dashboard, SSE events, and WebSocket commands; the cam talks
         out to a cloud archive over HTTPS POST.
   :align: center

.. toctree::
   :maxdepth: 1

   first-endpoint.rst
   snapshot.rst
   live-stream.rst
   multi-client-stream.rst
   control-api.rst
   control-panel.rst
   events.rst
   commands.rst
   auth-headers.rst
   sessions-login.rst
   https.rst
   cors-csrf.rst
   cloud-uploads.rst
   wrap-up.rst
