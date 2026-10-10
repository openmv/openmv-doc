Why Bluetooth
=============

Networking gets the camera onto a Wi-Fi or Ethernet
network so it can talk to anything reachable from there.
A laptop down the hall, a server on another continent, a
phone roaming on cellular. That reach comes with
prerequisites. A network has to exist. Some access point
has to be in range, some credentials have to be
available, some router has to be willing to hand the
camera an address. The camera also has to keep the
radio (or the Ethernet port) running hard enough to
maintain the link.

Bluetooth covers the opposite case -- short range, no
infrastructure, low power. The camera and a phone in
the same room exchange data over a direct radio link,
with nothing between them. No access point, no router,
no need for either side to be on any network at all.
The radio stays mostly off between brief bursts of
activity, so a battery that would barely survive a day
on Wi-Fi can run for months.

When Bluetooth is the right tool
--------------------------------

The common cases on a camera:

* **A phone or tablet pairs with the camera.** A nearby
  user opens an app on their phone and configures the
  camera, reads its status, or downloads results --
  without first putting both devices on the same Wi-Fi
  network. Most phones speak Bluetooth Low Energy
  natively, so the user experience is "open the app,
  press connect", not "join this network first".
* **A wearable or sensor reports to the camera.** A
  heart-rate strap, a thermometer, a beacon, a contact
  switch -- all are battery-powered devices designed
  around Bluetooth Low Energy. The camera connects as a
  client, reads their values, and folds the data into
  whatever else it is doing.
* **The camera publishes a small status feed.** Battery
  level, last-detected object, frame rate -- a few
  numbers exposed for anything nearby that wants to read
  them. Pairing is optional; for non-sensitive data the
  camera can advertise the values directly with no
  connection needed at all.
* **Two cameras (or a camera and a microcontroller)
  share data without a network.** Both ends know each
  other; both ends are in the same building; there is
  no reason for the bytes to travel up to the cloud and
  back down to cross the room.

When networking is the right tool instead
-----------------------------------------

Bluetooth's trade-offs are wrong for several common
cases:

* **Out-of-range counterparts.** Bluetooth Low Energy is
  a couple of metres in practice, and tens of metres in
  free space at best. Anything across a building, across
  town, or across the internet needs Wi-Fi or Ethernet.
* **High-bandwidth links.** Bluetooth Low Energy
  delivers tens to a few hundred kilobits per second in
  practice. Streaming frames or any meaningful video
  needs Wi-Fi.
* **Many-to-many group communication on shared
  infrastructure.** A roomful of devices that all talk
  to one server, or a mesh of cameras sharing results --
  that pattern is what an IP network is built for.

Low Energy, not classic
-----------------------

"Bluetooth" in casual use covers two distinct radio
stacks. *Classic Bluetooth* is the one in wireless
headsets, in-car audio, and keyboard / mouse links: a
voice-and-audio-grade radio, a comparatively complex
stack, and noticeable power draw. *Bluetooth Low
Energy* (BLE) is a separate, newer protocol that shares
the brand name and the 2.4 GHz band but very little
else. It is built around short, infrequent radio bursts
to keep average power tiny, and around a key/value data
model rather than streaming audio.

MicroPython on the camera supports BLE only. Classic
Bluetooth is not part of the API at all. "Bluetooth"
below means BLE.

What changes from the networking model
--------------------------------------

BLE has the same five-layer stack networking did, but
the upper layers behave differently:

* There is no "open a socket and send bytes"
  abstraction. BLE is built around a small *key/value
  database* that one side hosts and the other side
  reads, writes, or subscribes to. The camera publishes
  named values (a battery level, a temperature, a
  command register); the peer reads or watches them.
* There is no addressing-by-name. Devices identify
  themselves by *advertising* a short broadcast that
  describes who they are; peers *scan* for those
  broadcasts and pick one to connect to.
* The radio is mostly idle. Both ends agree at
  connection time on how often to wake up and talk. In
  between, both go back to sleep.

Those three differences are what drive the rest of the
BLE API away from the socket model.
