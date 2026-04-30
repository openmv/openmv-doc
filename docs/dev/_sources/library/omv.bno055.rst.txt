:mod:`bno055` --- BNO055 IMU Driver
===================================

.. module:: bno055
   :synopsis: BNO055 IMU driver

This module provides a driver for the Bosch BNO055 9-axis absolute orientation
sensor over I2C. The BNO055 fuses accelerometer, magnetometer, and gyroscope
data on-chip and exposes quaternion, Euler-angle, linear-acceleration, and
gravity outputs in addition to the raw sensor channels.

Example usage::

    import time
    from machine import I2C
    import bno055

    bus = I2C(1)
    imu = bno055.BNO055(bus)

    while True:
        print(imu.euler())
        time.sleep_ms(100)

Classes
-------

.. class:: BNO055(bus: machine.I2C, address: int = 0x28, mode: int = NDOF_MODE, axis: bytes = AXIS_P4)

   Construct a BNO055 driver instance.

   - ``bus`` is a configured :py:class:`machine.I2C` bus object used to
     communicate with the sensor.
   - ``address`` is the 7-bit I2C address of the device. Defaults to ``0x28``.
   - ``mode`` is the operation mode the device is placed into after reset. See
     the operation-mode constants below. Defaults to :data:`NDOF_MODE`.
   - ``axis`` is a 2-byte axis-remap configuration value. See the axis
     placement constants below. Defaults to :data:`AXIS_P4`.

   The constructor verifies the chip ID, performs a soft reset, switches to
   normal power, applies the axis configuration, and enters the requested
   operation mode using the external oscillator. Raises ``RuntimeError`` if
   the expected ID register values are not read back.

   .. method:: read_registers(register: int, size: int = 1) -> bytes

      Read ``size`` bytes from the given device register and return them as
      a ``bytes`` object.

   .. method:: write_registers(register: int, data: bytes) -> None

      Write the given ``data`` bytes to the device starting at ``register``.

   .. method:: operation_mode(mode: int = None) -> int

      Get or set the operation mode register. With no argument, returns the
      current mode as an ``int``. With a ``mode`` argument, writes the new
      mode to the device. See the operation-mode constants below.

   .. method:: system_trigger(data: int) -> None

      Write ``data`` to the system trigger register (``0x3F``). This is used
      internally to issue a soft reset (``0x20``) and to select the external
      oscillator (``0x80``).

   .. method:: power_mode(mode: int = None) -> bytes

      Get or set the power mode register. With no argument, returns the
      current power-mode register contents. With a ``mode`` argument, writes
      the new power mode to the device.

   .. method:: page(num: int = None) -> None

      Get or set the register page. With no argument, reads the current page
      register. With a ``num`` argument, selects the page.

   .. method:: temperature() -> int

      Return the chip temperature register value as an unsigned byte.

   .. method:: read_id() -> bytes

      Return the 4-byte ID block read from register ``0x00``. The expected
      value is ``b'\xA0\xFB\x32\x0F'``.

   .. method:: axis(placement: bytes = None) -> bytes

      Get or set the axis remap configuration. With no argument, returns the
      current 2-byte axis configuration. With a ``placement`` argument,
      writes the supplied 2-byte axis configuration. Use one of the
      ``AXIS_P0``..``AXIS_P7`` constants below.

   .. method:: quaternion() -> list

      Return the fused orientation as a 4-element list ``[w, x, y, z]`` of
      floats scaled to the unit quaternion range.

   .. method:: euler() -> list

      Return the fused orientation as a 3-element list ``[yaw, roll, pitch]``
      of floats in degrees.

   .. method:: accelerometer() -> list

      Return the accelerometer reading as a 3-element list ``[x, y, z]`` of
      floats in m/s^2.

   .. method:: magnetometer() -> list

      Return the magnetometer reading as a 3-element list ``[x, y, z]`` of
      floats in micro-Tesla.

   .. method:: gyroscope() -> list

      Return the gyroscope reading as a 3-element list ``[x, y, z]`` of
      floats in degrees per second.

   .. method:: linear_acceleration() -> list

      Return the gravity-compensated linear acceleration as a 3-element list
      ``[x, y, z]`` of floats in m/s^2.

   .. method:: gravity() -> list

      Return the gravity vector as a 3-element list ``[x, y, z]`` of floats
      in m/s^2.

Constants
---------

Operation modes
~~~~~~~~~~~~~~~

.. data:: CONFIG_MODE
   :type: int

   Configuration mode (``0x00``). The device must be in this mode to change
   configuration registers.

.. data:: ACCONLY_MODE
   :type: int

   Accelerometer-only non-fusion mode (``0x01``).

.. data:: MAGONLY_MODE
   :type: int

   Magnetometer-only non-fusion mode (``0x02``).

.. data:: GYRONLY_MODE
   :type: int

   Gyroscope-only non-fusion mode (``0x03``).

.. data:: ACCMAG_MODE
   :type: int

   Accelerometer + magnetometer non-fusion mode (``0x04``).

.. data:: ACCGYRO_MODE
   :type: int

   Accelerometer + gyroscope non-fusion mode (``0x05``).

.. data:: MAGGYRO_MODE
   :type: int

   Magnetometer + gyroscope non-fusion mode (``0x06``).

.. data:: AMG_MODE
   :type: int

   Accelerometer + magnetometer + gyroscope non-fusion mode (``0x07``).

.. data:: IMUPLUS_MODE
   :type: int

   IMU fusion mode using accelerometer + gyroscope (``0x08``).

.. data:: COMPASS_MODE
   :type: int

   Compass fusion mode using accelerometer + magnetometer (``0x09``).

.. data:: M4G_MODE
   :type: int

   Magnet-for-gyroscope fusion mode (``0x0A``).

.. data:: NDOF_FMC_OFF_MODE
   :type: int

   9-DOF fusion mode with fast magnetometer calibration disabled (``0x0B``).

.. data:: NDOF_MODE
   :type: int

   9-DOF fusion mode with fast magnetometer calibration enabled (``0x0C``).
   This is the default mode used by the constructor.

Axis placements
~~~~~~~~~~~~~~~

The following 2-byte values are passed to :meth:`BNO055.axis` to remap the
device coordinate system. They correspond to the eight standard placement
orientations listed in the BNO055 datasheet.

.. data:: AXIS_P0
   :type: bytes

.. data:: AXIS_P1
   :type: bytes

.. data:: AXIS_P2
   :type: bytes

.. data:: AXIS_P3
   :type: bytes

.. data:: AXIS_P4
   :type: bytes

   Default axis placement used by the constructor.

.. data:: AXIS_P5
   :type: bytes

.. data:: AXIS_P6
   :type: bytes

.. data:: AXIS_P7
   :type: bytes
