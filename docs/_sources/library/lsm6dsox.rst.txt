:mod:`lsm6dsox` --- LSM6DSOX 6-axis IMU
=======================================

.. module:: lsm6dsox
   :synopsis: STMicroelectronics LSM6DSOX 6-axis IMU driver with MLC support

Driver for the ST LSM6DSOX iNEMO 6-axis inertial measurement unit
(3-axis accelerometer plus 3-axis gyroscope) over I2C or SPI. In addition
to the basic IMU output, the driver exposes the on-chip embedded
functions: a configurable pedometer (step counter) and the Machine
Learning Core (MLC), which can be programmed via UCF files exported from
ST's Unico-GUI tool.

Example::

    import time
    from machine import Pin, SPI, I2C
    from lsm6dsox import LSM6DSOX

    # Init in I2C mode.
    lsm = LSM6DSOX(I2C(0, scl=Pin(13), sda=Pin(12)))

    # Or init in SPI mode.
    # lsm = LSM6DSOX(SPI(5), cs=Pin(10))

    while True:
        print("Accelerometer: x:{:>8.3f} y:{:>8.3f} z:{:>8.3f}".format(*lsm.accel()))
        print("Gyroscope:     x:{:>8.3f} y:{:>8.3f} z:{:>8.3f}".format(*lsm.gyro()))
        time.sleep_ms(100)

Classes
-------

.. class:: LSM6DSOX(bus: machine.I2C | machine.SPI, cs: machine.Pin | None = None, address: int = 0x6A, gyro_odr: float = 104, accel_odr: float = 104, gyro_scale: int = 2000, accel_scale: int = 4, ucf: str | None = None)

   Construct an ``LSM6DSOX`` instance. The bus type is auto-detected: if
   ``bus`` exposes ``readfrom_mem`` it is treated as a :py:class:`machine.I2C`,
   otherwise it is treated as a :py:class:`machine.SPI` and ``cs`` must be
   supplied. The chip is soft-reset, the requested ODR and scale are
   programmed, and an MLC UCF file is loaded if provided.

   ``bus``
      Either a configured :py:class:`machine.I2C` or :py:class:`machine.SPI`
      bus.

   ``cs``
      Chip-select :py:class:`machine.Pin` used in SPI mode. Required when
      ``bus`` is an SPI instance, ignored otherwise.

   ``address``
      7-bit I2C address of the device. Defaults to ``0x6A``; some boards
      strap the SDO pin high which selects ``0x6B``.

   ``gyro_odr``
      Gyroscope output data rate in Hz. Must be one of ``0`` (off),
      ``1.6``, ``3.33``, ``6.66``, ``12.5``, ``26``, ``52``, ``104``,
      ``208``, ``416`` or ``888``.

   ``accel_odr``
      Accelerometer output data rate in Hz. Same set of values as
      ``gyro_odr``.

   ``gyro_scale``
      Gyroscope full-scale range in degrees-per-second. Must be one of
      ``250``, ``500``, ``1000`` or ``2000``.

   ``accel_scale``
      Accelerometer full-scale range in g. Must be one of ``2``, ``4``,
      ``8`` or ``16``.

   ``ucf``
      Optional path to an ST Unico-GUI ``.ucf`` register-dump file. If
      supplied the file is parsed and applied to the MLC during
      construction by way of :meth:`load_mlc`.

   .. method:: reset() -> None

      Issue a software reset via ``CTRL3_C`` and block until the reset
      bit clears. Raises ``OSError`` if the device fails to come back
      within ten retries.

   .. method:: set_mem_bank(bank: int) -> None

      Switch the FUNC_CFG register bank. Used internally to access the
      embedded function and sensor-hub register pages; rarely needed by
      application code.

   .. method:: set_embedded_functions(enable: bool, emb_ab: tuple[int, int] | None = None) -> tuple[int, int]

      Enable or disable the embedded-function block. When ``enable`` is
      ``True`` the two-byte ``emb_ab`` tuple is written to
      ``EMB_FUNC_EN_A``/``EMB_FUNC_EN_B``. When ``False`` the current
      values are read, the MLC/pedometer enable bits are cleared, and the
      previous values are returned so they can be restored later.

   .. method:: load_mlc(ucf: str) -> None

      Apply an MLC UCF program from the file at path ``ucf``. The driver
      walks the file line-by-line, applies each ``Ac <reg> <val>`` write,
      then enables BDU, routes MLC events to interrupt pin 1 and turns
      the embedded functions back on.

   .. method:: mlc_output() -> bytes | None

      If new MLC results are available (``MLC_STATUS`` bit set), return
      the contents of the eight ``MLC0_SRC..MLC7_SRC`` registers as a
      bytes-like object. Otherwise return ``None``.

   .. method:: pedometer_config(enable: bool = True, debounce: int = 10, int1_enable: bool = False, int2_enable: bool = False) -> None

      Configure the embedded pedometer.

      ``enable``
         Enables or disables step detection on the embedded function block.

      ``debounce``
         Step debounce value written into ``PEDO_DEB_STEPS_CONF``.

      ``int1_enable``
         If ``True``, route pedometer events to the ``INT1`` pin.

      ``int2_enable``
         If ``True``, route pedometer events to the ``INT2`` pin.

   .. method:: pedometer_reset() -> None

      Reset the step counter back to zero.

   .. method:: steps() -> int

      Return the current value of the 16-bit step counter.

   .. method:: gyro() -> tuple[float, float, float]

      Return the gyroscope vector ``(x, y, z)`` in degrees per second.

   .. method:: accel() -> tuple[float, float, float]

      Return the acceleration vector ``(x, y, z)`` in units of standard
      gravity (1 g = 9.81 m/s²).
