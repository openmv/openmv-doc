:mod:`apds9960` --- Proximity, Gesture, and Color Sensor Driver
===============================================================

.. module:: apds9960
   :synopsis: APDS9960 proximity, gesture, and RGB/ambient-light sensor driver

This module provides a driver for the Broadcom/Avago APDS9960 digital
proximity, ambient-light, RGB color, and gesture sensor over I2C. The driver
exposes per-feature enable/disable controls, raw channel reads (clear, R, G, B,
proximity), and a software gesture-decoding state machine that classifies
swipe up/down/left/right and near/far gestures from the on-chip 4-photodiode
FIFO.

Example usage::

    import time
    from machine import I2C
    from apds9960 import uAPDS9960 as APDS9960

    bus = I2C(1)
    sensor = APDS9960(bus)

    sensor.enableLightSensor()
    sensor.enableProximitySensor()

    while True:
        r = sensor.readRedLight()
        g = sensor.readGreenLight()
        b = sensor.readBlueLight()
        c = sensor.readAmbientLight()
        p = sensor.readProximity()
        print(r, g, b, c, p)
        time.sleep_ms(100)

Classes
-------

.. class:: APDS9960(bus: machine.I2C, address: int = 0x39, valid_id: list = [0xAB, 0x9C, 0xA8, -0x55])

   Construct an APDS9960 driver instance.

   - ``bus`` is a configured I2C bus object used to communicate with the
     sensor. The base class issues SMBus-style ``read_byte_data``,
     ``write_byte_data``, and ``read_i2c_block_data`` calls; for MicroPython's
     ``machine.I2C`` use :class:`uAPDS9960` instead.
   - ``address`` is the 7-bit I2C address of the device. Defaults to
     :data:`APDS9960_I2C_ADDR` (``0x39``).
   - ``valid_id`` is a list of acceptable values returned by the chip's ID
     register. Defaults to :data:`APDS9960_DEV_ID`.

   The constructor reads the device ID and raises :exc:`ADPS9960InvalidDevId`
   if it is not in ``valid_id``. It then disables every feature, programs the
   default ATIME/WTIME/PPULSE values, and applies the default LED drive,
   proximity gain, ALS gain, proximity thresholds, ambient-light thresholds,
   persistence, and gesture-engine configuration (entry/exit thresholds,
   GCONF1, gesture gain, gesture LED drive, gesture wait time, gesture
   offsets, GPULSE, GCONF3, and gesture interrupt enable).

   Mode and power control
   ~~~~~~~~~~~~~~~~~~~~~~

   .. method:: getMode() -> int

      Return the raw value of the ENABLE register, encoding which features
      are currently enabled (power, ALS, proximity, wait, ALS interrupt,
      proximity interrupt, gesture).

   .. method:: setMode(mode: int, enable: bool = True) -> None

      Enable or disable an individual feature in the ENABLE register.
      ``mode`` must be one of the ``APDS9960_MODE_*`` values
      (:data:`APDS9960_MODE_POWER` ..\\ :data:`APDS9960_MODE_ALL`).
      When ``mode`` is :data:`APDS9960_MODE_ALL`, all bits are turned on or
      off at once. Raises :exc:`ADPS9960InvalidMode` for out-of-range values.

   .. method:: enablePower() -> None

      Power the APDS9960 on (sets the PON bit in ENABLE).

   .. method:: disablePower() -> None

      Power the APDS9960 off (clears the PON bit in ENABLE).

   Ambient light / RGB sensor
   ~~~~~~~~~~~~~~~~~~~~~~~~~~

   .. method:: enableLightSensor(interrupts: bool = True) -> None

      Restore the default ALS gain, configure the ALS interrupt enable bit,
      power the device on, and enable the ambient-light/color engine.

   .. method:: disableLightSensor() -> None

      Disable the ALS interrupt and stop the ambient-light/color engine.

   .. method:: readAmbientLight() -> int

      Read the clear-channel ambient-light level as a 16-bit unsigned value.

   .. method:: readRedLight() -> int

      Read the red-channel level as a 16-bit unsigned value.

   .. method:: readGreenLight() -> int

      Read the green-channel level as a 16-bit unsigned value.

   .. method:: readBlueLight() -> int

      Read the blue-channel level as a 16-bit unsigned value.

   Proximity sensor
   ~~~~~~~~~~~~~~~~

   .. method:: enableProximitySensor(interrupts: bool = True) -> None

      Restore the default proximity gain and LED drive, configure the
      proximity interrupt enable bit, power the device on, and enable the
      proximity engine.

   .. method:: disableProximitySensor() -> None

      Disable the proximity interrupt and stop the proximity engine.

   .. method:: readProximity() -> int

      Read the proximity level as an 8-bit unsigned value.

   Gesture engine
   ~~~~~~~~~~~~~~

   .. method:: enableGestureSensor(interrupts: bool = True) -> None

      Reset the gesture state, set WTIME and the gesture pulse count, boost
      the LED to 300%, configure the gesture interrupt enable bit, enter the
      gesture state machine, power the device on, and enable wait, proximity,
      and gesture modes.

   .. method:: disableGestureSensor() -> None

      Reset the gesture state, disable the gesture interrupt and state
      machine, and stop the gesture engine.

   .. method:: isGestureAvailable() -> bool

      Return ``True`` if the GVALID bit of the gesture status register is set,
      indicating that gesture FIFO data is ready to be read.

   .. method:: readGesture() -> int

      Drain the gesture FIFO, run the on-board gesture decoder, and return
      one of the ``APDS9960_DIR_*`` direction constants. Returns
      :data:`APDS9960_DIR_NONE` if the engine is not running, no valid data
      is available, or the data did not resolve to a recognized gesture.

   .. method:: resetGestureParameters() -> None

      Clear the internal gesture FIFO buffer, deltas, counts, near/far
      counters, state, and last-decoded motion.

   .. method:: processGestureData() -> bool

      Process the raw U/D/L/R FIFO samples currently buffered to update the
      U/D and L/R deltas and the near/far counters. Returns ``True`` if a
      near or far event was detected, ``False`` otherwise.

   .. method:: decodeGesture() -> bool

      Convert the current U/D and L/R counts and accumulated deltas into a
      direction stored in the internal ``gesture_motion_`` field. Returns
      ``True`` when a direction is recognized, ``False`` otherwise.

   Proximity thresholds
   ~~~~~~~~~~~~~~~~~~~~

   .. method:: getProxIntLowThresh() -> int

      Return the low proximity-interrupt threshold (PILT register).

   .. method:: setProxIntLowThresh(threshold: int) -> None

      Set the low proximity-interrupt threshold.

   .. method:: getProxIntHighThresh() -> int

      Return the high proximity-interrupt threshold (PIHT register).

   .. method:: setProxIntHighThresh(threshold: int) -> None

      Set the high proximity-interrupt threshold.

   .. method:: getProximityIntLowThreshold() -> int

      Alias for :meth:`getProxIntLowThresh`.

   .. method:: setProximityIntLowThreshold(threshold: int) -> None

      Alias for :meth:`setProxIntLowThresh`.

   .. method:: getProximityIntHighThreshold() -> int

      Alias for :meth:`getProxIntHighThresh`.

   .. method:: setProximityIntHighThreshold(threshold: int) -> None

      Alias for :meth:`setProxIntHighThresh`.

   LED drive, gain, and boost
   ~~~~~~~~~~~~~~~~~~~~~~~~~~

   .. method:: getLEDDrive() -> int

      Return the LED drive strength used for proximity and ALS. Encoded as
      one of the ``APDS9960_LED_DRIVE_*`` values (0 = 100 mA, 1 = 50 mA,
      2 = 25 mA, 3 = 12.5 mA).

   .. method:: setLEDDrive(drive: int) -> None

      Set the LED drive strength used for proximity and ALS. ``drive`` is
      one of the ``APDS9960_LED_DRIVE_*`` values.

   .. method:: getProximityGain() -> int

      Return the proximity-receiver gain. Encoded as one of the
      ``APDS9960_PGAIN_*`` values (0 = 1x, 1 = 2x, 2 = 4x, 3 = 8x).

   .. method:: setProximityGain(drive: int) -> None

      Set the proximity-receiver gain. ``drive`` is one of the
      ``APDS9960_PGAIN_*`` values.

   .. method:: getAmbientLightGain() -> int

      Return the ambient-light-sensor gain. Encoded as one of the
      ``APDS9960_AGAIN_*`` values (0 = 1x, 1 = 4x, 2 = 16x, 3 = 64x).

   .. method:: setAmbientLightGain(drive: int) -> None

      Set the ambient-light-sensor gain. ``drive`` is one of the
      ``APDS9960_AGAIN_*`` values.

   .. method:: getLEDBoost() -> int

      Return the LED current boost. Encoded as one of the
      ``APDS9960_LED_BOOST_*`` values (0 = 100%, 1 = 150%, 2 = 200%,
      3 = 300%).

   .. method:: setLEDBoost(boost: int) -> None

      Set the LED current boost. ``boost`` is one of the
      ``APDS9960_LED_BOOST_*`` values.

   Proximity gain compensation and photodiode mask
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

   .. method:: getProxGainCompEnable() -> bool

      Return ``True`` if proximity gain compensation is enabled.

   .. method:: setProxGainCompEnable(enable: bool) -> None

      Enable or disable proximity gain compensation.

   .. method:: getProxPhotoMask() -> int

      Return the 4-bit mask of disabled proximity photodiodes. Bits map as
      ``3=UP``, ``2=DOWN``, ``1=LEFT``, ``0=RIGHT``; ``1`` disables a
      photodiode and ``0`` enables it.

   .. method:: setProxPhotoMask(mask: int) -> None

      Set the 4-bit mask of disabled proximity photodiodes (see encoding
      above).

   Gesture configuration
   ~~~~~~~~~~~~~~~~~~~~~

   .. method:: getGestureEnterThresh() -> int

      Return the proximity threshold required to enter gesture mode.

   .. method:: setGestureEnterThresh(threshold: int) -> None

      Set the proximity threshold required to enter gesture mode.

   .. method:: getGestureExitThresh() -> int

      Return the proximity threshold required to exit gesture mode.

   .. method:: setGestureExitThresh(threshold: int) -> None

      Set the proximity threshold required to exit gesture mode.

   .. method:: getGestureGain() -> int

      Return the photodiode gain used during gesture mode. Encoded as one of
      the ``APDS9960_GGAIN_*`` values (0 = 1x, 1 = 2x, 2 = 4x, 3 = 8x).

   .. method:: setGestureGain(gain: int) -> None

      Set the photodiode gain used during gesture mode.

   .. method:: getGestureLEDDrive() -> int

      Return the LED drive current used during gesture mode. Encoded as one
      of the ``APDS9960_LED_DRIVE_*`` values.

   .. method:: setGestureLEDDrive(drive: int) -> None

      Set the LED drive current used during gesture mode.

   .. method:: getGestureWaitTime() -> int

      Return the low-power wait time between gesture detections. Encoded as
      one of the ``APDS9960_GWTIME_*`` values (0 = 0 ms .. 7 = 39.2 ms).

   .. method:: setGestureWaitTime(time: int) -> None

      Set the low-power wait time between gesture detections.

   .. method:: getGestureMode() -> bool

      Return ``True`` if the gesture state machine is currently running.

   .. method:: setGestureMode(enable: bool) -> None

      Enter or leave the gesture state machine.

   Ambient-light interrupt thresholds
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

   .. method:: getLightIntLowThreshold() -> int

      Return the 16-bit low threshold used for the ambient-light interrupt.

   .. method:: setLightIntLowThreshold(threshold: int) -> None

      Set the 16-bit low threshold used for the ambient-light interrupt.

   .. method:: getLightIntHighThreshold() -> int

      Return the 16-bit high threshold used for the ambient-light interrupt.

   .. method:: setLightIntHighThreshold(threshold: int) -> None

      Set the 16-bit high threshold used for the ambient-light interrupt.

   Interrupt enables and clears
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

   .. method:: getAmbientLightIntEnable() -> bool

      Return ``True`` if ambient-light interrupts are enabled.

   .. method:: setAmbientLightIntEnable(enable: bool) -> None

      Enable or disable ambient-light interrupts.

   .. method:: getProximityIntEnable() -> bool

      Return ``True`` if proximity interrupts are enabled.

   .. method:: setProximityIntEnable(enable: bool) -> None

      Enable or disable proximity interrupts.

   .. method:: getGestureIntEnable() -> bool

      Return ``True`` if gesture interrupts are enabled.

   .. method:: setGestureIntEnable(enable: bool) -> None

      Enable or disable gesture interrupts.

   .. method:: clearAmbientLightInt() -> None

      Clear a pending ambient-light interrupt.

   .. method:: clearProximityInt() -> None

      Clear a pending proximity interrupt.

.. class:: uAPDS9960(bus: machine.I2C, address: int = 0x39, valid_id: list = [0xAB, 0x9C, 0xA8, -0x55])

   MicroPython subclass of :class:`APDS9960`. Identical public API, but the
   underlying register access uses ``machine.I2C``-style ``readfrom_mem`` and
   ``writeto_mem`` calls rather than SMBus-style methods. This is the class
   to use on OpenMV / MicroPython targets.

Exceptions
----------

.. exception:: ADPS9960InvalidDevId(id: int, valid_ids: list)

   Subclass of :exc:`ValueError`. Raised by the :class:`APDS9960` constructor
   when the value read from the chip's ID register is not present in the
   ``valid_id`` list.

.. exception:: ADPS9960InvalidMode(mode: int)

   Subclass of :exc:`ValueError`. Raised by :meth:`APDS9960.setMode` when the
   ``mode`` argument is outside the range
   :data:`APDS9960_MODE_POWER`..\\ :data:`APDS9960_MODE_ALL`.

Constants
---------

I2C address and device IDs
~~~~~~~~~~~~~~~~~~~~~~~~~~

.. data:: APDS9960_I2C_ADDR
   :type: int

   Default 7-bit I2C address of the APDS9960 (``0x39``).

.. data:: APDS9960_DEV_ID
   :type: list

   Default list of valid device-ID register values
   (``[0xAB, 0x9C, 0xA8, -0x55]``).

Gesture tuning
~~~~~~~~~~~~~~

.. data:: APDS9960_GESTURE_THRESHOLD_OUT
   :type: int

   Minimum sample magnitude (per photodiode) used by the gesture decoder when
   searching for the first/last in-range FIFO samples.

.. data:: APDS9960_GESTURE_SENSITIVITY_1
   :type: int

   Threshold on the accumulated U/D and L/R deltas above which the decoder
   commits to a swipe direction.

.. data:: APDS9960_GESTURE_SENSITIVITY_2
   :type: int

   Threshold on the per-step U/D and L/R deltas under which the decoder
   considers a sample to be a near/far candidate rather than a swipe.

.. data:: APDS9960_TIME_FIFO_PAUSE
   :type: int

   Milliseconds the gesture loop sleeps between FIFO drains.

Feature modes
~~~~~~~~~~~~~

These values are passed to :meth:`APDS9960.setMode`.

.. data:: APDS9960_MODE_POWER
   :type: int

   Power-on bit (``0``).

.. data:: APDS9960_MODE_AMBIENT_LIGHT
   :type: int

   Ambient-light/color engine enable bit (``1``).

.. data:: APDS9960_MODE_PROXIMITY
   :type: int

   Proximity engine enable bit (``2``).

.. data:: APDS9960_MODE_WAIT
   :type: int

   Wait-state enable bit (``3``).

.. data:: APDS9960_MODE_AMBIENT_LIGHT_INT
   :type: int

   Ambient-light interrupt enable bit (``4``).

.. data:: APDS9960_MODE_PROXIMITY_INT
   :type: int

   Proximity interrupt enable bit (``5``).

.. data:: APDS9960_MODE_GESTURE
   :type: int

   Gesture engine enable bit (``6``).

.. data:: APDS9960_MODE_ALL
   :type: int

   Sentinel value (``7``) telling :meth:`APDS9960.setMode` to enable or
   disable every bit in the ENABLE register at once.

LED drive currents
~~~~~~~~~~~~~~~~~~

.. data:: APDS9960_LED_DRIVE_100MA
   :type: int

   100 mA LED drive (``0``).

.. data:: APDS9960_LED_DRIVE_50MA
   :type: int

   50 mA LED drive (``1``).

.. data:: APDS9960_LED_DRIVE_25MA
   :type: int

   25 mA LED drive (``2``).

.. data:: APDS9960_LED_DRIVE_12_5MA
   :type: int

   12.5 mA LED drive (``3``).

Proximity gain (PGAIN)
~~~~~~~~~~~~~~~~~~~~~~

.. data:: APDS9960_PGAIN_1X
   :type: int

   1x proximity gain (``0``).

.. data:: APDS9960_PGAIN_2X
   :type: int

   2x proximity gain (``1``).

.. data:: APDS9960_PGAIN_4X
   :type: int

   4x proximity gain (``2``). Default applied by the constructor.

.. data:: APDS9960_PGAIN_8X
   :type: int

   8x proximity gain (``3``).

Ambient-light gain (AGAIN)
~~~~~~~~~~~~~~~~~~~~~~~~~~

.. data:: APDS9960_AGAIN_1X
   :type: int

   1x ALS gain (``0``).

.. data:: APDS9960_AGAIN_4X
   :type: int

   4x ALS gain (``1``). Default applied by the constructor.

.. data:: APDS9960_AGAIN_16X
   :type: int

   16x ALS gain (``2``).

.. data:: APDS9960_AGAIN_64X
   :type: int

   64x ALS gain (``3``).

Gesture gain (GGAIN)
~~~~~~~~~~~~~~~~~~~~

.. data:: APDS9960_GGAIN_1X
   :type: int

   1x gesture gain (``0``).

.. data:: APDS9960_GGAIN_2X
   :type: int

   2x gesture gain (``1``).

.. data:: APDS9960_GGAIN_4X
   :type: int

   4x gesture gain (``2``). Default applied by the constructor.

.. data:: APDS9960_GGAIN_8X
   :type: int

   8x gesture gain (``3``).

LED boost
~~~~~~~~~

.. data:: APDS9960_LED_BOOST_100
   :type: int

   100% LED boost (``0``).

.. data:: APDS9960_LED_BOOST_150
   :type: int

   150% LED boost (``1``).

.. data:: APDS9960_LED_BOOST_200
   :type: int

   200% LED boost (``2``).

.. data:: APDS9960_LED_BOOST_300
   :type: int

   300% LED boost (``3``). Applied automatically by
   :meth:`APDS9960.enableGestureSensor`.

Gesture wait times
~~~~~~~~~~~~~~~~~~

.. data:: APDS9960_GWTIME_0MS
   :type: int

   0 ms (``0``).

.. data:: APDS9960_GWTIME_2_8MS
   :type: int

   2.8 ms (``1``). Default applied by the constructor.

.. data:: APDS9960_GWTIME_5_6MS
   :type: int

   5.6 ms (``2``).

.. data:: APDS9960_GWTIME_8_4MS
   :type: int

   8.4 ms (``3``).

.. data:: APDS9960_GWTIME_14_0MS
   :type: int

   14.0 ms (``4``).

.. data:: APDS9960_GWTIME_22_4MS
   :type: int

   22.4 ms (``5``).

.. data:: APDS9960_GWTIME_30_8MS
   :type: int

   30.8 ms (``6``).

.. data:: APDS9960_GWTIME_39_2MS
   :type: int

   39.2 ms (``7``).

Gesture directions
~~~~~~~~~~~~~~~~~~

These values are returned by :meth:`APDS9960.readGesture`.

.. data:: APDS9960_DIR_NONE
   :type: int

   No gesture detected (``0``).

.. data:: APDS9960_DIR_LEFT
   :type: int

   Left swipe (``1``).

.. data:: APDS9960_DIR_RIGHT
   :type: int

   Right swipe (``2``).

.. data:: APDS9960_DIR_UP
   :type: int

   Up swipe (``3``).

.. data:: APDS9960_DIR_DOWN
   :type: int

   Down swipe (``4``).

.. data:: APDS9960_DIR_NEAR
   :type: int

   Near event (``5``).

.. data:: APDS9960_DIR_FAR
   :type: int

   Far event (``6``).

.. data:: APDS9960_DIR_ALL
   :type: int

   Sentinel value (``7``) used internally to represent "any direction".

Gesture states
~~~~~~~~~~~~~~

Internal state values reported via the gesture state machine.

.. data:: APDS9960_STATE_NA
   :type: int

   No state (``0``).

.. data:: APDS9960_STATE_NEAR
   :type: int

   Near state detected (``1``).

.. data:: APDS9960_STATE_FAR
   :type: int

   Far state detected (``2``).

.. data:: APDS9960_STATE_ALL
   :type: int

   Sentinel value (``3``) used internally to represent "any state".
