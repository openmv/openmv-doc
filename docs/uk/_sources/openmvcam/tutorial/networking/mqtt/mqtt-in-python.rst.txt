MQTT in Python
==============

The bundled :mod:`mqtt` module on every networked OpenMV cam wraps
the MQTT wire protocol in one class, :class:`mqtt.MQTTClient`. The
class opens the TCP socket, performs the CONNECT handshake, packs
and unpacks the byte-level packets, handles PINGREQ keepalive, and
dispatches incoming PUBLISH messages to a callback. Application code calls :meth:`connect`, :meth:`publish`,
:meth:`subscribe`, and :meth:`wait_msg` / :meth:`check_msg`.

A publisher in fifteen lines
----------------------------

The smallest useful program is a single publish. Connect, publish
one message, disconnect::

   from mqtt import MQTTClient

   client = MQTTClient(
       client_id='yard-cam',
       server='test.mosquitto.org',
       port=1883,
   )
   client.connect()
   client.publish(b'yard-cam/motion', b'detected at 14:02', qos=0)
   client.disconnect()

``test.mosquitto.org`` is the public test broker run by the Eclipse
Mosquitto project. It accepts plain-TCP connections on port 1883 with
no credentials. Don't use it for anything serious; it has no privacy
guarantees and the topic namespace is shared with every other tester
on the internet.

``client_id`` must be unique per broker connection -- the broker uses
it to track sessions. Topics and message payloads are bytes; pass
:class:`str` if it's more convenient and the client will encode it as
UTF-8.

Connecting over TLS
-------------------

For anything past quick experiments, MQTT over TLS is one extra
argument. The ``ssl_params`` dict is forwarded to :func:`ssl.wrap_socket`,
so anything that works there works here::

   import ssl

   client = MQTTClient(
       client_id='yard-cam',
       server='broker.example.com',
       port=8883,                          # TLS-MQTT default port
       ssl_params={'server_hostname': 'broker.example.com'},
       user='yard-cam',
       password=load_token(),
   )

Port ``8883`` is the IANA-reserved TLS-MQTT port. ``server_hostname``
turns on SNI so brokers behind a shared IP can route to the right
certificate -- the same mechanism HTTPS uses. ``user`` /
``password`` map to the CONNECT packet's username/password fields;
the broker decides whether those credentials grant publish or
subscribe rights to specific topics.

Subscribing and receiving
-------------------------

To receive messages a client provides a callback and calls
:meth:`subscribe`. The callback receives two bytes arguments, the
topic and the payload::

   def on_message(topic, msg):
       print('received on', topic.decode(), ':', msg.decode())

   client = MQTTClient(
       client_id='dashboard',
       server='test.mosquitto.org',
       port=1883,
       callback=on_message,
   )
   client.connect()
   client.subscribe(b'yard-cam/motion', qos=0)
   while True:
       client.wait_msg()

:meth:`wait_msg` blocks until one MQTT packet arrives, parses it,
calls the callback if it was a PUBLISH on a subscribed topic, and
returns. Subscribed callbacks fire from inside that call -- there is
no background thread.

For an interactive cam loop that needs to keep doing other work,
:meth:`check_msg` is the same logic in non-blocking form. It uses
:func:`select.select` with a 50 ms timeout and returns immediately if
nothing is pending::

   while True:
       client.check_msg()
       run_frame()                  # capture + processing
       check_motion_threshold()

Reconnecting cleanly
--------------------

Any long-running MQTT client has to handle dropped connections.
Wi-Fi disconnects, broker restarts, NAT timeouts, or simply running
past keepalive without traffic all end the socket. The bundled
client raises :exc:`OSError` (or a bare exception with the broker's
return code) from the call that noticed the drop, and the standard
pattern is a retry loop::

   import time

   def keep_publishing(client, topic, get_message):
       while True:
           try:
               client.connect()
               while True:
                   client.publish(topic, get_message())
                   time.sleep(5)
           except OSError:
               print('connection lost, reconnecting in 5s')
               time.sleep(5)

Subscriptions are *not* persisted across reconnects unless the
client passed ``clean_session=False`` on connect, so the inner
``connect`` should also re-issue any :meth:`subscribe` calls before
falling into the publish loop.

The last-will hook
------------------

A cam reporting status should tell the broker what message to send
on the cam's behalf if the connection dies unexpectedly. Set the
will *before* :meth:`connect`::

   client = MQTTClient(
       client_id='yard-cam',
       server='broker.example.com',
       port=8883,
       ssl_params={'server_hostname': 'broker.example.com'},
   )
   client.set_last_will(
       b'yard-cam/status',
       b'offline',
       retain=True,
       qos=0,
   )
   client.connect()
   client.publish(b'yard-cam/status', b'online', retain=True)

Now any dashboard subscribed to ``yard-cam/status`` sees ``online``
the moment the cam connects and ``offline`` whenever the broker
notices the cam dropped. The retained ``offline`` message persists
on the broker so a dashboard that connects ten minutes later still
sees the correct current state.

When to pick MQTT over HTTP
---------------------------

The webservers chapter covers the cam acting as an HTTP server and,
on the cloud-upload page, as an HTTP client posting JPEGs to a fixed
URL. Both have their place. The right time to reach for MQTT
instead:

* The same data needs to go to several listeners (a dashboard, a
  notification service, a recorder) without the cam knowing the
  list in advance.
* Listeners may come and go without the cam restarting.
* The cam wants to *subscribe* -- to receive commands from a
  controller -- which an HTTP client can't do without long polling
  or a server pushing on a callback URL.
* The connection has to survive long idle periods cheaply.

The right time to stick with HTTP: one cam, one server, a fixed
request/response pattern with a body that's too large for a single
MQTT topic (JPEG frames over MQTT works but is rude to the broker;
HTTP POST is the natural fit).

Cross-link: the cloud-upload page in the webservers chapter shows
the HTTP version of "cam → cloud archive". The MQTT version of the
same problem keeps the cam decoupled from the archive's URL and
lets a second consumer (a phone alert app, say) tap the same
stream.
