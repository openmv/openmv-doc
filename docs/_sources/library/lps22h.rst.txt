:mod:`lps22h` --- LPS22HB/HH pressure sensor
============================================

.. module:: lps22h
   :synopsis: LPS22HB/HH MEMS pressure and temperature sensor driver

Driver for the ST LPS22HB / LPS22HH MEMS nano pressure sensor over I2C. The
device exposes both barometric pressure and a die temperature reading, and
can run either continuously or in single-shot ("one-shot") mode where each
measurement is triggered explicitly by the host.

Example::

    import time
    from machine import Pin, I2C
    from lps22h import LPS22H

    bus = I2C(1, scl=Pin(15), sda=Pin(14))
    lps = LPS22H(bus, oneshot=False)

    while True:
        print("Pressure: %.2f hPa  Temperature: %.2f C" %
              (lps.pressure(), lps.temperature()))
        time.sleep_ms(10)

Classes
-------

.. class:: LPS22H(bus: machine.I2C, address: int = 0x5C, oneshot: bool = False)

   Construct an ``LPS22H`` instance and configure the device with BDU enabled
   and the low-pass filter active.

   ``bus``
      A configured :py:class:`machine.I2C` bus the sensor is attached to.

   ``address``
      7-bit I2C address of the device. Defaults to ``0x5C``; some boards
      strap the SDO pin high which selects ``0x5D``.

   ``oneshot``
      If ``True``, the device starts in one-shot mode and each call to
      :meth:`pressure` or :meth:`temperature` triggers a fresh conversion
      and waits for it to finish. If ``False``, the ODR is set to 1 Hz and
      readings return the most recent continuous sample.

   .. method:: set_oneshot_mode(oneshot: bool) -> None

      Switch the device between continuous and one-shot acquisition modes
      at runtime. Updates the ODR field of ``CTRL_REG1`` accordingly.

   .. method:: pressure() -> float

      Return the absolute atmospheric pressure in hectopascals (hPa). In
      one-shot mode this triggers a new conversion and blocks until the
      pressure data-ready flag is set.

   .. method:: temperature() -> float

      Return the die temperature in degrees Celsius. In one-shot mode this
      triggers a new conversion and blocks until the temperature
      data-ready flag is set.

   .. method:: altitude() -> float

      Return an estimated altitude in metres derived from the current
      pressure and temperature readings using the international barometric
      formula referenced to a sea-level pressure of 1013.25 hPa.
