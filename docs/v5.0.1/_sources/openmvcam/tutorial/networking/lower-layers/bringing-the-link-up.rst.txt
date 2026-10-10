Bringing the link up
====================

The link layer covered on the previous page is mostly
automatic, but there is one place a Python script has
to step in: telling the camera which network to join.
Until that step succeeds, none of the network features
the rest of this section covers will work.

The :mod:`network` module
-------------------------

The :mod:`network` module exposes the camera's
networking hardware to Python. The exact set of
interfaces depends on the board: many cams have a
wireless chip and expose a :class:`~network.WLAN`
class (named for *Wireless Local Area Network*);
some boards also have a built-in Ethernet port and
expose a :class:`~network.LAN` class (named for
*Local Area Network*, i.e. the wired version). The
pattern of use is the same for both, with one
important difference: a wireless interface has to be
told which network to join, while Ethernet picks up
whatever is on the cable.

The Wi-Fi flow
--------------

Joining a Wi-Fi network is three steps: construct the
interface, bring it up, ask it to connect to a named
network with a password. The interface negotiates
with the access point in the background; an
:meth:`~network.WLAN.isconnected` call reports when
the link has finished coming up::

    import network
    import time

    wlan = network.WLAN(network.WLAN.IF_STA)
    wlan.active(True)
    wlan.connect("my-network", "my-password")

    while not wlan.isconnected():
        time.sleep_ms(100)

    print("link up")

The argument ``IF_STA`` selects *station* mode -- the
camera joins a network somebody else is hosting. The
opposite mode, ``IF_AP``, makes the camera host its
own small network that other devices can join; useful
for configuration interfaces and on-site setup, but
not the common case.

Once :meth:`~network.WLAN.isconnected` returns
:data:`True`, the camera is on the network. Everything
else the higher layers needed to set themselves up
has happened automatically while the link was coming
up; the pages ahead spell those pieces out one at a
time.

What can go wrong
-----------------

A few practical failure modes show up at this step.

* **Wrong network name or password.** The connection
  attempt silently retries until the application gives
  up. Wrap the wait with a timeout so the loop above
  does not block forever::

      start = time.ticks_ms()
      while not wlan.isconnected():
          if time.ticks_diff(time.ticks_ms(), start) > 10000:
              raise OSError("Wi-Fi did not come up in 10 s")
          time.sleep_ms(100)

* **Out of range.** The camera and the access point
  have to be close enough that the signal is strong
  enough to hold a link.
  :meth:`~network.WLAN.status` returns a code
  indicating why the link is not up;
  :meth:`~network.WLAN.scan` returns the list of
  networks the radio can see, which is the diagnostic
  to run when ``connect`` will not succeed.

* **Access point asks for more than a password.**
  Open networks (no password) and the common
  password-protected ones are covered by ``connect``
  as shown above. Larger networks at workplaces and
  schools sometimes use a different scheme where the
  camera has to authenticate against a separate login
  server; those need extra arguments to ``connect``.
  See :doc:`/library/network.WLAN` for the full
  surface.

Staying connected
-----------------

Bringing the link up is half the problem. Staying
connected is the other half -- access points reboot,
the cam roams out of range, DHCP leases expire, the
radio firmware occasionally gets stuck. A cam that is
going to live on the network for months has to notice
that and recover on its own.

The detection pattern is to call
:meth:`~network.WLAN.isconnected` once per main-loop
iteration and react when it returns :data:`False`.
``isconnected()`` can lie briefly when a connection has
dropped without the radio having noticed yet -- a
socket send that fails when the link "should" be up is
the application's other evidence of a drop.
:meth:`~network.WLAN.status` is the more authoritative
source when the two disagree.

The reconnect pattern is :meth:`~network.WLAN.disconnect`
followed by :meth:`~network.WLAN.connect` with the same
credentials, with the wait wrapped in a timeout as on
the initial connection. Back off between attempts --
one second, two, four, doubling up to a minute or so
-- so a long outage does not hammer the AP and does
not burn the radio's power budget on spin loops::

    import network
    import time

    _BACKOFF_S = (1, 2, 4, 8, 16, 32, 60)

    def reconnect(wlan, ssid, password):
        for delay in _BACKOFF_S:
            wlan.disconnect()
            wlan.connect(ssid, password)
            deadline = time.ticks_add(time.ticks_ms(), 10_000)
            while not wlan.isconnected():
                if time.ticks_diff(deadline, time.ticks_ms()) < 0:
                    break
                time.sleep_ms(100)
            if wlan.isconnected():
                return True
            time.sleep(delay)
        return False

When that helper keeps returning :data:`False`, the
radio firmware itself may be wedged. The last resort is
power-cycling the radio:
:meth:`active(False) <network.WLAN.active>`, a brief
pause, :meth:`active(True) <network.WLAN.active>`,
reconnect from scratch. This brings the radio firmware
back to a known state at the cost of an extra few
seconds of downtime::

    def radio_power_cycle(wlan, ssid, password):
        wlan.active(False)
        time.sleep(1)
        wlan.active(True)
        return reconnect(wlan, ssid, password)

A cam that has been off-network for minutes is a real
failure that the application has to see. The recovery
code should surface that state -- mark the network as
unhealthy in a flag the main loop checks, and let the
application skip the network sends it would have made
while the flag is clear -- so a long outage does not
stall the application waiting on sockets that will
never write.

Ethernet, when present
----------------------

Boards with built-in Ethernet expose the same pattern
without the ``connect`` step. The :class:`~network.LAN`
interface is brought up with
:meth:`~network.LAN.active`, and as soon as the cable
is plugged in the interface is ready to use::

    import network

    lan = network.LAN()
    lan.active(True)
    print("link up")

After this point the rest of this section's pages
apply the same way regardless of which interface
brought the camera onto the network. The higher
layers do not care whether the link below them is
Wi-Fi or Ethernet -- "connected" is "connected".

For the full :class:`~network.WLAN` and
:class:`~network.LAN` reference, including the
configuration knobs that did not fit here, see
:doc:`/library/network`.
