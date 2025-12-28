:mod:`imu` --- imu sensor
=========================

.. module:: imu
   :synopsis: imu sensor

The ``imu`` module is used for reading the IMU sensor under the camera sensor.

.. note::

   The IMU sensor (and this module) is not present on all OpenMV Cam models.

Functions
---------

.. function:: acceleration_mg() -> Tuple[float, float, float]

   Returns the acceleration for (x, y, z) in a float tuple in milli-g's.

   For when the camera board is lying on a table face up:

   X points to the right of the camera sensor
   Y points down below the camera sensor (towards the bottom on the board)
   Z points in the reverse direction of the camera sensor (into the table)

.. function:: angular_rate_mdps() -> Tuple[float, float, float]

   Returns the angular rate for (x, y, z) in a float tuple in milli-degrees-per-second.

   For when the camera board is lying on a table face up:

   X points to the right of the camera sensor
   Y points down below the camera sensor (towards the bottom on the board)
   Z points in the reverse direction of the camera sensor (into the table)

   .. note::

      Not available if the IMU only provides acceleration data.

.. function:: temperature_c() -> float

   Returns the temperature in celsius (float).

.. function:: roll() -> float

   Returns the rotation angle in degrees (float) of the camera module.

      * 0 -> Camera is standing up.
      * 90 -> Camera is roated left.
      * 180 -> Camera is upside down.
      * 270 -> Camera is rotated right.

.. function:: pitch() -> float

   Returns the rotation angle in degrees (float) of the camera module.

      * 0 -> Camera is standing up.
      * 90 -> Camera is pointing down.
      * 180 -> Camera is upside down.
      * 270 -> Camera is pointing up.

.. function:: sleep(enable:bool) -> None

   Pass ``True`` to put the IMU sensor to sleep. ``False`` to wake it back up (the default).

.. function:: __write_reg(addr:int, val:int) -> None

   Set a register ``addr`` to a ``val``.

.. function:: __read_reg(addr:int) -> int

   Get a register from ``addr``.
