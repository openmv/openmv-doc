.. currentmodule:: machine
.. _machine.ADC:

class ADC -- analog to digital conversion
=========================================

The :class:`ADC` class wraps a single analog-to-digital converter
channel that samples a voltage on a pin (or one of the on-chip
analog channels) and returns its discretised value.

Example usage::

   from machine import ADC, Pin

   adc = ADC(Pin("P6"))      # ADC channel on header pin P6 (PA5)
   val = adc.read_u16()      # raw reading scaled to 0..65535

Constructors
------------

.. class:: ADC(id: int | str | Pin) -> ADC

   Construct an :class:`ADC` object for the analog source identified
   by ``id``. The accepted forms are:

      * an integer channel number (``0`` -- ``18`` on STM32, port-
        specific elsewhere);
      * a :class:`Pin` object, or a board pin string such as
        ``"P6"`` -- the pin must be analog-capable;
      * one of the internal-channel constants (:data:`CORE_TEMP`,
        :data:`CORE_VREF`, :data:`CORE_VBAT`, :data:`VREF` or
        :data:`CORE_VDD`) to read the MCU's internal sensors.
        STM32 only.

   Methods
   -------

   .. method:: read_u16() -> int

      Sample the analog channel once and return the result as an
      unsigned 16-bit integer (``0`` -- ``65535``). Lower-resolution
      ADCs are left-aligned into the 16-bit range so the
      port-specific raw resolution is hidden.

   .. method:: read_uv() -> int

      Sample the analog channel and return the result in microvolts.
      The reading is calibrated against the internal reference where
      hardware supports it. mimxrt port only.

   Constants
   ---------

   The constants below are only available on the STM32 port; pass
   them as the ``id`` argument to construct an :class:`ADC` that
   reads one of the on-chip analog sensors. The result of
   :meth:`read_u16` is the channel's raw 16-bit reading; for
   calibrated values use the helpers on :class:`pyb.ADCAll`.

   .. data:: VREF
      :type: int

      External voltage-reference channel.

   .. data:: CORE_VREF
      :type: int

      Internal 1.21 V (nominal) voltage-reference channel
      (``VREFINT``).

   .. data:: CORE_TEMP
      :type: int

      Internal die-temperature sensor channel.

   .. data:: CORE_VBAT
      :type: int

      Backup-battery voltage channel (``VBAT``).

   .. data:: CORE_VDD
      :type: int

      MCU supply-rail channel (``VDDA``).
