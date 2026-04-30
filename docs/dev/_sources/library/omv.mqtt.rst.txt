:mod:`mqtt` -- Simple MQTT client
=================================

.. module:: mqtt
   :synopsis: simple MQTT v3.1.1 client

The :mod:`mqtt` module provides a minimal MQTT v3.1.1 client implementation
suitable for use on memory-constrained devices. It supports connecting to a
broker (with optional TLS), publishing messages, subscribing to topics,
last-will configuration and keep-alive pings.

Example::

    from mqtt import MQTTClient

    def callback(topic, msg):
        print(topic, msg)

    client = MQTTClient("openmv", "broker.example.com", 1883)
    client.set_callback(callback)
    client.connect()
    client.subscribe(b"openmv/in")
    client.publish(b"openmv/out", b"hello")
    while True:
        client.check_msg()

Exceptions
----------

.. exception:: MQTTException

    Raised when the broker rejects the CONNECT request or when a SUBSCRIBE
    request is refused. The single argument is the broker-supplied numeric
    return code.

Classes
-------

.. class:: MQTTClient(client_id: bytes | str, server: str, port: int, ssl_params: dict | None = None, user: bytes | str | None = None, password: bytes | str | None = None, keepalive: int = 0, callback: callable | None = None)

    Construct an MQTT client.

    Arguments:

        * *client_id* -- unique client identifier sent to the broker.
        * *server* -- broker hostname or IP address (resolved with
          :func:`socket.getaddrinfo`).
        * *port* -- broker TCP port (typically ``1883`` plain or ``8883``
          for TLS).
        * *ssl_params* -- if not ``None``, the socket is wrapped with
          :func:`ssl.wrap_socket` and *ssl_params* is forwarded as keyword
          arguments. Pass ``{}`` to enable TLS with defaults.
        * *user* -- optional username for broker authentication. If given,
          *password* must also be supplied.
        * *password* -- optional password used together with *user*.
        * *keepalive* -- keep-alive interval in seconds (``0`` disables).
          Must be less than ``65536``.
        * *callback* -- callable invoked as ``callback(topic, msg)`` for
          each PUBLISH delivered from the broker. May also be set later
          with :meth:`set_callback`.

    Methods
    ~~~~~~~

    .. method:: MQTTClient.set_callback(f: callable) -> None

        Set the callback invoked by :meth:`wait_msg` and :meth:`check_msg`
        when a PUBLISH message is received. The callback is called as
        ``f(topic, msg)`` with both arguments as :class:`bytes`.

    .. method:: MQTTClient.set_last_will(topic: bytes | str, msg: bytes | str, retain: bool = False, qos: int = 0) -> None

        Configure the MQTT Last Will and Testament. The broker publishes
        *msg* on *topic* if the client disconnects ungracefully. Must be
        called before :meth:`connect`.

        Arguments:

            * *topic* -- last-will topic (must be non-empty).
            * *msg* -- last-will payload.
            * *retain* -- if ``True``, broker stores the will message as a
              retained message.
            * *qos* -- last-will QoS level. Must be ``0``, ``1`` or ``2``.

    .. method:: MQTTClient.connect(clean_session: bool = True, timeout: float = 5.0) -> int

        Open a TCP (and optionally TLS) connection to the broker and send
        a CONNECT packet.

        Arguments:

            * *clean_session* -- if ``True``, request a clean session;
              otherwise the broker resumes any prior session state.
            * *timeout* -- socket timeout in seconds applied to the
              underlying socket.

        Returns the broker's *session present* flag (``0`` or ``1``).
        Raises :exc:`MQTTException` if the broker returns a non-zero
        CONNACK return code.

    .. method:: MQTTClient.disconnect() -> None

        Send a DISCONNECT packet and close the underlying socket.

    .. method:: MQTTClient.ping() -> None

        Send a PINGREQ packet to the broker. Should be called periodically
        if *keepalive* is non-zero so the broker does not drop the
        connection.

    .. method:: MQTTClient.publish(topic: bytes | str, msg: bytes | str, retain: bool = False, qos: int = 0) -> None

        Publish *msg* to *topic*.

        Arguments:

            * *topic* -- topic name to publish to.
            * *msg* -- payload bytes.
            * *retain* -- if ``True``, instruct the broker to retain the
              message for new subscribers.
            * *qos* -- quality-of-service level. ``0`` (fire and forget)
              and ``1`` (acknowledged) are supported. ``2`` is not
              implemented and will raise :exc:`AssertionError`.

        For *qos* ``1``, the call blocks until the matching PUBACK is
        received. The total packet size must be less than ``2097152``
        bytes.

    .. method:: MQTTClient.subscribe(topic: bytes | str, qos: int = 0) -> None

        Subscribe to *topic* at the given *qos* level. A callback must
        have been registered via :meth:`set_callback` or supplied to the
        constructor; otherwise :exc:`AssertionError` is raised.

        Blocks until the matching SUBACK is received. Raises
        :exc:`MQTTException` if the broker refuses the subscription
        (return code ``0x80``).

    .. method:: MQTTClient.wait_msg() -> int | None

        Block waiting for a single incoming MQTT packet and process it.
        PUBLISH packets are delivered to the registered callback. PINGRESP
        packets are consumed silently. For other control packets the raw
        first byte is returned. Returns ``None`` if no data is available
        or if a PINGRESP was processed.

    .. method:: MQTTClient.check_msg() -> int | None

        Non-blocking variant of :meth:`wait_msg`. Polls the socket for at
        most ~50 ms using :func:`select.select`; if data is pending it
        performs the same processing as :meth:`wait_msg`, otherwise
        returns ``None``.
