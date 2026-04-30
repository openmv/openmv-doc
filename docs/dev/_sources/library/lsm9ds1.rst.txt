:mod:`lsm9ds1` --- LSM9DS1 9-axis IMU
=====================================

.. module:: lsm9ds1
   :synopsis: STMicroelectronics LSM9DS1 9-axis IMU driver

Driver for the ST LSM9DS1 iNEMO inertial module over I2C. The LSM9DS1
combines a 3-axis accelerometer, 3-axis gyroscope and 3-axis magnetometer
in a single package; the accelerometer and gyroscope share an I2C address
while the magnetometer responds on a second address. This driver also
enables the on-chip 16-deep gyro/accel FIFO so that the most recent
samples can be drained efficiently through :meth:`iter_accel_gyro`.

Example::

    import time
    from machine import Pin, I2C
    from lsm9ds1 import LSM9DS1

    imu = LSM9DS1(I2C(1, scl=Pin(15), sda=Pin(14)))

    while True:
        print("Accelerometer: x:{:>8.3f} y:{:>8.3f} z:{:>8.3f}".format(*imu.accel()))
        print("Magnetometer:  x:{:>8.3f} y:{:>8.3f} z:{:>8.3f}".format(*imu.magnet()))
        print("Gyroscope:     x:{:>8.3f} y:{:>8.3f} z:{:>8.3f}".format(*imu.gyro()))
        time.sleep_ms(100)

Classes
-------

.. class:: LSM9DS1(bus: machine.I2C, address_imu: int = 0x6B, address_magnet: int = 0x1E, gyro_odr: float = 952, gyro_scale: int = 245, accel_odr: float = 952, accel_scale: int = 4, magnet_odr: int = 80, magnet_scale: int = 4)

   Construct an ``LSM9DS1`` instance, verify the WHO_AM_I registers of
   both sub-devices, configure all three sensors and enable the
   accel/gyro FIFO in continuous mode.

   ``bus``
      A configured :py:class:`machine.I2C` bus the sensor is attached to.

   ``address_imu``
      7-bit I2C address of the accelerometer/gyroscope sub-device.
      Defaults to ``0x6B``.

   ``address_magnet``
      7-bit I2C address of the magnetometer sub-device. Defaults to
      ``0x1E``.

   ``gyro_odr``
      Gyroscope output data rate in Hz. Must be one of ``0`` (off),
      ``14.9``, ``59.5``, ``119``, ``238``, ``476`` or ``952``.

   ``gyro_scale``
      Gyroscope full-scale range in degrees-per-second. Must be one of
      ``245``, ``500`` or ``2000``.

   ``accel_odr``
      Accelerometer output data rate in Hz. Same set of values as
      ``gyro_odr``.

   ``accel_scale``
      Accelerometer full-scale range in g. Must be one of ``2``, ``4``,
      ``8`` or ``16``.

   ``magnet_odr``
      Magnetometer output data rate in Hz. Must be one of ``0.625``,
      ``1.25``, ``2.5``, ``5``, ``10``, ``20``, ``40`` or ``80``.

   ``magnet_scale``
      Magnetometer full-scale range in gauss. Must be one of ``4``,
      ``8``, ``12`` or ``16``.

   .. method:: calibrate_magnet(offset: tuple[float, float, float]) -> None

      Write a hard-iron offset vector into the magnetometer's
      ``OFFSET_REG_*_M`` registers. The offset is given in the same units
      as :meth:`magnet` returns (gauss); each component is converted to
      raw LSBs using the configured magnetometer scale before being
      written.

   .. method:: gyro_id() -> bytes

      Return the single-byte ``WHO_AM_I`` register value of the
      accelerometer/gyroscope sub-device.

   .. method:: magent_id() -> bytes

      Return the single-byte ``WHO_AM_I`` register value of the
      magnetometer sub-device.

   .. method:: gyro() -> tuple[float, float, float]

      Return the gyroscope vector ``(x, y, z)`` in degrees per second.

   .. method:: accel() -> tuple[float, float, float]

      Return the acceleration vector ``(x, y, z)`` in units of standard
      gravity (1 g = 9.81 m/s²).

   .. method:: magnet() -> tuple[float, float, float]

      Return the magnetic-field vector ``(x, y, z)`` in gauss.

   .. method:: iter_accel_gyro() -> Iterator[tuple[tuple[float, float, float], tuple[float, float, float]]]

      Generator that yields ``(gyro, accel)`` tuples for every sample
      currently available in the FIFO and stops once the FIFO is empty.
      Each component vector has the same units as :meth:`gyro` and
      :meth:`accel` respectively.
