:mod:`vl53l1x` --- VL53L1X ToF distance sensor driver
=====================================================

.. module:: vl53l1x
   :synopsis: VL53L1X time-of-flight distance sensor driver

This module provides a driver for the STMicroelectronics VL53L1X time-of-flight
ranging sensor over I2C. The VL53L1X measures absolute distance up to ~4 m
using a 940 nm invisible laser emitter and a SPAD receiving array.

Example usage::

    import time
    from machine import I2C
    import vl53l1x

    bus = I2C(1)
    tof = vl53l1x.VL53L1X(bus)

    while True:
        print("Distance: {} mm".format(tof.read()))
        time.sleep_ms(100)

Classes
-------

.. class:: VL53L1X(bus: machine.I2C, address: int = 0x29)

   Construct a VL53L1X driver instance.

   - ``bus`` is a configured :py:class:`machine.I2C` bus object used to
     communicate with the sensor.
   - ``address`` is the 7-bit I2C address of the device. Defaults to ``0x29``.

   The constructor performs a soft reset, verifies the chip model ID, writes
   the default configuration block to the device, and applies the start-up
   register fix-up that the ST API performs on the first ranging start. The
   call blocks for ~200 ms while the sensor settles. Raises ``RuntimeError``
   if the model ID register does not return the expected value ``0xEACC``.

   .. method:: writeReg(reg: int, value: int) -> None

      Write a single 8-bit ``value`` to the 16-bit device register address
      ``reg``.

   .. method:: writeReg16Bit(reg: int, value: int) -> None

      Write a 16-bit ``value`` (big-endian) to the 16-bit device register
      address ``reg``.

   .. method:: readReg(reg: int) -> int

      Read a single 8-bit value from the 16-bit device register address
      ``reg`` and return it as an ``int``.

   .. method:: readReg16Bit(reg: int) -> int

      Read a 16-bit value (big-endian) from the 16-bit device register
      address ``reg`` and return it as an ``int``.

   .. method:: read_model_id() -> int

      Return the contents of the 16-bit model-ID register at ``0x010F``. The
      expected value for a VL53L1X is ``0xEACC``.

   .. method:: reset() -> None

      Perform a soft reset of the device by toggling the soft-reset register
      ``0x0000``. Blocks for 100 ms while the device is held in reset.

   .. method:: read() -> int

      Trigger a register read of ``RESULT__RANGE_STATUS`` (``0x0089``) and
      return the final crosstalk-corrected range, in millimetres, of the
      single-zone detector ``SD0`` as an ``int``.

Constants
---------

.. data:: VL51L1X_DEFAULT_CONFIGURATION
   :type: bytes

   Default 91-byte configuration block written to the device starting at
   register ``0x2D`` during construction. The block sets the interrupt
   polarity, sigma threshold, signal threshold, intermeasurement period,
   distance thresholds, ROI center/size, and other ranging parameters
   recommended by the ST ultra-light driver. Most bytes are not
   user-modifiable; refer to the in-source comments for the user-tunable
   fields.
