.. currentmodule:: pyb
.. _pyb.ADCAll:

class ADCAll -- access all ADC channels
=======================================

:class:`ADCAll` exposes every ADC channel on the MCU through a single
object -- both the external analog-input pins and the internal
channels for die temperature, the 1.21 V reference and ``VBAT``. It
is useful for monitoring the MCU's supply rail and on-chip sensors
without instantiating an :class:`ADC` per pin.

Example::

    import pyb

    # 12-bit resolution, internal channels only (temp + VBAT + VREF).
    adcall = pyb.ADCAll(12, 0x70000)
    temp = adcall.read_core_temp()
    vbat = adcall.read_core_vbat()
    vref = adcall.read_core_vref()
    vdda = adcall.read_vref()

Constructors
------------

.. class:: ADCAll(resolution: int, mask: int = 0xffffffff)

   Provides simultaneous access to every ADC channel on the MCU,
   including the internal channels for die temperature, the internal
   1.21 V reference, and ``VBAT``. Constructing this object switches all
   masked external ADC pins to analog-input mode.

   - ``resolution`` is the ADC conversion resolution in bits (typically
     ``8``, ``10`` or ``12``).
   - ``mask`` is a 32-bit bitmask selecting which channels to enable;
     bit ``N`` enables channel ``N``. Defaults to ``0xffffffff`` (all
     channels). The internal channels live at bits ``16`` (temperature),
     ``17`` (VBAT) and ``18`` (VREF), so to enable only the internal
     channels pass ``0x70000``.

   The on-chip temperature sensor is factory calibrated and accurate to
   roughly ±1 °C, but it measures the die temperature -- which is
   typically tens of degrees above ambient when the MCU is active.
   Readings are only meaningful as a proxy for ambient on a freshly
   woken board.

   .. warning::

      Analog input voltages must never exceed the actual supply voltage.

   Methods
   -------

   .. method:: read_channel(channel: int) -> int

      Read the given ADC channel. External channels (``0`` -- ``15``)
      return unscaled raw values at the configured resolution; the
      internal channels (``16``--``18``) return raw values too, but the
      dedicated helpers below convert them to voltages.

   .. method:: read_core_temp() -> float

      Return the on-die temperature in degrees Celsius, computed from
      the internal temperature channel and the factory calibration
      values stored in the MCU.

   .. method:: read_core_vbat() -> float

      Return the backup-battery voltage in volts. The reading is taken
      through an on-chip voltage divider (so the headroom does not
      restrict the ADC's input range) and scaled back to the actual
      battery voltage. The divider is only active during the ADC
      conversion, so the standby drain on the backup battery is
      negligible.

   .. method:: read_core_vref() -> float

      Return the internal 1.21 V (nominal) reference voltage in volts,
      measured with the MCU supply as the ADC reference. This is the
      raw conversion result.

   .. method:: read_vref() -> float

      Return the MCU supply voltage in volts. Computed by measuring the
      internal voltage reference and back-scaling using its factory
      calibration value. With a healthy 3.3 V rail the reading will be
      close to ``3.3``. The MCU continues to operate -- and ADC
      conversions remain meaningful -- with a supply as low as around
      2 V, provided the appropriate MCU clock, flash access speed and
      programming-mode settings are observed.
