Pairing and bonding
===================

Everything covered up to here moves bytes over the
radio in the clear. Anyone with a BLE-capable laptop in
the same room can listen on the advertising channels,
follow the hopping sequence of an open connection, and
read out every read, write, and notification that goes
across. For most public sensor data (battery level,
ambient temperature) that is fine. For anything the two
endpoints want to keep private -- a control register
that arms a relay, a password, a measurement that
should not be widely broadcast -- the link needs to be
encrypted, and ideally the camera needs to know *who*
it is talking to.

BLE provides both through *pairing* and *bonding*.

Pairing, bonding, encryption
----------------------------

Three closely related concepts:

* **Encryption** is the bottom-line goal. Once the link
  is encrypted, every packet on the data channels is
  decipherable only by the two endpoints; an
  eavesdropper sees noise.
* **Pairing** is the procedure the two endpoints run
  *to agree on the keys* that encryption uses. It is a
  one-time exchange that produces shared key material
  the link layer plugs into its encryption engine.
* **Bonding** is the choice to *persist* the keys to
  non-volatile storage after pairing finishes, so the
  next connection between the same two devices skips
  pairing and goes straight to encryption.

Plain English: pairing is "introduce yourselves";
bonding is "remember this introduction"; encryption is
"speak in private from now on".

.. figure:: ../figures/pairing-flow.svg
   :alt: Two columns labelled "Central" and
         "Peripheral". A dashed line near the top
         labelled "BLE connection open (unencrypted)".
         Below it, three arrows: "pairing request" from
         central to peripheral, "key exchange" both
         directions, "pairing complete" forward. A
         second dashed line below labelled "link
         encrypted". Two thick bidirectional arrows
         carry "encrypted GATT traffic". An optional
         "store keys to flash" box on the side, labelled
         "bonding".

   The pairing flow on top of an open BLE connection.
   Once the key exchange completes, the link layer
   encrypts every subsequent packet. Bonding is the
   extra step of writing the keys to flash.

LE Secure Connections
---------------------

The modern key exchange used by BLE is *LE Secure
Connections*, built on Elliptic Curve Diffie-Hellman.
Both sides generate a temporary key pair, exchange the
public halves, and combine the result with their own
private keys to arrive at the same shared secret -- a
secret an eavesdropper cannot compute even with a full
record of the exchange.

The older *LE Legacy* method is less safe (an
eavesdropper with the full exchange can usually
recover the key) and exists only for backward
compatibility with old peripherals. The :mod:`aioble`
default is the modern method (``le_secure=True``);
keep it.

Initiating pairing
------------------

A central pairs by calling
:meth:`aioble.DeviceConnection.pair` on an already-open
connection::

    async with await device.connect() as connection:
        await connection.pair(bond=True, le_secure=True, mitm=False)
        # ... GATT work, now over an encrypted link ...

After ``pair`` returns, the
:attr:`~aioble.DeviceConnection.encrypted`,
:attr:`~aioble.DeviceConnection.authenticated`,
:attr:`~aioble.DeviceConnection.bonded`, and
:attr:`~aioble.DeviceConnection.key_size` attributes on
the connection reflect what was negotiated.

The four most useful keyword arguments:

* ``bond=True`` -- save the resulting keys to flash so
  the next connection between the same two devices
  skips the pairing handshake. Default ``True``.
* ``le_secure=True`` -- use LE Secure Connections.
  Default ``True``. Leave it on.
* ``mitm=False`` -- whether to require
  *man-in-the-middle* protection. This needs an
  out-of-band channel (a numeric code displayed on
  one side and confirmed on the other, a passkey
  typed in, ...) so the user can verify the two
  devices in the pairing handshake are actually the
  ones they think.
  Defaults to ``False`` (no MITM protection -- a
  passive eavesdropper cannot read the link, but an
  attacker actively redirecting connections could pair
  themselves in). Set to ``True`` for anything
  sensitive, but be aware that it requires the
  peripheral to actually support an IO capability.
* ``io=3`` -- the IO capability the device claims. The
  Bluetooth spec defines five: ``0`` display only, ``1``
  display + yes/no, ``2`` keyboard only, ``3`` no
  input no output, ``4`` keyboard + display. A camera
  with no UI typically reports ``3``; if the camera
  itself has a display the application could display
  the numeric confirmation and use ``1``. The
  combination of the two sides' IO capabilities
  decides whether real MITM protection is achievable.

Peripherals do not call ``pair`` themselves -- they
respond to whatever the central initiates. Whether
encryption is required for a given characteristic is a
property of how it is declared in the GATT database;
encryption-required access bits are part of the
low-level :mod:`bluetooth` API and not currently
exposed through the :mod:`aioble` characteristic
constructor.

Bonding -- and where the keys live
----------------------------------

When ``bond=True``, :mod:`aioble` writes the keys to a
JSON file on the local filesystem. The default filename
is ``ble_secrets.json``, written relative to the current
working directory. On a freshly booted cam ``_boot.py``
has already chosen that directory: ``/sdcard`` when a
card is mounted, ``/flash`` otherwise -- so the file
lands at ``/sdcard/ble_secrets.json`` or
``/flash/ble_secrets.json``. The file holds the entries
needed to re-encrypt the link the next time the bonded
peer reconnects, including the peer's identity address.

One asymmetry to keep in mind: *saving* happens
automatically as keys change, but *loading* the file on
the next boot does not. Call
:func:`aioble.security.load_secrets` once at startup
(before any pairing or advertising) so previously bonded
peers are recognised::

    import aioble
    aioble.security.load_secrets()        # default path: ble_secrets.json

After that, the next time a bonded peer shows up,
:mod:`aioble` re-uses the stored keys and the link goes
encrypted with no further handshake.

Two practical consequences of storing keys on flash:

* **Forgetting a device.** Delete ``ble_secrets.json``
  (or remove the relevant entry) to forget all bonded
  peers, then re-pair from scratch.
* **Physical access leaks keys.** Anyone with access
  to the camera's filesystem can read the JSON. This
  is the same kind of constraint that came up on the
  networking side with TLS keys
  (:doc:`/openmvcam/tutorial/production/tls/operations`):
  use per-device keys, treat any stored key as
  recoverable, and rely on the ability to revoke (here,
  removing the bond on the central side) rather than
  on the key staying secret.

What encryption guarantees -- and what it does not
--------------------------------------------------

A pair-then-encrypt link gives, in order of strength:

* **Confidentiality.** Always. An eavesdropper cannot
  read the bytes.
* **Integrity.** Always. Modified packets fail the
  link-layer authenticated-encryption check and are
  dropped.
* **Authentication.** Only with ``mitm=True`` and a
  capable IO. Without it, a man-in-the-middle that
  intercepted the *original* pairing exchange could
  have inserted themselves; without MITM protection
  there is no way for the two sides to know.

For most camera use cases -- a phone pairing with the
camera once, then connecting again later -- ``mitm=False``
is usually enough, because the original pairing happens
in a controlled environment (the user holds both devices
in the same room). For applications where a paired
device might first encounter the camera over a long
distance or through an untrusted intermediary, MITM is
the right setting.

When pairing is the wrong answer
--------------------------------

Pairing has a real cost: a few seconds of exchange on
first connect, persistent flash use for every bonded
device, and the recovery story of "forget the bond" if
something goes wrong. For genuinely public data --
ambient sensor readings published as a beacon, a sign
displaying its name, anything that does not change the
world by being read or written -- the right answer is
*not* to encrypt at all, and let any nearby scanner
read the values.

For everything else, ``connection.pair(bond=True)`` on
the central is the one-line addition that turns the
link from a public channel into a private one.
