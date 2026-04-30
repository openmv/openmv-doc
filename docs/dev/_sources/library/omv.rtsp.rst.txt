:mod:`rtsp` --- rtsp library
============================

.. module:: rtsp
   :synopsis: rtsp library

The ``rtsp`` module on the OpenMV Cam allows you to stream video from your OpenMV Cam to any
compatible RTSP client (like `VLC <https://www.videolan.org/vlc/index.html>`_).

Example usage::

    server = rtsp.rtsp_server(network_if)
    server.stream(lambda pathname, session: sensor.snapshot())

See the example scripts in OpenMV IDE under ``Web Servers``.


class rtsp_server -- rtsp_server class
--------------------------------------

The `rtsp_server` class creates a single connection RTSP web server on your OpenMV Cam.

.. class:: rtsp_server(network_if: Any, port: int = 554)

   Creates an RTSP server bound to ``network_if``.

   ``network_if`` is the network module interface created from ``network.LAN()``,
   ``network.WLAN()``, or similar.

   ``port`` is the TCP port to listen on. The default RTSP port is 554.

   .. method:: register_setup_cb(cb: Callable[[str, int], None]) -> None

      Bind a callback ``cb`` to be invoked when a client sets up an RTSP connection.

      The callback receives ``pathname`` (the requested stream resource path, defaults to ``"/"``)
      and ``session`` (a random session id).

   .. method:: register_play_cb(cb: Callable[[str, int], None]) -> None

      Bind a callback ``cb`` to be invoked when a client starts streaming.

      The callback receives ``pathname`` and ``session`` as described in
      :meth:`register_setup_cb`.

   .. method:: register_pause_cb(cb: Callable[[str, int], None]) -> None

      Bind a callback ``cb`` to be invoked when a client pauses streaming.

      Note: VLC's pause button does not actually notify the server.

      The callback receives ``pathname`` and ``session`` as described in
      :meth:`register_setup_cb`.

   .. method:: register_teardown_cb(cb: Callable[[str, int], None]) -> None

      Bind a callback ``cb`` to be invoked when a client tears down the RTSP connection.

      The callback receives ``pathname`` and ``session`` as described in
      :meth:`register_setup_cb`.

   .. method:: stream(image_callback: Callable[[str, int], image.Image], quality: int = 90) -> None

      Starts running the `rtsp_server` logic and does not return.

      ``image_callback`` is invoked to produce each frame and must return an `image.Image` object.
      It receives ``pathname`` and ``session`` as described in `rtsp_server.register_setup_cb()`.

      ``quality`` is the JPEG compression quality used while streaming.
