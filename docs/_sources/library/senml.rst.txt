:mod:`senml` -- Sensor Markup Language
======================================

.. module:: senml
   :synopsis: Sensor Markup Language (SenML) encoder/decoder

This module implements a small encoder/decoder for the Sensor Markup
Language (SenML, `RFC 8428 <https://datatracker.ietf.org/doc/html/rfc8428>`_).
SenML is a media-type for sensor measurements and device parameters: each
"pack" is a list of "records", where every record carries a name, unit,
value, timestamp, and optional sum.

The implementation supports both the JSON and CBOR representations and
allows packs to be nested so that a single root pack can describe a gateway
fronting multiple devices. Inbound payloads can drive actuator callbacks on
existing records.

CBOR encoding/decoding requires the ``cbor2`` package.

Classes
-------

.. class:: SenmlPack(name: str, callback = None)

   Represents a SenML pack -- a collection of `SenmlRecord` instances and
   optionally other child :class:`SenmlPack` objects. When a pack only
   contains records it represents a single device; when it contains other
   packs it acts as a gateway.

   *name* is the SenML base name (``bn``) used for every record contained in
   this pack.

   *callback* is invoked from `from_json` / `from_cbor` whenever an inbound
   record names a previously-unknown sensor; the new `SenmlRecord` is passed
   as the first argument and (for nested packs) the originating device pack
   is passed as ``device=...``. It is typically used to handle actuator
   commands.

   :class:`SenmlPack` instances are iterable -- iteration yields each record
   in insertion order -- and may be used as a context manager so that on
   exit the pack removes itself from its parent.

   .. attribute:: name
      :type: str

      The pack's base name (``bn``).

   .. attribute:: base_value
      :type: int | float | None

      Optional base value (``bv``) added to each record's numeric value when
      encoding and subtracted on decoding. Setting a non-numeric value
      raises ``Exception``.

   .. attribute:: base_time
      :type: int | float | None

      Optional base time (``bt``) added to each record's timestamp.

   .. attribute:: base_sum
      :type: int | float | None

      Optional base sum (``bs``) added to each record's sum field.

   .. attribute:: base_unit
      :type: str | None

      Optional base unit (``bu``) -- typically a value from `SenmlUnits`.

   .. attribute:: actuate

      The callback supplied at construction time. May be re-assigned at
      runtime.

   .. method:: add(item: SenmlRecord | SenmlPack) -> None

      Append *item* to this pack. *item* must be a `SenmlRecord` or another
      :class:`SenmlPack` and must not already belong to a different parent;
      otherwise ``Exception`` is raised.

   .. method:: remove(item: SenmlRecord | SenmlPack) -> None

      Remove *item* from this pack. ``Exception`` is raised if *item* is
      not a child of this pack.

   .. method:: clear() -> None

      Remove every record/sub-pack from this pack and detach them from
      their parent reference.

   .. method:: from_json(data: str) -> None

      Parse a SenML/JSON document and merge the records into this pack.
      Records that already exist (matched by name) trigger
      :meth:`SenmlRecord.do_actuate`; new records are appended and the
      pack-level *callback* is invoked.

   .. method:: to_json() -> str

      Render the pack and its children to a SenML/JSON string.

   .. method:: from_cbor(data: bytes) -> None

      Parse a SenML/CBOR byte string and merge the records into this pack.

   .. method:: to_cbor() -> bytes

      Render the pack and its children to a SenML/CBOR byte string.

   .. method:: do_actuate(raw: dict, naming_map: dict, device: SenmlPack | None = None) -> None

      Internal helper invoked while parsing inbound data when no existing
      record matches an entry. Adds a new `SenmlRecord` to ``device`` (or to
      this pack) and forwards it to the *callback*.

.. class:: SenmlRecord(name: str, **kwargs)

   Represents a single measurement inside a `SenmlPack`.

   *name* is the SenML record name (``n``).

   The following keyword arguments are accepted:

   - *value* -- ``bool``, ``int``, ``float``, ``str`` or ``bytearray``.
     Other types raise ``Exception``.
   - *time* -- numeric timestamp (``t``).
   - *unit* -- a unit string, typically a member of `SenmlUnits`.
   - *sum* -- numeric integrated sum (``s``).
   - *update_time* -- maximum time before the sensor will provide a fresh
     reading (``ut``).
   - *callback* -- function invoked when an inbound payload updates this
     record. It receives the `SenmlRecord` as its only argument.

   :class:`SenmlRecord` may be used as a context manager so that on exit it
   removes itself from its parent pack.

   .. attribute:: name
      :type: str

      Record name (``n``).

   .. attribute:: value

      The current value. Re-assigning checks the type; only ``bool``,
      numbers, ``str`` and ``bytearray`` are accepted. To control the
      rendered precision of a float value, round before assignment, e.g.
      ``record.value = round(x, 2)``.

   .. attribute:: unit
      :type: str | None

      Unit string (``u``).

   .. attribute:: time
      :type: int | float | None

      Timestamp associated with this measurement (``t``).

   .. attribute:: update_time
      :type: int | float | None

      Maximum time before the sensor will provide an updated reading
      (``ut``).

   .. attribute:: sum
      :type: int | float | None

      Integrated sum field (``s``).

   .. attribute:: actuate

      The callback supplied at construction time. May be re-assigned at
      runtime.

   .. method:: do_actuate(raw: dict, naming_map: dict) -> None

      Update this record from a raw inbound SenML dictionary and, if
      present, invoke the actuate callback.

.. class:: SenmlBase

   Common base class shared by `SenmlPack` and `SenmlRecord`. It exposes no
   public API of its own; it exists so :meth:`SenmlPack.add` can validate
   that an item belongs to the SenML hierarchy.

.. class:: SenmlUnits

   Enumeration object whose attributes are the SenML unit symbols defined by
   `RFC 8428 <https://datatracker.ietf.org/doc/html/rfc8428>`_. Each
   attribute resolves to the unit's string code, suitable for assignment to
   `SenmlRecord.unit` or :attr:`SenmlPack.base_unit`.

   Examples of available unit attributes:

   - ``SENML_UNIT_METER`` -> ``"m"``
   - ``SENML_UNIT_KILOGRAM`` -> ``"kg"``
   - ``SENML_UNIT_SECOND`` -> ``"s"``
   - ``SENML_UNIT_AMPERE`` -> ``"A"``
   - ``SENML_UNIT_KELVIN`` -> ``"K"``
   - ``SENML_UNIT_DEGREES_CELSIUS`` -> ``"Cel"``
   - ``SENML_UNIT_HERTZ`` -> ``"Hz"``
   - ``SENML_UNIT_VOLT`` -> ``"V"``
   - ``SENML_UNIT_WATT`` -> ``"W"``
   - ``SENML_UNIT_PASCAL`` -> ``"Pa"``
   - ``SENML_UNIT_LUX`` -> ``"lx"``
   - ``SENML_UNIT_RELATIVE_HUMIDITY`` -> ``"%RH"``
   - ``SENML_UNIT_VELOCITY`` -> ``"m/s"``
   - ``SENML_UNIT_ACCELERATION`` -> ``"m/s2"``
   - ``SENML_UNIT_DEGREES_LATITUDE`` -> ``"lat"``
   - ``SENML_UNIT_DEGREES_LONGITUDE`` -> ``"lon"``
   - ``SENML_UNIT_BIT_PER_SECOND`` -> ``"bit/s"``
   - ``SENML_UNIT_COUNTER`` -> ``"count"``
   - ``SENML_UNIT_RATIO`` -> ``"//"``
   - ``SENML_UNIT_BPM`` -> ``"beat/min"``

   See the SenML unit registry in
   `RFC 8428 Section 12.1 <https://datatracker.ietf.org/doc/html/rfc8428#section-12.1>`_
   for the complete list.

Examples
--------

.. code:: python

   from senml import SenmlPack, SenmlRecord, SenmlUnits

   pack = SenmlPack("urn:dev:mac:0024befffe804ff1")
   temp = SenmlRecord("temperature", unit=SenmlUnits.SENML_UNIT_DEGREES_CELSIUS, value=23.4)
   hum = SenmlRecord("humidity", unit=SenmlUnits.SENML_UNIT_RELATIVE_HUMIDITY, value=51.2)
   pack.add(temp)
   pack.add(hum)
   print(pack.to_json())
