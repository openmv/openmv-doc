:mod:`imu` --- imu sensor
=========================

.. module:: imu
   :synopsis: imu sensor

The ``imu`` module is used for reading the IMU sensor under the camera sensor.

.. note::

   The IMU sensor (and this module) is not present on all OpenMV Cam models.

For when the camera board is lying on a table face up:

   * X points to the right of the camera sensor.
   * Y points down below the camera sensor (towards the bottom of the board).
   * Z points in the reverse direction of the camera sensor (into the table).

Functions
---------

.. function:: acceleration_mg() -> Tuple[float, float, float]

   Returns the acceleration for ``(x, y, z)`` as a float tuple in milli-g's.

.. function:: angular_rate_mdps() -> Tuple[float, float, float]

   Returns the angular rate for ``(x, y, z)`` as a float tuple in
   milli-degrees-per-second.

.. function:: temperature_c() -> float

   Returns the IMU sensor temperature in degrees Celsius.

.. function:: roll() -> float

   Returns the roll angle of the camera module in degrees.

      * 0 -> Camera is standing up.
      * 90 -> Camera is rotated left.
      * 180 -> Camera is upside down.
      * 270 -> Camera is rotated right.

.. function:: pitch() -> float

   Returns the pitch angle of the camera module in degrees.

      * 0 -> Camera is standing up.
      * 90 -> Camera is pointing down.
      * 180 -> Camera is upside down.
      * 270 -> Camera is pointing up.

.. function:: sleep(enable: bool) -> None

   ``enable`` set to ``True`` puts the IMU sensor to sleep. ``False`` wakes it
   back up (the default).

.. function:: __write_reg(addr: int, val: int) -> None

   Sets the IMU register at ``addr`` to ``val``.

.. function:: __read_reg(addr: int) -> int

   Returns the value of the IMU register at ``addr``.
