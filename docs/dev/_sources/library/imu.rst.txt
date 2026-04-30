:mod:`imu` --- IMU helper for the Arduino Nano 33 BLE Sense
===========================================================

.. module:: imu
   :synopsis: IMU helper for the Arduino Nano 33 BLE Sense
   :no-index:

.. note::

   This page documents the Arduino Nano 33 BLE Sense's Python ``imu`` module
   (a small wrapper around the on-board IMU drivers). For the OpenMV C-level
   ``imu`` module that ships on the OPENMV_N6, OPENMV_RT1060, and OPENMV_AE3
   camera boards, see :doc:`omv.imu`.

This module is a thin board-specific wrapper that exposes the on-board inertial
measurement unit of the Arduino Nano 33 BLE Sense as a single
:py:class:`~imu.IMU` object. Both hardware revisions of the board are handled
transparently:

- **Rev 1** uses a single LSM9DS1 9-axis IMU.
- **Rev 2** combines a Bosch BMI270 (accelerometer + gyroscope) with a Bosch
  BMM150 magnetometer.

The constructor probes the I2C bus for the BMI270 address (``0x68``) and selects
the matching driver automatically, so user code can be written once and run on
either revision.

Example::

    import time
    import imu
    from machine import Pin, I2C

    bus = I2C(1, scl=Pin(15), sda=Pin(14))
    sensor = imu.IMU(bus)

    while True:
        print('Accelerometer: x:{:>8.3f} y:{:>8.3f} z:{:>8.3f}'.format(*sensor.accel()))
        print('Gyroscope:     x:{:>8.3f} y:{:>8.3f} z:{:>8.3f}'.format(*sensor.gyro()))
        print('Magnetometer:  x:{:>8.3f} y:{:>8.3f} z:{:>8.3f}'.format(*sensor.magnet()))
        print("")
        time.sleep_ms(100)

class IMU
---------

.. class:: IMU(bus: "machine.I2C")

    Construct an IMU object bound to an I2C bus.

        - *bus* is an initialised :py:class:`machine.I2C` instance connected
          to the on-board IMU(s).

    On construction the bus is scanned: if a device responds at address
    ``0x68`` a `BMI270` plus `BMM150` pair is instantiated (Nano 33 BLE Sense
    Rev 2), otherwise an `LSM9DS1` is instantiated (Rev 1). The underlying
    driver is kept on the ``imu`` attribute and configured with default ranges
    and output data rates.

    .. method:: accel() -> tuple[float, float, float]

        Return the latest accelerometer reading as an ``(x, y, z)`` tuple in
        units of *g* (standard gravities).

    .. method:: gyro() -> tuple[float, float, float]

        Return the latest gyroscope reading as an ``(x, y, z)`` tuple in
        degrees per second.

    .. method:: magnet() -> tuple[float, float, float]

        Return the latest magnetometer reading as an ``(x, y, z)`` tuple in
        micro-tesla (uT).
